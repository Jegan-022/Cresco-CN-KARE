import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, 
  Router as RouterIcon, 
  Globe, 
  Server, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Network, 
  AlertCircle, 
  ShieldCheck, 
  HelpCircle,
  Play,
  Pause,
  Zap,
  Activity,
  ArrowDown,
  Cpu,
  Mail,
  Lock,
  Unlock,
  Sliders,
  ChevronRight
} from 'lucide-react';

// =========================================================================
// 1. HERO NETWORK LAYER PACKET VISUALIZER
// Computer -> Router -> Router -> Internet -> Server
// =========================================================================
export const NetworkHeroVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [deliveredCount, setDeliveredCount] = useState<number>(142);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep(prev => {
        if (prev === 4) {
          setDeliveredCount(c => c + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const nodes = [
    { label: 'Source PC', sub: '192.168.1.10', icon: Laptop, color: '#5B7CFF' },
    { label: 'Edge Router R1', sub: 'Default GW', icon: RouterIcon, color: '#8B5CF6' },
    { label: 'Core Router R2', sub: 'Autonomous Sys', icon: RouterIcon, color: '#8B5CF6' },
    { label: 'Internet WAN', sub: 'BGP Backbone', icon: Globe, color: '#38BDF8' },
    { label: 'Target Server', sub: '93.184.216.34', icon: Server, color: '#22C55E' }
  ];

  return (
    <div className="bg-[#11141B] border border-[#252B36] rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252B36]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
            <span className="text-xs font-mono text-[#5B7CFF] uppercase tracking-wider font-semibold">
              Live End-to-End Packet Routing
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Hop-by-Hop Datagram Traversal
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-[#171B24] hover:bg-[#1E2330] border border-[#252B36] rounded-lg text-xs text-slate-300 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>
          <button
            onClick={() => setActiveStep(0)}
            className="px-3 py-1.5 bg-[#171B24] hover:bg-[#1E2330] border border-[#252B36] rounded-lg text-xs text-slate-300 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Traversal Pipeline */}
      <div className="py-8 relative">
        {/* Backbone line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-[#252B36] rounded-full z-0" />
        
        {/* Progress Fill */}
        <div 
          className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#5B7CFF] via-[#8B5CF6] to-[#22C55E] rounded-full transition-all transform-gpu duration-700 z-0"
          style={{ width: `${(activeStep / (nodes.length - 1)) * 88}%` }}
        />

        {/* Dynamic Flying Packet */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#5B7CFF] shadow-[0_0_16px_#5B7CFF] z-20 flex items-center justify-center text-[10px] text-white font-mono font-bold"
          animate={{
            left: `${(activeStep / (nodes.length - 1)) * 85 + 4}%`,
          }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          IP
        </motion.div>

        {/* Node Icons */}
        <div className="grid grid-cols-5 gap-2 relative z-10">
          {nodes.map((n, idx) => {
            const Icon = n.icon;
            const isCurrent = activeStep === idx;
            const isPast = activeStep > idx;

            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div 
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border transition-all transform-gpu duration-300 ${
                    isCurrent 
                      ? 'bg-[#5B7CFF]/20 border-[#5B7CFF] text-[#5B7CFF] scale-110 shadow-lg shadow-[#5B7CFF]/30 ring-2 ring-[#5B7CFF]/40' 
                      : isPast
                      ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
                      : 'bg-[#11141B] border-[#252B36] text-[#94A3B8]'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="mt-2.5">
                  <div className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                    {n.label}
                  </div>
                  <div className="text-[10px] font-mono text-[#94A3B8] hidden sm:block">
                    {n.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packet Inspection Card */}
      <div className="bg-[#0B0D12] border border-[#252B36] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3 text-slate-300">
          <span className="text-[#94A3B8]">Packet Status:</span>
          <span className="px-2 py-0.5 rounded bg-[#5B7CFF]/15 text-[#5B7CFF] font-semibold border border-[#5B7CFF]/30">
            {activeStep === 0 && 'Originating at Source NIC'}
            {activeStep === 1 && 'R1 Consults FIB Table (Next-hop R2)'}
            {activeStep === 2 && 'R2 BGP Autonomous System Border Forward'}
            {activeStep === 3 && 'Transit across WAN backbone'}
            {activeStep === 4 && 'PACKET DELIVERED ✓ Socket Accept'}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span>TTL: <strong className="text-white">{64 - activeStep}</strong></span>
          <span>•</span>
          <span>Packets Delivered: <strong className="text-[#22C55E]">{deliveredCount}</strong></span>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. ROUTING GRAPH VISUALIZER (Dijkstra Shortest Path)
// Graph A, B, C, D with weights, path selection, and cost breakdown
// =========================================================================
export const RoutingGraphVisualizer: React.FC = () => {
  const [source, setSource] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [dest, setDest] = useState<'A' | 'B' | 'C' | 'D'>('D');

  // Hardcoded graph with weights:
  // A - (1) - B
  // A - (4) - C
  // B - (2) - C
  // B - (5) - D
  // C - (1) - D
  // Shortest paths:
  // A -> D: A -> B (1) -> C (2) -> D (1) = Total Cost 4 (Hops: 3)
  // vs direct A -> B -> D (Cost 1 + 5 = 6)
  
  const getRouteInfo = (s: string, d: string) => {
    if (s === d) return { path: [s], cost: 0, hops: 0, explanation: 'Source equals destination' };
    if (s === 'A' && d === 'D') return { path: ['A', 'B', 'C', 'D'], cost: 4, hops: 3, explanation: 'Dijkstra chooses A→B (1) + B→C (2) + C→D (1) = 4 (beating A→B→D cost 6)' };
    if (s === 'A' && d === 'C') return { path: ['A', 'B', 'C'], cost: 3, hops: 2, explanation: 'A→B (1) + B→C (2) = 3 (beating direct A→C link of weight 4)' };
    if (s === 'A' && d === 'B') return { path: ['A', 'B'], cost: 1, hops: 1, explanation: 'Direct link weight 1' };
    if (s === 'B' && d === 'D') return { path: ['B', 'C', 'D'], cost: 3, hops: 2, explanation: 'B→C (2) + C→D (1) = 3 (beating direct B→D link of weight 5)' };
    if (s === 'C' && d === 'A') return { path: ['C', 'B', 'A'], cost: 3, hops: 2, explanation: 'Reverse shortest path cost 3' };
    return { path: [s, 'B', d], cost: 5, hops: 2, explanation: 'Optimal link state computed via Dijkstra SPF algorithm' };
  };

  const route = getRouteInfo(source, dest);

  return (
    <div className="bg-[#11141B] border border-[#252B36] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252B36]">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-[#5B7CFF]" />
            <span className="text-xs font-mono text-[#5B7CFF] uppercase font-semibold">
              Link-State Routing Simulator
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Dijkstra's Shortest Path First (SPF) Engine
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <label className="text-slate-400">Source:</label>
          <select 
            value={source} 
            onChange={(e) => setSource(e.target.value as any)}
            className="bg-[#0B0D12] border border-[#252B36] text-white px-2.5 py-1.5 rounded-lg font-mono focus:border-[#5B7CFF] focus:outline-hidden"
          >
            <option value="A">Router A</option>
            <option value="B">Router B</option>
            <option value="C">Router C</option>
            <option value="D">Router D</option>
          </select>
          <label className="text-slate-400">Target:</label>
          <select 
            value={dest} 
            onChange={(e) => setDest(e.target.value as any)}
            className="bg-[#0B0D12] border border-[#252B36] text-white px-2.5 py-1.5 rounded-lg font-mono focus:border-[#5B7CFF] focus:outline-hidden"
          >
            <option value="A">Router A</option>
            <option value="B">Router B</option>
            <option value="C">Router C</option>
            <option value="D">Router D</option>
          </select>
        </div>
      </div>

      {/* Graph Visual Canvas */}
      <div className="p-6 bg-[#0B0D12] border border-[#252B36] rounded-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
        {/* Interactive network topology diagram */}
        <div className="w-full max-w-md grid grid-cols-2 gap-12 sm:gap-20 relative">
          
          {/* Node A */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base transition-all transform-gpu ${
              route.path.includes('A') 
                ? 'bg-[#5B7CFF] text-white shadow-lg shadow-[#5B7CFF]/40 ring-4 ring-[#5B7CFF]/20' 
                : 'bg-[#171B24] border border-[#252B36] text-slate-300'
            }`}>
              A
            </div>
            <span className="text-[11px] font-mono text-[#94A3B8] mt-1">10.0.1.0/24</span>
          </div>

          {/* Node B */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base transition-all transform-gpu ${
              route.path.includes('B') 
                ? 'bg-[#5B7CFF] text-white shadow-lg shadow-[#5B7CFF]/40 ring-4 ring-[#5B7CFF]/20' 
                : 'bg-[#171B24] border border-[#252B36] text-slate-300'
            }`}>
              B
            </div>
            <span className="text-[11px] font-mono text-[#94A3B8] mt-1">10.0.2.0/24</span>
          </div>

          {/* Node C */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base transition-all transform-gpu ${
              route.path.includes('C') 
                ? 'bg-[#5B7CFF] text-white shadow-lg shadow-[#5B7CFF]/40 ring-4 ring-[#5B7CFF]/20' 
                : 'bg-[#171B24] border border-[#252B36] text-slate-300'
            }`}>
              C
            </div>
            <span className="text-[11px] font-mono text-[#94A3B8] mt-1">10.0.3.0/24</span>
          </div>

          {/* Node D */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base transition-all transform-gpu ${
              route.path.includes('D') 
                ? 'bg-[#22C55E] text-white shadow-lg shadow-[#22C55E]/40 ring-4 ring-[#22C55E]/20' 
                : 'bg-[#171B24] border border-[#252B36] text-slate-300'
            }`}>
              D
            </div>
            <span className="text-[11px] font-mono text-[#94A3B8] mt-1">10.0.4.0/24</span>
          </div>
        </div>

        {/* Weights Legend Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 bg-[#171B24] border border-[#252B36] rounded text-slate-300">
            cost(A,B) = <strong>1</strong>
          </span>
          <span className="px-2.5 py-1 bg-[#171B24] border border-[#252B36] rounded text-slate-300">
            cost(B,C) = <strong>2</strong>
          </span>
          <span className="px-2.5 py-1 bg-[#171B24] border border-[#252B36] rounded text-slate-300">
            cost(C,D) = <strong>1</strong>
          </span>
          <span className="px-2.5 py-1 bg-[#171B24] border border-[#252B36] rounded text-slate-300">
            cost(B,D) = <strong>5</strong>
          </span>
          <span className="px-2.5 py-1 bg-[#171B24] border border-[#252B36] rounded text-slate-300">
            cost(A,C) = <strong>4</strong>
          </span>
        </div>
      </div>

      {/* Result Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3 bg-[#0B0D12] border border-[#252B36] rounded-xl">
          <div className="text-[#94A3B8]">Shortest Path</div>
          <div className="text-white font-bold text-sm mt-1 flex items-center space-x-1">
            {route.path.join(' → ')}
          </div>
        </div>
        <div className="p-3 bg-[#0B0D12] border border-[#252B36] rounded-xl">
          <div className="text-[#94A3B8]">Cumulative Metric (Cost)</div>
          <div className="text-[#22C55E] font-bold text-sm mt-1">
            {route.cost}
          </div>
        </div>
        <div className="p-3 bg-[#0B0D12] border border-[#252B36] rounded-xl">
          <div className="text-[#94A3B8]">Hop Count</div>
          <div className="text-[#5B7CFF] font-bold text-sm mt-1">
            {route.hops} Hops
          </div>
        </div>
      </div>

      <p className="text-xs text-[#94A3B8] leading-relaxed bg-[#171B24] p-3 rounded-lg border border-[#252B36]">
        💡 <strong>SPF Algorithm Logic:</strong> {route.explanation}
      </p>
    </div>
  );
};

// =========================================================================
// 3. IPv6 ADDRESS VISUALIZER & COMPRESSION DEMO
// 32-bit vs 128-bit comparison & zero-compression double colon rule
// =========================================================================
export const IPv6Visualizer: React.FC = () => {
  const [compressZeros, setCompressZeros] = useState<boolean>(true);
  const [compressLeading, setCompressLeading] = useState<boolean>(true);

  const fullAddress = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
  
  // Apply transformations
  let displayAddress = fullAddress;
  if (compressLeading) {
    // remove leading zeros from each 16-bit block
    displayAddress = displayAddress
      .split(':')
      .map(b => b.replace(/^0+(?!$)/, ''))
      .join(':');
  }
  if (compressZeros) {
    // replace consecutive 0:0 with ::
    displayAddress = displayAddress.replace(/(^|:)0(:0)+(:|$)/, '::');
  }

  return (
    <div className="bg-[#11141B] border border-[#252B36] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252B36]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#8B5CF6] uppercase font-semibold">
              RFC 4291 Architecture
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            IPv4 vs IPv6 & Address Compression Rules
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 bg-[#8B5CF6]/15 text-[#8B5CF6] rounded-lg border border-[#8B5CF6]/30 font-semibold">
            128-Bit Address Space (3.4 × 10³⁸ IPs)
          </span>
        </div>
      </div>

      {/* Comparison Blocks: IPv4 32-bit vs IPv6 128-bit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="font-bold text-white">IPv4 Format</span>
            <span className="text-[#5B7CFF]">32 Bits (4 Octets)</span>
          </div>
          <div className="p-2.5 bg-[#171B24] rounded text-[#5B7CFF] text-sm font-bold">
            192.168.1.1
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Total addresses: 2³² ≈ 4,294,967,296. Exhausted since 2011.
          </div>
        </div>

        <div className="p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="font-bold text-white">IPv6 Format</span>
            <span className="text-[#8B5CF6]">128 Bits (8 Hextets)</span>
          </div>
          <div className="p-2.5 bg-[#171B24] rounded text-[#8B5CF6] text-sm font-bold break-all">
            {displayAddress}
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Total addresses: 2¹²⁸ ≈ 340 undecillion addresses.
          </div>
        </div>
      </div>

      {/* Interactive Compression Controls */}
      <div className="p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl space-y-3">
        <div className="text-xs font-bold text-white flex items-center justify-between">
          <span>Interactive Compression Rules (RFC 5952)</span>
          <span className="text-[11px] text-[#94A3B8] font-normal">Click toggles to view reduction</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCompressLeading(!compressLeading)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              compressLeading 
                ? 'bg-[#5B7CFF]/20 border-[#5B7CFF] text-[#5B7CFF]' 
                : 'bg-[#171B24] border-[#252B36] text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Rule 1: Omit Leading Zeros (0db8 → db8)</span>
          </button>

          <button
            onClick={() => setCompressZeros(!compressZeros)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              compressZeros 
                ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6]' 
                : 'bg-[#171B24] border-[#252B36] text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Rule 2: Double Colon (::) for Consecutive Zeros</span>
          </button>
        </div>

        <div className="p-3 bg-[#171B24] rounded-lg border border-[#252B36] text-xs font-mono space-y-1">
          <div className="text-[#94A3B8]">Resulting Form:</div>
          <div className="text-emerald-400 font-bold text-sm break-all">{displayAddress}</div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. TCP THREE-WAY HANDSHAKE SIMULATOR
// SYN -> SYN-ACK -> ACK with sequence & acknowledgment progression
// =========================================================================
export const TCPHandshakeSimulator: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [clientISN] = useState<number>(1000);
  const [serverISN] = useState<number>(5000);

  const steps = [
    {
      label: 'Initial Closed State',
      clientState: 'CLOSED',
      serverState: 'LISTEN',
      desc: 'Client prepares to connect; Server is passively listening on Port 80/443.',
      activePacket: null
    },
    {
      label: 'Step 1: Client sends SYN',
      clientState: 'SYN-SENT',
      serverState: 'LISTEN',
      desc: 'Client sends SYN packet with Initial Sequence Number (ISN_c = 1000).',
      activePacket: { from: 'Client', to: 'Server', flags: 'SYN', seq: clientISN, ack: 0 }
    },
    {
      label: 'Step 2: Server responds SYN-ACK',
      clientState: 'SYN-SENT',
      serverState: 'SYN-RECEIVED',
      desc: 'Server acknowledges client ISN (ack = 1001) and sends its own ISN_s = 5000.',
      activePacket: { from: 'Server', to: 'Client', flags: 'SYN + ACK', seq: serverISN, ack: clientISN + 1 }
    },
    {
      label: 'Step 3: Client sends ACK',
      clientState: 'ESTABLISHED',
      serverState: 'ESTABLISHED',
      desc: 'Client confirms server ISN (ack = 5001). Reliable full-duplex socket open!',
      activePacket: { from: 'Client', to: 'Server', flags: 'ACK', seq: clientISN + 1, ack: serverISN + 1 }
    }
  ];

  const current = steps[step];

  return (
    <div className="bg-[#11141B] border border-[#252B36] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252B36]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#22C55E] uppercase font-semibold">
              RFC 793 State Synchronization
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            TCP 3-Way Handshake Interactive Simulator
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStep(prev => Math.min(prev + 1, 3))}
            disabled={step === 3}
            className="px-3 py-1.5 bg-[#5B7CFF] hover:bg-[#5B7CFF]/90 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStep(0)}
            className="px-3 py-1.5 bg-[#171B24] hover:bg-[#1E2330] border border-[#252B36] text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Handshake Visual Stage */}
      <div className="p-6 bg-[#0B0D12] border border-[#252B36] rounded-xl relative">
        <div className="grid grid-cols-2 gap-8 relative z-10">
          
          {/* Client Pillar */}
          <div className="flex flex-col items-center p-4 bg-[#171B24] border border-[#252B36] rounded-xl text-center space-y-2">
            <Laptop className="w-8 h-8 text-[#5B7CFF]" />
            <div className="font-bold text-white text-sm">Client (Browser)</div>
            <div className="text-[11px] font-mono text-[#94A3B8]">Port: 52401</div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
              current.clientState === 'ESTABLISHED' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#5B7CFF]/20 text-[#5B7CFF]'
            }`}>
              {current.clientState}
            </span>
          </div>

          {/* Server Pillar */}
          <div className="flex flex-col items-center p-4 bg-[#171B24] border border-[#252B36] rounded-xl text-center space-y-2">
            <Server className="w-8 h-8 text-[#22C55E]" />
            <div className="font-bold text-white text-sm">Server (Web Daemon)</div>
            <div className="text-[11px] font-mono text-[#94A3B8]">Port: 443</div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
              current.serverState === 'ESTABLISHED' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
            }`}>
              {current.serverState}
            </span>
          </div>

        </div>

        {/* Transmission Arrows */}
        <div className="mt-6 space-y-3">
          {steps.slice(1).map((s, idx) => {
            const stepNum = idx + 1;
            const isPassed = step >= stepNum;
            const isCurrent = step === stepNum;

            return (
              <div 
                key={stepNum}
                className={`p-3 rounded-lg border font-mono text-xs transition-all transform-gpu flex items-center justify-between ${
                  isCurrent 
                    ? 'bg-[#5B7CFF]/15 border-[#5B7CFF] text-white shadow-md' 
                    : isPassed
                    ? 'bg-[#171B24] border-[#252B36] text-slate-300'
                    : 'opacity-40 bg-[#0B0D12] border-[#1C212C] text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#11141B] border border-[#252B36] flex items-center justify-center font-bold text-[10px]">
                    {stepNum}
                  </span>
                  <span>{s.label}</span>
                </div>
                {s.activePacket && (
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="font-bold text-[#5B7CFF]">{s.activePacket.flags}</span>
                    <span>SEQ={s.activePacket.seq}</span>
                    <span>ACK={s.activePacket.ack}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 bg-[#171B24] border border-[#252B36] rounded-xl flex items-start space-x-3 text-xs">
        <Zap className="w-4 h-4 text-[#5B7CFF] shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <strong className="text-white">{current.label}:</strong> {current.desc}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 5. TCP CONGESTION CONTROL VISUALIZER
// Interactive plot showing Slow Start, Congestion Avoidance, 3-Dup-ACK
// =========================================================================
export const TCPCongestionSimulator: React.FC = () => {
  const [phase, setPhase] = useState<'slow-start' | 'congestion-avoidance' | 'loss-event'>('slow-start');

  return (
    <div className="bg-[#11141B] border border-[#252B36] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252B36]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#F59E0B] uppercase font-semibold">
              TCP Tahoe & Reno Mechanics
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Congestion Window (cwnd) Evolution
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPhase('slow-start')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              phase === 'slow-start' ? 'bg-[#5B7CFF] text-white' : 'bg-[#171B24] border border-[#252B36] text-slate-400'
            }`}
          >
            Slow Start (2ˣ)
          </button>
          <button
            onClick={() => setPhase('congestion-avoidance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              phase === 'congestion-avoidance' ? 'bg-[#22C55E] text-white' : 'bg-[#171B24] border border-[#252B36] text-slate-400'
            }`}
          >
            Congestion Avoidance (+1)
          </button>
          <button
            onClick={() => setPhase('loss-event')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              phase === 'loss-event' ? 'bg-[#EF4444] text-white' : 'bg-[#171B24] border border-[#252B36] text-slate-400'
            }`}
          >
            3-Dup ACK Loss Event
          </button>
        </div>
      </div>

      {/* Graph Visualizer */}
      <div className="p-6 bg-[#0B0D12] border border-[#252B36] rounded-xl space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Current Phase: <strong className="text-white uppercase">{phase}</strong></span>
          <span>ssthresh: <strong className="text-[#F59E0B]">16 MSS</strong></span>
          <span>cwnd: <strong className="text-[#5B7CFF]">
            {phase === 'slow-start' && '8 MSS (Doubling each RTT)'}
            {phase === 'congestion-avoidance' && '20 MSS (+1 MSS per RTT)'}
            {phase === 'loss-event' && 'Halved to 8 MSS (Fast Recovery)'}
          </strong></span>
        </div>

        {/* CSS Chart Bars */}
        <div className="h-44 border-b border-l border-[#252B36] flex items-end justify-between px-4 pb-1 gap-2">
          {[1, 2, 4, 8, 16, 17, 18, 19, 20, 10, 11, 12, 13].map((val, i) => {
            const isCurrent = 
              (phase === 'slow-start' && i <= 3) ||
              (phase === 'congestion-avoidance' && i >= 4 && i <= 8) ||
              (phase === 'loss-event' && i >= 9);

            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t transition-all transform-gpu duration-500 ${
                    i === 8 
                      ? 'bg-[#EF4444]' 
                      : i < 4 
                      ? 'bg-[#5B7CFF]' 
                      : i <= 8 
                      ? 'bg-[#22C55E]' 
                      : 'bg-[#8B5CF6]'
                  } ${isCurrent ? 'opacity-100' : 'opacity-30'}`}
                  style={{ height: `${(val / 22) * 100}%` }}
                />
                <span className="text-[9px] font-mono text-[#94A3B8] mt-1">{val}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
          <span>RTT 1</span>
          <span>Slow Start Threshold (ssthresh = 16)</span>
          <span>Packet Loss</span>
          <span>Fast Recovery</span>
        </div>
      </div>

      <div className="p-4 bg-[#171B24] border border-[#252B36] rounded-xl text-xs text-slate-300 leading-relaxed space-y-1">
        <div className="font-bold text-white">AIMD (Additive Increase / Multiplicative Decrease):</div>
        <p>
          TCP probes for available network bandwidth by increasing cwnd exponentially during Slow Start (1, 2, 4, 8...), linearly during Congestion Avoidance (+1 per RTT), and immediately cuts cwnd in half upon detecting packet loss.
        </p>
      </div>
    </div>
  );
};

// =========================================================================
// 6. ARP RESOLUTION SIMULATOR
// "Who has 192.168.1.10? Tell 192.168.1.1" Broadcast -> Unicast Reply
// =========================================================================
export const ARPAnimationSimulator: React.FC = () => {
  const [stage, setStage] = useState<'idle' | 'request' | 'reply' | 'cached'>('idle');

  return (
    <div className="bg-[#11141B] border border-[#252B36] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252B36]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#38BDF8] uppercase font-semibold">
              Address Resolution Protocol
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            IP-to-MAC Address Binding Resolution
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStage('request')}
            className="px-3 py-1.5 bg-[#5B7CFF] text-white rounded-lg text-xs font-semibold hover:bg-[#5B7CFF]/90 cursor-pointer"
          >
            1. Send ARP Broadcast
          </button>
          <button
            onClick={() => setStage('reply')}
            className="px-3 py-1.5 bg-[#22C55E] text-white rounded-lg text-xs font-semibold hover:bg-[#22C55E]/90 cursor-pointer"
          >
            2. Unicast Reply
          </button>
          <button
            onClick={() => setStage('idle')}
            className="px-3 py-1.5 bg-[#171B24] border border-[#252B36] text-slate-300 rounded-lg text-xs font-semibold hover:bg-[#1E2330] cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="p-6 bg-[#0B0D12] border border-[#252B36] rounded-xl grid grid-cols-3 gap-4 text-center text-xs font-mono">
        {/* Host A */}
        <div className="p-4 bg-[#171B24] border border-[#252B36] rounded-xl flex flex-col items-center space-y-2">
          <Laptop className="w-8 h-8 text-[#5B7CFF]" />
          <div className="font-bold text-white">Host A (Source)</div>
          <div className="text-[11px] text-[#94A3B8]">192.168.1.1</div>
          <div className="text-[10px] text-slate-400">AA:BB:CC:11:22:33</div>
        </div>

        {/* Switch / Broadcast Domain */}
        <div className="p-4 bg-[#171B24] border border-[#252B36] rounded-xl flex flex-col items-center justify-center space-y-2">
          <Network className="w-8 h-8 text-[#8B5CF6]" />
          <div className="font-bold text-white">L2 Switch</div>
          <div className="text-[10px] text-slate-400">Floods FF:FF:FF:FF:FF:FF</div>
        </div>

        {/* Host B */}
        <div className="p-4 bg-[#171B24] border border-[#252B36] rounded-xl flex flex-col items-center space-y-2">
          <Server className="w-8 h-8 text-[#22C55E]" />
          <div className="font-bold text-white">Host B (Target)</div>
          <div className="text-[11px] text-[#94A3B8]">192.168.1.10</div>
          <div className="text-[10px] text-slate-400">52:54:00:12:34:56</div>
        </div>
      </div>

      {/* Frame Inspection */}
      <div className="p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl text-xs font-mono space-y-2">
        <div className="text-[#94A3B8] font-bold">Ethernet II Frame Data:</div>
        {stage === 'idle' && (
          <div className="text-slate-400">Click "Send ARP Broadcast" to initiate address resolution.</div>
        )}
        {stage === 'request' && (
          <div className="text-[#38BDF8] space-y-1">
            <div>[ARP REQUEST Broadcast] Destination MAC: <strong>FF:FF:FF:FF:FF:FF</strong></div>
            <div>Payload: "Who has 192.168.1.10? Tell 192.168.1.1"</div>
          </div>
        )}
        {stage === 'reply' && (
          <div className="text-[#22C55E] space-y-1">
            <div>[ARP REPLY Unicast] Destination MAC: <strong>AA:BB:CC:11:22:33</strong></div>
            <div>Payload: "192.168.1.10 is at <strong>52:54:00:12:34:56</strong>"</div>
            <div className="text-[11px] text-emerald-400 font-sans mt-2">
              ✓ Host A updates local ARP cache (Dynamic, 20-min TTL).
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// 7. NAT TRANSLATION VISUALIZER
// Private IP:Port -> NAT Router -> Public IP:Port
// =========================================================================
export const NATVisualizer: React.FC = () => {
  return (
    <div className="bg-[#11141B] border border-[#252B36] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#252B36]">
        <div>
          <span className="text-xs font-mono text-[#5B7CFF] uppercase font-semibold">
            Network Address Translation (NAPT/PAT)
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Private-to-Public Socket Mapping Table
          </h3>
        </div>
        <span className="px-2.5 py-1 bg-[#22C55E]/15 text-[#22C55E] rounded text-xs font-mono font-bold">
          RFC 3022 Compliant
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl text-center space-y-2">
          <Laptop className="w-8 h-8 text-[#5B7CFF] mx-auto" />
          <div className="font-bold text-white">Private Host</div>
          <div className="text-slate-300">192.168.1.10:54321</div>
          <div className="text-[10px] text-[#94A3B8]">RFC 1918 Private Range</div>
        </div>

        <div className="p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl text-center space-y-2">
          <RouterIcon className="w-8 h-8 text-[#8B5CF6] mx-auto" />
          <div className="font-bold text-white">NAT Gateway</div>
          <div className="text-[#22C55E]">203.0.113.5:12045</div>
          <div className="text-[10px] text-[#94A3B8]">Public Interface IP</div>
        </div>

        <div className="p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl text-center space-y-2">
          <Server className="w-8 h-8 text-[#22C55E] mx-auto" />
          <div className="font-bold text-white">Web Server</div>
          <div className="text-slate-300">93.184.216.34:443</div>
          <div className="text-[10px] text-[#94A3B8]">Destination Port</div>
        </div>
      </div>

      {/* NAT Translation Table */}
      <div className="p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl space-y-2">
        <div className="text-xs font-bold text-white">Router NAT State Table:</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="text-[#94A3B8] border-b border-[#252B36]">
              <tr>
                <th className="py-2">Protocol</th>
                <th className="py-2">Inside Local (Private)</th>
                <th className="py-2">Inside Global (Public)</th>
                <th className="py-2">Outside Global</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              <tr className="border-b border-[#1E2330]">
                <td className="py-2 text-[#5B7CFF]">TCP</td>
                <td className="py-2">192.168.1.10:54321</td>
                <td className="py-2 text-[#22C55E]">203.0.113.5:12045</td>
                <td className="py-2">93.184.216.34:443</td>
              </tr>
              <tr>
                <td className="py-2 text-[#5B7CFF]">TCP</td>
                <td className="py-2">192.168.1.15:54322</td>
                <td className="py-2 text-[#22C55E]">203.0.113.5:12046</td>
                <td className="py-2">142.250.190.46:80</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
