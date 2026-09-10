"""
/chat endpoint: runs a question through the Strict Document-Only LangGraph workflow.
"""
import asyncio
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.api.schemas import ChatRequest, ChatResponse
from app.logging_config import logger
from db.thread_repository import create_thread, get_messages
from graph.workflow import get_app

router = APIRouter(tags=["chat"])

_TYPING_DELAY = 0.02


def _sse(event: str, data: dict) -> str:
    payload = dict(data)
    payload["event"] = event
    return f"event: {event}\ndata: {json.dumps(payload)}\n\n"


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    app = get_app()
    query = payload.get_query()
    req_thread_id = payload.get_thread_id()
    selected_docs = payload.get_selected_documents()
    logger.info(f"Incoming question: {query!r} (thread_id={req_thread_id}, docs={selected_docs})")

    if req_thread_id:
        chat_history = [
            {"role": m["role"], "content": m["content"]} for m in await get_messages(req_thread_id)
        ]
        thread_id = req_thread_id
    else:
        thread_id = await create_thread(query or "New Chat")
        chat_history = []

    try:
        result = await app.ainvoke(
            {
                "question": query,
                "thread_id": thread_id,
                "chat_history": chat_history,
                "selected_documents": selected_docs,
            }
        )
    except Exception as exc:
        logger.exception("Graph execution failed")
        raise HTTPException(status_code=500, detail="Internal processing error") from exc

    found = result.get("found", True)
    return ChatResponse(
        question=query,
        answer=result.get("final_answer", "I couldn't find this information in the available documents."),
        found=found,
        grounded=found,
        needs_clarification=result.get("needs_clarification", False),
        sources=result.get("sources", []),
        images=result.get("images", []),
        thread_id=thread_id,
        conversation_id=thread_id,
    )


@router.post("/chat/stream")
async def chat_stream(payload: ChatRequest):
    """Streaming counterpart for /chat."""
    async def event_stream():
        try:
            query = payload.get_query()
            req_thread_id = payload.get_thread_id()
            selected_docs = payload.get_selected_documents()
            if req_thread_id:
                chat_history = [
                    {"role": m["role"], "content": m["content"]}
                    for m in await get_messages(req_thread_id)
                ]
                thread_id = req_thread_id
            else:
                thread_id = await create_thread(query or "New Chat")
                chat_history = []

            # Immediate thread initialization event for frontend state locking
            yield _sse("init", {"thread_id": thread_id, "conversation_id": thread_id})

            inputs = {
                "question": query,
                "thread_id": thread_id,
                "chat_history": chat_history,
                "selected_documents": selected_docs,
            }

            app = get_app()
            final_state: dict = {}

            async for update in app.astream(inputs, stream_mode="updates"):
                if not update or not isinstance(update, dict):
                    continue
                for node_name, node_output in update.items():
                    if not node_output or not isinstance(node_output, dict):
                        continue
                    final_state.update(node_output)

                    if node_name == "validate_query":
                        yield _sse("validation", {
                            "is_valid": node_output.get("is_query_valid", True),
                            "needs_clarification": node_output.get("needs_clarification", False),
                        })
                    elif node_name == "enterprise_retrieve":
                        yield _sse("retrieval", {
                            "chunks_retrieved": len(node_output.get("rag_docs", [])),
                            "top_similarity": node_output.get("top_similarity_score", 0.0),
                        })
                    elif node_name == "is_relevant":
                        yield _sse("relevance_gate", {
                            "passed": len(node_output.get("relevant_docs", [])) > 0,
                        })

            final_answer = final_state.get(
                "final_answer", "I couldn't find this information in the available documents."
            )
            for word in final_answer.split(" "):
                yield _sse("token", {"text": word + " "})
                await asyncio.sleep(_TYPING_DELAY)

            found = final_state.get("found", True)
            yield _sse(
                "done",
                {
                    "answer": final_answer,
                    "found": found,
                    "grounded": found,
                    "needs_clarification": final_state.get("needs_clarification", False),
                    "sources": final_state.get("sources", []),
                    "images": final_state.get("images", []),
                    "thread_id": thread_id,
                    "conversation_id": thread_id,
                },
            )

        except Exception as exc:
            logger.exception("Streaming chat failed")
            yield _sse("error", {"detail": f"Internal processing error: {exc}"})

    return StreamingResponse(event_stream(), media_type="text/event-stream")
