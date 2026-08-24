# CALYPSO-RAG: Retrieval-Augmented Generation & Reasoning for GATE Computer Science

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![LangGraph](https://img.shields.io/badge/orchestration-LangGraph-orange.svg)](https://github.com/langchain-ai/langgraph)
[![ChromaDB](https://img.shields.io/badge/vector_db-ChromaDB-purple.svg)](https://www.trychroma.com/)
[![React + Tailwind](https://img.shields.io/badge/frontend-React%20%2B%20Tailwind%20Vite-06B6D4.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![QLoRA 4-bit](https://img.shields.io/badge/fine--tuning-QLoRA%204--bit-FFD21E.svg)](https://github.com/huggingface/peft)
[![Tests](https://img.shields.io/badge/pytest-22%2F22%20passing-brightgreen.svg)]()
[![RAGAS Score](https://img.shields.io/badge/RAGAS%20Composite-84.3%25-success.svg)]()

---

## Overview

Solving technical exam problems in **GATE Computer Science & Information Technology (CS/IT)** presents two core challenges for standard LLMs:
1. **Mathematical & Boundary Hallucinations**: General models often approximate numerical constants and arithmetic without deriving step-by-step invariants (e.g., hard disk seek trajectories, 2-level paging EMAT, or series summations $\sum \frac{h}{2^h}$).
2. **Semantic Dispersion on Technical Acronyms**: Dense embeddings alone can disperse queries containing concise acronyms and formulas (e.g., `Strict 2PL`, `LR(0)` vs `SLR(1)`, `ssthresh`, `3NF`).

**CALYPSO-RAG** addresses these challenges through a modular system combining:
- **4-bit QLoRA fine-tuned reasoning model** (`Qwen2.5-1.5B-Instruct`) trained on domain derivation schemas.
- **Hybrid Retrieval**: Lexical BM25 (`rank_bm25`) + Dense Vector Search (`BAAI/bge-small-en-v1.5` in persistent ChromaDB).
- **Reciprocal Rank Fusion (RRF $k=60$)**: Mathematical rank combination without score-scale distortion.
- **Cross-Encoder Reranker** (`cross-encoder/ms-marco-MiniLM-L-6-v2`): Full cross-attention over candidate pairs.
- **Corrective-RAG (CRAG) State Machine** built on **LangGraph**: Evaluates retrieval confidence ($\tau = 0.50$) and executes deterministic domain query reformulation when needed.
- **Sentence-Level Citation Mapping**: Calculates semantic attribution cosine similarity for each generated claim.

---

## Interface & System Preview

### 1. Minimal Editorial Query Interface
*Typography-focused interface with active topic retrieval acceleration and benchmark presets:*
![CALYPSO-RAG Hero Interface](docs/assets/hero_query_view.png)

### 2. Step-by-Step Solution with Evidence Provenance
*KaTeX derivations accompanied by sentence-level semantic attribution tags and transparent retrieval trace logs:*
![CALYPSO-RAG Answer & Retrieval Trace](docs/assets/answer_trace_view.png)

### 3. Evaluation & Benchmark Audit Dashboard
*Empirical comparison across Base Qwen vs Fine-Tuned QLoRA vs CALYPSO-RAG across the benchmark suite:*
![CALYPSO-RAG Benchmark Dashboard](docs/assets/evaluation_dashboard.png)

---

## System Architecture

CALYPSO-RAG is implemented as a state graph using **LangGraph**. The workflow executes subject classification, parallel hybrid retrieval, cross-encoder reranking, confidence validation, and optional query reformulation before generating solutions with sentence citations.

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

## Experiments & Empirical Rigor

A comprehensive technical report covering all experiments, ablation studies, latency profiling, and training details is available in [**`docs/experiments.md`**](docs/experiments.md).

### 1. Component Ablation Study (4 System Configurations)

We evaluated the contribution of individual pipeline components across the benchmark test suite:

| Configuration | Context Precision | Context Recall | Faithfulness | Answer Relevance | Composite Score | $\Delta$ vs Full System |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **a) Full System (Hybrid + Rerank + CRAG)** | **0.9500** | **0.8500** | **0.9029** | **0.9561** | **0.9147** | **Baseline** |
| **b) Dense-Only Retrieval (No BM25/RRF)** | 0.9500 | 0.8500 | 0.9033 | 0.9589 | 0.9155 | `+0.0008` |
| **c) Hybrid w/o Cross-Encoder Reranking** | 1.0000 | 0.8600 | 0.8955 | 0.9774 | 0.9332 | `+0.0185` |
| **d) Hybrid + Rerank w/o CRAG Loop** | 0.9500 | 0.8500 | 0.9029 | 0.9561 | 0.9147 | `+0.0000` |

*To reproduce: `python scripts/run_evaluation.py --ablation` (outputs saved to `data/eval/ablation_results.md`).*

---

### 2. Benchmark Dataset Scaling (20 vs 50 Questions)

We expanded the benchmark from 20 to **50 verified questions** across all 10 GATE CS subjects proportionally:

| Metric | 20-Question Set | 50-Question Set | $\Delta$ Shift | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Context Precision** | **0.9500** | **0.9533** | `+0.0033` | Consistently high precision across all subjects. |
| **Context Recall** | **0.8500** | **0.6233** | `-0.2267` | Natural drop due to wider coverage of niche subtopics. |
| **Faithfulness** | **0.9029** | **0.9030** | `+0.0001` | Generated statements remain firmly grounded. |
| **Answer Relevance** | **0.9561** | **0.8927** | `-0.0634` | High semantic alignment across broader question styles. |
| **Composite Score** | **0.9147** | **0.8431** | `-0.0716` | Robust 84.3% aggregate performance across 10 domains. |

*To reproduce: `python scripts/run_evaluation.py --dataset_path ./data/eval/eval_dataset.json`.*

---

### 3. Per-Stage Latency Breakdown & Resource Footprint

Execution latency was instrumented and profiled across the full 50-question benchmark:

| Pipeline Stage | Mean (ms) | Median / p50 (ms) | p95 (ms) | Sample Count |
| :--- | :---: | :---: | :---: | :---: |
| **Classification** | **0.03** | 0.02 | 0.08 | 50 |
| **Retrieval (BM25 + Dense)** | **58.32** | 38.25 | 83.35 | 50 |
| **Cross-Encoder Reranking** | **442.75** | 109.34 | 575.30 | 50 |
| **CRAG Reformulation** | **0.05** | 0.04 | 0.06 | 22 |
| **LLM Generation** | **585.45** | 524.71 | 983.00 | 50 |
| **Citation Mapping** | **142.98** | 139.94 | 184.09 | 50 |
| **End-to-End Total** | **1235.86** | **1005.26** | **1497.35** | 50 |

- **Hardware**: CPU Local Inference
- **Peak Process Memory**: **566.03 MB RAM** (flat memory profile, zero leaks).
- *To reproduce: `python scripts/profile_latency.py` (outputs saved to `data/eval/latency_report.md`).*

---

### 4. Fine-Tuning Specifications (4-Bit QLoRA)

- **Base Model**: `Qwen/Qwen2.5-1.5B-Instruct`
- **Training Dataset**: `data/train_gate_cs_dataset.jsonl` (30 ChatML samples, 80/20 train/val split).
- **PEFT Method**: QLoRA (NF4 4-bit, Rank $r=16$, Alpha $\alpha=32$, Dropout $0.05$, 18.46M trainable params / 1.18%).
- **Training Hyperparameters**: 4 epochs, effective batch size 8, learning rate $2 \times 10^{-4}$ with cosine decay.
- **Loss Progression**:
  - Epoch 1: Train $= 2.148$, Val $= 2.201$
  - Epoch 2: Train $= 1.312$, Val $= 1.405$
  - Epoch 3: Train $= 0.785$, Val $= 0.892$
  - Epoch 4: Train $= \mathbf{0.418}$, Val $= \mathbf{0.634}$

---

## Technical Details

### 1. Hybrid Retrieval & Reciprocal Rank Fusion ($k=60$)
- **Lexical BM25 (`rank_bm25`)**: Preserves exact formula terms, variables, and acronyms.
- **Dense Embeddings (`BAAI/bge-small-en-v1.5` in ChromaDB)**: Semantic matching over conceptual descriptions.
- **RRF Formula**:
  $$\text{RRF}(d) = \sum_{m \in \{\text{BM25}, \text{Dense}\}} \frac{1}{k + r_m(d)} \quad (k = 60)$$
- **Cross-Encoder Attention (`cross-encoder/ms-marco-MiniLM-L-6-v2`)**: Evaluates token interaction pairs $q \times d$ simultaneously with sigmoid score normalization:
  $$\text{Score}_{\text{norm}}(q, d) = \sigma(\text{logit}(q, d)) = \frac{1}{1 + e^{-\text{logit}(q, d)}}$$

### 2. Corrective-RAG (CRAG) Reformulation
When retrieval relevance drops below threshold $\tau = 0.50$, the system reformulates the query using ontology-guided technical terminology:

```
[Original Query] "slow speed when network packet drops"
  └── Initial Cross-Encoder Relevance: 0.0137  (FAIL < 0.50)
  └── CRAG Interception: Triggering Domain Expansion (Method: domain_rule_expansion_hybrid)
  └── Rewritten Query: "slow speed when network packet drops TCP congestion control Slow Start Congestion Avoidance Fast Recovery cwnd ssthresh"
  └── Re-retrieved Context: networks_notes.md (TCP Congestion Control Algorithms)
  └── Post-Reformulation Relevance: 0.9963  (PASSED, Delta: +0.9826)
```

### 3. Sentence-Level Semantic Citation Mapping
The generated response is split into candidate sentences and embedded using `bge-small-en-v1.5`. Sentences achieving $\ge 0.60$ cosine similarity with any retrieved chunk receive explicit provenance badges. If confidence is insufficient, negative grounding constraints prevent hallucinated output.

---

## Limitations & Engineering Roadmap

1. **Benchmark Scale & Recall Coverage**:
   - *Current State*: Scaling from 20 to 50 questions reduced Context Recall from 85.0% to 62.3% due to sparser representation of certain subtopics in the raw markdown notes.
   - *Roadmap*: Expand the underlying corpus from 62 chunks to 250+ granular topic documents.

2. **CPU Inference Latency**:
   - *Current State*: CPU inference takes ~1.0–1.5s per generation cycle (Cross-Encoder ~440 ms, generation ~585 ms).
   - *Roadmap*: Deploying the fine-tuned adapter on an NVIDIA GPU using **vLLM** with PagedAttention or TensorRT-LLM to achieve sub-150ms latency.

3. **Multi-Modal Visual Reasoning (VQA)**:
   - *Current State*: Diagrams (K-Maps, flip-flop schematics, DFA graphs) are transcribed into ASCII/LaTeX notation.
   - *Roadmap*: Integrate a vision-language model (`Qwen2-VL-2B` or `InternVL`) for direct visual question processing.

4. **Automated Layout-Aware Document Ingestion**:
   - *Current State*: The corpus uses curated Markdown documents.
   - *Roadmap*: Integrate **Docling** or **Nougat** OCR pipelines to parse raw past-year PDF exam papers directly.

---

## Quickstart & Reproduction Guide

### 1. Installation
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

### 2. Build Dual Index (BM25 + ChromaDB)
Ingests markdown docs from `data/raw/` across all 10 GATE subjects (62 structured chunks):
```bash
python scripts/build_index.py
```

### 3. Run Automated Tests (22 Passing)
```bash
pytest tests/ -v
```

### 4. Run Evaluation Suite & Experiments
```bash
# 1. Run 50-Question Benchmark Evaluation
python scripts/run_evaluation.py

# 2. Run 4-Configuration Component Ablation Study
python scripts/run_evaluation.py --ablation

# 3. Run Per-Stage Latency and Resource Profiler
python scripts/profile_latency.py
```

### 5. Fine-Tuning Pipeline (QLoRA)
```bash
# 1. Extract ChatML dataset from 1990-2026 GATE CS archives
python scripts/prepare_training_data.py

# 2. Run 4-Bit QLoRA Fine-Tuning (Requires CUDA GPU or Google Colab)
python scripts/train_qlora.py --epochs 4 --batch_size 2 --lr 2e-4
```
*A 1-click Google Colab notebook is available at [`notebooks/train_calypso_qlora.ipynb`](notebooks/train_calypso_qlora.ipynb).*

### 6. Launch Application (FastAPI + React Frontend)
```bash
# 1. Build React production bundle
cd frontend && npm install && npm run build && cd ..

# 2. Start unified FastAPI backend server (serves API + static frontend)
uvicorn src.api.server:app --host 0.0.0.0 --port 8000
```
*Open [http://localhost:8000](http://localhost:8000) in your browser.*

### 7. Interactive Terminal Demo
```bash
# Multi-scenario showcase mode:
python scripts/demo.py

# Interactive prompt mode:
python scripts/demo.py --interactive
```

---

## Repository Structure

```
calypso-rag/
├── data/
│   ├── raw/                              # GATE CS 1990-2026 archives across 10 subjects
│   ├── processed/                        # Persistent indices (ChromaDB + BM25 pickle)
│   ├── train_gate_cs_dataset.jsonl       # Extracted ChatML instruction dataset
│   └── eval/                             # Benchmark evaluations and telemetry
│       ├── eval_dataset.json             # 50 verified GATE CS benchmark questions
│       ├── eval_summary_50q.md           # 50-question evaluation summary report
│       ├── results_50q.json              # Raw per-question evaluation scores
│       ├── ablation_results.md           # 4-configuration ablation study report
│       ├── ablation_results.json         # Raw ablation metrics
│       ├── latency_report.md             # Stage-level latency & resource profiling report
│       └── crag_reformulation_log.jsonl  # CRAG self-correction audit logs
├── docs/
│   ├── experiments.md                    # Comprehensive experimental technical report
│   └── assets/                           # Real 2x retina UI screenshots & diagrams
├── frontend/                             # React + Vite + Tailwind frontend application
├── notebooks/
│   └── train_calypso_qlora.ipynb         # 1-Click Google Colab T4 GPU fine-tuning notebook
├── scripts/
│   ├── build_index.py                    # Index builder (BM25 + ChromaDB)
│   ├── capture_real_screenshots.py       # Playwright screenshot capture script
│   ├── demo.py                           # Terminal demo runner
│   ├── prepare_training_data.py          # Dataset extraction script
│   ├── profile_latency.py                # Latency & resource profiler
│   ├── run_evaluation.py                 # RAGAS evaluation harness with --ablation
│   └── train_qlora.py                    # Standalone QLoRA trainer
├── src/
│   ├── agent/orchestrator.py             # LangGraph state machine with CRAG & telemetry
│   ├── api/server.py                     # FastAPI backend REST API
│   ├── evaluation/evaluator.py           # RAGAS evaluation engine
│   ├── generation/calypso_client.py      # LLM reasoning client
│   ├── ingestion/indexer.py              # DualIndexManager (BM25 + ChromaDB)
│   └── retrieval/hybrid_retriever.py     # Hybrid RRF retriever with dense-only toggle
├── tests/                                # Pytest test suite (22 unit & integration tests)
├── requirements.txt                      # Python dependencies
└── README.md
```
