import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Play, RotateCcw, ArrowRight, CheckCircle2, 
  AlertCircle, Shield, ShieldAlert, Wifi, Server, Laptop, 
  Layers, Database, Globe, Network, Cpu, ArrowDown, Send,
  HelpCircle, ChevronRight, Lock, Unlock, Zap, Radio
} from 'lucide-react';

// =========================================================================
// 1. CISCO ROUTER CLI SIMULATOR (Module 3.8)
// =========================================================================
export const RouterCLISimulator: React.FC = () => {
  type PromptMode = 'user' | 'priv' | 'config' | 'config-if';
  const [mode, setMode] = useState<PromptMode>('user');
  const [inputVal, setInputVal] = useState('');
  const [lines, setLines] = useState<string[]>([
    'Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4',
    'System Bootstrap, Version 15.0(1r)M16, RELEASE SOFTWARE',
    'Interface GigabitEthernet0/0 is administratively DOWN.',
    'Type "help" or click the quick command chips below to start configuration.',
    ''
  ]);
  const [interfaceState, setInterfaceState] = useState<'DOWN' | 'UP'>('DOWN');
  const [interfaceIP, setInterfaceIP] = useState<string>('unassigned');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const getPrompt = () => {
    switch (mode) {
      case 'user': return 'Router>';
      case 'priv': return 'Router#';
      case 'config': return 'Router(config)#';
      case 'config-if': return 'Router(config-if)#';
    }
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    const prompt = getPrompt();
    const newLines = [...lines, `${prompt} ${trimmed}`];

    if (!trimmed) {
      setLines(newLines);
      return;
    }

    const lower = trimmed.toLowerCase();

    if (lower === 'help' || lower === '?') {
      newLines.push('Available commands in current mode:');
      if (mode === 'user') {
        newLines.push('  enable               - Enter privileged EXEC mode');
        newLines.push('  ping <ip>            - Send ICMP echo requests');
      } else if (mode === 'priv') {
        newLines.push('  configure terminal   - Enter global configuration mode');
        newLines.push('  show ip int brief    - Display interface IP status summary');
        newLines.push('  disable              - Return to user EXEC mode');
      } else if (mode === 'config') {
        newLines.push('  interface g0/0       - Select GigabitEthernet 0/0 interface');
        newLines.push('  hostname <name>      - Set system network name');
        newLines.push('  exit                 - Exit to privileged EXEC mode');
      } else if (mode === 'config-if') {
        newLines.push('  ip address <ip> <mask> - Assign IPv4 address and subnet mask');
        newLines.push('  no shutdown          - Bring interface UP (admin enable)');
        newLines.push('  shutdown             - Administratively shut down interface');
        newLines.push('  exit                 - Exit to global config mode');
      }
    } else if (mode === 'user') {
      if (lower === 'enable' || lower === 'en') {
        setMode('priv');
        newLines.push('Entered Privileged EXEC Mode.');
      } else {
        newLines.push('% Unknown command or access level not permitted.');
      }
    } else if (mode === 'priv') {
      if (lower === 'configure terminal' || lower === 'conf t') {
        setMode('config');
        newLines.push('Enter configuration commands, one per line. End with CNTL/Z.');
      } else if (lower.startsWith('show ip int') || lower.startsWith('sh ip int')) {
        newLines.push('Interface              IP-Address      OK? Method Status                Protocol');
        newLines.push(`GigabitEthernet0/0     ${interfaceIP.padEnd(15, ' ')} YES manual ${interfaceState === 'UP' ? 'up                    up' : 'administratively down down'}`);
        newLines.push('GigabitEthernet0/1     unassigned      YES unset  administratively down down');
      } else if (lower === 'disable') {
        setMode('user');
      } else {
        newLines.push('% Invalid command in privileged mode.');
      }
    } else if (mode === 'config') {
      if (lower.startsWith('interface g') || lower.startsWith('int g')) {
        setMode('config-if');
        newLines.push('Configuring Interface GigabitEthernet0/0.');
      } else if (lower === 'exit') {
        setMode('priv');
      } else {
        newLines.push('% Incomplete or unconfigured command.');
      }
    } else if (mode === 'config-if') {
      if (lower.startsWith('ip address') || lower.startsWith('ip addr')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 4) {
          const ip = parts[2];
          const mask = parts[3];
          setInterfaceIP(ip);
          newLines.push(`% IP address ${ip} ${mask} assigned to GigabitEthernet0/0.`);
        } else {
          newLines.push('% Incomplete command: usage "ip address <ip> <subnet-mask>".');
        }
      } else if (lower === 'no shutdown' || lower === 'no shut') {
        setInterfaceState('UP');
        newLines.push('% LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to UP');
        newLines.push('% LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to UP');
      } else if (lower === 'shutdown' || lower === 'shut') {
        setInterfaceState('DOWN');
        newLines.push('% LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to administratively DOWN');
      } else if (lower === 'exit') {
        setMode('config');
      } else {
        newLines.push('% Command unrecognized at interface configuration level.');
      }
    }

    setLines(newLines);
    setInputVal('');
  };

  const handleQuick = (c: string) => {
    handleCommand(c);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg font-mono text-xs">
      {/* Top status bar */}
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">Cisco 2911 Router Console (TTY 0)</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Gi0/0 Status:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${interfaceState === 'UP' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}>
              {interfaceState}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">IP:</span>
            <span className="text-amber-300 font-bold">{interfaceIP}</span>
          </div>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="p-4 h-64 overflow-y-auto bg-slate-950 text-emerald-400 space-y-1 select-text">
        {lines.map((l, i) => (
          <div key={i} className="leading-relaxed whitespace-pre-wrap">{l}</div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Quick Actions / Shortcuts */}
      <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 flex flex-wrap gap-1.5 items-center">
        <span className="text-slate-400 text-[11px] mr-1">Quick Script:</span>
        {mode === 'user' && (
          <button onClick={() => handleQuick('enable')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded border border-slate-700">
            enable
          </button>
        )}
        {mode === 'priv' && (
          <>
            <button onClick={() => handleQuick('configure terminal')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded border border-slate-700">
              configure terminal
            </button>
            <button onClick={() => handleQuick('show ip interface brief')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700">
              show ip int brief
            </button>
          </>
        )}
        {mode === 'config' && (
          <button onClick={() => handleQuick('interface gigabitEthernet 0/0')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded border border-slate-700">
            interface g0/0
          </button>
        )}
        {mode === 'config-if' && (
          <>
            <button onClick={() => handleQuick('ip address 192.168.1.1 255.255.255.0')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700">
              ip address 192.168.1.1 255.255.255.0
            </button>
            <button onClick={() => handleQuick('no shutdown')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700">
              no shutdown
            </button>
            <button onClick={() => handleQuick('exit')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700">
              exit
            </button>
          </>
        )}
        <button onClick={() => handleQuick('help')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded border border-slate-700">
          help (?)
        </button>
      </div>

      {/* Terminal Input Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleCommand(inputVal); }}
        className="flex items-center px-4 py-2.5 bg-slate-900 border-t border-slate-800"
      >
        <span className="text-emerald-400 font-bold mr-2 select-none">{getPrompt()}</span>
        <input 
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type Cisco command (e.g. enable, no shutdown, help)..."
          className="flex-1 bg-transparent text-white focus:outline-none font-mono"
        />
        <button type="submit" className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-sans font-semibold">
          Send
        </button>
      </form>
    </div>
  );
};

// =========================================================================
// 2. IPv4 HEADER PACKET ARCHITECTURE INSPECTOR (Module 3.5)
// =========================================================================
export const IPv4HeaderSimulator: React.FC = () => {
  const [selectedField, setSelectedField] = useState<string>('ttl');

  const fields: Record<string, { name: string; bits: string; value: string; desc: string; trap: string }> = {
    version: {
      name: 'Version (VER)',
      bits: '4 bits (0-3)',
      value: '0100 (Decimal 4)',
      desc: 'Identifies the protocol version. Decimal 4 signifies IPv4; 6 signifies IPv6.',
      trap: 'Exam Trap: Routers discard packets immediately if the version does not match their configured protocol stack.'
    },
    ihl: {
      name: 'Internet Header Length (IHL)',
      bits: '4 bits (4-7)',
      value: '0101 (Decimal 5 words = 20 bytes)',
      desc: 'Specifies the header length in 32-bit (4-byte) words. Minimum is 5 (20 bytes); maximum is 15 (60 bytes with options).',
      trap: 'Exam Trap: Always multiply IHL by 4 to get total header bytes! If IHL is 7, length is 28 bytes.'
    },
    tos: {
      name: 'DSCP / Type of Service (ToS)',
      bits: '8 bits (8-15)',
      value: '000000 00 (Default Best-Effort)',
      desc: 'Differentiated Services Code Point (DSCP, 6 bits) for QoS classification + Explicit Congestion Notification (ECN, 2 bits).',
      trap: 'Exam Trap: Voice (VoIP) packets are tagged DSCP EF (Expedited Forwarding = 46) to bypass buffer queues.'
    },
    totalLength: {
      name: 'Total Length',
      bits: '16 bits (16-31)',
      value: '00000101 11011100 (1500 bytes)',
      desc: 'Total size of IP packet in bytes (header + data payload). Maximum theoretical IPv4 packet is 65,535 bytes.',
      trap: 'Exam Trap: Payload size = Total Length - (IHL * 4).'
    },
    identification: {
      name: 'Identification',
      bits: '16 bits (32-47)',
      value: '0x3A9F (15,007)',
      desc: 'Unique identifier assigned by sender to help receiver reassemble fragments belonging to the original datagram.',
      trap: 'Exam Trap: All fragments of a fractured packet share the exact same Identification number.'
    },
    flags: {
      name: 'Flags (Reserved, DF, MF)',
      bits: '3 bits (48-50)',
      value: '0 1 0 (DF=1 Don’t Fragment, MF=0 More Fragments)',
      desc: 'Bit 0: Reserved (0). Bit 1 (DF): Don’t Fragment (if 1 and packet > MTU, router drops and sends ICMP Fragmentation Needed). Bit 2 (MF): More Fragments (1 means more follow; 0 means last fragment).',
      trap: 'Exam Trap: Path MTU Discovery works by setting DF=1 and waiting for ICMP Type 3 Code 4 drops.'
    },
    fragmentOffset: {
      name: 'Fragment Offset',
      bits: '13 bits (51-63)',
      value: '0000000000000 (0 * 8 = Offset 0 bytes)',
      desc: 'Indicates the position of the fragment in the original unfragmented datagram, measured in units of 8-byte blocks.',
      trap: 'Exam Trap: Always multiply Fragment Offset by 8 to determine the actual byte offset!'
    },
    ttl: {
      name: 'Time to Live (TTL)',
      bits: '8 bits (64-71)',
      value: '01000000 (64 hops remaining)',
      desc: 'Decremented by 1 at each router hop. When TTL reaches 0, the packet is discarded and an ICMP Type 11 (Time Exceeded) is returned.',
      trap: 'Exam Trap: TTL prevents infinite packet looping. Traceroute works by incrementing TTL from 1, 2, 3 onward.'
    },
    protocol: {
      name: 'Protocol',
      bits: '8 bits (72-79)',
      value: '00000110 (Protocol 6 = TCP)',
      desc: 'Multiplexes payload to Layer 4 transport protocol: 6 = TCP, 17 = UDP, 1 = ICMP, 89 = OSPF.',
      trap: 'Exam Trap: Memorize for GATE/Exams: TCP = 6, UDP = 17, ICMP = 1.'
    },
    checksum: {
      name: 'Header Checksum',
      bits: '16 bits (80-95)',
      value: '0xB4E2 (16-bit 1’s complement)',
      desc: 'Detects bit errors in the IP header ONLY. It does NOT protect the data payload (Layer 4 checks that). Recalculated at EVERY router hop because TTL changes!',
      trap: 'Exam Trap: Routers recalculate the checksum at every single hop because the TTL value is decremented.'
    },
    sourceIp: {
      name: 'Source IP Address',
      bits: '32 bits (96-127)',
      value: '192.168.1.50 (0xC0A80132)',
      desc: 'Originating host 32-bit IPv4 logical address.',
      trap: 'Exam Trap: Remains unchanged across standard routing, but IS modified by NAT firewalls.'
    },
    destIp: {
      name: 'Destination IP Address',
      bits: '32 bits (128-159)',
      value: '142.250.190.46 (Google Mumbai)',
      desc: 'Final target host 32-bit IPv4 address used by routers for forwarding table lookups.',
      trap: 'Exam Trap: Forwarding tables match this address using Longest Prefix Match.'
    }
  };

  const active = fields[selectedField] || fields.ttl;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Interactive IPv4 Packet Header Matrix</h3>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
          32-Bit Word Architecture
        </span>
      </div>

      <p className="text-xs text-slate-500 mt-2 mb-4">
        Click any header block below to inspect its bit boundary, purpose, and exam traps.
      </p>

      {/* Clickable Header Grid (32-bit grid) */}
      <div className="space-y-1.5 font-mono text-xs select-none">
        {/* Bit header indicator */}
        <div className="grid grid-cols-32 text-[9px] text-slate-400 font-bold px-1 text-center">
          <span className="col-span-8 text-left">Bit 0</span>
          <span className="col-span-8">Bit 8</span>
          <span className="col-span-8">Bit 16</span>
          <span className="col-span-8 text-right">Bit 31</span>
        </div>

        {/* Row 1: VER (4), IHL (4), ToS (8), Total Length (16) */}
        <div className="grid grid-cols-32 gap-1 h-10">
          <button 
            onClick={() => setSelectedField('version')}
            className={`col-span-4 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'version' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">VER</span>
            <span className="text-[9px] opacity-75">4 bits</span>
          </button>
          <button 
            onClick={() => setSelectedField('ihl')}
            className={`col-span-4 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'ihl' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">IHL</span>
            <span className="text-[9px] opacity-75">4 bits</span>
          </button>
          <button 
            onClick={() => setSelectedField('tos')}
            className={`col-span-8 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'tos' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">DSCP / ToS</span>
            <span className="text-[9px] opacity-75">8 bits</span>
          </button>
          <button 
            onClick={() => setSelectedField('totalLength')}
            className={`col-span-16 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'totalLength' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">Total Length</span>
            <span className="text-[9px] opacity-75">16 bits</span>
          </button>
        </div>

        {/* Row 2: Identification (16), Flags (3), Fragment Offset (13) */}
        <div className="grid grid-cols-32 gap-1 h-10">
          <button 
            onClick={() => setSelectedField('identification')}
            className={`col-span-16 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'identification' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">Identification</span>
            <span className="text-[9px] opacity-75">16 bits</span>
          </button>
          <button 
            onClick={() => setSelectedField('flags')}
            className={`col-span-3 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'flags' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[9px]">Flags</span>
            <span className="text-[8px] opacity-75">3b</span>
          </button>
          <button 
            onClick={() => setSelectedField('fragmentOffset')}
            className={`col-span-13 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'fragmentOffset' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">Fragment Offset</span>
            <span className="text-[9px] opacity-75">13 bits</span>
          </button>
        </div>

        {/* Row 3: TTL (8), Protocol (8), Header Checksum (16) */}
        <div className="grid grid-cols-32 gap-1 h-10">
          <button 
            onClick={() => setSelectedField('ttl')}
            className={`col-span-8 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'ttl' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">Time to Live (TTL)</span>
            <span className="text-[9px] opacity-75">8 bits</span>
          </button>
          <button 
            onClick={() => setSelectedField('protocol')}
            className={`col-span-8 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'protocol' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">Protocol</span>
            <span className="text-[9px] opacity-75">8 bits (TCP=6)</span>
          </button>
          <button 
            onClick={() => setSelectedField('checksum')}
            className={`col-span-16 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'checksum' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">Header Checksum</span>
            <span className="text-[9px] opacity-75">16 bits</span>
          </button>
        </div>

        {/* Row 4: Source IP Address (32 bits) */}
        <div className="grid grid-cols-32 gap-1 h-10">
          <button 
            onClick={() => setSelectedField('sourceIp')}
            className={`col-span-32 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'sourceIp' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">Source IP Address (32 bits = 4 bytes)</span>
            <span className="text-[9px] opacity-75">e.g. 192.168.1.50</span>
          </button>
        </div>

        {/* Row 5: Destination IP Address (32 bits) */}
        <div className="grid grid-cols-32 gap-1 h-10">
          <button 
            onClick={() => setSelectedField('destIp')}
            className={`col-span-32 rounded p-1 flex flex-col justify-center items-center border transition-all transform-gpu ${selectedField === 'destIp' ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'}`}
          >
            <span className="text-[10px]">Destination IP Address (32 bits = 4 bytes)</span>
            <span className="text-[9px] opacity-75">e.g. 142.250.190.46</span>
          </button>
        </div>
      </div>

      {/* Field Details Inspector Panel */}
      <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>{active.name}</span>
          </h4>
          <span className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">
            {active.bits}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Sample Live Value</span>
            <span className="font-mono font-semibold text-slate-800">{active.value}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Functional Purpose</span>
            <p className="text-slate-700 leading-snug">{active.desc}</p>
          </div>
        </div>

        <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs text-amber-900 font-medium">
          <span className="font-bold uppercase text-[10px] text-amber-700 block mb-0.5">GATE & University Exam Trap</span>
          {active.trap}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. SUBNETTING & CIDR CALCULATOR SIMULATOR (Modules 3.7, 3.14, 3.15)
// =========================================================================
export const SubnetCalculatorSimulator: React.FC = () => {
  const [baseIp, setBaseIp] = useState('192.168.1.0');
  const [prefix, setPrefix] = useState<number>(26);

  // Math for IPv4 Subnetting
  const totalHostBits = 32 - prefix;
  const totalAddresses = Math.pow(2, totalHostBits);
  const usableHosts = totalAddresses > 2 ? totalAddresses - 2 : 0;

  // Subnet mask calculation
  const getSubnetMask = (p: number) => {
    let mask = [];
    for (let i = 0; i < 4; i++) {
      const n = Math.min(Math.max(p - i * 8, 0), 8);
      mask.push(256 - Math.pow(2, 8 - n));
    }
    return mask.join('.');
  };

  const subnetMask = getSubnetMask(prefix);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Real-Time Subnet & CIDR Calculator</h3>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
          Dynamic Binary Math
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Base Network Address</label>
          <input 
            type="text" 
            value={baseIp} 
            onChange={(e) => setBaseIp(e.target.value)}
            className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-700">CIDR Prefix</label>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              /{prefix} (Mask: {subnetMask})
            </span>
          </div>
          <input 
            type="range" 
            min={24} 
            max={30} 
            value={prefix} 
            onChange={(e) => setPrefix(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
            <span>/24 (254 hosts)</span>
            <span>/26 (62 hosts)</span>
            <span>/28 (14 hosts)</span>
            <span>/30 (2 hosts)</span>
          </div>
        </div>
      </div>

      {/* Results Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Subnet Mask</span>
          <span className="text-xs font-mono font-bold text-slate-900">{subnetMask}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Host Bits (h)</span>
          <span className="text-xs font-mono font-bold text-slate-900">{totalHostBits} bits</span>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-blue-600 block">Usable Hosts (2^h - 2)</span>
          <span className="text-sm font-mono font-extrabold text-blue-700">{usableHosts} Hosts</span>
        </div>
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-purple-600 block">Block Interval</span>
          <span className="text-xs font-mono font-bold text-purple-800">Every {totalAddresses} IPs</span>
        </div>
      </div>

      {/* Subnet Blocks Breakdown for /24 space */}
      <div className="mt-4 p-4 bg-slate-900 text-white rounded-xl">
        <h4 className="text-xs font-bold uppercase text-slate-300 mb-2">Partitioned Subnets in 192.168.1.0/24:</h4>
        <div className="space-y-1.5 font-mono text-xs max-h-36 overflow-y-auto">
          {Array.from({ length: Math.min(256 / totalAddresses, 8) }).map((_, idx) => {
            const start = idx * totalAddresses;
            const netId = `192.168.1.${start}`;
            const firstHost = `192.168.1.${start + 1}`;
            const lastHost = `192.168.1.${start + totalAddresses - 2}`;
            const bcast = `192.168.1.${start + totalAddresses - 1}`;
            return (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/80 rounded border border-slate-700/60 text-[11px]">
                <span className="text-blue-400 font-bold">Subnet #{idx + 1}: {netId}/{prefix}</span>
                <span className="text-slate-300">Usable: {firstHost} — {lastHost}</span>
                <span className="text-amber-400">Bcast: {bcast}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. DHCP DORA INTERACTIVE PROTOCOL SIMULATOR (Module 3.17)
// =========================================================================
export const DHCPDORASimulator: React.FC = () => {
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      title: '1. DHCPDISCOVER (Client -> Network)',
      source: '0.0.0.0:68',
      dest: '255.255.255.255:67 (Broadcast)',
      details: 'Client has no IP yet. Broadcasts across LAN: "Looking for a DHCP Server! My MAC is 00:1A:2B:3C:4D:5E".',
      badge: 'Layer 2 Broadcast'
    },
    {
      title: '2. DHCPOFFER (DHCP Server -> Client)',
      source: '192.168.1.1:67',
      dest: '192.168.1.105:68 (or 255.255.255.255)',
      details: 'Server reserves 192.168.1.105 from its pool and replies: "Here is an IP offer! Subnet: 255.255.255.0, Gateway: 192.168.1.1, Lease: 24h".',
      badge: 'Unicast/Broadcast'
    },
    {
      title: '3. DHCPREQUEST (Client -> Server)',
      source: '0.0.0.0:68',
      dest: '255.255.255.255:67 (Broadcast)',
      details: 'Client accepts the offer: "I formally accept 192.168.1.105 from Server 192.168.1.1!". Broadcasted so other DHCP servers release their tentative offers.',
      badge: 'Formal Acceptance'
    },
    {
      title: '4. DHCPACK (DHCP Server -> Client)',
      source: '192.168.1.1:67',
      dest: '192.168.1.105:68',
      details: 'Server commits the binding in its lease database: "Confirmed! IP 192.168.1.105 is bound to your MAC address for 24 hours. Enjoy Internet access!".',
      badge: 'Lease Committed'
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Wifi className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">DHCP 4-Step DORA Protocol Simulator</h3>
        </div>
        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold">
          Ports 67 & 68 (UDP)
        </span>
      </div>

      {/* Visual Endpoints */}
      <div className="flex items-center justify-between mt-5 px-4 sm:px-12">
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform-gpu ${step >= 3 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'}`}>
            <Laptop className="w-7 h-7" />
          </div>
          <span className="font-bold text-xs text-slate-800 mt-2">Client Laptop</span>
          <span className="font-mono text-[10px] text-slate-500">
            {step >= 3 ? '192.168.1.105' : 'IP: 0.0.0.0 (Unset)'}
          </span>
        </div>

        {/* Animated packet middle */}
        <div className="flex-1 mx-4 flex flex-col items-center">
          <div className="w-full border-t-2 border-dashed border-blue-300 relative my-3">
            <div 
              className={`absolute -top-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md transition-all transform-gpu duration-500 ${
                step % 2 === 0 ? 'left-1/4' : 'right-1/4'
              }`}
            >
              {step + 1}
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600">
            {steps[step].title}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-md">
            <Server className="w-7 h-7" />
          </div>
          <span className="font-bold text-xs text-slate-800 mt-2">KLU DHCP Server</span>
          <span className="font-mono text-[10px] text-slate-500">192.168.1.1 (UDP 67)</span>
        </div>
      </div>

      {/* Active Packet Inspection */}
      <div className="mt-5 p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-emerald-400 font-bold">{steps[step].title}</span>
          <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded text-[10px]">{steps[step].badge}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div><span className="text-slate-500">Src:</span> {steps[step].source}</div>
          <div><span className="text-slate-500">Dst:</span> {steps[step].dest}</div>
        </div>
        <p className="text-xs font-sans text-slate-200 mt-2 leading-relaxed">
          {steps[step].details}
        </p>
      </div>

      {/* Control buttons */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setStep(0)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset DORA</span>
        </button>

        <div className="flex space-x-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-7 h-7 rounded-full text-xs font-bold transition-all transform-gpu ${
                step === i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 shadow-xs"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 5. DNS LOOKUP HIERARCHICAL RESOLVER (Module 5.8)
// =========================================================================
export const DNSLookupSimulator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      title: 'Step 1: Client Query',
      from: 'Student Laptop',
      to: 'Local Recursive Resolver (8.8.8.8)',
      type: 'Recursive Query (Port 53 UDP)',
      query: 'Query: "What is IPv4 for www.klu.ac.in?"',
      desc: 'Browser checks local OS DNS cache. Cache miss! Forwards recursive query to configured ISP/Google resolver.'
    },
    {
      title: 'Step 2: Root Name Server Referral',
      from: 'Recursive Resolver',
      to: 'Root DNS Server (".")',
      type: 'Iterative Query',
      query: 'Query: "Where is klu.ac.in?"',
      desc: 'Root server responds: "I do not know klu.ac.in, but I know who manages .in TLD. Ask the .in Name Server at IP 156.154.100.3!".'
    },
    {
      title: 'Step 3: Top-Level Domain (TLD) Referral',
      from: 'Recursive Resolver',
      to: '.in TLD Registry Server',
      type: 'Iterative Query',
      query: 'Query: "Where is klu.ac.in?"',
      desc: 'TLD server responds: "Ask KLU’s authoritative name server (ns1.klu.ac.in) at IP 14.139.86.2!".'
    },
    {
      title: 'Step 4: Authoritative Answer',
      from: 'Recursive Resolver',
      to: 'Authoritative Name Server (ns1.klu.ac.in)',
      type: 'Iterative Query',
      query: 'Query: "A Record for www.klu.ac.in"',
      desc: 'Authoritative server returns authoritative answer: "www.klu.ac.in -> A 14.139.86.150 (TTL = 3600 seconds)".'
    },
    {
      title: 'Step 5: Delivery & Local Caching',
      from: 'Recursive Resolver',
      to: 'Student Laptop',
      type: 'Final DNS Response',
      query: 'Result: 14.139.86.150',
      desc: 'Resolver caches the record and returns IP 14.139.86.150 to browser. Browser can now initiate TCP handshake to campus server!'
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Hierarchical DNS Resolution Walkthrough</h3>
        </div>
        <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-bold">
          Recursive vs Iterative
        </span>
      </div>

      {/* Interactive step viewer */}
      <div className="mt-4 p-4 bg-slate-900 text-white rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-amber-300 font-bold text-xs">{steps[currentStep].title}</span>
          <span className="text-[11px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
            {steps[currentStep].type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
          <div><span className="text-slate-500">Sender:</span> {steps[currentStep].from}</div>
          <div><span className="text-slate-500">Target:</span> {steps[currentStep].to}</div>
        </div>

        <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 font-mono text-xs text-emerald-300">
          {steps[currentStep].query}
        </div>

        <p className="text-xs font-sans text-slate-200 leading-relaxed">
          {steps[currentStep].desc}
        </p>
      </div>

      {/* Progress navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(0)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Restart Lookup
        </button>

        <div className="flex items-center space-x-1.5">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-6 h-6 rounded-full text-xs font-bold transition-all transform-gpu ${
                currentStep === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          {currentStep < steps.length - 1 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700"
            >
              Next Hop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 6. HTTP REQUEST / RESPONSE BUILDER (Modules 5.2, 5.3)
// =========================================================================
export const HTTPBuilderSimulator: React.FC = () => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [path, setPath] = useState<string>('/api/students/2300030001/grades');
  const [status, setStatus] = useState<number>(200);

  const getStatusText = (code: number) => {
    switch (code) {
      case 200: return '200 OK';
      case 201: return '201 Created';
      case 301: return '301 Moved Permanently';
      case 401: return '401 Unauthorized';
      case 404: return '404 Not Found';
      case 500: return '500 Internal Server Error';
      default: return `${code}`;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Interactive HTTP Request / Response Inspector</h3>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold">
          Port 80 / 443
        </span>
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value as any)}
          className="text-xs font-bold font-mono px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none"
        >
          <option value="GET">GET (Retrieve)</option>
          <option value="POST">POST (Submit)</option>
          <option value="PUT">PUT (Replace)</option>
          <option value="DELETE">DELETE (Remove)</option>
        </select>

        <input 
          type="text" 
          value={path} 
          onChange={(e) => setPath(e.target.value)}
          className="flex-1 min-w-[200px] text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select 
          value={status} 
          onChange={(e) => setStatus(Number(e.target.value))}
          className="text-xs font-mono px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none"
        >
          <option value={200}>200 OK</option>
          <option value={201}>201 Created</option>
          <option value={301}>301 Moved</option>
          <option value={401}>401 Unauthorized</option>
          <option value={404}>404 Not Found</option>
          <option value={500}>500 Error</option>
        </select>
      </div>

      {/* Wire Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-mono text-xs">
        {/* Request Frame */}
        <div className="p-4 bg-slate-900 text-slate-300 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">
            HTTP Request Packet
          </div>
          <div className="text-emerald-400 font-bold">{method} {path} HTTP/1.1</div>
          <div>Host: portal.klu.ac.in</div>
          <div>User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X)</div>
          <div>Accept: application/json</div>
          {method === 'POST' && <div>Content-Type: application/json</div>}
          <div className="text-slate-500 py-1">--- CRLF (Empty Line) ---</div>
          {method === 'POST' && (
            <div className="text-amber-300 font-mono">
              &#123; "studentId": "2300030001", "course": "Computer Networks" &#125;
            </div>
          )}
        </div>

        {/* Response Frame */}
        <div className="p-4 bg-slate-950 text-slate-300 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">
            HTTP Server Response
          </div>
          <div className={`font-bold ${status >= 400 ? 'text-red-400' : 'text-emerald-400'}`}>
            HTTP/1.1 {getStatusText(status)}
          </div>
          <div>Date: {new Date().toUTCString()}</div>
          <div>Server: nginx/1.24.0 (Ubuntu)</div>
          <div>Content-Type: application/json; charset=utf-8</div>
          <div>Connection: keep-alive</div>
          <div className="text-slate-500 py-1">--- CRLF (Empty Line) ---</div>
          <div className="text-amber-200">
            {status === 200 && '{\n  "status": "success",\n  "gpa": 9.4,\n  "unit3Score": "95%"\n}'}
            {status === 404 && '{\n  "error": "Resource Not Found",\n  "code": 404\n}'}
            {status === 401 && '{\n  "error": "Missing Bearer Token",\n  "loginUrl": "/login"\n}'}
            {status === 500 && '{\n  "error": "Internal Database Timeout",\n  "retry": true\n}'}
            {status === 301 && '{\n  "redirect": "https://portal.klu.ac.in/v2"\n}'}
            {status === 201 && '{\n  "created": true,\n  "id": "REC-9821"\n}'}
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 7. TELNET VS SSH ENCRYPTION COMPARISON (Modules 5.6, 5.7)
// =========================================================================
export const SSHTelnetSimulator: React.FC = () => {
  const [typedUser, setTypedUser] = useState('admin_klu');
  const [typedPass, setTypedPass] = useState('SecretPassword123!');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Security Matrix: Telnet (Cleartext) vs SSH (Encrypted)</h3>
        </div>
        <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-bold">
          Wireshark Packet Sniffing View
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Username</label>
          <input 
            type="text" 
            value={typedUser} 
            onChange={(e) => setTypedUser(e.target.value)}
            className="w-full text-xs font-mono px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
          <input 
            type="text" 
            value={typedPass} 
            onChange={(e) => setTypedPass(e.target.value)}
            className="w-full text-xs font-mono px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-mono text-xs">
        {/* Telnet Wire Sniff */}
        <div className="p-4 bg-red-950/20 border border-red-300 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-red-800 font-bold border-b border-red-200 pb-1.5">
            <span className="flex items-center space-x-1.5">
              <Unlock className="w-4 h-4 text-red-600" />
              <span>TELNET (Port 23) Plaintext</span>
            </span>
            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded">VULNERABLE</span>
          </div>
          <p className="text-[11px] font-sans text-red-900">
            Attacker on campus Wi-Fi sniffing packets with Wireshark reads raw keystrokes:
          </p>
          <div className="p-3 bg-white rounded border border-red-200 text-red-600 font-mono space-y-1">
            <div>User: <span className="font-bold underline">{typedUser}</span></div>
            <div>Pass: <span className="font-bold underline">{typedPass}</span></div>
            <div className="text-[10px] text-red-500 mt-2 font-sans font-medium">
              Zero encryption. Credentials compromised instantly!
            </div>
          </div>
        </div>

        {/* SSH Wire Sniff */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-300 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-emerald-800 font-bold border-b border-emerald-200 pb-1.5">
            <span className="flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>SSH (Port 22) AES-256</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">SECURE</span>
          </div>
          <p className="text-[11px] font-sans text-emerald-900">
            Eavesdropper sees only high-entropy Diffie-Hellman encrypted ciphertext:
          </p>
          <div className="p-3 bg-white rounded border border-emerald-200 text-emerald-800 font-mono break-all space-y-1">
            <div className="text-[10px] text-slate-500">Ciphertext Payload:</div>
            <div className="text-[11px]">e7d3a9f2c1b480e69d12ffac8201...</div>
            <div className="text-[10px] text-emerald-700 mt-2 font-sans font-medium">
              Authenticated via host key + encrypted with AES-GCM. 100% confidential.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
