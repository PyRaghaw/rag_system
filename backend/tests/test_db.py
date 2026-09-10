"""Smoke test for the async DB engine wiring."""
import pytest
from sqlalchemy import text

from db.session import engine


@pytest.mark.asyncio
async def test_engine_connects():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT 1"))
        assert result.scalar() == 1
