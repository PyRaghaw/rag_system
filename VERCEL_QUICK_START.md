# Vercel Deployment - Quick Start

## 30-Second Setup

### For Frontend Only (Recommended)

1. **Go to Vercel**
   ```
   https://vercel.com/new
   ```

2. **Import Repository**
   - Connect GitHub
   - Select `rag_system`

3. **Configure**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output: `dist`

4. **Environment Variable**
   - Add `VITE_API_URL` = `https://your-backend.up.railway.app`

5. **Deploy**
   - Click "Deploy"
   - Done! 🎉

---

## Backend Setup (Railway)

1. Go to https://railway.app
2. New Project → GitHub repo
3. Add PostgreSQL service
4. Set `OPENROUTER_API_KEY`
5. Push to main
6. Deployed! ✅

---

## Connect Them

```
Frontend (Vercel) → Backend (Railway)
         ↓
  Set VITE_API_URL environment variable
```

That's it! Your RAG system is live. 🚀
