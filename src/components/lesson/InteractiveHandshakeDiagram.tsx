import React, { useState } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { Laptop, Server, Check, ArrowRight, ArrowLeft, RotateCcw, Info } from 'lucide-react';

interface HandshakeProps {
  onStepComplete?: (step: number) => void;
}

export const InteractiveHandshakeDiagram: React.FC<HandshakeProps> = ({ onStepComplete }) => {
  // Step: 0: uninitiated, 1: SYN sent, 2: SYN-ACK returned, 3: ACK sent (established)
  const [activeStep, setActiveStep] = useState<number>(0);

  const stepsInfo = [
    {
      name: 'SYN',
      direction: 'right',
      flags: 'SYN=1, ACK=0',
      seq: 'Seq = 100',
      description: 'Client sends SYN to synchronize initial sequence number (ISN) and request connection.',
      byteExplanation: 'The client says: "Hello server! I would like to start a connection. My initial sequence number is 100."',
    },
    {
      name: 'SYN-ACK',
      direction: 'left',
      flags: 'SYN=1, ACK=1',
      seq: 'Seq = 300, Ack = 101',
      description: 'Server acknowledges client ISN (Ack=101) and synchronizes its own sequence number (Seq=300).',
      byteExplanation: 'The server replies: "I heard you! I acknowledge 100 (expecting 101), and my own sequence number is 300."',
    },
    {
      name: 'ACK',
      direction: 'right',
      flags: 'SYN=0, ACK=1',
      seq: 'Seq = 101, Ack = 301',
      description: 'Client acknowledges server ISN (Ack=301). Connection moves to ESTABLISHED state.',
      byteExplanation: 'The client confirms: "Received! Connection is now officially ESTABLISHED. We can transfer data safely!"',
    },
  ];

  const handleTriggerStep = (stepIdx: number) => {
    soundFx.playClick();
    setActiveStep(stepIdx + 1);
    soundFx.playPacketPop();
    if (onStepComplete) {
      onStepComplete(stepIdx + 1);
    }
  };

  const handleReset = () => {
    soundFx.playClick();
    setActiveStep(0);
  };

  return (
    <div className="bg-[#F7F5F0] dark:bg-[#111827] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 select-none">
      
      {/* Header & Status Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase text-[#3157D5] dark:text-[#6D8CFF] tracking-wider">
            RFC 793 STATE MACHINE
          </span>
          <h4 className="text-base font-black text-[#172033] dark:text-[#F9FAFB]">
            TCP 3-Way Handshake
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
            activeStep === 3
              ? 'bg-[#35A86B]/15 text-[#35A86B] border border-[#35A86B]/30'
              : 'bg-white dark:bg-slate-800 text-[#64748B] border border-[#E5E0D8] dark:border-slate-700'
          }`}>
            {activeStep === 0 ? 'CLOSED' : activeStep === 1 ? 'SYN_SENT' : activeStep === 2 ? 'SYN_RCVD' : 'ESTABLISHED ✓'}
          </span>

          {activeStep > 0 && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl text-[#64748B] hover:text-[#172033] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Reset handshake"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Visual Endpoints & Transmission Rails */}
      <div className="relative py-4 px-2 sm:px-6">
        <div className="flex items-center justify-between">
          
          {/* Client Endpoint */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              activeStep > 0
                ? 'bg-[#3157D5] text-white shadow-xs scale-105'
                : 'bg-white dark:bg-slate-800 text-[#64748B] border border-[#E5E0D8] dark:border-slate-700'
            }`}>
              <Laptop size={26} />
            </div>
            <span className="text-xs font-black mt-2 font-mono">CLIENT</span>
            <span className="text-[10px] font-mono text-[#64748B]">Port 49152</span>
          </div>

          {/* Interactive Traversal Channels */}
          <div className="flex-1 mx-4 sm:mx-8 space-y-3">
            
            {/* 1. SYN Line */}
            <div className="relative">
              <button
                onClick={() => handleTriggerStep(0)}
                disabled={activeStep > 0}
                className={`w-full py-2 px-3 rounded-xl border-2 flex items-center justify-between text-xs font-mono font-black transition-all cursor-pointer ${
                  activeStep >= 1
                    ? 'bg-[#3157D5] text-white border-[#2442B0] shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-[#3157D5] text-[#3157D5] hover:bg-[#3157D5]/10 active:scale-[0.99]'
                }`}
              >
                <span>1. SYN ──→</span>
                <span className="text-[10px] opacity-80">Seq=100</span>
              </button>
              {activeStep === 1 && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#35A86B] animate-ping" />
              )}
            </div>

            {/* 2. SYN-ACK Line */}
            <div className="relative">
              <button
                onClick={() => handleTriggerStep(1)}
                disabled={activeStep !== 1}
                className={`w-full py-2 px-3 rounded-xl border-2 flex items-center justify-between text-xs font-mono font-black transition-all ${
                  activeStep >= 2
                    ? 'bg-[#7957C7] text-white border-[#5A389E] shadow-2xs'
                    : activeStep === 1
                    ? 'bg-white dark:bg-slate-800 border-[#7957C7] text-[#7957C7] hover:bg-[#7957C7]/10 cursor-pointer animate-pulse'
                    : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className="text-[10px] opacity-80">Seq=300, Ack=101</span>
                <span>←── 2. SYN-ACK</span>
              </button>
            </div>

            {/* 3. ACK Line */}
            <div className="relative">
              <button
                onClick={() => handleTriggerStep(2)}
                disabled={activeStep !== 2}
                className={`w-full py-2 px-3 rounded-xl border-2 flex items-center justify-between text-xs font-mono font-black transition-all ${
                  activeStep >= 3
                    ? 'bg-[#35A86B] text-white border-[#288654] shadow-2xs'
                    : activeStep === 2
                    ? 'bg-white dark:bg-slate-800 border-[#35A86B] text-[#35A86B] hover:bg-[#35A86B]/10 cursor-pointer animate-pulse'
                    : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>3. ACK ──→</span>
                <span className="text-[10px] opacity-80">Seq=101, Ack=301</span>
              </button>
            </div>

          </div>

          {/* Server Endpoint */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              activeStep >= 2
                ? 'bg-[#35A86B] text-white shadow-xs scale-105'
                : 'bg-white dark:bg-slate-800 text-[#64748B] border border-[#E5E0D8] dark:border-slate-700'
            }`}>
              <Server size={26} />
            </div>
            <span className="text-xs font-black mt-2 font-mono">SERVER</span>
            <span className="text-[10px] font-mono text-[#64748B]">Port 443 (HTTPS)</span>
          </div>

        </div>
      </div>

      {/* Dynamic Explanation Panel for Active Handshake Stage */}
      {activeStep > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-800 text-xs sm:text-sm space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2 font-black text-[#3157D5] dark:text-[#6D8CFF]">
            <Info size={16} />
            <span>Step {activeStep}: {stepsInfo[activeStep - 1].name} ({stepsInfo[activeStep - 1].flags})</span>
          </div>
          <p className="text-[#475569] dark:text-[#D1D5DB] font-medium leading-relaxed">
            {stepsInfo[activeStep - 1].description}
          </p>
          <div className="p-2.5 rounded-xl bg-[#F7F5F0] dark:bg-[#111827] text-[11px] font-semibold text-[#172033] dark:text-[#F9FAFB] italic">
            Byte: "{stepsInfo[activeStep - 1].byteExplanation}"
          </div>
        </div>
      )}

      {activeStep === 0 && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-800 text-center text-xs text-[#64748B] font-medium">
          👉 Click the <strong className="text-[#3157D5]">1. SYN</strong> button above to start the 3-way handshake!
        </div>
      )}

    </div>
  );
};
