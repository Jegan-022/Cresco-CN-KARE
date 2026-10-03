import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Layers, 
  Radio, 
  Sliders, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Globe, 
  Server, 
  Laptop, 
  Zap, 
  FileCode, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { CrescoMascot } from '../brand/CrescoMascot';

interface AnimatedLearningViewProps {
  onNavigateHome?: () => void;
}

type SimulationTopic = 'tcp-handshake' | 'osi-encapsulation' | 'csmacd-collision' | 'sliding-window' | 'dns-resolution';

export const AnimatedLearningView: React.FC<AnimatedLearningViewProps> = ({ onNavigateHome }) => {
  const [activeTopic, setActiveTopic] = useState<SimulationTopic>('tcp-handshake');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showPacketDetails, setShowPacketDetails] = useState<boolean>(true);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Topics Metadata
  const topics = [
    {
      id: 'tcp-handshake' as SimulationTopic,
      title: 'TCP 3-Way Handshake & Teardown',
      category: 'Transport Layer',
      rfc: 'RFC 793',
      description: 'Interactive visualization of SYN, SYN-ACK, ACK connection establishment and graceful 4-way FIN termination.',
      totalSteps: 6,
    },
    {
      id: 'osi-encapsulation' as SimulationTopic,
      title: '7-Layer Protocol Encapsulation',
      category: 'OSI & TCP/IP Model',
      rfc: 'ISO/IEC 7498-1',
      description: 'Watch raw Application data get encapsulated layer-by-layer with L4, L3, and L2 headers, then decapsulated on arrival.',
      totalSteps: 7,
    },
    {
      id: 'csmacd-collision' as SimulationTopic,
      title: 'CSMA/CD & Collision Backoff',
      category: 'Data Link Layer',
      rfc: 'IEEE 802.3',
      description: 'Carrier sense multi-access with collision detection, jamming signal broadcast, and binary exponential backoff timer.',
      totalSteps: 5,
    },
    {
      id: 'sliding-window' as SimulationTopic,
      title: 'Sliding Window (Go-Back-N)',
      category: 'Flow & Error Control',
      rfc: 'ARQ Protocols',
      description: 'Dynamic pipelined transmission window sliding forward as cumulative ACKs arrive, handling packet loss and timeouts.',
      totalSteps: 6,
    },
    {
      id: 'dns-resolution' as SimulationTopic,
      title: 'DNS Resolution Journey',
      category: 'Application Layer',
      rfc: 'RFC 1034 / 1035',
      description: 'Step through recursive and iterative DNS queries from Client Browser to Root (.), TLD (.in), and Authoritative Servers.',
      totalSteps: 5,
    },
  ];

  const currentTopicData = topics.find((t) => t.id === activeTopic) || topics[0];

  // Stop playback when changing topics
  useEffect(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
  }, [activeTopic]);

  // Handle Play/Pause Auto-Play
  useEffect(() => {
    if (isPlaying) {
      const stepDuration = 2200 / speedMultiplier;
      animationTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= currentTopicData.totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          try {
            soundFx.playClick();
          } catch {}
          return prev + 1;
        });
      }, stepDuration);
    } else {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    }
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [isPlaying, speedMultiplier, currentTopicData.totalSteps]);

  const handleStepForward = () => {
    try {
      soundFx.playClick();
    } catch {}
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(currentTopicData.totalSteps - 1, prev + 1));
  };

  const handleStepBackward = () => {
    try {
      soundFx.playClick();
    } catch {}
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    try {
      soundFx.playClick();
    } catch {}
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleTogglePlay = () => {
    try {
      soundFx.playClick();
    } catch {}
    if (currentStep >= currentTopicData.totalSteps - 1) {
      setCurrentStep(0);
    }
    setIsPlaying((prev) => !prev);
  };

  // Specific simulation step details
  const renderSimulationCanvas = () => {
    switch (activeTopic) {
      case 'tcp-handshake':
        return renderTcpSimulation();
      case 'osi-encapsulation':
        return renderOsiSimulation();
      case 'csmacd-collision':
        return renderCsmaSimulation();
      case 'sliding-window':
        return renderSlidingWindowSimulation();
      case 'dns-resolution':
        return renderDnsSimulation();
      default:
        return renderTcpSimulation();
    }
  };

  // 1. TCP 3-Way Handshake Simulation
  const renderTcpSimulation = () => {
    const stepsInfo = [
      {
        phase: 'Step 1: SYN Packet',
        sender: 'Client (192.168.1.10:49152)',
        receiver: 'Web Server (142.250.190.46:80)',
        flags: 'SYN = 1, ACK = 0',
        seq: '1000',
        ack: '0',
        packetPos: 15,
        stateClient: 'SYN_SENT',
        stateServer: 'LISTEN',
        description: 'Client generates initial sequence number ISN=1000 and sends SYN to request synchronized connection establishment.',
      },
      {
        phase: 'Step 2: SYN-ACK Response',
        sender: 'Web Server (142.250.190.46:80)',
        receiver: 'Client (192.168.1.10:49152)',
        flags: 'SYN = 1, ACK = 1',
        seq: '5000',
        ack: '1001',
        packetPos: 85,
        stateClient: 'SYN_SENT',
        stateServer: 'SYN_RCVD',
        description: 'Server allocates buffer space, generates its own ISN=5000, and acknowledges Client sequence number (Ack = 1000 + 1 = 1001).',
      },
      {
        phase: 'Step 3: ACK Confirmation',
        sender: 'Client (192.168.1.10:49152)',
        receiver: 'Web Server (142.250.190.46:80)',
        flags: 'SYN = 0, ACK = 1',
        seq: '1001',
        ack: '5001',
        packetPos: 35,
        stateClient: 'ESTABLISHED',
        stateServer: 'ESTABLISHED',
        description: 'Client acknowledges Server sequence number (Ack = 5000 + 1 = 5001). The bidirectional reliable TCP socket is now ESTABLISHED!',
      },
      {
        phase: 'Step 4: Application HTTP Data Transfer',
        sender: 'Client (192.168.1.10:49152)',
        receiver: 'Web Server (142.250.190.46:80)',
        flags: 'PSH = 1, ACK = 1',
        seq: '1001',
        ack: '5001',
        payload: 'GET /index.html (384 Bytes)',
        packetPos: 65,
        stateClient: 'ESTABLISHED',
        stateServer: 'ESTABLISHED',
        description: 'Client transmits HTTP GET request payload. Sequence numbers track every single transmitted byte reliably.',
      },
      {
        phase: 'Step 5: Connection Teardown (FIN)',
        sender: 'Client (192.168.1.10:49152)',
        receiver: 'Web Server (142.250.190.46:80)',
        flags: 'FIN = 1, ACK = 1',
        seq: '1385',
        ack: '5001',
        packetPos: 25,
        stateClient: 'FIN_WAIT_1',
        stateServer: 'CLOSE_WAIT',
        description: 'Client finishes transmission and initiates graceful active close with FIN flag.',
      },
      {
        phase: 'Step 6: Final Termination ACK',
        sender: 'Web Server (142.250.190.46:80)',
        receiver: 'Client (192.168.1.10:49152)',
        flags: 'ACK = 1',
        seq: '5001',
        ack: '1386',
        packetPos: 90,
        stateClient: 'TIME_WAIT',
        stateServer: 'CLOSED',
        description: 'Server acknowledges FIN. Both endpoints cleanly flush buffers and terminate socket allocations.',
      },
    ];

    const activeInfo = stepsInfo[currentStep] || stepsInfo[0];

    return (
      <div className="space-y-6">
        {/* Node Wire Representation */}
        <div className="relative py-8 px-4 sm:px-12 bg-slate-900/80 rounded-2xl border border-cyan-500/25 overflow-hidden shadow-inner">
          
          {/* Background Grid Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#06B6D4_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

          {/* Connected Medium Wire */}
          <div className="absolute top-1/2 left-24 right-24 h-1 bg-gradient-to-r from-cyan-500/40 via-teal-400 to-cyan-500/40 -translate-y-1/2 z-0">
            <div className="absolute inset-0 bg-cyan-400/30 blur-xs" />
          </div>

          {/* Interactive Traveling Packet */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-out"
            style={{ left: `${Math.max(12, Math.min(84, (currentStep / (stepsInfo.length - 1)) * 72 + 12))}%` }}
          >
            <div className="relative group cursor-pointer animate-pulse">
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-mono font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.8)] border border-white/60 flex items-center gap-1.5 whitespace-nowrap">
                <Zap size={13} className="fill-slate-950" />
                <span>{activeInfo.flags}</span>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-300 font-bold whitespace-nowrap">
                Seq={activeInfo.seq} Ack={activeInfo.ack}
              </div>
            </div>
          </div>

          {/* Hosts Row */}
          <div className="relative z-10 flex items-center justify-between">
            {/* Client Node */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-cyan-500/50 flex items-center justify-center p-3 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
                <Laptop size={32} />
              </div>
              <div className="text-center">
                <div className="font-bold text-xs text-white">Client Host</div>
                <div className="text-[10px] font-mono text-slate-400">192.168.1.10</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {activeInfo.stateClient}
                </span>
              </div>
            </div>

            {/* Middle Packet Flight Indicator */}
            <div className="hidden md:flex flex-col items-center gap-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Full-Duplex Wire Transmission
              </span>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                <span>RTT ~12ms</span>
                <span>•</span>
                <span>Window=65535</span>
              </div>
            </div>

            {/* Server Node */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-teal-500/50 flex items-center justify-center p-3 text-teal-400 shadow-[0_0_25px_rgba(20,184,166,0.25)]">
                <Server size={32} />
              </div>
              <div className="text-center">
                <div className="font-bold text-xs text-white">Web Server</div>
                <div className="text-[10px] font-mono text-slate-400">142.250.190.46:80</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  {activeInfo.stateServer}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Packet Inspector & Educational Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-xs text-cyan-400 uppercase tracking-wider">
                {activeInfo.phase}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                Step {currentStep + 1} of {stepsInfo.length}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeInfo.description}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="text-slate-400">Source: <strong className="text-slate-200">{activeInfo.sender}</strong></span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-400">Dest: <strong className="text-slate-200">{activeInfo.receiver}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-headline font-bold text-xs text-teal-400 uppercase tracking-wider block">
              Packet Header Inspector
            </span>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Control Flags:</span>
                <span className="text-cyan-300 font-bold">{activeInfo.flags}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Sequence No:</span>
                <span className="text-white font-bold">{activeInfo.seq}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Acknowledgment:</span>
                <span className="text-teal-300 font-bold">{activeInfo.ack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Checksum Status:</span>
                <span className="text-emerald-400 font-bold">Valid (0x7A4C)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. OSI 7-Layer Encapsulation Simulation
  const renderOsiSimulation = () => {
    const layers = [
      { num: 7, name: 'Application', unit: 'Data', header: 'HTTP GET /index.html', color: 'from-purple-500 to-indigo-500' },
      { num: 6, name: 'Presentation', unit: 'Data', header: 'TLS / Encryption / UTF-8', color: 'from-indigo-500 to-blue-500' },
      { num: 5, name: 'Session', unit: 'Data', header: 'RPC / Socket Session Token', color: 'from-blue-500 to-cyan-500' },
      { num: 4, name: 'Transport', unit: 'Segment', header: 'TCP [Src:49152, Dst:80, Seq:100]', color: 'from-cyan-500 to-teal-500' },
      { num: 3, name: 'Network', unit: 'Packet', header: 'IP [Src:192.168.1.10, Dst:142.250.190.46, TTL:64]', color: 'from-teal-500 to-emerald-500' },
      { num: 2, name: 'Data Link', unit: 'Frame', header: 'Ethernet [MAC 00:1A:2B → 50:C7:BF, FCS: CRC32]', color: 'from-emerald-500 to-amber-500' },
      { num: 1, name: 'Physical', unit: 'Bits', header: '01001000 01110100 01110100 01110000 (NRZ Signal)', color: 'from-amber-500 to-rose-500' },
    ];

    const activeLayer = layers[Math.min(currentStep, layers.length - 1)];

    return (
      <div className="space-y-6">
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-cyan-500/25">
          <div className="text-center mb-6">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Encapsulation Stage {currentStep + 1} of 7: Layer {activeLayer.num} ({activeLayer.name})
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Adding Layer {activeLayer.num} Protocol Header to Protocol Data Unit (PDU)
            </h3>
          </div>

          {/* Visual Stack Accumulation */}
          <div className="max-w-xl mx-auto space-y-2">
            {layers.slice(0, currentStep + 1).map((l) => (
              <div 
                key={l.num}
                className={`p-3 rounded-xl bg-gradient-to-r ${l.color} text-white font-mono text-xs flex items-center justify-between shadow-md transition-all duration-300 animate-scaleUp`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <span className="w-6 h-6 rounded-lg bg-black/30 flex items-center justify-center text-[11px]">
                    L{l.num}
                  </span>
                  <span>{l.name} Layer Header</span>
                </div>
                <span className="text-[11px] bg-black/25 px-2 py-0.5 rounded font-mono truncate max-w-[260px]">
                  {l.header}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Explainer card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">How PDU Encapsulation Works</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              As user data travels down the stack, each layer prepends its own control metadata header (and Layer 2 adds an FCS error-checking trailer). When received by the destination node, the reverse process (decapsulation) strips headers layer-by-layer up to the Application layer.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 3. CSMA/CD Ethernet Collision Simulation
  const renderCsmaSimulation = () => {
    const states = [
      { title: '1. Channel Sensing (Listening)', desc: 'Node A and Node C both check if the shared coax cable is idle. Neither detects carrier signals.', status: 'Sensing Carrier' },
      { title: '2. Simultaneous Transmission', desc: 'Both nodes transmit frames simultaneously. Electromagnetic waves travel toward each other across the medium.', status: 'Transmitting' },
      { title: '3. Mid-Wire Collision Event', desc: 'Voltages superimpose in the center of the bus wire, creating an abnormal signal energy surge exceeding the collision threshold!', status: 'COLLISION DETECTED!' },
      { title: '4. Jamming Signal Broadcast', desc: 'Transmitting nodes detect collision, halt payload transmission, and emit a 32-bit jam sequence so all stations know the wire is corrupt.', status: 'Jam Signal Broadcasted' },
      { title: '5. Binary Exponential Backoff', desc: 'Node A selects random slot R=1 (51.2μs), Node C selects R=2 (102.4μs). Node A retransmits first without collision!', status: 'Backoff Resolved & Successful' },
    ];

    const currentCsmaState = states[currentStep] || states[0];

    return (
      <div className="space-y-6">
        <div className="p-8 bg-slate-900/80 rounded-2xl border border-cyan-500/25 relative overflow-hidden">
          
          {/* Main Bus Line */}
          <div className="relative py-12">
            <div className="h-2 w-full bg-slate-700 rounded-full relative">
              
              {/* Collision Wave Indicator */}
              {currentStep === 2 && (
                <div className="absolute left-1/2 -top-4 -translate-x-1/2 flex items-center justify-center animate-ping">
                  <div className="w-12 h-12 rounded-full bg-rose-500/80 blur-xs" />
                </div>
              )}
              {currentStep === 2 && (
                <div className="absolute left-1/2 -top-2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono font-black text-[10px] animate-bounce z-20">
                  💥 COLLISION!
                </div>
              )}
            </div>

            {/* Connected Stations along bus */}
            <div className="flex justify-between items-start mt-6">
              {['Node A (Transmitter)', 'Node B (Idle)', 'Node C (Transmitter)', 'Node D (Idle)'].map((name, i) => (
                <div key={name} className="flex flex-col items-center gap-1.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                    (i === 0 || i === 2) && currentStep > 0
                      ? currentStep === 2 ? 'bg-rose-950 border-rose-500 text-rose-400' : 'bg-cyan-950 border-cyan-500 text-cyan-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    <Laptop size={22} />
                  </div>
                  <span className="text-[11px] font-bold text-white">{name.split(' ')[0]} {name.split(' ')[1]}</span>
                  <span className="text-[9px] font-mono text-slate-400">{name.split(' ')[2]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300">{currentCsmaState.title}</span>
            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
              currentStep === 2 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {currentCsmaState.status}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          {currentCsmaState.desc}
        </div>
      </div>
    );
  };

  // 4. Sliding Window Simulation
  const renderSlidingWindowSimulation = () => {
    const frames = [0, 1, 2, 3, 4, 5, 6, 7];
    const windowStart = Math.min(4, Math.floor(currentStep / 1.5));
    const windowSize = 4;

    return (
      <div className="space-y-6">
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-cyan-500/25">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              Go-Back-N Protocol (Window Size N = 4)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Active Sender Window: [{windowStart} ... {windowStart + windowSize - 1}]
            </span>
          </div>

          {/* Sequence Buffers */}
          <div className="grid grid-cols-8 gap-2 py-4">
            {frames.map((f) => {
              const inWindow = f >= windowStart && f < windowStart + windowSize;
              const isAcked = f < windowStart;

              return (
                <div 
                  key={f}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    inWindow 
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/50'
                      : isAcked
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-60">FRAME</div>
                  <div className="text-lg font-black font-mono">{f}</div>
                  <div className="text-[9px] font-mono font-bold mt-1">
                    {isAcked ? 'ACKED' : inWindow ? 'IN FLIGHT' : 'QUEUED'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          Sliding window protocols achieve high network efficiency by allowing multiple frames to be in flight without waiting for individual ACKs. As cumulative acknowledgments return from the receiver, the transmission window slides forward across sequence numbers.
        </div>
      </div>
    );
  };

  // 5. DNS Resolution Journey Simulation
  const renderDnsSimulation = () => {
    const dnsSteps = [
      { query: '1. Client queries Local Resolver for klu.ac.in', target: 'Local DNS Resolver (Cache Miss)', response: 'Recursion requested' },
      { query: '2. Resolver queries Root Server (.)', target: 'Root Nameserver (a.root-servers.net)', response: 'Referral to .in TLD Nameserver' },
      { query: '3. Resolver queries .in TLD Server', target: '.in TLD Registry Server', response: 'Referral to ns1.klu.ac.in Authoritative Server' },
      { query: '4. Resolver queries Authoritative Server', target: 'Authoritative Nameserver (ns1.klu.ac.in)', response: 'A-Record: 104.21.32.18 (TTL 300)' },
      { query: '5. Final IP returned to Client Browser', target: 'Client Browser (192.168.1.10)', response: 'Connection ready! Browser connects via IP' },
    ];

    const currentDns = dnsSteps[currentStep] || dnsSteps[0];

    return (
      <div className="space-y-6">
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-cyan-500/25">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              DNS Resolution Flow: "klu.ac.in"
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Query Hop {currentStep + 1} of 5
            </span>
          </div>

          <div className="space-y-3">
            {dnsSteps.map((d, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  idx === currentStep
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                    : idx < currentStep
                    ? 'bg-slate-900 border-emerald-500/30 text-emerald-300 opacity-80'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5 font-mono">
                  <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{d.query}</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 font-bold">
                  {d.response}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          The Domain Name System (DNS) translates human-readable hostnames into IP addresses using a globally distributed hierarchical database architecture.
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest dark:bg-[#070D18] text-on-surface dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors">
      
      {/* View Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Sparkles size={12} />
              VISUAL PROTOCOL SIMULATION
            </span>
            <span className="text-xs font-mono text-outline dark:text-slate-400">
              Interactive Labs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headline font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Animated Learning
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Step-by-step visual protocol state-machines, packet travel simulations, and RFC mechanics.
          </p>
        </div>

        {/* Mascot Tip */}
        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-surface-container dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 shadow-xs">
          <div className="w-8 h-8 relative shrink-0">
            <img
              src="/assets/mascot/cresco-mascot.png"
              alt="Cresco"
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase leading-none">CRESCO TIP</div>
            <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight mt-0.5">
              Press Play or step forward to inspect packet fields!
            </div>
          </div>
        </div>
      </div>

      {/* Topic Switcher Ribbon */}
      <div className="max-w-7xl mx-auto overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {topics.map((t) => {
            const isSelected = activeTopic === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  try {
                    soundFx.playClick();
                  } catch {}
                  setActiveTopic(t.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-surface-container dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-outline-variant/30 dark:border-slate-800'
                }`}
              >
                <span>{t.title}</span>
                <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.2 rounded bg-black/20">
                  {t.rfc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Active Simulation Canvas & Controls (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Active Simulation View */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1424] border border-outline-variant/30 dark:border-slate-800 shadow-xl">
            {renderSimulationCanvas()}
          </div>

          {/* Universal Playback Control Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0c1424] border border-outline-variant/30 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            
            {/* Play / Pause / Step Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Reset Simulation"
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={handleStepBackward}
                disabled={currentStep === 0}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                title="Step Backward"
              >
                <SkipBack size={16} />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/30 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="fill-white" />}
                <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
              </button>

              <button
                type="button"
                onClick={handleStepForward}
                disabled={currentStep >= currentTopicData.totalSteps - 1}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                title="Step Forward"
              >
                <SkipForward size={16} />
              </button>
            </div>

            {/* Timeline Progress Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                {currentStep + 1}/{currentTopicData.totalSteps}
              </span>
              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / currentTopicData.totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Speed Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    speedMultiplier === spd
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Right: Academic Context & RFC Guide (1 col) */}
        <div className="space-y-4">
          
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0c1424] border border-outline-variant/30 dark:border-slate-800 shadow-lg space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block">
                {currentTopicData.category}
              </span>
              <h3 className="font-headline font-black text-base text-slate-900 dark:text-white mt-0.5">
                {currentTopicData.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {currentTopicData.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                CORE PROTOCOL INVARIANTS
              </span>
              
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Sequence numbers byte-orient reliability without overhead.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>State machines prevent half-open and zombie socket leaks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Full-duplex channels manage independent stream counters.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40 text-[11px] text-cyan-900 dark:text-cyan-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info size={13} className="text-cyan-600 dark:text-cyan-400" />
                <span>KLU University Curriculum</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Matches syllabus unit requirements for Transport layer handshakes, framing, and CSMA/CD mechanisms.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
