import React, { useState } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { Sliders, AlertTriangle, CheckCircle2, Router, Laptop, Server, Zap } from 'lucide-react';

export const InteractiveCongestionSimulation: React.FC = () => {
  const [trafficRate, setTrafficRate] = useState<number>(3); // 1 to 10
  const bufferCapacity = 6;
  const currentQueue = Math.min(trafficRate, bufferCapacity);
  const isCongested = trafficRate > 4;
  const isDropping = trafficRate > bufferCapacity;

  const handleSliderChange = (val: number) => {
    soundFx.playClick();
    setTrafficRate(val);
    if (val > bufferCapacity) {
      soundFx.playIncorrect();
    } else {
      soundFx.playPacketPop();
    }
  };

  return (
    <div className="bg-[#F7F5F0] dark:bg-[#111827] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 select-none">
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase text-[#3157D5] dark:text-[#6D8CFF] tracking-wider">
            BUFFER QUEUE SIMULATION
          </span>
          <h4 className="text-base font-black text-[#172033] dark:text-[#F9FAFB]">
            Router Buffer & Queue Congestion
          </h4>
        </div>

        <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
          isDropping
            ? 'bg-[#D95C5C]/15 text-[#D95C5C] border border-[#D95C5C]/30 animate-pulse'
            : isCongested
            ? 'bg-[#F0A63A]/15 text-[#B45309] dark:text-[#F0A63A]'
            : 'bg-[#35A86B]/15 text-[#35A86B]'
        }`}>
          {isDropping ? 'PACKET LOSS' : isCongested ? 'CONGESTION RISK' : 'OPTIMAL FLOW'}
        </span>
      </div>

      {/* Visual Router Queue Buffer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 space-y-4">
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center">
            <Laptop size={22} className="text-[#3157D5]" />
            <span className="text-[10px] font-mono mt-1 font-bold">Transmitter</span>
          </div>

          {/* Router Buffer Box */}
          <div className="flex-1 mx-4 p-4 rounded-xl border-2 border-dashed border-[#3157D5]/40 bg-[#F7F5F0] dark:bg-[#111827]">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-2">
              <span>Router FIFO Queue</span>
              <span className="text-xs">
                {currentQueue} / {bufferCapacity} Slots
              </span>
            </div>

            {/* Visual Packets inside Queue */}
            <div className="grid grid-cols-6 gap-1.5 h-10 items-center">
              {Array.from({ length: bufferCapacity }).map((_, idx) => {
                const filled = idx < currentQueue;
                return (
                  <div
                    key={idx}
                    className={`h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-black transition-all ${
                      filled
                        ? isDropping
                          ? 'bg-[#D95C5C] text-white animate-pulse'
                          : isCongested
                          ? 'bg-[#F0A63A] text-white'
                          : 'bg-[#35A86B] text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {filled ? `PKT ${idx + 1}` : '—'}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Server size={22} className="text-[#35A86B]" />
            <span className="text-[10px] font-mono mt-1 font-bold">Receiver</span>
          </div>
        </div>

      </div>

      {/* Interactive Rate Control Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold font-mono">
          <span className="flex items-center gap-1.5 text-[#172033] dark:text-[#F9FAFB]">
            <Sliders size={14} className="text-[#3157D5]" />
            <span>Transmission Window / Sending Rate</span>
          </span>
          <span className="font-mono text-[#3157D5] dark:text-[#6D8CFF] font-black">
            {trafficRate * 10} Mbps
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="10"
          value={trafficRate}
          onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
          className="w-full accent-[#3157D5] cursor-pointer"
        />

        <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
          <span>Low (AIMD Halved)</span>
          <span>Balanced Throughput</span>
          <span className="text-[#D95C5C]">Bufferbloat / Loss</span>
        </div>
      </div>

      {isDropping ? (
        <div className="p-3 rounded-xl bg-[#D95C5C]/10 border border-[#D95C5C]/30 text-xs font-bold text-[#D95C5C] flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>Queue Overflow: Packets {bufferCapacity + 1}–{trafficRate} are dropped at the router! TCP reduces cwnd.</span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#35A86B]/10 border border-[#35A86B]/30 text-xs font-bold text-[#35A86B] flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Stable flow rate: Packets are served without queue latency spikes.</span>
        </div>
      )}

    </div>
  );
};
