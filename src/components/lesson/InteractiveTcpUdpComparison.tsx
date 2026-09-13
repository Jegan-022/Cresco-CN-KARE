import React, { useState } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { ShieldCheck, Zap, Layers, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const InteractiveTcpUdpComparison: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>('reliability');

  const properties = [
    {
      id: 'reliability',
      name: 'Reliability & Delivery',
      icon: ShieldCheck,
      tcp: 'Reliable (Zero lost packets, automatic retransmissions)',
      udp: 'Unreliable / Best-Effort (No retransmission)',
      details: 'TCP assigns sequence numbers to every byte. If an ACK is not received before timeout, TCP resends the packet. UDP simply transmits datagrams without checking arrival.',
    },
    {
      id: 'connection',
      name: 'Connection State',
      icon: Layers,
      tcp: 'Connection-Oriented (Requires 3-way handshake)',
      udp: 'Connectionless (Fire-and-forget, zero setup delay)',
      details: 'TCP negotiates state variables and window buffers before sending payload. UDP starts transmitting immediately with 0 RTT setup latency.',
    },
    {
      id: 'overhead',
      name: 'Header Overhead',
      icon: Zap,
      tcp: '20–60 Bytes Header (Flags, Sequence, Ack, Window)',
      udp: 'Fixed 8 Bytes Header (Ports, Length, Checksum)',
      details: 'TCP header carries 20 bytes minimum for sequence numbers, acknowledgment numbers, and flow control. UDP uses a compact 8-byte header.',
    },
    {
      id: 'speed',
      name: 'Speed & Latency',
      icon: Clock,
      tcp: 'Slower (Controlled flow rate, congestion backoff)',
      udp: 'Faster (Continuous real-time throughput)',
      details: 'TCP throttles bandwidth when packet drops occur to prevent network congestion. UDP streams at the constant application data rate.',
    },
  ];

  const handleSelect = (id: string) => {
    soundFx.playClick();
    setSelectedProperty(id);
  };

  const current = properties.find((p) => p.id === selectedProperty) || properties[0];

  return (
    <div className="bg-[#F7F5F0] dark:bg-[#111827] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 select-none">
      
      <div>
        <span className="text-[10px] font-mono font-bold uppercase text-[#7957C7] tracking-wider">
          LAYER 4 ARCHITECTURAL COMPARISON
        </span>
        <h4 className="text-base font-black text-[#172033] dark:text-[#F9FAFB]">
          TCP vs UDP Side-by-Side Matrix
        </h4>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
          Tap any property to inspect protocol tradeoffs.
        </p>
      </div>

      {/* Property Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {properties.map((p) => {
          const isSelected = selectedProperty === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-white dark:bg-[#1F2937] border-[#3157D5] dark:border-[#6D8CFF] shadow-xs'
                  : 'bg-white/60 dark:bg-slate-800/60 border-[#E5E0D8] dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <Icon size={16} className={isSelected ? 'text-[#3157D5] dark:text-[#6D8CFF]' : 'text-[#64748B]'} />
              <span className="text-xs font-bold text-[#172033] dark:text-[#F9FAFB] leading-tight">
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* TCP Column */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border-2 border-[#3157D5]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded-md bg-[#3157D5] text-white">
              TCP
            </span>
            <span className="text-[10px] font-mono text-[#3157D5] font-bold">RFC 793</span>
          </div>
          <p className="text-sm font-extrabold text-[#172033] dark:text-[#F9FAFB] pt-1">
            {current.tcp}
          </p>
        </div>

        {/* UDP Column */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1F2937] border-2 border-[#5B7CFA]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded-md bg-[#5B7CFA] text-white">
              UDP
            </span>
            <span className="text-[10px] font-mono text-[#5B7CFA] font-bold">RFC 768</span>
          </div>
          <p className="text-sm font-extrabold text-[#172033] dark:text-[#F9FAFB] pt-1">
            {current.udp}
          </p>
        </div>

      </div>

      {/* Detailed Technical Insight */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-800 text-xs sm:text-sm">
        <span className="font-bold text-[#3157D5] dark:text-[#6D8CFF] block mb-1">
          Technical Insight:
        </span>
        <p className="text-[#475569] dark:text-[#D1D5DB] font-medium leading-relaxed">
          {current.details}
        </p>
      </div>

    </div>
  );
};
