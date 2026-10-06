import React, { useState, useEffect } from 'react';
import { LevelDefinition } from '../../levels/types';
import { 
  Play, 
  RotateCcw, 
  Send, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Laptop, 
  Server, 
  Router as RouterIcon, 
  Activity, 
  Cpu, 
  Zap,
  Clock,
  Layers
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface InteractiveLearningPageProps {
  level: LevelDefinition;
  onNext: () => void;
  onPrev: () => void;
}

export const InteractiveLearningPage: React.FC<InteractiveLearningPageProps> = ({
  level,
  onNext,
  onPrev,
}) => {
  const sim = level.interactive;
  const [activeTab, setActiveTab] = useState<'sim' | 'visual' | 'explore'>('sim');
  const [message, setMessage] = useState(sim.defaultMessage || 'Hello!');
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(1);
  const [simState, setSimState] = useState<'idle' | 'transmitting' | 'delivered'>('idle');
  const [currentHopIndex, setCurrentHopIndex] = useState<number>(0);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const handleStartSimulation = () => {
    soundFx.playClick();
    setSimState('transmitting');
    setCurrentHopIndex(0);
    setLogMessages([`[0ms] Encapsulating payload "${message}" with destination IP`]);

    const stepInterval = 900 / speedMultiplier;

    // Advance hops step by step
    sim.path.forEach((node, index) => {
      setTimeout(() => {
        setCurrentHopIndex(index);
        soundFx.playPacketPop();
        setLogMessages((prev) => [
          ...prev,
          `[${(index + 1) * 12}ms] Forwarded through ${node}`
        ]);

        if (index === sim.path.length - 1) {
          setSimState('delivered');
          soundFx.playSuccess();
          setLogMessages((prev) => [
            ...prev,
            `[${sim.totalTimeMs}ms] Packet delivered successfully to ${sim.destinationCity}!`
          ]);
        }
      }, (index + 1) * stepInterval);
    });
  };

  const handleReset = () => {
    soundFx.playClick();
    setSimState('idle');
    setCurrentHopIndex(0);
    setLogMessages([]);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-500/10 border border-white/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3 text-cyan-200">
              <Zap size={13} className="animate-bounce" />
              Stage 2: Interactive Simulation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
              {sim.title}
            </h1>
            <p className="text-sm sm:text-base text-teal-100 font-medium max-w-2xl">
              {sim.description}
            </p>
          </div>

          {/* Guide Mascot speech bubble */}
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3 sm:p-4 shrink-0 shadow-lg max-w-sm">
            <div className="relative size-14 sm:size-16 shrink-0 flex items-center justify-center">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Guide Mascot"
                className="w-full h-full object-contain filter drop-shadow-md animate-bounce-up"
              />
            </div>
            <div className="text-xs sm:text-sm text-white font-medium leading-snug">
              <p className="font-bold text-amber-300 mb-0.5">Interactive Guide</p>
              {sim.mascotTip}
            </div>
          </div>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        {[
          { id: 'sim', label: 'Interactive Simulation' },
          { id: 'visual', label: 'Visual Explanation' },
          { id: 'explore', label: 'Explore Yourself' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundFx.playClick();
              setActiveTab(tab.id as any);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
        {/* Canvas Area */}
        <div className="relative w-full h-[320px] sm:h-[360px] bg-gradient-to-b from-sky-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center p-4">
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* SVG Connection Lines between routers */}
          <svg className="absolute inset-0 size-full pointer-events-none">
            <line x1="12%" y1="55%" x2="32%" y2="40%" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" />
            <line x1="32%" y1="40%" x2="52%" y2="35%" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" />
            <line x1="32%" y1="40%" x2="50%" y2="70%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
            <line x1="52%" y1="35%" x2="74%" y2="42%" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" />
            <line x1="50%" y1="70%" x2="74%" y2="42%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
            <line x1="74%" y1="42%" x2="90%" y2="55%" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" />
          </svg>

          {/* Simulated Nodes on Map */}
          {sim.routers.map((node, idx) => {
            const isCurrentHop = simState === 'transmitting' && idx === currentHopIndex;
            const isCompletedHop = (simState === 'transmitting' && idx < currentHopIndex) || simState === 'delivered';
            
            return (
              <div
                key={node.id}
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {/* Node Avatar Icon */}
                <div 
                  className={`size-12 sm:size-14 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all ${
                    isCurrentHop
                      ? 'bg-amber-400 border-amber-600 scale-120 ring-4 ring-amber-400/40 animate-pulse text-slate-900'
                      : isCompletedHop
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : node.id === 'src' || node.id === 'dst'
                      ? 'bg-blue-600 border-blue-700 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {node.id === 'src' || node.id === 'dst' ? (
                    <Laptop size={22} />
                  ) : (
                    <RouterIcon size={22} />
                  )}
                </div>

                {/* Node Label Tag */}
                <div className="mt-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] sm:text-xs font-bold text-white whitespace-nowrap shadow-xs">
                  {node.name}
                </div>

                {/* Flying Packet Indicator if transmitting */}
                {isCurrentHop && (
                  <div className="absolute -top-6 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider animate-bounce">
                    📦 {message.slice(0, 8)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls & Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Simulation Controls (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Simulation Controls
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message to transmit..."
                  disabled={simState === 'transmitting'}
                  className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                {simState === 'idle' || simState === 'delivered' ? (
                  <button
                    onClick={handleStartSimulation}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-500/25 transition-all cursor-pointer transform hover:scale-102 active:scale-98"
                  >
                    <Send size={15} />
                    <span>Send Packet</span>
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
                  >
                    <RotateCcw size={15} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Speed Multipliers & Status */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Speed:</span>
                {([1, 2, 4] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      soundFx.playClick();
                      setSpeedMultiplier(spd);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      speedMultiplier === spd
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {simState === 'transmitting' && (
                  <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                    <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                    Transmitting...
                  </span>
                )}
                {simState === 'delivered' && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 size={14} />
                    Delivered
                  </span>
                )}
                {simState === 'idle' && <span>Ready to transmit</span>}
              </div>
            </div>
          </div>

          {/* Route Information Card (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3 shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Route Information
                </p>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-mono px-2 py-0.5 rounded-md">
                  IPv4 Forwarding
                </span>
              </div>

              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-slate-400">Path:</span>
                  <span className="text-white text-right max-w-[200px] truncate" title={sim.path.join(' → ')}>
                    {sim.sourceCity} → ... → {sim.destinationCity}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-slate-400">Hops:</span>
                  <span className="text-teal-300 font-bold">{sim.hops} Intermediate Routers</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-slate-400">Estimated Latency:</span>
                  <span className="text-teal-300 font-bold">{sim.totalTimeMs} ms</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Routing Status:</span>
                  <span className={`font-bold ${simState === 'delivered' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {simState === 'delivered' ? '✓ Delivered Successfully' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Packet Logs */}
            <div className="bg-black/40 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 max-h-24 overflow-y-auto">
              {logMessages.length > 0 ? (
                logMessages.map((msg, i) => (
                  <p key={i} className="text-emerald-300/90 leading-tight mb-1">
                    {msg}
                  </p>
                ))
              ) : (
                <p className="text-slate-500 italic">Click "Send Packet" to begin trace...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Action Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            soundFx.playClick();
            onPrev();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Previous: Concept</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNext();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold transition-all transform hover:scale-102 active:scale-98 shadow-md shadow-teal-500/25 cursor-pointer"
        >
          <span>Next: Practice Quiz</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
