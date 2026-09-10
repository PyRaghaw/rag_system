"""Web search is strictly disabled in enterprise document-only mode."""

from typing import List


async def duckduckgo_search(query: str, max_results: int = 5) -> List[str]:
    """Strictly disabled web search fallback."""
    raise RuntimeError(
        "Web search is completely disabled in Enterprise Document-Only mode. "
        "Questions must be answered strictly from uploaded documents or fail closed."
    )
