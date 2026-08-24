import { useEffect, useState } from 'react';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { AnswerSection } from './components/AnswerSection';
import { EvaluationView } from './components/EvaluationView';
import { Footer } from './components/Footer';
import { submitQuery, getTopics } from './services/api';
import type { QueryResponse } from './types';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [isEvalView, setIsEvalView] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTopics().then(t => setTopics(t));
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await submitQuery(query);
      setResult(res);
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f0] flex flex-col justify-between selection:bg-accent selection:text-white">
      {/* Top Studio Nav Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06] py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setIsEvalView(false)}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-accent group-hover:scale-125 transition-transform" />
            <span className="text-sm font-display font-black tracking-tight text-off-white">
              CALYPSO<span className="text-accent">-RAG</span>
            </span>
          </button>

          <nav className="flex items-center gap-6 text-xs font-mono">
            <button
              onClick={() => setIsEvalView(false)}
              className={`transition-colors ${
                !isEvalView ? 'text-accent font-semibold' : 'text-muted-gray hover:text-off-white'
              }`}
            >
              Solver
            </button>
            <button
              onClick={() => setIsEvalView(true)}
              className={`transition-colors ${
                isEvalView ? 'text-accent font-semibold' : 'text-muted-gray hover:text-off-white'
              }`}
            >
              The Numbers (/evaluation)
            </button>
          </nav>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-grow">
        {isEvalView ? (
          <EvaluationView onBack={() => setIsEvalView(false)} />
        ) : (
          <div>
            <Hero onSearch={handleSearch} isLoading={isLoading} />

            {/* Scrolling Marquee Strip */}
            <Marquee
              topics={topics}
              isLoading={isLoading}
              activeTopic={result?.subject_hint}
            />

            {/* Error Message */}
            {error && (
              <div className="max-w-5xl mx-auto px-6 pt-8">
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Render Editorial Answer Section if query result available */}
            {result && <AnswerSection data={result} />}
          </div>
        )}
      </main>

      <Footer onToggleEval={() => setIsEvalView(!isEvalView)} isEvalView={isEvalView} />
    </div>
  );
}

export default App;
