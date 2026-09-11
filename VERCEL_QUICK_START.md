# 🚀 Vercel 1-Click Deployment Guide (Wise Wolves RAG)

This repository is pre-configured to deploy the **Full-Stack Application** (React 19 Frontend + FastAPI Serverless Backend) directly to **Vercel** in just 1 click.

---

## ⚠️ Important Note About PostgreSQL

> **Vercel is a serverless platform.** It does not run a local PostgreSQL daemon (`localhost:5432`). 
> Therefore, you need a cloud-hosted PostgreSQL database with `pgvector` enabled.
> 
> **Good news:** Setting up a free cloud database takes **30 seconds** and requires **ZERO migrations** (the app automatically runs `CREATE EXTENSION IF NOT EXISTS vector;` and creates all tables on startup!).

---

## 🛠️ Step-by-Step Setup

### Step 1: Push Code to GitHub
Push your latest changes to GitHub:
```bash
git add .
git commit -m "Configure 1-click Vercel full-stack deployment"
git push origin main
```

---

### Step 2: Get a Free Cloud PostgreSQL Database (Pick ONE)

#### Option A: Vercel Postgres / Neon (Built into Vercel - Recommended)
1. Go to your project on the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **Storage** tab at the top.
3. Click **Create Database** → Select **Postgres (Neon)**.
4. Click **Create & Connect to Project**.
5. *Done! Vercel automatically injects `POSTGRES_URL` into your environment variables. You don't need to copy anything.*

#### Option B: Neon.tech (100% Free Forever)
1. Go to [neon.tech](https://neon.tech) and sign in with GitHub.
2. Click **Create Project** (e.g., `rag-system-db`).
3. Under **Dashboard**, copy your connection string (format: `postgres://...@ep-xyz.neon.tech/neondb?sslmode=require`).
4. In Vercel → Project Settings → **Environment Variables**, add:
   - **Key**: `DATABASE_URL`
   - **Value**: *(Your copied connection string)*

#### Option C: Supabase (100% Free)
1. Go to [supabase.com](https://supabase.com) and create a project.
2. Go to **Settings** → **Database** → Copy the **URI** connection string.
3. Add it to Vercel as `DATABASE_URL`.

---

### Step 3: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository: `https://github.com/PyRaghaw/rag_system`.
3. Keep default settings:
   - **Root Directory**: `./` (Leave as root)
   - **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build` *(Pre-configured in vercel.json)*
   - **Output Directory**: `frontend/dist` *(Pre-configured in vercel.json)*
4. Under **Environment Variables**, add:
   | Variable | Value | Description |
   |---|---|---|
   | `OPENROUTER_API_KEY` | `sk-or-v1-...` | Your OpenRouter API key |
   | `DATABASE_URL` | `postgres://...` | *(Only if using Option B or C above)* |
   | `EMBEDDING_PROVIDER` | `openrouter` | Embeddings provider (`openrouter` or `gemini`) |
   | `LLM_PROVIDER` | `openrouter` | LLM provider |
   | `GEMINI_API_KEY` | *(optional)* | If using Gemini models |
5. Click **Deploy**! 🚀

---

## 🔍 How It Works

- **Static Frontend**: Vercel serves the compiled React 19 + Tailwind/Lucide bundle on its ultra-fast global Edge CDN.
- **Serverless API**: Requests to `/api/*` are automatically handled by the `@vercel/python` serverless function in `api/index.py`.
- **Automatic DB Migration**: When the serverless function spins up, it automatically executes:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
  and synchronizes all document chunks, chat history, and metadata tables without any manual script.
- **CORS & Environment**: Pre-configured to allow cross-origin requests and support both local development and cloud URLs without code modifications.

---

## 🧪 Testing with Real Users

Once deployed:
1. Copy your Vercel URL (e.g., `https://rag-system-phi.vercel.app`).
2. Share the link with your users or testers.
3. Users can:
   - Upload PDF, Word, PPT, Excel, or Markdown files.
   - Extract visual diagrams, charts, and tables.
   - Ask questions with strict document grounding and instant source citations.
