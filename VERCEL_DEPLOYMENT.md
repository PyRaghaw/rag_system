# Vercel Frontend Deployment Guide

## Quick Start

### 1. Connect to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

Or manually:
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select `frontend` as root directory
4. Set build command: `npm run build`
5. Set output directory: `dist`

### 2. Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### 3. Deploy
Push to `main` branch - Vercel auto-deploys!

## Troubleshooting

**Build fails:**
- Check Node version: `node --version` (should be 18+)
- Verify build locally: `cd frontend && npm run build`
- Check logs in Vercel dashboard

**API requests fail:**
- Ensure `VITE_API_URL` is set in environment variables
- Verify backend is running and accessible
- Check CORS settings in backend (FastAPI)

**Environment variables not loading:**
- Rebuild after adding variables: `vercel --prod`
- Clear cache: `vercel env pull`
