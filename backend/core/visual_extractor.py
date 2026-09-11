"""
Visual Extractor & Heading Section Snapshot Engine.

Extracts high-resolution visual screenshots of document pages and heading-specific
sections/diagrams using PyMuPDF (fitz).
"""
import hashlib
import os
import re
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import pymupdf as fitz
except ImportError:
    import fitz

from PIL import Image
from app.logging_config import logger


def get_image_dir() -> Path:
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        d = Path(tempfile.gettempdir()) / "rag_data" / "extracted_images"
    else:
        d = Path(__file__).resolve().parent.parent / "data" / "extracted_images"
    d.mkdir(parents=True, exist_ok=True)
    return d


IMAGE_DIR = get_image_dir()


def is_meaningful_image(image_bytes: bytes, min_size: int = 70) -> bool:
    """
    Checks if an image is visually meaningful and NOT a blank or solid-color
    rectangle mask (such as Canva/PPT dark background cards).
    """
    import io
    if len(image_bytes) < 1500:
        return False

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            w, h = img.size
            if w < min_size or h < min_size:
                return False

            # Check extrema on grayscale
            gray = img.convert("L")
            extrema = gray.getextrema()
            # If min and max brightness difference is < 18, it's a solid block
            if extrema[1] - extrema[0] < 18:
                return False

            return True
    except Exception as exc:
        logger.debug(f"Image validation exception: {exc}")
        return False


def render_page_snapshot(
    doc: fitz.Document,
    page_num: int,
    doc_name: str,
    section_name: str = "",
    dpi: int = 150,
) -> Optional[Dict[str, Any]]:
    """
    Renders an entire PDF page/slide into a crisp, high-resolution PNG screenshot.
    Captures all vector graphics, flowcharts, architecture diagrams, and text intact.
    """
    try:
        page_idx = page_num - 1
        if page_idx < 0 or page_idx >= len(doc):
            return None

        page = doc[page_idx]
        pix = page.get_pixmap(dpi=dpi)
        img_bytes = pix.tobytes("png")

        doc_hash = hashlib.md5(doc_name.encode("utf-8")).hexdigest()[:8]
        image_id = f"page_snap_{doc_hash}_p{page_num}"
        out_path = IMAGE_DIR / f"{image_id}.png"

        with open(out_path, "wb") as f:
            f.write(img_bytes)

        label = section_name or f"Page {page_num}"
        return {
            "image_id": image_id,
            "document": doc_name,
            "page": page_num,
            "section": label,
            "file_path": str(out_path),
            "url_path": f"/api/documents/images/{image_id}",
            "caption": f"{label} (Page {page_num} visual overview / diagram)",
            "mime_type": "image/png",
        }
    except Exception as exc:
        logger.error(f"Failed to render page snapshot for {doc_name} p.{page_num}: {exc}")
        return None


def render_heading_section_crop(
    doc: fitz.Document,
    page_num: int,
    heading_text: str,
    doc_name: str,
    dpi: int = 150,
) -> Optional[Dict[str, Any]]:
    """
    Locates heading on a page and renders a high-resolution screenshot of that
    exact section/diagram box.
    """
    try:
        page_idx = page_num - 1
        if page_idx < 0 or page_idx >= len(doc):
            return None

        page = doc[page_idx]
        rects = page.search_for(heading_text)
        if not rects:
            parts = [p for p in heading_text.split() if len(p) >= 4]
            for part in parts:
                rects = page.search_for(part)
                if rects:
                    break

        page_rect = page.rect
        is_slide = (page_rect.width / max(page_rect.height, 1)) > 1.3

        if is_slide or not rects:
            return render_page_snapshot(doc, page_num, doc_name, section_name=heading_text, dpi=dpi)

        top_y = max(0, rects[0].y0 - 15)
        clip_rect = fitz.Rect(0, top_y, page_rect.width, page_rect.height)

        pix = page.get_pixmap(clip=clip_rect, dpi=dpi)
        img_bytes = pix.tobytes("png")

        doc_hash = hashlib.md5(doc_name.encode("utf-8")).hexdigest()[:8]
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", heading_text.strip())[:25].strip("_")
        image_id = f"sec_snap_{doc_hash}_p{page_num}_{slug}"
        out_path = IMAGE_DIR / f"{image_id}.png"

        with open(out_path, "wb") as f:
            f.write(img_bytes)

        return {
            "image_id": image_id,
            "document": doc_name,
            "page": page_num,
            "section": heading_text,
            "file_path": str(out_path),
            "url_path": f"/api/documents/images/{image_id}",
            "caption": f"Section Screenshot: {heading_text} (Page {page_num})",
            "mime_type": "image/png",
        }
    except Exception as exc:
        logger.error(f"Failed to render heading crop for '{heading_text}': {exc}")
        return None


def extract_heading_snapshots_from_pdf(
    file_path: str,
    doc_name: str,
    dpi: int = 150,
) -> List[Dict[str, Any]]:
    """
    Scans a PDF and renders visual snapshots for every slide/page and any
    major architecture/diagram/process section detected.
    """
    doc = fitz.open(file_path)
    visual_images: List[Dict[str, Any]] = []

    try:
        from core.text_processing import detect_headings

        for page_idx in range(len(doc)):
            page_num = page_idx + 1
            page = doc[page_idx]
            raw_text = page.get_text() or ""
            headings = detect_headings(raw_text)

            primary_heading = headings[0] if headings else f"Page {page_num}"

            # 1. Full Page / Slide visual snapshot
            page_img = render_page_snapshot(
                doc,
                page_num,
                doc_name,
                section_name=primary_heading,
                dpi=dpi,
            )
            if page_img:
                visual_images.append(page_img)

            # 2. Section screenshots for specific diagram/architecture headings
            for h in headings:
                if any(w in h.lower() for w in ["diagram", "architecture", "flowchart", "workflow", "overview", "approach"]):
                    sec_img = render_heading_section_crop(
                        doc,
                        page_num,
                        h,
                        doc_name,
                        dpi=dpi,
                    )
                    if sec_img and sec_img["image_id"] != page_img["image_id"]:
                        visual_images.append(sec_img)

    finally:
        doc.close()

    return visual_images


def capture_section_snapshot(
    pdf_path: str,
    heading_query: str,
    doc_name: str,
    dpi: int = 150,
) -> Optional[Dict[str, Any]]:
    """
    Finds a heading or diagram topic across a PDF and extracts the visual screenshot
    of that section or page.
    """
    if not os.path.exists(pdf_path):
        return None

    doc = fitz.open(pdf_path)
    try:
        query_lower = heading_query.lower()
        key_terms = [t for t in query_lower.split() if len(t) >= 3 and t not in ("the", "and", "for", "from", "show", "image", "diagram")]

        best_match = None
        best_page = -1
        best_score = 0

        for page_idx in range(len(doc)):
            page = doc[page_idx]
            text = (page.get_text() or "").lower()

            score = 0
            if query_lower in text:
                score += 10
            for term in key_terms:
                if term in text:
                    score += 2

            if score > best_score:
                best_score = score
                best_page = page_idx + 1
                best_match = heading_query

        if best_page > 0 and best_score >= 2:
            return render_heading_section_crop(
                doc,
                page_num=best_page,
                heading_text=heading_query,
                doc_name=doc_name,
                dpi=dpi,
            )
        return None
    finally:
        doc.close()
