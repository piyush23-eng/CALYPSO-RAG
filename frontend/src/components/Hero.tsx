import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const PRESET_QUERIES = [
  { label: "OS: 2-Level Paging EMAT", query: "How is Effective Memory Access Time calculated in 2-level paging with TLB hit ratio?" },
  { label: "DBMS: Strict 2PL Serializability", query: "Why does Strict 2-Phase Locking eliminate cascading aborts in database transactions?" },
  { label: "ALGO: Floyd's Heap O(n)", query: "What is the worst-case time complexity of constructing a binary max heap from an unsorted array?" },
  { label: "CRAG: Colloquial Packet Loss", query: "slow speed when network packet drops" },
  { label: "CRAG: Ambiguous Heap Query", query: "time speed heap" },
  { label: "Edge Case: Off-Topic Filter", query: "What is the capital city of France?" }
];

export const Hero: React.FC<HeroProps> = ({ onSearch, isLoading }) => {
  const [inputVal, setInputVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      onSearch(inputVal.trim());
    }
  };

  const handleSelectPreset = (q: string) => {
    setInputVal(q);
    onSearch(q);
  };

  return (
    <section className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Minimal Studio Tag */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-gray">
            Agentic RAG Engine • GATE CS/IT
          </span>
        </div>

        {/* Massive Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-extrabold tracking-tightest leading-[0.96] text-off-white mb-6">
          Ask GATE CS.<br />
          <span className="text-muted-gray/70">Get answers with </span>
          <span className="text-off-white underline decoration-accent/60 underline-offset-8">receipts.</span>
        </h1>

        {/* Small Restrained Subhead */}
        <p className="text-base sm:text-lg text-muted-gray max-w-2xl font-normal leading-relaxed mb-12">
          Fine-tuned Qwen 1.5B (QLoRA) paired with hybrid Reciprocal Rank Fusion,
          cross-encoder reranking, and self-corrective CRAG loops for zero-hallucination exam prep.
        </p>
      </motion.div>

      {/* Oversized Underlined Input Field */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8"
      >
        <div className="relative flex items-center border-b-2 border-white/20 focus-within:border-accent transition-colors duration-300 pb-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isLoading}
            placeholder="Type any GATE concept, PYQ problem, or query..."
            className="w-full bg-transparent text-xl sm:text-3xl font-light text-off-white placeholder:text-muted-gray/40 focus:outline-none pr-14 tracking-tight"
          />
          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="absolute right-0 bottom-2.5 p-2.5 rounded-full text-off-white hover:text-accent hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:text-off-white transition-all duration-200"
            aria-label="Submit query"
          >
            <ArrowRight className={`w-7 h-7 ${isLoading ? 'animate-pulse text-accent' : ''}`} />
          </button>
        </div>
      </motion.form>

      {/* Quick Select Benchmark Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap gap-2 pt-2 items-center"
      >
        <span className="text-xs font-mono text-muted-gray uppercase tracking-widest mr-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-accent" /> Presets:
        </span>
        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handleSelectPreset(preset.query)}
            disabled={isLoading}
            className="text-xs font-mono text-muted-gray hover:text-off-white px-3 py-1.5 rounded-md border border-white/[0.06] hover:border-accent/50 bg-[#121212] transition-all duration-200"
          >
            {preset.label} →
          </button>
        ))}
      </motion.div>
    </section>
  );
};
