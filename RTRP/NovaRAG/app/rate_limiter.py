import time
import logging
from collections import defaultdict
from fastapi import HTTPException

logger = logging.getLogger(__name__)


class RateLimiter:
    """Simple in-memory rate limiter (no Redis needed — free tier friendly)."""

    def __init__(self):
        self.requests = defaultdict(list)

    def check(self, key: str, max_requests: int, window: int = 60):
        """Raise 429 if rate limit exceeded for the given key."""
        now = time.time()
        # Remove expired entries
        self.requests[key] = [t for t in self.requests[key] if now - t < window]

        if len(self.requests[key]) >= max_requests:
            logger.warning(f"Rate limit hit: {key}")
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded ({max_requests}/min). Please wait.",
            )
        self.requests[key].append(now)

    def cleanup(self, max_age: int = 300):
        """Periodically clean stale entries to prevent memory leaks."""
        now = time.time()
        stale_keys = [
            k for k, ts in self.requests.items()
            if all(now - t > max_age for t in ts)
        ]
        for k in stale_keys:
            del self.requests[k]


rate_limiter = RateLimiter()
