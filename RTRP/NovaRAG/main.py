"""
NovaRAG v2.0 — Entry point for Render deployment.

Start command (Render): uvicorn main:app --host 0.0.0.0 --port $PORT
"""
from app.main import app  # noqa: F401