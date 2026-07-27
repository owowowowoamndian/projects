import logging
import asyncio
from duckduckgo_search import DDGS

logger = logging.getLogger(__name__)


class WebSearchService:
    """DuckDuckGo web + image search (free, no API key needed)."""

    @staticmethod
    async def search(query: str, max_results: int = 3) -> dict:
        result = {"texts": [], "images": []}
        try:
            def _do_search():
                with DDGS() as ddgs:
                    texts = list(ddgs.text(query, max_results=max_results))
                    images = list(ddgs.images(query, max_results=1))
                    return texts, images

            texts, images = await asyncio.to_thread(_do_search)

            result["texts"] = [
                {"title": r.get("title", ""), "body": r.get("body", ""),
                 "url": r.get("href", "")}
                for r in texts
            ]
            if images:
                result["images"] = [r.get("image", "") for r in images]

        except Exception as e:
            logger.warning(f"Web search error: {e}")

        return result
