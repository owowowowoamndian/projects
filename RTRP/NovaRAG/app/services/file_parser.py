import io
import logging
from typing import List
import pdfplumber
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)


class FileParser:
    """Parses PDFs with page-level citation tracking and CIF/TXT files."""

    def __init__(self, max_text_length: int = 60000,
                 chunk_size: int = 800, chunk_overlap: int = 200):
        self.max_text_length = max_text_length
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def parse_pdf(self, file_content: bytes, filename: str) -> List[dict]:
        """Parse PDF → list of {text, page, source} chunks with citation metadata."""
        try:
            pdf_stream = io.BytesIO(file_content)
            pages_text = []

            with pdfplumber.open(pdf_stream) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = ""

                    extracted = page.extract_text()
                    if extracted:
                        page_text += extracted + "\n"

                    for table in page.extract_tables():
                        page_text += "\n--- DATA TABLE ---\n"
                        for row in table:
                            cleaned = [
                                str(cell).replace("\n", " ") if cell else ""
                                for cell in row
                            ]
                            page_text += " | ".join(cleaned) + "\n"
                        page_text += "--- END TABLE ---\n"

                    if page_text.strip():
                        pages_text.append({"text": page_text, "page": page_num})

            # Create chunks with page-level citations
            chunks = []
            total_chars = 0
            for page_data in pages_text:
                if total_chars >= self.max_text_length:
                    break
                page_chunks = self.splitter.split_text(page_data["text"])
                for chunk_text in page_chunks:
                    total_chars += len(chunk_text)
                    if total_chars >= self.max_text_length:
                        break
                    chunks.append({
                        "text": chunk_text,
                        "page": page_data["page"],
                        "source": filename,
                    })

            logger.info(f"Parsed '{filename}': {len(pages_text)} pages → {len(chunks)} chunks")
            return chunks

        except Exception as e:
            logger.error(f"PDF parsing error: {e}")
            raise ValueError(f"Failed to parse PDF: {str(e)}")

    @staticmethod
    def parse_cif(file_content: bytes, max_length: int = 25000) -> str:
        """Parse CIF/TXT file → raw text string."""
        try:
            return file_content.decode("utf-8", errors="ignore")[:max_length]
        except Exception as e:
            logger.error(f"CIF parsing error: {e}")
            raise ValueError(f"Failed to parse file: {str(e)}")
