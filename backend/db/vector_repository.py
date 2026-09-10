from typing import Any, Dict, List, Optional

from langchain_core.documents import Document as LCDocument
from sqlalchemy import delete, func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.logging_config import logger
from core.embeddings import embed_documents, embed_query
from db.models import Document
from db.session import get_session


async def store_document(session: AsyncSession, content: str, metadata: Optional[dict] = None) -> int:
    vector = await embed_query(content)
    doc = Document(content=content, embedding=vector, doc_metadata=metadata or {})
    session.add(doc)
    await session.flush()
    return doc.id


async def store_documents_bulk(content_metadata: List[Dict[str, Any]]) -> List[int]:
    """Embed + insert many chunks in one transaction using batch embeddings."""
    if not content_metadata:
        return []

    texts = [item["content"] for item in content_metadata]
    vectors = await embed_documents(texts)

    ids: List[int] = []
    async with get_session() as session:
        for item, vec in zip(content_metadata, vectors):
            doc = Document(
                content=item["content"],
                embedding=vec,
                doc_metadata=item.get("metadata") or {},
            )
            session.add(doc)
            await session.flush()
            ids.append(doc.id)
    return ids


async def search_documents(
    query: str,
    k: int = 5,
    filter_documents: Optional[List[str]] = None,
) -> List[LCDocument]:
    """Cosine nearest-neighbour search with keyword hybrid boost and document scope filtering."""
    query_vector = await embed_query(query)

    # Clean and normalize filter documents list
    active_filters = [f.strip() for f in (filter_documents or []) if f and f.strip()]

    async with get_session() as session:
        distance_col = Document.embedding.cosine_distance(query_vector).label("distance")
        stmt = select(Document, distance_col)

        doc_name_expr = func.coalesce(
            func.json_extract_path_text(Document.doc_metadata, "document"),
            func.json_extract_path_text(Document.doc_metadata, "source"),
            "",
        )

        if active_filters:
            filter_clauses = [
                func.lower(doc_name_expr) == f.lower() for f in active_filters
            ]
            stmt = stmt.where(or_(*filter_clauses))

        # Order by distance first
        vector_stmt = stmt.order_by(distance_col).limit(k * 2)
        result = await session.execute(vector_stmt)
        rows = result.all()

        # Hybrid keyword retrieval: search for significant keywords in content
        stop_words = {
            "what", "is", "the", "of", "and", "in", "to", "a", "an", "for", "are",
            "as", "from", "that", "by", "this", "with", "on", "it", "or", "be",
            "at", "your", "can", "please", "give", "me", "show", "tell",
            "which", "who", "where", "when", "how", "about", "there", "their", "them", "then", "than"
        }
        keywords = [
            w.strip("?,.:;\"'()[]{}!").lower()
            for w in query.split()
            if len(w.strip("?,.:;\"'()[]{}!")) >= 3
        ]
        meaningful_kw = [w for w in keywords if w not in stop_words]

        kw_rows = []
        if meaningful_kw:
            kw_clauses = [Document.content.ilike(f"%{kw}%") for kw in meaningful_kw[:5]]
            kw_stmt = select(Document, distance_col).where(or_(*kw_clauses))
            if active_filters:
                filter_clauses = [
                    func.lower(doc_name_expr) == f.lower() for f in active_filters
                ]
                kw_stmt = kw_stmt.where(or_(*filter_clauses))
            kw_stmt = kw_stmt.order_by(distance_col).limit(k)
            kw_result = await session.execute(kw_stmt)
            kw_rows = kw_result.all()

    # Combine and deduplicate preserving best ranking
    seen_ids = set()
    combined_entries = []

    # Keyword-matched rows directly containing query keywords receive high relevance
    for doc, dist in kw_rows:
        if doc.id not in seen_ids:
            seen_ids.add(doc.id)
            distance_val = float(dist) if dist is not None else 1.0
            base_sim = max(0.0, 1.0 - distance_val)
            sim = max(base_sim, 0.45)
            combined_entries.append((doc, sim))

    for doc, dist in rows:
        if doc.id not in seen_ids:
            seen_ids.add(doc.id)
            distance_val = float(dist) if dist is not None else 1.0
            sim = max(0.0, 1.0 - distance_val)
            combined_entries.append((doc, sim))

    # Sort by similarity descending
    combined_entries.sort(key=lambda x: x[1], reverse=True)
    selected_entries = combined_entries[:k]

    lc_docs = []
    for doc, sim in selected_entries:
        meta = dict(doc.doc_metadata or {})
        meta["similarity"] = sim
        meta["score"] = sim
        lc_docs.append(LCDocument(page_content=doc.content, metadata=meta))

    return lc_docs


async def delete_documents_by_filename(filename: str) -> int:
    """Deletes all chunks and embeddings associated with the given filename."""
    async with get_session() as session:
        # Match either metadata->>'document' or metadata->>'source'
        stmt = delete(Document).where(
            (func.json_extract_path_text(Document.doc_metadata, 'document') == filename) |
            (func.json_extract_path_text(Document.doc_metadata, 'source') == filename)
        )
        result = await session.execute(stmt)
        deleted_count = result.rowcount
        logger.info(f"Deleted {deleted_count} chunks for document: {filename}")
        return deleted_count


async def list_unique_documents() -> List[Dict[str, Any]]:
    """Returns a summary of all unique documents currently stored in the knowledge base."""
    async with get_session() as session:
        doc_col = func.coalesce(
            func.json_extract_path_text(Document.doc_metadata, 'document'),
            func.json_extract_path_text(Document.doc_metadata, 'source'),
            'Unknown'
        ).label("filename")
        stmt = (
            select(doc_col, func.count(Document.id).label("chunk_count"))
            .group_by(doc_col)
            .order_by(doc_col)
        )
        result = await session.execute(stmt)
        return [{"filename": row.filename, "chunk_count": row.chunk_count} for row in result.all()]
