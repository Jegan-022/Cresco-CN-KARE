import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronRight, CheckCircle2, Globe, Shield, Terminal, ArrowDown } from 'lucide-react';

interface OsiLayerItem {
  layerNumber: number;
  name: string;
  pdu: string;
  color: string;
  summary: string;
  concepts: string[];
  protocols: string[];
}

export const OSI_LAYERS: OsiLayerItem[] = [
  {
    layerNumber: 7,
    name: 'Application Layer',
    pdu: 'Data',
    color: '#2563EB',
    summary: 'Network services directly exposed to end-user applications and human-computer interaction.',
    concepts: ['Web Browsing', 'Domain Name Resolution', 'File Transfers', 'REST APIs'],
    protocols: ['HTTP/HTTPS', 'DNS', 'SSH', 'FTP', 'SMTP'],
  },
  {
    layerNumber: 6,
    name: 'Presentation Layer',
    pdu: 'Data',
    color: '#4F46E5',
    summary: 'Data syntax translation, cryptographic encryption, and serialization/compression standards.',
    concepts: ['TLS/SSL Encryption', 'ASCII/UTF-8 Encoding', 'Compression (gzip)', 'Serialization'],
    protocols: ['TLS 1.3', 'JPEG', 'MIME', 'JSON/Protobuf'],
  },
  {
    layerNumber: 5,
    name: 'Session Layer',
    pdu: 'Data',
    color: '#0891B2',
    summary: 'Establishes, maintains, synchronizes, and terminates dialogues between communicating hosts.',
    concepts: ['Session Checkpoints', 'Half/Full Duplex Sync', 'RPC Remote Calls', 'Token Management'],
    protocols: ['RPC', 'NetBIOS', 'PPTP', 'Sockets API'],
  },
  {
    layerNumber: 4,
    name: 'Transport Layer',
    pdu: 'Segment (TCP) / Datagram (UDP)',
    color: '#16A34A',
    summary: 'End-to-end process-to-process delivery, flow control, congestion mitigation, and reliability.',
    concepts: ['Port Multiplexing', '3-Way Handshake', 'Sliding Window', 'Congestion Avoidance'],
    protocols: ['TCP', 'UDP', 'QUIC', 'SCTP'],
  },
  {
    layerNumber: 3,
    name: 'Network Layer',
    pdu: 'Packet',
    color: '#D97706',
    summary: 'Logical host addressing, hierarchical subnetting, best-path discovery, and packet routing.',
    concepts: ['IPv4/IPv6 Addressing', 'CIDR Subnetting', 'Distance Vector / Link State', 'NAT Translation'],
    protocols: ['IPv4', 'IPv6', 'ICMP', 'OSPF', 'BGP'],
  },
  {
    layerNumber: 2,
    name: 'Data Link Layer',
    pdu: 'Frame',
    color: '#DC2626',
    summary: 'Physical MAC addressing, hop-to-hop framing, collision detection, and switch forwarding.',
    concepts: ['48-bit MAC Addressing', 'Ethernet Framing', 'CSMA/CD & ARP Resolution', 'VLAN Tagging'],
    protocols: ['Ethernet (802.3)', 'Wi-Fi (802.11)', 'ARP', 'PPP'],
  },
  {
    layerNumber: 1,
    name: 'Physical Layer',
    pdu: 'Bits',
    color: '#64748B',
    summary: 'Raw bitstream transmission over physical media using electrical, optical, or radio signals.',
    concepts: ['Bit Signaling', 'Twisted Pair Copper', 'Single/Multi-Mode Fiber', 'Modulation & Bandwidth'],
    protocols: ['1000BASE-T', 'Fiber Optic', 'RJ-45', 'Wireless RF'],
  },
];

export const OsiLayerStack: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedLayerNum, setSelectedLayerNum] = useState<number>(3); // Network Layer default

  const activeLayer = OSI_LAYERS.find((l) => l.layerNumber === selectedLayerNum) || OSI_LAYERS[4];

  return (
    <div className={`w-full ${className}`}>
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider font-mono">
          <Layers size={14} />
          <span>Interactive Architecture</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Learn by Layers
        </h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          The 7-layer OSI model structures how data travels from an application down to physical electrical pulses. Click each layer to inspect protocols and mechanisms.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        
        {/* Left Column: Vertical Stack of 7 Layers */}
        <div className="lg:col-span-6 space-y-2.5">
          {OSI_LAYERS.map((layer) => {
            const isSelected = selectedLayerNum === layer.layerNumber;

            return (
              <div
                key={layer.layerNumber}
                onClick={() => setSelectedLayerNum(layer.layerNumber)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'bg-white dark:bg-[#172033] border-blue-500 shadow-sm translate-x-1.5'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-slate-300'
                    }`}
                  >
                    L{layer.layerNumber}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{layer.name}</span>
                      {layer.layerNumber === 3 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-bold">
                          KLU Unit 3
                        </span>
                      )}
                      {layer.layerNumber === 4 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                          KLU Unit 4
                        </span>
                      )}
                      {layer.layerNumber === 7 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold">
                          KLU Unit 5
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      PDU: <span className="font-mono text-slate-700 dark:text-slate-300">{layer.pdu}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span className="hidden sm:inline font-mono">{layer.protocols[0]}</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Layer Inspector */}
        <div className="lg:col-span-6 bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-6 sticky top-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLayer.layerNumber}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                    OSI Layer {activeLayer.layerNumber}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {activeLayer.name}
                  </h4>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">
                  PDU: {activeLayer.pdu}
                </div>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeLayer.summary}
              </div>

              {/* Core Concepts */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Key Concepts Mastered
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {activeLayer.concepts.map((concept, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>{concept}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol Suite */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Associated Protocols & Standards
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeLayer.protocols.map((proto, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold"
                    >
                      {proto}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
