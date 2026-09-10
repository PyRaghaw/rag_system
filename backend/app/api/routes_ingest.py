"""
/ingest and /documents endpoints:
- Ingest documents (PDF, Word, PowerPoint, Tabular/CSV/Excel, Plain Text/Markdown)
- Preserves citation metadata and extracts visual assets/images
- Image serving and inventory endpoints
- Atomic document and asset deletion by filename
"""
import os
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.api.schemas import DeleteDocumentResponse, DocumentInfo, IngestResponse
from app.logging_config import logger
from db.image_repository import (
    delete_images_by_document,
    get_image_by_id,
    get_images_by_document,
)
from db.vector_repository import delete_documents_by_filename, list_unique_documents
from ingestion.document_ingestor import ingest_document

router = APIRouter(tags=["ingest"])

ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".pptx", ".ppt",
    ".csv", ".xlsx", ".xls", ".txt", ".md", ".json", ".yaml", ".yml"
}


UPLOAD_DIR = Path(__file__).resolve().parent.parent / "data" / "uploaded_documents"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/ingest", response_model=List[IngestResponse])
@router.post("/documents/upload", response_model=List[IngestResponse])
async def ingest(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
):
    upload_list: List[UploadFile] = []
    if files:
        upload_list.extend(files)
    if file:
        upload_list.append(file)

    if not upload_list:
        raise HTTPException(
            status_code=400,
            detail="No files provided. Please upload at least one document file."
        )

    responses: List[IngestResponse] = []

    for upload in upload_list:
        filename = upload.filename or "document.bin"
        ext = Path(filename).suffix.lower()

        if ext not in ALLOWED_EXTENSIONS:
            allowed_str = ", ".join(sorted(ALLOWED_EXTENSIONS))
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Supported formats: {allowed_str}"
            )

        content = await upload.read()
        if not content:
            raise HTTPException(
                status_code=400,
                detail=f"Empty file: {filename} contains 0 bytes."
            )

        # Store permanently on disk so section snapshots & visual citations can be served
        dest_path = UPLOAD_DIR / filename
        with open(dest_path, "wb") as f_out:
            f_out.write(content)

        try:
            result = await ingest_document(str(dest_path), original_filename=filename)
            responses.append(
                IngestResponse(
                    filename=filename,
                    chunks_ingested=result["chunks_ingested"],
                )
            )
        except ValueError as ve:
            logger.warning(f"Ingestion validation failed for {filename}: {ve}")
            raise HTTPException(status_code=400, detail=str(ve)) from ve
        except Exception as exc:
            logger.exception(f"Ingestion failed for {filename}")
            raise HTTPException(status_code=500, detail="Document processing failed") from exc

    return responses


@router.get("/documents", response_model=List[DocumentInfo])
async def get_documents() -> List[DocumentInfo]:
    """Lists all documents currently indexed in the knowledge base."""
    docs = await list_unique_documents()
    return [DocumentInfo(filename=d["filename"], chunk_count=d["chunk_count"]) for d in docs]


@router.get("/documents/{filename}/images")
async def get_document_images_endpoint(filename: str) -> List[Dict[str, Any]]:
    """Lists all extracted images and diagrams for a given document."""
    return await get_images_by_document(filename)


@router.get("/documents/images/{image_id}")
async def serve_document_image(image_id: str):
    """Serves an extracted document image binary with appropriate cache headers."""
    record = await get_image_by_id(image_id)
    if not record or not record.get("file_path"):
        raise HTTPException(status_code=404, detail=f"Image not found: {image_id}")

    file_path = record["file_path"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Image file missing on disk: {image_id}")

    mime_type = record.get("mime_type") or "image/png"
    return FileResponse(
        file_path,
        media_type=mime_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )


@router.delete("/documents/{filename}", response_model=DeleteDocumentResponse)
async def delete_document(filename: str) -> DeleteDocumentResponse:
    """Deletes all chunks, embeddings, and extracted images for a document."""
    deleted_chunks = await delete_documents_by_filename(filename)
    deleted_images = await delete_images_by_document(filename)

    # Delete original document from disk if stored
    original_file = UPLOAD_DIR / filename
    original_file.unlink(missing_ok=True)

    if deleted_chunks == 0 and deleted_images == 0:
        raise HTTPException(
            status_code=404,
            detail=f"Document not found or already deleted: {filename}"
        )
    return DeleteDocumentResponse(filename=filename, chunks_deleted=deleted_chunks)
