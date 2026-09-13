import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, CheckCircle, Wifi, Shield, Cpu } from 'lucide-react';

interface SimulationScenario {
  id: string;
  name: string;
  command: string;
  protocol: string;
  badgeColor: string;
  logs: string[];
  latency: string;
  packetStatus: 'delivered' | 'encrypted' | 'synced';
}

const SCENARIOS: SimulationScenario[] = [
  {
    id: 'tcp',
    name: 'TCP 3-Way Handshake',
    command: 'cresco connect --proto tcp 192.168.1.10:443',
    protocol: 'TCP / Transport',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    logs: [
      '[CLI] Initializing TCP connection to 192.168.1.10:443...',
      '[OUT] [SEQ=1000, ACK=0] SYN ---> Server',
      '[IN ] [SEQ=5000, ACK=1001] <--- SYN-ACK Server',
      '[OUT] [SEQ=1001, ACK=5001] ACK ---> Server',
      '✓ Connection ESTABLISHED. Window Size: 65535 bytes. RTT: 12ms',
    ],
    latency: '12 ms',
    packetStatus: 'synced',
  },
  {
    id: 'ping',
    name: 'ICMP Echo (Ping)',
    command: 'ping -c 3 8.8.8.8',
    protocol: 'ICMP / Network',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    logs: [
      'PING 8.8.8.8 (8.8.8.8): 56 data bytes',
      '64 bytes from 8.8.8.8: icmp_seq=0 ttl=118 time=8.42 ms',
      '64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=7.98 ms',
      '64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=8.15 ms',
      '--- 8.8.8.8 ping statistics --- 3 packets transmitted, 0% packet loss',
    ],
    latency: '8.1 ms',
    packetStatus: 'delivered',
  },
  {
    id: 'dns',
    name: 'DNS Query (cresco.edu)',
    command: 'dig A cresco.klu.edu +short',
    protocol: 'DNS / Application',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    logs: [
      ';; Querying root nameserver [A.ROOT-SERVERS.NET]...',
      ';; Referred to .edu TLD servers...',
      ';; Authority response from NS1.KLU.EDU...',
      'cresco.klu.edu. 300 IN A 104.21.48.192',
      '✓ Resolved in 2 hops. Protocol: UDP Port 53. Response cached.',
    ],
    latency: '19 ms',
    packetStatus: 'delivered',
  },
  {
    id: 'tls',
    name: 'TLS 1.3 Handshake',
    command: 'openssl s_client -connect secure.klu.edu:443 -tls1_3',
    protocol: 'TLS / Security',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    logs: [
      'CONNECTED(00000003)',
      '---> ClientHello [KeyShare: x25519, Cipher: TLS_AES_256_GCM_SHA384]',
      '<--- ServerHello + EncryptedExtensions + Certificate + Finished',
      '---> Client Finished',
      '✓ Zero-Round-Trip (0-RTT) Session Key negotiated. AES-256 GCM active.',
    ],
    latency: '15 ms',
    packetStatus: 'encrypted',
  },
];

export const InteractiveTerminal: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>(SCENARIOS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>(SCENARIOS[0].logs);
  const timeoutsRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleRun = (scenario: SimulationScenario) => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setActiveScenario(scenario);
    setIsRunning(true);
    setDisplayedLogs([]);

    scenario.logs.forEach((log, index) => {
      const t = window.setTimeout(() => {
        setDisplayedLogs((prev) => [...prev, log]);
        if (index === scenario.logs.length - 1) {
          setIsRunning(false);
        }
      }, (index + 1) * 220);
      timeoutsRef.current.push(t);
    });
  };

  return (
    <div className="w-full rounded-2xl border border-white/[0.12] bg-[#0E1017]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden font-mono text-xs">
      {/* Window Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161822] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/40" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/40" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/40" />
          </div>
          <span className="ml-3 text-slate-400 text-xs font-mono font-medium flex items-center gap-2">
            <Terminal size={13} className="text-cyan-400" />
            <span>cresco-sim-sandbox ~ v2.4</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE LINK: 10 Gbps
          </span>
          <span className="text-[11px] text-slate-400 font-mono">RTT: {activeScenario.latency}</span>
        </div>
      </div>

      {/* Scenario Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#11131C] border-b border-white/[0.06] overflow-x-auto">
        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider pl-1">Presets:</span>
        {SCENARIOS.map((scenario) => {
          const isSelected = activeScenario.id === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleRun(scenario)}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
              } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Play size={11} className={isSelected ? 'text-cyan-400 fill-cyan-400' : 'text-slate-500'} />
              <span>{scenario.name}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Mini Packet Pipeline */}
      <div className="px-5 py-3.5 bg-[#0B0C12] border-b border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-2 text-cyan-400">
          <Cpu size={14} />
          <span className="font-semibold text-slate-300">Host (192.168.1.5)</span>
        </div>

        {/* Dynamic Animated Packet Wire */}
        <div className="flex-1 mx-4 relative flex items-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500/40 via-amber-500/40 to-emerald-500/40" />
          <div
            className={`absolute top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
              isRunning ? 'animate-bounce bg-cyan-400 text-slate-950 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-800 text-slate-300'
            }`}
            style={{ left: isRunning ? '50%' : '80%', transform: 'translate(-50%, -50%)', transition: 'left 0.4s ease' }}
          >
            {activeScenario.protocol.split(' ')[0]} PACKET
          </div>
        </div>

        <div className="flex items-center gap-2 text-emerald-400">
          <Wifi size={14} />
          <span className="font-semibold text-slate-300">Target Gateway</span>
        </div>
      </div>

      {/* Command Output Terminal Area */}
      <div className="p-5 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2 bg-[#0B0C12]/90">
        <div className="flex items-center gap-2 text-slate-300 pb-1 border-b border-white/[0.04]">
          <span className="text-cyan-400 font-bold">$</span>
          <span className="text-amber-300 font-semibold">{activeScenario.command}</span>
        </div>

        {displayedLogs.map((log, index) => (
          <div
            key={index}
            className={`font-mono text-[11px] leading-relaxed transition-opacity duration-150 ${
              log.startsWith('✓')
                ? 'text-emerald-400 font-bold'
                : log.includes('ERR')
                ? 'text-rose-400'
                : log.startsWith('[OUT]')
                ? 'text-cyan-300'
                : log.startsWith('[IN ]')
                ? 'text-purple-300'
                : 'text-slate-400'
            }`}
          >
            {log}
          </div>
        ))}

        {isRunning && (
          <div className="flex items-center gap-2 text-cyan-400 text-[11px] animate-pulse">
            <span className="w-1.5 h-3 bg-cyan-400 inline-block animate-pulse" />
            <span>transmitting payload...</span>
          </div>
        )}
      </div>

      {/* Terminal Footer Status */}
      <div className="px-4 py-2 bg-[#12141F] border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Shield size={12} className="text-cyan-400" />
          Interactive WebAssembly Sandbox • Safe Academic Execution
        </span>
        <button
          onClick={() => handleRun(activeScenario)}
          disabled={isRunning}
          className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw size={10} /> Re-run Test
        </button>
      </div>
    </div>
  );
};

export default InteractiveTerminal;
