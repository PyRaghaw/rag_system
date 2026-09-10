"""
Image repository for storing, retrieving, and searching extracted document images.
"""
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy import delete, func, or_, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.logging_config import logger
from db.models import DocumentImage
from db.session import get_session


async def store_document_images(images_data: List[Dict[str, Any]]) -> List[str]:
    """Inserts or updates metadata for extracted document images into PostgreSQL with conflict resolution."""
    if not images_data:
        return []

    # Deduplicate by image_id in memory first
    seen: Dict[str, Dict[str, Any]] = {}
    for img in images_data:
        if img.get("image_id"):
            seen[img["image_id"]] = img
    deduped = list(seen.values())

    inserted_ids: List[str] = []
    async with get_session() as session:
        for img in deduped:
            stmt = pg_insert(DocumentImage).values(
                image_id=img["image_id"],
                document=img["document"],
                page=img.get("page", 1),
                section=img.get("section", ""),
                file_path=img["file_path"],
                url_path=img.get("url_path", f"/api/documents/images/{img['image_id']}"),
                caption=img.get("caption", ""),
                mime_type=img.get("mime_type", "image/png"),
            ).on_conflict_do_update(
                index_elements=["image_id"],
                set_={
                    "document": img["document"],
                    "page": img.get("page", 1),
                    "section": img.get("section", ""),
                    "file_path": img["file_path"],
                    "url_path": img.get("url_path", f"/api/documents/images/{img['image_id']}"),
                    "caption": img.get("caption", ""),
                    "mime_type": img.get("mime_type", "image/png"),
                }
            )
            await session.execute(stmt)
            inserted_ids.append(img["image_id"])

    logger.info(f"Stored/updated metadata for {len(inserted_ids)} document images.")
    return inserted_ids


