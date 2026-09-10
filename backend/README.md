# 🐺 Wise Wolves RAG — Backend Service

Asynchronous, LangGraph-powered enterprise RAG backend built on FastAPI, PostgreSQL `pgvector`, HNSW vector indexing, and fail-closed relevance gates.

---

## 🌟 Core Architecture

```
User Query + Scope Filter
           │
           ▼
[ Router Node (classify_query) ]
           │
           ▼
[ Retrieval Node (hybrid_retrieve) ]
           │
    (PostgreSQL 16 pgvector + HNSW)
           │
           ▼
[ Relevance Gatekeeper Node ]
     │               │
(Similarity >= 0.25) (Similarity < 0.25)
     │               │
     ▼               ▼
[ Generator ]    [ Fail-Closed Refusal ]
(Strict SSE)     ("Not found in documents")
     │               │
     ▼               ▼
[ Citation Verifier & Image Linker ]
           │
           ▼
Streamed Answer with Verified Source Snippets
```

---

## 🚀 Setup & Run

### 1. Requirements
- Python 3.11+
- PostgreSQL 16 with `pgvector` enabled

### 2. Installation
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your database URL and API keys (e.g. `OPENROUTER_API_KEY`, `DATABASE_URL`).

### 4. Database Setup
```bash
python scripts/init_db.py
```

### 5. Start Backend Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

---

## 🧪 Testing
```bash
pytest tests/ -v
```
