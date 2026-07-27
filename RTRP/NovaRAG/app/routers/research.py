import asyncio
import json
import logging
import re
import time
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.config import settings
from app.rate_limiter import rate_limiter
from app.session_manager import session_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/research", tags=["Research"])

# Set by app/main.py after initialization.
rag_pipeline = None
llm_service = None


class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=2000)
    session_id: str
    depth: str = "standard"
    use_web: bool = True
    model_mode: str = "quality"


def _event(event_type: str, content, phase: str | None = None) -> str:
    payload = {
        "type": event_type,
        "content": content,
        "phase": phase,
        "timestamp": time.time(),
    }
    return f"data: {json.dumps(payload)}\n\n"


def _fallback_subqueries(query: str, depth: str) -> list[str]:
    max_queries = 5 if depth == "deep" else 3
    pieces = [
        query,
        f"{query} material properties mechanisms",
        f"{query} synthesis characterization applications",
        f"{query} limitations stability comparative studies",
        f"{query} recent advances citations",
    ]
    return pieces[:max_queries]


def _normalize_subqueries(raw, query: str, depth: str) -> list[str]:
    max_queries = 5 if depth == "deep" else 3
    values = []

    if isinstance(raw, dict):
        for key in ("queries", "sub_queries", "search_queries"):
            if isinstance(raw.get(key), list):
                values = raw[key]
                break
    elif isinstance(raw, list):
        values = raw

    normalized = []
    for item in values:
        if isinstance(item, dict):
            item = item.get("query") or item.get("text") or ""
        text = str(item).strip()
        if len(text) >= 3 and text not in normalized:
            normalized.append(text)

    return normalized[:max_queries] or _fallback_subqueries(query, depth)


def _extract_sources_from_context(context: str) -> list[dict]:
    source_pattern = re.compile(r"\[Source:\s*(.*?),\s*Page\s*(.*?)\]", re.IGNORECASE)
    seen = set()
    sources = []
    for source, page in source_pattern.findall(context):
        key = (source.strip(), str(page).strip())
        if key in seen:
            continue
        seen.add(key)
        sources.append({"source": key[0], "page": key[1]})
    return sources


