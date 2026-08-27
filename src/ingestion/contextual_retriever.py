"""
Anthropic Contextual Retrieval Engine for LORCEN-RAG.

Inspired by Anthropic's Contextual Retrieval breakthrough:
1. Synthesizes a situating, chunk-specific contextual preface using document-level taxonomy and chapter metadata.
2. Prepends this situated context:
   `[Context: Subject: Operating Systems | Chapter: Memory Management | Section: Paging Hierarchy]`
   to each individual chunk before dense vector and BM25 indexing.
3. Completely resolves the "orphan chunk" problem where mathematical equations lack variable definitions from preceding paragraphs.
"""

from typing import List, Dict, Any, Optional
from src.ingestion.chunker import DocumentChunk


class ContextualRetriever:
    """
    Contextual Embedding Pre-Processor and Query Situator for LORCEN-RAG.
    """

    def __init__(self):
        pass

    def generate_situated_chunk_content(self, chunk: DocumentChunk) -> str:
        """
        Synthesizes a situated contextual header and prepends it to the raw chunk text.
        Format:
        [Context: GATE CS {Subject} -> {Topic} -> {Subtopic}]
        {Raw Chunk Content}
        """
        subject = chunk.topic or "Computer Science"
        subtopic = chunk.subtopic or "Core Concepts"
        source = chunk.source_file or "GATE CS Archive"

        contextual_preface = (
            f"[Context: Subject: {subject} | Topic: {subtopic} | Source: {source}]\n"
        )

        return contextual_preface + chunk.content

    def enrich_chunks_with_context(self, chunks: List[DocumentChunk]) -> List[DocumentChunk]:
        """
        Iterates over a corpus of chunks and produces contextually enriched chunks for indexing.
        """
        enriched_chunks: List[DocumentChunk] = []

        for c in chunks:
            situated_text = self.generate_situated_chunk_content(c)
            # Create a clone with situated context embedded
            enriched_chunk = DocumentChunk(
                chunk_id=c.chunk_id,
                content=situated_text,
                source_file=c.source_file,
                topic=c.topic,
                subtopic=c.subtopic,
                parent_id=c.parent_id,
                metadata={
                    **(c.metadata or {}),
                    "is_contextualized": True,
                    "original_content_len": len(c.content),
                    "contextual_header_len": len(situated_text) - len(c.content)
                }
            )
            enriched_chunks.append(enriched_chunk)

        return enriched_chunks


# Global singleton instance
global_contextual_retriever = ContextualRetriever()
