import React, { useState } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { Globe, Search, Server, Laptop, CheckCircle2, ArrowRight, ArrowDown } from 'lucide-react';

export const InteractiveDnsResolution: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [domainInput, setDomainInput] = useState<string>('www.example.com');

  const stages = [
    {
      id: 'browser',
      title: '1. BROWSER REQUEST',
      icon: Laptop,
      color: '#3157D5',
      summary: 'User requests "www.example.com". Browser checks local cache and dispatch UDP port 53 query.',
      explanation: 'The browser first checks its local DNS cache and OS hosts file. When uncached, it dispatches an outbound query to the local recursive resolver.',
    },
    {
      id: 'query',
      title: '2. RECURSIVE DNS QUERY',
      icon: Search,
      color: '#7957C7',
      summary: 'Recursive resolver queries Root (.) and .com TLD name servers.',
      explanation: 'The resolver queries the 13 root name server clusters to find who owns the ".com" TLD, then queries the .com TLD server.',
    },
    {
      id: 'server',
      title: '3. AUTHORITATIVE DNS SERVER',
      icon: Server,
      color: '#F0A63A',
      summary: 'Authoritative server inspects the DNS zone file and looks up the A record.',
      explanation: 'The authoritative name server for example.com locates the A Record and returns the authoritative 32-bit IPv4 address: 93.184.216.34.',
    },
    {
      id: 'ip',
      title: '4. IP ADDRESS RETURNED',
      icon: CheckCircle2,
      color: '#35A86B',
      summary: 'Target IP 93.184.216.34 is cached locally and handed to the browser network stack.',
      explanation: 'The browser receives the resolved IP address and stores it in cache with the specified Time-To-Live (TTL) value.',
    },
    {
      id: 'web',
      title: '5. WEB SERVER HTTP CONNECTION',
      icon: Globe,
      color: '#3157D5',
      summary: 'Browser connects to 93.184.216.34:443 via TCP handshake and renders webpage.',
      explanation: 'With the IP address resolved, the browser initiates the TCP 3-way handshake to Port 443 and fetches the web application assets!',
    },
  ];

  const handleSelectStage = (idx: number) => {
    soundFx.playPacketPop();
    setActiveStage(idx);
  };

  const current = stages[activeStage];

  return (
    <div className="bg-[#F7F5F0] dark:bg-[#111827] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 select-none">
      
      <div>
        <span className="text-[10px] font-mono font-bold uppercase text-[#7957C7] tracking-wider">
          APPLICATION LAYER RESOLUTION
        </span>
        <h4 className="text-base font-black text-[#172033] dark:text-[#F9FAFB]">
          DNS Resolution Lifecycle
        </h4>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
          "How domain names turn into routeable IP addresses."
        </p>
      </div>

      {/* Simulated Browser URL bar */}
      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800">
        <div className="flex items-center gap-1 px-2 text-[#64748B]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D95C5C]/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F0A63A]/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#35A86B]/60" />
        </div>
        <div className="flex-1 px-3 py-1.5 rounded-xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-700 flex items-center gap-2 text-xs font-mono">
          <Globe size={13} className="text-[#3157D5]" />
          <span className="text-[#172033] dark:text-white font-bold">{domainInput}</span>
        </div>
        <button
          onClick={() => handleSelectStage((activeStage + 1) % stages.length)}
          className="px-3 py-1.5 rounded-xl bg-[#3157D5] hover:bg-[#2442B0] text-white text-xs font-bold cursor-pointer transition-all"
        >
          Resolve →
        </button>
      </div>

      {/* 5 Sequential Interactive Stages */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {stages.map((st, idx) => {
          const isSelected = activeStage === idx;
          const isPast = idx < activeStage;
          const Icon = st.icon;

          return (
            <button
              key={st.id}
              onClick={() => handleSelectStage(idx)}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-white dark:bg-[#1F2937] border-[#3157D5] shadow-xs scale-102'
                  : isPast
                  ? 'bg-[#35A86B]/10 border-[#35A86B]/40 text-[#35A86B]'
                  : 'bg-white/60 dark:bg-slate-800/60 border-[#E5E0D8] dark:border-slate-700 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black">
                  {isPast ? '✓' : `0${idx + 1}`}
                </span>
                <Icon size={16} />
              </div>
              <span className="text-xs font-bold leading-tight">
                {st.title.replace(/^\d+\.\s*/, '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Explanation */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 space-y-2 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h5 className="font-extrabold text-sm text-[#172033] dark:text-[#F9FAFB]">
            {current.title}
          </h5>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3157D5]/15 text-[#3157D5] font-bold">
            STAGE {activeStage + 1} OF 5
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D1D5DB] font-medium leading-relaxed">
          {current.explanation}
        </p>
      </div>

    </div>
  );
};
