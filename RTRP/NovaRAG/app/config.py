import os


class Settings:
    """All configuration from environment variables. No secrets in code."""

    def __init__(self):
        # --- API Keys (set these on Render dashboard) ---
        self.GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
        self.HF_TOKEN = os.environ.get("HF_TOKEN", "")
        self.PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY", "")

        # --- Firebase (for backend token verification) ---
        self.FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "novarag-69b41")

        # --- CORS: Only allow your Vercel domain ---
        origins_str = os.environ.get(
            "ALLOWED_ORIGINS",
            "https://nova-rag.vercel.app,http://localhost:5500,http://127.0.0.1:5500"
        )
        self.ALLOWED_ORIGINS = [o.strip() for o in origins_str.split(",")]

        # --- LLM Models ---
        self.PRIMARY_MODEL = "llama-3.3-70b-versatile"
        self.FALLBACK_MODEL = "llama-3.1-8b-instant"

        # --- Limits ---
        self.MAX_FILE_SIZE_MB = 15
        self.MAX_TEXT_LENGTH = 60000
        self.MAX_TOKENS = 4096
        self.MAX_HISTORY = 10
        self.CHUNK_SIZE = 800
        self.CHUNK_OVERLAP = 200

        # --- Session ---
        self.SESSION_TTL_SECONDS = 3600  # 1 hour

        # --- Rate Limiting ---
        self.RATE_LIMIT_GUEST = 8       # requests per minute
        self.RATE_LIMIT_AUTH = 20       # requests per minute
        self.RATE_WINDOW = 60           # seconds

        # --- Pinecone ---
        self.PINECONE_INDEX_NAME = "novarag-global"


settings = Settings()
