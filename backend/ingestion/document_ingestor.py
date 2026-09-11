"""
Comprehensive Multi-Format Document Ingestor & Multimodal Asset Extractor.

Supports:
1. PDF (.pdf): text chunking + embedded raster image extraction (fitz)
2. Word (.docx, .doc): headings, paragraphs, tables + embedded media (python-docx)
3. PowerPoint (.pptx, .ppt): slide titles, text frames, notes + slide images (python-pptx)
4. Tabular (.csv, .xlsx, .xls): structural dataframes & markdown table chunking (pandas)
5. Plain Text / Markdown / JSON (.txt, .md, .json): structured text chunking
"""
import asyncio
import csv
import hashlib
import json
import mimetypes
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
try:
    import pymupdf as fitz
except ImportError:
    import fitz

try:
    import docx
except ImportError:
    docx = None

try:
    from pptx import Presentation
    from pptx.enum.shapes import MSO_SHAPE_TYPE
except ImportError:
    Presentation = None
    MSO_SHAPE_TYPE = None

from app.logging_config import logger
from core.text_processing import clean_text, detect_headings
from core.visual_extractor import (
    IMAGE_DIR,
    is_meaningful_image,
    render_heading_section_crop,
    render_page_snapshot,
)
from db.image_repository import delete_images_by_document, store_document_images
from db.vector_repository import delete_documents_by_filename, store_documents_bulk


def _chunk_text_blocks(
    text: str,
    doc_name: str,
    page_num: int = 1,
    default_section: str = "General",
    chunk_size: int = 700,
    chunk_overlap: int = 100,
    start_chunk_idx: int = 0,
) -> Tuple[List[Dict[str, Any]], int]:
    """Splits text into sized chunks preserving metadata."""
    cleaned = clean_text(text)
    if not cleaned:
        return [], start_chunk_idx

    headings = detect_headings(cleaned)
    current_section = headings[0] if headings else default_section

    paragraphs = cleaned.split("\n\n")
    chunks = []
    current_buffer = ""
    chunk_idx = start_chunk_idx

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        p_heads = detect_headings(para)
        if p_heads:
            current_section = p_heads[0]

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

    return chunks, chunk_idx


