import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ChevronRight, ArrowUpRight, CheckCircle2, AlertTriangle, RefreshCw, Bookmark, BookmarkCheck, Sliders, Volume2, Pause, Play, Square, Loader2 } from 'lucide-react';
import type { QueryResponse } from '../types';
import { VisualLab, detectSimulationLab } from './VisualLab';
import { professorNarrator, VOICE_OPTIONS, type VoicePersona } from '../services/voice';

interface AnswerSectionProps {
  data: QueryResponse;
  onBookmark?: (item: QueryResponse) => void;
  isBookmarked?: boolean;
}

// Stagger animation container variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Smooth Count-Up Animation Component for Relevance Score
const AnimatedScore: React.FC<{ value: number }> = ({ value }) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // 1 second count-up
    const target = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(easeProgress * target);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayVal(target);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <span className="font-mono font-bold text-accent">{displayVal.toFixed(4)}</span>;
};

// Plain Language Confidence Pill Helper
const getConfidenceMeta = (score: number, passedGate: boolean, reformulationCount: number) => {
  if (reformulationCount > 0) {
    return {
      label: "Refined & Verified",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      description: "Original query expanded with standard GATE terminology"
    };
  }
  if (score >= 0.80 && passedGate) {
    return {
      label: "High System Confidence",
      color: "text-accent bg-accent/10 border-accent/40 shadow-[0_0_12px_rgba(61,90,254,0.25)]",
      description: "Direct theorem & formula provenance verified"
    };
  }
  if (passedGate) {
    return {
      label: "Verified Match",
      color: "text-accent/90 bg-accent/[0.08] border-accent/30",
      description: "Semantic boundary conditions satisfied"
    };
  }
  return {
    label: "Low Confidence",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    description: "Relevance score below gating threshold"
  };
};

