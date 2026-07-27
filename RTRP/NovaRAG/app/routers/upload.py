import gc
import logging
from fastapi import APIRouter, UploadFile, File, Form, Request
from app.config import settings
from app.auth import get_current_user
from app.rate_limiter import rate_limiter
from app.session_manager import session_manager

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Upload"])

# These are set by app/main.py after initialization
file_parser = None
vector_store = None
embedder = None


@router.post("/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    session_id: str = Form(...),
    global_opt_in: str = Form("false"),
):
    """Upload PDF, CIF, or TXT files to your secure workspace."""

    # --- Auth & Rate Limit ---
    user = await get_current_user(request)
    limit = settings.RATE_LIMIT_AUTH if user["authenticated"] else settings.RATE_LIMIT_GUEST
    rate_limiter.check(f"upload:{user['uid']}", max_requests=limit, window=settings.RATE_WINDOW)

    if not session_id:
        return {"status": "error", "message": "Session ID is required."}

    try:
        filename = file.filename.lower()
        file_content = await file.read()
        is_global = global_opt_in.lower() == "true"

        # Size check
        if len(file_content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            del file_content
            return {"status": "error", "message": f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit."}

        session = session_manager.get_or_create(session_id)

        # --- PDF Processing ---
        if filename.endswith(".pdf"):
            session["cif_data"] = ""
            chunks = file_parser.parse_pdf(file_content, file.filename)
            del file_content
            gc.collect()

            if not chunks:
                return {"status": "error", "message": "No text could be extracted from this PDF."}

            # Build local FAISS index with citation metadata
            session["vector_db"] = vector_store.create_local_index(chunks)
            session["file_name"] = file.filename
            message = f"✅ Secured locally — {len(chunks)} text segments indexed with page citations."

            # Optionally push to global DB
            if is_global and vector_store.pinecone_index:
                try:
                    vector_store.push_to_global(chunks)
                    message = f"✅ Indexed locally AND pushed to Global DB — {len(chunks)} segments."
                except Exception as e:
                    logger.error(f"Global push failed: {e}")
                    message += " (Global push failed, local index still active.)"

            return {
                "status": "success",
                "message": message,
                "file_name": file.filename,
                "chunks_created": len(chunks),
            }

        # --- CIF / TXT Processing ---
        elif filename.endswith(".cif") or filename.endswith(".txt"):
            session["vector_db"] = None
            session["cif_data"] = file_parser.parse_cif(file_content)
            session["file_name"] = file.filename
            del file_content
            gc.collect()
            return {
                "status": "success",
                "message": "✅ Structural data isolated in secure workspace.",
                "file_name": file.filename,
            }

        else:
            return {"status": "error", "message": "Unsupported format. Use PDF, CIF, or TXT."}

    except ValueError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        logger.error(f"Upload error: {e}", exc_info=True)
        return {"status": "error", "message": f"Processing error: {str(e)}"}
