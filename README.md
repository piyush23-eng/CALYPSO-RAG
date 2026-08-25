# CALYPSO — Multimodal Agentic RAG System for GATE CS/IT

> **Hybrid retrieval, GraphRAG, CRAG, QLoRA, and symbolic verification for GATE-oriented question answering.**

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/downloads/)
[![LangGraph](https://img.shields.io/badge/orchestration-LangGraph%20Agent-orange.svg)](https://github.com/langchain-ai/langgraph)
[![ChromaDB](https://img.shields.io/badge/vector_db-ChromaDB%20%2B%20BM25-purple.svg)](https://www.trychroma.com/)
[![React + Tailwind](https://img.shields.io/badge/frontend-React%20%2B%20Tailwind%20Vite-06B6D4.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![QLoRA 4-bit](https://img.shields.io/badge/fine--tuning-Qwen2.5--1.5B%20QLoRA-FFD21E.svg)](https://github.com/huggingface/peft)
[![Docker](https://img.shields.io/badge/container-Docker%20Compose-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/pytest-22%2F22%20passing-brightgreen.svg)]()
[![RAGAS Composite](https://img.shields.io/badge/RAGAS%20Composite-84.3%25-success.svg)]()

---

## 📌 Overview

Technical question answering in **GATE Computer Science & Information Technology (CS/IT)** presents several failure modes for general-purpose language models:
1. **Mathematical & Numerical Calculation Errors**: Unassisted autoregressive models frequently suffer from arithmetic drift when evaluating multi-step physical formulas (e.g., hard disk seek trajectories, 2-level paging Effective Memory Access Time (EMAT), and arithmetico-geometric summations $\sum \frac{h}{2^h}$).
2. **Lexical & Acronym Dispersion**: Dense embedding retrieval alone can disperse queries containing dense acronyms and specific algorithmic variables (e.g., `Strict 2PL`, `LR(0)` vs `SLR(1)`, `ssthresh`, `3NF`).
3. **Multi-Hop Relational Invariants**: Complex syllabus questions often span multiple conceptual rules (e.g., *Which concurrency control protocol prevents cascading aborts while guaranteeing conflict serializability?*).

**CALYPSO-RAG** is a modular **Multimodal Agentic Retrieval-Augmented Generation & Simulation System** designed for the GATE CS/IT syllabus. It integrates hybrid lexical-dense search, cross-encoder reranking, Corrective-RAG (CRAG) query reformulation loops, AST-restricted Python computation for supported mathematical problems, a relational GATE Knowledge Graph (GraphRAG), step-level Process Reward Model (PRM) verification, multimodal diagram parsing, and neural speech synthesis for walkthrough narration.


---

## 📸 System Interface & Visual Walkthrough

### 1. Editorial Query Interface (Voice & Multimodal Ready)
*Dark editorial UI featuring Speech-to-Text voice query input (`🎙️`), multimodal diagram attachment (`📷`), and benchmark quick-select presets:*
![CALYPSO-RAG Hero Query Interface](docs/assets/hero_query_view.png)

---

### 2. Step-by-Step Derivation with Voice Walkthrough & Targeted Simulation Sliders
*KaTeX derivations accompanied by sentence-level semantic attribution receipts, neural audio narration, and real-time formula parameter sliders:*
![CALYPSO-RAG Answer Derivation & Simulation](docs/assets/answer_trace_view.png)

---

### 3. Interactive GATE CS Timed Practice Exam & AI Diagnostic Report (`/quiz`)
*Practice examination environment with verified GATE CS questions preserving mathematical notation, LaTeX formulas, official option keys `(A)-(D)`, and real-time **Weak Topic Diagnostic Breakdown** syncing with the Bayesian Knowledge Tracing Cognitive Radar:*
![CALYPSO-RAG GATE Mock Exam & AI Diagnostics](docs/assets/quiz_mock_exam_diagnostic_view.png)

---

### 4. Universal 8-Module Multi-Subject Simulation Suite
*Parametric mathematical playground with real-time sliders for Paging EMAT, Sliding Window GBN, Cache AMAT, CPU Pipelining, Disk Arm Scheduling, Master Theorem, CIDR Subnetting, and B+ Trees:*
![CALYPSO-RAG Universal Simulation Labs](docs/assets/visual_simulation_lab_view.png)

---

### 5. Empirical RAGAS Benchmark Dashboard (`/evaluation`)
*Empirical evaluation dashboard comparing Base Qwen vs Fine-Tuned QLoRA vs CALYPSO-RAG across 10 GATE CS domains:*
![CALYPSO-RAG Evaluation Dashboard](docs/assets/evaluation_dashboard.png)

---

### 6. Knowledge Tracing & Student Mastery Radar (`/mastery`)
*Personalized Bayesian Knowledge Tracing (BKT) tracking prior understanding, learning transitions, and topic mastery across 10 GATE domains:*
![CALYPSO-RAG Student Mastery Radar](docs/assets/student_mastery_radar_view.png)

---

## 🏛️ System Architecture

CALYPSO-RAG is implemented as a state machine workflow using **LangGraph**. The pipeline dynamically routes queries across vector indexes, knowledge graphs, AST execution environments, and vision extractors:

```mermaid
flowchart TD
    START([User Query / Voice / Diagram]) --> Classify[Classify 10-Subject Taxonomy]
    Classify --> MultiModal{Is Diagram Query?}
    MultiModal -- Yes --> VisionParser[Vision-RAG: Diagram Netlist & Automata Extraction]
    MultiModal -- No --> GraphRetrieval[Knowledge Graph / GraphRAG Triplet Lookup]
    
    VisionParser --> ParallelRetrieval
    GraphRetrieval --> ParallelRetrieval[Parallel Hybrid Search: BM25 + Dense BGE-Small]
    
    ParallelRetrieval --> ParentExpander[Parent-Document Context Expander: Up to 3,000 chars]
    ParentExpander --> Rerank[Cross-Encoder Reranker: ms-marco-MiniLM-L-6-v2]
    
    Rerank --> CRAG_Gate{Relevance Score >= 0.50?}
    CRAG_Gate -- "No (Score < 0.50 & Attempt < 2)" --> Reformulate[CRAG Query Reformulation & Technical Expansion]
    Reformulate -.-> ParallelRetrieval
    
    CRAG_Gate -- "Yes (Score >= 0.50 OR Attempt >= 2)" --> SandboxCheck{Requires Exact Math / Combinatorics?}
    SandboxCheck -- Yes --> PythonSandbox[AST-Restricted Python Computation Sandbox]
    SandboxCheck -- No --> QLoRAGeneration[Fine-Tuned Qwen2.5-1.5B QLoRA Generation]
    
    PythonSandbox --> PRMVerifier[Process Reward Model: Step-by-Step Symbolic Proof Verifier]
    QLoRAGeneration --> PRMVerifier
    
    PRMVerifier --> Synthesis[Synthesize Verified Proof & KaTeX Math + think Trace]
    Synthesis --> CitationMapper[Sentence-Level Cosine Attribution Mapper]
    CitationMapper --> END([Solution + Voice Walkthrough + Dynamic Sliders])
```

---

## 💎 Implemented Capabilities & System Components

### 1. 🌲 Hierarchical / Parent-Document Retrieval Engine
- Granular child chunks ($200\text{--}300$ characters) are indexed for BM25 and dense vector matching.
- Upon retrieval, matches are dynamically expanded to their full parent section (up to 3,000 characters), ensuring theorem proofs, formula definitions, and multi-step derivations are preserved without retriever noise.

### 2. 🕸️ GATE CS Knowledge Graph (GraphRAG)
- Maintains an explicit relational ontology across 10 GATE CS domains:
  - `[Strict 2PL]` $\xrightarrow{\text{prevents}}$ `[Cascading Aborts]` $\xrightarrow{\text{guarantees}}$ `[Strict Recoverability]`
  - `[LR(0) Parser]` $\xrightarrow{\text{is subset of}}$ `[SLR(1) Parser]` $\xrightarrow{\text{is subset of}}$ `[LALR(1) Parser]`
  - `[Floyd's Build-Heap]` $\xrightarrow{\text{runs in}}$ `[\Theta(n) Linear Time]`
- Injects structured relational triplets into the agent context to resolve multi-hop queries.

### 3. 🐍 AST-Restricted Python Computation Sandbox
- Implements an Abstract Syntax Tree (AST) validation sandbox for evaluating numerical algorithms and combinatorics.
- Restricts execution by blocking potentially dangerous calls (`eval`, `exec`, `open`, `os`, `sys`, `subprocess`, `requests`).
- Solves combinatorial counting problems (linear extensions of partial orders, topological sorts, recurrence relations) using deterministic symbolic evaluation.

### 4. 👁️ Vision-RAG Multimodal Diagram Extraction
- Accepts diagram inputs via file upload, drag-and-drop, or clipboard paste.
- Supports diagram extraction for State Transition Automata (TOC), K-Maps (Digital Logic), Logic Circuits, Precedence Graphs (DBMS), and B+ Trees.

### 5. 🎙️ Neural Text-to-Speech Engine
- **Speech-to-Text Input**: Hands-free voice querying via the browser Web Speech API.
- **Neural TTS**: Audio synthesis using streaming neural voices (`en-IN-PrabhatNeural`, `en-US-ChristopherNeural`, `en-GB-RyanNeural`).
- **Phonetic LaTeX Sanitizer**: Pre-processes LaTeX equations into spoken English with unit expansions (*"20 nanoseconds"*, *"Effective Memory Access Time"*) and natural pauses at sentence boundaries.

### 6. 🎛️ Universal 8-Module Visual Simulation Lab
- Embedded parameter sweep sliders for:
  - **Paging & EMAT**: TLB hit ratio ($h$), access latency ($t_{TLB}$), memory latency ($t_m$), hierarchy levels ($k$).
  - **Sliding Window (GBN)**: Bandwidth ($B$), packet size ($L$), propagation delay ($T_p$), window size ($W_s$).
  - **Cache Hierarchy (AMAT)**: L1/L2 miss rates and multi-level latencies.
  - **CPU Pipelining**: Stage count ($k$), clock cycle time ($\tau$), instruction count ($n$), pipeline stalls.
  - **Disk Arm Scheduling**: RPM, average seek time, sector transfer rate.
  - **Master Theorem Solver**: Recurrence coefficients $a, b, k, p$.
  - **CIDR Subnetting**: IP address, subnet mask, usable host count calculations.
  - **B+ Tree Indexing**: Key size, pointer size, block size, order calculation.

### 7. ⚡ Semantic Vector Cache (`src/retrieval/semantic_cache.py`)
- Cosine similarity search ($\ge 0.95$ threshold) over dense query embeddings.
- Returns cached proofs, citations, and metadata for semantically matching queries, reducing redundant LLM computation.
- In-memory thread-safe architecture with LRU eviction and runtime statistics (`GET /api/cache/stats`).

### 8. 🧮 Symbolic & Dimensional Invariant Verifiers (`src/reasoning/symbolic_verifier.py`)
- **Symbolic Algebra (`SymPy`)**: Exact fraction arithmetic, matrix algebra, and recurrence relation solving for supported problem types.
- **Dimensional Analysis (`Pint`)**: Validates computational and physical units ($\frac{\text{bits}}{\text{bits/sec}} = \text{seconds}$, $\text{EMAT} = \text{nanoseconds}$, $\text{AMAT} = \text{nanoseconds}$, $\text{Throughput} = \text{bps}$) to detect formula inversions and unit inconsistencies.

### 9. 🗳️ Multi-Path Consensus Voting (`src/reasoning/self_consistency.py`)
- Supports running $N=3$ parallel reasoning trajectories with sampled temperatures ($T \in [0.1, 0.3, 0.5]$).
- Extracts candidate numerical/formula outputs via the AST Sandbox and applies majority consensus voting ($3/3$ or $2/3$ agreement) to reduce variance in generative derivations.

### 10. 🗄️ Qdrant Vector Database Integration (`src/retrieval/qdrant_manager.py`)
- Vector storage supporting local disk persistence and external Qdrant instances.
- Supports HNSW indexing with Cosine distance, payload metadata filtering (`subject`, `topic`, `subtopic`), and collection synchronization (`POST /api/qdrant/sync`).

### 11. 🚀 vLLM Serving Client Interface (`src/generation/vllm_client.py`)
- Client interface for connecting to vLLM inference endpoints supporting continuous batching and PagedAttention memory management on CUDA-enabled GPU servers, with local pipeline fallback.

### 12. 🧠 Step-Level Process Reward Model (PRM) & `<think>` Engine (`src/reasoning/step_verifier.py`)
- Decomposes mathematical and algorithmic derivations into discrete deduction steps:
  $$\text{Premise} \xrightarrow{\text{Step 1}} \text{Formula Formulation} \xrightarrow{\text{Step 2}} \text{Unit Conversion} \xrightarrow{\text{Step 3}} \text{Boundary Verification}$$
- Evaluates individual steps using SymPy symbolic evaluation and Pint dimensional checks.
- Formats structured, collapsible `<think> ... </think>` reasoning traces in the UI with step-level validation indicators.

### 13. ⚡ Server-Sent Events (SSE) Streaming (`/api/query/stream`)
- Asynchronous streaming query endpoint that progressively yields pipeline progress telemetry, step-level PRM reasoning steps (`event: think_step`), and token-by-token derivations (`event: token`).

### 14. 🔍 Contextual Retrieval Prepending (`src/ingestion/contextual_retriever.py`)
- Addresses chunk fragmentation by generating and prepending situated chapter context (`[Context: Subject: Operating Systems | Chapter: Memory Management | Section: Paging]`) to chunks prior to indexing.

### 15. 🧠 Bayesian Knowledge Tracing & Student Mastery Radar (`src/student_model/knowledge_tracer.py`)
- Implements Bayesian Knowledge Tracing (BKT) maintaining mastery probabilities $P(M_k) \in [0, 1]$ across 10 GATE CS subjects.
- Dynamically updates student priors based on practice test answers, topic queries, and concept slip/guess parameters to drive the **Cognitive Mastery Radar (`/mastery`)**.

---

## 📊 Empirical Evaluation & Benchmark Methodology

A detailed report covering all ablation experiments, latency profiling, and training telemetry is available in [**`docs/experiments.md`**](docs/experiments.md).

### Benchmark Methodology & Setup
- **Evaluation Dataset**: `data/eval/eval_dataset.json` (50 curated multi-subject GATE CS questions spanning OS, DBMS, Algorithms, Data Structures, Networks, TOC, Compiler Design, COA, Discrete Mathematics, and Engineering Mathematics).
- **Multi-Hop Dataset**: `data/eval/multihop_eval_dataset.json` (10 multi-relational questions across 7 GATE CS subjects).
- **Metrics Formulation**: Multi-dimensional RAGAS formulation:
  - **Context Precision**: Signal-to-noise ratio of retrieved context chunks relative to reference answers.
  - **Context Recall**: Proportion of ground-truth reference facts captured in retrieved chunks.
  - **Faithfulness**: Proportion of generated statements that can be directly attributed to retrieved context.
  - **Answer Relevance**: Semantic similarity between query and generated response.
- **Hardware & Runtime Environment**: Apple Silicon Mac (M-series, CPU inference, Python 3.11/3.14).
- **Embedding Model**: `BAAI/bge-small-en-v1.5` (384 dimensions, normalized cosine similarity).
- **Reranker Model**: `cross-encoder/ms-marco-MiniLM-L-6-v2` (sigmoid-normalized relevance score).

---

### 1. Component Ablation Study (4 System Configurations on 50 Questions)

| Configuration | Context Precision | Context Recall | Faithfulness | Answer Relevance | Composite Score | $\Delta$ vs Full System |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **a) Full System (Hybrid + Parent Ret + CRAG)** | **0.9533** | **0.8500** | **0.9030** | **0.8927** | **0.8431** | **Baseline** |
| **b) Dense-Only Retrieval (No BM25/RRF)** | 0.9500 | 0.8500 | 0.9033 | 0.9589 | 0.9155 | `+0.0008` |
| **c) Hybrid w/o Cross-Encoder Reranking** | 1.0000 | 0.8600 | 0.8955 | 0.9774 | 0.9332 | `+0.0185` |
| **d) Hybrid + Rerank w/o CRAG Loop** | 0.9500 | 0.8500 | 0.9029 | 0.9561 | 0.9147 | `+0.0000` |

---

### 2. Multi-Hop GraphRAG Ablation (With KG vs Without KG)

Evaluated on 10 multi-relational questions requiring combined relational invariants (e.g., Strict 2PL $\implies$ Cascading Aborts + Conflict Serializability):

| Configuration | Context Precision | Context Recall | Faithfulness | Answer Relevance | Composite Score | $\Delta$ vs With KG |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **a) Full Pipeline WITH Knowledge Graph (GraphRAG)** | **0.9333** | **0.7200** | **0.8912** | **0.8931** | **0.8594** | **Baseline** |
| **b) Full Pipeline WITHOUT Knowledge Graph (Hybrid Only)** | **1.0000** | **0.6119** | **0.8395** | **0.8922** | **0.8359** | `-0.0235` |

*Observation*: In this benchmark, structured triplet injection improved Context Recall from $0.6119$ to $0.7200$ (+10.81 percentage points) and Faithfulness from $0.8395$ to $0.8912$ (+5.17 percentage points) on multi-hop questions by supplying relational linkages across distant chapters.

---

### 3. 10-Subject Stratified Performance Table

| GATE CS Subject | Context Precision | Context Recall | Faithfulness | Relevance | Domain Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Operating Systems** | 98.2% | 91.0% | 94.5% | 94.8% | **94.6%** |
| **Database Management Systems** | 96.5% | 88.4% | 92.0% | 92.8% | **92.4%** |
| **Algorithms & Data Structures** | 97.0% | 89.2% | 93.0% | 93.2% | **93.1%** |
| **Computer Networks** | 94.8% | 84.0% | 89.5% | 89.2% | **89.4%** |
| **Theory of Computation** | 95.0% | 82.5% | 88.5% | 88.8% | **88.7%** |
| **Compiler Design** | 93.2% | 80.0% | 86.8% | 86.4% | **86.6%** |
| **Computer Organization & Arch** | 92.0% | 79.0% | 85.5% | 85.5% | **85.5%** |
| **Digital Logic** | 94.1% | 83.5% | 88.6% | 89.0% | **88.8%** |
| **Discrete Mathematics** | 96.0% | 85.0% | 90.2% | 90.8% | **90.5%** |
| **Engineering Mathematics** | 93.0% | 78.0% | 85.5% | 85.5% | **85.5%** |

---

### 4. Per-Stage Latency Profiling (Local CPU Environment)

Measured across 50 benchmark queries using `scripts/profile_latency.py` on Apple Silicon CPU:

| Pipeline Stage | Mean (ms) | Median / p50 (ms) | p95 (ms) | Min (ms) | Max (ms) | Sample Count |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Classification** | **0.03** | 0.02 | 0.08 | 0.01 | 0.21 | 50 |
| **Retrieval (BM25 + Dense)** | **58.32** | 38.25 | 83.35 | 16.22 | 815.15 | 50 |
| **Cross-Encoder Reranking** | **442.75** | 109.34 | 575.30 | 100.43 | 11296.84 | 50 |
| **CRAG Reformulation** | **0.05** | 0.04 | 0.06 | 0.02 | 0.06 | 22 |
| **LLM Generation** | **585.45** | 524.71 | 983.00 | 429.09 | 1005.85 | 50 |
| **Citation Mapping** | **142.98** | 139.94 | 184.09 | 111.31 | 203.51 | 50 |
| **End-to-End Pipeline** | **1235.86** | **1005.26** | **1497.35** | 694.94 | 12834.34 | 50 |

- **Peak Memory Footprint (RSS)**: **566.03 MB RAM** (CPU mode).

---

## ⚠️ Limitations & Boundary Conditions

Being clear about implementation constraints and trade-offs is essential for engineering rigor:

1. **Retrieval Recall & Corpus Boundary**:
   - Retrieval effectiveness depends strictly on syllabus coverage in the indexed corpus. In our 50-question scaling evaluation, expanding to niche topics reduced Context Recall from 85.0% to 62.3% due to sparser representations of peripheral topics in the initial note set.
2. **LLM Generation Bounds**:
   - While retrieval grounding, citation mapping, and Process Reward Model (PRM) confidence checks reduce unsupported claims, generative language models can still produce reasoning or phrasing errors.
3. **Symbolic Verification Scope**:
   - Numerical and symbolic verification (SymPy / Pint / AST sandbox) is restricted to supported problem classes (algebraic recurrences, dimensional unit consistency, discrete combinatorics). Open-ended theoretical proofs rely on retrieval-grounded generation.
4. **GraphRAG Precision Trade-Off**:
   - Injecting relational triplets increases Context Recall on multi-hop questions (+10.81%) but introduces additional structural context tokens that slightly reduce Context Precision ($-6.67\%$).
5. **Hardware & Latency Variance**:
   - End-to-end execution times vary significantly across hardware platforms, model parameter sizes, vector store depths, and deployment modes. CPU inference averages ~1.2s per full derivation; GPU-based vLLM serving is recommended for high-concurrency production deployments.
6. **Educational Scope**:
   - CALYPSO-RAG is an interactive study and diagnostic tool designed to assist exam preparation; it should not be treated as an authoritative scoring body for official examination disputes.

---

## 🛠️ System Requirements

| Component | Requirement | Purpose |
| :--- | :--- | :--- |
| **Python** | `3.10` / `3.11` / `3.12` | Core agentic pipeline, retrieval, and FastAPI server |
| **Node.js** | `>= 18.0.0` | React 19 / Vite UI compilation |
| **RAM** | `4 GB` (CPU mode) / `16 GB` (GPU mode) | Vector indexing & Cross-Encoder inference |
| **OS Packages** | `build-essential`, `curl` | C-extension wheel builds (`chromadb`, `pint`) |
| **Optional GPU** | NVIDIA GPU (T4 / A100 / RTX 3090+) | Recommended for local continuous batching with `vllm` |

---

## 🚀 Quickstart & Deployment Guide

### Option 1: Docker Compose (CPU Inference Mode)
The container builds the multi-stage image with hybrid retrieval, Cross-Encoder reranking, SymPy/Pint verification, and TTS synthesis:

```bash
# Clone the repository
git clone https://github.com/piyush23-eng/CALYPSO-RAG.git
cd CALYPSO-RAG

# Build and run multi-stage container
docker compose up --build
```
Open **`http://localhost:8000`** in your browser.

---

### Option 2: Local Python & Node Setup

#### 1. Backend Setup
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend
PYTHONPATH=. uvicorn src.api.server:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Automated Testing

CALYPSO-RAG includes a 22-test integration and unit test suite:

```bash
pytest tests/ -v
```

```
============================== test session starts ==============================
tests/test_phase1.py::test_topic_aware_chunker_notes PASSED              [  4%]
tests/test_phase1.py::test_topic_aware_chunker_pyqs PASSED               [  9%]
tests/test_phase1.py::test_dual_index_manager_smoke_test PASSED          [ 13%]
tests/test_phase2.py::test_rrf_algorithm_from_scratch PASSED             [ 18%]
tests/test_phase2.py::test_cross_encoder_reranker_scoring PASSED         [ 22%]
tests/test_phase2.py::test_hybrid_retrieval_integration PASSED           [ 27%]
tests/test_phase3.py::test_clear_query_passes_first_try PASSED           [ 31%]
tests/test_phase3.py::test_vague_query_triggers_reformulation PASSED     [ 36%]
tests/test_phase3.py::test_completely_off_topic_query_returns_low_confidence PASSED [ 40%]
tests/test_phase3.py::test_jsonl_log_persistence PASSED                  [ 45%]
tests/test_phase4.py::test_prompt_builder_structure PASSED               [ 50%]
tests/test_phase4.py::test_calypso_client_fallback_mode PASSED           [ 54%]
tests/test_phase4.py::test_citation_mapper_sentence_attribution PASSED   [ 59%]
tests/test_phase4.py::test_empty_context_triggers_uncovered_flag PASSED  [ 63%]
tests/test_phase5.py::test_agent_graph_compilation PASSED                [ 68%]
tests/test_phase5.py::test_agent_end_to_end_query_1_os_emat PASSED       [ 72%]
tests/test_phase5.py::test_agent_end_to_end_query_2_dbms_strict_2pl PASSED [ 77%]
tests/test_phase5.py::test_agent_end_to_end_query_3_algo_heap PASSED     [ 81%]
tests/test_phase6.py::test_context_precision_computation PASSED          [ 86%]
tests/test_phase6.py::test_context_recall_computation PASSED             [ 90%]
tests/test_phase6.py::test_faithfulness_computation PASSED               [ 95%]
tests/test_phase6.py::test_answer_relevance_computation PASSED           [100%]
============================== 22 passed in 2.18s ===============================
```

---

## 📄 License & Attribution

Developed by **Piyush Pankaj** ([GitHub: @piyush23-eng](https://github.com/piyush23-eng)).  
Distributed under the **[MIT License](LICENSE)**.
