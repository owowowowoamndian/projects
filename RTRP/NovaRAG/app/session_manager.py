import time
import gc
import logging
from typing import Dict

logger = logging.getLogger(__name__)


class SessionManager:
    """In-memory session storage with TTL-based auto-cleanup.

    Each session holds:
    - vector_db: FAISS index for uploaded PDF (or None)
    - cif_data: raw CIF/TXT text (or "")
    - file_name: name of uploaded file
    - last_accessed: timestamp for TTL expiry
    """

    def __init__(self, ttl_seconds: int = 3600):
        self.sessions: Dict[str, dict] = {}
        self.ttl = ttl_seconds

    def get_or_create(self, session_id: str) -> dict:
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "vector_db": None,
                "cif_data": "",
                "file_name": None,
                "created_at": time.time(),
                "last_accessed": time.time(),
            }
        self.sessions[session_id]["last_accessed"] = time.time()
        return self.sessions[session_id]

    def get(self, session_id: str) -> dict:
        session = self.sessions.get(session_id)
        if session:
            session["last_accessed"] = time.time()
            return session
        return {"vector_db": None, "cif_data": "", "file_name": None}

    def delete(self, session_id: str):
        if session_id in self.sessions:
            s = self.sessions.pop(session_id)
            if s.get("vector_db"):
                del s["vector_db"]
            gc.collect()
            logger.info(f"Session {session_id[:8]}... deleted")

    def cleanup_expired(self) -> int:
        now = time.time()
        expired = [
            sid for sid, data in self.sessions.items()
            if now - data.get("last_accessed", 0) > self.ttl
        ]
        for sid in expired:
            self.delete(sid)
        if expired:
            gc.collect()
            logger.info(f"♻️ Cleaned {len(expired)} expired sessions")
        return len(expired)

    @property
    def active_count(self) -> int:
        return len(self.sessions)


session_manager = SessionManager()
