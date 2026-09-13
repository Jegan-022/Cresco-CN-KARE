import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../utils/audio';

interface TerminalCardProps {
  onLaunchLab: () => void;
}

interface TerminalLine {
  text: string;
  type: 'cmd' | 'output' | 'dim' | 'success' | 'warning';
}

export const TerminalCard: React.FC<TerminalCardProps> = ({ onLaunchLab }) => {
  const [inputVal, setInputVal] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'traceroute --hop-limit 4 192.168.1.1', type: 'cmd' },
    { text: '1  gw-core.campus.lan (10.0.0.1) 0.84ms', type: 'output' },
    { text: '2  edge-rtr-04.cresco.edu (172.16.4.1) 2.11ms', type: 'output' },
    { text: '3  [Listening for ingress frames...]', type: 'dim' },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    soundFx.playClick();
    const newLines: TerminalLine[] = [...lines, { text: cmd, type: 'cmd' }];

    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      newLines.push(
        { text: 'Cresco CN OS v2.4.0 Lab CLI', type: 'success' },
        { text: 'Commands: ping <ip>, traceroute <ip>, ifconfig, netstat, arp -a, pdu inspect, clear', type: 'output' }
      );
    } else if (lower.startsWith('ping')) {
      const target = cmd.split(' ')[1] || '8.8.8.8';
      newLines.push(
        { text: `PING ${target} (56 data bytes)`, type: 'output' },
        { text: `64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.12 ms`, type: 'success' },
        { text: `64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.98 ms`, type: 'success' },
        { text: `--- ${target} ping statistics --- 0% packet loss`, type: 'dim' }
      );
      soundFx.playPacketHop();
    } else if (lower.startsWith('traceroute')) {
      const target = cmd.split(' ')[1] || '192.168.1.1';
      newLines.push(
        { text: `traceroute to ${target}, 30 hops max, 60 byte packets`, type: 'output' },
        { text: '1  gw-core.campus.lan (10.0.0.1) 0.82ms', type: 'output' },
        { text: '2  edge-rtr-04.cresco.edu (172.16.4.1) 2.05ms', type: 'output' },
        { text: `3  host-${target} (${target}) 3.41ms [Destination Reached]`, type: 'success' }
      );
      soundFx.playSuccess();
    } else if (lower === 'ifconfig' || lower === 'ip a') {
      newLines.push(
        { text: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST> mtu 1500', type: 'output' },
        { text: '      inet 10.0.0.42 netmask 255.255.255.0 broadcast 10.0.0.255', type: 'output' },
        { text: '      ether 52:54:00:12:34:56  txqueuelen 1000 (Ethernet)', type: 'output' },
        { text: 'lo:   inet 127.0.0.1 netmask 255.0.0.0', type: 'output' }
      );
    } else if (lower === 'netstat') {
      newLines.push(
        { text: 'Proto Recv-Q Send-Q Local Address          Foreign Address        State', type: 'dim' },
        { text: 'tcp        0      0 10.0.0.42:54210        172.16.4.1:443         ESTABLISHED', type: 'output' },
        { text: 'tcp        0      0 10.0.0.42:22           0.0.0.0:*              LISTEN', type: 'output' },
        { text: 'udp        0      0 10.0.0.42:5353         0.0.0.0:*              - ', type: 'output' }
      );
    } else if (lower === 'arp -a' || lower === 'arp') {
      newLines.push(
        { text: '? (10.0.0.1) at 00:1a:2b:3c:4d:01 [ether] on eth0', type: 'output' },
        { text: '? (10.0.0.254) at 00:1a:2b:3c:4d:fe [ether] on eth0', type: 'output' }
      );
    } else if (lower.includes('pdu')) {
      newLines.push(
        { text: '[L7 HTTP] GET /api/v1/topology HTTP/1.1', type: 'dim' },
        { text: '[L4 TCP]  Src Port: 54210 -> Dst Port: 443 | SEQ: 0x98FA SYN=0 ACK=1', type: 'output' },
        { text: '[L3 IPv4] Src: 10.0.0.42 -> Dst: 172.16.4.1 | TTL: 64 Protocol: 6', type: 'output' },
        { text: '[L2 ETH]  Src: 52:54:00:12:34:56 -> Dst: 00:1A:2B:3C:4D:01', type: 'success' }
      );
    } else if (lower === 'clear') {
      setLines([]);
      setInputVal('');
      return;
    } else {
      newLines.push(
        { text: `bash: ${cmd}: command not found. Type 'help' for available commands.`, type: 'warning' }
      );
    }

    setLines(newLines);
    setInputVal('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all transform-gpu flex flex-col justify-between border border-[#dae2fd]/60">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#004ac6]">
            <span className="material-symbols-outlined text-base">terminal</span>
            <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
              VIRTUAL APPLIANCE
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#57dffe] animate-pulse"></span>
        </div>

        <h3 className="text-[18px] font-bold text-[#131b2e] mt-2">
          Quick Lab Terminal
        </h3>
        <p className="text-[12px] text-[#434655] mt-1">
          Direct access to Packet Tracer command line sandbox with automated frame generators.
        </p>

        {/* Monospace Terminal Preview Block */}
        <div className="mt-3 p-3 rounded-xl bg-[#283044] text-[#eef0ff] font-mono text-[12px] shadow-inner">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#434655]/60 opacity-70 text-[11px]">
            <span>sim-gateway-01:~#</span>
            <span className="text-[#acedff]">TCP/IP v4</span>
          </div>

          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {lines.map((l, i) => (
              <div
                key={i}
                className={`leading-relaxed break-all ${
                  l.type === 'cmd'
                    ? 'text-[#acedff]'
                    : l.type === 'success'
                    ? 'text-[#57dffe]'
                    : l.type === 'warning'
                    ? 'text-[#ffdad6]'
                    : l.type === 'dim'
                    ? 'text-[#dae2fd]/70'
                    : 'text-[#eef0ff]'
                }`}
              >
                {l.type === 'cmd' && <span className="text-[#57dffe] mr-1.5">$</span>}
                {l.text}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Interactive input line */}
          <form onSubmit={handleCommand} className="mt-2 flex items-center gap-1 pt-1.5 border-t border-[#434655]/40">
            <span className="text-[#57dffe] text-xs font-bold">$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="try 'ping', 'traceroute', 'pdu inspect'..."
              className="bg-transparent border-none text-[#acedff] font-mono text-xs focus:outline-none w-full placeholder:text-gray-500"
            />
            <span className="inline-block w-2 h-3.5 bg-[#57dffe] animate-pulse"></span>
          </form>
        </div>
      </div>

      <button
        onClick={() => {
          soundFx.playClick();
          onLaunchLab();
        }}
        className="mt-4 w-full py-2 rounded-xl bg-[#eaedff] text-[#131b2e] text-[14px] font-semibold hover:bg-[#e2e7ff] transition-colors flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-base">play_circle</span>
        <span>Launch Packet Tracer</span>
      </button>
    </div>
  );
};
