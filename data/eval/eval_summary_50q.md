# 📊 LORCEN-RAG: Evaluation Report

**Total Benchmark Questions**: 50  
**Target Quality Threshold**: 0.75 (75%)  
**All Targets Met**: ❌ NO  

## 🎯 Aggregate Mean Metrics

| Metric | Mean Score | Target | Status |
| :--- | :--- | :--- | :--- |
| **Context Precision** | **0.9533** | ≥ 0.75 | ✅ Passed |
| **Context Recall** | **0.6233** | ≥ 0.75 | ❌ Below Target |
| **Faithfulness** | **0.9030** | ≥ 0.75 | ✅ Passed |
| **Answer Relevance** | **0.8927** | ≥ 0.75 | ✅ Passed |
| **Overall Composite Score** | **0.8431** | ≥ 0.75 | ✅ Passed |

## 📋 Per-Question Detailed Breakdown

| ID | Subject | Topic | Context Precision | Context Recall | Faithfulness | Answer Relevance | Overall |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GATE_EVAL_01` | Operating Systems | Virtual Memory & Paging | 1.00 | 1.00 | 0.87 | 1.00 | **0.97** |
| `GATE_EVAL_02` | Operating Systems | CPU Scheduling | 1.00 | 1.00 | 0.83 | 0.94 | **0.94** |
| `GATE_EVAL_03` | Operating Systems | Deadlocks | 1.00 | 0.80 | 0.96 | 1.00 | **0.94** |
| `GATE_EVAL_04` | Operating Systems | Page Replacement | 1.00 | 1.00 | 0.91 | 0.99 | **0.97** |
| `GATE_EVAL_05` | Operating Systems | Process Synchronization | 1.00 | 0.80 | 0.88 | 0.97 | **0.91** |
| `GATE_EVAL_06` | Database Management Systems | Transactions & Concurrency Control | 1.00 | 1.00 | 0.96 | 1.00 | **0.99** |
| `GATE_EVAL_07` | Database Management Systems | Normalization | 1.00 | 1.00 | 0.87 | 0.99 | **0.96** |
| `GATE_EVAL_08` | Database Management Systems | Indexing & B+ Trees | 1.00 | 0.80 | 1.00 | 0.97 | **0.94** |
| `GATE_EVAL_09` | Database Management Systems | Serializability & Precedence Graphs | 1.00 | 1.00 | 0.83 | 0.83 | **0.92** |
| `GATE_EVAL_10` | Database Management Systems | Relational Algebra | 1.00 | 0.00 | 0.86 | 0.79 | **0.66** |
| `GATE_EVAL_11` | Algorithms | Heap Data Structure & Analysis | 1.00 | 1.00 | 0.88 | 1.00 | **0.97** |
| `GATE_EVAL_12` | Algorithms | Asymptotic Analysis & Recurrences | 1.00 | 1.00 | 1.00 | 0.97 | **0.99** |
| `GATE_EVAL_13` | Algorithms | Graph Algorithms | 1.00 | 1.00 | 0.91 | 1.00 | **0.98** |
| `GATE_EVAL_14` | Algorithms | Dynamic Programming | 1.00 | 1.00 | 0.90 | 0.94 | **0.96** |
| `GATE_EVAL_15` | Algorithms | Greedy Algorithms & MST | 1.00 | 0.80 | 0.80 | 0.82 | **0.86** |
| `GATE_EVAL_16` | Computer Networks | Transport Layer & TCP | 0.67 | 1.00 | 0.89 | 1.00 | **0.89** |
| `GATE_EVAL_17` | Computer Networks | Data Link Layer & Sliding Window | 1.00 | 0.80 | 0.77 | 0.92 | **0.87** |
| `GATE_EVAL_18` | Computer Networks | Medium Access Control | 1.00 | 1.00 | 1.00 | 1.00 | **1.00** |
| `GATE_EVAL_19` | Computer Networks | IP Addressing & CIDR | 1.00 | 0.80 | 1.00 | 0.97 | **0.94** |
| `GATE_EVAL_20` | Computer Networks | Network Security & Cryptography | 1.00 | 0.00 | 0.85 | 0.77 | **0.66** |
| `GATE_EVAL_21` | Theory of Computation | Finite Automata & Regular Languages | 1.00 | 0.60 | 0.89 | 1.00 | **0.87** |
| `GATE_EVAL_22` | Theory of Computation | Chomsky Hierarchy & Grammars | 1.00 | 0.80 | 0.88 | 0.92 | **0.90** |
| `GATE_EVAL_23` | Theory of Computation | Decidability & Turing Machines | 1.00 | 0.60 | 1.00 | 0.95 | **0.89** |
| `GATE_EVAL_24` | Theory of Computation | Pushdown Automata | 1.00 | 0.80 | 0.88 | 0.96 | **0.91** |
| `GATE_EVAL_25` | Theory of Computation | Closure Properties | 0.67 | 0.80 | 0.88 | 0.96 | **0.83** |
| `GATE_EVAL_26` | Compiler Design | Bottom-Up Syntax Analysis | 1.00 | 1.00 | 0.89 | 1.00 | **0.97** |
| `GATE_EVAL_27` | Compiler Design | Syntax-Directed Translation | 0.67 | 1.00 | 0.95 | 1.00 | **0.90** |
| `GATE_EVAL_28` | Compiler Design | Intermediate Code Generation | 1.00 | 0.00 | 0.89 | 0.78 | **0.67** |
| `GATE_EVAL_29` | Compiler Design | Code Optimization | 1.00 | 0.00 | 0.91 | 0.77 | **0.67** |
| `GATE_EVAL_30` | Compiler Design | Top-Down LL(1) Parsing | 0.67 | 0.80 | 0.88 | 0.92 | **0.82** |
| `GATE_EVAL_31` | Computer Organization and Architecture | Storage Hierarchy & Hard Disk Access Time | 1.00 | 1.00 | 0.84 | 1.00 | **0.96** |
| `GATE_EVAL_32` | Computer Organization and Architecture | Memory Hierarchy & Cache Mapping | 0.67 | 1.00 | 0.91 | 0.98 | **0.89** |
| `GATE_EVAL_33` | Computer Organization and Architecture | Instruction Pipelining & Performance | 0.67 | 1.00 | 1.00 | 1.00 | **0.92** |
| `GATE_EVAL_34` | Computer Organization and Architecture | Computer Arithmetic | 1.00 | 0.00 | 0.88 | 0.80 | **0.67** |
| `GATE_EVAL_35` | Computer Organization and Architecture | Input/Output & DMA | 1.00 | 0.20 | 0.90 | 0.79 | **0.72** |
| `GATE_EVAL_36` | Discrete Mathematics | Graph Theory & Connectivity | 1.00 | 0.80 | 0.92 | 1.00 | **0.93** |
| `GATE_EVAL_37` | Discrete Mathematics | Propositional & First-Order Logic | 1.00 | 0.00 | 0.86 | 0.76 | **0.66** |
| `GATE_EVAL_38` | Discrete Mathematics | Set Theory & Relations | 1.00 | 0.17 | 0.86 | 0.70 | **0.68** |
| `GATE_EVAL_39` | Discrete Mathematics | Combinatorics & Generating Functions | 1.00 | 0.00 | 0.88 | 0.80 | **0.67** |
| `GATE_EVAL_40` | Discrete Mathematics | Group Theory & Lattices | 1.00 | 0.80 | 0.92 | 0.71 | **0.86** |
| `GATE_EVAL_41` | Engineering Mathematics | Probability & Bayes' Theorem | 1.00 | 0.80 | 0.95 | 1.00 | **0.94** |
| `GATE_EVAL_42` | Engineering Mathematics | Linear Algebra & Eigenvalues | 1.00 | 0.60 | 0.92 | 0.73 | **0.81** |
| `GATE_EVAL_43` | Engineering Mathematics | Discrete Probability Distributions | 1.00 | 0.80 | 0.95 | 0.81 | **0.89** |
| `GATE_EVAL_44` | Engineering Mathematics | Calculus & Optimization | 1.00 | 0.00 | 0.92 | 0.77 | **0.67** |
| `GATE_EVAL_45` | Engineering Mathematics | Matrix Rank & Systems of Equations | 1.00 | 0.00 | 0.86 | 0.76 | **0.65** |
| `GATE_EVAL_46` | Digital Logic | Combinational Circuits & Minimization | 0.67 | 0.80 | 0.96 | 0.79 | **0.80** |
| `GATE_EVAL_47` | Digital Logic | Sequential Circuits & Flip-Flops | 1.00 | 0.00 | 0.95 | 0.72 | **0.67** |
| `GATE_EVAL_48` | Digital Logic | Multiplexers & Decoders | 1.00 | 0.00 | 0.86 | 0.77 | **0.66** |
| `GATE_EVAL_49` | Digital Logic | Number Representation | 1.00 | 0.00 | 0.89 | 0.80 | **0.67** |
| `GATE_EVAL_50` | Digital Logic | Counters & State Machines | 1.00 | 0.00 | 0.88 | 0.81 | **0.67** |
