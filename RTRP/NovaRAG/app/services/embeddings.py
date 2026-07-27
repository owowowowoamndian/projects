import time
import logging
from typing import List
import httpx
from langchain_core.embeddings import Embeddings

logger = logging.getLogger(__name__)


class ResilientHFEmbeddings(Embeddings):
    """HuggingFace Inference API embeddings with retry logic and batching."""

    def __init__(self, api_key: str):
        self.api_url = (
            "https://api-inference.huggingface.co/pipeline/feature-extraction/"
            "sentence-transformers/all-MiniLM-L6-v2"
        )
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self._dimension = 384

    def _embed(self, inputs: List[str]) -> List[List[float]]:
        for attempt in range(5):
            try:
                with httpx.Client(timeout=30) as client:
                    resp = client.post(
                        self.api_url,
                        headers=self.headers,
                        json={"inputs": inputs}
                    )
                    data = resp.json()

                    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                        return data

                    if isinstance(data, dict):
                        if "estimated_time" in data:
                            wait = min(float(data["estimated_time"]), 15)
                            logger.info(f"HF model loading, waiting {wait:.1f}s (attempt {attempt+1})")
                            time.sleep(wait)
                            continue
                        if "error" in data:
                            logger.warning(f"HF API error: {data['error']}")
                            time.sleep(2)
                            continue
            except Exception as e:
                logger.error(f"Embedding attempt {attempt+1} failed: {e}")
                time.sleep(2)

        logger.error("❌ ALL EMBEDDING ATTEMPTS FAILED — returning zero vectors. "
                     "Pinecone queries with zero vectors will return no useful matches!")
        print(f"[EMBEDDING CRITICAL] All 5 attempts failed for inputs: "
              f"{[t[:60] + '...' if len(t) > 60 else t for t in inputs]}")
        return [[0.0] * self._dimension for _ in range(len(inputs))]

    def is_zero_vector(self, vector: list) -> bool:
        """Check if a vector is all zeros (embedding failure fallback)."""
        return all(v == 0.0 for v in vector)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        all_embeddings = []
        for i in range(0, len(texts), 32):
            batch = texts[i:i + 32]
            all_embeddings.extend(self._embed(batch))
        return all_embeddings

    def embed_query(self, text: str) -> List[float]:
        return self._embed([text])[0]
