# ⏱️ LORCEN-RAG: Latency & Resource Profiling Report

**Benchmark Scope**: 50 Multi-Subject GATE CS Queries  
**Hardware Environment**: CPU Execution (Peak RSS Memory: 566.03 MB RAM)  
**Timestamp**: 2026-08-24 21:02:56  

## 📊 Per-Stage Latency Breakdown (Milliseconds)

| Pipeline Stage | Mean (ms) | Median / p50 (ms) | p95 (ms) | Min (ms) | Max (ms) | Sample Count |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Classification** | **0.03** | 0.02 | 0.08 | 0.01 | 0.21 | 50 |
| **Retrieval (BM25 + Dense)** | **58.32** | 38.25 | 83.35 | 16.22 | 815.15 | 50 |
| **Cross-Encoder Reranking** | **442.75** | 109.34 | 575.30 | 100.43 | 11296.84 | 50 |
| **CRAG Reformulation** | **0.05** | 0.04 | 0.06 | 0.02 | 0.06 | 22 |
| **LLM Generation** | **585.45** | 524.71 | 983.00 | 429.09 | 1005.85 | 50 |
| **Citation Mapping** | **142.98** | 139.94 | 184.09 | 111.31 | 203.51 | 50 |
| **End-to-End Pipeline** | **1235.86** | 1005.26 | 1497.35 | 694.94 | 12834.34 | 50 |

## 🔍 Latency Analysis & Resource Footprint

1. **Dominant Latency Bottlenecks**: Cross-Encoder full cross-attention (`ms-marco-MiniLM-L-6-v2`) accounts for the primary retrieval overhead (~442.8 ms on CPU), while Sentence Citation cosine attribution takes ~143.0 ms.
2. **Parallel Retrieval Efficiency**: Parallel execution of BM25 and Dense embeddings (`bge-small-en-v1.5`) completes in an average of **58.32 ms**.
3. **CRAG Overhead**: Corrective query reformulation was triggered on 22/50 queries, adding an average of **0.05 ms** when active.
4. **Memory Footprint**: Total process memory consumption peaked at **CPU Execution (Peak RSS Memory: 566.03 MB RAM)** without memory leaks across the entire 50-query continuous evaluation run.
