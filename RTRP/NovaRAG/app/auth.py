import logging
from fastapi import Request

logger = logging.getLogger(__name__)


async def get_current_user(request: Request) -> dict:
    """Extract user identity from Firebase token or fall back to guest.

    How it works:
    - Frontend sends Firebase ID token in `Authorization: Bearer <token>` header
    - Backend verifies it using google-auth library
    - If valid → authenticated user with UID
    - If no token or invalid → guest user (identified by IP)
    """
    auth_header = request.headers.get("Authorization", "")

    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests
            from app.config import settings

            decoded = id_token.verify_firebase_token(
                token,
                google_requests.Request(),
                audience=settings.FIREBASE_PROJECT_ID,
            )
            return {
                "uid": decoded.get("sub", ""),
                "email": decoded.get("email", ""),
                "name": decoded.get("name", ""),
                "authenticated": True,
            }
        except ImportError:
            logger.warning("google-auth not installed — skipping token verification")
        except Exception as e:
            logger.debug(f"Token verification failed: {e}")

    # Guest user — identified by IP for rate limiting
    forwarded = request.headers.get("X-Forwarded-For", "")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (
        request.client.host if request.client else "unknown"
    )
    return {
        "uid": f"guest_{client_ip}",
        "email": None,
        "name": None,
        "authenticated": False,
    }
