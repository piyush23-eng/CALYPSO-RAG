import React, { useState } from 'react';
import { Sliders, Cpu, Network, Layers, HardDrive, Calculator, Binary, Database } from 'lucide-react';

export type LabType = 
  | 'emat' 
  | 'sliding_window' 
  | 'cache' 
  | 'pipeline' 
  | 'disk' 
  | 'master_theorem' 
  | 'subnet' 
  | 'b_tree';

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
      if (q.includes('window') || q.includes('gbn') || q.includes('selective') || q.includes('packet')) return 'sliding_window';
      if (q.includes('pipeline') || q.includes('pipelining') || q.includes('speedup') || q.includes('stall')) return 'pipeline';
      if (q.includes('disk') || q.includes('rpm') || q.includes('rotational') || q.includes('seek')) return 'disk';
      if (q.includes('master') || q.includes('recurrence') || q.includes('complexity') || q.includes('t(n)')) return 'master_theorem';
      if (q.includes('cidr') || q.includes('subnet') || q.includes('ip address') || q.includes('mask')) return 'subnet';
      if (q.includes('b+ tree') || q.includes('b-tree') || q.includes('fanout') || q.includes('index block')) return 'b_tree';
      if (q.includes('cache') || q.includes('amat') || q.includes('hierarchy') || q.includes('miss penalty')) return 'cache';
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

  const ematHitCost = ematTlbTime + ematMemTime;
  const ematMissCost = ematTlbTime + (ematLevels + 1) * ematMemTime;
  const ematValue = (ematHitRatio * ematHitCost) + ((1 - ematHitRatio) * ematMissCost);

  // ── Lab 2 State: Sliding Window / Go-Back-N ─────────────────────────
  const [distanceKm, setDistanceKm] = useState(100);
  const propSpeedExp = 2.0; // 2.0 * 10^8 m/s
  const [bandwidthMbps, setBandwidthMbps] = useState(100);
  const [frameSizeBytes, setFrameSizeBytes] = useState(1000);
  const [windowSize, setWindowSize] = useState(14);

  const transDelayUs = (frameSizeBytes * 8) / (bandwidthMbps * 1.0);
  const propDelayUs = (distanceKm * 1000.0) / (propSpeedExp * 100.0);
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

  const l2MissPenalty = l2Latency + (1 - l2HitRate) * mainMemLatency;
  const amatValue = l1Latency + (1 - l1HitRate) * l2MissPenalty;

  // ── Lab 4 State: CPU Pipelining & Speedup ───────────────────────────
  const [pipeStages, setPipeStages] = useState(5);
  const [pipeInstructions, setPipeInstructions] = useState(1000);
  const [pipeStallCycles, setPipeStallCycles] = useState(50);
  const [pipeClockNs, setPipeClockNs] = useState(2.0);

  const nonPipeTimeNs = pipeInstructions * pipeStages * pipeClockNs;
  const pipeTotalCycles = pipeStages + (pipeInstructions - 1) + pipeStallCycles;
  const pipeTimeNs = pipeTotalCycles * pipeClockNs;
  const pipeSpeedup = nonPipeTimeNs / pipeTimeNs;
  const pipeThroughputMips = (pipeInstructions / (pipeTimeNs / 1000.0));

  // ── Lab 5 State: Disk Latency ────────────────────────────────────────
  const [diskSeekMs, setDiskSeekMs] = useState(4.0);
  const [diskRpm, setDiskRpm] = useState(7200);
  const [diskTransferRateMBps, setDiskTransferRateMBps] = useState(100.0);
  const diskSectorBytes = 512;

  const diskRotLatencyMs = (60.0 * 1000.0) / (2.0 * diskRpm);
  const diskTransLatencyMs = (diskSectorBytes / (diskTransferRateMBps * 1024.0 * 1024.0)) * 1000.0;
  const diskTotalAccessMs = diskSeekMs + diskRotLatencyMs + diskTransLatencyMs;

  // ── Lab 6 State: Master Theorem Solver ──────────────────────────────
  const [mtA, setMtA] = useState(2);
  const [mtB, setMtB] = useState(2);
  const [mtK, setMtK] = useState(1);
  const [mtP, setMtP] = useState(1);

  const logBA = Math.log(mtA) / Math.log(mtB);
  let mtCase = "";
  let mtComplexity = "";

  if (Math.abs(logBA - mtK) < 0.001) {
    mtCase = "Case 2 (log_b(a) == k)";
    if (mtP > -1) {
      mtComplexity = mtK === 1 ? `Θ(n log^${mtP + 1} n)` : `Θ(n^${mtK} log^${mtP + 1} n)`;
    } else if (mtP === -1) {
      mtComplexity = `Θ(n^${mtK} log log n)`;
    } else {
      mtComplexity = `Θ(n^${mtK})`;
    }
  } else if (logBA > mtK) {
    mtCase = "Case 1 (log_b(a) > k)";
    const rounded = Number(logBA.toFixed(2));
    mtComplexity = `Θ(n^${rounded})`;
  } else {
    mtCase = "Case 3 (log_b(a) < k)";
    mtComplexity = mtP === 0 ? `Θ(n^${mtK})` : `Θ(n^${mtK} log^${mtP} n)`;
  }

  // ── Lab 7 State: CIDR Subnetting ────────────────────────────────────
  const [cidrPrefix, setCidrPrefix] = useState(24);
  const hostBits = 32 - cidrPrefix;
  const totalIpAddresses = Math.pow(2, hostBits);
  const usableHostAddresses = Math.max(0, totalIpAddresses - 2);

  // Compute dotted-decimal mask
  const getSubnetMask = (p: number) => {
    let mask = [];
    for (let i = 0; i < 4; i++) {
      const n = Math.min(p, 8);
      mask.push(256 - Math.pow(2, 8 - n));
      p -= n;
    }
    return mask.join('.');
  };
  const subnetMaskStr = getSubnetMask(cidrPrefix);

  // ── Lab 8 State: B+ Tree Index Fanout ───────────────────────────────
  const [blockSizeBytes, setBlockSizeBytes] = useState(1024);
  const [keySizeBytes, setKeySizeBytes] = useState(12);
  const [blockPtrSizeBytes, setBlockPtrSizeBytes] = useState(6);
  const [recordPtrSizeBytes, setRecordPtrSizeBytes] = useState(8);

  // Internal Node: p * P_b + (p - 1) * K <= B -> p <= (B + K) / (K + P_b)
  const internalFanout = Math.floor((blockSizeBytes + keySizeBytes) / (keySizeBytes + blockPtrSizeBytes));
  // Leaf Node: p_leaf * (K + P) + P_b <= B -> p_leaf <= (B - P_b) / (K + P)
  const leafFanout = Math.floor((blockSizeBytes - blockPtrSizeBytes) / (keySizeBytes + recordPtrSizeBytes));
  const maxRecordsH3 = internalFanout * internalFanout * leafFanout;

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
                Universal GATE CS Simulation Labs
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-off-white">
              Multi-Subject Mathematical Parameter Playground
            </h3>
          </div>
        </div>

        {/* 8-Subject Lab Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-[#141420] border border-white/[0.06] overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveLab('emat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'emat' ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]' : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Paging/EMAT
          </button>
          <button
            onClick={() => setActiveLab('sliding_window')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'sliding_window' ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]' : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" /> Sliding Window
          </button>
          <button
            onClick={() => setActiveLab('cache')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'cache' ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]' : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Cache AMAT
          </button>
          <button
            onClick={() => setActiveLab('pipeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'pipeline' ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]' : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Pipelining
          </button>
          <button
            onClick={() => setActiveLab('disk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'disk' ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]' : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" /> Disk Arm
          </button>
          <button
            onClick={() => setActiveLab('master_theorem')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'master_theorem' ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]' : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Master Theorem
          </button>
          <button
            onClick={() => setActiveLab('subnet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'subnet' ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]' : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Binary className="w-3.5 h-3.5" /> CIDR Subnet
          </button>
          <button
            onClick={() => setActiveLab('b_tree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'b_tree' ? 'bg-accent text-white font-semibold shadow-[0_0_12px_rgba(61,90,254,0.3)]' : 'text-muted-gray hover:text-off-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> B+ Tree Fanout
          </button>
        </div>
      </div>

      {/* ── LAB 1: Paging & EMAT ────────────────────────────────────────── */}
      {activeLab === 'emat' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">TLB Hit Ratio (h):</span>
                <span className="text-accent font-bold">{(ematHitRatio * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0.50" max="0.99" step="0.01" value={ematHitRatio}
                onChange={(e) => setEmatHitRatio(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">TLB Access Latency (t_TLB):</span>
                <span className="text-accent font-bold">{ematTlbTime} ns</span>
              </div>
              <input
                type="range" min="5" max="50" step="1" value={ematTlbTime}
                onChange={(e) => setEmatTlbTime(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Main Memory Latency (t_m):</span>
                <span className="text-accent font-bold">{ematMemTime} ns</span>
              </div>
              <input
                type="range" min="40" max="250" step="5" value={ematMemTime}
                onChange={(e) => setEmatMemTime(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Page Table Levels (k):</span>
                <span className="text-accent font-bold">{ematLevels}-Level Paging</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(lvl => (
                  <button
                    key={lvl} type="button" onClick={() => setEmatLevels(lvl)}
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

          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">Calculated EMAT (Live)</span>
            <div className="text-4xl sm:text-5xl font-display font-black text-accent tracking-tightest">
              {ematValue.toFixed(2)} <span className="text-base text-muted-gray font-normal">ns</span>
            </div>
            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between"><span>TLB Hit Cost:</span><strong className="text-emerald-400">{ematHitCost} ns</strong></div>
              <div className="flex justify-between"><span>TLB Miss Cost ({ematLevels}+1 mem):</span><strong className="text-amber-400">{ematMissCost} ns</strong></div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] text-off-white/80 leading-relaxed mt-2">
                <code>EMAT = {ematHitRatio.toFixed(2)}×({ematHitCost}) + {(1-ematHitRatio).toFixed(2)}×({ematMissCost}) = {ematValue.toFixed(1)} ns</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAB 2: Sliding Window ───────────────────────────────────────── */}
      {activeLab === 'sliding_window' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Link Distance (d):</span>
                <span className="text-accent font-bold">{distanceKm} km</span>
              </div>
              <input
                type="range" min="10" max="1000" step="10" value={distanceKm}
                onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Channel Bandwidth (B):</span>
                <span className="text-accent font-bold">{bandwidthMbps} Mbps</span>
              </div>
              <input
                type="range" min="1" max="1000" step="5" value={bandwidthMbps}
                onChange={(e) => setBandwidthMbps(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Packet / Frame Size (L):</span>
                <span className="text-accent font-bold">{frameSizeBytes} Bytes</span>
              </div>
              <input
                type="range" min="200" max="2000" step="100" value={frameSizeBytes}
                onChange={(e) => setFrameSizeBytes(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Sender Window Size (Ws):</span>
                <span className="text-accent font-bold">{windowSize} Frames</span>
              </div>
              <input
                type="range" min="1" max="64" step="1" value={windowSize}
                onChange={(e) => setWindowSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">Channel Efficiency (η)</span>
            <div className="text-4xl sm:text-5xl font-display font-black text-emerald-400 tracking-tightest">
              {efficiencyPercent.toFixed(1)} <span className="text-base text-muted-gray font-normal">%</span>
            </div>
            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between"><span>Optimal Window (1+2a):</span><strong className="text-accent">{optimalWindow} frames</strong></div>
              <div className="flex justify-between"><span>Min GBN Sequence Bits:</span><strong className="text-off-white">{minGbnSeqBits} bits</strong></div>
              <div className="flex justify-between"><span>Min SR Sequence Bits:</span><strong className="text-off-white">{minSrSeqBits} bits</strong></div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] text-off-white/80 leading-relaxed mt-2">
                <code>Tt = {transDelayUs.toFixed(1)}μs, Tp = {propDelayUs.toFixed(1)}μs, a = {aParam.toFixed(2)}</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAB 3: Cache AMAT ───────────────────────────────────────────── */}
      {activeLab === 'cache' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">L1 Cache Hit Ratio (h1):</span>
                <span className="text-accent font-bold">{(l1HitRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0.70" max="0.99" step="0.01" value={l1HitRate}
                onChange={(e) => setL1HitRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">L1 Hit Latency:</span>
                <span className="text-accent font-bold">{l1Latency} ns</span>
              </div>
              <input
                type="range" min="0.5" max="5.0" step="0.5" value={l1Latency}
                onChange={(e) => setL1Latency(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">L2 Cache Hit Ratio (h2):</span>
                <span className="text-accent font-bold">{(l2HitRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0.50" max="0.95" step="0.01" value={l2HitRate}
                onChange={(e) => setL2HitRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Main Memory Penalty:</span>
                <span className="text-accent font-bold">{mainMemLatency} ns</span>
              </div>
              <input
                type="range" min="40" max="150" step="5" value={mainMemLatency}
                onChange={(e) => setMainMemLatency(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">Average Memory Access Time (AMAT)</span>
            <div className="text-4xl sm:text-5xl font-display font-black text-accent tracking-tightest">
              {amatValue.toFixed(2)} <span className="text-base text-muted-gray font-normal">ns</span>
            </div>
            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between"><span>L1 Hit Time:</span><strong className="text-emerald-400">{l1Latency} ns</strong></div>
              <div className="flex justify-between"><span>L2 Miss Penalty:</span><strong className="text-amber-400">{l2MissPenalty.toFixed(1)} ns</strong></div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] text-off-white/80 leading-relaxed mt-2">
                <code>AMAT = {l1Latency} + {(1-l1HitRate).toFixed(2)} × ({l2Latency} + {(1-l2HitRate).toFixed(2)}×{mainMemLatency}) = {amatValue.toFixed(2)} ns</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAB 4: CPU Pipelining & Speedup ─────────────────────────────── */}
      {activeLab === 'pipeline' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Pipeline Stages (k):</span>
                <span className="text-accent font-bold">{pipeStages} Stages</span>
              </div>
              <input
                type="range" min="3" max="12" step="1" value={pipeStages}
                onChange={(e) => setPipeStages(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Instruction Count (n):</span>
                <span className="text-accent font-bold">{pipeInstructions.toLocaleString()} Instructions</span>
              </div>
              <input
                type="range" min="100" max="50000" step="100" value={pipeInstructions}
                onChange={(e) => setPipeInstructions(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Pipeline Stalls / Branch Hazard Cycles (s):</span>
                <span className="text-accent font-bold">{pipeStallCycles} Cycles</span>
              </div>
              <input
                type="range" min="0" max="1000" step="10" value={pipeStallCycles}
                onChange={(e) => setPipeStallCycles(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Clock Cycle Time (t_clk):</span>
                <span className="text-accent font-bold">{pipeClockNs} ns</span>
              </div>
              <input
                type="range" min="0.5" max="10.0" step="0.5" value={pipeClockNs}
                onChange={(e) => setPipeClockNs(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">Actual Pipeline Speedup (S)</span>
            <div className="text-4xl sm:text-5xl font-display font-black text-emerald-400 tracking-tightest">
              {pipeSpeedup.toFixed(2)}x <span className="text-base text-muted-gray font-normal">/ {pipeStages}x ideal</span>
            </div>
            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between"><span>Pipelined Total Cycles:</span><strong className="text-accent">{pipeTotalCycles.toLocaleString()} cycles</strong></div>
              <div className="flex justify-between"><span>Throughput:</span><strong className="text-off-white">{pipeThroughputMips.toFixed(1)} MIPS</strong></div>
              <div className="flex justify-between"><span>Execution Time:</span><strong className="text-off-white">{(pipeTimeNs / 1000.0).toFixed(2)} μs</strong></div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] text-off-white/80 leading-relaxed mt-2">
                <code>S = (n × k) / (k + n - 1 + s) = ({pipeInstructions}×{pipeStages}) / ({pipeTotalCycles}) = {pipeSpeedup.toFixed(2)}x</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAB 5: Disk Head Latency ────────────────────────────────────── */}
      {activeLab === 'disk' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Average Seek Time (t_seek):</span>
                <span className="text-accent font-bold">{diskSeekMs} ms</span>
              </div>
              <input
                type="range" min="1.0" max="15.0" step="0.5" value={diskSeekMs}
                onChange={(e) => setDiskSeekMs(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Disk Spindle Speed (RPM):</span>
                <span className="text-accent font-bold">{diskRpm} RPM</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[5400, 7200, 10000, 15000].map(rpm => (
                  <button
                    key={rpm} type="button" onClick={() => setDiskRpm(rpm)}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                      diskRpm === rpm
                        ? 'border-accent bg-accent/20 text-accent font-bold shadow-[0_0_10px_rgba(61,90,254,0.3)]'
                        : 'border-white/[0.08] text-muted-gray hover:text-off-white bg-[#14141f]'
                    }`}
                  >
                    {rpm} RPM
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Transfer Rate:</span>
                <span className="text-accent font-bold">{diskTransferRateMBps} MB/s</span>
              </div>
              <input
                type="range" min="20" max="300" step="10" value={diskTransferRateMBps}
                onChange={(e) => setDiskTransferRateMBps(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">Average Total Access Time</span>
            <div className="text-4xl sm:text-5xl font-display font-black text-accent tracking-tightest">
              {diskTotalAccessMs.toFixed(2)} <span className="text-base text-muted-gray font-normal">ms</span>
            </div>
            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between"><span>Seek Time:</span><strong className="text-off-white">{diskSeekMs.toFixed(1)} ms</strong></div>
              <div className="flex justify-between"><span>Avg Rotational Latency (60/2·RPM):</span><strong className="text-amber-400">{diskRotLatencyMs.toFixed(2)} ms</strong></div>
              <div className="flex justify-between"><span>Transfer Delay:</span><strong className="text-emerald-400">{(diskTransLatencyMs * 1000).toFixed(1)} μs</strong></div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] text-off-white/80 leading-relaxed mt-2">
                <code>Access = Seek ({diskSeekMs}) + Rot ({diskRotLatencyMs.toFixed(2)}) + Trans = {diskTotalAccessMs.toFixed(2)} ms</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAB 6: Master Theorem Recurrence Solver ─────────────────────── */}
      {activeLab === 'master_theorem' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <div className="text-xs font-mono text-accent font-semibold p-2.5 rounded-lg bg-accent/10 border border-accent/20">
              Form: T(n) = a·T(n/b) + Θ(n^k · log^p(n))
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-muted-gray">Subproblems (a):</span>
                  <span className="text-accent font-bold">{mtA}</span>
                </div>
                <input
                  type="range" min="1" max="16" step="1" value={mtA}
                  onChange={(e) => setMtA(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-muted-gray">Division Factor (b):</span>
                  <span className="text-accent font-bold">{mtB}</span>
                </div>
                <input
                  type="range" min="2" max="8" step="1" value={mtB}
                  onChange={(e) => setMtB(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-muted-gray">Power of n (k):</span>
                  <span className="text-accent font-bold">n^{mtK}</span>
                </div>
                <input
                  type="range" min="0" max="4" step="1" value={mtK}
                  onChange={(e) => setMtK(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-muted-gray">Power of log (p):</span>
                  <span className="text-accent font-bold">log^{mtP}(n)</span>
                </div>
                <input
                  type="range" min="0" max="3" step="1" value={mtP}
                  onChange={(e) => setMtP(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">Asymptotic Time Complexity</span>
            <div className="text-3xl sm:text-4xl font-display font-black text-accent tracking-tightest">
              {mtComplexity}
            </div>
            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between"><span>Master Theorem State:</span><strong className="text-emerald-400">{mtCase}</strong></div>
              <div className="flex justify-between"><span>Critical Exponent log_b(a):</span><strong className="text-off-white">{logBA.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Work per level exponent (k):</span><strong className="text-off-white">{mtK}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAB 7: CIDR Subnetting ───────────────────────────────────────── */}
      {activeLab === 'subnet' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">CIDR Prefix Length (/n):</span>
                <span className="text-accent font-bold">/{cidrPrefix}</span>
              </div>
              <input
                type="range" min="8" max="30" step="1" value={cidrPrefix}
                onChange={(e) => setCidrPrefix(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div className="p-3 rounded-lg bg-[#14141f] border border-white/[0.04] text-xs font-mono text-muted-gray">
              <span>Subnet Mask: </span>
              <strong className="text-accent">{subnetMaskStr}</strong>
            </div>
          </div>

          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">Usable Host IP Addresses</span>
            <div className="text-4xl sm:text-5xl font-display font-black text-emerald-400 tracking-tightest">
              {usableHostAddresses.toLocaleString()} <span className="text-base text-muted-gray font-normal">hosts</span>
            </div>
            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between"><span>Total IP Block Size (2^{hostBits}):</span><strong className="text-off-white">{totalIpAddresses.toLocaleString()}</strong></div>
              <div className="flex justify-between"><span>Host Bits (32 - {cidrPrefix}):</span><strong className="text-accent">{hostBits} bits</strong></div>
              <div className="flex justify-between"><span>Network & Broadcast IPs:</span><strong className="text-red-400">2 reserved</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAB 8: B+ Tree Fanout ────────────────────────────────────────── */}
      {activeLab === 'b_tree' && (
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-muted-gray">Disk Block Size (B):</span>
                <span className="text-accent font-bold">{blockSizeBytes} Bytes</span>
              </div>
              <input
                type="range" min="512" max="4096" step="512" value={blockSizeBytes}
                onChange={(e) => setBlockSizeBytes(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] font-mono text-muted-gray block mb-1">Search Key (K):</span>
                <input
                  type="number" min="4" max="64" value={keySizeBytes}
                  onChange={(e) => setKeySizeBytes(parseInt(e.target.value) || 8)}
                  className="w-full p-2 rounded-lg bg-[#14141f] border border-white/[0.08] text-xs font-mono text-off-white"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-gray block mb-1">Block Ptr (Pb):</span>
                <input
                  type="number" min="4" max="16" value={blockPtrSizeBytes}
                  onChange={(e) => setBlockPtrSizeBytes(parseInt(e.target.value) || 6)}
                  className="w-full p-2 rounded-lg bg-[#14141f] border border-white/[0.08] text-xs font-mono text-off-white"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-gray block mb-1">Record Ptr (P):</span>
                <input
                  type="number" min="4" max="16" value={recordPtrSizeBytes}
                  onChange={(e) => setRecordPtrSizeBytes(parseInt(e.target.value) || 8)}
                  className="w-full p-2 rounded-lg bg-[#14141f] border border-white/[0.08] text-xs font-mono text-off-white"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-5 p-6 rounded-xl border border-white/[0.08] border-t-white/[0.16] bg-[#141420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gray block">Internal Node Fanout (p)</span>
            <div className="text-4xl sm:text-5xl font-display font-black text-accent tracking-tightest">
              {internalFanout} <span className="text-base text-muted-gray font-normal">pointers/node</span>
            </div>
            <div className="space-y-2 text-[11px] font-mono border-t border-white/[0.06] pt-3 text-muted-gray">
              <div className="flex justify-between"><span>Leaf Node Fanout:</span><strong className="text-emerald-400">{leafFanout} records/leaf</strong></div>
              <div className="flex justify-between"><span>Max Records (Height 3 Tree):</span><strong className="text-off-white">{maxRecordsH3.toLocaleString()}</strong></div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] text-off-white/80 leading-relaxed mt-2">
                <code>p × P_b + (p - 1) × K ≤ B → {internalFanout} × {blockPtrSizeBytes} + {internalFanout - 1} × {keySizeBytes} ≤ {blockSizeBytes}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
