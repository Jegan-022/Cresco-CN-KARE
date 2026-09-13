import React, { useState } from 'react';
import { LearningNode } from '../types';
import { soundFx } from '../utils/audio';

interface LearningPathProps {
  nodes: LearningNode[];
  onOpenLesson: (nodeId: string) => void;
  onOpenLab: (nodeId?: string) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  nodes,
  onOpenLesson,
  onOpenLab,
}) => {
  const [viewMode, setViewMode] = useState<'sequential' | 'topology'>('sequential');
  const [selectedTopologyNode, setSelectedTopologyNode] = useState<string>('node-03');

  const activeNode = nodes.find(n => n.status === 'active') || nodes[2];

  return (
    <div className="flex flex-col">
      {/* Pathway Header Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3 border border-[#dae2fd]/60">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#004ac6]"></span>
          <h2 className="text-[18px] font-bold text-[#131b2e] tracking-tight">
            YOUR LEARNING PATH
          </h2>
          <span className="px-2 py-0.5 rounded bg-[#eaedff] font-mono text-[11px] text-[#434655] font-semibold">
            CORE ROUTE
          </span>
        </div>

        {/* Filter / View Controls */}
        <div className="flex items-center gap-1 bg-[#eaedff] p-1 rounded-lg">
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('sequential');
            }}
            className={`px-3 py-1 rounded-md text-[12px] transition-all transform-gpu font-semibold ${
              viewMode === 'sequential'
                ? 'bg-white shadow-sm text-[#131b2e]'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            Sequential
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('topology');
            }}
            className={`px-3 py-1 rounded-md text-[12px] transition-all transform-gpu font-semibold ${
              viewMode === 'topology'
                ? 'bg-white shadow-sm text-[#131b2e]'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            Topology Tree
          </button>
        </div>
      </div>

      {/* Main Path Body */}
      {viewMode === 'sequential' ? (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden border border-[#dae2fd]/60">
          {/* Decorative Background Network Mesh Lines */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#004ac6 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          ></div>

          {/* The Connected Node Tree Structure */}
          <div className="relative flex flex-col gap-6">
            {/* Global SVG Path connecting the milestone centers */}
            <div className="absolute left-6 top-8 bottom-8 w-1 -translate-x-1/2 pointer-events-none">
              <div className="w-full h-full bg-[#eaedff]"></div>
              {/* Completed progress fill on the line up to Node 3 */}
              <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#00687a] via-[#57dffe] to-[#004ac6] h-[220px] rounded-full"></div>
            </div>

            {/* NODE 1 (COMPLETED) */}
            <div className="relative flex items-start gap-4 group">
              <div className="relative z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#acedff] text-[#001f26] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg fill-1">
                    check
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-[#f2f3ff] p-4 rounded-xl transition-all transform-gpu hover:bg-[#eaedff] border border-transparent hover:border-[#dae2fd]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-mono text-[11px] text-[#00687a] font-bold uppercase tracking-wider">
                      Node 01 // COMPLETED
                    </span>
                    <h3 className="text-[18px] font-bold text-[#131b2e] mt-0.5">
                      Network Fundamentals
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#dae2fd] text-[#434655] font-bold">
                      100% SCORE
                    </span>
                    <span className="font-mono text-[11px] text-[#00687a] font-semibold">
                      +100 XP
                    </span>
                  </div>
                </div>
                <p className="text-[12px] text-[#434655] mt-1">
                  Bandwidth, propagation delay, packet loss models, and physical topologies examined.
                </p>
                <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-[#434655]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">terminal</span> 4 Labs Done
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">timer</span> Completed Mon
                  </span>
                </div>
              </div>
            </div>

            {/* NODE 2 (COMPLETED) */}
            <div className="relative flex items-start gap-4 group">
              <div className="relative z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#acedff] text-[#001f26] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg fill-1">
                    check
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-[#f2f3ff] p-4 rounded-xl transition-all transform-gpu hover:bg-[#eaedff] border border-transparent hover:border-[#dae2fd]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-mono text-[11px] text-[#00687a] font-bold uppercase tracking-wider">
                      Node 02 // COMPLETED
                    </span>
                    <h3 className="text-[18px] font-bold text-[#131b2e] mt-0.5">
                      Network Models & Topologies
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#dae2fd] text-[#434655] font-bold">
                      96% SCORE
                    </span>
                    <span className="font-mono text-[11px] text-[#00687a] font-semibold">
                      +120 XP
                    </span>
                  </div>
                </div>
                <p className="text-[12px] text-[#434655] mt-1">
                  Mesh, Star, Bus configurations, LAN/WAN bridging mechanisms, and collision domains.
                </p>
                <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-[#434655]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">terminal</span> 2 Topology Audits
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">timer</span> Completed Yesterday
                  </span>
                </div>
              </div>
            </div>

            {/* NODE 3 (ACTIVE / CURRENT FOCUS) */}
            <div className="relative flex items-start gap-4 group">
              {/* Animated Glowing Active Node */}
              <div className="relative z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold relative">
                  <span className="material-symbols-outlined text-xl">play_arrow</span>
                  {/* Continuous energetic pulse */}
                  <div className="absolute -inset-1 rounded-full bg-[#004ac6]/30 animate-ping"></div>
                </div>
              </div>

              {/* High-Contrast Highlighted Card Container */}
              <div className="flex-1 bg-[#e2e7ff] p-6 rounded-2xl shadow-md relative overflow-hidden transition-all transform-gpu hover:shadow-lg border border-[#004ac6]/20">
                {/* Glowing corner accent indicator */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#004ac6]/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-[#004ac6] text-white font-mono text-[11px] uppercase tracking-wider font-bold">
                      CURRENT LESSON
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white text-[#004ac6] font-mono text-[11px] font-bold">
                      +50 XP ON COMPLETION
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#434655] flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-sm text-[#004ac6]">schedule</span> 18 min remaining
                  </span>
                </div>

                <h3 className="text-[22px] md:text-[24px] font-extrabold text-[#131b2e]">
                  Module 3: OSI 7-Layer Architecture
                </h3>
                <p className="text-[14px] text-[#434655] mt-1">
                  Dive into protocol data units (PDUs), packet framing, decapsulation pipelines, and transport-to-network handoffs.
                </p>

                {/* Interactive Mini-Simulation Preview Slab */}
                <div className="mt-4 p-3 rounded-xl bg-white shadow-sm flex flex-col gap-2 border border-[#dae2fd]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#131b2e]">
                      PDU ENCAPSULATION SIMULATOR
                    </span>
                    <span className="font-mono text-[11px] text-[#00687a] font-bold">
                      STAGE 3/7 READY
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 h-2 rounded-full overflow-hidden bg-[#eaedff]">
                    <div className="bg-[#00687a]"></div>
                    <div className="bg-[#00687a]"></div>
                    <div className="bg-[#004ac6] animate-pulse"></div>
                    <div className="bg-[#dae2fd]"></div>
                    <div className="bg-[#dae2fd]"></div>
                    <div className="bg-[#dae2fd]"></div>
                    <div className="bg-[#dae2fd]"></div>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] text-[#434655]">
                    <span>L7: Application</span>
                    <span className="text-[#004ac6] font-bold">L4: Segment Layer (Next)</span>
                    <span>L1: Bits</span>
                  </div>
                </div>

                {/* Call to Action Footer */}
                <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onOpenLesson('node-03');
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#004ac6] text-white text-[16px] font-bold shadow-md hover:bg-[#003ea8] hover:shadow-lg transition-all transform-gpu flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Continue Learning</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onOpenLab('node-03');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-[#131b2e] text-[14px] font-semibold hover:bg-[#f2f3ff] transition-all transform-gpu flex items-center justify-center gap-2 border border-[#dae2fd] shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">science</span>
                    <span>Open Sandbox Lab</span>
                  </button>
                </div>
              </div>
            </div>

            {/* NODES 4 - 10 (LOCKED) */}
            {nodes.slice(3).map((node) => (
              <div
                key={node.id}
                className="relative flex items-start gap-4 group opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="relative z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#eaedff] text-[#434655] flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-[#eaedff] hover:border-[#dae2fd] transition-all transform-gpu">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-[16px] font-semibold text-[#131b2e]">
                      {node.title}
                    </h4>
                    <span className="font-mono text-[11px] text-[#434655] flex items-center gap-1 font-medium">
                      {node.prereq ? (
                        <>
                          <span className="material-symbols-outlined text-sm">lock_clock</span>
                          {node.prereq}
                        </>
                      ) : (
                        node.tag
                      )}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#434655] mt-1">{node.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Topology Tree View Mode */
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#dae2fd]/60 relative overflow-hidden min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#131b2e]">Network Topology Tree Explorer</h3>
              <p className="text-xs text-[#434655]">Interactive routing graph of the 10 core semester syllabus nodes</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#434655]">
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#acedff] border border-[#00687a]"></span> Completed</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#004ac6] animate-pulse"></span> Active Focus</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#eaedff]"></span> Locked</span>
            </div>
          </div>

          {/* Interactive Topology Graph SVG */}
          <div className="w-full h-80 bg-[#faf8ff] rounded-xl border border-[#dae2fd] relative overflow-hidden flex items-center justify-center p-4">
            <svg className="w-full h-full" viewBox="0 0 800 320">
              {/* Grid background lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#eaedff" strokeWidth="1" />
                </pattern>
                <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00687a" />
                  <stop offset="100%" stopColor="#004ac6" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Topology Connecting Paths */}
              {/* Node 1 to Node 2 */}
              <line x1="120" y1="160" x2="260" y2="100" stroke="#00687a" strokeWidth="3" />
              {/* Node 2 to Node 3 */}
              <line x1="260" y1="100" x2="400" y2="160" stroke="#004ac6" strokeWidth="3" strokeDasharray="6,4" />
              {/* Node 3 to Node 4 */}
              <line x1="400" y1="160" x2="540" y2="90" stroke="#c3c6d7" strokeWidth="2" strokeDasharray="4,4" />
              {/* Node 3 to Node 5 */}
              <line x1="400" y1="160" x2="540" y2="230" stroke="#c3c6d7" strokeWidth="2" strokeDasharray="4,4" />
              {/* Node 4 to Node 7 */}
              <line x1="540" y1="90" x2="680" y2="90" stroke="#c3c6d7" strokeWidth="2" strokeDasharray="4,4" />
              {/* Node 5 to Node 6 */}
              <line x1="540" y1="230" x2="680" y2="230" stroke="#c3c6d7" strokeWidth="2" strokeDasharray="4,4" />

              {/* In-flight packet animation between node 2 and node 3 */}
              <circle r="5" fill="#57dffe">
                <animateMotion
                  path="M 260 100 L 400 160"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Node 1: Completed */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTopologyNode('node-01');
                }}
              >
                <circle cx="120" cy="160" r="24" fill="#acedff" stroke="#00687a" strokeWidth="2" />
                <text x="120" y="165" textAnchor="middle" fill="#001f26" fontSize="11" fontWeight="bold" fontFamily="monospace">01</text>
                <text x="120" y="196" textAnchor="middle" fill="#131b2e" fontSize="10" fontWeight="600">Fundamentals</text>
              </g>

              {/* Node 2: Completed */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTopologyNode('node-02');
                }}
              >
                <circle cx="260" cy="100" r="24" fill="#acedff" stroke="#00687a" strokeWidth="2" />
                <text x="260" y="105" textAnchor="middle" fill="#001f26" fontSize="11" fontWeight="bold" fontFamily="monospace">02</text>
                <text x="260" y="70" textAnchor="middle" fill="#131b2e" fontSize="10" fontWeight="600">Topologies</text>
              </g>

              {/* Node 3: Active (OSI Architecture) */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTopologyNode('node-03');
                }}
              >
                <circle cx="400" cy="160" r="32" fill="#004ac6" opacity="0.2" className="animate-ping" />
                <circle cx="400" cy="160" r="26" fill="#004ac6" stroke="#ffffff" strokeWidth="3" />
                <text x="400" y="165" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">03</text>
                <text x="400" y="202" textAnchor="middle" fill="#004ac6" fontSize="11" fontWeight="bold">OSI 7-Layer (Active)</text>
              </g>

              {/* Node 4: Locked TCP/IP */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTopologyNode('node-04');
                }}
              >
                <circle cx="540" cy="90" r="22" fill="#eaedff" stroke="#c3c6d7" strokeWidth="1.5" />
                <text x="540" y="95" textAnchor="middle" fill="#737686" fontSize="11" fontFamily="monospace">04</text>
                <text x="540" y="60" textAnchor="middle" fill="#434655" fontSize="10">TCP/IP Suite</text>
              </g>

              {/* Node 5: Locked IP Addressing */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTopologyNode('node-05');
                }}
              >
                <circle cx="540" cy="230" r="22" fill="#eaedff" stroke="#c3c6d7" strokeWidth="1.5" />
                <text x="540" y="235" textAnchor="middle" fill="#737686" fontSize="11" fontFamily="monospace">05</text>
                <text x="540" y="265" textAnchor="middle" fill="#434655" fontSize="10">CIDR Math</text>
              </g>

              {/* Node 6: Locked Subnetting */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTopologyNode('node-06');
                }}
              >
                <circle cx="680" cy="230" r="20" fill="#eaedff" stroke="#c3c6d7" strokeWidth="1.5" />
                <text x="680" y="235" textAnchor="middle" fill="#737686" fontSize="11" fontFamily="monospace">06</text>
                <text x="680" y="265" textAnchor="middle" fill="#434655" fontSize="10">Subnetting</text>
              </g>

              {/* Node 7: Locked BGP / OSPF */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTopologyNode('node-07');
                }}
              >
                <circle cx="680" cy="90" r="20" fill="#eaedff" stroke="#c3c6d7" strokeWidth="1.5" />
                <text x="680" y="95" textAnchor="middle" fill="#737686" fontSize="11" fontFamily="monospace">07</text>
                <text x="680" y="60" textAnchor="middle" fill="#434655" fontSize="10">Routing</text>
              </g>
            </svg>
          </div>

          {/* Selected Node Details Box */}
          {(() => {
            const node = nodes.find(n => n.id === selectedTopologyNode) || activeNode;
            return (
              <div className="mt-4 p-4 rounded-xl bg-[#f2f3ff] border border-[#dae2fd] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#004ac6]">{node.nodeCode}</span>
                    {node.status === 'completed' && <span className="px-1.5 py-0.5 rounded bg-[#acedff] text-[#001f26] text-[10px] font-bold">Passed</span>}
                    {node.status === 'active' && <span className="px-1.5 py-0.5 rounded bg-[#004ac6] text-white text-[10px] font-bold">In Progress</span>}
                    {node.status === 'locked' && <span className="px-1.5 py-0.5 rounded bg-[#eaedff] text-[#737686] text-[10px]">Locked</span>}
                  </div>
                  <h4 className="text-base font-bold text-[#131b2e] mt-1">{node.title}</h4>
                  <p className="text-xs text-[#434655] mt-0.5">{node.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {node.status === 'active' && (
                    <button
                      onClick={() => onOpenLesson(node.id)}
                      className="px-4 py-2 rounded-lg bg-[#004ac6] text-white text-xs font-bold shadow hover:bg-[#003ea8] transition-colors"
                    >
                      Resume Lesson
                    </button>
                  )}
                  {node.status === 'completed' && (
                    <button
                      onClick={() => onOpenLesson(node.id)}
                      className="px-4 py-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold border border-[#dae2fd] hover:bg-[#eaedff] transition-colors"
                    >
                      Review Theory
                    </button>
                  )}
                  <button
                    onClick={() => onOpenLab(node.id)}
                    className="px-3 py-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold border border-[#dae2fd] hover:bg-[#eaedff] transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">science</span>
                    <span>Sandbox</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
