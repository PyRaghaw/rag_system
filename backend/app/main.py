"""FastAPI application entrypoint.

Run with:  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes_chat import router as chat_router
from app.api.routes_ingest import router as ingest_router
from app.api.routes_threads import router as threads_router
from app.config import settings
from app.logging_config import logger

app = FastAPI(
    title="Strict Enterprise Knowledge Assistant",
    description="Strict document-only enterprise RAG assistant.",
    version="2.0.0",
)

# Universal CORS for local development, Vercel deployments, and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under both /api/v1 and standard /api
app.include_router(chat_router, prefix="/api/v1")
app.include_router(ingest_router, prefix="/api/v1")
app.include_router(threads_router, prefix="/api/v1")

app.include_router(chat_router, prefix="/api")
app.include_router(ingest_router, prefix="/api")
app.include_router(threads_router, prefix="/api")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "ClientError", "message": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Request validation error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=422,
        content={"error": "ValidationError", "message": "Invalid request parameters."},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error on {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "message": "An internal error occurred."},
    )


@app.get("/health")
@app.get("/api/health")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "rag-api",
        "mode": "strict_document_only",
    }


from db.models import Base
from db.session import engine


@app.on_event("startup")
async def on_startup() -> None:
    logger.info(f"Starting Strict Enterprise Knowledge Assistant on {settings.app_host}:{settings.app_port}")
    try:
        from sqlalchemy import text
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified and synchronized.")
    except Exception as exc:
        logger.warning(f"Database table sync notice: {exc}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.app_host, port=settings.app_port, reload=True)
