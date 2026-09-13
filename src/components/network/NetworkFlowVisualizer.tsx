import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Laptop, 
  Globe, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw,
  ChevronRight
} from 'lucide-react';
import { RouterIcon, SwitchIcon, ServerNodeIcon, PacketIcon } from '../brand/NetworkNodeIcons';

interface NetworkFlowVisualizerProps {
  interactive?: boolean;
  compact?: boolean;
  activeProtocol?: 'HTTP' | 'DNS' | 'TCP' | 'IP';
  className?: string;
}

const PROTOCOLS: Array<'HTTP' | 'DNS' | 'TCP' | 'IP'> = ['HTTP', 'DNS', 'TCP', 'IP'];

export const NetworkFlowVisualizer: React.FC<NetworkFlowVisualizerProps> = ({
  interactive = true,
  compact = false,
  activeProtocol = 'HTTP',
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [packetCount, setPacketCount] = useState<number>(104);
  const [protocol, setProtocol] = useState<'HTTP' | 'DNS' | 'TCP' | 'IP'>(activeProtocol);

  const nodes = [
    {
      id: 0,
      name: 'Client Host',
      shortName: 'Client',
      type: 'Laptop',
      ip: '192.168.1.45',
      mac: '48:2A:E3:11:9B:02',
      icon: Laptop,
      color: '#2563EB',
    },
    {
      id: 1,
      name: 'Access Switch',
      shortName: 'Switch',
      type: 'L2 Switch',
      ip: 'VLAN 10',
      mac: 'Forwarding Table',
      icon: SwitchIcon,
      color: '#4F46E5',
    },
    {
      id: 2,
      name: 'Default Gateway',
      shortName: 'Gateway',
      type: 'Edge Router',
      ip: '192.168.1.1',
      mac: 'NAT / Route',
      icon: RouterIcon,
      color: '#0891B2',
    },
    {
      id: 3,
      name: 'Internet Transit',
      shortName: 'WAN Transit',
      type: 'BGP Mesh',
      ip: 'Autonomous System',
      mac: 'Optical Backbone',
      icon: Globe,
      color: '#7C3AED',
    },
    {
      id: 4,
      name: 'Destination Server',
      shortName: 'Server',
      type: 'Web Server',
      ip: '104.21.58.91',
      mac: 'TCP 443 / HTTPS',
      icon: ServerNodeIcon,
      color: '#16A34A',
    },
  ];

  const getStepExplanation = (step: number, currentProto: string) => {
    switch (step) {
      case 0:
        return {
          title: `1. ${currentProto} Packet Formulation at Client`,
          detail: `Application encapsulates request into ${currentProto} payload, assigning source socket 192.168.1.45 and preparing TCP/IP encapsulation.`,
          layer: 'Application & Transport Layer',
        };
      case 1:
        return {
          title: '2. Layer 2 Frame Switching',
          detail: 'Switch consults MAC forwarding table and switches the Ethernet frame without altering IP headers.',
          layer: 'Data Link Layer (Ethernet)',
        };
      case 2:
        return {
          title: '3. IP Routing & NAT Translation',
          detail: 'Default gateway decrements TTL, translates private IP to public WAN address via NAT, and determines next-hop route.',
          layer: 'Network Layer (IPv4/IPv6)',
        };
      case 3:
        return {
          title: '4. Autonomous System Transit',
          detail: 'Core BGP backbone routers route datagrams across high-speed optical Autonomous Systems toward the destination.',
          layer: 'Internet Backbone / BGP',
        };
      case 4:
        return {
          title: `5. Server Termination & ${currentProto} ACK`,
          detail: `Destination web server verifies checksums, terminates socket session, and dispatches ${currentProto} response back to client.`,
          layer: 'Destination Host Stack',
        };
      default:
        return {
          title: 'Pipeline Active',
          detail: 'Transmitting packets across the network pipeline.',
          layer: 'Network Infrastructure',
        };
    }
  };

  // Automatic rotation and step advancing timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev === nodes.length - 1) {
          // Reached Destination Server -> Automatically rotate protocol and loop!
          if (autoRotate) {
            setProtocol((currentProto) => {
              const nextIdx = (PROTOCOLS.indexOf(currentProto) + 1) % PROTOCOLS.length;
              return PROTOCOLS[nextIdx];
            });
          }
          setPacketCount((c) => c + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, autoRotate, nodes.length]);

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => {
      if (prev >= nodes.length - 1) {
        if (autoRotate) {
          setProtocol((currentProto) => {
            const nextIdx = (PROTOCOLS.indexOf(currentProto) + 1) % PROTOCOLS.length;
            return PROTOCOLS[nextIdx];
          });
        }
        return 0;
      }
      return prev + 1;
    });
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    setAutoRotate(true);
  };

  const currentExplanation = getStepExplanation(currentStep, protocol);

  return (
    <div className={`w-full bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden ${className}`}>
      
      {/* Visualizer Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <PacketIcon size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
              <span>Interactive Packet Pipeline</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {autoRotate && isPlaying ? 'AUTO-ROTATING' : 'PAUSED'}
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Visualizing packet movement from client host through intermediate routers to server
            </p>
          </div>
        </div>

        {/* Protocol Switcher */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold shrink-0">
          {PROTOCOLS.map((proto) => (
            <button
              key={proto}
              onClick={() => {
                setProtocol(proto);
              }}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all cursor-pointer text-xs ${
                protocol === proto
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold ring-1 ring-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>
      </div>

      {/* Network Nodes Grid & Path - 100% Responsive, Zero Scrollbar */}
      <div className="py-6 px-1 sm:px-2 w-full overflow-hidden select-none">
        <div className="w-full flex items-center justify-between relative">
          
          {/* Background Connecting Bus Line (Centered perfectly through node centers from 10% to 90%) */}
          <div className="absolute left-[10%] right-[10%] top-[22px] sm:top-[26px] md:top-[30px] h-1 bg-slate-200 dark:bg-slate-700/80 -z-0 rounded-full" />

          {/* Active Animated Segment Highlight with subtle glow */}
          <div
            className="absolute left-[10%] top-[22px] sm:top-[26px] md:top-[30px] h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 dark:from-blue-500 dark:via-indigo-400 dark:to-cyan-300 transition-all duration-500 ease-out -z-0 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            style={{
              width: `${(currentStep / (nodes.length - 1)) * 80}%`,
            }}
          />

          {/* Interactive Nodes (5 nodes, exactly 20% width each - No Overflow) */}
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            const isCurrent = currentStep === idx;
            const isPassed = currentStep > idx;

            return (
              <div
                key={node.id}
                onClick={() => {
                  setCurrentStep(idx);
                  setIsPlaying(false);
                }}
                className="flex flex-col items-center text-center relative z-10 cursor-pointer group"
                style={{ width: '20%' }}
              >
                {/* Node Circle Container */}
                <div className="relative">
                  {/* Rotating Gradient Halo when Active */}
                  {isCurrent && (
                    <div className="absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-500 via-cyan-400 to-indigo-500 opacity-70 animate-[spin_4s_linear_infinite] blur-[1px] pointer-events-none" />
                  )}

                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 transition-all duration-300 relative ${
                      isCurrent
                        ? 'bg-white dark:bg-slate-800 border-blue-600 dark:border-blue-400 shadow-md scale-105 sm:scale-110 z-10'
                        : isPassed
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <Icon size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" color={isCurrent ? '#2563EB' : isPassed ? '#3B82F6' : undefined} />

                    {/* Active Packet Indicator Banner */}
                    {isCurrent && (
                      <motion.div
                        layoutId="activePacketIndicator"
                        className="absolute -top-3 px-1.5 py-0.5 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-[9px] sm:text-[10px] font-mono font-bold shadow-sm flex items-center gap-1 z-20 whitespace-nowrap"
                        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>{protocol}</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Responsive Node Metadata Labels */}
                <div className="mt-2 space-y-0.5 w-full px-0.5 overflow-hidden">
                  <div className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    <span className="hidden sm:inline">{node.name}</span>
                    <span className="sm:hidden">{node.shortName}</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {node.ip}
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 truncate hidden xs:block">
                    {node.type}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Step Explanation Box */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              {currentExplanation.layer}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hop {currentStep + 1} of {nodes.length}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              Packets: {packetCount}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {currentExplanation.title}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl line-clamp-2">
            {currentExplanation.detail}
          </p>
        </div>

        {/* Player & Auto-Rotate Controls */}
        {interactive && (
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 shadow-xs"
              title={isPlaying ? 'Pause simulation' : 'Play simulation'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={handleStepForward}
              className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 shadow-xs"
              title="Next hop"
            >
              <ChevronRight size={13} />
              <span>Step</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 shadow-xs"
              title="Reset & Loop"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
