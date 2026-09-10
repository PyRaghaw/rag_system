"""
Shared LangGraph state definition for the Strict Document-Only Enterprise Knowledge Assistant.
"""
from typing import Any, Dict, List, Optional, TypedDict

from langchain_core.documents import Document


class State(TypedDict, total=False):
    question: str
    original_question: str

    # Conversation / thread continuity
    thread_id: str
    chat_history: List[Dict[str, str]]

    # Query validation
    is_query_valid: bool
    needs_clarification: bool
    found: bool

    # Retrieval
    selected_documents: List[str]
    rag_docs: List[Document]
    relevant_docs: List[Document]
    top_similarity_score: float

    # Context assembly
    final_context: str

    # Generation & verification
    final_answer: str
    verification: str
    sources: List[Dict[str, Any]]  # Deterministic citations: {document, page, section, snippet}
    images: List[Dict[str, Any]]  # Extracted visual assets: {image_id, url, document, page, section, caption}
