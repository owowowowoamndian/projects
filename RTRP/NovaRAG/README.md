# 🌌 NovaRAG v2.0 — Material Science AI Assistant

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-f55036)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000)
![Firebase](https://img.shields.io/badge/Firebase-Auth_%7C_Cloud_Sync-FFCA28)

**NovaRAG** is a secure, citation-backed AI chat application for Material Science researchers.

Standard AI models hallucinate numbers for complex scientific data. NovaRAG solves this with a **Dual-RAG architecture** — users upload their own research PDFs and `.cif` files, and the AI cites every answer back to exact page numbers.

🔗 **[Live Deployment](https://nova-rag.vercel.app)** — Login with Google for cloud workspaces

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Dual-RAG System** | Local FAISS (private) + Global Pinecone (shared knowledge base) |
| **Citation Tracking** | Every answer cites `[Source: filename, Page X]` |
| **Llama 3.3 70B** | Primary model for best accuracy, 8B fallback for speed |
| **Model Selector** | Toggle between 🧠 Quality (70B) and ⚡ Speed (8B) modes |
| **Firebase Auth** | Google login with backend token verification |
| **Cloud Sync** | Chat history synced via Firestore across devices |
| **Rate Limiting** | Per-user rate limiting (guest: 8/min, auth: 20/min) |
| **Session TTL** | Auto-cleanup of expired sessions every 10 minutes |
| **Web Search** | Toggle live DuckDuckGo search for current data |
| **Streaming** | Real-time token-by-token response streaming |
| **Export** | Download chat as Markdown |

---

## 🏗️ Architecture

```
Frontend (Vercel)          Backend (Render)
┌──────────────┐          ┌──────────────────────────┐
│  index.html  │──HTTP──▶ │  FastAPI (main:app)       │
│  Firebase JS │          │  ├─ /health               │
│  Tailwind    │          │  ├─ /upload → FileParser   │
└──────────────┘          │  ├─ /chat   → RAGPipeline  │
                          │  │   ├─ FAISS (local/temp)  │
                          │  │   ├─ Pinecone (global)   │
                          │  │   ├─ WebSearch (DDG)     │
                          │  │   └─ Groq LLM (70B/8B)   │
                          │  └─ Auth + RateLimiter      │
                          └──────────────────────────┘
```

---

## 💻 Run Locally

```bash
git clone https://github.com/ranaprathapreddy597/NovaRAG
cd NovaRAG

python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file (or set environment variables):
```
GROQ_API_KEY=your_groq_key
HF_TOKEN=your_huggingface_token
PINECONE_API_KEY=your_pinecone_key
```

Start the server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Open `index.html` in a browser (or serve with Live Server on port 5500).

---

## 🚀 Deploy to Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Set **Environment Variables**:

| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | Your Groq API key |
| `HF_TOKEN` | Your HuggingFace token |
| `PINECONE_API_KEY` | Your Pinecone API key |
| `ALLOWED_ORIGINS` | `https://nova-rag.vercel.app` |
| `FIREBASE_PROJECT_ID` | `novarag-69b41` |

---

## 📁 Project Structure

```
NovaRAG/
├── main.py                    # Entry point (imports from app/)
├── index.html                 # Frontend (deployed to Vercel)
├── logo.png                   # App icon
├── manifest.json              # PWA manifest
├── requirements.txt
├── app/
│   ├── main.py                # FastAPI app, middleware, lifespan
│   ├── config.py              # Settings from env vars
│   ├── auth.py                # Firebase token verification
│   ├── rate_limiter.py        # In-memory rate limiter
│   ├── session_manager.py     # Session TTL management
│   ├── models/
│   │   └── schemas.py         # Pydantic request/response models
│   ├── routers/
│   │   ├── health.py          # /health endpoint
│   │   ├── upload.py          # /upload endpoint
│   │   └── chat.py            # /chat endpoint (streaming)
│   └── services/
│       ├── embeddings.py      # HuggingFace cloud embeddings
│       ├── file_parser.py     # PDF/CIF parsing with citations
│       ├── vector_store.py    # FAISS + Pinecone dual store
│       ├── web_search.py      # DuckDuckGo search
│       ├── llm.py             # Groq LLM with fallback
│       └── rag_pipeline.py    # RAG orchestration
└── .gitignore
```

---

## 👨‍💻 Built By

**Rana Prathap Reddy Jeedipally**
Computer Science & Engineering Student
Full-Stack Development · Practical AI Solutions

📧 ranaprathapreddyj@gmail.com