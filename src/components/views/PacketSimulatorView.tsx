import React, { useState, useEffect } from 'react';
import { CrescoMascot } from '../brand/CrescoMascot';
import { soundFx } from '../../utils/soundEffects';
import { 
  Laptop, 
  Router as RouterIcon, 
  Server, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Activity, 
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';

interface PacketSimulatorViewProps {
  onBack?: () => void;
}

type ProtocolMode = 'TCP' | 'UDP';

interface PacketStep {
  stepIndex: number;
  label: string;
  source: 'PCA' | 'Router1' | 'Router2' | 'Server';
  destination: 'PCA' | 'Router1' | 'Router2' | 'Server';
  flag: string;
  seq?: number;
  ack?: number;
  payload: string;
  explanation: string;
}

export const PacketSimulatorView: React.FC<PacketSimulatorViewProps> = ({ onBack }) => {
  const [protocol, setProtocol] = useState<ProtocolMode>('TCP');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [packetPosition, setPacketPosition] = useState<number>(0); // 0: PCA, 1: Router1, 2: Router2, 3: Server

  // Handshake and transmission steps for TCP
  const tcpSteps: PacketStep[] = [
    { stepIndex: 0, label: 'SYN', source: 'PCA', destination: 'Server', flag: 'SYN=1, ACK=0', seq: 100, ack: 0, payload: 'Initial Handshake Request', explanation: 'PC A sends SYN (seq=100) to initiate connection setup.' },
    { stepIndex: 1, label: 'SYN-ACK', source: 'Server', destination: 'PCA', flag: 'SYN=1, ACK=1', seq: 300, ack: 101, payload: 'Server Agrees & Synchronizes', explanation: 'Server accepts and replies with SYN-ACK (seq=300, ack=101).' },
    { stepIndex: 2, label: 'ACK', source: 'PCA', destination: 'Server', flag: 'SYN=0, ACK=1', seq: 101, ack: 301, payload: 'Connection Established', explanation: 'PC A acknowledges. 3-way handshake is now complete!' },
    { stepIndex: 3, label: 'DATA 1', source: 'PCA', destination: 'Server', flag: 'PSH=1, ACK=1', seq: 101, ack: 301, payload: 'HTTP GET /index.html (512 Bytes)', explanation: 'Application data transferred with sequence verification.' },
    { stepIndex: 4, label: 'ACK 1', source: 'Server', destination: 'PCA', flag: 'ACK=1', seq: 301, ack: 613, payload: 'Acknowledged 512 Bytes', explanation: 'Server confirms arrival of bytes up to 613.' },
  ];

  // Fire-and-forget streaming steps for UDP
  const udpSteps: PacketStep[] = [
    { stepIndex: 0, label: 'DATA 1', source: 'PCA', destination: 'Server', flag: 'NONE (UDP)', payload: 'VoIP Audio Frame #1 (160B)', explanation: 'Sent immediately without prior handshake.' },
    { stepIndex: 1, label: 'DATA 2', source: 'PCA', destination: 'Server', flag: 'NONE (UDP)', payload: 'VoIP Audio Frame #2 (160B)', explanation: 'Continuous stream; zero connection overhead.' },
    { stepIndex: 2, label: 'DATA 3 (DROPPED)', source: 'Router1', destination: 'Router2', flag: 'NONE (UDP)', payload: 'VoIP Audio Frame #3 (Simulated Drop)', explanation: 'Packet dropped in transit. UDP has no retransmission!' },
    { stepIndex: 3, label: 'DATA 4', source: 'PCA', destination: 'Server', flag: 'NONE (UDP)', payload: 'VoIP Audio Frame #4 (160B)', explanation: 'Subsequent frames continue streaming regardless of loss.' },
  ];

  const currentSteps = protocol === 'TCP' ? tcpSteps : udpSteps;
  const activeStep = currentSteps[currentStepIndex] || currentSteps[0];

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= currentSteps.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          soundFx.playPacketPop();
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentSteps.length]);

  const handleProtocolChange = (mode: ProtocolMode) => {
    soundFx.playClick();
    setProtocol(mode);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    soundFx.playPacketPop();
    setCurrentStepIndex((prev) => (prev + 1) % currentSteps.length);
  };

  const handleReset = () => {
    soundFx.playClick();
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Node position calculation for SVG packet
  const getNodeX = (nodeName: string) => {
    switch (nodeName) {
      case 'PCA': return 80;
      case 'Router1': return 220;
      case 'Router2': return 380;
      case 'Server': return 520;
      default: return 80;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* 1. Header & Protocol Toggle */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest">
            <Activity size={14} />
            <span>EDUCATIONAL SIMULATOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
            Packet Protocol Simulator
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
            Compare reliable TCP 3-way handshakes with low-latency UDP streams.
          </p>
        </div>

        {/* Protocol Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F7F5F0] dark:bg-[#111827] rounded-2xl border border-[#E5E0D8] dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => handleProtocolChange('TCP')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              protocol === 'TCP'
                ? 'bg-[#3157D5] text-white shadow-xs'
                : 'text-[#64748B] dark:text-slate-400 hover:text-[#172033]'
            }`}
          >
            TCP (Reliable)
          </button>
          <button
            onClick={() => handleProtocolChange('UDP')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              protocol === 'UDP'
                ? 'bg-[#F0A63A] text-white shadow-xs'
                : 'text-[#64748B] dark:text-slate-400 hover:text-[#172033]'
            }`}
          >
            UDP (Datagram)
          </button>
        </div>
      </div>

      {/* 2. Topology Visualizer: PC A -> Router 1 -> Router 2 -> Server */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm relative">
        
        {/* Topology Network Diagram */}
        <div className="relative w-full h-44 sm:h-48 flex items-center justify-between px-4 sm:px-12">
          
          {/* Background Connecting Cables */}
          <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-1.5 bg-[#E5E0D8] dark:bg-slate-700 z-0" />

          {/* Node 1: PC A */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#3157D5] text-white flex items-center justify-center shadow-md">
              <Laptop size={26} />
            </div>
            <span className="font-extrabold text-xs text-[#172033] dark:text-[#F9FAFB] mt-2">PC A</span>
            <span className="text-[10px] font-mono text-[#64748B]">192.168.1.10</span>
          </div>

          {/* Node 2: Router 1 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#5B7CFA] text-white flex items-center justify-center shadow-md">
              <RouterIcon size={26} />
            </div>
            <span className="font-extrabold text-xs text-[#172033] dark:text-[#F9FAFB] mt-2">Router 1</span>
            <span className="text-[10px] font-mono text-[#64748B]">Gateway</span>
          </div>

          {/* Node 3: Router 2 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#5B7CFA] text-white flex items-center justify-center shadow-md">
              <RouterIcon size={26} />
            </div>
            <span className="font-extrabold text-xs text-[#172033] dark:text-[#F9FAFB] mt-2">Router 2</span>
            <span className="text-[10px] font-mono text-[#64748B]">Core Transit</span>
          </div>

          {/* Node 4: Server */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#35A86B] text-white flex items-center justify-center shadow-md">
              <Server size={26} />
            </div>
            <span className="font-extrabold text-xs text-[#172033] dark:text-[#F9FAFB] mt-2">Server</span>
            <span className="text-[10px] font-mono text-[#64748B]">93.184.216.34</span>
          </div>

        </div>

        {/* Traveling Packet Animation Pill */}
        <div className="mt-4 p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black text-white ${
              protocol === 'TCP' ? 'bg-[#3157D5]' : 'bg-[#F0A63A]'
            }`}>
              {activeStep.label}
            </span>
            <div className="text-xs font-bold text-[#172033] dark:text-[#F9FAFB]">
              {activeStep.payload}
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-[#64748B]">
            Step {currentStepIndex + 1} of {currentSteps.length}
          </div>
        </div>

        {/* Simulator Controls */}
        <div className="mt-6 pt-4 border-t border-[#EFECE6] dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs cursor-pointer shadow-xs"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button
              onClick={handleStepForward}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F7F5F0] text-[#172033] dark:text-[#F9FAFB] font-extrabold text-xs border border-[#E5E0D8] dark:border-slate-700 cursor-pointer shadow-xs"
            >
              Step Forward →
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#F7F5F0] dark:hover:bg-slate-800 cursor-pointer"
              title="Reset Simulation"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="text-xs font-medium text-[#64748B] dark:text-slate-400 hidden sm:block">
            {protocol === 'TCP' ? 'TCP 3-Way Handshake + Data ACK' : 'UDP Fire & Forget Datagram Stream'}
          </div>
        </div>

      </div>

      {/* 3. Packet Header Inspector & Byte Bot Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Packet Inspector Terminal Box */}
        <div className="md:col-span-2 rounded-3xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-wider">
              PACKET HEADER INSPECTOR
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">Layer 4 Segment</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
              <span className="text-[9px] text-[#64748B] block font-sans">SRC PORT</span>
              <span className="font-bold text-[#172033] dark:text-white">49152</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
              <span className="text-[9px] text-[#64748B] block font-sans">DST PORT</span>
              <span className="font-bold text-[#172033] dark:text-white">{protocol === 'TCP' ? '80 (HTTP)' : '53 (DNS)'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
              <span className="text-[9px] text-[#64748B] block font-sans">FLAGS</span>
              <span className="font-bold text-[#3157D5] dark:text-[#6D8CFF]">{activeStep.flag}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
              <span className="text-[9px] text-[#64748B] block font-sans">SEQ / ACK</span>
              <span className="font-bold text-[#35A86B]">
                {activeStep.seq !== undefined ? `${activeStep.seq} / ${activeStep.ack}` : 'N/A'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-medium text-[#475569] dark:text-[#D1D5DB] leading-relaxed pt-2">
            {activeStep.explanation}
          </p>
        </div>

        {/* Network Octopus Mascot Companion */}
        <div className="rounded-3xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 p-6 shadow-sm flex items-center justify-center">
          <CrescoMascot
            pose={protocol === 'TCP' ? 'connected' : 'problem-solving'}
            size="xl"
            animation="float"
            withGlow
            speechText={
              protocol === 'TCP'
                ? 'TCP establishes connection trust before sending data.'
                : 'UDP does not wait for an ACK. Faster, but vulnerable to dropped packets!'
            }
            speechPosition="top"
          />
        </div>

      </div>

    </div>
  );
};
