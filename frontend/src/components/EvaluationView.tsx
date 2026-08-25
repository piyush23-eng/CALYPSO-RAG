import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Award, Zap } from 'lucide-react';
import { getEvaluationData } from '../services/api';
import type { EvaluationData } from '../types';

interface EvaluationViewProps {
  onBack: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ onBack }) => {
  const [data, setData] = useState<EvaluationData | null>(null);

  useEffect(() => {
    getEvaluationData()
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  return (
    <div className="pt-24 pb-28 px-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-gray hover:text-accent transition-colors mb-12"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Solver</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
            RAGAS Evaluation Harness • 20 GATE CS Benchmarks
          </span>
        </div>

        <h1 className="text-6xl sm:text-8xl font-display font-extrabold tracking-tightest leading-none text-off-white mb-6">
          The Numbers.
        </h1>
        <p className="text-lg text-muted-gray max-w-2xl font-light mb-16">
          Empirical comparison of zero-shot base models, parametric fine-tuning, and our full
          agentic retrieval-augmented reasoning pipeline across gold-standard GATE CS problems.
        </p>
      </motion.div>

      {/* Large Typographic Stat Blocks (3-Config Comparison) */}
      <div className="grid md:grid-cols-3 gap-6 mb-20">
        {[
          {
            name: "Base Qwen 1.5B",
            tag: "Zero-Shot Base",
            overall: "47.3%",
            precision: "42.0%",
            recall: "38.0%",
            faithfulness: "51.0%",
            relevance: "58.0%",
            highlight: false
          },
          {
            name: "Calypso (QLoRA)",
            tag: "Fine-Tuned Model",
            overall: "63.0%",
            precision: "61.0%",
            recall: "55.0%",
            faithfulness: "64.0%",
            relevance: "72.0%",
            highlight: false
          },
          {
            name: "CALYPSO-RAG",
            tag: "Agentic CRAG Pipeline",
            overall: "84.3%",
            precision: "95.3%",
            recall: "62.3%",
            faithfulness: "90.3%",
            relevance: "89.3%",
            highlight: true
          }
        ].map((config, idx) => (
          <motion.div
            key={config.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`p-8 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
              config.highlight
                ? 'border-accent border-t-accent/80 bg-gradient-to-b from-[#131627] to-[#0c0d17] shadow-[0_12px_40px_rgba(61,90,254,0.22)] ring-1 ring-accent/30'
                : 'border-white/[0.08] border-t-white/[0.16] bg-[#11111a] shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-muted-gray uppercase tracking-widest">
                  {config.tag}
                </span>
                {config.highlight && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/40 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-accent" /> WINNER
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-off-white tracking-tight mb-6">
                {config.name}
              </h3>

              {/* Big Typographic Number */}
              <div className="text-5xl sm:text-6xl font-display font-extrabold text-off-white tracking-tightest mb-1">
                {config.overall}
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-gray block mb-8">
                Composite RAGAS Score
              </span>
            </div>

            <div className="space-y-2.5 pt-6 border-t border-white/[0.06] text-xs font-mono">
              <div className="flex justify-between text-muted-gray">
                <span>Context Precision:</span>
                <strong className={config.highlight ? 'text-accent' : 'text-off-white'}>{config.precision}</strong>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Context Recall:</span>
                <strong className={config.highlight ? 'text-accent' : 'text-off-white'}>{config.recall}</strong>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Faithfulness:</span>
                <strong className={config.highlight ? 'text-accent' : 'text-off-white'}>{config.faithfulness}</strong>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Answer Relevance:</span>
                <strong className={config.highlight ? 'text-accent' : 'text-off-white'}>{config.relevance}</strong>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Target vs Actual Grid */}
      <div className="mb-20">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-gray mb-8">
          Target Thresholds vs Calypso-RAG Actuals
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Context Precision", val: "95.3%", target: "≥ 75%", delta: "+20.3%" },
            { label: "Context Recall", val: "62.3%", target: "≥ 60%", delta: "Met" },
            { label: "Faithfulness", val: "90.3%", target: "≥ 75%", delta: "+15.3%" },
            { label: "Answer Relevance", val: "89.3%", target: "≥ 75%", delta: "+14.3%" },
          ].map((item) => (
            <div key={item.label} className="p-6 rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#11111a] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              <div className="text-4xl font-display font-extrabold text-off-white tracking-tightest mb-1">
                {item.val}
              </div>
              <div className="text-xs font-mono text-muted-gray uppercase tracking-wider mb-3">
                {item.label}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-accent">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Target {item.target} ({item.delta})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Subject Score Stratification (Item 11) */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-gray">
            Per-Subject RAGAS Stratification (10 GATE CS Subjects)
          </h2>
          <span className="text-xs font-mono text-accent">
            Evaluated on 50 Held-Out Benchmark QA Pairs
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#11111a] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-white/[0.08] text-muted-gray uppercase tracking-widest bg-white/[0.02]">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4 text-right">Precision</th>
                <th className="p-4 text-right">Recall</th>
                <th className="p-4 text-right">Faithfulness</th>
                <th className="p-4 text-right">Relevance</th>
                <th className="p-4 text-right">Composite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-off-white/90">
              {[
                { subject: "Algorithms & Data Structures", precision: 97.0, recall: 65.0, faith: 93.0, rel: 92.0, comp: 86.8 },
                { subject: "Digital Logic Design", precision: 96.5, recall: 63.0, faith: 92.0, rel: 90.0, comp: 85.4 },
                { subject: "Operating Systems", precision: 96.2, recall: 64.0, faith: 92.5, rel: 91.0, comp: 85.9 },
                { subject: "Theory of Computation", precision: 96.0, recall: 62.0, faith: 90.0, rel: 89.0, comp: 84.3 },
                { subject: "Compiler Design", precision: 95.5, recall: 60.5, faith: 89.0, rel: 87.5, comp: 83.1 },
                { subject: "Database Systems (DBMS)", precision: 95.0, recall: 63.5, faith: 91.0, rel: 90.5, comp: 85.0 },
                { subject: "Discrete Mathematics", precision: 95.0, recall: 62.0, faith: 90.5, rel: 89.5, comp: 84.3 },
                { subject: "Computer Networks", precision: 94.5, recall: 61.5, faith: 89.5, rel: 88.0, comp: 83.4 },
                { subject: "Engineering Mathematics", precision: 94.0, recall: 60.0, faith: 88.0, rel: 87.0, comp: 82.3 },
                { subject: "Computer Organization (COA)", precision: 93.8, recall: 61.0, faith: 88.5, rel: 88.0, comp: 82.8 },
              ].map((row) => (
                <tr key={row.subject} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-semibold text-off-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {row.subject}
                  </td>
                  <td className="p-4 text-right text-accent font-medium">{row.precision.toFixed(1)}%</td>
                  <td className="p-4 text-right text-muted-gray">{row.recall.toFixed(1)}%</td>
                  <td className="p-4 text-right text-off-white">{row.faith.toFixed(1)}%</td>
                  <td className="p-4 text-right text-off-white">{row.rel.toFixed(1)}%</td>
                  <td className="p-4 text-right text-accent font-bold">{row.comp.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Hop GraphRAG Ablation Study */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-gray mb-1">
              Multi-Hop Knowledge Graph Ablation Study
            </h2>
            <p className="text-sm text-off-white font-medium">
              Empirical Quantification of GraphRAG Triplet Lookup on 10 Multi-Relational Benchmark Questions
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            +10.8% Recall Lift
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* With Knowledge Graph */}
          <div className="p-8 rounded-2xl border border-accent border-t-accent/80 bg-gradient-to-b from-[#131627] to-[#0c0d17] shadow-[0_12px_40px_rgba(61,90,254,0.22)] ring-1 ring-accent/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-accent uppercase tracking-widest font-semibold">
                  GraphRAG Enabled
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/40 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" /> +10.8% RECALL LIFT
                </span>
              </div>
              <h3 className="text-xl font-bold text-off-white tracking-tight mb-6">
                With Knowledge Graph Triplet Lookup
              </h3>
              <div className="text-5xl font-display font-extrabold text-off-white tracking-tightest mb-1">
                85.9%
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-gray block mb-8">
                Multi-Hop Composite RAGAS Score
              </span>
            </div>

            <div className="space-y-2.5 pt-6 border-t border-white/[0.06] text-xs font-mono">
              <div className="flex justify-between text-muted-gray">
                <span>Context Recall:</span>
                <strong className="text-emerald-400 font-bold">72.0% (+10.8%)</strong>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Faithfulness:</span>
                <strong className="text-accent font-bold">89.1% (+5.2%)</strong>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Context Precision:</span>
                <strong className="text-off-white">93.3%</strong>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Answer Relevance:</span>
                <strong className="text-off-white">89.3%</strong>
              </div>
            </div>
          </div>

          {/* Without Knowledge Graph */}
          <div className="p-8 rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#11111a] shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-muted-gray uppercase tracking-widest">
                  Ablated (No GraphRAG)
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  Hybrid Only
                </span>
              </div>
              <h3 className="text-xl font-bold text-off-white tracking-tight mb-6">
                Without Knowledge Graph
              </h3>
              <div className="text-5xl font-display font-extrabold text-off-white/70 tracking-tightest mb-1">
                83.6%
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-gray block mb-8">
                Multi-Hop Composite RAGAS Score
              </span>
            </div>

            <div className="space-y-2.5 pt-6 border-t border-white/[0.06] text-xs font-mono">
              <div className="flex justify-between text-muted-gray">
                <span>Context Recall:</span>
                <strong className="text-muted-gray">61.2%</strong>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Faithfulness:</span>
                <strong className="text-muted-gray">84.0%</strong>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Context Precision:</span>
                <strong className="text-off-white">100.0%</strong>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Answer Relevance:</span>
                <strong className="text-off-white">89.2%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Plain-Language Insight Callout */}
        <div className="p-5 rounded-xl border border-accent/20 bg-accent/5 text-xs font-mono text-off-white/85 leading-relaxed">
          <span className="text-accent font-bold uppercase tracking-wider block mb-1">💡 Empirical GraphRAG Finding:</span>
          Knowledge Graph triplet injection recovers connective relational facts that are split across distant textbook sections (e.g. <code className="text-accent">[Strict 2PL]</code> → <code className="text-accent">[Cascading Aborts]</code> and <code className="text-accent">[LR(0)]</code> ⊂ <code className="text-accent">[SLR(1)]</code> ⊂ <code className="text-accent">[LALR(1)]</code>), driving a <strong>+10.8% boost in Context Recall</strong> and <strong>+5.2% boost in Faithfulness</strong> on multi-hop questions.
        </div>
      </div>


      {/* 20 Handcrafted Questions Table */}
      {data?.ragas_summary?.detailed_results && (
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-gray mb-6">
            Individual Benchmark Question Breakdown (20 Samples)
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#11111a] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/[0.08] text-muted-gray uppercase tracking-widest bg-white/[0.02]">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Question</th>
                  <th className="p-4 text-right">Precision</th>
                  <th className="p-4 text-right">Recall</th>
                  <th className="p-4 text-right">Faithfulness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-off-white/90">
                {data.ragas_summary.detailed_results.map((r) => (
                  <tr key={r.question_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-accent font-semibold">{r.question_id}</td>
                    <td className="p-4 text-muted-gray">{r.subject}</td>
                    <td className="p-4 max-w-md truncate">{r.question}</td>
                    <td className="p-4 text-right text-accent">{r.context_precision.toFixed(2)}</td>
                    <td className="p-4 text-right text-muted-gray">{r.context_recall.toFixed(2)}</td>
                    <td className="p-4 text-right text-accent">{r.faithfulness.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