async def get_image_by_id(image_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a single image record by unique image_id."""
    async with get_session() as session:
        stmt = select(DocumentImage).where(DocumentImage.image_id == image_id)
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            return None
        return {
            "id": record.id,
            "image_id": record.image_id,
            "document": record.document,
            "page": record.page,
            "section": record.section,
            "file_path": record.file_path,
            "url_path": record.url_path,
            "caption": record.caption,
            "mime_type": record.mime_type,
        }


async def get_images_by_document(document: str) -> List[Dict[str, Any]]:
    """Returns all extracted images for a given document."""
    async with get_session() as session:
        stmt = (
            select(DocumentImage)
            .where(func.lower(DocumentImage.document) == document.lower())
            .order_by(DocumentImage.page)
        )
        result = await session.execute(stmt)
        records = result.scalars().all()
        return [
            {
                "image_id": r.image_id,
                "document": r.document,
                "page": r.page,
                "section": r.section,
                "url": r.url_path,
                "url_path": r.url_path,
                "caption": r.caption,
                "mime_type": r.mime_type,
            }
            for r in records
        ]


async def search_images(
    document_filter: Optional[List[str]] = None,
    page_filter: Optional[List[int]] = None,
    query: Optional[str] = None,
    limit: int = 4,
) -> List[Dict[str, Any]]:
    """
    Finds relevant images matching scoped documents, pages, or search terms,
    prioritizing heading matches, section snapshots, and diagrams.
    """
    async with get_session() as session:
        stmt = select(DocumentImage)

        if document_filter:
            doc_clauses = [
                func.lower(DocumentImage.document) == d.lower().strip()
                for d in document_filter
                if d.strip()
            ]
            if doc_clauses:
                stmt = stmt.where(or_(*doc_clauses))

        if page_filter:
            stmt = stmt.where(DocumentImage.page.in_(page_filter))

        # Ignore generic visual query tokens when extracting topic keywords
        visual_noise_words = {
            "what", "show", "tell", "this", "from", "with", "have", "please", "give", "the",
            "image", "images", "picture", "pictures", "diagram", "diagrams", "photo", "photos",
            "screenshot", "screenshots", "visual", "figure", "figures", "user"
        }

        keywords = []
        if query:
            keywords = [
                w.strip("?,.:;\"'()[]{}!").lower()
                for w in query.split()
                if len(w.strip("?,.:;\"'()[]{}!")) >= 3
                and w.lower() not in visual_noise_words
            ]
            if keywords:
                text_clauses = []
                for kw in keywords[:6]:
                    text_clauses.append(DocumentImage.section.ilike(f"%{kw}%"))
                    text_clauses.append(DocumentImage.caption.ilike(f"%{kw}%"))
                if text_clauses:
                    stmt = stmt.where(or_(*text_clauses))
            else:
                # If only generic words like "diagram" or "show image", search for visual keywords in section/caption
                fallback_clauses = [
                    DocumentImage.section.ilike("%diagram%"),
                    DocumentImage.section.ilike("%architecture%"),
                    DocumentImage.section.ilike("%workflow%"),
                    DocumentImage.section.ilike("%flowchart%"),
                    DocumentImage.caption.ilike("%diagram%"),
                    DocumentImage.caption.ilike("%architecture%"),
                ]
                stmt = stmt.where(or_(*fallback_clauses))

        result = await session.execute(stmt)
        records = result.scalars().all()

        # Score and rank candidates
        query_norm = (query or "").lower().strip()
        scored_images = []

        for r in records:
            # Verify file exists on disk
            if r.file_path and not os.path.exists(r.file_path):
                continue

            score = 0.0
            sec_lower = (r.section or "").lower()
            cap_lower = (r.caption or "").lower()
            match_found = False

            # Exact query phrase in section
            if query_norm and query_norm in sec_lower:
                score += 30.0
                match_found = True
            elif query_norm and query_norm in cap_lower:
                score += 20.0
                match_found = True

            # Keyword matching
            for kw in keywords:
                if kw in sec_lower:
                    score += 10.0
                    match_found = True
                if kw in cap_lower:
                    score += 5.0
                    match_found = True

            # If query had distinctive keywords, REQUIRE at least one keyword or phrase match!
            if query and keywords and not match_found:
                continue

            # Boost section snapshots and full visual page diagrams only if relevant
            if r.image_id.startswith("sec_snap_"):
                score += 10.0
            elif any(w in sec_lower for w in ["architecture", "diagram", "workflow", "flowchart"]):
                score += 8.0
            elif r.image_id.startswith("page_snap_"):
                score += 2.0

            # Require minimum score when a query is provided
            if query and score < 8.0:
                continue

            scored_images.append((score, r))

        # Sort by score descending, then page ascending
        scored_images.sort(key=lambda item: (-item[0], item[1].page))
        top_records = [item[1] for item in scored_images[:limit]]

        return [
            {
                "image_id": r.image_id,
                "document": r.document,
                "page": r.page,
                "section": r.section,
                "url": r.url_path,
                "caption": r.caption or f"Figure from page {r.page}",
                "mime_type": r.mime_type,
            }
            for r in top_records
        ]


async def delete_images_by_document(document: str) -> int:
    """Deletes image records and disk files for a document."""
    async with get_session() as session:
        stmt = select(DocumentImage).where(
            func.lower(DocumentImage.document) == document.lower().strip()
        )
        result = await session.execute(stmt)
        records = result.scalars().all()

        for r in records:
            try:
                if r.file_path and os.path.exists(r.file_path):
                    os.remove(r.file_path)
            except Exception as exc:
                logger.warning(f"Failed to delete image file {r.file_path}: {exc}")

        del_stmt = delete(DocumentImage).where(
            func.lower(DocumentImage.document) == document.lower().strip()
        )
        del_result = await session.execute(del_stmt)
        deleted_count = del_result.rowcount
        logger.info(f"Deleted {deleted_count} image records for document: {document}")
        return deleted_count
