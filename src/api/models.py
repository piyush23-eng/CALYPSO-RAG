"""
Shared Pydantic API Models for CALYPSO-RAG.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class QueryRequest(BaseModel):
    query: str


class QueryResponse(BaseModel):
    query: str
    reformulated_query: str
    subject_hint: Optional[str]
    final_answer: str
    citations: List[Dict[str, Any]]
    rerank_results: List[Dict[str, Any]]
    retrieval_results: List[Dict[str, Any]]
    relevance_score: float
    reformulation_count: int
    passed_gate: bool
    is_low_confidence: bool
    telemetry: Dict[str, Any]
    is_semantic_cache_hit: bool = False
    cache_similarity: Optional[float] = None
    dimensional_verification: Optional[Dict[str, Any]] = None
    self_consistency: Optional[Dict[str, Any]] = None
    serving_engine: Optional[str] = None
    process_reward_model: Optional[Dict[str, Any]] = None
    think_trace: Optional[str] = None
