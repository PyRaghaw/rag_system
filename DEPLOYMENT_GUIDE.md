# Complete Deployment Guide for Rag_system

## Architecture Overview
- **Frontend**: React 19 + Vite → Deploy on Vercel
- **Backend**: FastAPI + LangGraph → Deploy on Railway.app
- **Database**: PostgreSQL 16 + pgvector → Railway.app

---

## STEP 1: Deploy Frontend to Vercel ✅

### Option A: Using Vercel Dashboard (Easiest)
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Connect your GitHub account
4. Select `PyRaghaw/rag_system`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_URL=https://your-railway-app-name.up.railway.app
```

---

## STEP 2: Deploy Backend to Railway.app ✅

### Prerequisites
- Railway.app account (free tier available)
- GitHub connected to Railway

### Deployment Steps

1. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your `rag_system` repo

2. **Add PostgreSQL Service**
   - In Railway dashboard, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Version: 16+
   - Railway auto-creates `DATABASE_URL`

3. **Configure Environment Variables**
   In Railway project settings, add:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ENVIRONMENT=production
   ```
   (Railway auto-generates `DATABASE_URL` from PostgreSQL service)

4. **Set Start Command**
   - In Railway settings, set:
   ```
   Start Command: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
   (Or use included `Procfile`)

5. **Deploy**
   - Push code to `main` branch
   - Railway auto-deploys!
   - Check logs in Railway dashboard

6. **Verify Backend**
   - Visit `https://your-railway-app.up.railway.app/docs`
   - Test API endpoints

---

## STEP 3: Connect Frontend to Backend

### Update Vercel Environment Variable
After Railway deployment, update Vercel:

1. Get your Railway backend URL from Railway dashboard
2. In Vercel Dashboard → Settings → Environment Variables
3. Update:
   ```
   VITE_API_URL=https://your-railway-app-name.up.railway.app
   ```
4. Redeploy: Click "Deployments" → Latest → "Redeploy"

---

## STEP 4: Initialize Database

### Run Database Setup
```bash
# Access Railway container shell
railway shell

# Run initialization script
python scripts/init_db.py
```

Or via Railway environment:
- Add custom service that runs `python scripts/init_db.py` once

---

## Testing Your Deployment

### Frontend
- Visit your Vercel URL (e.g., `https://rag-system.vercel.app`)
- Check console for API errors

### Backend
- Visit `https://your-railway-app.up.railway.app/docs`
- Test `/query` endpoint with sample request

### Full Integration
- Submit a query in frontend
- Should stream response from backend
- Check Railway logs for any errors

---

## Troubleshooting

### Frontend Build Fails
```bash
# Test locally
cd frontend
npm install
npm run build
```
Check for TypeScript errors or missing dependencies.

### Backend Deployment Issues
- Check Railway logs: Dashboard → Logs tab
- Verify `DATABASE_URL` format
- Ensure `OPENROUTER_API_KEY` is set

### API Connection Fails
- Verify `VITE_API_URL` in Vercel environment variables
- Check CORS in FastAPI backend:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://your-vercel-url.vercel.app"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- Redeploy both frontend and backend after changes

### Database Connection Issues
- Check PostgreSQL is running in Railway
- Verify `DATABASE_URL` format
- Test connection locally before deploying

---

## Environment Variables Summary

### Vercel (Frontend)
```
VITE_API_URL=https://your-railway-app.up.railway.app
```

### Railway (Backend)
```
OPENROUTER_API_KEY=your_key
DATABASE_URL=postgresql://...
ENVIRONMENT=production
```

---

## Cost Considerations

- **Vercel**: Free tier (80GB bandwidth/month)
- **Railway**: Free tier ($5/month credits, typically enough for small projects)
- **Database**: PostgreSQL on Railway uses free tier

---

## Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] PostgreSQL database initialized
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Backend API endpoints tested
- [ ] Frontend-Backend integration verified
- [ ] Error logging configured
- [ ] Database backups enabled

---

## Next Steps

1. Monitor logs in Vercel and Railway dashboards
2. Set up error tracking (e.g., Sentry)
3. Configure custom domain (optional)
4. Enable auto-scaling if needed
5. Add CI/CD checks for deployments
