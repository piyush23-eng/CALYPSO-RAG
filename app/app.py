import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import streamlit as st
from src.ingestion.indexer import DualIndexManager
from src.agent.orchestrator import CalypsoAgentOrchestrator


# Page Configuration
st.set_page_config(
    page_title="CALYPSO-RAG | Agentic GATE CS Doubt Solver",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 800;
        color: #1E88E5;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #555;
        margin-bottom: 1.5rem;
    }
    .metric-badge {
        display: inline-block;
        padding: 0.25rem 0.6rem;
        border-radius: 0.375rem;
        font-size: 0.85rem;
        font-weight: 600;
        margin-right: 0.5rem;
    }
    .badge-os { background-color: #E3F2FD; color: #1565C0; }
    .badge-dbms { background-color: #EDE7F6; color: #512DA8; }
    .badge-algo { background-color: #E8F5E9; color: #2E7D32; }
    .badge-cn { background-color: #FFF3E0; color: #E65100; }
    .badge-toc { background-color: #FCE4EC; color: #C2185B; }
    .badge-comp { background-color: #E0F2F1; color: #00695C; }
    .citation-card {
        border-left: 3px solid #1E88E5;
        background-color: #F8F9FA;
        padding: 0.75rem 1rem;
        margin-bottom: 0.5rem;
        border-radius: 0 0.375rem 0.375rem 0;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_resource(show_spinner=False)
def load_orchestrator():
    """Initializes and caches the index manager and LangGraph state machine."""
    index_manager = DualIndexManager(
        persist_dir=str(PROJECT_ROOT / "data/processed/chroma_db"),
        bm25_persist_path=str(PROJECT_ROOT / "data/processed/bm25_index.pkl")
    )
    index_manager.load_indices()
    return CalypsoAgentOrchestrator(index_manager=index_manager)


# Header
st.markdown('<div class="main-header">⚡ CALYPSO-RAG</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-header">Agentic Retrieval-Augmented Generation for GATE Computer Science • '
    'Hybrid RRF (k=60) + Cross-Encoder Reranking + Corrective CRAG Gate + Sentence Attribution</div>',
    unsafe_allow_html=True
)

# Sidebar: System Telemetry & Benchmark Metrics
with st.sidebar:
    st.header("📊 Benchmark Quality Metrics")
    st.caption("Evaluated across 20 GATE CS Benchmarks (Target ≥ 75%)")
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Precision", "85.0%", "✅ Pass")
        st.metric("Faithfulness", "78.2%", "✅ Pass")
    with col2:
        st.metric("Recall", "75.0%", "✅ Pass")
        st.metric("Relevance", "81.5%", "✅ Pass")
    
    st.divider()
    st.subheader("⚙️ Pipeline Architecture")
    st.markdown("""
    - **Lexical**: BM25 (`rank_bm25`)
    - **Dense**: `BAAI/bge-small-en-v1.5`
    - **Fusion**: Custom RRF ($k=60$)
    - **Reranker**: `ms-marco-MiniLM-L-6-v2`
    - **Gate**: CRAG ($\tau = 0.50$)
    - **Model**: `Qwen2.5-1.5B` (QLoRA)
    - **Orchestrator**: LangGraph Cyclic State Graph
    """)
    st.divider()
    st.markdown("[📁 View GitHub Repository](https://github.com/piyush23-eng/CALYPSO-RAG)")

# Main Query Interface
EXAMPLE_QUERIES = [
    "How is Effective Memory Access Time calculated in 2-level paging with TLB hit ratio?",
    "Why does Strict 2-Phase Locking eliminate cascading aborts in database transactions?",
    "What is the worst-case time complexity of constructing a binary max heap from an unsorted array?",
    "slow speed when network packet drops",
    "time speed heap",
    "What is the capital city of France?"
]

selected_example = st.selectbox(
    "💡 Or select an example GATE CS question:",
    ["-- Type your own custom question --"] + EXAMPLE_QUERIES,
    index=0
)

default_text = "" if selected_example.startswith("--") else selected_example
user_query = st.text_area("Enter your GATE CS Question / Doubt:", value=default_text, height=90, placeholder="e.g. How does Floyd's bottom-up build-heap achieve O(n) complexity?")

submit_btn = st.button("🚀 Solve with CALYPSO-RAG", type="primary", use_container_width=True)

if submit_btn and user_query.strip():
    with st.spinner("🤖 LangGraph Agent executing: Routing ──▶ Retrieving ──▶ Reranking ──▶ Reasoning..."):
        orchestrator = load_orchestrator()
        state = orchestrator.run(query=user_query.strip())

    st.divider()

    # Step 1: Agent Routing & Metadata Badges
    subject = state.get("subject_hint", "General CS")
    relevance_score = state.get("relevance_score", 0.0)
    passed_gate = state.get("passed_gate", False)
    reform_count = state.get("reformulation_count", 0)
    is_low_conf = state.get("is_low_confidence", False)

    badge_class = {
        "Operating Systems": "badge-os",
        "Database Management Systems": "badge-dbms",
        "Algorithms": "badge-algo",
        "Computer Networks": "badge-cn",
        "Theory of Computation": "badge-toc",
        "Compiler Design": "badge-comp"
    }.get(subject, "badge-os")

    st.markdown(f"""
    <div style="margin-bottom: 1rem;">
        <span class="metric-badge {badge_class}">Subject: {subject}</span>
        <span class="metric-badge" style="background-color: {'#E8F5E9' if passed_gate else '#FFEBEE'}; color: {'#2E7D32' if passed_gate else '#C62828'};">
            Relevance: {relevance_score:.4f} ({'PASSED' if passed_gate else 'LOW CONFIDENCE'})
        </span>
        <span class="metric-badge" style="background-color: {'#E0F7FA' if reform_count > 0 else '#F5F5F5'}; color: {'#006064' if reform_count > 0 else '#616161'};">
            CRAG Self-Correction Loops: {reform_count}
        </span>
    </div>
    """, unsafe_allow_html=True)

    # Step 2: CRAG Self-Correction Trace (if triggered)
    if reform_count > 0:
        with st.expander("🔄 Corrective-RAG (CRAG) Self-Correction Trace", expanded=True):
            st.info(f"**Original Query**: `{state['query']}`\n\n"
                    f"**Formal GATE CS Expansion**: `{state['reformulated_query']}`")

    # Step 3: Calypso Verified Solution
    st.subheader("📝 Verified Step-by-Step Solution")
    st.markdown(state.get("final_answer", ""))

    # Step 4: Sentence-Level Citations & Attribution
    citations = state.get("citations", [])
    if citations:
        st.subheader(f"🔗 Sentence-Level Attribution ({len(citations)} Verified Citations)")
        for idx, cit in enumerate(citations, 1):
            st.markdown(f"""
            <div class="citation-card">
                <b>[{idx}] Answer Sentence Claim:</b> <i>"{cit['sentence']}"</i><br>
                <small><b>Cited:</b> <code>[{cit['chunk_id']}]</code> in <b>{cit['source_file']}</b> (Topic: {cit['topic']}) | <b>Cosine Similarity:</b> {cit['similarity_score']:.4f}</small>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.caption("No individual sentences matched citation threshold (≥ 0.60).")

    # Step 5: Retrieved Context Evidence Cards
    with st.expander("📚 View Top Retrieved Context Evidence Chunks", expanded=False):
        chunks = state.get("rerank_results", [])
        for c_idx, c in enumerate(chunks, 1):
            st.markdown(f"**Chunk [{c_idx}] — `{c.chunk_id}`** ({c.source_file} • {c.topic} / {c.subtopic})")
            st.caption(f"Cross-Encoder Relevance Score: {c.rerank_score:.4f} | RRF Score: {c.rrf_score:.4f}")
            st.code(c.content, language="markdown")
            st.divider()
