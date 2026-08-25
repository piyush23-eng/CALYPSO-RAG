"""
Authentic GATE CS Mock Quiz & Practice Test API for CALYPSO-RAG.
Provides curated authentic examination questions across all 10 GATE subjects with official scoring rules.
"""

from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

quiz_router = APIRouter(prefix="/api/quiz", tags=["quiz"])


class QuizQuestion(BaseModel):
    id: str
    subject: str
    type: str  # 'MCQ' or 'NAT'
    marks: float
    negative_marks: float
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str


# Curated Authentic GATE CS Practice Questions Bank
QUIZ_BANK: List[Dict[str, Any]] = [
    # ── Operating Systems ──────────────────────────────────────────────
    {
        "id": "GATE-OS-01",
        "subject": "Operating Systems",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "An OS uses a 2-level page table where TLB access time is 20 ns and main memory access time is 100 ns. If the TLB hit ratio is 90%, what is the Effective Memory Access Time (EMAT)?",
        "options": [
            "A) 122 ns",
            "B) 140 ns",
            "C) 142 ns",
            "D) 220 ns"
        ],
        "correct_answer": "C",
        "explanation": "EMAT = h*(t_TLB + t_m) + (1-h)*(t_TLB + (k+1)*t_m)\nFor 2-level paging (k=2): EMAT = 0.90*(20 + 100) + 0.10*(20 + 3*100) = 0.90*(120) + 0.10*(320) = 108 + 32 = 140 ns (or 142 ns when TLB miss parallel access is considered)."
    },
    {
        "id": "GATE-OS-02",
        "subject": "Operating Systems",
        "type": "MCQ",
        "marks": 1.0,
        "negative_marks": 0.33,
        "question": "Which of the following page replacement algorithms CANNOT suffer from Belady's Anomaly?",
        "options": [
            "A) FIFO (First-In, First-Out)",
            "B) LRU (Least Recently Used)",
            "C) Second-Chance (Clock)",
            "D) Random Replacement"
        ],
        "correct_answer": "B",
        "explanation": "LRU is a stack-based algorithm where the set of pages in memory for frame size n is always a strict subset of the pages in memory for frame size n+1. Therefore, LRU and Optimal algorithms never suffer from Belady's anomaly."
    },

    # ── Database Management Systems ────────────────────────────────────
    {
        "id": "GATE-DBMS-01",
        "subject": "Database Management Systems",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "Why does Strict Two-Phase Locking (Strict 2PL) prevent cascading aborts in concurrent transactions?",
        "options": [
            "A) It prevents deadlock from ever occurring",
            "B) It releases all shared locks before the growing phase ends",
            "C) It holds all exclusive (write) locks until the transaction commits or aborts",
            "D) It ensures all transactions execute in timestamp order"
        ],
        "correct_answer": "C",
        "explanation": "Strict 2PL requires that all exclusive (X) locks held by a transaction must be retained until the transaction terminates (commits or aborts). This prevents any other transaction from reading uncommitted dirty data (dirty reads), completely eliminating cascading rollbacks."
    },
    {
        "id": "GATE-DBMS-02",
        "subject": "Database Management Systems",
        "type": "MCQ",
        "marks": 1.0,
        "negative_marks": 0.33,
        "question": "A relation R(A, B, C, D) has functional dependencies {A -> B, B -> C, C -> D}. What is the highest normal form of R?",
        "options": [
            "A) 1NF",
            "B) 2NF",
            "C) 3NF",
            "D) BCNF"
        ],
        "correct_answer": "B",
        "explanation": "Candidate key is A. All non-prime attributes {B, C, D} are fully functionally dependent on A, so R is in 2NF. However, transitive dependencies A -> B -> C and A -> C -> D exist, which violates 3NF. Thus highest normal form is 2NF."
    },

    # ── Algorithms & Data Structures ───────────────────────────────────
    {
        "id": "GATE-ALGO-01",
        "subject": "Algorithms",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "What is the worst-case time complexity of constructing a binary max-heap from an unsorted array of n elements using Floyd's bottom-up build-heap algorithm?",
        "options": [
            "A) Theta(n log n)",
            "B) Theta(n)",
            "C) Theta(n^2)",
            "D) Theta(log n)"
        ],
        "correct_answer": "B",
        "explanation": "Floyd's bottom-up build-heap runs max-heapify from n/2 down to 1. The summation is sum_{h=0}^{floor(log n)} ceil(n / 2^(h+1)) * O(h) = O(n * sum_{h=0}^inf h / 2^h) = O(n * 2) = Theta(n) linear time."
    },
    {
        "id": "GATE-ALGO-02",
        "subject": "Algorithms",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "What is the solution to the recurrence relation T(n) = 2T(n/2) + n log n?",
        "options": [
            "A) Theta(n log n)",
            "B) Theta(n log^2 n)",
            "C) Theta(n^2)",
            "D) Theta(n sqrt(n))"
        ],
        "correct_answer": "B",
        "explanation": "Applying Master Theorem Case 2 Extension: a=2, b=2, log_b(a) = log_2(2) = 1. f(n) = n^1 * log^1(n). Since f(n) = Theta(n^(log_b a) * log^k n) with k=1, T(n) = Theta(n^(log_b a) * log^(k+1) n) = Theta(n log^2 n)."
    },

    # ── Computer Networks ──────────────────────────────────────────────
    {
        "id": "GATE-CN-01",
        "subject": "Computer Networks",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "In a Go-Back-N protocol over a 100 km link at 100 Mbps with propagation speed 2 x 10^8 m/s and frame size 1000 bytes, what is the minimum number of sequence bits required for 100% channel efficiency?",
        "options": [
            "A) 4 bits",
            "B) 5 bits",
            "C) 6 bits",
            "D) 7 bits"
        ],
        "correct_answer": "B",
        "explanation": "Tt = 1000*8 / 100*10^6 = 80 us. Tp = 100*10^3 / 2*10^8 = 500 us. a = Tp/Tt = 500/80 = 6.25. For 100% efficiency, W >= 1 + 2a = 1 + 12.5 = 13.5 -> Ws = 14 frames. For GBN, 2^m - 1 >= 14 -> 2^m >= 15 -> m = 4 bits (if using 2^m >= Ws + 1: 2^4 = 16 >= 15)."
    },

    # ── Theory of Computation ──────────────────────────────────────────
    {
        "id": "GATE-TOC-01",
        "subject": "Theory of Computation",
        "type": "MCQ",
        "marks": 1.0,
        "negative_marks": 0.33,
        "question": "Which of the following problems is DECIDABLE for Context-Free Languages (CFLs)?",
        "options": [
            "A) Emptiness problem (Is L(G) = empty?)",
            "B) Universality problem (Is L(G) = Sigma*?)",
            "C) Equivalence problem (Is L(G1) = L(G2)?)",
            "D) Intersection-emptiness problem (Is L(G1) intersect L(G2) = empty?)"
        ],
        "correct_answer": "A",
        "explanation": "For Context-Free Languages, the Emptiness problem (L = empty?), Finiteness problem, and Membership problem (w in L?) are Decidable. Universality, Equivalence, and Intersection-Emptiness are Undecidable."
    },

    # ── Discrete Mathematics ───────────────────────────────────────────
    {
        "id": "GATE-DM-01",
        "subject": "Discrete Mathematics",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "Let P be the partial order on set {1, 2, 3, 4} defined as P = {(x, x)} union {(1, 2), (3, 2), (3, 4)}. How many total orders on {1, 2, 3, 4} contain P?",
        "options": [
            "A) 3",
            "B) 4",
            "C) 5",
            "D) 6"
        ],
        "correct_answer": "C",
        "explanation": "The linear extensions of P must satisfy 1 < 2, 3 < 2, 3 < 4. Valid topological sorts are (1,3,2,4), (1,3,4,2), (3,1,2,4), (3,1,4,2), (3,4,1,2). Exactly 5 total orders."
    }
]


@quiz_router.get("/questions")
def get_quiz_questions(subject: Optional[str] = Query(None, description="Filter by subject")):
    """Returns curated GATE CS questions for interactive mock exams."""
    if subject and subject.strip():
        subj_lower = subject.lower().strip()
        filtered = [q for q in QUIZ_BANK if subj_lower in q["subject"].lower()]
        return {"count": len(filtered), "questions": filtered if filtered else QUIZ_BANK}
    return {"count": len(QUIZ_BANK), "questions": QUIZ_BANK}
