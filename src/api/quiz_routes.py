"""
Authentic GATE CS Mock Quiz & Practice Test API for CALYPSO-RAG.
Provides curated authentic examination questions across all 10 GATE subjects with official scoring rules (MCQ, MSQ, NAT).
"""

from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from src.api.quiz_bank import COMPREHENSIVE_GATE_QUIZ_BANK

quiz_router = APIRouter(prefix="/api/quiz", tags=["quiz"])


class QuizQuestion(BaseModel):
    id: str
    subject: str
    type: str  # 'MCQ', 'MSQ', or 'NAT'
    marks: float
    negative_marks: float
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str


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
