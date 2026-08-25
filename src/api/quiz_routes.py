"""
Authentic GATE CS Mock Quiz & Practice Test API for CALYPSO-RAG.
Serves curated, verified GATE CS questions preserving exact mathematical notations, symbols, options, and derivations.
"""


from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from src.api.quiz_bank import PURE_VERIFIED_GATE_BANK

quiz_router = APIRouter(prefix="/api/quiz", tags=["quiz"])

QUIZ_BANK = PURE_VERIFIED_GATE_BANK


class QuizQuestion(BaseModel):
    id: str
    subject: str
    type: str  # 'MCQ', 'MSQ', or 'NAT'
    year: Optional[str] = None
    marks: float
    negative_marks: float
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str


@quiz_router.get("/questions")
def get_quiz_questions(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    q_type: Optional[str] = Query(None, description="Filter by question type: MCQ, MSQ, NAT")
):
    """Returns 100% pure verified authentic GATE CS questions with exact LaTeX symbols and options."""
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
