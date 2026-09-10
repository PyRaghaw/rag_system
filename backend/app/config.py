"""Centralized application settings, loaded once from environment / .env.

Enforces strict document-only configuration for enterprise RAG assistant.
"""
import os
from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        extra="ignore",
    )

    # Gemini LLM & Embeddings (Primary)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    embedding_model: str = "text-embedding-004"
    embedding_dim: int = 768

    # OpenRouter LLM (Strict Document Rephrasing)
    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct"

    # Alternative LLM Provider (Groq)
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Provider Selection
    llm_provider: str = "openrouter"
    embedding_provider: str = "gemini"

    # Hard Relevance Gate & RAG Parameters (Configurable via SIMILARITY_THRESHOLD)
    similarity_threshold: float = 0.35
    top_k: int = 4

    # Strict Document-Only Enterprise Flags
    web_search_enabled: bool = False
    mcp_tools_enabled: bool = False
    general_knowledge_enabled: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://raghawshukla@localhost:5432/copilot_db"

    # App
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"
    max_verification_retries: int = 1

    # Streamlit
    backend_url: str = "http://localhost:8000"

    @field_validator("database_url")
    @classmethod
    def _force_async_driver(cls, v: str) -> str:
        if v.startswith("postgresql+psycopg2://"):
            return v.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
