import React, { useState } from 'react';
import { Calculator, Sparkles, Server, Network, ArrowRight } from 'lucide-react';

interface CidrInfo {
  prefix: number;
  mask: string;
  totalHosts: number;
  usableHosts: number;
  binaryLastOctet: string;
  exampleUse: string;
}

const CIDR_DATA: Record<number, CidrInfo> = {
  24: { prefix: 24, mask: '255.255.255.0', totalHosts: 256, usableHosts: 254, binaryLastOctet: '00000000', exampleUse: 'Standard Class C LAN' },
  25: { prefix: 25, mask: '255.255.255.128', totalHosts: 128, usableHosts: 126, binaryLastOctet: '10000000', exampleUse: 'Split Department Subnet' },
  26: { prefix: 26, mask: '255.255.255.192', totalHosts: 64, usableHosts: 62, binaryLastOctet: '11000000', exampleUse: 'Computer Lab Segment (KLU CSE)' },
  27: { prefix: 27, mask: '255.255.255.224', totalHosts: 32, usableHosts: 30, binaryLastOctet: '11100000', exampleUse: 'Server Cluster Rack' },
  28: { prefix: 28, mask: '255.255.255.240', totalHosts: 16, usableHosts: 14, binaryLastOctet: '11110000', exampleUse: 'Staff Office Gateway' },
  29: { prefix: 29, mask: '255.255.255.248', totalHosts: 8, usableHosts: 6, binaryLastOctet: '11111000', exampleUse: 'Demilitarized Zone (DMZ)' },
  30: { prefix: 30, mask: '255.255.255.252', totalHosts: 4, usableHosts: 2, binaryLastOctet: '11111100', exampleUse: 'Point-to-Point Router Link' },
};

export const SubnetCalculatorWidget: React.FC = () => {
  const [selectedPrefix, setSelectedPrefix] = useState<number>(26);
  const info = CIDR_DATA[selectedPrefix] || CIDR_DATA[26];

  return (
    <div className="w-full rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#131522] to-[#0D0E17] p-6 sm:p-8 shadow-2xl relative overflow-hidden font-sans">
      {/* Background Accent Glow (GPU Hardware Accelerated) */}
      <div 
        className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', transform: 'translateZ(0)' }}
      />
      <div 
        className="pointer-events-none absolute -left-20 -bottom-20 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', transform: 'translateZ(0)' }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator size={14} />
            <span>Interactive Tool • Unit 3 Module 4</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Instant CIDR Subnetting Engine
          </h3>
        </div>

        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
          IPv4 VLSM Calculator
        </span>
      </div>

      {/* Interactive Prefix Selector Bar */}
      <div className="mt-6 space-y-3">
        <label className="text-xs font-mono text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
          <span>Choose CIDR Prefix Notation:</span>
          <span className="text-cyan-400 font-bold text-sm">/{selectedPrefix}</span>
        </label>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Object.keys(CIDR_DATA).map((p) => {
            const num = Number(p);
            const isSelected = num === selectedPrefix;
            return (
              <button
                key={num}
                onClick={() => setSelectedPrefix(num)}
                className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_16px_rgba(6,182,212,0.5)] scale-105'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5'
                }`}
              >
                /{num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Results Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Subnet Mask */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
            Subnet Mask
          </span>
          <div className="text-base sm:text-lg font-mono font-extrabold text-white">
            {info.mask}
          </div>
          <div className="text-[10px] font-mono text-cyan-400 mt-1">
            Octet: {info.binaryLastOctet}
          </div>
        </div>

        {/* Metric 2: Usable Hosts */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
            Usable Hosts (2^(32-N) - 2)
          </span>
          <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-400">
            {info.usableHosts} <span className="text-xs text-slate-400 font-normal">usable</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Total {info.totalHosts} (-2 Net & Bcast)
          </div>
        </div>

        {/* Metric 3: Typical Deployment */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
            Typical Application
          </span>
          <div className="text-sm font-semibold text-amber-300">
            {info.exampleUse}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Included in Module U3.M04 Practice
          </div>
        </div>
      </div>

      {/* University Exam Pro-Tip */}
      <div className="mt-5 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center gap-3 text-xs text-cyan-200">
        <Sparkles size={16} className="text-cyan-400 shrink-0" />
        <p>
          <strong className="text-white">Exam Shortcut:</strong> Always subtract 2 from total addresses (one for the Network ID and one for the Direct Broadcast ID).
        </p>
      </div>
    </div>
  );
};

export default SubnetCalculatorWidget;
