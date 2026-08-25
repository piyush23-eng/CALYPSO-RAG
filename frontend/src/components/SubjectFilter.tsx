import React from 'react';
import { BookOpen } from 'lucide-react';

export interface SubjectPreset {
  id: string;
  name: string;
  short: string;
  sampleQuery: string;
}

export const GATE_SUBJECTS: SubjectPreset[] = [
  {
    id: "os",
    name: "Operating Systems",
    short: "OS",
    sampleQuery: "How is Effective Memory Access Time (EMAT) calculated in 2-level paging with TLB hit ratio?"
  },
  {
    id: "dbms",
    name: "Database Systems",
    short: "DBMS",
    sampleQuery: "Why does Strict 2-Phase Locking eliminate cascading aborts in database transactions?"
  },
  {
    id: "algo",
    name: "Algorithms & DS",
    short: "ALGO",
    sampleQuery: "What is the time complexity of Floyd's algorithm to construct a binary max-heap?"
  },
  {
    id: "cn",
    name: "Computer Networks",
    short: "NETWORKS",
    sampleQuery: "Calculate minimum sequence bits for 100% efficiency in GBN with 100 km link at 100 Mbps."
  },
  {
    id: "toc",
    name: "Theory of Computation",
    short: "TOC",
    sampleQuery: "How does the Pumping Lemma prove that L = {a^n b^n | n >= 0} is not regular?"
  },
  {
    id: "compiler",
    name: "Compiler Design",
    short: "COMPILER",
    sampleQuery: "What are the shift-reduce and reduce-reduce conflicts in LR(0) vs SLR(1) parsing?"
  },
  {
    id: "coa",
    name: "Computer Organization",
    short: "COA",
    sampleQuery: "Calculate average memory access time for L1 and L2 cache hierarchy with given hit latencies."
  },
  {
    id: "digital",
    name: "Digital Logic",
    short: "DIGITAL",
    sampleQuery: "How to find the minimal sum-of-products expression using Karnaugh Maps with don't care conditions?"
  },
  {
    id: "discrete",
    name: "Discrete Mathematics",
    short: "DISCRETE",
    sampleQuery: "Let P be the partial order on {1,2,3,4} with {(1,2),(3,2),(3,4)}. Find the number of total orders."
  },
  {
    id: "math",
    name: "Engineering Mathematics",
    short: "ENG MATH",
    sampleQuery: "How to compute conditional probability using Bayes' Theorem for medical diagnostic tests?"
  }
];

interface SubjectFilterProps {
  activeSubject: string | null;
  onSelectSubject: (subject: SubjectPreset) => void;
  disabled?: boolean;
}

export const SubjectFilter: React.FC<SubjectFilterProps> = ({
  activeSubject,
  onSelectSubject,
  disabled = false
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 mb-10">
      <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-muted-gray">
        <BookOpen className="w-3.5 h-3.5 text-accent" />
        <span>Browse by 10 GATE CS Subjects:</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {GATE_SUBJECTS.map((subj) => {
          const isSelected = activeSubject === subj.name || activeSubject === subj.id;
          return (
            <button
              key={subj.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSubject(subj)}
              className={`flex-shrink-0 text-xs font-mono px-3.5 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-accent bg-accent/15 text-accent font-semibold shadow-[0_0_16px_rgba(61,90,254,0.3)] ring-1 ring-accent/40'
                  : 'border-white/[0.08] border-t-white/[0.14] text-muted-gray hover:text-off-white hover:border-accent/50 bg-[#11111a] shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
              }`}
            >
              <span className="text-[10px] text-accent/80 font-bold mr-1.5 font-mono">{subj.short}</span>
              <span>{subj.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
