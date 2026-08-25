import time
from typing import TypedDict, List, Dict, Any, Optional, Literal
from typing_extensions import Annotated
from langgraph.graph import StateGraph, END

from src.ingestion.indexer import DualIndexManager
from src.retrieval.hybrid_retriever import HybridRetriever, RetrievedChunk
from src.retrieval.reranker import CrossEncoderReranker
from src.retrieval.relevance_gate import CorrectiveRelevanceGate, GatedRetrievalResult
from src.generation.calypso_client import CalypsoClient
from src.generation.citation_mapper import CitationMapper, GenerationOutput, SentenceCitation


from src.retrieval.parent_retriever import ParentDocumentRetriever
from src.retrieval.knowledge_graph import gate_kg


class AgentState(TypedDict):
    """
    Complete state schema for the CALYPSO-RAG LangGraph state machine.
    """
    query: str
    reformulated_query: str
    subject_hint: Optional[str]
    retrieval_results: List[RetrievedChunk]
    rerank_results: List[RetrievedChunk]
    relevance_score: float
    reformulation_count: int
    passed_gate: bool
    is_low_confidence: bool
    generation: str
    citations: List[Dict[str, Any]]
    final_answer: str
    telemetry: Dict[str, Any]
    _start_perf_counter: float


class CalypsoAgentOrchestrator:
    """
    Agentic Orchestrator built using LangGraph state graph.
    
    Coordinates the 5-stage reasoning lifecycle with support for ablation experiments:
    1. classify_query -> identifies GATE CS domain & subject bounds.
    2. retrieve -> executes hybrid lexical (BM25) & dense (BGE-Small) retrieval with RRF (or dense-only if ablated).
    3. rerank -> applies cross-encoder full attention scoring over top candidates (or passes top candidates if ablated).
    4. evaluate_relevance -> CRAG confidence gate: checks if top score >= tau (0.50). If below & retries remain, loops back to reformulate.
    5. generate_answer -> synthesizes mathematical derivation grounded strictly in evidence + dynamic parameter execution.
    6. map_citations -> pairwise sentence-to-evidence cosine attribution mapping.
    """

    def __init__(
        self,
        index_manager: Optional[DualIndexManager] = None,
        retriever: Optional[HybridRetriever] = None,
        reranker: Optional[CrossEncoderReranker] = None,
        relevance_gate: Optional[CorrectiveRelevanceGate] = None,
        calypso_client: Optional[CalypsoClient] = None,
        citation_mapper: Optional[CitationMapper] = None,
        relevance_threshold: float = 0.50,
        max_reformulations: int = 2,
        enable_hybrid: bool = True,
        enable_reranking: bool = True,
        enable_crag: bool = True
    ):
        self.index_manager = index_manager or DualIndexManager()
        self.retriever = retriever or HybridRetriever(index_manager=self.index_manager, rrf_k=60)
        self.parent_retriever = ParentDocumentRetriever()
        self.reranker = reranker or CrossEncoderReranker()
        self.relevance_threshold = relevance_threshold
        self.relevance_gate = relevance_gate or CorrectiveRelevanceGate(
            retriever=self.retriever,
            reranker=self.reranker,
            relevance_threshold=relevance_threshold,
            max_attempts=max_reformulations
        )
        self.generator = calypso_client or CalypsoClient()
        self.calypso_client = self.generator
        self.citation_mapper = citation_mapper or CitationMapper(embedder=self.index_manager.embedder)
        self.max_reformulations = max_reformulations if enable_crag else 0
        
        # Ablation control flags
        self.enable_hybrid = enable_hybrid
        self.enable_reranking = enable_reranking
        self.enable_crag = enable_crag

        # Compile the LangGraph agent state machine
        self.graph = self._build_graph()
        self.app = self.graph.compile()

    # ── Node 1: Classify Query ───────────────────────────────────────────────
    def _classify_query_node(self, state: AgentState) -> Dict[str, Any]:
        t_start = time.perf_counter()
        q = state["query"].lower()
        subject = "Computer Organization and Architecture" if any(w in q for w in [
            "disk", "hard disk", "rpm", "rotational", "seek", "track", "sector", "cylinder",
            "cache", "pipeline", "pipelining", "tag", "set associative", "coa", "architecture",
            "ieee 754", "booth", "addressing mode", "dma", "interrupt"
        ]) else "General CS"
        
        if any(w in q for w in ["page", "paging", "tlb", "process", "scheduling", "deadlock", "banker", "os", "semaphore", "virtual memory", "belady", "emat"]):
            subject = "Operating Systems"
        elif any(w in q for w in ["normal", "3nf", "bcnf", "acid", "serializ", "2pl", "sql", "dbms", "database", "transaction", "precedence graph", "fanout", "b+ tree"]):
            subject = "Database Management Systems"
        elif any(w in q for w in ["heap", "sort", "graph", "tree", "recurrence", "complexity", "asymptotic", "algorithm", "knapsack", "dijkstra", "bellman", "floyd"]):
            subject = "Algorithms"
        elif any(w in q for w in ["tcp", "ip", "packet", "congestion", "sliding window", "gbn", "selective repeat", "subnet", "network", "csma", "cidr", "routing"]):
            subject = "Computer Networks"
        elif any(w in q for w in ["grammar", "automata", "dfa", "nfa", "pda", "turing", "chomsky", "regular", "pumping lemma", "decidab"]):
            subject = "Theory of Computation"
        elif any(w in q for w in ["parse", "parser", "lr", "lalr", "slr", "syntax", "lexical", "compiler", "sdd", "s-attribute", "l-attribute"]):
            subject = "Compiler Design"
        elif any(w in q for w in ["disk", "hard disk", "rpm", "rotational", "seek", "track", "sector", "cylinder", "cache", "pipeline", "pipelining", "tag", "set associative", "coa", "architecture", "ieee 754", "booth", "addressing mode", "dma", "interrupt"]):
            subject = "Computer Organization and Architecture"
        elif any(w in q for w in ["bayes", "probability", "poisson", "binomial", "calculus", "eigenvalue", "matrix rank", "determinant", "permutation", "eulerian", "hamiltonian", "pigeonhole", "lattice", "discrete math"]):
            subject = "Engineering Mathematics"
        elif any(w in q for w in ["multiplexer", "mux", "decoder", "k-map", "karnaugh", "flip-flop", "boolean algebra", "digital logic"]):
            subject = "Digital Logic"

        timing = dict(state.get("telemetry", {}).get("timing", {}))
        timing["classification_ms"] = round((time.perf_counter() - t_start) * 1000.0, 2)

        return {
            "subject_hint": subject,
            "reformulated_query": state.get("reformulated_query") or state["query"],
            "reformulation_count": state.get("reformulation_count", 0),
            "telemetry": {
                **state.get("telemetry", {}),
                "classified_subject": subject,
                "timing": timing
            }
        }

    # ── Node 2: Retrieve ─────────────────────────────────────────────────────
    def _retrieve_node(self, state: AgentState) -> Dict[str, Any]:
        t_start = time.perf_counter()
        active_query = state["reformulated_query"]
        
        if self.enable_hybrid:
            fused = self.retriever.retrieve(
                query=active_query,
                top_candidates_per_source=20,
                fused_top_k=10
            )
        else:
            fused = self.retriever.retrieve_dense_only(
                query=active_query,
                top_k=10
            )
            
        # Expand granular chunks into enclosing parent sections for higher Context Recall
        expanded_chunks = self.parent_retriever.expand_chunks(fused)

        elapsed_ms = round((time.perf_counter() - t_start) * 1000.0, 2)
        timing = dict(state.get("telemetry", {}).get("timing", {}))
        timing["retrieval_ms"] = timing.get("retrieval_ms", 0.0) + elapsed_ms

        return {
            "retrieval_results": expanded_chunks,
            "telemetry": {
                **state.get("telemetry", {}),
                "timing": timing
            }
        }

    # ── Node 3: Rerank ───────────────────────────────────────────────────────
    def _rerank_node(self, state: AgentState) -> Dict[str, Any]:
        t_start = time.perf_counter()
        active_query = state["reformulated_query"]
        candidates = state["retrieval_results"]
        
        if self.enable_reranking:
            reranked = self.reranker.rerank(query=active_query, chunks=candidates, top_k=3)
        else:
            reranked = list(candidates[:3])
            for c in reranked:
                if c.rerank_score is None:
                    c.rerank_score = c.dense_score if c.dense_score is not None else 0.50

        elapsed_ms = round((time.perf_counter() - t_start) * 1000.0, 2)
        timing = dict(state.get("telemetry", {}).get("timing", {}))
        timing["rerank_ms"] = timing.get("rerank_ms", 0.0) + elapsed_ms

        return {
            "rerank_results": reranked,
            "telemetry": {
                **state.get("telemetry", {}),
                "timing": timing
            }
        }

    # ── Node 4: Check Relevance ──────────────────────────────────────────────
    def _check_relevance_node(self, state: AgentState) -> Dict[str, Any]:
        reranked = state["rerank_results"]
        max_score = reranked[0].rerank_score if (reranked and reranked[0].rerank_score is not None) else 0.0
        
        if self.enable_crag:
            passed = max_score >= self.relevance_threshold
        else:
            passed = True  # CRAG disabled: bypass gate directly

        return {
            "relevance_score": max_score,
            "passed_gate": passed,
            "is_low_confidence": not passed and state["reformulation_count"] >= self.max_reformulations
        }

    # ── Node 5: Reformulate & Retry ──────────────────────────────────────────
    def _reformulate_node(self, state: AgentState) -> Dict[str, Any]:
        t_start = time.perf_counter()
        count = state["reformulation_count"] + 1
        rewritten, method = self.relevance_gate.reformulate_query(query=state["query"], attempt=count)
        elapsed_ms = round((time.perf_counter() - t_start) * 1000.0, 2)

        timing = dict(state.get("telemetry", {}).get("timing", {}))
        timing["crag_ms"] = timing.get("crag_ms", 0.0) + elapsed_ms

        return {
            "reformulated_query": rewritten,
            "reformulation_count": count,
            "telemetry": {
                **state.get("telemetry", {}),
                f"reformulation_attempt_{count}": {
                    "rewritten_query": rewritten,
                    "method": method
                },
                "timing": timing
            }
        }

    # ── Node 6: Generate ─────────────────────────────────────────────────────
    def _generate_node(self, state: AgentState) -> Dict[str, Any]:
        t_start = time.perf_counter()
        reranked = state["rerank_results"]
        subject = state["subject_hint"]
        
        answer_text = self.calypso_client.generate(
            query=state["query"],
            chunks=reranked,
            subject=subject
        )
        elapsed_ms = round((time.perf_counter() - t_start) * 1000.0, 2)

        timing = dict(state.get("telemetry", {}).get("timing", {}))
        timing["generation_ms"] = elapsed_ms

        return {
            "generation": answer_text,
            "telemetry": {
                **state.get("telemetry", {}),
                "timing": timing
            }
        }

    # ── Node 7: Attach Citations ─────────────────────────────────────────────
    def _attach_citations_node(self, state: AgentState) -> Dict[str, Any]:
        t_start = time.perf_counter()
        reranked = state["rerank_results"]
        ans = state["generation"]
        
        mock_gated = GatedRetrievalResult(
            original_query=state["query"],
            effective_query=state["reformulated_query"],
            reformulation_count=state["reformulation_count"],
            max_relevance_score=state["relevance_score"],
            passed_gate=state["passed_gate"],
            is_low_confidence=state["is_low_confidence"],
            chunks=reranked
        )
        
        output = self.citation_mapper.map_citations(
            query=state["query"],
            answer_text=ans,
            gated_result=mock_gated
        )
        elapsed_ms = round((time.perf_counter() - t_start) * 1000.0, 2)
        total_e2e_ms = round((time.perf_counter() - state.get("_start_perf_counter", t_start)) * 1000.0, 2)

        timing = dict(state.get("telemetry", {}).get("timing", {}))
        timing["citations_ms"] = elapsed_ms
        timing["total_e2e_ms"] = total_e2e_ms

        return {
            "citations": [c.model_dump() for c in output.citations],
            "final_answer": output.answer_text,
            "is_low_confidence": output.is_low_confidence,
            "telemetry": {
                **state.get("telemetry", {}),
                "confidence": output.confidence,
                "citation_coverage": output.retrieval_metadata.get("citation_coverage", 0.0),
                "timing": timing
            }
        }

    # ── Conditional Router ───────────────────────────────────────────────────
    def _route_after_relevance_check(self, state: AgentState) -> Literal["generate", "reformulate_and_retry"]:
        """
        Agentic Conditional Edge:
        If relevance score >= threshold OR max reformulation attempts reached OR CRAG disabled -> Generate.
        Otherwise -> Reformulate and loop back to Retrieve.
        """
        if not self.enable_crag or state["passed_gate"] or state["reformulation_count"] >= self.max_reformulations:
            return "generate"
        return "reformulate_and_retry"

    def _build_graph(self) -> StateGraph:
        """
        Constructs the cyclic LangGraph state machine.
        """
        workflow = StateGraph(AgentState)

        # Add Nodes
        workflow.add_node("classify_query", self._classify_query_node)
        workflow.add_node("retrieve", self._retrieve_node)
        workflow.add_node("rerank", self._rerank_node)
        workflow.add_node("check_relevance", self._check_relevance_node)
        workflow.add_node("reformulate_and_retry", self._reformulate_node)
        workflow.add_node("generate", self._generate_node)
        workflow.add_node("attach_citations", self._attach_citations_node)

        # Add Linear Edges
        workflow.set_entry_point("classify_query")
        workflow.add_edge("classify_query", "retrieve")
        workflow.add_edge("retrieve", "rerank")
        workflow.add_edge("rerank", "check_relevance")

        # Add Conditional Edge for Corrective RAG
        workflow.add_conditional_edges(
            "check_relevance",
            self._route_after_relevance_check,
            {
                "generate": "generate",
                "reformulate_and_retry": "reformulate_and_retry"
            }
        )

        # Feedback loop edge
        workflow.add_edge("reformulate_and_retry", "retrieve")

        # Final generation & citation edges
        workflow.add_edge("generate", "attach_citations")
        workflow.add_edge("attach_citations", END)

        return workflow

    def run(self, query: str) -> Dict[str, Any]:
        """
        Runs the LangGraph agent state graph to completion for a user query.
        """
        t0 = time.perf_counter()
        initial_state: AgentState = {
            "query": query,
            "reformulated_query": query,
            "subject_hint": None,
            "retrieval_results": [],
            "rerank_results": [],
            "relevance_score": 0.0,
            "reformulation_count": 0,
            "passed_gate": False,
            "is_low_confidence": False,
            "generation": "",
            "citations": [],
            "final_answer": "",
            "telemetry": {"timing": {}},
            "_start_perf_counter": t0
        }
        return self.app.invoke(initial_state)

    def export_mermaid(self) -> str:
        """
        Exports the LangGraph state machine as a Mermaid flowchart for architecture documentation.
        """
        mermaid_code = """```mermaid
flowchart TD
    START([User Query Input]) --> Classify[Classify Query & Subject]
    Classify --> Retrieve[Parallel Hybrid Retrieval: BM25 + Dense BGE-Small]
    Retrieve --> Rerank[Cross-Encoder Reranker: ms-marco-MiniLM]
    Rerank --> RelevanceCheck{Check Relevance Score >= 0.50?}
    
    RelevanceCheck -- "No (Score < 0.50 & Attempt < 2)" --> Reformulate[CRAG Query Reformulation & Expansion]
    Reformulate -.-> Retrieve
    
    RelevanceCheck -- "Yes (Score >= 0.50 OR Attempt >= 2)" --> Generate[Calypso LLM Generation with Negative Grounding]
    Generate --> Citations[Sentence-Level Cosine Citation Mapper]
    Citations --> END([Verified Answer with Citations & Confidence])
```"""
        return mermaid_code
