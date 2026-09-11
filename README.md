Wise Wolves RAG — Enterprise Knowledge Assistant

Wise Wolves RAG is a document-grounded Retrieval-Augmented Generation (RAG) system designed to provide reliable, context-aware answers from enterprise documents. The system combines vector search, hybrid retrieval, relevance validation, and grounded response generation to minimize unsupported answers.

Key Features

- Strict Grounding: Prevents response generation when sufficient document context is unavailable.
- Document-Level Scoping: Queries can be restricted to selected documents.
- Hybrid Retrieval: Combines vector similarity search with full-text search.
- Visual Document Support: Extracts and references images, diagrams, and tables from PDFs.
- Conversation History: Maintains persistent conversation threads using PostgreSQL.
- Real-Time Responses: Supports token streaming through Server-Sent Events (SSE).
- Enterprise UI: Responsive React-based interface with source inspection and light/dark modes.

Technology Stack

Layer| Technologies
Frontend| React 19, TypeScript, Tailwind CSS
Backend| FastAPI, Python
AI / Orchestration| LangGraph, OpenRouter
Database| PostgreSQL 16, pgvector
Retrieval| HNSW Vector Search, Full-Text Search
Communication| REST API, Server-Sent Events
Deployment| Docker, Docker Compose

System Architecture

flowchart TD
    UI[React Frontend] --> API[FastAPI Backend]
    API --> Router[Query Router]
    Router --> DB[(PostgreSQL + pgvector)]
    DB --> Vector[Vector Search]
    DB --> Text[Full-Text Search]
    Vector --> Gate[Relevance Gate]
    Text --> Gate
    Gate --> Gen[Grounded Generator]
    Gen --> SSE[SSE Streaming]
    SSE --> UI

Project Structure

rag_system/
├── backend/
│   ├── app/
│   ├── scripts/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
├── docker-compose.yml
└── README.md

Getting Started

Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- OpenRouter API Key

Docker Setup

git clone https://github.com/PyRaghaw/rag_system.git
cd rag_system

cp backend/.env.example backend/.env

Add the required environment variables, then run:

docker-compose up --build

The application will be available at:

Frontend:  http://localhost:5173
Backend:   http://localhost:8000
API Docs:  http://localhost:8000/docs

Local Development

Backend

cd backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

python scripts/init_db.py
uvicorn app.main:app --reload

Frontend

cd frontend

npm install
cp .env.example .env

npm run dev

Testing

Backend:

cd backend
pytest tests/ -v

Frontend:

cd frontend
npm run build

License

This project is licensed under the MIT License.