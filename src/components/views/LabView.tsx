import React, { useState } from 'react';
import { soundFx } from '../../utils/audio';

interface LabNode {
  id: string;
  name: string;
  type: 'pc' | 'switch' | 'router' | 'server';
  ip: string;
  mac: string;
  x: number;
  y: number;
}

export const LabView: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<string>('pc-1');
  const [selectedDest, setSelectedDest] = useState<string>('srv-1');
  const [packetInFlight, setPacketInFlight] = useState(false);
  const [packetPhase, setPacketPhase] = useState<number>(0);
  const [packetLogs, setPacketLogs] = useState<string[]>([
    '[INIT] Virtual topology loaded: 1 Client, 1 Switch, 1 Edge Router, 1 Web Server',
    '[READY] Select source and destination, then click "Transmit Packet"',
  ]);

  const nodes: LabNode[] = [
    { id: 'pc-1', name: 'Alex PC (Client)', type: 'pc', ip: '10.0.0.42', mac: '52:54:00:12:34:56', x: 120, y: 160 },
    { id: 'sw-1', name: 'Campus Switch 01', type: 'switch', ip: '10.0.0.2', mac: '00:1A:2B:AA:BB:01', x: 300, y: 160 },
    { id: 'rtr-1', name: 'Edge Router GW', type: 'router', ip: '10.0.0.1', mac: '00:1A:2B:CC:DD:02', x: 480, y: 160 },
    { id: 'srv-1', name: 'Cresco CN Core Server', type: 'server', ip: '172.16.4.1', mac: '00:1A:2B:EE:FF:03', x: 660, y: 160 },
  ];

  const handleSendPacket = () => {
    if (packetInFlight) return;
    soundFx.playClick();
    setPacketInFlight(true);
    setPacketPhase(1);

    const log1 = `[L7 HTTP] GET /api/v1/topology initiated from ${nodes.find(n => n.id === selectedSource)?.name}`;
    setPacketLogs(prev => [log1, ...prev.slice(0, 7)]);
    soundFx.playPacketHop();

    setTimeout(() => {
      setPacketPhase(2);
      const log2 = `[L2/L3] Frame arrived at Switch 01; CAM Table lookup for dest MAC`;
      setPacketLogs(prev => [log2, ...prev.slice(0, 7)]);
      soundFx.playPacketHop();
    }, 1000);

    setTimeout(() => {
      setPacketPhase(3);
      const log3 = `[L3 ROUTE] Edge Router decrements TTL=63, rewrites Ethernet header, forwards via WAN`;
      setPacketLogs(prev => [log3, ...prev.slice(0, 7)]);
      soundFx.playPacketHop();
    }, 2000);

    setTimeout(() => {
      setPacketPhase(4);
      const log4 = `[L7 200 OK] Destination reached at 172.16.4.1. TCP ACK sent. Latency: 2.1ms`;
      setPacketLogs(prev => [log4, ...prev.slice(0, 7)]);
      setPacketInFlight(false);
      soundFx.playSuccess();
    }, 3000);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-6 animate-in fade-in space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-[#dae2fd]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#004ac6] uppercase">
              VIRTUAL APPLIANCE // PACKET TRACER
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#acedff] text-[#001f26] font-mono text-[10px] font-bold">
              TOPOLOGY NET-301
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#131b2e] mt-1">
            Interactive Network Sandbox & Frame Inspector
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#434655]">Src:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-[#f2f3ff] border border-[#dae2fd] rounded-lg px-2 py-1 font-mono text-xs font-semibold"
            >
              <option value="pc-1">Alex PC (10.0.0.42)</option>
              <option value="rtr-1">Edge Router (10.0.0.1)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#434655]">Dst:</span>
            <select
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              className="bg-[#f2f3ff] border border-[#dae2fd] rounded-lg px-2 py-1 font-mono text-xs font-semibold"
            >
              <option value="srv-1">Core Server (172.16.4.1)</option>
              <option value="rtr-1">Edge Router (10.0.0.1)</option>
            </select>
          </div>

          <button
            onClick={handleSendPacket}
            disabled={packetInFlight}
            className="px-4 py-2 rounded-xl bg-[#004ac6] text-white font-bold text-xs shadow hover:bg-[#003ea8] disabled:opacity-50 transition-all transform-gpu flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">send</span>
            <span>{packetInFlight ? 'Routing Packet...' : 'Transmit Packet'}</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas Simulator */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#dae2fd]/60 relative overflow-hidden">
        <div className="w-full h-72 md:h-80 bg-[#faf8ff] rounded-xl border border-[#dae2fd] relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 320">
            {/* Grid Pattern */}
            <defs>
              <pattern id="lab-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#eaedff" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lab-grid)" />

            {/* Connecting Links */}
            <line x1="120" y1="160" x2="300" y2="160" stroke="#004ac6" strokeWidth="4" />
            <line x1="300" y1="160" x2="480" y2="160" stroke="#004ac6" strokeWidth="4" />
            <line x1="480" y1="160" x2="660" y2="160" stroke="#004ac6" strokeWidth="4" strokeDasharray="8,4" />

            {/* Link bandwidth badges */}
            <rect x="180" y="145" width="60" height="18" rx="4" fill="#ffffff" stroke="#dae2fd" />
            <text x="210" y="158" textAnchor="middle" fontSize="9" fill="#434655" fontFamily="monospace">1 Gbps</text>

            <rect x="360" y="145" width="60" height="18" rx="4" fill="#ffffff" stroke="#dae2fd" />
            <text x="390" y="158" textAnchor="middle" fontSize="9" fill="#434655" fontFamily="monospace">10 Gbps</text>

            <rect x="540" y="145" width="60" height="18" rx="4" fill="#ffffff" stroke="#dae2fd" />
            <text x="570" y="158" textAnchor="middle" fontSize="9" fill="#004ac6" fontFamily="monospace">WAN Fiber</text>

            {/* Animated In-Flight Packet Dot */}
            {packetInFlight && (
              <g>
                <circle
                  r="8"
                  fill="#57dffe"
                  stroke="#004ac6"
                  strokeWidth="2"
                  className="animate-pulse"
                >
                  <animate
                    attributeName="cx"
                    from="120"
                    to="660"
                    dur="3s"
                    repeatCount="1"
                  />
                  <animate
                    attributeName="cy"
                    from="160"
                    to="160"
                    dur="3s"
                    repeatCount="1"
                  />
                </circle>
              </g>
            )}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSource = node.id === selectedSource;
              const isDest = node.id === selectedDest;

              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  {/* Outer ring */}
                  <circle
                    r="28"
                    fill={isSource || isDest ? '#dbe1ff' : '#ffffff'}
                    stroke={isSource ? '#004ac6' : isDest ? '#00687a' : '#dae2fd'}
                    strokeWidth={isSource || isDest ? '3' : '2'}
                    className="shadow-sm"
                  />
                  {/* Icon label */}
                  <text
                    y="6"
                    textAnchor="middle"
                    fontSize="18"
                    className="select-none"
                  >
                    {node.type === 'pc' ? '💻' : node.type === 'switch' ? '🔀' : node.type === 'router' ? '🌐' : '🖥️'}
                  </text>

                  {/* Node label */}
                  <text
                    y="42"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#131b2e"
                  >
                    {node.name}
                  </text>
                  <text
                    y="55"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="monospace"
                    fill="#434655"
                  >
                    {node.ip}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Packet Logs and Frame Inspector */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 bg-[#283044] text-[#eef0ff] p-4 rounded-xl font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#434655] mb-2">
              <span className="text-[#57dffe] font-bold">REAL-TIME PACKET TRAFFIC LOG</span>
              <span className="text-[10px] text-[#dae2fd]/70">CAPTURE INTERFACE: eth0</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {packetLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed text-[#acedff]">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#f2f3ff] p-4 rounded-xl border border-[#dae2fd] text-xs">
            <h4 className="font-bold text-[#131b2e] mb-2 font-mono text-[11px] uppercase">
              Encapsulation Frame Breakdown
            </h4>
            <div className="space-y-1.5 font-mono">
              <div className="p-2 rounded bg-white border border-[#dae2fd] flex justify-between">
                <span className="text-[#004ac6] font-bold">L2 Ethernet II:</span>
                <span>Dst: 00:1A:2B:EE:FF:03 | Src: 52:54:00:12:34:56</span>
              </div>
              <div className="p-2 rounded bg-white border border-[#dae2fd] flex justify-between">
                <span className="text-[#004ac6] font-bold">L3 IPv4 Header:</span>
                <span>10.0.0.42 → 172.16.4.1 (TTL: 64, Protocol: 6 TCP)</span>
              </div>
              <div className="p-2 rounded bg-white border border-[#dae2fd] flex justify-between">
                <span className="text-[#004ac6] font-bold">L4 TCP Segment:</span>
                <span>Port: 54210 → 443 | SEQ: 0x2A1B ACK: 0 SYN: 1</span>
              </div>
              <div className="p-2 rounded bg-white border border-[#dae2fd] flex justify-between">
                <span className="text-[#004ac6] font-bold">L7 HTTP Payload:</span>
                <span>GET /api/v1/topology HTTP/1.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
