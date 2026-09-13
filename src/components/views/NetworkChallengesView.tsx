import React, { useState } from 'react';
import { ByteBot } from '../character/ByteBot';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { 
  Swords, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Laptop, 
  Router as RouterIcon, 
  Server, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  RotateCcw,
  Check,
  Play
} from 'lucide-react';

interface NetworkChallengesViewProps {
  onRewardXp?: (amount: number) => void;
  onNavigateToBoss?: () => void;
}

export const NetworkChallengesView: React.FC<NetworkChallengesViewProps> = ({
  onRewardXp,
  onNavigateToBoss,
}) => {
  const [activeTab, setActiveTab] = useState<'routing' | 'tcp-udp' | 'app-layer' | 'boss'>('routing');

  // Challenge 1: Routing Challenge State
  const [selectedPath, setSelectedPath] = useState<'upper' | 'lower' | null>(null);
  const [routingSuccess, setRoutingSuccess] = useState<boolean | null>(null);

  // Challenge 2: TCP vs UDP Challenge State
  const [selectedProtocol, setSelectedProtocol] = useState<'TCP' | 'UDP' | null>(null);
  const [protocolSubmitted, setProtocolSubmitted] = useState<boolean>(false);

  // Challenge 3: Application Layer Pipeline State (Browser -> DNS -> IP -> TCP -> TLS -> HTTPS -> Web Server)
  const [appPipelineStep, setAppPipelineStep] = useState<number>(0);

  const pipelineStages = [
    { step: 1, label: 'Browser Request', desc: 'User enters https://cresco.edu into the URL address bar.' },
    { step: 2, label: 'DNS Resolution', desc: 'Recursive query to Port 53 translates domain to IP 93.184.216.34.' },
    { step: 3, label: 'IP Addressing', desc: 'Destination IPv4 address assigned to outbound packet headers.' },
    { step: 4, label: 'TCP 3-Way Handshake', desc: 'SYN, SYN-ACK, ACK establishes reliable Layer 4 connection on Port 443.' },
    { step: 5, label: 'TLS Cryptographic Tunnel', desc: 'Server certificate validated; symmetric session keys negotiated.' },
    { step: 6, label: 'HTTPS Request & Response', desc: 'Encrypted HTTP GET dispatched and response payload returned.' },
    { step: 7, label: 'Web Server Rendering', desc: 'HTML, CSS, and JS parsed and interactive portal renders in viewport!' },
  ];

  const handleSelectRoute = (path: 'upper' | 'lower') => {
    soundFx.playClick();
    setSelectedPath(path);
    if (path === 'upper') {
      // Lower latency cost: R1-R2 cost = 10; R3-R4 cost = 45
      soundFx.playCorrect();
      setRoutingSuccess(true);
      triggerSubtleSectionConfetti();
      if (onRewardXp) onRewardXp(25);
    } else {
      soundFx.playIncorrect();
      setRoutingSuccess(false);
    }
  };

  const handleSelectProtocol = (proto: 'TCP' | 'UDP') => {
    soundFx.playClick();
    setSelectedProtocol(proto);
    setProtocolSubmitted(true);
    if (proto === 'UDP') {
      soundFx.playCorrect();
      triggerSubtleSectionConfetti();
      if (onRewardXp) onRewardXp(20);
    } else {
      soundFx.playIncorrect();
    }
  };

  const handleAdvancePipeline = () => {
    soundFx.playPacketPop();
    setAppPipelineStep((prev) => {
      const next = (prev + 1) % pipelineStages.length;
      if (next === pipelineStages.length - 1) {
        soundFx.playLevelUp();
        triggerSubtleSectionConfetti();
        if (onRewardXp) onRewardXp(30);
      }
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* 1. Header & Challenge Category Switcher */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest">
            <Swords size={16} />
            <span>INTERACTIVE ARENA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
            Network Challenges
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
            Test and animate routing topologies, transport selection, and application pipelines.
          </p>
        </div>

        {/* Challenge Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F5F0] dark:bg-[#111827] rounded-2xl border border-[#E5E0D8] dark:border-slate-700 flex-wrap">
          <button
            onClick={() => { soundFx.playClick(); setActiveTab('routing'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'routing' ? 'bg-[#3157D5] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            Best Route
          </button>
          <button
            onClick={() => { soundFx.playClick(); setActiveTab('tcp-udp'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'tcp-udp' ? 'bg-[#3157D5] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            TCP vs UDP
          </button>
          <button
            onClick={() => { soundFx.playClick(); setActiveTab('app-layer'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'app-layer' ? 'bg-[#3157D5] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            App Pipeline
          </button>
        </div>
      </div>

      {/* ================= CHALLENGE 1: FIND THE BEST ROUTE ================= */}
      {activeTab === 'routing' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#3157D5] dark:text-[#6D8CFF]">
                  ROUTING CHALLENGE · DIJKSTRA SHORTEST PATH
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
                  FIND THE BEST ROUTE
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#475569] dark:text-[#D1D5DB] mt-1">
                  "Which route should the packet take from PC A to Server with minimum metric cost?"
                </p>
              </div>

              <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-[#35A86B]/15 text-[#35A86B] font-mono">
                +25 XP
              </span>
            </div>

            {/* Visual Topology Map */}
            <div className="p-6 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 relative">
              <div className="grid grid-cols-4 gap-4 items-center max-w-lg mx-auto py-4">
                
                {/* PC A */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#3157D5] text-white flex items-center justify-center shadow-xs">
                    <Laptop size={22} />
                  </div>
                  <span className="text-xs font-bold mt-1">PC A</span>
                </div>

                {/* Middle Router Grid */}
                <div className="col-span-2 space-y-4">
                  
                  {/* Upper Route: R1 -> R2 */}
                  <button
                    onClick={() => handleSelectRoute('upper')}
                    className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                      selectedPath === 'upper'
                        ? routingSuccess
                          ? 'bg-[#35A86B]/15 border-[#35A86B] text-[#35A86B] shadow-xs'
                          : 'bg-[#D95C5C]/15 border-[#D95C5C]'
                        : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] hover:border-[#3157D5]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RouterIcon size={16} />
                      <span className="font-bold text-xs">Route 1: via R1 ➔ R2</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold">Cost: 10ms</span>
                  </button>

                  {/* Lower Route: R3 -> R4 */}
                  <button
                    onClick={() => handleSelectRoute('lower')}
                    className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                      selectedPath === 'lower'
                        ? 'bg-[#F0A63A]/15 border-[#F0A63A] text-[#B45309]'
                        : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] hover:border-[#3157D5]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RouterIcon size={16} />
                      <span className="font-bold text-xs">Route 2: via R3 ➔ R4</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold">Cost: 45ms</span>
                  </button>

                </div>

                {/* Server */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#35A86B] text-white flex items-center justify-center shadow-xs">
                    <Server size={22} />
                  </div>
                  <span className="text-xs font-bold mt-1">Target</span>
                </div>

              </div>

              {/* Feedback Animation Strip */}
              {routingSuccess !== null && (
                <div className={`mt-4 p-4 rounded-xl text-xs font-semibold flex items-center gap-3 animate-slideUp ${
                  routingSuccess
                    ? 'bg-[#35A86B]/15 text-[#35A86B] border border-[#35A86B]/30'
                    : 'bg-[#F0A63A]/15 text-[#B45309] border border-[#F0A63A]/30'
                }`}>
                  {routingSuccess ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span>
                    {routingSuccess
                      ? 'Perfect route! R1 ➔ R2 offers lowest delay metric (10ms). +25 XP earned!'
                      : 'Higher latency path (45ms). Dijkstra selects the path with minimum aggregate link cost.'}
                  </span>
                </div>
              )}
            </div>

            {/* Byte Companion */}
            <div className="flex justify-center">
              <ByteBot
                pose={routingSuccess ? 'celebrating' : 'thinking'}
                size="md"
                showSpeech={true}
                speechText={
                  routingSuccess
                    ? 'Superb! Dynamic link-state algorithms always converge on the lowest cost metric.'
                    : 'Analyze both paths. One route is significantly faster!'
                }
              />
            </div>

          </div>
        </div>
      )}

      {/* ================= CHALLENGE 2: TCP VS UDP SCENARIO ================= */}
      {activeTab === 'tcp-udp' && (
        <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#7957C7]">
              LAYER 4 PROTOCOL SELECTION
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-0.5">
              Choose the correct protocol
            </h2>
          </div>

          {/* Scenario Card */}
          <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">SCENARIO</span>
            <p className="text-base font-bold text-[#172033] dark:text-[#F9FAFB]">
              "Send a live video stream where speed and low latency matter more than retransmitting every dropped packet."
            </p>
          </div>

          {/* Protocol Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectProtocol('TCP')}
              className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                protocolSubmitted && selectedProtocol === 'TCP'
                  ? 'bg-[#F0A63A]/15 border-[#F0A63A] text-[#172033] dark:text-[#F9FAFB]'
                  : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] hover:border-[#3157D5]'
              }`}
            >
              <div className="font-black text-lg">TCP</div>
              <div className="text-xs text-[#64748B] mt-1 font-medium">
                Connection-oriented, verified delivery, automatic retransmissions.
              </div>
            </button>

            <button
              onClick={() => handleSelectProtocol('UDP')}
              className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                protocolSubmitted && selectedProtocol === 'UDP'
                  ? 'bg-[#35A86B]/15 border-[#35A86B] text-[#172033] dark:text-[#F9FAFB] shadow-xs'
                  : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] hover:border-[#3157D5]'
              }`}
            >
              <div className="font-black text-lg">UDP</div>
              <div className="text-xs text-[#64748B] mt-1 font-medium">
                Connectionless datagram, zero handshake latency, fire-and-forget streaming.
              </div>
            </button>
          </div>

          {/* Explanation */}
          {protocolSubmitted && (
            <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
              <span className="font-bold text-[#172033] dark:text-white block mb-1">Technical Rationale:</span>
              Live video streams and VoIP cannot pause to wait for retransmitted packets (which would cause buffer stutter). UDP drops late frames and streams continuous real-time video without delay.
            </div>
          )}
        </div>
      )}

      {/* ================= CHALLENGE 3: APPLICATION LAYER SIMULATION ================= */}
      {activeTab === 'app-layer' && (
        <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#35A86B]">
              END-TO-END PIPELINE SIMULATION
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-0.5">
              Browser to Web Server Lifecycle
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-1">
              "Trace the exact chain of events when opening a web page."
            </p>
          </div>

          {/* Interactive Stepper Pipeline */}
          <div className="space-y-3">
            {pipelineStages.map((stage, idx) => {
              const isCurrent = idx === appPipelineStep;
              const isPast = idx < appPipelineStep;

              return (
                <div
                  key={stage.step}
                  onClick={() => setAppPipelineStep(idx)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#3157D5]/10 border-[#3157D5] shadow-xs'
                      : isPast
                      ? 'bg-[#F7F5F0] dark:bg-[#111827] border-[#35A86B]/40 text-[#64748B]'
                      : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      isPast
                        ? 'bg-[#35A86B] text-white'
                        : isCurrent
                        ? 'bg-[#3157D5] text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-[#64748B]'
                    }`}>
                      {isPast ? '✓' : stage.step}
                    </span>
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-[#172033] dark:text-[#F9FAFB]">
                        {stage.label}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                        {stage.desc}
                      </div>
                    </div>
                  </div>

                  {isCurrent && <span className="text-xs font-mono font-bold text-[#3157D5]">ACTIVE</span>}
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleAdvancePipeline}
              className="px-6 py-3 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs tracking-wider shadow-2xs cursor-pointer flex items-center gap-2"
            >
              <span>STEP FORWARD →</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
