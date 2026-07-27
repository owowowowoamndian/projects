import asyncio
import logging
from typing import Optional
from langchain_community.vectorstores import FAISS
from app.services.vector_store import VectorStoreManager
from app.services.web_search import WebSearchService
from app.services.embeddings import ResilientHFEmbeddings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_BASE = """You are NovaRAG, an elite Enterprise AI for Material Science engineered by Rana Prathap Reddy Jeedipally.

CRITICAL BEHAVIORAL PROTOCOL:
1. CONVERSATION: If the user says hello or asks casual questions, respond naturally and warmly. Do not output scientific data for greetings.
2. DATA HIERARCHY: For factual questions, rely on context in this order: [Tier 1] LOCAL WORKSPACE > [Tier 2] GLOBAL KNOWLEDGE > [Tier 3] WEB DATA.
3. CITATIONS: When referencing data from uploaded documents, ALWAYS cite the source using the format: **[Source: filename, Page X]**. This is mandatory for every factual claim from documents. Place citations at the end of the relevant sentence or paragraph.
4. FORMATTING (TABLES): Use Markdown tables ONLY for multi-column numerical data, lattice parameters, or structured comparisons. DO NOT use tables for paragraphs.
5. DIAGRAMS & IMAGES: If context provides "IMAGE_URL: [url]", embed it using `![Description](url)`. If none provided, do NOT mention images.
6. 3D STRUCTURE RENDERING (MANDATORY RULE):
   - If the user asks about a specific chemical compound, molecule, polymer, drug, crystal structure, or material AND a 3D visualization would genuinely aid understanding, you MUST append exactly one machine-readable tag at the end of your text response: <render-smiles>VALID_SMILES_STRING</render-smiles>
   - Use ONLY valid SMILES notation (e.g., <render-smiles>CC(=O)Oc1ccccc1C(=O)O</render-smiles> for Aspirin).
   - For crystal lattices where SMILES is not appropriate, you may place valid CIF data inside the tag: <render-smiles>data_structure\n_cell_length_a ...</render-smiles>
   - Do NOT render 3D structures for general/conceptual questions, greetings, comparisons, or when no specific molecule is discussed.
   - NEVER wrap the <render-smiles> tag in Markdown code fences, backticks, or any other formatting.
   - Place the tag AFTER your textual explanation, not inside it.
7. PROFESSIONALISM: Never say "Based on the context" or "As an AI". Answer directly and authoritatively.
8. ACCURACY: If data is NOT in your context, say so clearly. NEVER fabricate numbers or scientific data. Accuracy is more important than completeness."""


class RAGPipeline:
    """Orchestrates the dual-RAG retrieval: Local FAISS + Global Pinecone + Web."""

    def __init__(self, embedder: ResilientHFEmbeddings, vector_store: VectorStoreManager):
        self.embedder = embedder
        self.vector_store = vector_store

    async def build_context(
        self,
        user_query: str,
        v_db: Optional[FAISS],
        cif_data: str,
        use_web: bool,
    ) -> str:
        """Build the full system prompt with context from all sources."""

        query_vector = self.embedder.embed_query(user_query)

        # ── Zero-vector detection ──
        if self.embedder.is_zero_vector(query_vector):
            logger.warning("⚠️ ZERO VECTOR DETECTED for query '%s' — embedding failed. "
                           "Pinecone search will be skipped.", user_query[:80])
            print(f"[VECTOR WARNING] Zero vector for query: {user_query[:80]}")

        # Launch all retrievals in parallel
        local_task = self.vector_store.search_local(v_db, user_query)

        if use_web:
            web_task = WebSearchService.search(user_query)
        else:
            async def _empty_web():
                return {"texts": [], "images": []}
            web_task = _empty_web()

        # Use a safe fallback coroutine for skipped global search
        async def _empty_global():
            return []

        # Skip Pinecone if embedding is a zero vector (would return garbage)
        if self.embedder.is_zero_vector(query_vector):
            global_task = _empty_global()
        else:
            global_task = self.vector_store.search_global(query_vector)

        global_results, local_results, web_results = await asyncio.gather(
            global_task, local_task, web_task
        )

        # ── Diagnostic logging (visible in terminal) ──
        local_count = len(local_results) if local_results else 0
        global_count = len(global_results) if global_results else 0
        web_count = len(web_results.get("texts", [])) if web_results else 0
        has_cif = bool(cif_data and cif_data.strip())

        print(f"[RAG DIAGNOSTICS] Query: '{user_query[:60]}' → "
              f"Local FAISS: {local_count} chunks | "
              f"Pinecone Global: {global_count} chunks | "
              f"Web: {web_count} results | "
              f"CIF data: {'YES' if has_cif else 'NO'}")
        logger.info("RAG retrieval — Local: %d, Global: %d, Web: %d, CIF: %s",
                    local_count, global_count, web_count, has_cif)

        system_prompt = SYSTEM_PROMPT_BASE

        # ── Check if ALL sources are empty → graceful fallback ──
        if local_count == 0 and global_count == 0 and web_count == 0 and not has_cif:
            system_prompt += (
                "\n\n--- NO CONTEXT AVAILABLE ---\n"
                "Vector database is currently empty. No documents have been uploaded to the "
                "local workspace, the global knowledge base returned no matches, and web "
                "search is either disabled or returned no results. "
                "Please ask the user to upload documents or enable web search for better answers. "
                "Answer based on your general knowledge and clearly state that no uploaded "
                "document context was available."
            )
            print("[RAG WARNING] All retrieval sources empty — using fallback message")
            return system_prompt

        # Tier 1: Local workspace (highest priority)
        if local_results:
            local_ctx = "\n\n".join([
                f"[Source: {r['source']}, Page {r['page']}]\n{r['text']}"
                for r in local_results
            ])
            system_prompt += f"\n\n--- [Tier 1] LOCAL WORKSPACE (UPLOADED DOCUMENT) ---\n{local_ctx}"

        if has_cif:
            system_prompt += f"\n\n--- [Tier 1] LOCAL WORKSPACE (CIF / STRUCTURAL DATA) ---\n{cif_data}"

        # Tier 2: Global knowledge
        if global_results:
            global_ctx = "\n".join([
                f"- (Source: {r['source']}, Page {r['page']}) {r['text']}"
                for r in global_results
            ])
            system_prompt += f"\n\n--- [Tier 2] GLOBAL KNOWLEDGE BASE ---\n{global_ctx}"

        # Tier 3: Web data
        if web_results.get("texts"):
            web_ctx = "\n--- LIVE WEB DATA ---\n"
            web_ctx += "\n".join([
                f"- {r['title']}: {r['body']}" for r in web_results["texts"]
            ])
            if web_results.get("images"):
                web_ctx += f"\n\nIMAGE_URL: {web_results['images'][0]}"
            system_prompt += f"\n{web_ctx}"

        return system_prompt
