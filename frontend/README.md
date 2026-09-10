# 🐺 Wise Wolves RAG — Frontend Client

A responsive enterprise web application engineered with **React 19**, **TypeScript**, **Vite**, and **TailwindCSS**.

---

## 🌟 Features
- **Real-Time Token Streaming**: Consumes Server-Sent Events (SSE) from the FastAPI backend with incremental markdown rendering.
- **Strict Citation Inspection**: Interactive citations in messages open source inspection drawers displaying exact text snippets, page numbers, and confidence metrics.
- **Embedded Document Diagrams**: Multi-modal visual preview with image lightbox modal for inspecting figures extracted from PDFs.
- **Dynamic Mobile Workspace**: Mobile drawer architecture enabling full-width chat and collapsible drawers on mobile/tablet screens.
- **Bespoke Theme System**: Harmonious light and dark modes with persisted user preference.

---

## 🚀 Setup & Run

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default backend endpoint is `http://localhost:8000`.

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```
