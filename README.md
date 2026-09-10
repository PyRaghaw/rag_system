# 🐺 Wise Wolves RAG — Strict Enterprise Knowledge Assistant

[![PostgreSQL pgvector](https://img.shields.io/badge/PostgreSQL-pgvector_16-blue?logo=postgresql)](https://github.com/pgvector/pgvector)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Node_State-purple)](https://github.com/langchain-ai/langgraph)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

**Wise Wolves RAG** is an enterprise-grade, document-bounded Retrieval-Augmented Generation (RAG) system engineered to eliminate AI hallucinations with mathematical certainty. Built upon a **fail-closed relevance gatekeeper**, strict HNSW cosine vector search, hybrid retrieval, and real-time Server-Sent Events (SSE) token streaming.

---

## 🌟 Key Capabilities

1. **Fail-Closed Hallucination Barrier**: If retrieved document chunks do not surpass calibrated similarity thresholds, the system halts generation and explicitly reports insufficient grounding rather than fabricating answers.
2. **Multi-Document Dynamic Scoping**: User-selected file isolation allows queries to target specific corporate policies, financial records, or technical documentation.
3. **Multi-Modal Visual Provenance**: Extracts images, diagrams, and tables embedded directly in PDFs, displaying high-resolution visual citations with page, section, and caption context.
4. **Stateful Conversation History**: Persistent thread storage in PostgreSQL with guest mode privacy protection.
5. **Fluid Enterprise UI/UX**: React 19 single-page application with responsive light/dark design token palettes, mobile drawer architecture, live search step indicators, and interactive source inspection drawers.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Interface (React 19 + TypeScript)"]
        UI[Enterprise Notebook UI]
        SSE[SSE Token Consumer]
        Drawers[Citations & Inspection Drawers]
    end

    subgraph Backend ["FastAPI + LangGraph Orchestrator"]
        API[REST & Streaming Endpoints]
        Router[Query Intent & Routing Node]
        Gate[Relevance Gatekeeper Node]
        Gen[Strict Grounded Generator Node]
        Verifier[Provenance Citation Verifier]
    end

    subgraph Storage ["Enterprise Vector Database"]
        PG[(PostgreSQL 16 + pgvector)]
        HNSW[HNSW Vector Index / 768-dim]
        BM25[Full-Text Search BM25 Index]
        Threads[Thread & Message Repository]
        Images[Document Image Repository]
    end

    UI -->|Query + Active Doc Scope| API
    API --> Router
    Router -->|Hybrid Retrieval| PG
    PG --> HNSW
    PG --> BM25
    HNSW --> Gate
    Gate -->|Threshold >= 0.25| Gen
    Gate -->|Threshold < 0.25| Verifier
    Gen -->|Token Streaming SSE| SSE
    SSE --> UI
    Drawers <-->|Inspect Document Source| API
```

---

## 👥 Core Creators & Architects

| Architect | Role & Contributions | Profiles |
| :--- | :--- | :--- |
| **Raghaw Shukla** | **AI Systems Engineer & Backend / ML Architect**<br>• Asynchronous FastAPI service & LangGraph multi-node state graph.<br>• PostgreSQL pgvector HNSW indexing & OpenRouter semantic embeddings.<br>• Document ingestion pipeline with visual diagram extraction & fail-closed relevance gates. | [![GitHub](https://img.shields.io/badge/GitHub-raghawshukla-black?logo=github)](https://github.com/PyRaghaw) [![LinkedIn](https://img.shields.io/badge/LinkedIn-raghaw--shukla-0077B5?logo=linkedin)](https://linkedin.com/in/raghaw-shukla) |
| **Srinjoyee Dey** | **Lead Frontend Architect & Full-Stack Contributor**<br>• Complete frontend engineering from scratch with React 19 & TypeScript.<br>• Real-time SSE token streaming, responsive mobile drawer workspace & bespoke design system.<br>• Full-stack collaboration on backend API endpoints and schema integration. | [![LinkedIn](https://img.shields.io/badge/LinkedIn-srinjoyee--dey-0077B5?logo=linkedin)](https://www.linkedin.com/in/srinjoyee-dey/) |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (or local PostgreSQL 16 with pgvector)

### 1. Launch with Docker Compose (Fastest)

```bash
# Clone the repository
git clone https://github.com/PyRaghaw/rag_system.git
cd rag_system

# Copy environment template
cp backend/.env.example backend/.env
# (Add your OPENROUTER_API_KEY in backend/.env)

# Spin up Database, Backend, and Frontend
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`

---

### 2. Manual Local Development

#### A. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Fill in OPENROUTER_API_KEY, DATABASE_URL, etc.

# Run database initialization
python scripts/init_db.py

# Launch FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### B. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Configure environment
cp .env.example .env

# Launch Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing

Run backend tests for database persistence, strict grounding, and routing:
```bash
cd backend
pytest tests/ -v
```

Run frontend build verification:
```bash
cd frontend
npm run build
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