def _extract_pdf(file_path: str, doc_name: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Extracts text chunks and embedded images from a PDF file."""
    doc = fitz.open(file_path)
    chunks: List[Dict[str, Any]] = []
    images: List[Dict[str, Any]] = []
    chunk_idx = 0

    try:
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_num = page_idx + 1
            raw_text = page.get_text() or ""

            page_chunks, chunk_idx = _chunk_text_blocks(
                raw_text,
                doc_name=doc_name,
                page_num=page_num,
                default_section=f"Page {page_num}",
                start_chunk_idx=chunk_idx,
            )
            chunks.extend(page_chunks)

            # 1. Detect page headings
            page_headings = detect_headings(raw_text)
            primary_heading = page_headings[0] if page_headings else f"Page {page_num}"

            # 2. Render high-resolution visual slide/page screenshot (preserves all vector diagrams & text)
            page_snap = render_page_snapshot(
                doc,
                page_num=page_num,
                doc_name=doc_name,
                section_name=primary_heading,
                dpi=150,
            )
            if page_snap:
                images.append(page_snap)

            # 3. Render section-level screenshots for specific architecture, diagram, or workflow headings
            for h in page_headings:
                if any(w in h.lower() for w in [
                    "diagram", "architecture", "flowchart", "workflow",
                    "pipeline", "framework", "overview", "approach", "solution", "methodology"
                ]):
                    sec_snap = render_heading_section_crop(
                        doc,
                        page_num=page_num,
                        heading_text=h,
                        doc_name=doc_name,
                        dpi=150,
                    )
                    if sec_snap and sec_snap["image_id"] != (page_snap["image_id"] if page_snap else ""):
                        images.append(sec_snap)

            # 4. Extract embedded images (with strict solid-box / blank mask filtering)
            image_list = page.get_images(full=True)
            for img_idx, img_info in enumerate(image_list):
                xref = img_info[0]
                try:
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    ext = base_image.get("ext", "png").lower()

                    # Strict filter: Discard solid color masks (like Canva/PPT dark background cards) & tiny graphics
                    if not is_meaningful_image(image_bytes, min_size=80):
                        continue

                    img_hash = hashlib.md5(image_bytes).hexdigest()[:12]
                    image_id = f"{img_hash}_p{page_num}_{img_idx}"
                    out_filename = f"{image_id}.{ext}"
                    out_path = IMAGE_DIR / out_filename

                    with open(out_path, "wb") as f_out:
                        f_out.write(image_bytes)

                    # Derive caption from page text if available
                    caption_snippet = clean_text(raw_text)[:140].replace("\n", " ").strip()
                    images.append({
                        "image_id": image_id,
                        "document": doc_name,
                        "page": page_num,
                        "section": page_chunks[0]["metadata"]["section"] if page_chunks else primary_heading,
                        "file_path": str(out_path),
                        "url_path": f"/api/documents/images/{image_id}",
                        "caption": caption_snippet or f"Figure from page {page_num}",
                        "mime_type": f"image/{ext}" if ext in ["png", "jpeg", "webp"] else "image/png",
                    })
                except Exception as img_err:
                    logger.debug(f"Could not extract image xref {xref} from {doc_name}: {img_err}")

    finally:
        doc.close()

    return chunks, images


def _extract_docx(file_path: str, doc_name: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Extracts text paragraphs, tables, and embedded media from a Word document."""
    if not docx:
        raise ImportError("python-docx is not installed.")

    doc = docx.Document(file_path)
    chunks: List[Dict[str, Any]] = []
    images: List[Dict[str, Any]] = []
    chunk_idx = 0
    full_text_blocks = []

    for p in doc.paragraphs:
        if p.text.strip():
            full_text_blocks.append(p.text.strip())

    # Extract tables
    for t_idx, table in enumerate(doc.tables):
        table_rows = []
        for row in table.rows:
            row_data = [cell.text.strip() for cell in row.cells]
            table_rows.append(" | ".join(row_data))
        if table_rows:
            full_text_blocks.append(f"Table {t_idx + 1}:\n" + "\n".join(table_rows))

    full_text = "\n\n".join(full_text_blocks)
    chunks, chunk_idx = _chunk_text_blocks(
        full_text,
        doc_name=doc_name,
        page_num=1,
        default_section="Document Body",
        start_chunk_idx=chunk_idx,
    )

    # Extract images from relationships
    img_idx = 0
    for rel in doc.part.rels.values():
        if "image" in rel.target_ref:
            try:
                img_part = rel.target_part
                image_bytes = img_part.blob
                if len(image_bytes) < 1500:
                    continue

                ext = Path(rel.target_ref).suffix.lstrip(".").lower() or "png"
                img_hash = hashlib.md5(image_bytes).hexdigest()[:12]
                image_id = f"{img_hash}_docx_{img_idx}"
                out_path = IMAGE_DIR / f"{image_id}.{ext}"

                with open(out_path, "wb") as f_out:
                    f_out.write(image_bytes)

                images.append({
                    "image_id": image_id,
                    "document": doc_name,
                    "page": 1,
                    "section": "Embedded Visual",
                    "file_path": str(out_path),
                    "url_path": f"/api/documents/images/{image_id}",
                    "caption": f"Embedded visual from {doc_name}",
                    "mime_type": f"image/{ext}" if ext in ["png", "jpeg", "webp"] else "image/png",
                })
                img_idx += 1
            except Exception as docx_err:
                logger.debug(f"DOCX image extract notice: {docx_err}")

    return chunks, images


def _extract_pptx(file_path: str, doc_name: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Extracts slide text, shapes, notes, and pictures from a PowerPoint presentation."""
    if not Presentation:
        raise ImportError("python-pptx is not installed.")

    prs = Presentation(file_path)
    chunks: List[Dict[str, Any]] = []
    images: List[Dict[str, Any]] = []
    chunk_idx = 0

    for slide_idx, slide in enumerate(prs.slides):
        slide_num = slide_idx + 1
        slide_texts = []
        slide_title = f"Slide {slide_num}"

        # Extract text from shapes
        for shape in slide.shapes:
            if shape.has_text_frame:
                txt = shape.text_frame.text.strip()
                if txt:
                    slide_texts.append(txt)
                    if shape == slide.shapes[0] and len(txt) < 80:
                        slide_title = txt

            # Extract picture shapes
            if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                try:
                    img = shape.image
                    img_bytes = img.blob
                    if len(img_bytes) < 1500:
                        continue
                    ext = (img.ext or "png").lower()
                    img_hash = hashlib.md5(img_bytes).hexdigest()[:12]
                    image_id = f"{img_hash}_slide{slide_num}"
                    out_path = IMAGE_DIR / f"{image_id}.{ext}"

                    with open(out_path, "wb") as f_out:
                        f_out.write(img_bytes)

                    images.append({
                        "image_id": image_id,
                        "document": doc_name,
                        "page": slide_num,
                        "section": slide_title,
                        "file_path": str(out_path),
                        "url_path": f"/api/documents/images/{image_id}",
                        "caption": f"Slide {slide_num} visual: {slide_title}",
                        "mime_type": f"image/{ext}" if ext in ["png", "jpeg", "webp"] else "image/png",
                    })
                except Exception as ppt_err:
                    logger.debug(f"PPTX picture extract notice: {ppt_err}")

        # Extract notes if any
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            note_txt = slide.notes_slide.notes_text_frame.text.strip()
            if note_txt:
                slide_texts.append(f"Notes: {note_txt}")

        slide_full = "\n".join(slide_texts)
        if slide_full:
            slide_chunks, chunk_idx = _chunk_text_blocks(
                slide_full,
                doc_name=doc_name,
                page_num=slide_num,
                default_section=slide_title,
                start_chunk_idx=chunk_idx,
            )
            chunks.extend(slide_chunks)

    return chunks, images


def _extract_tabular(file_path: str, doc_name: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Extracts and chunks CSV or Excel files with full tabular context."""
    ext = Path(file_path).suffix.lower()
    if ext in [".xlsx", ".xls"]:
        dfs = pd.read_excel(file_path, sheet_name=None)
    else:
        # CSV with automatic encoding fallback
        try:
            dfs = {"Sheet1": pd.read_csv(file_path, encoding="utf-8")}
        except UnicodeDecodeError:
            dfs = {"Sheet1": pd.read_csv(file_path, encoding="latin1")}

    chunks: List[Dict[str, Any]] = []
    chunk_idx = 0
    batch_size = 40

    for sheet_name, df in dfs.items():
        if df.empty:
            continue

        columns = list(df.columns)
        total_rows = len(df)
        summary_header = f"File: {doc_name} | Sheet: {sheet_name} | Total Rows: {total_rows} | Columns: {', '.join(str(c) for c in columns)}"

        for start_r in range(0, total_rows, batch_size):
            end_r = min(start_r + batch_size, total_rows)
            sub_df = df.iloc[start_r:end_r]
            try:
                md_table = sub_df.to_markdown(index=False)
            except Exception:
                md_table = sub_df.to_string(index=False)

            content = f"{summary_header}\nRows {start_r + 1} to {end_r}:\n{md_table}"
            snippet = f"{sheet_name} (Rows {start_r + 1}-{end_r}): {', '.join(str(c) for c in columns[:5])}"

            chunks.append({
                "content": content,
                "metadata": {
                    "document": doc_name,
                    "page": (start_r // batch_size) + 1,
                    "section": f"Sheet: {sheet_name}",
                    "snippet": snippet[:160],
                    "chunk_index": chunk_idx,
                },
            })
            chunk_idx += 1

    return chunks, []


def _extract_plaintext(file_path: str, doc_name: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Extracts text from plain text, markdown, or JSON files."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            raw = f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="latin1") as f:
            raw = f.read()

    ext = Path(file_path).suffix.lower()
    if ext == ".json":
        try:
            parsed = json.loads(raw)
            formatted = json.dumps(parsed, indent=2)
            raw = f"Structured JSON data from {doc_name}:\n{formatted}"
        except Exception:
            pass

    chunks, _ = _chunk_text_blocks(
        raw,
        doc_name=doc_name,
        page_num=1,
        default_section="Text Content",
        start_chunk_idx=0,
    )
    return chunks, []


def extract_and_chunk_any(
    file_path: str,
    original_filename: Optional[str] = None,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Routes file to corresponding parser and returns (chunks, extracted_images).
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    if path.stat().st_size == 0:
        raise ValueError(f"Empty file: {file_path} contains 0 bytes.")

    doc_name = original_filename or path.name
    ext = Path(doc_name).suffix.lower()

    if ext == ".pdf":
        return _extract_pdf(file_path, doc_name)
    elif ext in [".docx", ".doc"]:
        return _extract_docx(file_path, doc_name)
    elif ext in [".pptx", ".ppt"]:
        return _extract_pptx(file_path, doc_name)
    elif ext in [".csv", ".xlsx", ".xls"]:
        return _extract_tabular(file_path, doc_name)
    elif ext in [".txt", ".md", ".json", ".yaml", ".yml", ".log"]:
        return _extract_plaintext(file_path, doc_name)
    else:
        # Fallback: try reading as plain text
        try:
            return _extract_plaintext(file_path, doc_name)
        except Exception as exc:
            raise ValueError(f"Unsupported file format '{ext}' for file {doc_name}: {exc}") from exc


async def ingest_document(
    file_path: str,
    original_filename: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Ingests any supported document into vector DB and extracts images asynchronously.
    """
    doc_name = original_filename or Path(file_path).name

    # Clean up any existing records for this document first so re-upload is idempotent and clean
    await delete_documents_by_filename(doc_name)
    await delete_images_by_document(doc_name)

    chunks, images = await asyncio.to_thread(
        extract_and_chunk_any,
        file_path,
        original_filename=doc_name,
    )

    if not chunks:
        raise ValueError(f"Document {doc_name} has no extractable text or data.")

    # 1. Store chunks with embeddings in pgvector
    chunk_ids = await store_documents_bulk(chunks)

    # 2. Store extracted images in PostgreSQL
    image_ids = await store_document_images(images)

    logger.info(
        f"Ingested {doc_name}: {len(chunk_ids)} text chunks, {len(image_ids)} images extracted."
    )

    return {
        "filename": doc_name,
        "chunks_ingested": len(chunk_ids),
        "images_extracted": len(image_ids),
    }
