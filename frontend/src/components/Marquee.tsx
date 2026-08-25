import React from 'react';

interface MarqueeProps {
  topics: string[];
  isLoading?: boolean;
  activeTopic?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  topics,
  isLoading = false,
  activeTopic,
}) => {
  const displayTopics = topics.length > 0 ? topics : [
    "Virtual Memory & 2-Level Paging",
    "Effective Memory Access Time (EMAT)",
    "Shortest Remaining Time First (SRTF)",
    "Banker's Algorithm & Safe State",
    "Strict 2-Phase Locking (Strict 2PL)",
    "Conflict Serializability & Graphs",
    "Relational Normal Forms (3NF / BCNF)",
    "B+ Tree Indexing & Fanout",
    "Floyd's Heap Build O(n)",
    "Master Theorem Recurrences",
    "TCP Congestion Control (Slow Start & Fast Recovery)",
    "Sliding Window (GBN / SR)",
    "CIDR Subnetting & IP Routing",
    "Chomsky Hierarchy & Pushdown Automata",
    "LR(1) & LALR(1) Parsing Conflicts"
  ];

  // Repeat topics array for seamless infinite marquee loop
  const marqueeItems = [...displayTopics, ...displayTopics, ...displayTopics];

  return (
    <div className="w-full border-y border-white/[0.07] bg-[#070707] py-3.5 overflow-hidden select-none marquee-container relative">
      {/* Subtle vignette gradients on left & right matching #000000 */}
      <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#000000] via-[#000000]/80 to-transparent z-10 pointer-events-none" />

      <div
        className={`flex whitespace-nowrap marquee-content ${
          isLoading ? 'animate-marquee-fast' : 'animate-marquee-slow'
        }`}
      >
        {marqueeItems.map((topic, idx) => {
          const isActive = activeTopic && topic.toLowerCase().includes(activeTopic.toLowerCase());
          return (
            <div
              key={`${topic}-${idx}`}
              className="inline-flex items-center mx-3 flex-shrink-0 group cursor-default"
            >
              <span
                className={`text-[11px] font-mono uppercase tracking-[0.14em] px-3.5 py-1.5 rounded-full border transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'border-accent bg-accent/15 text-accent font-semibold shadow-[0_0_12px_rgba(61,90,254,0.35)] ring-1 ring-accent/30'
                    : isLoading
                    ? 'border-accent/40 text-accent/80 animate-pulse bg-accent/[0.04]'
                    : 'border-white/[0.08] border-t-white/[0.14] text-muted-gray hover:text-off-white hover:border-accent/40 bg-[#11111a]'
                }`}
              >
                {topic}
              </span>
              <span className="text-white/15 ml-3 text-xs">/</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
