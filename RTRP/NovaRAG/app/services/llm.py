import logging
import json
from groq import AsyncGroq

logger = logging.getLogger(__name__)


class LLMService:
    """Groq LLM with automatic model fallback (70b → 8b)."""

    def __init__(self, api_key: str, primary_model: str, fallback_model: str):
        self.api_key = api_key
        self.primary_model = primary_model
        self.fallback_model = fallback_model
        self._client = None

    @property
    def client(self) -> AsyncGroq:
        if self._client is None:
            self._client = AsyncGroq(api_key=self.api_key)
        return self._client

    async def stream_chat(self, messages: list, temperature: float = 0.2,
                          max_tokens: int = 4096, model_mode: str = "quality"):
        """Stream response. Falls back to 8b if 70b fails (rate limit, etc.)."""
        model = self.primary_model if model_mode == "quality" else self.fallback_model

        try:
            return await self._create_stream(model, messages, temperature, max_tokens)
        except Exception as e:
            if model == self.primary_model:
                logger.warning(f"70b failed ({e}), falling back to 8b")
                try:
                    return await self._create_stream(
                        self.fallback_model, messages, temperature, max_tokens
                    )
                except Exception as e2:
                    logger.error(f"Fallback 8b also failed: {e2}")
                    raise
            raise

    async def _create_stream(self, model, messages, temperature, max_tokens):
        logger.info(f"Streaming with model: {model}")
        return await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

    async def complete_chat(
        self,
        messages: list,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        model_mode: str = "quality",
    ) -> str:
        """Return a complete Groq response using the same model fallback as chat."""
        model = self.primary_model if model_mode == "quality" else self.fallback_model

        try:
            return await self._create_completion(model, messages, temperature, max_tokens)
        except Exception as e:
            if model == self.primary_model:
                logger.warning(f"70b completion failed ({e}), falling back to 8b")
                return await self._create_completion(
                    self.fallback_model, messages, temperature, max_tokens
                )
            raise

    async def complete_json(
        self,
        messages: list,
        temperature: float = 0.1,
        max_tokens: int = 1024,
        model_mode: str = "speed",
    ):
        """Return parsed JSON from Groq, tolerating fenced JSON responses."""
        text = await self.complete_chat(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            model_mode=model_mode,
        )
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
        start = min([i for i in [cleaned.find("{"), cleaned.find("[")] if i != -1], default=0)
        end = max(cleaned.rfind("}"), cleaned.rfind("]"))
        if end > start:
            cleaned = cleaned[start:end + 1]
        return json.loads(cleaned)

    async def _create_completion(self, model, messages, temperature, max_tokens):
        logger.info(f"Completing with model: {model}")
        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=False,
        )
        return response.choices[0].message.content or ""
