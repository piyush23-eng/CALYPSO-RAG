# Known Issues, Failure Analysis & Open Questions

This document consolidates our real, messy findings, unresolved failure modes, and open architectural questions from our evaluation runs and failure triage. It serves as an honest engineering log of what works, what breaks, and what remains to be proven.

---

## 1. Retrieval & Ablation Quirks

### A. The Cross-Encoder Reranker Regression
- **The Observation**: In our 4-way component ablation study (`docs/experiments.md`), **Configuration C (Hybrid without Cross-Encoder Reranking)** scored a composite RAGAS score of **0.9332**, which slightly outperformed the **Full Pipeline with Reranking (0.9147)**.
- **Why this happened**: On clean, well-phrased benchmark queries with strong lexical overlap with textbook headings, BM25 + dense bi-encoder rankings were already near-optimal. Passing candidates through `ms-marco-MiniLM-L-6-v2` occasionally boosted a generic descriptive chunk over a highly condensed formula chunk, slightly depressing precision.
- **The Trade-off**: Cross-encoders add ~109 ms median latency on CPU. While they help guard against disordered student phrasing, they do not universally improve retrieval scores on clean academic benchmarks.

### B. Context Recall Drop During Dataset Scaling (20 $\to$ 50 Questions)
- **The Observation**: When we expanded our evaluation suite from 20 to 50 questions across all 10 GATE subjects, **Context Recall dropped from 85.0% to 62.3%** (a -22.7 percentage point drop).
- **The Root Cause**: The underlying reference corpus currently contains 62 topic markdown documents. When testing niche syllabus areas (such as Relational Division, K-Map static hazard elimination, or Floyd-Warshall DP matrix state transitions), the information density in the notes was sparse, meaning the retriever failed to capture all reference facts.
- **Resolution Path**: The corpus must be expanded from 62 documents to 250+ granular documents to maintain high recall across the entire GATE syllabus.

---

## 2. Unresolved Failure Modes from Evaluation Triage

During failure analysis on edge-case queries, we identified four recurring failure patterns where the model or retrieval pipeline struggled:

| # | Subject Area | Observed Failure | Root Cause |
|:---|:---|:---|:---|
| **1** | **Computer Organization (COA)** | Off-by-one stall calculations in instruction pipelines | The model occasionally confuses whether a branch target is resolved at the Decode stage ($k=2$) or the Execution stage ($k=3$). |
| **2** | **Computer Networks (CN)** | Subnet broadcast address miscalculations | When computing CIDR ranges with non-octet boundary masks (/27, /22), the model occasionally confuses the last usable host IP with the subnet broadcast IP. |
| **3** | **Theory of Computation (TOC)** | NFA to minimal DFA state over-counting | The model correctly constructs the subset construction table but occasionally counts unreachable dead/trap states in the minimal state count. |
| **4** | **Database Systems (DBMS)** | SQL `HAVING` clause predicates with `NULL` values | The model correctly recalls that `AVG()` ignores `NULL`s, but misapplies three-valued logic (`UNKNOWN`) when evaluating compound `WHERE ... AND ...` predicates. |

---

## 3. Open Architectural Questions

1. **Knowledge Graph Generalizability**:
   - Our GraphRAG multi-hop evaluation showed a **+10.81 percentage point recall boost** on a dedicated 10-question multi-hop benchmark (`multihop_eval_dataset.json`).
   - *Open Question*: Because the multi-hop evaluation dataset is small (10 curated questions across 7 subjects), we are not yet certain if this lift generalizes equally across the hundreds of subtle multi-topic interactions in the complete 35-year GATE archive.

2. **Symbolic Verifier Scope**:
   - Deterministic verification using SymPy, Pint, and the AST sandbox works well on arithmetic, unit conversions, and algebraic recurrences.
   - *Open Question*: Open-ended conceptual proofs (e.g., proving whether a language is undecidable via Rice's Theorem) cannot be checked by deterministic AST tools and still rely entirely on LLM generation.

3. **Single-Run Variance Note**:
   - Core RAGAS benchmark scores (such as the 84.3% composite score on the 50-question set) were collected from single evaluation runs per configuration. Re-running across multiple seeds to report mean $\pm$ standard deviation is a planned improvement.
