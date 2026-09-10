"""
Robust PDF ingestion pipeline:
- Extracts text page-by-page using PyMuPDF (fitz)
- Preserves 1-based page numbers and section headers
- Creates contextual chunks with full citation metadata
- Validates file integrity (corrupted, empty, unreadable)
- Stores chunks and embeddings in pgvector
"""
import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional
try:
    import pymupdf as fitz
except ImportError:
    import fitz

from app.logging_config import logger
from core.text_processing import clean_text, detect_headings
from db.vector_repository import store_documents_bulk


def _extract_and_chunk_pdf(
    file_path: str,
    original_filename: Optional[str] = None,
    chunk_size: int = 700,
    chunk_overlap: int = 100,
) -> List[Dict[str, Any]]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    if path.stat().st_size == 0:
        raise ValueError(f"Empty document: {file_path} is 0 bytes")

    doc_name = original_filename or path.name

    try:
        doc = fitz.open(file_path)
    except Exception as exc:
        raise ValueError(f"Corrupted or unreadable PDF: {exc}") from exc

    if doc.is_encrypted:
        raise ValueError("Password-protected or encrypted PDFs are not supported.")

    if len(doc) == 0:
        raise ValueError("Document has no pages.")

    chunks: List[Dict[str, Any]] = []
    current_section = "General"
    total_text_len = 0
    chunk_idx = 0

    try:
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_num = page_idx + 1  # 1-based page numbering
            raw_text = page.get_text() or ""
            cleaned_page_text = clean_text(raw_text)

            if not cleaned_page_text:
                continue

            total_text_len += len(cleaned_page_text)
            headings = detect_headings(cleaned_page_text)
            if headings:
                current_section = headings[0]

            # Split page text into paragraphs/sections
            paragraphs = cleaned_page_text.split("\n\n")
            current_buffer = ""

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue

                # Check if paragraph itself is a section heading
                para_headings = detect_headings(para)
                if para_headings:
                    current_section = para_headings[0]

                if len(current_buffer) + len(para) + 2 <= chunk_size:
                    current_buffer = f"{current_buffer}\n\n{para}".strip() if current_buffer else para
                else:
                    if current_buffer:
                        snippet = current_buffer[:160].replace("\n", " ").strip()
                        if len(current_buffer) > 160:
                            snippet += "..."
                        chunks.append({
                            "content": current_buffer,
                            "metadata": {
                                "document": doc_name,
                                "page": page_num,
                                "section": current_section,
                                "snippet": snippet,
                                "chunk_index": chunk_idx,
                            },
                        })
                        chunk_idx += 1

                        # Overlap management
                        overlap_text = current_buffer[-chunk_overlap:] if len(current_buffer) > chunk_overlap else ""
                        current_buffer = f"{overlap_text}\n\n{para}".strip() if overlap_text else para
                    else:
                        current_buffer = para

            if current_buffer:
                snippet = current_buffer[:160].replace("\n", " ").strip()
                if len(current_buffer) > 160:
                    snippet += "..."
                chunks.append({
                    "content": current_buffer,
                    "metadata": {
                        "document": doc_name,
                        "page": page_num,
                        "section": current_section,
                        "snippet": snippet,
                        "chunk_index": chunk_idx,
                    },
                })
                chunk_idx += 1

    finally:
        doc.close()

    if total_text_len == 0 or not chunks:
        raise ValueError("Document has no extractable text.")

    return chunks


async def ingest_pdf(
    file_path: str,
    original_filename: Optional[str] = None,
    chunk_size: int = 700,
    chunk_overlap: int = 100,
) -> int:
    """Ingest a single PDF with full citation metadata and return the chunk count."""
    payload = await asyncio.to_thread(
        _extract_and_chunk_pdf,
        file_path,
        original_filename=original_filename,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    ids = await store_documents_bulk(payload)
    doc_name = original_filename or Path(file_path).name
    logger.info(f"Successfully ingested {len(ids)} chunks from {doc_name}")
    return len(ids)


async def ingest_pdfs(file_paths: List[str]) -> int:
    """Ingest multiple PDFs concurrently."""
    counts = await asyncio.gather(*[ingest_pdf(fp) for fp in file_paths])
    return sum(counts)