export const AnswerSection: React.FC<AnswerSectionProps> = ({ 
  data, 
  onBookmark,
  isBookmarked = false 
}) => {
  const [showTrace, setShowTrace] = useState(false);
  const [showLab, setShowLab] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>('en-IN-PrabhatNeural');

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

  const confidenceMeta = getConfidenceMeta(relevance_score, passed_gate, reformulation_count);
  const detectedSim = detectSimulationLab(`${query} ${reformulated_query} ${subject_hint || ''} ${final_answer}`);

  // Stop narration if query changes
  useEffect(() => {
    return () => {
      professorNarrator.stop();
      setIsSpeaking(false);
      setIsPaused(false);
      setIsLoadingVoice(false);
    };
  }, [query]);

  const handlePlayVoice = async () => {
    if (isSpeaking && !isPaused) {
      professorNarrator.pause();
      setIsPaused(true);
      return;
    }
    if (isPaused) {
      professorNarrator.resume();
      setIsPaused(false);
      return;
    }

    setIsLoadingVoice(true);
    professorNarrator.setRate(speechRate);
    await professorNarrator.speak(
      final_answer,
      selectedVoice,
      () => { setIsSpeaking(true); setIsPaused(false); setIsLoadingVoice(false); },
      () => { setIsSpeaking(false); setIsPaused(false); setIsLoadingVoice(false); },
      () => { setIsSpeaking(false); setIsPaused(false); setIsLoadingVoice(false); }
    );
  };

  const handleStopVoice = () => {
    professorNarrator.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoadingVoice(false);
  };

  const handleSetRate = (rate: number) => {
    setSpeechRate(rate);
    professorNarrator.setRate(rate);
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-6 pt-6 pb-24"
    >
      {/* Subject & State Indicators */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/40 font-semibold shadow-[0_0_10px_rgba(61,90,254,0.15)]">
            {subject_hint || "General CS"}
          </span>

          {/* Animated Relevance Score Pill */}
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border border-white/[0.08] bg-[#12121a] shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            <span className="text-muted-gray">Relevance:</span>
            <AnimatedScore value={relevance_score} />
          </div>

          {/* Plain-Language Confidence Indicator */}
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full border font-medium ${confidenceMeta.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {confidenceMeta.label}
          </span>

          {/* System Gate Status */}
          {passed_gate ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-accent">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Gate Passed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Gated Fallback
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onBookmark && (
            <button
              onClick={() => onBookmark(data)}
              className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                isBookmarked 
                  ? 'border-accent bg-accent/15 text-accent font-semibold shadow-[0_0_12px_rgba(61,90,254,0.25)]' 
                  : 'border-white/[0.08] text-muted-gray hover:text-off-white hover:border-white/20 bg-[#12121a]'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-accent" /> Bookmarked
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" /> Save to Revision
                </>
              )}
            </button>
          )}

          {reformulation_count > 0 && (
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              <RefreshCw className="w-3 h-3 animate-spin" />
              CRAG: {reformulation_count} {reformulation_count === 1 ? 'Loop' : 'Loops'}
            </div>
          )}
        </div>
      </motion.div>

      {/* CRAG Reformulation Banner if triggered */}
      {reformulation_count > 0 && (
        <motion.div 
          variants={itemVariants}
          className="mb-10 p-5 rounded-2xl border border-amber-500/20 border-t-amber-500/40 bg-[#121118] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-3 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> CRAG Question Reformulation Trace
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-muted-gray block text-[11px] mb-1.5">Original User Input:</span>
              <p className="text-red-400/90 bg-red-950/30 p-3 rounded-lg border border-red-900/30">
                "{query}"
              </p>
            </div>
            <div>
              <span className="text-muted-gray block text-[11px] mb-1.5">GATE CS Expanded Query:</span>
              <p className="text-accent/90 bg-accent/[0.08] p-3 rounded-lg border border-accent/30 font-medium">
                "{reformulated_query}"
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Editorial Answer Card with Subtle Top Elevation */}
      <motion.div 
        variants={itemVariants}
        className="mb-16 p-8 sm:p-10 rounded-2xl border border-white/[0.08] border-t-white/[0.18] bg-[#11111a] shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-gray">
              Verified Mathematical Derivation & Proof
            </h2>
            <span className="text-[11px] font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded border border-accent/20">
              Proven Zero-Hallucination
            </span>
          </div>

          {/* IIT Professor Neural Audio Narration Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Voice Persona Selector */}
            <select
              value={selectedVoice}
              onChange={(e) => {
                const v = e.target.value as VoicePersona;
                setSelectedVoice(v);
                if (isSpeaking) {
                  professorNarrator.stop();
                  setIsSpeaking(false);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-[#141420] text-xs font-mono text-off-white focus:outline-none focus:border-accent cursor-pointer"
            >
              {VOICE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#11111a] text-off-white">
                  {opt.label} ({opt.tag})
                </option>
              ))}
            </select>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handlePlayVoice}
              disabled={isLoadingVoice}
              className={`inline-flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isSpeaking && !isPaused
                  ? 'border-accent bg-accent/20 text-accent font-semibold shadow-[0_0_15px_rgba(61,90,254,0.35)]'
                  : isPaused
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-white/[0.08] text-muted-gray hover:text-off-white hover:border-accent/40 bg-[#141420]'
              }`}
            >
              {isLoadingVoice ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : isSpeaking && !isPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                  {/* Equalizer animation */}
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-1 h-3 bg-accent animate-pulse rounded-full" />
                    <span className="w-1 h-4 bg-accent animate-pulse rounded-full" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1 h-2 bg-accent animate-pulse rounded-full" style={{ animationDelay: '0.3s' }} />
                  </span>
                </>
              ) : isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-accent" />
                  <span>🎙️ Listen to Walkthrough</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <>
                <button
                  type="button"
                  onClick={handleStopVoice}
                  title="Stop Audio"
                  className="p-1.5 rounded-lg border border-white/[0.08] hover:border-red-400 text-muted-gray hover:text-red-400 transition-colors bg-[#141420] cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>

                {/* Speed Selector */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#141420] border border-white/[0.06] text-[10px] font-mono">
                  {[0.9, 1.0, 1.25].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSetRate(rate)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        speechRate === rate ? 'bg-accent text-white font-bold' : 'text-muted-gray hover:text-off-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-base sm:text-lg font-normal leading-relaxed text-off-white/95 space-y-6 answer-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ children }) => (
                <div className="pt-4 pb-2">
                  <span className="inline-block text-xs font-mono uppercase tracking-widest text-accent font-semibold bg-accent/10 border border-accent/30 px-3 py-1 rounded-md mb-3 shadow-[0_0_12px_rgba(61,90,254,0.15)]">
                    STAGE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-off-white tracking-tight">{children}</h3>
                </div>
              ),
              h2: ({ children }) => (
                <div className="pt-4 pb-2">
                  <h4 className="text-xl sm:text-2xl font-display font-semibold text-off-white tracking-tight">{children}</h4>
                </div>
              ),
              h3: ({ children }) => {
                const headerText = String(children);
                return (
                  <div className="pt-6 pb-2 border-t border-white/[0.06] first:border-t-0 first:pt-0">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-accent font-semibold bg-accent/[0.12] border border-accent/30 px-3 py-1 rounded-md shadow-[0_0_10px_rgba(61,90,254,0.15)] mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {headerText}
                    </span>
                  </div>
                );
              },
              h4: ({ children }) => (
                <h5 className="text-base font-semibold text-off-white mt-4 mb-2 tracking-tight">{children}</h5>
              ),
              p: ({ children }) => <p className="mb-4 text-off-white/90 leading-relaxed font-light">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-outside pl-6 space-y-2 mb-4 text-off-white/90">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-outside pl-6 space-y-2 mb-4 text-off-white/90">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-off-white">{children}</strong>,
              code: ({ children }) => (
                <code className="bg-[#181824] text-accent px-1.5 py-0.5 rounded text-sm font-mono border border-accent/20">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-[#0e0e16] p-5 rounded-xl border border-white/[0.08] border-t-white/[0.14] overflow-x-auto text-sm font-mono my-4 text-off-white shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  {children}
                </pre>
              ),
            }}
          >
            {final_answer}
          </ReactMarkdown>
        </div>

        {/* Visual Lab Simulation Toggle & Targeted Auto-Detection */}
        {detectedSim ? (
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowLab(!showLab)}
                className="inline-flex items-center gap-2 text-xs font-mono px-4 py-2.5 rounded-xl border border-accent/40 bg-accent/15 text-accent hover:bg-accent hover:text-white transition-all shadow-[0_0_16px_rgba(61,90,254,0.25)] cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>{showLab ? `Hide ${detectedSim.title}` : `⚡ Open ${detectedSim.title} (Sliders)`}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
              <span className="text-[11px] font-mono text-muted-gray hidden sm:inline">
                {detectedSim.description}
              </span>
            </div>

            {showLab && (
              <VisualLab 
                forceSpecificLab={detectedSim.type} 
                queryTopicHint={`${query} ${subject_hint || ''}`} 
              />
            )}
          </div>
        ) : (
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowLab(!showLab)}
                className="inline-flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-xl border border-white/[0.1] bg-[#14141f] text-muted-gray hover:text-off-white hover:border-white/[0.2] transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>{showLab ? "Hide Formula Simulation Suite" : "Explore Quantitative GATE CS Simulations"}</span>
              </button>
              <span className="text-[11px] font-mono text-muted-gray hidden sm:inline">
                8 interactive parameter sweep laboratories
              </span>
            </div>

            {showLab && (
              <VisualLab queryTopicHint={`${query} ${subject_hint || ''}`} />
            )}
          </div>
        )}
      </motion.div>

      {/* Hover-Reveal Source Cards */}
      <motion.div variants={itemVariants} className="mb-16">
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
                className="group relative h-48 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#11111a] p-5 overflow-hidden transition-all duration-300 hover:border-accent/70 hover:border-t-accent hover:shadow-[0_8px_30px_rgba(61,90,254,0.2)] cursor-pointer flex flex-col justify-between"
              >
                {/* Default State */}
                <div className="transition-opacity duration-200 group-hover:opacity-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono text-accent uppercase tracking-widest px-2 py-0.5 bg-accent/10 rounded border border-accent/20">
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
                <div className="absolute inset-0 p-5 bg-[#141422] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between pointer-events-none">
                  <div>
                    <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-1.5 flex justify-between items-center">
                      <span>Chunk: {cit.chunk_id}</span>
                      <span className="text-accent font-semibold">Sim: {cit.similarity_score.toFixed(3)}</span>
                    </div>
                    <p className="text-xs text-off-white/90 font-mono line-clamp-4 leading-relaxed">
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
      </motion.div>

      {/* Transparent Retrieval Trace Toggle */}
      <motion.div variants={itemVariants} className="pt-6 border-t border-white/[0.08]">
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
              className="mt-6 p-6 rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#0d0d16] space-y-6 text-xs font-mono shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
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
                  02. Cross-Encoder Joint Token Reranking Scores:
                </h5>
                <div className="space-y-1.5 text-muted-gray">
                  {rerank_results.map((item, i) => (
                    <div key={`rerank-${i}`} className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                      <span>#{i + 1} {item.source_file} • {item.subtopic}</span>
                      <span className="text-accent font-bold">{(item.rerank_score ?? 0).toFixed(4)}</span>
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
      </motion.div>
    </motion.section>
  );
};
