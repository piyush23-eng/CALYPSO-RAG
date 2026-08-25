import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onSearch: (query: string, image?: string) => void;
  isLoading: boolean;
}

const PRESET_QUERIES = [
  { label: "OS: 2-Level Paging EMAT", query: "How is Effective Memory Access Time calculated in 2-level paging with TLB hit ratio?" },
  { label: "DBMS: Strict 2PL Serializability", query: "Why does Strict 2-Phase Locking eliminate cascading aborts in database transactions?" },
  { label: "ALGO: Floyd's Heap O(n)", query: "What is the worst-case time complexity of constructing a binary max heap from an unsorted array?" },
  { label: "CRAG: Colloquial Packet Loss", query: "slow speed when network packet drops" },
  { label: "CRAG: Ambiguous Heap Query", query: "time speed heap" },
  { label: "Edge Case: Off-Topic Filter", query: "What is the capital city of France?" }
];

export const Hero: React.FC<HeroProps> = ({ onSearch, isLoading }) => {
  const [inputVal, setInputVal] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle clipboard screenshot paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
              if (uploadEvent.target?.result) {
                setAttachedImage(uploadEvent.target.result as string);
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAttachedImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAttachedImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputVal.trim() || attachedImage) && !isLoading) {
      onSearch(inputVal.trim() || "Solve the attached GATE CS diagram problem.", attachedImage || undefined);
    }
  };

  const handleSelectPreset = (q: string) => {
    setInputVal(q);
    onSearch(q);
  };

  return (
    <section className="relative pt-24 pb-16 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Minimal Studio Tag */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-gray">
            Agentic RAG Engine • GATE CS/IT
          </span>
        </div>

        {/* Massive Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-extrabold tracking-tightest leading-[0.96] text-off-white mb-6">
          Ask GATE CS.<br />
          <span className="text-muted-gray/70">Get answers with </span>
          <span className="text-off-white underline decoration-accent/60 underline-offset-8">receipts.</span>
        </h1>

        {/* Small Restrained Subhead */}
        <p className="text-base sm:text-lg text-muted-gray max-w-2xl font-normal leading-relaxed mb-12">
          Fine-tuned Qwen 1.5B (QLoRA) paired with hybrid Reciprocal Rank Fusion,
          cross-encoder reranking, Knowledge Graph reasoning, and Vision-RAG for zero-hallucination exam prep.
        </p>
      </motion.div>

      {/* Oversized Input Field with Drag & Drop & Screenshot Paste */}
      <motion.form
        onSubmit={handleSubmit}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className={`relative mb-8 p-3 rounded-2xl transition-all duration-300 ${
          isDragging 
            ? 'border-2 border-dashed border-accent bg-accent/10 shadow-[0_0_30px_rgba(61,90,254,0.3)]' 
            : 'border-b-2 border-white/20 focus-within:border-accent'
        }`}
      >
        {/* Attached Diagram Preview Pill */}
        {attachedImage && (
          <div className="mb-3 inline-flex items-center gap-3 p-2 rounded-xl bg-[#14141f] border border-accent/40 shadow-[0_0_12px_rgba(61,90,254,0.25)]">
            <img src={attachedImage} alt="Uploaded Diagram" className="w-12 h-12 object-cover rounded-lg border border-white/10" />
            <div className="text-xs font-mono">
              <span className="text-accent font-semibold block">Attached Diagram (Vision-RAG)</span>
              <span className="text-[10px] text-muted-gray">Ready for multimodal analysis</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 text-muted-gray hover:text-red-400 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative flex items-center pb-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isLoading}
            placeholder={attachedImage ? "Add optional question for diagram..." : "Type GATE query, or paste (Ctrl+V) / drop diagram screenshot..."}
            className="w-full bg-transparent text-xl sm:text-3xl font-light text-off-white placeholder:text-muted-gray/40 focus:outline-none pr-28 tracking-tight"
          />

          <div className="absolute right-0 bottom-1 flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Upload Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Upload diagram image or paste from clipboard"
              className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                attachedImage 
                  ? 'text-accent bg-accent/20 border border-accent/40' 
                  : 'text-muted-gray hover:text-off-white hover:bg-white/[0.05]'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Submit Arrow Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputVal.trim() && !attachedImage)}
              className="p-2.5 rounded-full text-off-white hover:text-accent hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:text-off-white transition-all duration-200 cursor-pointer"
              aria-label="Submit query"
            >
              <ArrowRight className={`w-7 h-7 ${isLoading ? 'animate-pulse text-accent' : ''}`} />
            </button>
          </div>
        </div>
      </motion.form>

      {/* Quick Select Benchmark Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap gap-2 pt-2 items-center"
      >
        <span className="text-xs font-mono text-muted-gray uppercase tracking-widest mr-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-accent" /> Presets:
        </span>
        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handleSelectPreset(preset.query)}
            disabled={isLoading}
            className="text-xs font-mono text-muted-gray hover:text-off-white px-3 py-1.5 rounded-lg border border-white/[0.08] border-t-white/[0.16] hover:border-accent/70 hover:bg-accent/[0.08] bg-[#111116] shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            {preset.label} →
          </button>
        ))}
      </motion.div>
    </section>
  );
};
