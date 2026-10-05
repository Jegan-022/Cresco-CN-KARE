import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Send, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Monitor, 
  Router, 
  Server, 
  Zap, 
  Clock, 
  Sliders, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { ModularLesson } from '../../data/lessons/lessonModel';
import { soundFx } from '../../utils/soundEffects';

interface InteractiveLearningPageProps {
  lesson: ModularLesson;
  onNext: () => void;
  onPrev: () => void;
}

type SimSubTab = 'simulation' | 'explanation' | 'explore';

export const InteractiveLearningPage: React.FC<InteractiveLearningPageProps> = ({
  lesson,
  onNext,
  onPrev
}) => {
  const [activeTab, setActiveTab] = useState<SimSubTab>('simulation');
  const [messageText, setMessageText] = useState('Hello!');
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentHopIndex, setCurrentHopIndex] = useState<number>(-1);
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'in-transit' | 'delivered'>('idle');
  const [liveLatency, setLiveLatency] = useState(0);

  const simulation = lesson.simulation;
  const pathNodes = simulation.bestPath; // ['src', 'r1', 'r2', 'r4', 'dst']

  // Handle Send / Step Simulation
  const handleStartSimulation = () => {
    if (isSimulating) return;
    soundFx.playClick();
    setIsSimulating(true);
    setCurrentHopIndex(0);
    setDeliveryStatus('in-transit');
    setLiveLatency(0);

    const baseDelay = 900 / speedMultiplier;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentHopIndex(step);
      setLiveLatency((prev) => Math.min(simulation.totalTimeMs, prev + Math.round(simulation.totalTimeMs / (pathNodes.length - 1))));
      soundFx.playPacketPop();

      if (step >= pathNodes.length - 1) {
        clearInterval(interval);
        setIsSimulating(false);
        setDeliveryStatus('delivered');
        setLiveLatency(simulation.totalTimeMs);
        soundFx.playCorrect();
      }
    }, baseDelay);
  };

  const handleResetSimulation = () => {
    soundFx.playClick();
    setIsSimulating(false);
    setCurrentHopIndex(-1);
    setDeliveryStatus('idle');
    setLiveLatency(0);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 1. SUB-TABS: SIMULATION | EXPLANATION | EXPLORE                          */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {[
            { key: 'simulation', label: 'Interactive Simulation', icon: '🖥️' },
            { key: 'explanation', label: 'Visual Explanation', icon: '👁️' },
            { key: 'explore', label: 'Explore Yourself', icon: '🔬' }
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.key as SimSubTab);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#111C44] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
          <span>Routing Protocol:</span>
          <span className="text-blue-600 dark:text-blue-400">OSPF / Dijkstra SPF</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SIMULATION CARD (Matching Panel 2 in user image)                   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        
        {/* Header Strip with Octo Mascot */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {simulation.title}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {simulation.subtitle}
            </p>
          </div>

          {/* Octo speech bubble on top right */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 rounded-2xl px-3 py-1.5 text-xs font-extrabold text-blue-700 dark:text-blue-300 shadow-2xs max-w-[190px]">
              {simulation.octoSpeech}
            </div>
            <div className="size-12 shrink-0">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Octo Guide"
                className="size-full object-contain filter drop-shadow-xs animate-bounce-up"
              />
            </div>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE SIMULATION CANVAS */}
        {activeTab === 'simulation' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Interactive World / Network Canvas (Chennai to Mumbai) */}
            <div className="relative w-full h-[320px] sm:h-[360px] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B132B] rounded-2xl border-2 border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-4">
              
              {/* Grid Lines Pattern */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)`,
                  backgroundSize: '36px 36px'
                }}
              />

              {/* Topology SVG Connection Lines */}
              <svg className="absolute inset-0 size-full pointer-events-none">
                {simulation.links.map((link, idx) => {
                  const fromNode = simulation.nodes.find((n) => n.id === link.from);
                  const toNode = simulation.nodes.find((n) => n.id === link.to);
                  if (!fromNode || !toNode) return null;

                  const isPartOfBestPath =
                    pathNodes.includes(link.from) &&
                    pathNodes.includes(link.to) &&
                    Math.abs(pathNodes.indexOf(link.from) - pathNodes.indexOf(link.to)) === 1;

                  const isCurrentlyActiveHop =
                    currentHopIndex >= 0 &&
                    currentHopIndex < pathNodes.length - 1 &&
                    link.from === pathNodes[currentHopIndex] &&
                    link.to === pathNodes[currentHopIndex + 1];

                  return (
                    <g key={idx}>
                      {/* Base link line */}
                      <line
                        x1={`${fromNode.x}%`}
                        y1={`${fromNode.y}%`}
                        x2={`${toNode.x}%`}
                        y2={`${toNode.y}%`}
                        stroke={isPartOfBestPath ? (isCurrentlyActiveHop ? '#10B981' : '#3B82F6') : '#475569'}
                        strokeWidth={isPartOfBestPath ? 3 : 1.5}
                        strokeDasharray={isPartOfBestPath ? 'none' : '4 4'}
                        opacity={isPartOfBestPath ? 0.9 : 0.4}
                      />
                      
                      {/* Pulse effect on active link */}
                      {isCurrentlyActiveHop && (
                        <line
                          x1={`${fromNode.x}%`}
                          y1={`${fromNode.y}%`}
                          x2={`${toNode.x}%`}
                          y2={`${toNode.y}%`}
                          stroke="#34D399"
                          strokeWidth={6}
                          className="animate-pulse"
                          opacity={0.8}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Router and Host Nodes */}
              {simulation.nodes.map((node) => {
                const nodeHopIdx = pathNodes.indexOf(node.id);
                const isVisited = currentHopIndex >= nodeHopIdx && nodeHopIdx !== -1;
                const isCurrentActive = currentHopIndex === nodeHopIdx;

                return (
                  <div
                    key={node.id}
                    className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300 select-none"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    {/* Node Visual Box */}
                    <div
                      className={`size-12 sm:size-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        isCurrentActive
                          ? 'bg-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.8)] scale-110 ring-4 ring-emerald-300'
                          : isVisited
                          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {node.type === 'host' ? (
                        <Monitor size={node.id === 'src' ? 22 : 22} />
                      ) : (
                        <Router size={22} />
                      )}
                      <span className="text-[8px] font-black uppercase tracking-tight mt-0.5">
                        {node.type}
                      </span>
                    </div>

                    {/* Node Label & IP */}
                    <div className="mt-1.5 flex flex-col items-center">
                      <span className="text-[10px] sm:text-xs font-black text-white text-center whitespace-nowrap drop-shadow-md">
                        {node.label}
                      </span>
                      {node.sublabel && (
                        <span className="text-[9px] font-mono text-slate-400 text-center whitespace-nowrap">
                          {node.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Floating Packet in Transit */}
              {isSimulating && currentHopIndex >= 0 && currentHopIndex < pathNodes.length && (
                <div
                  className="absolute z-20 transition-all duration-500 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    left: `${simulation.nodes.find((n) => n.id === pathNodes[currentHopIndex])?.x}%`,
                    top: `${(simulation.nodes.find((n) => n.id === pathNodes[currentHopIndex])?.y || 50) - 8}%`
                  }}
                >
                  <div className="px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 font-extrabold text-[10px] shadow-lg flex items-center gap-1 animate-bounce">
                    <Zap size={11} className="fill-slate-950" />
                    <span>IP Datagram: "{messageText}"</span>
                  </div>
                </div>
              )}

              {/* Delivery Celebration Badge */}
              {deliveryStatus === 'delivered' && (
                <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 size={16} />
                  <span>Delivered to Mumbai in {simulation.totalTimeMs}ms!</span>
                </div>
              )}
            </div>

            {/* Simulation Controls & Route Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Controls Column */}
              <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex flex-col justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Simulation Controls
                  </span>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageText}
                      disabled={isSimulating}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type payload message..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white outline-hidden focus:border-blue-500"
                    />

                    {/* Send Button */}
                    <button
                      onClick={handleStartSimulation}
                      disabled={isSimulating}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                      title="Send Packet"
                    >
                      <Play size={13} fill="white" />
                      <span>Send</span>
                    </button>

                    {/* Reset Button */}
                    <button
                      onClick={handleResetSimulation}
                      className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Reset Topology"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

                {/* Speed Multiplier Toggles */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500">Transmission Speed:</span>
                  <div className="flex items-center gap-1.5">
                    {([1, 2, 4] as const).map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setSpeedMultiplier(spd)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          speedMultiplier === spd
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Route Information Box */}
              <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex flex-col justify-between">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Route Information
                </span>

                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Path:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      Chennai → R1 → R2 → R4 → Mumbai
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Hops:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {currentHopIndex >= 0 ? Math.min(simulation.hops, currentHopIndex) : 0} of {simulation.hops} hops
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Latency:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {liveLatency} ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        deliveryStatus === 'delivered'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : deliveryStatus === 'in-transit'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {deliveryStatus === 'delivered' ? 'Delivered Successfully' : deliveryStatus === 'in-transit' ? 'In Transit...' : 'Ready To Route'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: VISUAL EXPLANATION */}
        {activeTab === 'explanation' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Hop-By-Hop Forwarding Stages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simulation.visualExplanationSteps.map((s) => (
                <div key={s.step} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="size-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{s.title}</h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EXPLORE YOURSELF */}
        {activeTab === 'explore' && (
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-3 animate-fadeIn">
            <h3 className="text-sm font-black text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <Info size={16} />
              <span>Experimentation Tasks</span>
            </h3>
            <ul className="space-y-2">
              {simulation.explorePrompts.map((prompt, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-blue-600 font-bold">👉</span>
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ACTION BAR                                                      */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            soundFx.playClick();
            onPrev();
          }}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          <span>Previous: Concept</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNext();
          }}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Next: Practice Quiz</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};
