import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Bookmark, ChevronRight, Trash2, ArrowUpRight } from 'lucide-react';
import type { QueryResponse } from '../types';

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
  subject_hint: string;
  relevance_score: number;
  data: QueryResponse;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  bookmarks: QueryResponse[];
  onSelectQuery: (item: QueryResponse) => void;
  onClearHistory: () => void;
  onRemoveBookmark: (query: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  bookmarks,
  onSelectQuery,
  onClearHistory,
  onRemoveBookmark
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-[#0d0d14] border-l border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                  <h3 className="text-sm font-display font-bold uppercase tracking-wider text-off-white">
                    Study Session Workspace
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted-gray hover:text-off-white hover:bg-white/[0.05] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 rounded-xl bg-[#141420] border border-white/[0.06]">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]'
                      : 'text-muted-gray hover:text-off-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  History ({history.length})
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'bookmarks'
                      ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]'
                      : 'text-muted-gray hover:text-off-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Revision List ({bookmarks.length})
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {activeTab === 'history' ? (
                history.length === 0 ? (
                  <div className="text-center py-16 text-muted-gray text-xs font-mono">
                    <Clock className="w-8 h-8 mx-auto mb-3 opacity-30 text-accent" />
                    No queries in this session yet.<br />Ask a question to see history here.
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectQuery(item.data);
                        onClose();
                      }}
                      className="p-4 rounded-xl border border-white/[0.08] border-t-white/[0.14] bg-[#12121c] hover:border-accent/60 hover:bg-[#161626] transition-all duration-200 cursor-pointer group shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-accent uppercase tracking-widest px-2 py-0.5 bg-accent/10 rounded border border-accent/20">
                          {item.subject_hint || "CS Core"}
                        </span>
                        <span className="text-[10px] font-mono text-muted-gray">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-off-white font-mono line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                        "{item.query}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted-gray border-t border-white/[0.04] pt-2">
                        <span>Relevance: {(item.relevance_score ?? 0).toFixed(3)}</span>
                        <span className="inline-flex items-center text-accent gap-0.5 group-hover:translate-x-1 transition-transform">
                          Replay <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-16 text-muted-gray text-xs font-mono">
                  <Bookmark className="w-8 h-8 mx-auto mb-3 opacity-30 text-accent" />
                  Your revision list is empty.<br />Click "Save to Revision" on any answer.
                </div>
              ) : (
                bookmarks.map((bm, idx) => (
                  <div
                    key={`${bm.query}-${idx}`}
                    className="p-4 rounded-xl border border-white/[0.08] border-t-white/[0.14] bg-[#12121c] hover:border-accent/60 transition-all duration-200 group shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-accent uppercase tracking-widest px-2 py-0.5 bg-accent/10 rounded border border-accent/20">
                        {bm.subject_hint || "Revision"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBookmark(bm.query);
                        }}
                        className="text-muted-gray hover:text-red-400 p-1 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p
                      onClick={() => {
                        onSelectQuery(bm);
                        onClose();
                      }}
                      className="text-xs text-off-white font-mono line-clamp-2 mb-2 cursor-pointer hover:text-accent transition-colors"
                    >
                      "{bm.query}"
                    </p>
                    <div
                      onClick={() => {
                        onSelectQuery(bm);
                        onClose();
                      }}
                      className="text-[10px] font-mono text-accent cursor-pointer flex items-center gap-1 hover:underline"
                    >
                      <span>Review step-by-step derivation</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {activeTab === 'history' && history.length > 0 && (
              <div className="p-4 border-t border-white/[0.08] bg-[#0a0a10]">
                <button
                  onClick={onClearHistory}
                  className="w-full py-2 px-4 rounded-xl border border-red-500/20 text-red-400 text-xs font-mono hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Session History
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
