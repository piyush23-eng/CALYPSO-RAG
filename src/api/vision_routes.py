"""
Vision-RAG API Route for Diagram Question Solving in LORCEN-RAG.
Processes uploaded visual diagrams and passes structured extractions to the Agent Orchestrator.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time

from src.generation.vision_client import vision_extractor
from src.api.models import QueryResponse

vision_router = APIRouter(prefix="/api/vision", tags=["vision"])


class VisionQueryRequest(BaseModel):
    image: str  # Base64 data URL or raw string
    query: Optional[str] = None


@vision_router.post("/solve", response_model=QueryResponse)
def solve_diagram_query(request: VisionQueryRequest):
    """
    Processes a GATE CS diagram image and generates a step-by-step verified mathematical derivation.
    """
    if not request.image or not request.image.strip():
        raise HTTPException(status_code=400, detail="Image data is required.")

    from src.api.server import get_orchestrator

    t_start = time.perf_counter()

    # Step 1: Multimodal Vision Diagram Extraction
    vision_result = vision_extractor.parse_diagram(
        image_data=request.image,
        user_query=request.query
    )

    # Step 2: Route through LangGraph Agentic Orchestrator
    orchestrator = get_orchestrator()
    state = orchestrator.run(query=vision_result["augmented_query"])

    elapsed_ms = round((time.perf_counter() - t_start) * 1000.0, 2)

    # Attach multimodal metadata to telemetry
    telemetry = dict(state.get("telemetry", {}))
    telemetry["multimodal"] = {
        "is_vision_query": True,
        "diagram_type": vision_result["diagram_type"],
        "detected_features": vision_result["detected_features"],
        "vision_extraction_ms": elapsed_ms
    }

    return QueryResponse(
        query=request.query or "Visual Diagram Problem",
        reformulated_query=state.get("reformulated_query", state["query"]),
        subject_hint=state.get("subject_hint", "General CS"),
        final_answer=state["final_answer"],
        citations=state.get("citations", []),
        rerank_results=[
            {
                "chunk_id": c.chunk_id,
                "source_file": c.source_file,
                "topic": c.topic,
                "subtopic": c.subtopic,
                "content": c.content,
                "rerank_score": c.rerank_score
            }
            for c in state.get("rerank_results", [])
        ],
        retrieval_results=[
            {
                "chunk_id": c.chunk_id,
                "source_file": c.source_file,
                "topic": c.topic,
                "subtopic": c.subtopic,
                "content": c.content,
                "rrf_score": c.rrf_score
            }
            for c in state.get("retrieval_results", [])
        ],
        relevance_score=state.get("relevance_score", 1.0),
        passed_gate=state.get("passed_gate", True),
        is_low_confidence=state.get("is_low_confidence", False),
        reformulation_count=state.get("reformulation_count", 0),
        telemetry=telemetry
    )
