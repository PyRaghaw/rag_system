"""Embeddings access layer.

Supports:
1. Google Gemini text-embedding-004 (768 dimensions)
2. HuggingFace / SentenceTransformers (if configured)
3. Deterministic semantic hashing fallback for offline/test mode
"""
import asyncio
import hashlib
import math
import os
from typing import Any, Dict, List, Optional

from app.config import settings
from app.logging_config import logger

try:
    from google import genai
except ImportError:
    genai = None


def _deterministic_pseudo_embedding(text: str, dim: int = 768) -> List[float]:
    """Deterministic normalized pseudo-embedding for testing when API key is not present."""
    words = text.lower().split()
    vector = [0.0] * dim
    for w in words:
        h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
        for i in range(4):
            idx = (h >> (i * 8)) % dim
            vector[idx] += 1.0

    # Add character n-grams
    for i in range(len(text) - 2):
        trigram = text[i : i + 3].lower()
        h = int(hashlib.sha256(trigram.encode("utf-8")).hexdigest(), 16) % dim
        vector[h] += 0.5

    norm = math.sqrt(sum(x * x for x in vector)) or 1.0
    return [x / norm for x in vector]


_GEMINI_EMBEDDINGS_DISABLED = False


import httpx

async def _embed_openrouter(texts: List[str]) -> Optional[List[List[float]]]:
    """Fetch embeddings from OpenRouter using OpenAI text-embedding-3-small calibrated to embedding_dim."""
    openrouter_key = (getattr(settings, "openrouter_api_key", "") or os.getenv("OPENROUTER_API_KEY", "")).strip()
    if not openrouter_key or not openrouter_key.startswith("sk-or-"):
        return None
    url = "https://openrouter.ai/api/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {openrouter_key}",
        "Content-Type": "application/json",
    }
    dim = getattr(settings, "embedding_dim", 768)
    # OpenRouter handles batches up to 64 comfortably
    results: List[List[float]] = []
    batch_size = 32
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for i in range(0, len(texts), batch_size):
                chunk = texts[i : i + batch_size]
                payload = {
                    "model": "openai/text-embedding-3-small",
                    "input": chunk if len(chunk) > 1 else chunk[0],
                    "dimensions": dim,
                }
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    embs = [item["embedding"] for item in data["data"]]
                    results.extend(embs)
                else:
                    logger.warning(f"OpenRouter embedding returned status {res.status_code}: {res.text[:120]}")
                    return None
            return results
    except Exception as exc:
        logger.warning(f"OpenRouter embedding API error: {exc}")
        return None


async def embed_query(text: str) -> List[float]:
    """Embed single query string asynchronously."""
    # 1. Try OpenRouter high-accuracy semantic embeddings
    or_res = await _embed_openrouter([text])
    if or_res and len(or_res) > 0:
        return or_res[0]

    global _GEMINI_EMBEDDINGS_DISABLED
    gemini_key = (settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")).strip()

    # Valid Google AI Studio API keys begin with 'AIzaSy'
    if gemini_key and not gemini_key.startswith("AIzaSy"):
        if not _GEMINI_EMBEDDINGS_DISABLED:
            logger.info("GEMINI_API_KEY is not a Google AI Studio key ('AIzaSy...'). Using fallback engine.")
            _GEMINI_EMBEDDINGS_DISABLED = True

    if gemini_key and not _GEMINI_EMBEDDINGS_DISABLED:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            result = client.models.embed_content(
                model=settings.embedding_model,
                contents=text,
            )
            embedding = result.embedding.values
            return list(embedding)
        except Exception as exc:
            logger.warning(f"Gemini embedding API call failed: {exc}. Disabling remote calls and using fallback.")
            _GEMINI_EMBEDDINGS_DISABLED = True

    return _deterministic_pseudo_embedding(text, dim=settings.embedding_dim)


async def embed_documents(texts: List[str]) -> List[List[float]]:
    """Embed multiple document chunks."""
    # 1. Try OpenRouter high-accuracy semantic embeddings
    or_res = await _embed_openrouter(texts)
    if or_res and len(or_res) == len(texts):
        return or_res

    global _GEMINI_EMBEDDINGS_DISABLED
    gemini_key = (settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")).strip()

    if gemini_key and not gemini_key.startswith("AIzaSy"):
        if not _GEMINI_EMBEDDINGS_DISABLED:
            logger.info("GEMINI_API_KEY is not a Google AI Studio key ('AIzaSy...'). Using fallback engine.")
            _GEMINI_EMBEDDINGS_DISABLED = True

    if gemini_key and not _GEMINI_EMBEDDINGS_DISABLED:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            result = client.models.embed_content(
                model=settings.embedding_model,
                contents=texts,
            )
            return [list(e.values) for e in result.embeddings]
        except Exception as exc:
            logger.warning(f"Gemini batch embedding call failed: {exc}. Disabling remote calls and using fallback.")
            _GEMINI_EMBEDDINGS_DISABLED = True

    return [_deterministic_pseudo_embedding(t, dim=settings.embedding_dim) for t in texts]
