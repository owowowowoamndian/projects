import uuid
import logging
import asyncio
from typing import List, Optional
from langchain_community.vectorstores import FAISS
from pinecone import Pinecone

logger = logging.getLogger(__name__)


class VectorStoreManager:
    """Manages dual-database architecture: Local FAISS + Global Pinecone."""

    def __init__(self, pinecone_api_key: str, index_name: str, embedder):
        self.embedder = embedder
        self.pinecone_index = None

        try:
            if pinecone_api_key:
                pc = Pinecone(api_key=pinecone_api_key)
                self.pinecone_index = pc.Index(index_name)
                logger.info("✅ Pinecone Global DB connected")
        except Exception as e:
            logger.warning(f"⚠️ Pinecone connection failed: {e}")

    def create_local_index(self, chunks: List[dict]) -> FAISS:
        """Create FAISS index from chunks with citation metadata."""
        texts = [c["text"] for c in chunks]
        metadatas = [{"page": c["page"], "source": c["source"]} for c in chunks]
        return FAISS.from_texts(texts, self.embedder, metadatas=metadatas)

    async def search_local(self, v_db: Optional[FAISS], query: str, k: int = 4) -> List[dict]:
        """Search local FAISS → [{text, page, source}]"""
        if not v_db:
            return []
        try:
            docs = await asyncio.to_thread(v_db.similarity_search, query, k=k)
            return [
                {
                    "text": doc.page_content,
                    "page": doc.metadata.get("page", "?"),
                    "source": doc.metadata.get("source", "uploaded file"),
                }
                for doc in docs
            ]
        except Exception as e:
            logger.error(f"Local FAISS search error: {e}")
            return []

    async def search_global(self, query_vector: list, k: int = 3) -> List[dict]:
        """Search Pinecone global KB → [{text, source, score}]"""
        if not self.pinecone_index:
            return []
        try:
            res = await asyncio.to_thread(
                self.pinecone_index.query,
                vector=query_vector, top_k=k, include_metadata=True
            )
            return [
                {
                    "text": m["metadata"].get("text", ""),
                    "source": m["metadata"].get("source", "Global KB"),
                    "page": m["metadata"].get("page", "N/A"),
                    "score": m.get("score", 0),
                }
                for m in res.get("matches", [])
            ]
        except Exception as e:
            logger.error(f"Pinecone search error: {e}")
            return []

    def push_to_global(self, chunks: List[dict]):
        """Upload chunks to Pinecone global knowledge base."""
        if not self.pinecone_index:
            raise ValueError("Pinecone not connected")

        texts = [c["text"] for c in chunks]
        embeddings = self.embedder.embed_documents(texts)

        payload = [
            (
                str(uuid.uuid4()),
                embeddings[i],
                {"text": c["text"], "source": c["source"], "page": c["page"]}
            )
            for i, c in enumerate(chunks)
        ]

        for i in range(0, len(payload), 100):
            self.pinecone_index.upsert(vectors=payload[i:i + 100])

        logger.info(f"📤 Pushed {len(payload)} vectors to Pinecone Global DB")
