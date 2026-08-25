import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ArrowLeft, Timer, CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, Flag } from 'lucide-react';
import { GATE_SUBJECTS } from './SubjectFilter';


interface QuizQuestion {
  id: string;
  subject: string;
  type: string;
  year?: string;
  marks: number;
  negative_marks: number;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}


interface QuizViewProps {
  onBack: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [totalInBank, setTotalInBank] = useState(1056);

  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Fetch Questions
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedSubject !== "All Subjects") params.append("subject", selectedSubject);
    if (selectedType !== "All Types") params.append("q_type", selectedType);

    const url = `/api/quiz/questions?${params.toString()}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        if (data.total_in_bank) setTotalInBank(data.total_in_bank);
        setCurrentIdx(0);
        setUserAnswers({});
        setMarkedForReview({});
        setTimeLeft(600);
        setIsSubmitted(false);
        setIsTimerRunning(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedSubject, selectedType]);


  // Countdown timer
  useEffect(() => {
    if (!isTimerRunning || isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, isSubmitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId: string, optionKey: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionKey
    }));
  };

  const toggleMarkForReview = (qId: string) => {
    setMarkedForReview(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Compute GATE Score
  const computeScore = () => {
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    questions.forEach(q => {
      const userAns = (userAnswers[q.id] || '').trim();
      const correctAns = (q.correct_answer || '').trim();

      if (!userAns) {
        unattemptedCount++;
        return;
      }

      let isCorrect = false;

      if (q.type === 'MSQ') {
        const userSet = userAns.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).sort().join(',');
        const correctSet = correctAns.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).sort().join(',');
        isCorrect = userSet === correctSet;
      } else if (q.type === 'NAT') {
        const userNum = parseFloat(userAns);
        const correctNum = parseFloat(correctAns);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 1e-3;
        } else {
          isCorrect = userAns.toLowerCase() === correctAns.toLowerCase();
        }
      } else {
        isCorrect = userAns.toUpperCase() === correctAns.toUpperCase();
      }

      if (isCorrect) {
        totalScore += q.marks;
        correctCount++;
      } else {
        totalScore -= q.negative_marks;
        wrongCount++;
      }
    });

    return {
      totalScore: Number(totalScore.toFixed(2)),
      correctCount,
      wrongCount,
      unattemptedCount,
      maxScore: questions.reduce((acc, q) => acc + q.marks, 0)
    };

  };

  const currentQ = questions[currentIdx];
  const scoreStats = computeScore();

  return (
    <div className="pt-24 pb-28 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-gray hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Mock Exam</span>
        </button>

        {/* Live Countdown Timer */}
        {!isSubmitted && (
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold ${
            timeLeft < 120 
              ? 'border-red-500/50 bg-red-950/30 text-red-400 animate-pulse' 
              : 'border-accent/40 bg-accent/10 text-accent'
          }`}>
            <Timer className="w-4 h-4" />
            <span>Time Remaining: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
            GATE CS Interactive Examination Module
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-off-white mb-4">
          Practice Mock Exam.
        </h1>
        <p className="text-sm sm:text-base text-muted-gray font-light max-w-2xl">
          Authentic examination simulator loaded with <strong>100% verified, pure GATE CS questions ({totalInBank} items)</strong> preserving exact mathematical notation, official options, and rigorous analytical derivations.
        </p>
      </div>


      {/* Type & Subject Filter Bar */}
      {!isSubmitted && (
        <div className="space-y-3 mb-8">
          {/* Question Type Filter (MCQ / MSQ / NAT) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.06]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-gray mr-2">Pattern:</span>
            {["All Types", "MCQ", "MSQ", "NAT"].map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`text-xs font-mono px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  selectedType === t
                    ? 'border-cyan-500/80 bg-cyan-500/15 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'border-white/[0.08] text-muted-gray hover:text-off-white bg-[#111116]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Subject Filter Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSubject("All Subjects")}
              className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition-all flex-shrink-0 cursor-pointer ${
                selectedSubject === "All Subjects"
                  ? 'border-accent bg-accent/15 text-accent font-semibold shadow-[0_0_12px_rgba(61,90,254,0.25)]'
                  : 'border-white/[0.08] text-muted-gray hover:text-off-white bg-[#111116]'
              }`}
            >
              All Subjects ({questions.length})
            </button>
            {GATE_SUBJECTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.name)}
                className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition-all flex-shrink-0 cursor-pointer ${
                  selectedSubject === s.name
                    ? 'border-accent bg-accent/15 text-accent font-semibold shadow-[0_0_12px_rgba(61,90,254,0.25)]'
                    : 'border-white/[0.08] text-muted-gray hover:text-off-white bg-[#111116]'
                }`}
              >
                {s.short}
              </button>
            ))}
          </div>
        </div>
      )}


      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-muted-gray animate-pulse">
          Loading authentic examination questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="py-20 text-center text-xs font-mono text-muted-gray">
          No questions available for this subject currently.
        </div>
      ) : !isSubmitted ? (
        /* Active Exam View */
        <div className="grid md:grid-cols-4 gap-8">
          {/* Main Question Panel */}
          <div className="md:col-span-3 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#111116] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              {/* Question Type & Marks Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-accent uppercase tracking-widest px-2.5 py-1 rounded bg-accent/10 border border-accent/20 font-bold">
                    Q{currentIdx + 1} OF {questions.length}
                  </span>
                  {currentQ.year && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {currentQ.year}
                    </span>
                  )}
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${
                    currentQ.type === 'MSQ'
                      ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                      : currentQ.type === 'NAT'
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                        : 'border-white/[0.08] bg-white/[0.04] text-muted-gray'
                  }`}>
                    {currentQ.type || 'MCQ'}
                  </span>
                  <span className="text-xs font-mono text-muted-gray">
                    {currentQ.subject}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-accent font-semibold">+{currentQ.marks.toFixed(1)} Marks</span>
                  {currentQ.negative_marks > 0 ? (
                    <span className="text-red-400">-{currentQ.negative_marks.toFixed(2)} Neg</span>
                  ) : (
                    <span className="text-emerald-400">0.00 Neg (No Negative)</span>
                  )}
                </div>
              </div>

              {/* Question Body with LaTeX Math Rendering in Match Font */}
              <div className="text-base sm:text-lg font-sans font-normal text-off-white/95 leading-relaxed mb-8 answer-markdown">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {currentQ.question}
                </ReactMarkdown>
              </div>

              {/* Question Inputs: NAT vs MSQ vs MCQ */}
              {currentQ.type === 'NAT' ? (
                <div className="p-6 rounded-xl border border-cyan-500/30 bg-cyan-950/10 space-y-3">
                  <span className="text-xs font-mono text-cyan-300 block font-semibold">
                    Numerical Answer Type (NAT) — Enter Exact Real / Integer Value:
                  </span>
                  <input
                    type="text"
                    value={userAnswers[currentQ.id] || ''}
                    onChange={(e) => handleSelectOption(currentQ.id, e.target.value.trim())}
                    placeholder="Enter numerical answer..."
                    className="w-full max-w-sm px-4 py-3 rounded-lg border border-cyan-500/40 bg-[#121420] text-off-white font-sans text-base focus:outline-none focus:border-cyan-400"
                  />
                </div>
              ) : currentQ.type === 'MSQ' ? (
                <div className="space-y-3">
                  <span className="text-xs font-mono text-purple-300 block mb-2 font-semibold">
                    Multiple Select Question (MSQ) — Select All Options That Apply:
                  </span>
                  {currentQ.options?.map((opt) => {
                    const optKey = opt.charAt(1) || opt.charAt(0);
                    const currentSelected = (userAnswers[currentQ.id] || '').split(',').filter(Boolean);
                    const isChecked = currentSelected.includes(optKey);

                    const handleToggleMSQ = () => {
                      if (isSubmitted) return;
                      const next = isChecked
                        ? currentSelected.filter(k => k !== optKey)
                        : [...currentSelected, optKey].sort();
                      setUserAnswers(prev => ({ ...prev, [currentQ.id]: next.join(',') }));
                    };

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={handleToggleMSQ}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'border-purple-500 bg-purple-500/15 text-white font-medium shadow-[0_0_16px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/40'
                            : 'border-white/[0.08] border-t-white/[0.12] bg-[#14141c] hover:border-purple-500/50 text-off-white/90'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-sans font-normal leading-relaxed answer-markdown flex-1 pr-3">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {opt}
                          </ReactMarkdown>
                        </div>
                        <span className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                          isChecked ? 'border-purple-500 bg-purple-500 text-black font-bold text-xs' : 'border-white/20'
                        }`}>
                          {isChecked && '✓'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Standard MCQ */
                <div className="space-y-3">
                  {currentQ.options?.map((opt) => {
                    const optKey = opt.charAt(1) || opt.charAt(0);
                    const isSelected = userAnswers[currentQ.id] === optKey;

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, optKey)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-accent bg-accent/15 text-white font-medium shadow-[0_0_16px_rgba(61,90,254,0.25)] ring-1 ring-accent/40'
                            : 'border-white/[0.08] border-t-white/[0.12] bg-[#14141c] hover:border-accent/50 text-off-white/90'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-sans font-normal leading-relaxed answer-markdown flex-1 pr-3">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {opt}
                          </ReactMarkdown>
                        </div>
                        <span className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-accent bg-accent' : 'border-white/20'
                        }`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}



              {/* Navigation & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-8 mt-8 border-t border-white/[0.06]">
                <button
                  onClick={() => toggleMarkForReview(currentQ.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-mono px-3.5 py-2 rounded-lg border transition-all ${
                    markedForReview[currentQ.id]
                      ? 'border-amber-500/60 bg-amber-500/15 text-amber-400 font-semibold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'border-white/[0.08] text-muted-gray hover:text-off-white bg-[#14141c]'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {markedForReview[currentQ.id] ? "Marked for Review" : "Mark for Review"}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    className="text-xs font-mono px-4 py-2 rounded-lg border border-white/[0.08] text-muted-gray hover:text-off-white disabled:opacity-30 disabled:hover:text-muted-gray bg-[#14141c]"
                  >
                    Previous
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                      className="text-xs font-mono px-4 py-2 rounded-lg bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)] hover:bg-accent-hover transition-all"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsSubmitted(true)}
                      className="text-xs font-mono px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all"
                    >
                      Submit Exam →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Question Palette (Sticky & Scrollable Box) */}
          <div className="space-y-6 md:sticky md:top-24 self-start">
            <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#111116] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-muted-gray">
                  Question Palette
                </h4>
                <span className="text-[11px] font-mono text-accent font-bold">
                  {questions.length} Questions
                </span>
              </div>

              {/* Scrollable Question Grid Container */}
              <div className="max-h-64 sm:max-h-80 overflow-y-auto pr-1 mb-4 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-accent/40">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAns = !!userAnswers[q.id];
                    const isMarked = !!markedForReview[q.id];
                    const isCurrent = currentIdx === idx;

                    let badgeColor = "border-white/[0.08] text-muted-gray bg-[#14141c]";
                    if (isMarked) {
                      badgeColor = "border-amber-500/80 bg-amber-500/20 text-amber-300 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]";
                    } else if (isAns) {
                      badgeColor = "border-accent bg-accent/20 text-accent font-bold shadow-[0_0_8px_rgba(61,90,254,0.3)]";
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-8 rounded-lg border text-xs font-mono flex items-center justify-center transition-all cursor-pointer ${badgeColor} ${
                          isCurrent ? 'ring-2 ring-white text-off-white scale-105 font-bold z-10' : ''
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-[11px] font-mono text-muted-gray border-t border-white/[0.06] pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-accent" />
                    <span>Answered</span>
                  </div>
                  <span className="text-off-white font-bold">{Object.keys(userAnswers).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                    <span>Marked</span>
                  </div>
                  <span className="text-amber-400 font-bold">{Object.keys(markedForReview).filter(k => markedForReview[k]).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#1e1e24] border border-white/20" />
                    <span>Unattempted</span>
                  </div>
                  <span className="text-muted-gray">{questions.length - Object.keys(userAnswers).length}</span>
                </div>
              </div>

              {/* Instant Submit Button */}
              <button
                onClick={() => setIsSubmitted(true)}
                className="w-full mt-5 py-2.5 rounded-xl border border-accent/40 bg-accent/15 text-accent text-xs font-mono font-bold hover:bg-accent hover:text-white transition-all shadow-[0_0_12px_rgba(61,90,254,0.2)] cursor-pointer"
              >
                Submit Exam
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Post-Exam Score Report & Detailed Review */
        <div className="space-y-12">
          {/* Typographic Score Card */}
          <div className="p-8 sm:p-10 rounded-2xl border border-accent/60 border-t-accent bg-gradient-to-b from-[#131627] to-[#0c0d17] shadow-[0_12px_40px_rgba(61,90,254,0.22)] ring-1 ring-accent/30">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold block mb-1">
                  Official GATE Examination Score
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-off-white">
                  Exam Completed
                </h3>
              </div>
              <button
                onClick={() => {
                  setUserAnswers({});
                  setMarkedForReview({});
                  setTimeLeft(600);
                  setIsSubmitted(false);
                }}
                className="inline-flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-xl bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)] hover:bg-accent-hover transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Exam
              </button>
            </div>

            {/* Score Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8 border-b border-white/[0.08]">
              <div>
                <div className="text-5xl font-display font-black text-accent tracking-tightest">
                  {scoreStats.totalScore}
                </div>
                <span className="text-xs font-mono text-muted-gray uppercase tracking-wider">
                  Marks (out of {scoreStats.maxScore.toFixed(1)})
                </span>
              </div>
              <div>
                <div className="text-5xl font-display font-black text-emerald-400 tracking-tightest">
                  {scoreStats.correctCount}
                </div>
                <span className="text-xs font-mono text-muted-gray uppercase tracking-wider">
                  Correct (+Marks)
                </span>
              </div>
              <div>
                <div className="text-5xl font-display font-black text-red-400 tracking-tightest">
                  {scoreStats.wrongCount}
                </div>
                <span className="text-xs font-mono text-muted-gray uppercase tracking-wider">
                  Incorrect (-Neg)
                </span>
              </div>
              <div>
                <div className="text-5xl font-display font-black text-muted-gray tracking-tightest">
                  {scoreStats.unattemptedCount}
                </div>
                <span className="text-xs font-mono text-muted-gray uppercase tracking-wider">
                  Unattempted
                </span>
              </div>
            </div>
          </div>

          {/* Question by Question Detailed CALYPSO Derivation Review */}
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-gray">
              Step-by-Step Verified Solution Derivations ({questions.length} Items)
            </h3>

            {questions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correct_answer;
              const isUnattempted = !userAns;

              return (
                <div
                  key={q.id}
                  className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] border-t-white/[0.16] bg-[#111116] shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-accent font-bold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                        Q{idx + 1}
                      </span>
                      {q.year && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          {q.year}
                        </span>
                      )}
                      <span className="text-xs font-mono text-muted-gray">{q.subject}</span>
                    </div>


                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Correct (+{q.marks.toFixed(1)})
                        </span>
                      ) : isUnattempted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-gray">
                          <HelpCircle className="w-4 h-4" /> Unattempted (0.0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-red-400 font-semibold">
                          <XCircle className="w-4 h-4" /> Incorrect (-{q.negative_marks.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-base font-sans font-normal text-off-white/95 leading-relaxed answer-markdown">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {q.question}
                    </ReactMarkdown>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-[#151520] border border-white/[0.04]">
                      <span className="text-muted-gray block text-[10px] mb-1">Your Answer:</span>
                      <strong className={isCorrect ? 'text-emerald-400' : isUnattempted ? 'text-muted-gray' : 'text-red-400'}>
                        {userAns || "None (Unattempted)"}
                      </strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#151520] border border-white/[0.04]">
                      <span className="text-muted-gray block text-[10px] mb-1">Correct Answer:</span>
                      <strong className="text-emerald-400">{q.correct_answer}</strong>
                    </div>
                  </div>

                  {q.explanation && (
                    <div className="p-4 rounded-xl border border-white/[0.06] bg-[#14141c] text-xs font-sans text-muted-gray space-y-2 answer-markdown">
                      <span className="text-off-white font-mono font-semibold block text-[11px] uppercase tracking-wider text-accent">
                        Step-by-Step Analytical Derivation:
                      </span>
                      <div className="font-normal text-off-white/90 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {q.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>
      )}
    </div>
  );
};
