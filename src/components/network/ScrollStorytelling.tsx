import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, ArrowRight, CheckCircle2, RotateCcw, ChevronLeft, ChevronRight, Server, Sparkles } from 'lucide-react';
import { RouterIcon, PacketIcon, ServerNodeIcon } from '../brand/NetworkNodeIcons';

export const ScrollStorytelling: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      step: 1,
      title: 'A packet is born at your laptop',
      action: 'You type "klu.ac.in" in your browser. The application creates an HTTP request, wraps it inside a TCP segment with a destination port 443, and attaches your IP address.',
      icon: Laptop,
      badge: 'Local Host',
      visualNode: 'Laptop (192.168.1.15)',
      statusText: 'Encapsulating HTTP/TCP payload into IPv4 packet...',
    },
    {
      step: 2,
      title: 'Reaches your local gateway router',
      action: 'The packet leaves your Wi-Fi interface as an Ethernet frame and arrives at the edge router. The router translates your private IP address via NAT and consults its routing table.',
      icon: RouterIcon,
      badge: 'Edge Router',
      visualNode: 'Default Gateway (192.168.1.1)',
      statusText: 'NAT rewrite: 192.168.1.15:52014 -> 115.242.10.4:52014',
    },
    {
      step: 3,
      title: 'BGP routers determine the optimal route',
      action: 'Through autonomous systems across the internet, core BGP routers exchange routing metrics using Dijkstra and Bellman-Ford to pick the lowest-latency path across fiber optics.',
      icon: RouterIcon,
      badge: 'Core Transit',
      visualNode: 'AS-BGP Transit Backbone',
      statusText: 'Path evaluation: 4 Autonomous Systems hops to destination AS',
    },
    {
      step: 4,
      title: 'Arrives at the destination server',
      action: 'The web server receives the packet on its network interface card, strips off Ethernet and IP headers, validates the TCP checksum, and hands the HTTP request to the web application.',
      icon: ServerNodeIcon,
      badge: 'Authoritative Server',
      visualNode: 'KLU Web Server (104.21.58.91)',
      statusText: 'TCP Handshake ACK established, payload served in 24ms.',
    },
    {
      step: 5,
      title: "The response returns. That's networking.",
      action: 'The webpage renders in milliseconds. No magic—just deterministic mathematical algorithms, protocols, and packets moving across physical glass cables.',
      icon: Sparkles,
      badge: 'Complete Round-Trip',
      visualNode: 'Full Round-Trip Concluded',
      statusText: 'Round-Trip Time: 38ms • Packet integrity 100%',
    },
  ];

  const current = stages[activeStage];

  return (
    <div className={`w-full bg-slate-50 dark:bg-[#131E35] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 ${className}`}>
      
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center space-y-2 mb-8">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          The 40ms Journey
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          What happens when you open a website?
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Step through how a single packet traverses across protocols and machines to reach a server and return.
        </p>
      </div>

      {/* Stage Visualizer Card */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {stages.map((stg, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStage(idx)}
                className={`w-8 h-8 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                  activeStage === idx
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : activeStage > idx
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {activeStage > idx ? '✓' : idx + 1}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Step {activeStage + 1} of {stages.length}
          </span>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <current.icon size={24} />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {current.badge}
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                  {current.title}
                </h4>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {current.action}
            </p>

            {/* Diagnostic Terminal View */}
            <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-xs flex items-center gap-2 border border-slate-800">
              <span className="text-emerald-400 font-bold">$</span>
              <span className="text-slate-300">{current.statusText}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveStage((p) => Math.max(0, p - 1))}
            disabled={activeStage === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {activeStage < stages.length - 1 ? (
            <button
              onClick={() => setActiveStage((p) => Math.min(stages.length - 1, p + 1))}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setActiveStage(0)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Replay Story</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
