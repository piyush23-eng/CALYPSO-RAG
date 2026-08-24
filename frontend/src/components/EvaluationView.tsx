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
            overall: "79.9%",
            precision: "85.0%",
            recall: "75.0%",
            faithfulness: "78.2%",
            relevance: "81.5%",
            highlight: true
          }
        ].map((config, idx) => (
          <motion.div
            key={config.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`p-8 rounded-2xl border flex flex-col justify-between ${
              config.highlight
                ? 'border-accent/80 bg-gradient-to-b from-[#141824] to-[#0d0f17] shadow-[0_0_30px_rgba(61,90,254,0.18)]'
                : 'border-white/[0.08] bg-[#121212]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-muted-gray uppercase tracking-widest">
                  {config.tag}
                </span>
                {config.highlight && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/40 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> WINNER
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
            { label: "Context Precision", val: "85.0%", target: "≥ 75%", delta: "+10.0%" },
            { label: "Context Recall", val: "75.0%", target: "≥ 75%", delta: "Met" },
            { label: "Faithfulness", val: "78.2%", target: "≥ 75%", delta: "+3.2%" },
            { label: "Answer Relevance", val: "81.5%", target: "≥ 75%", delta: "+6.5%" },
          ].map((item) => (
            <div key={item.label} className="p-6 rounded-xl border border-white/[0.08] bg-[#121212]">
              <div className="text-4xl font-display font-extrabold text-off-white tracking-tightest mb-1">
                {item.val}
              </div>
              <div className="text-xs font-mono text-muted-gray uppercase tracking-wider mb-3">
                {item.label}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Target {item.target} ({item.delta})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 20 Handcrafted Questions Table */}
      {data?.ragas_summary?.detailed_results && (
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-gray mb-6">
            Individual Benchmark Question Breakdown (20 Samples)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#121212]">
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
                    <td className="p-4 text-right text-emerald-400">{r.context_precision.toFixed(2)}</td>
                    <td className="p-4 text-right text-emerald-400">{r.context_recall.toFixed(2)}</td>
                    <td className="p-4 text-right text-emerald-400">{r.faithfulness.toFixed(2)}</td>
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
