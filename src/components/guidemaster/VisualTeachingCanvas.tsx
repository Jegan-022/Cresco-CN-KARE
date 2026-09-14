import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Network, 
  Search,
  Code2
} from 'lucide-react';

export type VisualDiagramType = 
  | 'tcp-handshake' 
  | 'binary-search' 
  | 'packet-encapsulation' 
  | 'routing-table'
  | 'dns-flow';

interface VisualTeachingCanvasProps {
  diagramType: VisualDiagramType;
  topicTitle?: string;
  onStepChange?: (step: number, stepDescription: string) => void;
  className?: string;
}

export const VisualTeachingCanvas: React.FC<VisualTeachingCanvasProps> = ({
  diagramType,
  topicTitle,
  onStepChange,
  className = '',
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-step timer when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % 4;
        return next;
      });
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Notify parent on step change
  useEffect(() => {
    if (onStepChange) {
      const descriptions: Record<VisualDiagramType, string[]> = {
        'tcp-handshake': [
          'Step 1: Client sends SYN (seq=100) to synchronize sequence numbers.',
          'Step 2: Server responds with SYN-ACK (seq=300, ack=101) confirming connection.',
          'Step 3: Client replies with ACK (seq=101, ack=301). Connection established!',
          'State: ESTABLISHED — Full-duplex reliable data transmission begins.'
        ],
        'binary-search': [
          'Initial Array: [2, 5, 8, 12, 16, 23, 38, 56, 72]. Target = 23. Low=0, High=8.',
          'Step 1: Calculate Mid = (0+8)/2 = 4 (value: 16). 23 > 16, discard left half.',
          'Step 2: Low=5, High=8. Mid = (5+8)/2 = 6 (value: 38). 23 < 38, discard right half.',
          'Step 3: Low=5, High=5. Mid=5 (value: 23). Match found in exactly 3 steps!'
        ],
        'packet-encapsulation': [
          'Application Layer: HTTP GET request created as raw user payload.',
          'Transport Layer: TCP header added with Source & Destination ports (80/443).',
          'Network Layer: IP header prepended with Source & Destination IP addresses.',
          'Data Link Layer: Ethernet frame header & FCS trailer appended for wire delivery.'
        ],
        'routing-table': [
          'Incoming Packet arrives with Destination IP: 192.168.1.45',
          'Lookup: Longest Prefix Match against routing table entries.',
          'Match: 192.168.1.0/24 matches interface eth0 with Next Hop 10.0.0.1.',
          'Forwarding: Packet queued and transmitted via outbound interface eth0.'
        ],
        'dns-flow': [
          'Client queries Local Recursive Resolver for domain cresco.org',
          'Resolver queries Root DNS Server (.) -> receives .org TLD server IP',
          'Resolver queries TLD Server (.org) -> receives Authoritative Nameserver IP',
          'Authoritative DNS Server returns IPv4 address A Record: 198.51.100.12'
        ]
      };
      const desc = descriptions[diagramType]?.[activeStep] || '';
      onStepChange(activeStep, desc);
    }
  }, [activeStep, diagramType, onStepChange]);

  // 1. TCP 3-Way Handshake Interactive Visualizer
  const renderTcpHandshake = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-on-surface-variant px-2">
        <span className="flex items-center gap-1.5 text-primary">
          <Cpu size={14} /> CLIENT (Browser)
        </span>
        <span className="text-[11px] text-outline font-sans">
          State: {activeStep === 0 ? 'CLOSED → SYN_SENT' : activeStep === 1 ? 'SYN_SENT' : activeStep === 2 ? 'ESTABLISHED' : 'ESTABLISHED (READY)'}
        </span>
        <span className="flex items-center gap-1.5 text-secondary">
          <Network size={14} /> SERVER (Web Host)
        </span>
      </div>

      {/* Handshake Flow Chart */}
      <div className="relative h-44 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 flex flex-col justify-between overflow-hidden">
        {/* Step 1: SYN */}
        <div className={`relative flex items-center justify-between transition-all duration-300 ${activeStep >= 0 ? 'opacity-100' : 'opacity-20'}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <div className="flex-1 mx-3 border-t-2 border-dashed border-primary/60 relative flex items-center justify-center">
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold ${activeStep === 0 ? 'animate-pulse ring-1 ring-primary' : ''}`}>
              SYN [Seq = 100, CTL=SYN] ➔
            </span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-outline-variant" />
        </div>

        {/* Step 2: SYN-ACK */}
        <div className={`relative flex items-center justify-between transition-all duration-300 ${activeStep >= 1 ? 'opacity-100' : 'opacity-20'}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-outline-variant" />
          <div className="flex-1 mx-3 border-t-2 border-dashed border-secondary/60 relative flex items-center justify-center">
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded bg-secondary/10 text-secondary font-bold ${activeStep === 1 ? 'animate-pulse ring-1 ring-secondary' : ''}`}>
              ◀ SYN-ACK [Seq = 300, Ack = 101]
            </span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
        </div>

        {/* Step 3: ACK */}
        <div className={`relative flex items-center justify-between transition-all duration-300 ${activeStep >= 2 ? 'opacity-100' : 'opacity-20'}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div className="flex-1 mx-3 border-t-2 border-dashed border-emerald-500/60 relative flex items-center justify-center">
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold ${activeStep === 2 ? 'animate-pulse ring-1 ring-emerald-500' : ''}`}>
              ACK [Seq = 101, Ack = 301] ➔
            </span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>

        {/* Connection Ready Badge */}
        {activeStep >= 2 && (
          <div className="absolute inset-x-0 bottom-1 flex items-center justify-center pointer-events-none animate-in fade-in">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-md">
              <CheckCircle2 size={12} /> TCP Socket Connection Established
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // 2. Binary Search Array Visualizer
  const renderBinarySearch = () => {
    const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72];
    const low = activeStep === 0 ? 0 : activeStep === 1 ? 5 : 5;
    const high = activeStep === 0 ? 8 : activeStep === 1 ? 8 : 5;
    const mid = activeStep === 0 ? 4 : activeStep === 1 ? 6 : 5;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-on-surface">Target Value: <span className="text-primary font-black">23</span></span>
          <span className="text-outline">Comparisons: {activeStep + 1} / 3 (O(log N))</span>
        </div>

        <div className="h-36 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 flex flex-col justify-center gap-3 overflow-x-auto">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {arr.map((val, idx) => {
              const isMatch = val === 23 && activeStep >= 2;
              const isMid = idx === mid;
              const isOutOfRange = idx < low || idx > high;

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-outline">[{idx}]</span>
                  <div
                    className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm border-2 transition-all duration-300 ${
                      isMatch
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-110 shadow-md animate-pulse'
                        : isMid
                        ? 'bg-primary text-white border-primary-container scale-105 shadow-sm'
                        : isOutOfRange
                        ? 'bg-surface-container/40 text-outline border-transparent opacity-40 line-through'
                        : 'bg-surface-container text-on-surface border-outline-variant/40'
                    }`}
                  >
                    {val}
                  </div>
                  {isMid && (
                    <span className="text-[9px] font-bold text-primary uppercase font-mono">
                      Mid
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 3. Packet Encapsulation Layer Visualizer
  const renderEncapsulation = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-bold text-on-surface flex items-center gap-1.5">
          <Layers size={14} className="text-primary" /> Protocol Data Unit (PDU)
        </span>
        <span className="text-outline text-[11px]">Wire Frame Assembly</span>
      </div>

      <div className="h-40 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 flex flex-col justify-center gap-2">
        {/* Layer 4: Application */}
        <div className="flex items-center gap-2">
          <span className="w-20 text-[10px] font-bold font-mono text-outline">L7 App:</span>
          <div className="flex-1 py-1 px-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold truncate">
            HTTP Payload: GET /index.html HTTP/1.1
          </div>
        </div>

        {/* Layer 3: Transport */}
        <div className={`flex items-center gap-2 transition-all duration-300 ${activeStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
          <span className="w-20 text-[10px] font-bold font-mono text-outline">L4 Trans:</span>
          <div className="flex-1 flex gap-1.5">
            <span className="py-1 px-2 rounded-lg bg-primary/10 border border-primary/30 text-primary font-mono text-[11px] font-bold">
              TCP [Sport: 54120, Dport: 443]
            </span>
            <span className="py-1 px-2 rounded-lg bg-surface-container text-outline text-[11px] font-mono truncate">
              + Payload
            </span>
          </div>
        </div>

        {/* Layer 2: Network */}
        <div className={`flex items-center gap-2 transition-all duration-300 ${activeStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
          <span className="w-20 text-[10px] font-bold font-mono text-outline">L3 Net:</span>
          <div className="flex-1 flex gap-1.5">
            <span className="py-1 px-2 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary font-mono text-[11px] font-bold">
              IP [Src: 192.168.1.5, Dst: 104.21.3.2]
            </span>
            <span className="py-1 px-2 rounded-lg bg-surface-container text-outline text-[11px] font-mono truncate">
              + TCP Seg
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`rounded-2xl bg-surface-container border border-outline-variant/40 p-4 space-y-3 select-none ${className}`}>
      {/* Top Diagram Header with Step Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <h4 className="font-headline text-xs font-bold text-on-surface uppercase tracking-wider">
            {topicTitle || diagramType.replace('-', ' ').toUpperCase()} VISUALIZER
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-surface-container-lowest text-primary hover:bg-primary hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Play size={10} className={isPlaying ? 'animate-spin' : ''} />
            <span>{isPlaying ? 'Pause' : 'Auto-Play'}</span>
          </button>
          <button
            onClick={() => setActiveStep((s) => (s + 1) % 4)}
            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Next</span>
            <ArrowRight size={10} />
          </button>
          <button
            onClick={() => { setActiveStep(0); setIsPlaying(false); }}
            className="p-1 rounded-lg text-outline hover:text-on-surface transition-colors cursor-pointer"
            title="Reset Diagram"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Main Diagram Render */}
      {diagramType === 'tcp-handshake' && renderTcpHandshake()}
      {diagramType === 'binary-search' && renderBinarySearch()}
      {diagramType === 'packet-encapsulation' && renderEncapsulation()}
      {diagramType === 'routing-table' && renderEncapsulation()}
      {diagramType === 'dns-flow' && renderTcpHandshake()}
    </div>
  );
};
