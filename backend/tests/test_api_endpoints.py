"""
Integration tests for FastAPI endpoints:
- Ingestion endpoint (upload PDF, reject invalid/empty/non-pdf)
- Document listing and deletion endpoints
- Chat endpoint (grounded Q&A, empty query, ambiguous query, unanswerable query)
- Safe error handling responses (no stack traces, no leaked credentials)
"""
import io
try:
    import pymupdf as fitz
except ImportError:
    import fitz
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


def _make_pdf_bytes(text: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text, fontsize=11)
    b = doc.tobytes()
    doc.close()
    return b


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_endpoint(client):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.json()["mode"] == "strict_document_only"


@pytest.mark.asyncio
async def test_api_ingest_and_documents_flow(client):
    # 1. Ingest PDF
    pdf_bytes = _make_pdf_bytes(
        "Section 5.0 Parental Leave\n"
        "Employees are eligible for 16 weeks of paid parental leave."
    )
    files = {"files": ("Parental_Leave_Policy.pdf", pdf_bytes, "application/pdf")}
    res = await client.post("/api/v1/ingest", files=files)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["filename"] == "Parental_Leave_Policy.pdf"
    assert data[0]["chunks_ingested"] >= 1

    # 2. List documents
    docs_res = await client.get("/api/v1/documents")
    assert docs_res.status_code == 200
    doc_list = docs_res.json()
    assert any(d["filename"] == "Parental_Leave_Policy.pdf" for d in doc_list)

    # 3. Chat: Ask grounded question
    chat_res = await client.post("/api/v1/chat", json={
        "question": "How many weeks of paid parental leave are employees eligible for?"
    })
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert chat_data["found"] is True
    assert "16" in chat_data["answer"] or "parental" in chat_data["answer"].lower()
    assert len(chat_data["sources"]) > 0
    assert chat_data["sources"][0]["document"] == "Parental_Leave_Policy.pdf"

    # 4. Chat: Empty question validation
    empty_res = await client.post("/api/v1/chat", json={"question": ""})
    assert empty_res.status_code == 200
    assert empty_res.json()["found"] is False
    assert empty_res.json()["answer"] == "Please enter a question."

    # 5. Chat: Ambiguous question validation
    ambig_res = await client.post("/api/v1/chat", json={"question": "leave?"})
    assert ambig_res.status_code == 200
    assert ambig_res.json()["found"] is False
    assert ambig_res.json()["needs_clarification"] is True

    # 6. Chat: Unanswerable / unsupported question -> fail closed
    unsupported_res = await client.post("/api/v1/chat", json={
        "question": "Can I bring my pet tiger to work?"
    })
    assert unsupported_res.status_code == 200
    assert unsupported_res.json()["found"] is False
    assert unsupported_res.json()["answer"] == "I couldn't find this information in the available documents."
    assert unsupported_res.json()["sources"] == []

    # 7. Delete Document
    del_res = await client.delete("/api/v1/documents/Parental_Leave_Policy.pdf")
    assert del_res.status_code == 200
    assert del_res.json()["filename"] == "Parental_Leave_Policy.pdf"
    assert del_res.json()["chunks_deleted"] >= 1

    # 8. Query again after deletion -> fails closed
    post_del_chat = await client.post("/api/v1/chat", json={
        "question": "How many weeks of paid parental leave are employees eligible for?"
    })
    assert post_del_chat.status_code == 200
    assert post_del_chat.json()["found"] is False
    assert post_del_chat.json()["answer"] == "I couldn't find this information in the available documents."

    # 9. Clean up test threads created during this test
    from db.session import get_session
    from sqlalchemy import text
    async with get_session() as s:
        await s.execute(text("DELETE FROM messages WHERE thread_id IN (SELECT id FROM threads WHERE title LIKE '%parental%' OR title LIKE '%tiger%' OR title = 'leave?' OR title = 'New Chat')"))
        await s.execute(text("DELETE FROM threads WHERE title LIKE '%parental%' OR title LIKE '%tiger%' OR title = 'leave?' OR title = 'New Chat'"))
        await s.commit()


@pytest.mark.asyncio
async def test_api_ingest_validation_errors(client):
    # Reject unsupported format
    res1 = await client.post(
        "/api/v1/ingest",
        files={"files": ("program.exe", b"binary content", "application/octet-stream")}
    )
    assert res1.status_code == 400
    assert res1.json()["error"] == "ClientError"
    assert "Unsupported file format" in res1.json()["message"]

    # Reject empty file
    res2 = await client.post(
        "/api/v1/ingest",
        files={"files": ("empty.pdf", b"", "application/pdf")}
    )
    assert res2.status_code == 400
    assert res2.json()["error"] == "ClientError"
    assert "0 bytes" in res2.json()["message"]


@pytest.mark.asyncio
async def test_delete_nonexistent_document_404(client):
    res = await client.delete("/api/v1/documents/NonExistent_Policy.pdf")
    assert res.status_code == 404
    assert res.json()["error"] == "ClientError"
