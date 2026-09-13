import React from 'react';

interface ProtocolItem {
  name: string;
  category: string;
  badgeColor: string;
  dotColor: string;
}

const DEFAULT_PROTOCOLS: ProtocolItem[] = [
  { name: 'TCP 3-Way Handshake', category: 'Transport', badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10', dotColor: 'bg-blue-400' },
  { name: 'IPv4 & IPv6 Subnetting', category: 'Network', badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10', dotColor: 'bg-cyan-400' },
  { name: 'BGP & Autonomous Systems', category: 'Routing', badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10', dotColor: 'bg-purple-400' },
  { name: 'DNS Recursive Resolver', category: 'Application', badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10', dotColor: 'bg-emerald-400' },
  { name: 'OSPF Dijkstra Shortest Path', category: 'Interior Gateway', badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10', dotColor: 'bg-amber-400' },
  { name: 'AIMD Congestion Control', category: 'Algorithms', badgeColor: 'border-pink-500/30 text-pink-400 bg-pink-500/10', dotColor: 'bg-pink-400' },
  { name: 'Wireshark Packet Trace', category: 'Analysis', badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10', dotColor: 'bg-indigo-400' },
  { name: 'QUIC / HTTP 3 Protocol', category: 'Next-Gen Web', badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10', dotColor: 'bg-emerald-400' },
  { name: 'CIDR VLSM Calculation', category: 'Addressing', badgeColor: 'border-teal-500/30 text-teal-400 bg-teal-500/10', dotColor: 'bg-teal-400' },
  { name: 'TLS 1.3 Handshake', category: 'Security', badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10', dotColor: 'bg-rose-400' },
];

export const ProtocolMarquee: React.FC<{ speed?: number; pauseOnHover?: boolean }> = ({
  pauseOnHover = true,
}) => {
  // Duplicate for seamless endless loop
  const list = [...DEFAULT_PROTOCOLS, ...DEFAULT_PROTOCOLS];

  return (
    <div className="relative w-full overflow-hidden py-4 border-y border-white/[0.06] bg-[#0E0F18]/80 backdrop-blur-md">
      {/* Edge Blur Gradients */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0B0B11] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0B0B11] to-transparent z-10" />

      {/* Marquee Track */}
      <div className={`flex w-max gap-4 animate-marquee ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}>
        {list.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs font-mono font-medium tracking-wide transition-transform duration-200 hover:scale-105 cursor-default select-none ${item.badgeColor}`}
          >
            <span className={`w-2 h-2 rounded-full ${item.dotColor} animate-pulse`} />
            <span className="text-slate-400 uppercase text-[10px] tracking-wider">{item.category}:</span>
            <span className="font-semibold text-white/90">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProtocolMarquee;
