#!/bin/bash
set -e

echo "🔨 Building Wise Wolves RAG - Multi-Service Deployment"
echo "========================================================"

# Build Frontend
echo ""
echo "📦 Building Frontend (React 19 + Vite)..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Frontend build complete"

# Install Backend Dependencies (Vercel will handle this, but we document it)
echo ""
echo "📦 Backend dependencies managed by Vercel (@vercel/python)"
echo "✅ Backend configuration ready"

echo ""
echo "🎉 Build complete! Ready for Vercel deployment"
