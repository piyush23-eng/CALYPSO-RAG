# ⚡ CALYPSO-RAG: Agentic Retrieval-Augmented Generation for GATE Computer Science

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![LangGraph](https://img.shields.io/badge/orchestration-LangGraph-orange.svg)](https://github.com/langchain-ai/langgraph)
[![ChromaDB](https://img.shields.io/badge/vector_db-ChromaDB-purple.svg)](https://www.trychroma.com/)
[![React + Tailwind](https://img.shields.io/badge/frontend-React%20%2B%20Tailwind%20Vite-06B6D4.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![QLoRA 4-bit](https://img.shields.io/badge/fine--tuning-QLoRA%204--bit-FFD21E.svg)](https://github.com/huggingface/peft)
[![Tests](https://img.shields.io/badge/pytest-22%2F22%20passing-brightgreen.svg)]()
[![RAGAS Score](https://img.shields.io/badge/RAGAS%20Composite-79.9%25-success.svg)]()

> An **Agentic Retrieval-Augmented Generation (RAG)** system engineered specifically for the **GATE Computer Science & Information Technology (CS/IT)** examination covering the complete syllabus from **1990 to 2026**. It combines domain-specialized fine-tuned LLM reasoning (`Qwen2.5-1.5B-Instruct` 4-bit QLoRA) with custom hybrid lexical/dense retrieval, Reciprocal Rank Fusion ($k=60$), Cross-Encoder reranking, Corrective Self-Correction (CRAG), sentence-level semantic attribution, and a custom motion-design editorial React frontend served via FastAPI.

---

## 🏗️ System Architecture

CALYPSO-RAG is structured as a cyclic state machine built on **LangGraph**. The state graph executes subject classification, parallel hybrid retrieval, cross-encoder reranking, and dynamic threshold-based self-correction loops before generating step-by-step mathematical reasoning with citation provenance.

```mermaid
flowchart TD
    START([User Query Input]) --> Classify[Classify Query & 10-Subject Taxonomy]
    Classify --> Retrieve[Parallel Hybrid Retrieval: BM25 + Dense BGE-Small]
    Retrieve --> Rerank[Cross-Encoder Reranker: ms-marco-MiniLM-L-6-v2]
    RelevanceCheck{Check Relevance Score >= 0.50?}
    Rerank --> RelevanceCheck
    
    RelevanceCheck -- "No (Score < 0.50 & Attempt < 2)" --> Reformulate[CRAG Query Reformulation & Expansion]
    Reformulate -.-> Retrieve
    
    RelevanceCheck -- "Yes (Score >= 0.50 OR Attempt >= 2)" --> Generate[Calypso LLM Generation with Negative Grounding]
    Generate --> Citations[Sentence-Level Cosine Citation Mapper]
    Citations --> END([Verified Answer with Citations & Confidence])
```

---

## 🔬 Core Engineering Innovations

### 1. Why Hybrid Retrieval Beats Dense-Only in Technical Exams
Technical examination queries (like GATE CS) contain precision-critical acronyms, formulas, and domain notation (`EMAT`, `ssthresh`, `3NF`, `SRTF`, $O(n)$ heap sums, $15000\text{ rpm}$ disk seek) that frequently suffer from **semantic drift** in pure dense vector search.

CALYPSO-RAG implements **Parallel Hybrid Retrieval** with **Reciprocal Rank Fusion (RRF $k=60$) from scratch**:
- **Lexical BM25 (`rank_bm25`)**: Captures exact formula variables, acronyms, and algorithmic notation.
- **Dense Vector Search (`BAAI/bge-small-en-v1.5` in persistent ChromaDB)**: Captures conceptual semantics and thematic intent.
- **RRF Equation**:
  $$\text{RRF}(d) = \sum_{m \in \{\text{BM25}, \text{Dense}\}} \frac{1}{k + r_m(d)} \quad (k = 60)$$
- **Cross-Encoder Attention (`cross-encoder/ms-marco-MiniLM-L-6-v2`)**: Scores top candidate chunk-query pairs with full cross-attention and sigmoid normalization:
  $$\text{Score}_{\text{norm}}(q, d) = \sigma(\text{logit}(q, d)) = \frac{1}{1 + e^{-\text{logit}(q, d)}}$$

#### Real-World Fusion Provenance Example:
For query *"Consider a hard disk with a rotational speed of 15000 rpm... transfer data from 10 randomly located sectors in tracks 5, 12 and 7"*:
- **BM25 Rank**: #1 (`BM25 Score: 229.71`)
- **Dense Rank**: #1 (`Cosine Distance: 0.0861`)
- **Fused RRF Score**: `0.0328`
- **Cross-Encoder Score**: **`0.9944`** (Rank #1)

---

### 2. Corrective-RAG (CRAG) for Exam Preparation
Students often formulate queries colloquially or vaguely (e.g., *"slow speed when network packet drops"* or *"time speed heap"*). CALYPSO-RAG employs a **Corrective Relevance Gate** with domain-specific query expansion ontology.

When the cross-encoder relevance score drops below threshold $\tau = 0.50$, the system automatically intercepts the flow, applies domain expansion, and re-executes hybrid retrieval.

```
[Original Query] "slow speed when network packet drops"
  └── Initial Cross-Encoder Relevance: 0.0137  (FAIL < 0.50)
  └── CRAG Interception: Triggering Domain Expansion (Method: domain_rule_expansion_hybrid)
  └── Rewritten Query: "slow speed when network packet drops TCP congestion control Slow Start Congestion Avoidance Fast Recovery cwnd ssthresh"
  └── Re-retrieved Context: networks_notes.md (TCP Congestion Control Algorithms)
  └── Post-Reformulation Relevance: 0.9963  (PASSED ✅, Delta: +0.9826)
```

Every reformulation attempt is persisted to `data/eval/crag_reformulation_log.jsonl` for auditability and fine-tuning data collection.

---

### 3. Sentence-Level Semantic Citation Mapping
Instead of coarse document-level citations, CALYPSO-RAG parses the generated response into individual claims and computes cosine similarity against retrieved chunk embeddings:
- **Embedding Model**: `BAAI/bge-small-en-v1.5`
- **Attribution Threshold**: $\ge 0.60$ cosine similarity.
- **Negative Grounding Guarantee**: If the retrieved context is insufficient, the prompt's strict negative constraint forces the model to state *"The question is not covered in retrieved material"*, preventing hallucinations.

---

## 📊 RAGAS Evaluation Results (20 GATE CS Benchmarks)

CALYPSO-RAG was evaluated across **20 handcrafted benchmark questions** covering Operating Systems, DBMS, Algorithms, Networks, Theory of Computation, and Compiler Design with gold-standard answers and keywords.

| Metric | Target | Actual Score | Status | Definition |
| :--- | :--- | :--- | :--- | :--- |
| **Context Precision** | $\ge 0.75$ | **0.8500** (85.0%) | **✅ Passed** | Ratio of retrieved chunks that are relevant and high-confidence. |
| **Context Recall** | $\ge 0.75$ | **0.7500** (75.0%) | **✅ Passed** | Ratio of gold-standard technical concepts present in retrieved context. |
| **Faithfulness** | $\ge 0.75$ | **0.7815** (78.2%) | **✅ Passed** | Proportion of generated sentences backed by semantic source citations. |
| **Answer Relevance** | $\ge 0.75$ | **0.8145** (81.5%) | **✅ Passed** | Dense semantic similarity between model response and ground truth. |
| **Composite Overall** | $\ge 0.75$ | **0.7990** (79.9%) | **✅ Passed** | Unweighted mean across all 4 evaluation dimensions. |

*Full per-question breakdown and metrics report available in [`data/eval/eval_summary.md`](data/eval/eval_summary.md) and [`data/eval/results.json`](data/eval/results.json).*

---

## 🚀 Quickstart & Reproduction Guide

### 1. Prerequisites & Installation
```bash
# Clone the repository
git clone https://github.com/piyush23-eng/CALYPSO-RAG.git
cd CALYPSO-RAG

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Build the Dual Index
Ingests markdown docs from `data/raw/` across all 10 GATE subjects (62 structured chunks) into BM25 and ChromaDB:
```bash
python scripts/build_index.py
```

### 3. Run the Automated Test Suite (22 Tests)
```bash
pytest tests/ -v
```

### 4. Run the Evaluation Harness
Evaluates the full pipeline against all 20 benchmark questions and outputs results:
```bash
python scripts/run_evaluation.py
```

### 5. Fine-Tune the Reasoning LLM on Real GATE CS Data (QLoRA)
CALYPSO includes an end-to-end dataset extraction and 4-bit QLoRA fine-tuning pipeline:
```bash
# 1. Extract ChatML instruction dataset from real 1990-2026 GATE CS archives
python scripts/prepare_training_data.py

# 2. Run 4-Bit QLoRA Fine-Tuning (Requires CUDA GPU or run via Google Colab)
python scripts/train_qlora.py --epochs 4 --batch_size 2 --lr 2e-4
```
*You can also open [`notebooks/train_calypso_qlora.ipynb`](notebooks/train_calypso_qlora.ipynb) in [Google Colab](https://colab.research.google.com/) for 1-click free T4 GPU training!*

### 6. Launch the Custom Editorial React + Tailwind Frontend & FastAPI Server
```bash
# 1. Build the React production bundle (inside frontend/)
cd frontend && npm install && npm run build && cd ..

# 2. Start the unified FastAPI backend server (serves API + static React frontend)
uvicorn src.api.server:app --host 0.0.0.0 --port 8000
```
*Open [http://localhost:8000](http://localhost:8000) in your browser!*

### 7. Launch Vite Development Server (Hot Module Reloading)
```bash
# Terminal 1: Backend API
uvicorn src.api.server:app --host 0.0.0.0 --port 8000

# Terminal 2: Frontend Dev Server
cd frontend && npm run dev
```

### 8. Launch the Terminal Showcase / Interactive Demo
```bash
# Multi-scenario showcase mode:
python scripts/demo.py

# Interactive terminal mode:
python scripts/demo.py --interactive
```

---

## 🌐 Production Deployment Guide

### Deploy to Render / Railway / Fly.io (FastAPI + React):
1. The FastAPI backend automatically serves the pre-compiled `frontend/dist` static assets at `/`.
2. Set build command: `pip install -r requirements.txt && cd frontend && npm install && npm run build && cd .. && python scripts/build_index.py`
3. Set start command: `uvicorn src.api.server:app --host 0.0.0.0 --port $PORT`

---

## 📂 Repository Structure

```
calypso-rag/
├── data/
│   ├── raw/                              # Real GATE CS 1990-2026 archives & syllabus
│   │   ├── algo_pyqs_1990_2026.md        # Algorithms PYQs (Floyd's Heap, Master Thm, DP)
│   │   ├── algorithms_notes.md           # Algorithms Core Concepts
│   │   ├── coa_math_pyqs_1990_2026.md    # COA & Math PYQs (Hard Disk, Pipelining, Cache, Bayes)
│   │   ├── dbms_notes.md                 # DBMS Core Concepts
│   │   ├── dbms_pyqs_1990_2026.md        # DBMS PYQs (Strict 2PL, Normalization, B+ Trees)
│   │   ├── gate_cs_syllabus.md           # Complete GATE CS Syllabus
│   │   ├── gate_pyq_archive.md           # Foundational PYQ Archive
│   │   ├── networks_notes.md             # Computer Networks Core Concepts
│   │   ├── networks_pyqs_1990_2026.md    # Networks PYQs (TCP Congestion, CSMA/CD, CIDR)
│   │   ├── os_notes.md                   # Operating Systems Core Concepts
│   │   ├── os_pyqs_1990_2026.md          # OS PYQs (EMAT, SRTF, Banker's, Belady's Anomaly)
│   │   ├── toc_compiler_notes.md         # TOC & Compilers Core Concepts
│   │   └── toc_compiler_pyqs_1990_2026.md# TOC & Compilers PYQs (Decidability, LR Parsers)
│   ├── processed/                        # Persistent indices (ChromaDB + BM25 pickle)
│   │   ├── bm25_index.pkl
│   │   └── chroma_db/
│   ├── train_gate_cs_dataset.jsonl       # Extracted ChatML instruction dataset for fine-tuning
│   └── eval/                             # Benchmark dataset, results, and audit logs
│       ├── eval_dataset.json             # 20 handcrafted GATE CS QA benchmarks
│       ├── eval_summary.md               # Evaluation markdown report
│       ├── results.json                  # Detailed evaluation scores
│       └── crag_reformulation_log.jsonl  # CRAG audit trace logs
├── frontend/                             # Custom React + TypeScript + Vite + Tailwind UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.tsx                  # Display typography header, underlined input, chips
│   │   │   ├── Marquee.tsx               # Infinite loop topic ticker with retrieval acceleration
│   │   │   ├── AnswerSection.tsx         # KaTeX solution rendering, hover-reveal evidence cards
│   │   │   ├── EvaluationView.tsx        # "The Numbers." large typographic comparison blocks
│   │   │   └── Footer.tsx                # Studio footer with GitHub & evaluation route toggles
│   │   ├── services/
│   │   │   └── api.ts                    # Backend API client
│   │   ├── types/
│   │   │   └── index.ts                  # TypeScript interfaces
│   │   ├── App.tsx                       # Main React App component
│   │   └── index.css                     # Obsidian theme & custom animations
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── notebooks/
│   └── train_calypso_qlora.ipynb         # 1-Click Google Colab 4-bit QLoRA fine-tuning notebook
├── src/
│   ├── api/                              # FastAPI REST API & Static UI Mount
│   │   └── server.py
│   ├── ingestion/                        # Phase 1: Topic-aware chunking & dual indexing
│   │   ├── chunker.py
│   │   └── indexer.py
│   ├── retrieval/                        # Phases 2 & 3: Hybrid RRF, Cross-Encoder & CRAG
│   │   ├── hybrid_retriever.py
│   │   ├── reranker.py
│   │   └── relevance_gate.py
│   ├── generation/                       # Phase 4: Calypso Client & Sentence Citation Mapper
│   │   ├── calypso_client.py
│   │   └── citation_mapper.py
│   ├── agent/                            # Phase 5: LangGraph Cyclic State Graph Orchestrator
│   │   └── orchestrator.py
│   └── evaluation/                       # Phase 6: RAGAS Metrics Calculation Engine
│       └── evaluator.py
├── scripts/
│   ├── build_index.py                    # Ingestion & index builder CLI
│   ├── prepare_training_data.py          # Dataset extractor from markdown to ChatML JSONL
│   ├── train_qlora.py                    # 4-Bit QLoRA production fine-tuning script
│   ├── test_retrieval.py                 # Phase 2 hybrid retrieval test script
│   ├── test_relevance_gate.py            # Phase 3 CRAG demonstration script
│   ├── test_generation.py                # Phase 4 generation & citation script
│   ├── test_agent.py                     # Phase 5 LangGraph agent demonstration
│   ├── run_evaluation.py                 # Phase 6 full evaluation harness runner
│   └── demo.py                           # Phase 7 rich terminal interactive demo
├── tests/                                # Full Pytest Test Suite (22 Unit & Integration Tests)
│   ├── test_phase1.py
│   ├── test_phase2.py
│   ├── test_phase3.py
│   ├── test_phase4.py
│   ├── test_phase5.py
│   └── test_phase6.py
├── requirements.txt
└── README.md
```

---

## 🎓 Technical Interview Defense Notes

1. **Why from-scratch RRF over library abstractions?**
   - Eliminates hidden defaults, ensures deterministic rank weighting with transparent provenance (`bm25_score`, `bm25_rank`, `dense_score`, `dense_rank`, `rrf_score`), and is easily defensible on a whiteboard.
2. **Why Cross-Encoder reranking over Bi-Encoder similarity alone?**
   - Bi-encoders compute independent embeddings $u = f(q)$ and $v = f(d)$ with late cosine dot product, missing fine-grained cross-token interactions. Cross-encoders attend to all token pairs $q \times d$ simultaneously, drastically boosting precision for dense mathematical concepts.
3. **How does CRAG handle out-of-domain questions?**
   - Caps reformulation loops at $2$ iterations. If cross-encoder relevance remains below $\tau = 0.50$, it flags `is_low_confidence = True` and activates negative prompt constraints to prevent hallucinations.

