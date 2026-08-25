import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Compass, Sparkles, RefreshCw } from 'lucide-react';
import { fetchStudentMastery } from '../services/api';
import type { StudentMasteryProfile } from '../types';

export const StudentMasteryView: React.FC = () => {
  const [profile, setProfile] = useState<StudentMasteryProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const savedQuiz = localStorage.getItem('calypso_quiz_results');
      const savedHistory = localStorage.getItem('calypso_session_history');

      const quizHist = savedQuiz ? JSON.parse(savedQuiz) : [];
      const queryHist = savedHistory ? JSON.parse(savedHistory) : [];

      const res = await fetchStudentMastery(
        Array.isArray(quizHist) ? quizHist : [],
        Array.isArray(queryHist) ? queryHist : []
      );
      setProfile(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center font-mono text-muted-gray">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-accent mb-3" />
        <span>Computing Bayesian Knowledge Tracing (BKT) Cognitive Profile...</span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left border-b border-white/[0.08] pb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/40 font-semibold shadow-[0_0_10px_rgba(61,90,254,0.15)]">
              🧠 Deep Knowledge Tracing
            </span>
            <span className="text-xs font-mono text-muted-gray">Bayesian Mastery Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-off-white tracking-tight">
            Personalized GATE CS Cognitive Mastery Radar
          </h1>
          <p className="text-sm font-mono text-muted-gray mt-1">
            Dynamic Bayesian Knowledge Tracing (BKT) tracking prior understanding, learning transitions, and slip probability.
          </p>
        </div>

        <button
          onClick={loadProfile}
          className="inline-flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-xl border border-white/[0.08] hover:border-accent/40 bg-[#12121a] text-off-white transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-accent" />
          <span>Recompute Model</span>
        </button>
      </div>

      {/* Hero Overview Card */}
      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/10 to-[#10101c] shadow-[0_8px_24px_rgba(61,90,254,0.15)]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              Estimated Mastery
            </span>
            <Brain className="w-5 h-5 text-accent" />
          </div>
          <div className="text-4xl font-display font-bold text-off-white mb-2">
            {profile.overall_mastery_percentage}%
          </div>
          <p className="text-xs font-mono text-emerald-400">
            {profile.readiness_verdict}
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-amber-500/30 bg-[#12111a]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Highest Weakness Risk
            </span>
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-lg font-display font-bold text-off-white mb-1 truncate">
            {profile.recommended_focus}
          </div>
          <p className="text-xs font-mono text-muted-gray">
            Focus next study & quiz sessions on this domain to maximize percentile.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-[#10141a]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Strongest Mastery
            </span>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-lg font-display font-bold text-off-white mb-1 truncate">
            {profile.strongest_domains[0] || "Operating Systems"}
          </div>
          <p className="text-xs font-mono text-muted-gray">
            Consistently high precision and zero slips across recent interactions.
          </p>
        </div>
      </div>

      {/* 10-Subject Bayesian Mastery Progress Bars */}
      <div className="mb-12 p-8 rounded-2xl border border-white/[0.08] bg-[#11111a] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-gray mb-6 flex items-center gap-2">
          <Compass className="w-4 h-4 text-accent" /> 10-Subject Stratified Mastery Vector \(P(M_k)\)
        </h3>

        <div className="space-y-5">
          {Object.entries(profile.subject_mastery).map(([subject, score]) => {
            const pct = Math.round(score * 100);
            const isWeak = profile.weakest_domains.includes(subject);
            const isStrong = profile.strongest_domains.includes(subject);

            return (
              <div key={subject} className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-off-white font-medium flex items-center gap-2">
                    {subject}
                    {isWeak && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        Needs Revision
                      </span>
                    )}
                    {isStrong && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        High Mastery
                      </span>
                    )}
                  </span>
                  <span className={`font-bold ${isWeak ? 'text-amber-400' : isStrong ? 'text-emerald-400' : 'text-accent'}`}>
                    {pct}%
                  </span>
                </div>

                {/* Progress track */}
                <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      isWeak
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : isStrong
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-accent to-indigo-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