@router.post("/stream")
async def research_stream(req: ResearchRequest, request: Request):
    """Stream an Auto-Scholar report using NovaRAG1's real RAG and Groq stack."""
    user = await get_current_user(request)
    limit = settings.RATE_LIMIT_AUTH if user["authenticated"] else settings.RATE_LIMIT_GUEST
    rate_limiter.check(f"research:{user['uid']}", max_requests=limit, window=settings.RATE_WINDOW)

    async def generate():
        try:
            query = req.query.strip()
            depth = req.depth if req.depth in {"standard", "deep"} else "standard"
            max_queries = 5 if depth == "deep" else 3
            session_data = session_manager.get(req.session_id)
            v_db = session_data["vector_db"]
            cif_data = session_data["cif_data"]

            yield _event("thought", f"Starting Nova Auto-Scholar for: {query}")
            yield _event("phase", {"name": "planning", "state": "running"}, "planning")

            planning_messages = [
                {
                    "role": "system",
                    "content": (
                        "You decompose material-science research questions into precise retrieval queries. "
                        "Return JSON only: {\"queries\":[\"...\"]}. No prose."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Create {max_queries} retrieval queries for this research request:\n{query}"
                    ),
                },
            ]

            try:
                raw_plan = await llm_service.complete_json(
                    planning_messages,
                    temperature=0.1,
                    max_tokens=900,
                    model_mode="speed",
                )
                subqueries = _normalize_subqueries(raw_plan, query, depth)
            except Exception as exc:
                logger.warning("Research planning fallback used: %s", exc)
                subqueries = _fallback_subqueries(query, depth)

            for subquery in subqueries:
                yield _event("thought", f"Sub-query: {subquery}", "planning")
            yield _event(
                "phase",
                {"name": "planning", "state": "completed", "count": len(subqueries)},
                "planning",
            )

            if await request.is_disconnected():
                return

            yield _event("phase", {"name": "gathering", "state": "running"}, "gathering")
            gather_tasks = [
                rag_pipeline.build_context(subquery, v_db, cif_data, req.use_web)
                for subquery in subqueries
            ]
            contexts = await asyncio.gather(*gather_tasks, return_exceptions=True)

            valid_contexts = []
            all_sources = []
            for subquery, context in zip(subqueries, contexts):
                if isinstance(context, Exception):
                    logger.warning("Research gather failed for '%s': %s", subquery, context)
                    yield _event("thought", f"No usable retrieval results for: {subquery}", "gathering")
                    continue
                valid_contexts.append((subquery, context))
                all_sources.extend(_extract_sources_from_context(context))
                yield _event("thought", f"Retrieved context for: {subquery}", "gathering")

            source_count = len({(s["source"], s["page"]) for s in all_sources})
            yield _event(
                "phase",
                {"name": "gathering", "state": "completed", "sources": source_count},
                "gathering",
            )

            if await request.is_disconnected():
                return

            yield _event("phase", {"name": "synthesis", "state": "running"}, "synthesis")
            context_blocks = "\n\n".join(
                f"## Retrieval Query\n{subquery}\n\n{context}"
                for subquery, context in valid_contexts
            )

            depth_instruction = (
                "Write a comprehensive, publication-grade deep research report. "
                "Include extensive analysis, cross-referencing between sources, critical evaluation of evidence, "
                "and detailed discussion of mechanisms, limitations, and future directions. "
                "Aim for thoroughness — this should read like a professional review paper."
            ) if depth == "deep" else (
                "Write a focused, well-structured research summary. "
                "Cover the key findings, properties, and applications concisely but rigorously."
            )

            synthesis_system = (
                "You are Nova Auto-Scholar, an expert material-science research analyst producing professional "
                "research documents. Your reports must be rigorous, well-structured, and publication-quality.\n\n"
                "DOCUMENT STRUCTURE (use these exact Markdown headings):\n"
                "# [Research Title — descriptive, specific to the query]\n\n"
                "## Abstract\n"
                "A concise 150-250 word overview of the research findings, key results, and significance.\n\n"
                "## 1. Introduction\n"
                "Background context, motivation, and scope of the investigation.\n\n"
                "## 2. Literature Review & Evidence\n"
                "Detailed analysis of retrieved evidence. Organize by theme or property. "
                "Every factual claim MUST include a citation: **[Source: filename, Page X]**.\n\n"
                "## 3. Material Properties & Data\n"
                "Quantitative data presented in Markdown tables where applicable. "
                "Include lattice parameters, mechanical properties, thermal data, electronic properties, etc.\n\n"
                "## 4. Discussion\n"
                "Critical analysis: compare findings across sources, identify consensus and contradictions, "
                "discuss mechanisms, evaluate data quality.\n\n"
                "## 5. Applications & Implications\n"
                "Practical applications, industrial relevance, and technological impact.\n\n"
                "## 6. Limitations & Future Directions\n"
                "Gaps in the evidence, experimental limitations, and recommended future research.\n\n"
                "## 7. Conclusions\n"
                "Key takeaways in 3-5 bullet points.\n\n"
                "## References\n"
                "List all cited sources with page numbers.\n\n"
                "FORMATTING RULES:\n"
                "- Use Markdown tables ONLY for structured numerical/comparative data.\n"
                "- Bold key terms and property names.\n"
                "- Use > blockquotes for direct quotations from sources.\n"
                "- Never fabricate data, citations, or sources. If evidence is missing, state it explicitly.\n"
                "- Do NOT say 'Based on the context' or 'As an AI'. Write authoritatively.\n"
                "- If a 3D molecular structure is relevant, include <render-smiles>VALID_SMILES</render-smiles> after the text."
            )
            synthesis_user = (
                f"Research Question:\n{query}\n\n"
                f"Depth: {depth.upper()} — {depth_instruction}\n\n"
                f"Retrieved Context from NovaRAG (FAISS/Pinecone/Web):\n{context_blocks}\n\n"
                "Produce the full research document following the structure above."
            )

            report = await llm_service.complete_chat(
                messages=[
                    {"role": "system", "content": synthesis_system},
                    {"role": "user", "content": synthesis_user},
                ],
                temperature=0.25,
                max_tokens=settings.MAX_TOKENS,
                model_mode=req.model_mode,
            )

            yield _event("result", report, "synthesis")
            yield _event(
                "phase",
                {"name": "synthesis", "state": "completed", "sources": source_count},
                "synthesis",
            )
            yield _event(
                "done",
                {"report_markdown": report, "sources": all_sources, "sub_queries": subqueries},
            )
        except Exception as exc:
            logger.error("Research stream error: %s", exc, exc_info=True)
            yield _event("error", f"Research failed: {exc}")

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
