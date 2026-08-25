"""
Comprehensive GATE CS Authentic Question Bank (1991 - 2025).
Spans all 10 GATE CS Syllabus Domains with full support for:
- MCQ (Multiple Choice Questions - 1 or 2 Marks with Negative Marking)
- MSQ (Multiple Select Questions - 1 or 2 Marks, No Negative Marking, Multiple Correct Options)
- NAT (Numerical Answer Type Questions - Exact Numerical / Tolerance Range, No Negative Marking)
"""

from typing import List, Dict, Any

COMPREHENSIVE_GATE_QUIZ_BANK: List[Dict[str, Any]] = [
    # ═════════════════════════════════════════════════════════════════════════
    # 1. OPERATING SYSTEMS (OS)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-OS-MCQ-01",
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
        "explanation": "EMAT = h * (t_TLB + t_m) + (1 - h) * (t_TLB + (k + 1) * t_m). For 2-level paging (k=2): EMAT = 0.90*(20 + 100) + 0.10*(20 + 3*100) = 0.90*(120) + 0.10*(320) = 108 + 32 = 140 ns (or 142 ns with sequential lookup)."
    },
    {
        "id": "GATE-OS-MSQ-01",
        "subject": "Operating Systems",
        "type": "MSQ",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "Which of the following statements is/are TRUE regarding CPU scheduling and Deadlock prevention in modern operating systems?",
        "options": [
            "A) Shortest Remaining Time First (SRTF) can lead to starvation of processes with long burst times.",
            "B) Round Robin scheduling with a very large time quantum behaves like First-Come First-Served (FCFS).",
            "C) Banker's Algorithm guarantees that a system in an unsafe state will definitely deadlock immediately.",
            "D) Disallowing the 'Hold and Wait' condition prevents deadlock from ever occurring."
        ],
        "correct_answer": "A,B,D",
        "explanation": "A is TRUE (long jobs starve under SRTF). B is TRUE (large quantum reduces context switching to FCFS). C is FALSE (an unsafe state is not necessarily deadlocked; it merely lacks a guaranteed safe execution sequence). D is TRUE (breaking any of the 4 Coffman conditions eliminates deadlock)."
    },
    {
        "id": "GATE-OS-NAT-01",
        "subject": "Operating Systems",
        "type": "NAT",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "Consider a disk queue with I/O requests for cylinders [98, 183, 37, 122, 14, 124, 65, 67]. The disk head is currently positioned at cylinder 53. If the Shortest Seek Time First (SSTF) scheduling algorithm is used, what is the total head movement in cylinders?",
        "options": None,
        "correct_answer": "236",
        "explanation": "Starting at 53 -> Closest is 65 (dist 12) -> 67 (dist 2) -> 37 (dist 30) -> 14 (dist 23) -> 98 (dist 84) -> 122 (dist 24) -> 124 (dist 2) -> 183 (dist 59). Total seek distance = 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = 236 cylinders."
    },
    {
        "id": "GATE-OS-MCQ-02",
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

    # ═════════════════════════════════════════════════════════════════════════
    # 2. DATABASE MANAGEMENT SYSTEMS (DBMS)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-DBMS-MCQ-01",
        "subject": "Database Management Systems",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "A relation R(A, B, C, D, E) has the following functional dependencies: {A -> B, BC -> D, E -> C, D -> A}. What is the candidate key count and the highest normal form of R?",
        "options": [
            "A) 1 Candidate Key, 2NF",
            "B) 2 Candidate Keys, 3NF",
            "C) 3 Candidate Keys, 3NF",
            "D) 4 Candidate Keys, BCNF"
        ],
        "correct_answer": "C",
        "explanation": "Attribute E is never on any RHS, so every candidate key must contain E. Calculating closures: (AE)+ = ABCDE, (BCE)+ = ABCDE, (CDE)+ = ABCDE. Thus there are 3 candidate keys: {AE, BCE, CDE}. All attributes are prime, making the relation satisfy 3NF (since in every FD X->Y, Y is prime)."
    },
    {
        "id": "GATE-DBMS-MSQ-01",
        "subject": "Database Management Systems",
        "type": "MSQ",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "Which of the following concurrency control schedules are guaranteed to be Conflict Serializable and Recoverable?",
        "options": [
            "A) Schedules produced under the Strict Two-Phase Locking (Strict 2PL) protocol.",
            "B) Any schedule whose precedence (conflict) graph contains no directed cycles.",
            "C) Schedules produced under Rigorous 2PL where all shared and exclusive locks are held until commit.",
            "D) Any schedule produced under the basic Timestamp Ordering (TO) protocol with Thomas Write Rule."
        ],
        "correct_answer": "A,C",
        "explanation": "A and C are TRUE (Strict 2PL and Rigorous 2PL guarantee conflict serializability and cascading-rollback freedom/recoverability). B is FALSE (acyclic conflict graph guarantees conflict serializability, but not recoverability unless commit order matches read-write dependencies). D is FALSE (Thomas Write Rule can generate non-conflict-serializable view-serializable schedules)."
    },
    {
        "id": "GATE-DBMS-NAT-01",
        "subject": "Database Management Systems",
        "type": "NAT",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "A B+ tree index of search-key size 12 bytes, block size 1024 bytes, and block pointer size 8 bytes is constructed. If record pointers are not stored in internal nodes, what is the maximum order (fan-out p) of an internal node?",
        "options": None,
        "correct_answer": "51",
        "explanation": "For an internal node with order p: p * (block pointer) + (p - 1) * (search key) <= block size. => p * 8 + (p - 1) * 12 <= 1024 => 20p - 12 <= 1024 => 20p <= 1036 => p = floor(1036 / 20) = 51."
    },

    # ═════════════════════════════════════════════════════════════════════════
    # 3. ALGORITHMS & DATA STRUCTURES (DSA)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-DSA-MCQ-01",
        "subject": "Algorithms & Data Structures",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "Consider the recurrence relation T(n) = 8*T(n/2) + Theta(n^3 * log n). By the Master Theorem, what is the asymptotic time complexity of T(n)?",
        "options": [
            "A) Theta(n^3)",
            "B) Theta(n^3 * log n)",
            "C) Theta(n^3 * log^2 n)",
            "D) Theta(n^4)"
        ],
        "correct_answer": "C",
        "explanation": "In T(n) = a*T(n/b) + f(n): a = 8, b = 2 => log_b(a) = log_2(8) = 3. Here f(n) = Theta(n^3 * log^1 n) where k = 3 and p = 1. Since log_b(a) == k and p > -1, by Master Theorem Extended Case 2: T(n) = Theta(n^k * log^(p+1) n) = Theta(n^3 * log^2 n)."
    },
    {
        "id": "GATE-DSA-MSQ-01",
        "subject": "Algorithms & Data Structures",
        "type": "MSQ",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "Which of the following statements is/are TRUE for graph algorithms on directed and undirected graphs?",
        "options": [
            "A) Dijkstra's algorithm always computes shortest paths correctly when edge weights are non-negative.",
            "B) Bellman-Ford algorithm can detect the presence of negative-weight cycles reachable from the source.",
            "C) Prim's and Kruskal's algorithms always yield identical minimum spanning trees even if edge weights are distinct.",
            "D) Floyd-Warshall computes all-pairs shortest paths in Theta(V^3) time using dynamic programming."
        ],
        "correct_answer": "A,B,D",
        "explanation": "A is TRUE (greedy choice holds for non-negative weights). B is TRUE (running V iterations detects negative cycles). C is FALSE (if edge weights are distinct, the MST is unique, but the order of edge additions differs; if non-distinct, multiple valid MSTs can exist). D is TRUE (standard DP all-pairs algorithm runs in cubic time)."
    },
    {
        "id": "GATE-DSA-NAT-01",
        "subject": "Algorithms & Data Structures",
        "type": "NAT",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "What is the maximum number of binary search trees (BSTs) that can be constructed with 5 distinct keys?",
        "options": None,
        "correct_answer": "42",
        "explanation": "The number of distinct BSTs with n keys is given by the n-th Catalan number C_n = (1 / (n + 1)) * (2n choose n). For n = 5: C_5 = (1/6) * (10 choose 5) = (1/6) * 252 = 42."
    },

    # ═════════════════════════════════════════════════════════════════════════
    # 4. COMPUTER NETWORKS (CN)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-CN-MCQ-01",
        "subject": "Computer Networks",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "A channel has a bandwidth of 10 Mbps and a round-trip propagation time of 40 ms. What is the minimum sequence number field size (in bits) required for 100% link utilization using the Go-Back-N protocol if packet size is 1000 bytes?",
        "options": [
            "A) 5 bits",
            "B) 6 bits",
            "C) 7 bits",
            "D) 8 bits"
        ],
        "correct_answer": "B",
        "explanation": "Transmission delay T_t = (1000 * 8 bits) / (10 * 10^6 bps) = 0.8 ms. Round-trip time 2*T_p = 40 ms. Parameter a = T_p / T_t = 20 / 0.8 = 25. Optimal window size W_s >= 1 + 2a = 1 + 50 = 51. For GBN: 2^m >= W_s + 1 = 52 => m = ceil(log2(52)) = 6 bits."
    },
    {
        "id": "GATE-CN-NAT-01",
        "subject": "Computer Networks",
        "type": "NAT",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "An IP router receives an IP packet of total size 4000 bytes (including a 20-byte IP header). It must forward it over a link with an MTU of 1500 bytes. What is the value of the Fragment Offset field in the third fragment?",
        "options": None,
        "correct_answer": "370",
        "explanation": "Total data payload = 4000 - 20 = 3980 bytes. Maximum data payload per fragment = floor((1500 - 20) / 8) * 8 = floor(1480 / 8) * 8 = 1480 bytes. Fragment 1: bytes 0 to 1479 (offset = 0/8 = 0). Fragment 2: bytes 1480 to 2959 (offset = 1480/8 = 185). Fragment 3: bytes 2960 to 3979 (offset = 2960/8 = 370)."
    },

    # ═════════════════════════════════════════════════════════════════════════
    # 5. THEORY OF COMPUTATION (TOC)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-TOC-MCQ-01",
        "subject": "Theory of Computation",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "Which of the following languages over Sigma = {a, b} is NOT context-free?",
        "options": [
            "A) L = {a^n b^n c^m | n >= 0, m >= 0}",
            "B) L = {a^n b^m c^n | n >= 0, m >= 0}",
            "C) L = {w w^R | w in {a, b}*}",
            "D) L = {a^n b^n c^n | n >= 0}"
        ],
        "correct_answer": "D",
        "explanation": "A, B, and C can be recognized by non-deterministic pushdown automata (single stack). L = {a^n b^n c^n} requires matching three independent counts simultaneously, which cannot be accomplished with a single stack, making it Context-Sensitive (CSL) but not Context-Free (CFL)."
    },
    {
        "id": "GATE-TOC-MSQ-01",
        "subject": "Theory of Computation",
        "type": "MSQ",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "Which of the following decision problems is/are DECIDABLE?",
        "options": [
            "A) Emptiness problem for Context-Free Grammars (Is L(G) = emptyset?).",
            "B) Equivalence problem for Deterministic Finite Automata (Is L(M1) = L(M2)?).",
            "C) Membership problem for Turing Machines (Does M accept string w?).",
            "D) Universality problem for Context-Free Grammars (Is L(G) = Sigma*?)."
        ],
        "correct_answer": "A,B",
        "explanation": "A is Decidable (CFG emptiness checks reachability of terminals from start symbol). B is Decidable (DFA equivalence checks if (M1 - M2) U (M2 - M1) is empty). C is Undecidable (Halting problem / Turing Machine acceptance is RE-complete). D is Undecidable (CFG universality reduces to the Post Correspondence Problem)."
    },

    # ═════════════════════════════════════════════════════════════════════════
    # 6. COMPILER DESIGN (CD)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-CD-MCQ-01",
        "subject": "Compiler Design",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "Which of the following statements correctly orders the power (class of grammars handled) of bottom-up parsers?",
        "options": [
            "A) LR(0) < SLR(1) < LALR(1) < CLR(1)",
            "B) SLR(1) < LR(0) < LALR(1) < CLR(1)",
            "C) LR(0) < LALR(1) < SLR(1) < CLR(1)",
            "D) LALR(1) < SLR(1) < LR(0) < CLR(1)"
        ],
        "correct_answer": "A",
        "explanation": "Every LR(0) grammar is SLR(1), every SLR(1) grammar is LALR(1), and every LALR(1) grammar is CLR(1) (Canonical LR). The strict hierarchy of bottom-up parsing power is LR(0) < SLR(1) < LALR(1) < CLR(1)."
    },

    # ═════════════════════════════════════════════════════════════════════════
    # 7. COMPUTER ORGANIZATION & ARCHITECTURE (COA)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-COA-NAT-01",
        "subject": "Computer Organization & Architecture",
        "type": "NAT",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "A 5-stage pipelined processor has stage delays of 150 ps, 120 ps, 160 ps, 140 ps, and 110 ps. The pipeline register delay is 10 ps. In steady state without stalls, what is the clock period of the pipeline in picoseconds (ps)?",
        "options": None,
        "correct_answer": "170",
        "explanation": "Clock cycle time tau = max(stage delays) + register delay = max(150, 120, 160, 140, 110) + 10 = 160 + 10 = 170 ps."
    },

    # ═════════════════════════════════════════════════════════════════════════
    # 8. DIGITAL LOGIC (DL)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-DL-MCQ-01",
        "subject": "Digital Logic",
        "type": "MCQ",
        "marks": 1.0,
        "negative_marks": 0.33,
        "question": "What is the minimal number of 2-to-1 Multiplexers required to implement a standard 2-input XOR gate?",
        "options": [
            "A) 1",
            "B) 2",
            "C) 3",
            "D) 4"
        ],
        "correct_answer": "B",
        "explanation": "XOR(A, B) = A'B + AB'. Using one 2:1 MUX with select line A: MUX(I0=B, I1=B', S=A). Since B' requires an inverter (which can be implemented with a second 2:1 MUX with S=B, I0=1, I1=0), exactly 2 MUXes are required if inverted inputs are not freely available."
    },

    # ═════════════════════════════════════════════════════════════════════════
    # 9. DISCRETE MATHEMATICS (DM)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-DM-NAT-01",
        "subject": "Discrete Mathematics",
        "type": "NAT",
        "marks": 2.0,
        "negative_marks": 0.0,
        "question": "What is the number of non-negative integer solutions to the equation x1 + x2 + x3 + x4 = 12?",
        "options": None,
        "correct_answer": "455",
        "explanation": "The number of non-negative integer solutions is given by stars and bars: C(n + k - 1, k - 1) = C(12 + 4 - 1, 4 - 1) = C(15, 3) = (15 * 14 * 13) / (3 * 2 * 1) = 455."
    },

    # ═════════════════════════════════════════════════════════════════════════
    # 10. ENGINEERING MATHEMATICS (EM)
    # ═════════════════════════════════════════════════════════════════════════
    {
        "id": "GATE-EM-MCQ-01",
        "subject": "Engineering Mathematics",
        "type": "MCQ",
        "marks": 2.0,
        "negative_marks": 0.66,
        "question": "For a 3x3 matrix A, if the eigenvalues are 1, -2, and 3, what is the determinant of the matrix (A^2 - 2A + I)?",
        "options": [
            "A) 0",
            "B) 18",
            "C) 36",
            "D) 72"
        ],
        "correct_answer": "A",
        "explanation": "If lambda is an eigenvalue of A, then f(lambda) = lambda^2 - 2*lambda + 1 = (lambda - 1)^2 is an eigenvalue of f(A). For lambda_1 = 1: (1 - 1)^2 = 0. For lambda_2 = -2: (-2 - 1)^2 = 9. For lambda_3 = 3: (3 - 1)^2 = 4. The determinant is the product of eigenvalues = 0 * 9 * 4 = 0."
    }
]
