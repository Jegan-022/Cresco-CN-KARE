import React, { useState } from 'react';
import { Layers, ArrowRight, ShieldCheck, Cpu, HardDrive, Globe, Radio } from 'lucide-react';

interface OsiLayer {
  number: number;
  name: string;
  pdu: string;
  protocols: string[];
  unitMapping: string;
  description: string;
  headerExample: string;
  color: string;
}

const OSI_LAYERS: OsiLayer[] = [
  {
    number: 7,
    name: 'Application Layer',
    pdu: 'Data (User Message)',
    protocols: ['HTTP/3', 'DNS', 'SMTP', 'SSH', 'FTP'],
    unitMapping: 'Unit 5 (5 Modules)',
    description: 'Interface between network services and software applications. Handles domain resolution, web requests, and encrypted payloads.',
    headerExample: 'GET /index.html HTTP/2 | Host: klu.edu',
    color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-300',
  },
  {
    number: 6,
    name: 'Presentation Layer',
    pdu: 'Formatted & Encrypted Data',
    protocols: ['TLS 1.3', 'ASCII', 'JSON', 'JPEG'],
    unitMapping: 'Unit 5 (Module 5)',
    description: 'Data representation, encryption, and compression. Translates network syntax into format consumed by application.',
    headerExample: 'TLS Record Layer: Handshake Protocol [Encrypted]',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
  },
  {
    number: 5,
    name: 'Session Layer',
    pdu: 'Session Payload',
    protocols: ['RPC', 'Sockets', 'NetBIOS', 'PPTP'],
    unitMapping: 'Unit 4 & 5 Integration',
    description: 'Manages sessions and dialogues between two host processes. Handles checkpointing and token recovery.',
    headerExample: 'Session ID: 0x9F4C2A1E | State: Active Sync',
    color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-300',
  },
  {
    number: 4,
    name: 'Transport Layer',
    pdu: 'Segment (TCP) / Datagram (UDP)',
    protocols: ['TCP', 'UDP', 'QUIC', 'SCTP'],
    unitMapping: 'Unit 4 (5 Modules)',
    description: 'End-to-end communication, reliability, flow control (sliding window), and AIMD congestion avoidance.',
    headerExample: 'Source Port: 54321 | Dest Port: 443 | SEQ: 1000 | ACK: 0 | Flags: [SYN]',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
  },
  {
    number: 3,
    name: 'Network Layer',
    pdu: 'Packet',
    protocols: ['IPv4', 'IPv6', 'ICMP', 'BGP', 'OSPF'],
    unitMapping: 'Unit 3 (7 Modules)',
    description: 'Logical IP addressing, shortest-path routing algorithms, packet fragmentation, and subnet masking.',
    headerExample: 'Src IP: 192.168.1.5 | Dst IP: 104.21.48.192 | TTL: 64 | Proto: 6 (TCP)',
    color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-300',
  },
  {
    number: 2,
    name: 'Data Link Layer',
    pdu: 'Frame',
    protocols: ['Ethernet (802.3)', 'Wi-Fi (802.11)', 'ARP', 'PPP'],
    unitMapping: 'Foundations & Packet Tracing',
    description: 'Physical MAC addressing, framing, media access control (CSMA/CD), and CRC error detection.',
    headerExample: 'Dst MAC: 00:1A:2B:3C:4D:5E | Src MAC: A4:83:E7:2B:10:9C | Type: IPv4',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-300',
  },
  {
    number: 1,
    name: 'Physical Layer',
    pdu: 'Raw Bitstream (0s and 1s)',
    protocols: ['Fiber Optic', 'Cat6 Twisted Pair', 'Radio RF'],
    unitMapping: 'Hardware & Transmission Media',
    description: 'Electrical voltages, light pulses, and radio frequencies propagating through transmission media.',
    headerExample: 'Encoding: Manchester / 4B5B | Voltage: +5V / -5V pulses',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-300',
  },
];

export const InteractiveOsiExplorer: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<OsiLayer>(OSI_LAYERS[3]); // Default to Transport Layer (Layer 4)

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0F101A] p-6 sm:p-8 shadow-2xl relative overflow-hidden font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Layers size={14} />
            <span>Interactive OSI 7-Layer Model</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Encapsulation & Architecture Inspector
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Click any layer to inspect protocol payload & syllabus mapping
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: 7 Interactive Layer Bars */}
        <div className="lg:col-span-6 space-y-2">
          {OSI_LAYERS.map((layer) => {
            const isSelected = activeLayer.number === layer.number;
            return (
              <button
                key={layer.number}
                onClick={() => setActiveLayer(layer)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? `bg-white/[0.08] border-white/30 shadow-lg scale-[1.01] ${layer.color}`
                    : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isSelected ? 'bg-white text-slate-950 shadow-sm' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    L{layer.number}
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      {layer.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      PDU: {layer.pdu}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                    {layer.unitMapping}
                  </span>
                  <ArrowRight size={14} className={isSelected ? 'text-white' : 'text-slate-600'} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Deep Layer Inspection Panel */}
        <div className="lg:col-span-6 rounded-2xl border border-white/[0.1] bg-[#141624] p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold">
              Layer {activeLayer.number} Detailed Inspector
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} />
              {activeLayer.unitMapping}
            </span>
          </div>

          <div>
            <h4 className="text-xl font-extrabold text-white">
              {activeLayer.name}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {activeLayer.description}
            </p>
          </div>

          {/* Protocols List */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
              Key Protocols Covered in Cresco CN:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeLayer.protocols.map((proto) => (
                <span
                  key={proto}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-slate-200"
                >
                  {proto}
                </span>
              ))}
            </div>
          </div>

          {/* Protocol Header Inspector Box */}
          <div className="p-4 rounded-xl bg-[#090A10] border border-white/[0.08] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              Simulated Wire Header Snapshot:
            </span>
            <div className="text-xs font-mono text-slate-200 bg-[#0B0C12] p-2.5 rounded-lg overflow-x-auto border border-white/5">
              {activeLayer.headerExample}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveOsiExplorer;
