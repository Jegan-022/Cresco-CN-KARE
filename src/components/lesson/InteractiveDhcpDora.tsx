import React, { useState } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { Laptop, Server, Check, ArrowRight, ArrowLeft } from 'lucide-react';

export const InteractiveDhcpDora: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const doraSteps = [
    {
      step: 1,
      acronym: 'D',
      title: 'DHCP DISCOVER',
      direction: 'right',
      color: '#3157D5',
      summary: 'Client broadcasts to 255.255.255.255 (Port 67) searching for active DHCP servers.',
      byteQuote: 'Client shouts: "Can anyone hear me? I need an IP address for this network!"',
    },
    {
      step: 2,
      acronym: 'O',
      title: 'DHCP OFFER',
      direction: 'left',
      color: '#7957C7',
      summary: 'Server reserves 192.168.1.50 and offers it with lease duration and default gateway.',
      byteQuote: 'Server replies: "I have IP 192.168.1.50 available for you with a 24-hour lease!"',
    },
    {
      step: 3,
      acronym: 'R',
      title: 'DHCP REQUEST',
      direction: 'right',
      color: '#F0A63A',
      summary: 'Client formally requests the offered IP and notifies all other servers to release holds.',
      byteQuote: 'Client says: "Thank you! I accept 192.168.1.50 as my assigned network address."',
    },
    {
      step: 4,
      acronym: 'A',
      title: 'DHCP ACK',
      direction: 'left',
      color: '#35A86B',
      summary: 'Server records assignment in its binding database and confirms configuration.',
      byteQuote: 'Server confirms: "ACK sent! You are officially configured. Welcome to the network!"',
    },
  ];

  const handleStep = (idx: number) => {
    soundFx.playClick();
    soundFx.playPacketPop();
    setActiveStep(idx + 1);
  };

  return (
    <div className="bg-[#F7F5F0] dark:bg-[#111827] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 select-none">
      
      <div>
        <span className="text-[10px] font-mono font-bold uppercase text-[#35A86B] tracking-wider">
          AUTOMATIC ADDRESS ASSIGNMENT
        </span>
        <h4 className="text-base font-black text-[#172033] dark:text-[#F9FAFB]">
          DHCP 4-Stage D-O-R-A Protocol
        </h4>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
          Follow the 4 sequential messages exchanged between client and DHCP server.
        </p>
      </div>

      {/* Visual Endpoints */}
      <div className="flex items-center justify-between gap-4 py-2 px-2 sm:px-4">
        {/* Client */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#3157D5] text-white flex items-center justify-center shadow-xs">
            <Laptop size={26} />
          </div>
          <span className="text-xs font-black mt-2 font-mono">NEW CLIENT</span>
          <span className="text-[10px] font-mono text-[#64748B]">0.0.0.0:68</span>
        </div>

        {/* Message Rail */}
        <div className="flex-1 mx-4 space-y-2.5">
          {doraSteps.map((d, idx) => {
            const isCompleted = activeStep > idx;
            const isCurrent = activeStep === idx;

            return (
              <button
                key={d.acronym}
                onClick={() => handleStep(idx)}
                className={`w-full py-2 px-3 rounded-xl border-2 flex items-center justify-between text-xs font-mono font-bold transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-[#35A86B] text-white border-[#288654] shadow-2xs'
                    : isCurrent
                    ? 'bg-white dark:bg-slate-800 border-[#3157D5] text-[#3157D5] animate-pulse shadow-xs'
                    : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-black/10 flex items-center justify-center font-black">
                    {d.acronym}
                  </span>
                  <span>{d.title}</span>
                </div>
                <span>{d.direction === 'right' ? 'Client ➔ Server' : 'Server ➔ Client'}</span>
              </button>
            );
          })}
        </div>

        {/* Server */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#35A86B] text-white flex items-center justify-center shadow-xs">
            <Server size={26} />
          </div>
          <span className="text-xs font-black mt-2 font-mono">DHCP SERVER</span>
          <span className="text-[10px] font-mono text-[#64748B]">192.168.1.1:67</span>
        </div>
      </div>

      {activeStep > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-800 text-xs sm:text-sm space-y-1 animate-fadeIn">
          <div className="font-bold text-[#3157D5]">
            {doraSteps[activeStep - 1].title}:
          </div>
          <p className="text-[#475569] dark:text-[#D1D5DB] font-medium">
            {doraSteps[activeStep - 1].summary}
          </p>
          <div className="p-2 rounded-xl bg-[#F7F5F0] dark:bg-[#111827] text-[11px] font-semibold text-[#172033] dark:text-white italic">
            Byte: "{doraSteps[activeStep - 1].byteQuote}"
          </div>
        </div>
      )}

    </div>
  );
};
