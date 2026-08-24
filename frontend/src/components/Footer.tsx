import React from 'react';
import { ExternalLink, BarChart3 } from 'lucide-react';

interface FooterProps {
  onToggleEval: () => void;
  isEvalView: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onToggleEval, isEvalView }) => {
  return (
    <footer className="border-t border-white/[0.08] py-12 px-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-sm font-display font-bold text-off-white tracking-tight mb-1">
            CALYPSO-RAG
          </div>
          <p className="text-xs font-mono text-muted-gray">
            Agentic Retrieval-Augmented Generation for GATE CS/IT
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <button
            onClick={onToggleEval}
            className="text-muted-gray hover:text-accent transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>{isEvalView ? 'Solver Mode' : 'The Numbers (/evaluation)'}</span>
          </button>

          <a
            href="https://github.com/piyush23-eng/CALYPSO-RAG"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-gray hover:text-off-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-muted-gray/50" />
          </a>
        </div>
      </div>
    </footer>
  );
};
