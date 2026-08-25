import { useEffect, useState } from 'react';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { AnswerSection } from './components/AnswerSection';
import { EvaluationView } from './components/EvaluationView';
import { SubjectFilter, type SubjectPreset } from './components/SubjectFilter';
import { HistoryDrawer, type HistoryItem } from './components/HistoryDrawer';
import { Footer } from './components/Footer';
import { submitQuery, getTopics } from './services/api';
import type { QueryResponse } from './types';
import { AlertCircle, History } from 'lucide-react';

export function App() {
  const [isEvalView, setIsEvalView] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Session History State (Loaded from and saved to localStorage)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('calypso_session_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bookmarked Revision List State
  const [bookmarks, setBookmarks] = useState<QueryResponse[]>(() => {
    try {
      const saved = localStorage.getItem('calypso_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    getTopics().then(t => setTopics(t));
  }, []);

  // Sync session history and bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('calypso_session_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('calypso_bookmarks', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await submitQuery(query);
      setResult(res);

      // Add to Session History (Item 6)
      const newHistoryItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        query: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject_hint: res.subject_hint || "General CS",
        relevance_score: res.relevance_score,
        data: res
      };
      setHistory(prev => [newHistoryItem, ...prev.filter(h => h.query !== query)].slice(0, 30));

      // Smoothly scroll down to answer
      setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight * 0.75,
          behavior: 'smooth'
        });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve and generate answer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = (item: QueryResponse) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.query === item.query);
      if (exists) {
        return prev.filter(b => b.query !== item.query);
      } else {
        return [item, ...prev];
      }
    });
  };

  const handleSelectSubject = (subj: SubjectPreset) => {
    setActiveSubject(subj.name);
    handleSearch(subj.sampleQuery);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f0] flex flex-col justify-between selection:bg-accent selection:text-white">
      {/* Top Studio Nav Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#000000]/85 backdrop-blur-md border-b border-white/[0.08] py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setIsEvalView(false)}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-accent group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(61,90,254,0.6)]" />
            <span className="text-sm font-display font-black tracking-tight text-off-white">
              CALYPSO<span className="text-accent">-RAG</span>
            </span>
          </button>

          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
              <button
                onClick={() => setIsEvalView(false)}
                className={`transition-colors cursor-pointer ${
                  !isEvalView ? 'text-accent font-semibold' : 'text-muted-gray hover:text-off-white'
                }`}
              >
                Solver
              </button>
              <button
                onClick={() => setIsEvalView(true)}
                className={`transition-colors cursor-pointer ${
                  isEvalView ? 'text-accent font-semibold' : 'text-muted-gray hover:text-off-white'
                }`}
              >
                The Numbers (/evaluation)
              </button>
            </nav>

            {/* History & Bookmarks Drawer Trigger */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-white/[0.08] border-t-white/[0.16] bg-[#11111a] hover:border-accent/60 text-muted-gray hover:text-off-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] cursor-pointer"
              title="View study history & revision list"
            >
              <History className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Workspace</span>
              {(history.length > 0 || bookmarks.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Session History & Bookmarks Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        bookmarks={bookmarks}
        onSelectQuery={(qData) => {
          setResult(qData);
          setIsEvalView(false);
          setTimeout(() => {
            window.scrollTo({
              top: window.innerHeight * 0.75,
              behavior: 'smooth'
            });
          }, 100);
        }}
        onClearHistory={() => setHistory([])}
        onRemoveBookmark={(q) => setBookmarks(prev => prev.filter(b => b.query !== q))}
      />

      {/* Main View Area */}
      <main className="flex-grow">
        {isEvalView ? (
          <EvaluationView onBack={() => setIsEvalView(false)} />
        ) : (
          <div>
            <Hero onSearch={handleSearch} isLoading={isLoading} />

            {/* 10 GATE CS Subject Browser (Item 10) */}
            <SubjectFilter
              activeSubject={activeSubject}
              onSelectSubject={handleSelectSubject}
              disabled={isLoading}
            />

            {/* Scrolling Marquee Strip */}
            <Marquee
              topics={topics}
              isLoading={isLoading}
              activeTopic={result?.subject_hint || activeSubject || undefined}
            />

            {/* Error Message */}
            {error && (
              <div className="max-w-5xl mx-auto px-6 pt-8">
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono flex items-center gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Render Editorial Answer Section if query result available */}
            {result && (
              <AnswerSection
                data={result}
                onBookmark={handleToggleBookmark}
                isBookmarked={bookmarks.some(b => b.query === result.query)}
              />
            )}
          </div>
        )}
      </main>

      <Footer onToggleEval={() => setIsEvalView(!isEvalView)} isEvalView={isEvalView} />
    </div>
  );
}

export default App;
