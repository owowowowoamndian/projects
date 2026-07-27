import asyncio
import logging
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.config import settings
from app.auth import get_current_user
from app.rate_limiter import rate_limiter
from app.session_manager import session_manager
from app.models.schemas import ChatRequest

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Chat"])

# Set by app/main.py after initialization
rag_pipeline = None
llm_service = None


@router.post("/chat")
async def chat_endpoint(req: ChatRequest, request: Request):
    """Stream AI response with dual-RAG context and citation support."""

    # --- Auth & Rate Limit ---
    user = await get_current_user(request)
    limit = settings.RATE_LIMIT_AUTH if user["authenticated"] else settings.RATE_LIMIT_GUEST
    rate_limiter.check(f"chat:{user['uid']}", max_requests=limit, window=settings.RATE_WINDOW)

    try:
        user_query = req.message.strip()
        if not user_query:
            async def empty():
                yield "data: Please enter a message.\n\n"
                yield "data: [DONE]\n\n"
            return StreamingResponse(empty(), media_type="text/event-stream")

        # Get session data (local FAISS + CIF)
        session_data = session_manager.get(req.session_id)
        v_db = session_data["vector_db"]
        cif_data = session_data["cif_data"]

        # Build context from all RAG tiers (parallel)
        system_prompt = await rag_pipeline.build_context(
            user_query, v_db, cif_data, req.use_web
        )

        # Build message list
        safe_history = req.history[-settings.MAX_HISTORY:]
        messages = (
            [{"role": "system", "content": system_prompt}]
            + safe_history
            + [{"role": "user", "content": user_query}]
        )

        # Stream from Groq (70b primary, 8b fallback)
        stream = await llm_service.stream_chat(
            messages=messages,
            temperature=req.temperature,
            max_tokens=settings.MAX_TOKENS,
            model_mode=req.model_mode,
        )

        async def response_generator():
            try:
                async for chunk in stream:
                    if hasattr(chunk, "choices") and len(chunk.choices) > 0:
                        token = chunk.choices[0].delta.content
                        if token:
                            safe_token = token.replace("\n", "<br>")
                            yield f"data: {safe_token}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                logger.error(f"Stream error: {e}")
                yield f"data: **[Stream Error]** {str(e)}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(response_generator(), media_type="text/event-stream")

    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        safe_err = f"**[System Alert]** Error: {str(e)}".replace("\n", "<br>")

        async def error_gen():
            yield f"data: {safe_err}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(error_gen(), media_type="text/event-stream")
