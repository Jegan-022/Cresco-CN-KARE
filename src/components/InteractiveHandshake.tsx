import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Monitor, 
  Server, 
  CheckCircle, 
  ArrowRight, 
  Info,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';

export const InteractiveHandshake: React.FC = () => {
  // Step 0: Idle/Closed
  // Step 1: Client sends SYN ->
  // Step 2: Server receives SYN, sends SYN-ACK <-
  // Step 3: Client receives SYN-ACK, sends ACK ->
  // Step 4: Connection Established!
  const [step, setStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setStep((prev) => (prev >= 4 ? 1 : prev + 1));
      }, 3200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReplay = () => {
    setStep(1);
    setIsPlaying(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Interactive Protocol Simulation
            </span>
            <span className="text-xs text-slate-500 font-medium">RFC 793 Specification</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">TCP 3-Way Handshake (SYN, SYN-ACK, ACK)</h3>
        </div>

        {/* Animation Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {isPlaying ? (
            <button
              id="handshake-pause-btn"
              onClick={handlePause}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              id="handshake-play-btn"
              onClick={handlePlay}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play</span>
            </button>
          )}

          <button
            id="handshake-replay-btn"
            onClick={handleReplay}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Step Selector Pills */}
      <div className="flex items-center space-x-2 my-4 overflow-x-auto pb-1 text-xs">
        {[
          { num: 1, label: 'Step 1: SYN' },
          { num: 2, label: 'Step 2: SYN-ACK' },
          { num: 3, label: 'Step 3: ACK' },
          { num: 4, label: 'Established' },
        ].map((s) => (
          <button
            key={s.num}
            id={`step-pill-${s.num}`}
            onClick={() => {
              setStep(s.num);
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              step === s.num
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Visual Diagram Stage */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 relative overflow-hidden my-4">
        
        {/* Connection Established Banner */}
        {step === 4 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full text-xs font-semibold shadow-xs animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Connection Established! Ready for Full-Duplex Data Transfer</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 relative min-h-[260px] items-center">
          
          {/* CLIENT */}
          <div className="flex flex-col items-center text-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-blue-500 shadow-sm flex items-center justify-center text-blue-600 mb-2">
              <Monitor className="w-8 h-8" />
            </div>
            <span className="font-bold text-slate-900 text-sm">CLIENT (Host A)</span>
            <span className="text-[11px] font-mono text-slate-500">192.168.1.50 : 54321</span>
            
            {/* Client State Badge */}
            <div className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold">
              {step === 1 && (
                <span className="text-amber-700 bg-amber-50 border-amber-200">STATE: SYN_SENT</span>
              )}
              {step === 2 && (
                <span className="text-blue-700 bg-blue-50 border-blue-200">STATE: SYN_SENT</span>
              )}
              {step >= 3 && (
                <span className="text-emerald-700 bg-emerald-50 border-emerald-200">STATE: ESTABLISHED</span>
              )}
            </div>
          </div>

          {/* SERVER */}
          <div className="flex flex-col items-center text-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-indigo-600 shadow-sm flex items-center justify-center text-indigo-600 mb-2">
              <Server className="w-8 h-8" />
            </div>
            <span className="font-bold text-slate-900 text-sm">SERVER (Host B)</span>
            <span className="text-[11px] font-mono text-slate-500">10.0.0.1 : 80 (HTTP)</span>
            
            {/* Server State Badge */}
            <div className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold">
              {step === 1 && (
                <span className="text-slate-600 bg-slate-100 border-slate-200">STATE: LISTEN</span>
              )}
              {step === 2 && (
                <span className="text-amber-700 bg-amber-50 border-amber-200">STATE: SYN_RCVD</span>
              )}
              {step >= 3 && (
                <span className="text-emerald-700 bg-emerald-50 border-emerald-200">STATE: ESTABLISHED</span>
              )}
            </div>
          </div>

          {/* Animated Message Flow Layer */}
          <div className="absolute inset-x-12 inset-y-10 flex flex-col justify-center pointer-events-none">
            
            {/* Flow 1: Client -> Server SYN */}
            <div className={`transition-all transform-gpu duration-500 my-2 ${step === 1 ? 'opacity-100 scale-100' : 'opacity-25'}`}>
              <div className="flex items-center justify-between text-xs font-semibold px-2 mb-1">
                <span className="text-blue-600 font-mono">SYN (Seq = 100)</span>
                <span className="text-[11px] text-slate-400">Connection Request</span>
              </div>
              <div className="relative h-2 bg-blue-100 rounded-full overflow-hidden border border-blue-200">
                <div 
                  className={`h-full bg-blue-600 rounded-full transition-all transform-gpu duration-1000 ${
                    step === 1 ? 'w-full' : step > 1 ? 'w-full opacity-30' : 'w-0'
                  }`}
                />
              </div>
              <div className="flex justify-end text-[10px] text-blue-600 font-bold mt-0.5">
                <span>──────────────────────►</span>
              </div>
            </div>

            {/* Flow 2: Server -> Client SYN-ACK */}
            <div className={`transition-all transform-gpu duration-500 my-2 ${step === 2 ? 'opacity-100 scale-100' : 'opacity-25'}`}>
              <div className="flex items-center justify-between text-xs font-semibold px-2 mb-1">
                <span className="text-[11px] text-slate-400">Acknowledgment & Sync</span>
                <span className="text-indigo-600 font-mono">SYN + ACK (Seq = 300, Ack = 101)</span>
              </div>
              <div className="relative h-2 bg-indigo-100 rounded-full overflow-hidden border border-indigo-200">
                <div 
                  className={`h-full bg-indigo-600 rounded-full transition-all transform-gpu duration-1000 ml-auto ${
                    step === 2 ? 'w-full' : step > 2 ? 'w-full opacity-30' : 'w-0'
                  }`}
                />
              </div>
              <div className="flex justify-start text-[10px] text-indigo-600 font-bold mt-0.5">
                <span>◄──────────────────────</span>
              </div>
            </div>

            {/* Flow 3: Client -> Server ACK */}
            <div className={`transition-all transform-gpu duration-500 my-2 ${step >= 3 ? 'opacity-100 scale-100' : 'opacity-25'}`}>
              <div className="flex items-center justify-between text-xs font-semibold px-2 mb-1">
                <span className="text-emerald-700 font-mono">ACK (Seq = 101, Ack = 301)</span>
                <span className="text-[11px] text-slate-400">Final Confirmation</span>
              </div>
              <div className="relative h-2 bg-emerald-100 rounded-full overflow-hidden border border-emerald-200">
                <div 
                  className={`h-full bg-emerald-600 rounded-full transition-all transform-gpu duration-1000 ${
                    step >= 3 ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
              <div className="flex justify-end text-[10px] text-emerald-600 font-bold mt-0.5">
                <span>──────────────────────►</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Explanatory Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        
        <div className={`p-3.5 rounded-xl border transition-all transform-gpu ${
          step === 1 ? 'bg-blue-50/70 border-blue-200' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-1">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">1</span>
            <span>Client Requests Connection</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Client generates an Initial Sequence Number (e.g. <strong>Seq = 100</strong>) and transmits a packet with the <strong>SYN</strong> control flag set.
          </p>
        </div>

        <div className={`p-3.5 rounded-xl border transition-all transform-gpu ${
          step === 2 ? 'bg-indigo-50/70 border-indigo-200' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-1">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">2</span>
            <span>Server Acknowledges</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Server responds with <strong>SYN + ACK</strong>, acknowledging client's sequence (<strong>Ack = 101</strong>) and providing its own sequence (<strong>Seq = 300</strong>).
          </p>
        </div>

        <div className={`p-3.5 rounded-xl border transition-all transform-gpu ${
          step >= 3 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-1">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">3</span>
            <span>Client Confirms</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Client responds with <strong>ACK</strong> (<strong>Ack = 301</strong>). Both sides now agree on sequence synchronization, and bidirectional data transmission begins.
          </p>
        </div>

      </div>

      {/* Key Takeaway Banner */}
      <div className="mt-4 p-3 bg-blue-50/80 border border-blue-200 rounded-lg flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-900">
          <strong className="font-semibold">Key Takeaway:</strong> TCP establishes a reliable, connection-oriented channel using a three-step handshake before transmitting any application payload.
        </div>
      </div>

    </div>
  );
};
