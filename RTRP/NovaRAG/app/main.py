import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.session_manager import session_manager
from app.rate_limiter import rate_limiter

# --- Services ---
from app.services.embeddings import ResilientHFEmbeddings
from app.services.file_parser import FileParser
from app.services.vector_store import VectorStoreManager
from app.services.llm import LLMService
from app.services.rag_pipeline import RAGPipeline

# --- Routers ---
from app.routers import health as health_router
from app.routers import upload as upload_router
from app.routers import chat as chat_router
from app.routers import research as research_router

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ============================================================
# Background task: session cleanup + rate limiter cleanup
# ============================================================
async def periodic_cleanup():
    """Runs every 10 minutes to wipe expired sessions and stale rate-limit entries."""
    while True:
        await asyncio.sleep(600)
        try:
            session_manager.cleanup_expired()
            rate_limiter.cleanup()
            logger.info(f"Active sessions: {session_manager.active_count}")
        except Exception as e:
            logger.error(f"Cleanup error: {e}")


# ============================================================
# App lifespan: initialize services on startup
# ============================================================
@asynccontextmanager
async def lifespan(application: FastAPI):
    logger.info("=" * 60)
    logger.info("🚀 NovaRAG v2.0 — Starting up")
    logger.info(f"   Primary model : {settings.PRIMARY_MODEL}")
    logger.info(f"   Fallback model: {settings.FALLBACK_MODEL}")
    logger.info(f"   CORS origins  : {settings.ALLOWED_ORIGINS}")
    logger.info("=" * 60)

    # Initialize shared services
    embedder = ResilientHFEmbeddings(api_key=settings.HF_TOKEN)
    file_parser = FileParser(
        max_text_length=settings.MAX_TEXT_LENGTH,
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
    )
    vector_store = VectorStoreManager(
        pinecone_api_key=settings.PINECONE_API_KEY,
        index_name=settings.PINECONE_INDEX_NAME,
        embedder=embedder,
    )
    llm_service = LLMService(
        api_key=settings.GROQ_API_KEY,
        primary_model=settings.PRIMARY_MODEL,
        fallback_model=settings.FALLBACK_MODEL,
    )
    rag_pipeline = RAGPipeline(embedder=embedder, vector_store=vector_store)

    # Inject services into routers
    upload_router.file_parser = file_parser
    upload_router.vector_store = vector_store
    upload_router.embedder = embedder
    chat_router.rag_pipeline = rag_pipeline
    chat_router.llm_service = llm_service
    research_router.rag_pipeline = rag_pipeline
    research_router.llm_service = llm_service

    # Start background cleanup task
    cleanup_task = asyncio.create_task(periodic_cleanup())

    logger.info("✅ All services initialized")
    yield

    # Shutdown
    cleanup_task.cancel()
    logger.info("🛑 NovaRAG shutting down")


# ============================================================
# Create the FastAPI application
# ============================================================
app = FastAPI(
    title="NovaRAG API",
    version="2.0.0",
    description="Enterprise Material Science AI — Dual RAG System",
    lifespan=lifespan,
)

# --- CORS: origins locked to your domain, methods/headers open for preflight ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register routers ---
app.include_router(health_router.router)
app.include_router(upload_router.router)
app.include_router(chat_router.router)
app.include_router(research_router.router)


@app.get("/")
async def serve_frontend():
    return FileResponse("index.html")
