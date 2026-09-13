import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, 
  Router, 
  Globe, 
  Server, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Network, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Radio, 
  Cpu, 
  Mail, 
  FolderSync, 
  Download, 
  Cloud, 
  HardDrive, 
  Terminal, 
  FileText, 
  Zap, 
  Eye, 
  EyeOff, 
  Send 
} from 'lucide-react';
import { 
  DHCPDORASimulator, 
  SubnetCalculatorSimulator, 
  RouterCLISimulator, 
  HTTPBuilderSimulator, 
  SSHTelnetSimulator, 
  DNSLookupSimulator, 
  IPv4HeaderSimulator 
} from './ModuleSimulators';
import { 
  NetworkHeroVisualizer, 
  RoutingGraphVisualizer, 
  IPv6Visualizer, 
  TCPHandshakeSimulator, 
  TCPCongestionSimulator, 
  ARPAnimationSimulator, 
  NATVisualizer 
} from './InteractiveSimulatorsSuite';

// ============================================================================
// 1. QoS TRAFFIC SHAPING VISUALIZER (u3_m3)
// Interactive comparison between Leaky Bucket & Token Bucket algorithms
// ============================================================================
export const QoSTrafficVisualizer: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'leaky' | 'token'>('token');
  const [tokens, setTokens] = useState<number>(6);
  const maxTokens = 10;
  const [queue, setQueue] = useState<number[]>([]);
  const [transmitted, setTransmitted] = useState<number>(0);
  const [dropped, setDropped] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  // Periodic token regeneration for Token Bucket
  useEffect(() => {
    if (algorithm !== 'token') return;
    const interval = setInterval(() => {
      setTokens(prev => Math.min(maxTokens, prev + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [algorithm]);

  // Queue drain logic
  useEffect(() => {
    const drainInterval = setInterval(() => {
      if (algorithm === 'leaky') {
        // Leaky bucket drips at a strictly constant rate (1 packet per tick)
        setQueue(prev => {
          if (prev.length === 0) return prev;
          setTransmitted(t => t + 1);
          return prev.slice(1);
        });
      } else {
        // Token bucket: transmits packets immediately if tokens exist
        setQueue(prev => {
          if (prev.length === 0) return prev;
          if (tokens > 0) {
            setTokens(tok => Math.max(0, tok - 1));
            setTransmitted(t => t + 1);
            return prev.slice(1);
          }
          return prev;
        });
      }
    }, 900);
    return () => clearInterval(drainInterval);
  }, [algorithm, tokens]);

  const handleSendBurst = (count: number) => {
    const newPackets = Array.from({ length: count }, () => Math.floor(Math.random() * 900) + 100);
    const capacity = 8;
    setQueue(prev => {
      const combined = [...prev, ...newPackets];
      if (combined.length > capacity) {
        const excess = combined.length - capacity;
        setDropped(d => d + excess);
        return combined.slice(0, capacity);
      }
      return combined;
    });
  };

  const handleReset = () => {
    setQueue([]);
    setTokens(6);
    setTransmitted(0);
    setDropped(0);
  };

  return (
    <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              QoS Traffic Shaping Engine
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            {algorithm === 'leaky' ? 'Leaky Bucket (Constant Rate Police)' : 'Token Bucket (Bursty Shaper)'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => { setAlgorithm('token'); handleReset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                algorithm === 'token'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Token Bucket
            </button>
            <button
              onClick={() => { setAlgorithm('leaky'); handleReset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                algorithm === 'leaky'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Leaky Bucket
            </button>
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            title="Reset simulation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Interactive Controls & Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Queue Buffer</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {queue.length} / 8 <span className="text-xs text-slate-400 font-normal">pkts</span>
          </div>
        </div>
        {algorithm === 'token' && (
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80">
            <div className="text-[10px] uppercase font-mono font-bold text-blue-600 dark:text-blue-400">Available Tokens</div>
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {tokens} / {maxTokens} <span className="text-xs text-blue-400 font-normal">tokens</span>
            </div>
          </div>
        )}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80">
          <div className="text-[10px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400">Shaped Outflow</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {transmitted} <span className="text-xs text-emerald-500 font-normal">pkts</span>
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80">
          <div className="text-[10px] uppercase font-mono font-bold text-rose-600 dark:text-rose-400">Dropped Packets</div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
            {dropped} <span className="text-xs text-rose-400 font-normal">pkts</span>
          </div>
        </div>
      </div>

      {/* Visual Simulation Canvas */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden border border-slate-800 min-h-[220px] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Inflow Source</span>
          <span>{algorithm === 'leaky' ? 'Bucket Hole (Rate Limiter)' : 'Token Permission Gate'}</span>
          <span>Network Output</span>
        </div>

        {/* Bucket Graphics */}
        <div className="grid grid-cols-3 gap-4 items-center py-6">
          {/* Incoming Packet Stream */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <Zap size={22} />
            </div>
            <span className="text-xs font-semibold text-slate-300">Burst Generator</span>
          </div>

          {/* Central Bucket Vessel */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-36 h-28 border-2 border-dashed border-slate-600 rounded-b-2xl p-2 flex flex-col justify-end bg-slate-800/50 relative overflow-hidden">
              {/* Level indicator */}
              <div 
                className={`w-full transition-all duration-300 rounded-b-xl ${
                  algorithm === 'leaky' ? 'bg-blue-500/40 border-t border-blue-400' : 'bg-emerald-500/40 border-t border-emerald-400'
                }`}
                style={{ height: `${(queue.length / 8) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-slate-300">
                {queue.length > 0 ? `${queue.length} in Queue` : 'Empty Queue'}
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              {algorithm === 'leaky' ? 'Strict Constant Leak' : `Tokens: ${tokens}/${maxTokens}`}
            </div>
          </div>

          {/* Outflow Line */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={22} />
            </div>
            <span className="text-xs font-semibold text-slate-300">Shaped Network Link</span>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-400">Inject traffic spikes to test buffer overflow & pacing:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendBurst(2)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              +2 Packets
            </button>
            <button
              onClick={() => handleSendBurst(5)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              +5 Burst Spike
            </button>
            <button
              onClick={() => handleSendBurst(9)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Overflow Surge (+9)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. IPv4 vs IPv6 COMPARISON VISUALIZER (u3_m4)
// Interactive comparison of 32-bit vs 128-bit headers & addressing
// ============================================================================
export const IPv4IPv6Visualizer: React.FC = () => {
  const [activeStandard, setActiveStandard] = useState<'ipv4' | 'ipv6'>('ipv4');
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  const ipv4Fields = [
    { name: 'Version (4 bits)', desc: 'Identifies packet as IPv4 (value 0100).' },
    { name: 'IHL (4 bits)', desc: 'Internet Header Length in 32-bit words (min 5, max 15).' },
    { name: 'Type of Service / DSCP (8 bits)', desc: 'QoS priority marking and congestion notifications.' },
    { name: 'Total Length (16 bits)', desc: 'Entire packet size including header and payload in bytes (max 65,535).' },
    { name: 'Identification (16 bits)', desc: 'Unique sequence ID used for reassembling fragmented datagrams.' },
    { name: 'Flags (3 bits)', desc: 'Control flags: Reserved (0), Don\'t Fragment (DF), More Fragments (MF).' },
    { name: 'Fragment Offset (13 bits)', desc: 'Relative position of fragment data in original datagram in 8-byte units.' },
    { name: 'Time to Live - TTL (8 bits)', desc: 'Hop limit counter decremented by each router to eliminate loops.' },
    { name: 'Protocol (8 bits)', desc: 'Upper-layer protocol (1=ICMP, 6=TCP, 17=UDP).' },
    { name: 'Header Checksum (16 bits)', desc: 'One\'s complement checksum of header fields (recomputed at every hop).' },
    { name: 'Source IP Address (32 bits)', desc: 'Origin host IPv4 address (e.g., 192.168.1.45).' },
    { name: 'Destination IP Address (32 bits)', desc: 'Target host IPv4 address (e.g., 142.250.190.46).' }
  ];

  const ipv6Fields = [
    { name: 'Version (4 bits)', desc: 'Identifies packet as IPv6 (value 0110).' },
    { name: 'Traffic Class (8 bits)', desc: 'Equivalent to IPv4 DSCP for QoS classification.' },
    { name: 'Flow Label (20 bits)', desc: 'Identifies specific packet flow for non-default router QoS routing.' },
    { name: 'Payload Length (16 bits)', desc: 'Size of payload in bytes following the fixed 40-byte base header.' },
    { name: 'Next Header (8 bits)', desc: 'Specifies protocol or chained extension header (TCP, UDP, Routing, Hop-by-Hop).' },
    { name: 'Hop Limit (8 bits)', desc: 'Replaces TTL: decremented at every router, dropped when 0.' },
    { name: 'Source IPv6 Address (128 bits)', desc: '128-bit origin host address (e.g., 2001:0db8:85a3::8a2e:0370:7334).' },
    { name: 'Destination IPv6 Address (128 bits)', desc: '128-bit destination host address.' }
  ];

  return (
    <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Header Architecture Comparator
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            {activeStandard === 'ipv4' ? 'IPv4 Header Structure (20-60 Bytes)' : 'IPv6 Streamlined Header (40 Bytes Fixed)'}
          </h3>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveStandard('ipv4')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStandard === 'ipv4'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            IPv4 Standard
          </button>
          <button
            onClick={() => setActiveStandard('ipv6')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStandard === 'ipv6'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            IPv6 Next-Gen
          </button>
        </div>
      </div>

      {/* Comparison Metrics Pill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase text-slate-400 block font-bold">Address Space</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {activeStandard === 'ipv4' ? '32 bits (~4.3 Billion)' : '128 bits (~3.4×10³⁸)'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase text-slate-400 block font-bold">Base Header Size</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {activeStandard === 'ipv4' ? '20 Bytes (up to 60 with options)' : '40 Bytes Fixed'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase text-slate-400 block font-bold">Header Checksum</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {activeStandard === 'ipv4' ? 'Present (Recomputed at every hop)' : 'Eliminated (Faster Forwarding)'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase text-slate-400 block font-bold">Fragmentation</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {activeStandard === 'ipv4' ? 'Routers & Sending Host' : 'Source Host Only (PMTU)'}
          </span>
        </div>
      </div>

      {/* Interactive Field Blocks */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Hover or click any header field below to inspect its operational role:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(activeStandard === 'ipv4' ? ipv4Fields : ipv6Fields).map((field, idx) => {
            const isHovered = hoveredField === field.name;
            return (
              <button
                key={idx}
                onMouseEnter={() => setHoveredField(field.name)}
                onClick={() => setHoveredField(field.name)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs truncate">{field.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Field Detail Callout */}
      <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
        <div className="font-bold text-blue-900 dark:text-blue-200">
          {hoveredField || (activeStandard === 'ipv4' ? 'Version (4 bits)' : 'Version (4 bits)')}
        </div>
        <div className="text-blue-800 dark:text-blue-300 mt-1">
          {(activeStandard === 'ipv4' ? ipv4Fields : ipv6Fields).find(f => f.name === hoveredField)?.desc ||
            'Hover over any block above to inspect bit offsets and RFC protocol definition.'}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. NETWORK HELPERS UNIFIED HUB (u3_m7)
// Dynamic tabs for DHCP (DORA), ARP, NAT, and ICMP Ping
// ============================================================================
export const NetworkHelpersHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dhcp' | 'arp' | 'nat'>('dhcp');

  return (
    <div className="space-y-4">
      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('dhcp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dhcp'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          DHCP (DORA Handshake)
        </button>
        <button
          onClick={() => setActiveTab('arp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'arp'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          ARP (IP to MAC Mapping)
        </button>
        <button
          onClick={() => setActiveTab('nat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'nat'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          NAT / PAT (Port Address Translation)
        </button>
      </div>

      {/* Render selected helper component */}
      {activeTab === 'dhcp' && <DHCPDORASimulator />}
      {activeTab === 'arp' && <ARPAnimationSimulator />}
      {activeTab === 'nat' && <NATVisualizer />}
    </div>
  );
};

// ============================================================================
// 4. TRANSPORT LAYER PORT ADDRESSING & MULTIPLEXING (u4_m1)
// Demonstrates socket 4-tuples and multiplexing / demultiplexing
// ============================================================================
export const PortAddressingVisualizer: React.FC = () => {
  const [selectedSocket, setSelectedSocket] = useState<number>(0);
  const sockets = [
    { clientPort: 52410, app: 'Chrome (HTTP/2 Web)', destPort: 443, destService: 'HTTPS Server', color: '#3B82F6' },
    { clientPort: 52411, app: 'Spotify Audio Stream', destPort: 4070, destService: 'Media Edge', color: '#10B981' },
    { clientPort: 52412, app: 'VS Code SSH Terminal', destPort: 22, destService: 'SSH Daemon', color: '#8B5CF6' }
  ];

  return (
    <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Transport Multiplexing & Sockets
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            Process-to-Process Socket Delivery
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Client IP: 192.168.1.45 • Single NIC
        </div>
      </div>

      {/* Socket Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sockets.map((sock, idx) => {
          const isSelected = selectedSocket === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedSocket(idx)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-xs font-semibold">{sock.app}</div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                Port {sock.clientPort} → {sock.destPort}
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual Pipeline */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-6">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Client OS Processes</span>
          <span className="text-emerald-400">L4 Multiplexing / Demux</span>
          <span>Remote Servers</span>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center py-4">
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-center">
            <Laptop className="w-8 h-8 mx-auto text-blue-400 mb-2" />
            <div className="text-xs font-bold">{sockets[selectedSocket].app}</div>
            <div className="text-[10px] font-mono text-blue-400 mt-0.5">
              Ephemeral Port: {sockets[selectedSocket].clientPort}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Socket 4-Tuple Match
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-center">
            <Server className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
            <div className="text-xs font-bold">{sockets[selectedSocket].destService}</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
              Well-Known Port: {sockets[selectedSocket].destPort}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
          <span className="text-emerald-400 font-bold">Unique Socket Pair: </span>
          (192.168.1.45:{sockets[selectedSocket].clientPort} ⇄ 142.250.190.46:{sockets[selectedSocket].destPort})
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. RELIABLE PROTOCOLS SLIDING WINDOW (u4_m2)
// Compares Stop-and-Wait, Go-Back-N (GBN), and Selective Repeat (SR)
// ============================================================================
export const ReliableProtocolsVisualizer: React.FC = () => {
  const [protocol, setProtocol] = useState<'saw' | 'gbn' | 'sr'>('gbn');
  const [sentWindow, setSentWindow] = useState<number[]>([0, 1, 2, 3]);
  const [acked, setAcked] = useState<number[]>([0]);
  const [lostPacket, setLostPacket] = useState<number | null>(2);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const windowSize = protocol === 'saw' ? 1 : 4;

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      if (protocol === 'gbn') {
        // GBN: if packet 2 is lost, packets 2, 3 must be retransmitted
        setAcked([0, 1]);
      } else if (protocol === 'sr') {
        // SR: packet 2 is retransmitted individually, packet 3 is buffered
        setAcked([0, 1, 3]);
      } else {
        setAcked([0]);
      }
      setIsSimulating(false);
    }, 1200);
  };

  const handleReset = () => {
    setSentWindow(protocol === 'saw' ? [0] : [0, 1, 2, 3]);
    setAcked([]);
    setLostPacket(2);
  };

  return (
    <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Reliable Data Transfer Engine
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            {protocol === 'saw' && 'Stop-and-Wait (Window = 1)'}
            {protocol === 'gbn' && 'Go-Back-N (Cumulative ACKs)'}
            {protocol === 'sr' && 'Selective Repeat (Individual Buffers)'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => { setProtocol('saw'); handleReset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                protocol === 'saw' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              Stop & Wait
            </button>
            <button
              onClick={() => { setProtocol('gbn'); handleReset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                protocol === 'gbn' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              Go-Back-N
            </button>
            <button
              onClick={() => { setProtocol('sr'); handleReset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                protocol === 'sr' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              Selective Repeat
            </button>
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Protocol Specs Matrix */}
      <div className="grid grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase text-slate-400 block font-bold">Sender Window</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {protocol === 'saw' ? 'N = 1' : 'N = 4'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase text-slate-400 block font-bold">Receiver Window</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {protocol === 'saw' ? '1 (Wait for ACK)' : protocol === 'gbn' ? '1 (Discard out-of-order)' : 'N = 4 (Buffered)'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase text-slate-400 block font-bold">Min Sequence Space</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {protocol === 'saw' ? '2 (1 bit: 0 or 1)' : protocol === 'gbn' ? 'N + 1 (5 numbers)' : '2 * N (8 numbers)'}
          </span>
        </div>
      </div>

      {/* Pipeline Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-6">
        <div className="text-xs font-mono text-slate-400">
          Packet Transmission Sequence (Frame 2 set to simulate transmission loss):
        </div>

        {/* Frames Sequence Array */}
        <div className="grid grid-cols-6 gap-2">
          {[0, 1, 2, 3, 4, 5].map((pkt) => {
            const isAcked = acked.includes(pkt);
            const isLost = lostPacket === pkt;
            const inWindow = pkt < windowSize;

            return (
              <div
                key={pkt}
                className={`p-3 rounded-xl border text-center font-mono ${
                  isAcked
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                    : isLost
                    ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse'
                    : inWindow
                    ? 'bg-blue-950/60 border-blue-500 text-blue-400'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <div className="text-sm font-bold">Pkt {pkt}</div>
                <div className="text-[10px] mt-1">
                  {isAcked ? 'ACKed' : isLost ? 'LOST!' : inWindow ? 'In-Flight' : 'Pending'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            {protocol === 'gbn' && 'In GBN: Packet 2 loss forces discarding Packet 3 and retransmitting from 2.'}
            {protocol === 'sr' && 'In SR: Packet 3 is kept in receiver buffer; only Packet 2 is retransmitted.'}
            {protocol === 'saw' && 'In Stop-and-Wait: Only 1 unacknowledged packet is permitted in the pipe.'}
          </div>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
          >
            {isSimulating ? 'Transmitting...' : 'Simulate Packet Loss'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. UDP DATAGRAM VISUALIZER (u4_m3)
// 8-byte fixed header inspect & low latency fire-and-forget streaming
// ============================================================================
export const UDPDatagramVisualizer: React.FC = () => {
  const [streamActive, setStreamActive] = useState<boolean>(true);
  const [datagramCount, setDatagramCount] = useState<number>(342);

  useEffect(() => {
    if (!streamActive) return;
    const interval = setInterval(() => {
      setDatagramCount(c => c + 1);
    }, 800);
    return () => clearInterval(interval);
  }, [streamActive]);

  return (
    <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              User Datagram Protocol (UDP)
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            8-Byte Fixed Header & Datagram Streaming
          </h3>
        </div>

        <button
          onClick={() => setStreamActive(!streamActive)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-2"
        >
          {streamActive ? <Pause size={14} /> : <Play size={14} />}
          <span>{streamActive ? 'Pause Stream' : 'Resume Stream'}</span>
        </button>
      </div>

      {/* 8-Byte Header Layout Diagram */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          UDP Header Structure (Exactly 64 Bits = 8 Bytes)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">
            Source Port (16b)
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
            Destination Port (16b)
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">
            Length (16b)
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
            Checksum (16b)
          </div>
        </div>
      </div>

      {/* Live Streaming Monitor */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-mono">Real-Time Voice/Video Datagram Counter</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
            {datagramCount} <span className="text-xs text-slate-400 font-normal">datagrams transmitted</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 max-w-xs text-right">
          Zero handshake latency (0-RTT), no head-of-line blocking, ideal for DNS (port 53) and VoIP.
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. FTP DUAL-CHANNEL ARCHITECTURE VISUALIZER (u5_m2)
// Demonstrates Control Channel (Port 21) vs Data Channel (Port 20)
// ============================================================================
export const FTPSimulator: React.FC = () => {
  const [ftpMode, setFtpMode] = useState<'active' | 'passive'>('passive');
  const [currentAction, setCurrentAction] = useState<string>('Connected to Port 21 (Control)');

  return (
    <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              FTP Dual-Channel Architecture
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            Control Connection vs Data Connection
          </h3>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setFtpMode('passive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              ftpMode === 'passive' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            Passive FTP (PASV)
          </button>
          <button
            onClick={() => setFtpMode('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              ftpMode === 'active' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            Active FTP (PORT)
          </button>
        </div>
      </div>

      {/* Visual Dual-Channel Blueprint */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-6">
        <div className="grid grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Laptop className="w-6 h-6 text-blue-400" />
              <span className="text-xs font-bold font-mono">FTP Client (Host)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono space-y-1">
              <div>Control Port: 51200</div>
              <div>Data Port: {ftpMode === 'active' ? '51201 (Listening)' : '51202 (Outbound)'}</div>
            </div>
          </div>

          <div className="space-y-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs font-bold font-mono">FTP Server</span>
              <Server className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono space-y-1">
              <div>Port 21: Command Control</div>
              <div>{ftpMode === 'active' ? 'Port 20: Server Connects' : 'Port 60124: Ephemeral PASV'}</div>
            </div>
          </div>
        </div>

        {/* Channels Diagram */}
        <div className="space-y-3">
          {/* Channel 1: Control (Port 21) */}
          <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-600/60 flex items-center justify-between text-xs font-mono">
            <span className="text-blue-300 font-bold">1. Control Channel (Port 21, Persistent)</span>
            <span className="text-blue-400">USER, PASS, LIST, RETR, QUIT</span>
          </div>

          {/* Channel 2: Data (Port 20 / PASV) */}
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-600/60 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-300 font-bold">2. Data Channel ({ftpMode === 'active' ? 'Port 20 Active' : 'Ephemeral Passive'})</span>
            <span className="text-amber-400">Opened per file / listing, then closed</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Status: {currentAction} • {ftpMode === 'passive' ? 'Firewall-friendly outbound connection initiated by client.' : 'Active mode server initiates connection to client port (blocked by NAT).' }
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. EMAIL PROTOCOLS ARCHITECTURE (u5_m3)
// SMTP (Push) vs POP3 / IMAP (Pull)
// ============================================================================
export const EmailProtocolsVisualizer: React.FC = () => {
  const [selectedMailProto, setSelectedMailProto] = useState<'pop3' | 'imap'>('imap');

  return (
    <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Email Protocol Architecture
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            SMTP (Push) vs POP3 / IMAP (Pull)
          </h3>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setSelectedMailProto('imap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMailProto === 'imap' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            IMAP (Multi-Device Sync)
          </button>
          <button
            onClick={() => setSelectedMailProto('pop3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMailProto === 'pop3' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            POP3 (Download & Delete)
          </button>
        </div>
      </div>

      {/* Pipeline Diagram */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-6">
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
            <Laptop className="w-6 h-6 mx-auto text-blue-400 mb-1" />
            <div className="font-bold">Sender Client</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
            <Server className="w-6 h-6 mx-auto text-purple-400 mb-1" />
            <div className="font-bold">Sender Mail Server</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
            <Server className="w-6 h-6 mx-auto text-purple-400 mb-1" />
            <div className="font-bold">Recipient Server</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
            <Laptop className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
            <div className="font-bold">Recipient Client</div>
          </div>
        </div>

        {/* Protocols Sequence */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/50 flex items-center justify-between">
            <span className="text-purple-300">Step 1 & 2: Push via SMTP (Port 25 / 587)</span>
            <span className="text-purple-400">Client → Sender MTA → Recipient MTA</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between">
            <span className="text-emerald-300">
              Step 3: Pull via {selectedMailProto.toUpperCase()} (Port {selectedMailProto === 'imap' ? '143' : '110'})
            </span>
            <span className="text-emerald-400">
              {selectedMailProto === 'imap' ? 'Central mailbox sync across devices' : 'Downloaded to local disk, deleted on server'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
