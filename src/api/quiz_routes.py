"""
Authentic GATE CS Mock Quiz & Practice Test API for CALYPSO-RAG.
Provides curated authentic examination questions across all 10 GATE subjects with official scoring rules (MCQ, MSQ, NAT).
"""

import json
from pathlib import Path
from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from src.api.quiz_bank import COMPREHENSIVE_GATE_QUIZ_BANK

quiz_router = APIRouter(prefix="/api/quiz", tags=["quiz"])

PROJECT_ROOT = Path(__file__).parent.parent.parent
FULL_BANK_PATH = PROJECT_ROOT / "data/processed/full_quiz_bank_1991_2025.json"

# Load full extracted question bank or fallback to curated list
if FULL_BANK_PATH.exists():
    try:
        with open(FULL_BANK_PATH, "r", encoding="utf-8") as f:
            QUIZ_BANK = json.load(f)
    except Exception:
        QUIZ_BANK = COMPREHENSIVE_GATE_QUIZ_BANK
else:
    QUIZ_BANK = COMPREHENSIVE_GATE_QUIZ_BANK



@quiz_router.get("/questions")
def get_quiz_questions(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    q_type: Optional[str] = Query(None, description="Filter by question type: MCQ, MSQ, NAT")
):
    """Returns comprehensive authentic GATE CS questions (MCQ, MSQ, NAT) across 1991-2025."""
    questions = QUIZ_BANK

    if subject and subject.strip() and subject.lower() != "all subjects":
        subj_lower = subject.lower().strip()
        questions = [q for q in questions if subj_lower in q["subject"].lower()]

    if q_type and q_type.strip() and q_type.lower() != "all types":
        type_upper = q_type.upper().strip()
        questions = [q for q in questions if q.get("type", "MCQ") == type_upper]

    return {
        "count": len(questions),
        "total_in_bank": len(QUIZ_BANK),
        "questions": questions if questions else QUIZ_BANK
    }
