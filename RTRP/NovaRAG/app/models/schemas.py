from pydantic import BaseModel
from typing import List, Dict, Optional


class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: List[Dict[str, str]]
    use_web: bool = False
    temperature: float = 0.2
    model_mode: str = "quality"  # "quality" (70b) or "speed" (8b)


class UploadResponse(BaseModel):
    status: str
    message: str
    file_name: Optional[str] = None
    chunks_created: Optional[int] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    model: str
    active_sessions: int
    services: Dict[str, str]
