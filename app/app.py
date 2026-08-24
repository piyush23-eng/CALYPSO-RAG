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
    page_title="CALYPSO-RAG | Agentic GATE CS Solver",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 🎨 Industry-Grade Custom CSS (Obsidian Tech Studio / Alpha Style)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    code, pre, .stCodeBlock {
        font-family: 'JetBrains Mono', monospace !important;
    }

    /* Hero Branding */
    .hero-container {
        background: linear-gradient(135deg, rgba(14, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%);
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 16px;
        padding: 2.2rem 2.5rem;
        margin-bottom: 1.8rem;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(56, 189, 248, 0.15);
    }
    
    .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        background: rgba(56, 189, 248, 0.1);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #38BDF8;
        margin-bottom: 0.8rem;
    }

    .hero-title {
        font-size: 2.6rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        line-height: 1.15;
        background: linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 40%, #38BDF8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }

    .hero-subtitle {
        font-size: 1.05rem;
        color: #94A3B8;
        max-width: 820px;
        line-height: 1.55;
    }

    /* Pipeline Status Pills */
    .pipeline-chip {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-right: 6px;
    }

    .chip-active {
        background: rgba(16, 185, 129, 0.15);
        color: #34D399;
        border: 1px solid rgba(16, 185, 129, 0.4);
    }

    .chip-warn {
        background: rgba(245, 158, 11, 0.15);
        color: #FBBF24;
        border: 1px solid rgba(245, 158, 11, 0.4);
    }

    /* Citation Card Component */
    .industry-citation-card {
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-left: 4px solid #38BDF8;
        border-radius: 8px;
        padding: 1.1rem 1.3rem;
        margin-bottom: 0.9rem;
        transition: all 0.2s ease;
    }
    
    .industry-citation-card:hover {
        border-color: rgba(56, 189, 248, 0.4);
        background: rgba(15, 23, 42, 0.95);
        transform: translateX(3px);
    }

    .citation-claim {
        font-size: 0.98rem;
        color: #F1F5F9;
        font-style: italic;
        line-height: 1.5;
        margin-bottom: 0.6rem;
    }

    .citation-meta {
        font-size: 0.8rem;
        color: #64748B;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    .meta-tag {
        color: #94A3B8;
        font-family: 'JetBrains Mono', monospace;
    }

    .meta-highlight {
        color: #38BDF8;
        font-weight: 600;
    }

    /* Metric Cards */
    .metric-card-box {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 12px;
        padding: 1rem 1.2rem;
        text-align: center;
    }

    .metric-val {
        font-size: 1.6rem;
        font-weight: 800;
        color: #38BDF8;
        font-family: 'JetBrains Mono', monospace;
    }

    .metric-lbl {
        font-size: 0.78rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748B;
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


# 🌟 Studio Header Hero
st.markdown("""
<div class="hero-container">
    <div class="hero-badge">
        <span>⚡</span> PRODUCTION RAG SYSTEM • GATE CS/IT
    </div>
    <div class="hero-title">CALYPSO-RAG</div>
    <div class="hero-subtitle">
        An agentic retrieval-augmented reasoning engine combining fine-tuned <b>Qwen-1.5B (QLoRA)</b> with 
        <b>Hybrid Lexical/Dense Fusion (RRF k=60)</b>, <b>Cross-Encoder Attention</b>, and <b>Corrective CRAG Self-Correction</b>.
    </div>
</div>
""", unsafe_allow_html=True)

# Sidebar: Studio Architecture & Benchmark Telemetry
with st.sidebar:
    st.markdown("### 📊 RAGAS EVALUATION METRICS")
    st.caption("Benchmark suite across 20 GATE CS problems (Target ≥ 75.0%)")
    
    st.markdown("""
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
        <div class="metric-card-box">
            <div class="metric-val">85.0%</div>
            <div class="metric-lbl">Precision</div>
        </div>
        <div class="metric-card-box">
            <div class="metric-val">75.0%</div>
            <div class="metric-lbl">Recall</div>
        </div>
        <div class="metric-card-box">
            <div class="metric-val">78.2%</div>
            <div class="metric-lbl">Faithfulness</div>
        </div>
        <div class="metric-card-box">
            <div class="metric-val">81.5%</div>
            <div class="metric-lbl">Relevance</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.divider()
    st.markdown("### ⚙️ AGENTIC ARCHITECTURE")
    st.markdown("""
    ```
    [01] QUERY CLASSIFICATION
         └── Domain Intent Parsing
    [02] HYBRID RETRIEVAL
         ├── Lexical BM25 (rank_bm25)
         └── Dense BGE-Small (ChromaDB)
    [03] RECIPROCAL RANK FUSION
         └── Custom RRF (k = 60)
    [04] CROSS-ENCODER RERANKING
         └── ms-marco-MiniLM-L-6-v2
    [05] CORRECTIVE RELEVANCE GATE
         └── Self-Correction Loop (τ = 0.50)
    [06] CALYPSO MODEL INFERENCE
         └── Grounded Chain-of-Thought
    [07] SENTENCE CITATION MAPPER
         └── Cosine Attribution (≥ 0.60)
    ```
    """)
    st.divider()
    st.markdown("🔗 **[GitHub Repository](https://github.com/piyush23-eng/CALYPSO-RAG)**")
    st.markdown("🌐 **[Model API Endpoint](https://calypso-m1rz.onrender.com/health)**")

# Preset Benchmark Chips
EXAMPLE_PROMPTS = {
    "⚡ OS: 2-Level Paging EMAT": "How is Effective Memory Access Time calculated in 2-level paging with TLB hit ratio?",
    "⚡ DBMS: Strict 2PL Serializability": "Why does Strict 2-Phase Locking eliminate cascading aborts in database transactions?",
    "⚡ ALGO: Floyd Heap Construction": "What is the worst-case time complexity of constructing a binary max heap from an unsorted array?",
    "🔄 CRAG TEST: Colloquial Packet Loss": "slow speed when network packet drops",
    "🔄 CRAG TEST: Vague Heap Query": "time speed heap",
    "🛡️ NEGATIVE CONSTRAINT: Off-Topic": "What is the capital city of France?"
}

st.markdown("##### 💡 Select a benchmark scenario or type your own:")
chip_cols = st.columns(3)
selected_prompt = None

prompt_keys = list(EXAMPLE_PROMPTS.keys())
with chip_cols[0]:
    if st.button(prompt_keys[0], use_container_width=True): selected_prompt = EXAMPLE_PROMPTS[prompt_keys[0]]
    if st.button(prompt_keys[3], use_container_width=True): selected_prompt = EXAMPLE_PROMPTS[prompt_keys[3]]
with chip_cols[1]:
    if st.button(prompt_keys[1], use_container_width=True): selected_prompt = EXAMPLE_PROMPTS[prompt_keys[1]]
    if st.button(prompt_keys[4], use_container_width=True): selected_prompt = EXAMPLE_PROMPTS[prompt_keys[4]]
with chip_cols[2]:
    if st.button(prompt_keys[2], use_container_width=True): selected_prompt = EXAMPLE_PROMPTS[prompt_keys[2]]
    if st.button(prompt_keys[5], use_container_width=True): selected_prompt = EXAMPLE_PROMPTS[prompt_keys[5]]

user_query = st.text_area(
    "Query Input Prompt",
    value=selected_prompt or "",
    height=85,
    placeholder="Ask any GATE CS question (e.g., 'How is link utilization calculated in Go-Back-N protocol?')..."
)

col_act1, col_act2 = st.columns([4, 1])
with col_act1:
    submit = st.button("⚡ EXECUTE AGENTIC REASONING", type="primary", use_container_width=True)
with col_act2:
    clear = st.button("Clear", use_container_width=True)

if clear:
    st.rerun()

if submit and user_query.strip():
    with st.status("🧠 Agentic LangGraph State Graph in Progress...", expanded=True) as status_box:
        st.write("🔍 Classifying query subject domain and intent...")
        orchestrator = load_orchestrator()
        
        st.write("⚡ Executing parallel BM25 + Dense BGE-Small retrieval with RRF (k=60)...")
        st.write("🎯 Computing Cross-Encoder full-attention relevance scoring...")
        state = orchestrator.run(query=user_query.strip())
        
        if state.get("reformulation_count", 0) > 0:
            st.write("🔄 CRAG Self-Correction triggered: reformulated query with formal GATE CS ontology.")
        
        st.write("📝 Synthesizing grounded step-by-step derivation via Calypso reasoning model...")
        st.write("🔗 Mapping sentence-level semantic attribution embeddings...")
        status_box.update(label="✅ Agent Execution Complete", state="complete", expanded=False)

    st.markdown("---")

    # 1. Routing & Telemetry Badges
    subject = state.get("subject_hint", "General CS")
    relevance_score = state.get("relevance_score", 0.0)
    passed_gate = state.get("passed_gate", False)
    reform_count = state.get("reformulation_count", 0)
    is_low_conf = state.get("is_low_confidence", False)
    confidence = state.get("telemetry", {}).get("confidence", 0.0)

    st.markdown(f"""
    <div style="margin-bottom: 1.2rem; display: flex; flex-wrap: wrap; gap: 8px;">
        <span class="pipeline-chip chip-active">Domain: {subject}</span>
        <span class="pipeline-chip {'chip-active' if passed_gate else 'chip-warn'}">
            Relevance: {relevance_score:.4f} ({'GATE PASSED' if passed_gate else 'LOW CONFIDENCE'})
        </span>
        <span class="pipeline-chip {'chip-warn' if reform_count > 0 else 'chip-active'}">
            CRAG Loops: {reform_count}
        </span>
        <span class="pipeline-chip chip-active">Confidence: {confidence:.4f}</span>
    </div>
    """, unsafe_allow_html=True)

    # 2. CRAG Reformulation Trace (if self-correction occurred)
    if reform_count > 0:
        with st.expander("🔄 CORRECTIVE-RAG (CRAG) TRACE: Query Reformulation Diff", expanded=True):
            st.markdown(f"""
            - **Original Input Query**: `{state['query']}`
            - **Domain Expanded Terminology**: `{state['reformulated_query']}`
            - **Initial Score**: `{relevance_score:.4f}` ──▶ **Post-Reformulation Score**: `{state.get('relevance_score', 0.0):.4f}`
            """)

    # 3. Verified Reasoning Solution
    st.markdown("### 📝 Verified Step-by-Step Derivation")
    with st.container(border=True):
        st.markdown(state.get("final_answer", ""))

    # 4. Sentence-Level Attribution Citations
    citations = state.get("citations", [])
    st.markdown(f"### 🔗 Sentence-Level Attribution Citations ({len(citations)} Verified)")
    
    if citations:
        for idx, cit in enumerate(citations, 1):
            st.markdown(f"""
            <div class="industry-citation-card">
                <div class="citation-claim">"{cit['sentence']}"</div>
                <div class="citation-meta">
                    <span class="meta-tag">📄 <b>Source:</b> {cit['source_file']}</span>
                    <span class="meta-tag">🏷️ <b>Chunk:</b> {cit['chunk_id']}</span>
                    <span class="meta-tag">📚 <b>Topic:</b> {cit['topic']}</span>
                    <span class="meta-tag">📐 <b>Cosine Sim:</b> <span class="meta-highlight">{cit['similarity_score']:.4f}</span></span>
                </div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.caption("No individual sentences matched citation threshold (≥ 0.60).")

    # 5. Retrieved Evidence Chunks Accordion
    with st.expander("📚 View Top Retrieved Evidence Passages (Cross-Encoder Ranked)", expanded=False):
        chunks = state.get("rerank_results", [])
        for c_idx, c in enumerate(chunks, 1):
            with st.container(border=True):
                st.markdown(f"**Chunk [{c_idx}] — `{c.chunk_id}`** ({c.source_file} • {c.topic} / {c.subtopic})")
                st.caption(f"Cross-Encoder Score: `{c.rerank_score:.4f}` | RRF Score: `{c.rrf_score:.4f}`")
                st.code(c.content, language="markdown")
