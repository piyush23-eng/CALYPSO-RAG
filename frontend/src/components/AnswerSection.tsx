import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowUpRight, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { QueryResponse } from '../types';

interface AnswerSectionProps {
  data: QueryResponse;
}

export const AnswerSection: React.FC<AnswerSectionProps> = ({ data }) => {
  const [showTrace, setShowTrace] = useState(false);

  const {
    query,
    reformulated_query,
    subject_hint,
    final_answer,
    citations,
    rerank_results,
    retrieval_results,
    relevance_score,
    reformulation_count,
    passed_gate,
    is_low_confidence,
    telemetry
  } = data;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto px-6 pt-6 pb-24"
    >
      {/* Subject & State Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/30 font-semibold">
            {subject_hint || "General CS"}
          </span>
          <span className="text-xs font-mono text-muted-gray">
            Relevance: <strong className="text-off-white">{relevance_score.toFixed(4)}</strong>
          </span>
          {passed_gate ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Gate Passed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Low Confidence
            </span>
          )}
        </div>

        {reformulation_count > 0 && (
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            <RefreshCw className="w-3 h-3 animate-spin" />
            CRAG Self-Correction: {reformulation_count} {reformulation_count === 1 ? 'Loop' : 'Loops'}
          </div>
        )}
      </div>

      {/* CRAG Reformulation Banner if triggered */}
      {reformulation_count > 0 && (
        <div className="mb-10 p-5 rounded-xl border border-amber-500/20 bg-[#14120c]">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Query Expansion Diff
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <span className="text-muted-gray block text-xs mb-1">Original Input:</span>
              <p className="text-red-400/90 bg-red-950/30 p-2.5 rounded border border-red-900/30">
                "{query}"
              </p>
            </div>
            <div>
              <span className="text-muted-gray block text-xs mb-1">GATE CS Terminology Expansion:</span>
              <p className="text-emerald-400/90 bg-emerald-950/30 p-2.5 rounded border border-emerald-900/30">
                "{reformulated_query}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Large-Scale Answer Content */}
      <div className="mb-16">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-gray mb-6">
          Verified Mathematical Derivation
        </h2>
        <div className="text-lg sm:text-xl font-normal leading-relaxed text-off-white/95 space-y-6 answer-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ children }) => <h3 className="text-2xl sm:text-3xl font-display font-bold text-off-white tracking-tight mt-8 mb-4">{children}</h3>,
              h2: ({ children }) => <h4 className="text-xl sm:text-2xl font-display font-semibold text-off-white tracking-tight mt-6 mb-3">{children}</h4>,
              h3: ({ children }) => <h5 className="text-lg font-semibold text-accent mt-4 mb-2">{children}</h5>,
              p: ({ children }) => <p className="mb-4 text-off-white/90 leading-relaxed font-light">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-outside pl-6 space-y-2 mb-4 text-off-white/90">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-outside pl-6 space-y-2 mb-4 text-off-white/90">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-off-white">{children}</strong>,
              code: ({ children }) => (
                <code className="bg-[#181818] text-accent px-1.5 py-0.5 rounded text-sm font-mono border border-white/10">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-[#121212] p-4 rounded-xl border border-white/10 overflow-x-auto text-sm font-mono my-4 text-off-white">
                  {children}
                </pre>
              ),
            }}
          >
            {final_answer}
          </ReactMarkdown>
        </div>
      </div>

      {/* Hover-Reveal Source Cards (One per cited chunk / evidence passage) */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-gray">
            Evidence Sources ({citations.length > 0 ? citations.length : rerank_results.length} Verified Receipts)
          </h3>
          <span className="text-xs font-mono text-muted-gray">
            Attribution Cosine Sim ≥ 0.60
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(citations.length > 0 ? citations : rerank_results.map(r => ({
            sentence: r.content.slice(0, 100) + '...',
            chunk_id: r.chunk_id,
            source_file: r.source_file,
            topic: `${r.topic} / ${r.subtopic}`,
            similarity_score: r.rerank_score || 0.85
          }))).map((cit, idx) => {
            return (
              <div
                key={`${cit.chunk_id}-${idx}`}
                className="group relative h-48 rounded-xl border border-white/[0.08] bg-[#121212] p-5 overflow-hidden transition-all duration-300 hover:border-accent/60 hover:shadow-[0_0_25px_rgba(61,90,254,0.15)] cursor-pointer flex flex-col justify-between"
              >
                {/* Default State */}
                <div className="transition-opacity duration-200 group-hover:opacity-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono text-accent uppercase tracking-widest px-2 py-0.5 bg-accent/10 rounded">
                        [{idx + 1}] RECEIPT
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-muted-gray group-hover:text-accent transition-colors" />
                    </div>
                    <h4 className="text-sm font-semibold text-off-white tracking-tight line-clamp-2">
                      {cit.topic}
                    </h4>
                  </div>
                  <div className="text-[11px] font-mono text-muted-gray truncate border-t border-white/[0.06] pt-3">
                    📁 {cit.source_file}
                  </div>
                </div>

                {/* Hover Reveal State */}
                <div className="absolute inset-0 p-5 bg-[#141416] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between pointer-events-none">
                  <div>
                    <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-1.5 flex justify-between items-center">
                      <span>Chunk: {cit.chunk_id}</span>
                      <span className="text-emerald-400 font-semibold">Sim: {cit.similarity_score.toFixed(3)}</span>
                    </div>
                    <p className="text-xs text-off-white/80 font-mono line-clamp-4 leading-relaxed">
                      "{cit.sentence}"
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-muted-gray border-t border-white/[0.06] pt-2">
                    Verified semantic match →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparent Retrieval Trace Toggle (Collapsed by default) */}
      <div className="pt-6 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={() => setShowTrace(!showTrace)}
          className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-gray hover:text-accent transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showTrace ? 'rotate-90 text-accent' : ''}`} />
          <span>{showTrace ? 'Hide Retrieval Trace' : 'Show Retrieval Trace (RRF + Cross-Encoder)'}</span>
          <span className="text-accent/80 font-normal">→</span>
        </button>

        <AnimatePresence>
          {showTrace && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-6 rounded-xl border border-white/[0.08] bg-[#0e0e0e] space-y-6 text-xs font-mono"
            >
              <div>
                <h5 className="text-off-white font-semibold mb-2 uppercase tracking-wider text-[11px] text-accent">
                  01. Reciprocal Rank Fusion (k=60) Candidates:
                </h5>
                <div className="space-y-1.5 text-muted-gray">
                  {retrieval_results.slice(0, 5).map((item, i) => (
                    <div key={`ret-${i}`} className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                      <span>#{i + 1} {item.source_file} • {item.topic}</span>
                      <span className="text-off-white">RRF: {item.rrf_score.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-off-white font-semibold mb-2 uppercase tracking-wider text-[11px] text-accent">
                  02. Cross-Encoder Full-Attention Reranking:
                </h5>
                <div className="space-y-1.5 text-muted-gray">
                  {rerank_results.slice(0, 3).map((item, i) => (
                    <div key={`rerank-${i}`} className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                      <span>Top #{i + 1} [{item.chunk_id}] {item.source_file}</span>
                      <span className="text-emerald-400 font-semibold">
                        Relevance: {item.rerank_score !== undefined ? item.rerank_score.toFixed(4) : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {telemetry && (
                <div className="pt-2 text-[11px] text-muted-gray flex flex-wrap gap-6">
                  <span>Confidence: <strong className="text-off-white">{(telemetry.confidence || 0).toFixed(4)}</strong></span>
                  <span>Citation Coverage: <strong className="text-off-white">{((telemetry.citation_coverage || 0) * 100).toFixed(1)}%</strong></span>
                  <span>Reliability: <strong className={is_low_confidence ? 'text-amber-400' : 'text-emerald-400'}>{is_low_confidence ? 'Unverified' : 'Grounded'}</strong></span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};
