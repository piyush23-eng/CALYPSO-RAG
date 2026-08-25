import React, { useState } from 'react';
import { Sliders, Cpu, Network, Layers } from 'lucide-react';

export type LabType = 'emat' | 'sliding_window' | 'cache' | 'disk';

interface VisualLabProps {
  initialLab?: LabType;
  queryTopicHint?: string;
}

export const VisualLab: React.FC<VisualLabProps> = ({
  initialLab = 'emat',
  queryTopicHint
}) => {
  // Determine starting active tab based on query topic hint
  const getStartingTab = (): LabType => {
    if (queryTopicHint) {
      const q = queryTopicHint.toLowerCase();
      if (q.includes('window') || q.includes('gbn') || q.includes('network') || q.includes('packet')) return 'sliding_window';
      if (q.includes('cache') || q.includes('amat') || q.includes('hierarchy')) return 'cache';
      if (q.includes('page') || q.includes('paging') || q.includes('emat') || q.includes('tlb')) return 'emat';
    }
    return initialLab;
  };

  const [activeLab, setActiveLab] = useState<LabType>(getStartingTab());

  // ── Lab 1 State: 2-Level Paging & EMAT ──────────────────────────────
  const [ematHitRatio, setEmatHitRatio] = useState(0.90);
  const [ematTlbTime, setEmatTlbTime] = useState(20);
  const [ematMemTime, setEmatMemTime] = useState(100);
  const [ematLevels, setEmatLevels] = useState(2);

  // EMAT Calculation: h*(t_tlb + t_m) + (1-h)*(t_tlb + (k+1)*t_m)
  const ematHitCost = ematTlbTime + ematMemTime;
  const ematMissCost = ematTlbTime + (ematLevels + 1) * ematMemTime;
  const ematValue = (ematHitRatio * ematHitCost) + ((1 - ematHitRatio) * ematMissCost);

  // ── Lab 2 State: Sliding Window / Go-Back-N ─────────────────────────
  const [distanceKm, setDistanceKm] = useState(100);
  const propSpeedExp = 2.0; // * 10^8 m/s (speed of light in copper/fiber)
  const [bandwidthMbps, setBandwidthMbps] = useState(100);
  const [frameSizeBytes, setFrameSizeBytes] = useState(1000);
  const [windowSize, setWindowSize] = useState(14);

  // Calculations for Sliding Window
  const transDelayUs = (frameSizeBytes * 8) / (bandwidthMbps * 1.0); // microsec
  const propDelayUs = (distanceKm * 1000.0) / (propSpeedExp * 100.0); // microsec (dist/v)
  const aParam = propDelayUs / transDelayUs;
  const optimalWindow = Math.ceil(1 + 2 * aParam);
  const efficiencyPercent = Math.min(100, (windowSize / (1 + 2 * aParam)) * 100);
  const minGbnSeqBits = Math.ceil(Math.log2(windowSize + 1));
  const minSrSeqBits = Math.ceil(Math.log2(2 * windowSize));

  // ── Lab 3 State: Cache AMAT ─────────────────────────────────────────
  const [l1HitRate, setL1HitRate] = useState(0.95);
  const [l1Latency, setL1Latency] = useState(1.5);
  const [l2HitRate, setL2HitRate] = useState(0.80);
  const l2Latency = 10.0;
  const [mainMemLatency, setMainMemLatency] = useState(80.0);

  // AMAT = L1_hit_time + (1 - L1_hit_rate) * (L2_hit_time + (1 - L2_hit_rate) * Mem_time)
  const l2MissPenalty = l2Latency + (1 - l2HitRate) * mainMemLatency;
  const amatValue = l1Latency + (1 - l1HitRate) * l2MissPenalty;

  return (
    <div className="mt-8 p-6 sm:p-8 rounded-2xl border border-accent/40 border-t-accent bg-[#0c0d16] shadow-[0_12px_40px_rgba(0,0,0,0.6)] ring-1 ring-accent/20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-accent/15 border border-accent/30 text-accent shadow-[0_0_12px_rgba(61,90,254,0.3)]">
            <Sliders className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                Interactive Visual Simulation Lab
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-off-white">
              Dynamic Parameter Playground
            </h3>
          </div>
        </div>

        {/* Lab Switcher Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-[#141420] border border-white/[0.06] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveLab('emat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'emat'
                ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]'
                : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Paging & EMAT
          </button>
          <button
            onClick={() => setActiveLab('sliding_window')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'sliding_window'
                ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]'
                : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Sliding Window (GBN)
          </button>
          <button
            onClick={() => setActiveLab('cache')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'cache'
                ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]'
                : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Cache Hierarchy (AMAT)
          </button>
        </div>
      </div>

      {/* ── LAB 1: Paging & EMAT Simulation ────────────────────────────── */}
      {activeLab === 'emat' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          {/* Sliders Control Panel */}
          <div className="md:col-span-7 space-y-5">
            {/* Slider 1: Hit Ratio */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">TLB Hit Ratio (h):</span>
                <span className="text-accent font-bold">{(ematHitRatio * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.99"
                step="0.01"
                value={ematHitRatio}
                onChange={(e) => setEmatHitRatio(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Slider 2: TLB Access Time */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">TLB Access Latency (t_TLB):</span>
                <span className="text-accent font-bold">{ematTlbTime} ns</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={ematTlbTime}
                onChange={(e) => setEmatTlbTime(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Slider 3: Memory Access Time */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Main Memory Latency (t_m):</span>
                <span className="text-accent font-bold">{ematMemTime} ns</span>
              </div>
              <input
                type="range"
                min="40"
                max="250"
                step="5"
                value={ematMemTime}
                onChange={(e) => setEmatMemTime(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Slider 4: Paging Levels */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Page Table Levels (k):</span>
                <span className="text-accent font-bold">{ematLevels}-Level Paging</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEmatLevels(lvl)}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                      ematLevels === lvl
                        ? 'border-accent bg-accent/20 text-accent font-bold shadow-[0_0_10px_rgba(61,90,254,0.3)]'
                        : 'border-white/[0.08] text-muted-gray hover:text-off-white bg-[#14141f]'
                    }`}
                  >
                    {lvl} Level{lvl > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Math Output Card */}
          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">
              Calculated EMAT (Live)
            </span>
            <div className="text-4xl sm:text-5xl font-display font-black text-accent tracking-tightest">
              {ematValue.toFixed(2)} <span className="text-base text-muted-gray font-normal">ns</span>
            </div>

            {/* Formula Step-by-Step Breakdown */}
            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between">
                <span>TLB Hit Cost:</span>
                <strong className="text-emerald-400">{ematHitCost} ns</strong>
              </div>
              <div className="flex justify-between">
                <span>TLB Miss Cost ({ematLevels}+1 mem):</span>
                <strong className="text-amber-400">{ematMissCost} ns</strong>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] text-off-white/80 leading-relaxed mt-2">
                <code>EMAT = {ematHitRatio.toFixed(2)}×({ematHitCost}) + {(1-ematHitRatio).toFixed(2)}×({ematMissCost}) = {ematValue.toFixed(1)} ns</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAB 2: Sliding Window (GBN / SR) Simulation ─────────────────── */}
      {activeLab === 'sliding_window' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            {/* Distance */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Link Distance (d):</span>
                <span className="text-accent font-bold">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Bandwidth */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Channel Bandwidth (B):</span>
                <span className="text-accent font-bold">{bandwidthMbps} Mbps</span>
              </div>
              <input
                type="range"
                min="1"
                max="1000"
                step="5"
                value={bandwidthMbps}
                onChange={(e) => setBandwidthMbps(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Frame Size */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Packet / Frame Size (L):</span>
                <span className="text-accent font-bold">{frameSizeBytes} Bytes</span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="100"
                value={frameSizeBytes}
                onChange={(e) => setFrameSizeBytes(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Window Size */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Sender Window Size (Ws):</span>
                <span className="text-accent font-bold">{windowSize} Frames</span>
              </div>
              <input
                type="range"
                min="1"
                max="64"
                step="1"
                value={windowSize}
                onChange={(e) => setWindowSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          {/* Sliding Window Output Card */}
          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">
              Channel Efficiency (η)
            </span>
            <div className="text-4xl sm:text-5xl font-display font-black text-emerald-400 tracking-tightest">
              {efficiencyPercent.toFixed(1)} <span className="text-base text-muted-gray font-normal">%</span>
            </div>

            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between">
                <span>Optimal Window (1+2a):</span>
                <strong className="text-accent">{optimalWindow} frames</strong>
              </div>
              <div className="flex justify-between">
                <span>Min GBN Sequence Bits:</span>
                <strong className="text-off-white">{minGbnSeqBits} bits</strong>
              </div>
              <div className="flex justify-between">
                <span>Min SR Sequence Bits:</span>
                <strong className="text-off-white">{minSrSeqBits} bits</strong>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] text-off-white/80 leading-relaxed mt-2">
                <code>Tt = {transDelayUs.toFixed(1)}μs, Tp = {propDelayUs.toFixed(1)}μs, a = {aParam.toFixed(2)}</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAB 3: Cache AMAT Simulation ─────────────────────────────────── */}
      {activeLab === 'cache' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            {/* L1 Hit Rate */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">L1 Cache Hit Ratio (h1):</span>
                <span className="text-accent font-bold">{(l1HitRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="0.99"
                step="0.01"
                value={l1HitRate}
                onChange={(e) => setL1HitRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* L1 Latency */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">L1 Hit Latency:</span>
                <span className="text-accent font-bold">{l1Latency} ns</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={l1Latency}
                onChange={(e) => setL1Latency(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* L2 Hit Rate */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">L2 Cache Hit Ratio (h2):</span>
                <span className="text-accent font-bold">{(l2HitRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={l2HitRate}
                onChange={(e) => setL2HitRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Main Memory Latency */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Main Memory Penalty:</span>
                <span className="text-accent font-bold">{mainMemLatency} ns</span>
              </div>
              <input
                type="range"
                min="40"
                max="150"
                step="5"
                value={mainMemLatency}
                onChange={(e) => setMainMemLatency(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          {/* AMAT Output Card */}
          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">
              Average Memory Access Time (AMAT)
            </span>
            <div className="text-4xl sm:text-5xl font-display font-black text-accent tracking-tightest">
              {amatValue.toFixed(2)} <span className="text-base text-muted-gray font-normal">ns</span>
            </div>

            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between">
                <span>L1 Hit Time:</span>
                <strong className="text-emerald-400">{l1Latency} ns</strong>
              </div>
              <div className="flex justify-between">
                <span>L2 Miss Penalty:</span>
                <strong className="text-amber-400">{l2MissPenalty.toFixed(1)} ns</strong>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] text-off-white/80 leading-relaxed mt-2">
                <code>AMAT = {l1Latency} + {(1-l1HitRate).toFixed(2)} × ({l2Latency} + {(1-l2HitRate).toFixed(2)}×{mainMemLatency}) = {amatValue.toFixed(2)} ns</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
