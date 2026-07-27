from fastapi import APIRouter
from app.config import settings
from app.session_manager import session_manager

router = APIRouter(tags=["Health"])


@router.get("/")
async def root():
    return {
        "app": "NovaRAG API",
        "version": "2.0.0",
        "model": settings.PRIMARY_MODEL,
        "docs": "/docs",
    }


@router.get("/health")
async def health_check():
    """Health check for monitoring and Render keep-alive."""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "model": settings.PRIMARY_MODEL,
        "active_sessions": session_manager.active_count,
        "services": {
            "groq": "ok" if settings.GROQ_API_KEY else "missing",
            "pinecone": "ok" if settings.PINECONE_API_KEY else "missing",
            "huggingface": "ok" if settings.HF_TOKEN else "missing",
        },
    }
