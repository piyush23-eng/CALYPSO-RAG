"""
Hierarchical / Parent-Document Retriever for LORCEN-RAG.
Expands granular child chunk search hits into contiguous parent derivation sections
to maximize LLM Context Recall and preserve full mathematical proofs.
"""

from typing import List, Dict, Optional
from pathlib import Path
import re
from src.retrieval.hybrid_retriever import RetrievedChunk


class ParentDocumentRetriever:
    """
    Resolves retrieved sub-chunks to their full parent context sections in the corpus.
    """

    def __init__(self, raw_dir: str = "./data/raw"):
        self.raw_dir = Path(raw_dir)
        self._doc_cache: Dict[str, str] = {}

    def _get_document_text(self, filename: str) -> Optional[str]:
        """Loads and caches raw corpus file text."""
        if filename in self._doc_cache:
            return self._doc_cache[filename]
        file_path = self.raw_dir / filename
        if not file_path.exists():
            # Try finding with case-insensitive search
            matches = list(self.raw_dir.glob(f"*{filename}*"))
            if matches:
                file_path = matches[0]
            else:
                return None
        try:
            content = file_path.read_text(encoding="utf-8")
            self._doc_cache[filename] = content
            return content
        except Exception:
            return None

    def expand_chunks(self, chunks: List[RetrievedChunk], max_parent_chars: int = 3000) -> List[RetrievedChunk]:
        """
        Expands each retrieved chunk to its enclosing parent question/section block.
        """
        expanded: List[RetrievedChunk] = []

        for chunk in chunks:
            raw_text = self._get_document_text(chunk.source_file)
            if not raw_text:
                expanded.append(chunk)
                continue

            # Look for the question or section header enclosing this chunk
            chunk_snippet = chunk.content[:80].strip()
            snippet_pos = raw_text.find(chunk_snippet)

            if snippet_pos == -1:
                # If exact start not found, try a shorter substring
                chunk_snippet = chunk.content[:40].strip()
                snippet_pos = raw_text.find(chunk_snippet)

            if snippet_pos != -1:
                # Find start of enclosing section ('## ' or '### ')
                sec_start = raw_text.rfind("\n## ", 0, snippet_pos)
                if sec_start == -1:
                    sec_start = raw_text.rfind("\n# ", 0, snippet_pos)
                if sec_start == -1:
                    sec_start = max(0, snippet_pos - 300)
                else:
                    sec_start += 1  # Skip newline

                # Find end of section ('\n## ' or '---' or end of document)
                sec_end = raw_text.find("\n## ", snippet_pos + len(chunk_snippet))
                if sec_end == -1:
                    sec_end = raw_text.find("\n---", snippet_pos + len(chunk_snippet))
                if sec_end == -1:
                    sec_end = min(len(raw_text), snippet_pos + max_parent_chars)

                parent_content = raw_text[sec_start:sec_end].strip()
                if len(parent_content) > len(chunk.content):
                    # Replace chunk content with full parent context
                    chunk.content = parent_content[:max_parent_chars]

            expanded.append(chunk)

        return expanded
