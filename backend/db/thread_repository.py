"""
Async repository for chat threads/messages.
"""
from typing import Any, Dict, List, Optional

from sqlalchemy import delete, func, select, update

from db.models import Message, Thread
from db.session import get_session


def _make_title(question: str, max_len: int = 60) -> str:
    question = " ".join(question.split())
    return question if len(question) <= max_len else question[: max_len - 1].rstrip() + "…"


async def create_thread(first_question: str) -> str:
    async with get_session() as session:
        thread = Thread(title=_make_title(first_question))
        session.add(thread)
        await session.flush()
        return thread.id


async def list_threads() -> List[Dict[str, Any]]:
    async with get_session() as session:
        stmt = select(Thread).order_by(Thread.updated_at.desc())
        result = await session.execute(stmt)
        threads = result.scalars().all()
        return [
            {
                "id": t.id,
                "title": t.title,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            }
            for t in threads
        ]


async def get_messages(thread_id: str) -> List[Dict[str, Any]]:
    async with get_session() as session:
        stmt = (
            select(Message)
            .where(Message.thread_id == thread_id)
            .order_by(Message.created_at.asc())
        )
        result = await session.execute(stmt)
        messages = result.scalars().all()
        return [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "sources": m.sources or [],
                "images": getattr(m, "images", []) or [],
                "verification": m.verification,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ]


async def add_message(
    thread_id: str,
    role: str,
    content: str,
    sources: Optional[List[Any]] = None,
    verification: str = "",
    images: Optional[List[Any]] = None,
) -> str:
    async with get_session() as session:
        # Ensure thread exists to prevent foreign key errors
        thread = await session.get(Thread, thread_id)
        if not thread:
            session.add(Thread(id=thread_id, title=_make_title(content)))
            await session.flush()

        message = Message(
            thread_id=thread_id,
            role=role,
            content=content,
            sources=sources or [],
            images=images or [],
            verification=verification,
        )
        session.add(message)
        await session.flush()

        await session.execute(
            update(Thread).where(Thread.id == thread_id).values(updated_at=func.now())
        )
        return message.id


async def delete_thread(thread_id: str) -> None:
    async with get_session() as session:
        await session.execute(delete(Message).where(Message.thread_id == thread_id))
        await session.execute(delete(Thread).where(Thread.id == thread_id))


async def rename_thread(thread_id: str, title: str) -> None:
    async with get_session() as session:
        await session.execute(update(Thread).where(Thread.id == thread_id).values(title=title))
