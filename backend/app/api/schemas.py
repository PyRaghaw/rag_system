"""
Pydantic request/response models for the Strict Document-Only Knowledge Assistant.
"""
from typing import Any, List, Optional
from pydantic import BaseModel


class SourceCitation(BaseModel):
    document: str
    document_name: Optional[str] = None
    document_id: Optional[str] = None
    page: Optional[int] = None
    section: Optional[str] = None
    snippet: str

    def __init__(self, **data: Any):
        if "document_name" not in data or not data["document_name"]:
            data["document_name"] = data.get("document", "")
        if "document_id" not in data or not data["document_id"]:
            data["document_id"] = data.get("document", "")
        super().__init__(**data)


class ChatRequest(BaseModel):
    question: Optional[str] = None
    message: Optional[str] = None
    thread_id: Optional[str] = None
    conversation_id: Optional[str] = None
    documents: Optional[List[str]] = None
    selected_documents: Optional[List[str]] = None

    def get_query(self) -> str:
        return (self.question or self.message or "").strip()

    def get_thread_id(self) -> Optional[str]:
        return self.thread_id or self.conversation_id

    def get_selected_documents(self) -> List[str]:
        docs = self.selected_documents or self.documents or []
        return [d.strip() for d in docs if d and d.strip()]


class ImageAttachment(BaseModel):
    image_id: str
    url: str
    document: str
    page: Optional[int] = 1
    section: Optional[str] = ""
    caption: Optional[str] = ""
    mime_type: Optional[str] = "image/png"


class ChatResponse(BaseModel):
    question: str
    answer: str
    found: bool = True
    grounded: bool = True
    needs_clarification: bool = False
    sources: List[SourceCitation] = []
    images: List[ImageAttachment] = []
    thread_id: str
    conversation_id: Optional[str] = None
    message_id: Optional[str] = None

    def __init__(self, **data: Any):
        if "grounded" not in data or data["grounded"] is None:
            data["grounded"] = data.get("found", True)
        if "conversation_id" not in data or not data["conversation_id"]:
            data["conversation_id"] = data.get("thread_id", "")
        if "images" not in data or data["images"] is None:
            data["images"] = []
        super().__init__(**data)


class IngestResponse(BaseModel):
    filename: str
    chunks_ingested: int
    document_id: Optional[str] = None
    status: str = "indexed"
    chunks: Optional[int] = None

    def __init__(self, **data: Any):
        if "document_id" not in data or not data["document_id"]:
            data["document_id"] = data.get("filename", "")
        if "chunks" not in data or data["chunks"] is None:
            data["chunks"] = data.get("chunks_ingested", 0)
        super().__init__(**data)


class DocumentInfo(BaseModel):
    filename: str
    chunk_count: int


class DeleteDocumentResponse(BaseModel):
    filename: str
    chunks_deleted: int


class ThreadSummary(BaseModel):
    id: str
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    sources: List[Any] = []
    images: List[Any] = []
    verification: str = ""
    created_at: Optional[str] = None


class RenameThreadRequest(BaseModel):
    title: str
