import React, { useState } from 'react';
import { LearningNode } from '../types';
import { soundFx } from '../utils/audio';
import { CrescoMascot, MascotPose } from './brand/CrescoMascot';

interface LearningPathProps {
  nodes: LearningNode[];
  onOpenLesson: (nodeId: string) => void;
  onOpenLab: (nodeId?: string) => void;
}

// Map node topics to mascot expressions
const getNodeMascotPose = (node: LearningNode, index: number): MascotPose => {
  const title = (node.title || '').toLowerCase();
  if (title.includes('security') || title.includes('encrypt') || title.includes('firewall')) return 'security';
  if (title.includes('routing') || title.includes('bgp') || title.includes('ospf')) return 'connected';
  if (title.includes('tcp') || title.includes('transport') || title.includes('udp')) return 'problem-solving';
  if (title.includes('dns') || title.includes('http') || title.includes('application')) return 'coding-lab';
  if (title.includes('subnet') || title.includes('ip') || title.includes('cidr')) return 'thinking';
  if (title.includes('osi') || title.includes('model') || title.includes('topology')) return 'side';
  if (node.status === 'completed') return 'correct';
  if (node.status === 'active') return 'front';
  return 'disconnected';
};

// Zigzag positions: left, center, right pattern for Duolingo-style winding
const getNodePosition = (index: number): 'left' | 'center' | 'right' => {
  const pattern: ('left' | 'center' | 'right')[] = ['center', 'left', 'center', 'right', 'center', 'left', 'center', 'right', 'center', 'left'];
  return pattern[index % pattern.length];
};

export const LearningPath: React.FC<LearningPathProps> = ({
  nodes,
  onOpenLesson,
  onOpenLab,
}) => {
  const [viewMode, setViewMode] = useState<'sequential' | 'topology'>('sequential');
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const activeNode = nodes.find(n => n.status === 'active') || nodes[2];
  const completedCount = nodes.filter(n => n.status === 'completed').length;
  const progressPercent = Math.round((completedCount / nodes.length) * 100);

  return (
    <div className="flex flex-col">
      {/* Pathway Header Bar */}
      <div className="bg-white dark:bg-[#0c1e17] p-4 rounded-2xl shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3 border border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <CrescoMascot pose="front" size="xs" animation="float" />
          <h2 className="text-[18px] font-bold text-[#131b2e] dark:text-[#f0fdf4] tracking-tight">
            YOUR LEARNING PATH
          </h2>
          <span className="px-2 py-0.5 rounded bg-primary/10 font-mono text-[11px] text-primary font-semibold">
            {progressPercent}% COMPLETE
          </span>
        </div>

        {/* Filter / View Controls */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('sequential');
            }}
            className={`px-3 py-1 rounded-md text-[12px] transition-all transform-gpu font-semibold ${
              viewMode === 'sequential'
                ? 'bg-white dark:bg-[#11281f] shadow-sm text-[#131b2e] dark:text-[#f0fdf4]'
                : 'text-[#434655] dark:text-[#bbf7d0] hover:text-[#131b2e]'
            }`}
          >
            🐙 Journey Path
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('topology');
            }}
            className={`px-3 py-1 rounded-md text-[12px] transition-all transform-gpu font-semibold ${
              viewMode === 'topology'
                ? 'bg-white dark:bg-[#11281f] shadow-sm text-[#131b2e] dark:text-[#f0fdf4]'
                : 'text-[#434655] dark:text-[#bbf7d0] hover:text-[#131b2e]'
            }`}
          >
            Topology Tree
          </button>
        </div>
      </div>

      {/* Main Path Body */}
      {viewMode === 'sequential' ? (
        <div className="bg-white dark:bg-[#0c1e17] p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden border border-outline-variant/30">
          {/* Decorative Background Dots */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Progress Overview Strip */}
          <div className="relative mb-8 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
                  NETWORK MASTERY JOURNEY
                </span>
                <span className="text-xs font-mono font-bold text-on-surface-variant">
                  {completedCount}/{nodes.length} Modules
                </span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-primary-container to-secondary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  style={{ width: `${Math.max(4, progressPercent)}%` }}
                />
              </div>
            </div>
            <CrescoMascot
              pose={progressPercent >= 80 ? 'achievement' : progressPercent >= 40 ? 'correct' : 'front'}
              size="sm"
              animation="float"
              withGlow={progressPercent >= 80}
            />
          </div>

          {/* The Winding Gamified Node Path */}
          <div className="relative flex flex-col items-center gap-0">
            {nodes.map((node, index) => {
              const isCompleted = node.status === 'completed';
              const isActive = node.status === 'active';
              const isLocked = node.status === 'locked';
              const position = getNodePosition(index);
              const mascotPose = getNodeMascotPose(node, index);
              const isExpanded = expandedNode === node.id;

              // Horizontal offset for winding effect
              const offsetClass =
                position === 'left'
                  ? 'self-start ml-4 md:ml-12'
                  : position === 'right'
                  ? 'self-end mr-4 md:mr-12'
                  : 'self-center';

              return (
                <div key={node.id} className="w-full flex flex-col items-center relative">
                  {/* Connecting Cable to Previous Node */}
                  {index > 0 && (
                    <div className="relative w-0.5 h-10 -mt-1 -mb-1 z-0">
                      <div
                        className={`w-full h-full rounded-full ${
                          isCompleted || isActive
                            ? 'path-connector-completed'
                            : 'path-connector-locked'
                        }`}
                      />
                      {/* Animated packet dot on active connector */}
                      {isActive && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary animate-octo-bounce" />
                      )}
                    </div>
                  )}

                  {/* Node Container - Zigzag positioned */}
                  <div className={`relative z-10 ${offsetClass} transition-all duration-500 group`}>
                    {/* CrescoMascot floating above ACTIVE node only */}
                    {isActive && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-0.5 z-20">
                        <CrescoMascot pose="front" size="sm" animation="bounce" withGlow />
                        <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-mono font-bold rounded-full whitespace-nowrap shadow-sm">
                          YOU ARE HERE
                        </span>
                      </div>
                    )}

                    {/* Interactive Node Button */}
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        if (isActive) {
                          onOpenLesson(node.id);
                        } else if (isCompleted) {
                          setExpandedNode(isExpanded ? null : node.id);
                        }
                      }}
                      className={`relative flex items-center gap-3 transition-all cursor-pointer rounded-2xl p-3 pr-5 ${
                        isActive
                          ? 'bg-primary/10 dark:bg-primary/20 border-2 border-primary shadow-lg ring-4 ring-primary/15 animate-path-glow'
                          : isCompleted
                          ? 'bg-surface-container-low dark:bg-[#11281f] border border-outline-variant/30 hover:bg-surface-container hover:border-primary/30 shadow-sm'
                          : 'bg-surface-container-low/60 dark:bg-[#11281f]/60 border border-outline-variant/20 opacity-60 cursor-default shadow-none'
                      }`}
                      disabled={isLocked}
                    >
                      {/* Node Number Circle */}
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-mono font-black text-base transition-all ${
                          isActive
                            ? 'bg-primary text-white shadow-[0_4px_0_0_#047857] ring-4 ring-primary/30'
                            : isCompleted
                            ? 'bg-primary/20 text-primary border-2 border-primary/40'
                            : 'bg-surface-container text-on-surface-variant/50 border-2 border-outline-variant/30'
                        }`}
                      >
                        {isCompleted ? (
                          <span className="text-xl">✓</span>
                        ) : isLocked ? (
                          <span className="text-lg">🔒</span>
                        ) : (
                          <span className="text-lg">▶</span>
                        )}
                      </div>

                      {/* Node Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? 'text-primary' : isCompleted ? 'text-primary/70' : 'text-on-surface-variant/50'
                          }`}>
                            {node.nodeCode || `MODULE ${String(index + 1).padStart(2, '0')}`}
                            {isCompleted && ' • COMPLETED'}
                            {isActive && ' • IN PROGRESS'}
                            {isLocked && ' • LOCKED'}
                          </span>
                        </div>
                        <h4 className={`text-sm font-bold mt-0.5 line-clamp-1 ${
                          isActive
                            ? 'text-[#131b2e] dark:text-white'
                            : isCompleted
                            ? 'text-[#131b2e] dark:text-[#f0fdf4]'
                            : 'text-on-surface-variant/60'
                        }`}>
                          {node.title}
                        </h4>
                        {node.description && (
                          <p className="text-[11px] text-on-surface-variant/70 mt-0.5 line-clamp-1">
                            {node.description}
                          </p>
                        )}
                      </div>

                      {/* Contextual Mini Mascot per node */}
                      <div className={`shrink-0 ${isLocked ? 'opacity-30 grayscale' : ''}`}>
                        <CrescoMascot
                          pose={mascotPose}
                          size="xs"
                          animation={isActive ? 'sway' : 'none'}
                          interactive={false}
                        />
                      </div>

                      {/* XP Badge */}
                      {(isCompleted || isActive) && (
                        <span className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-black shadow-sm ${
                          isCompleted
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/40'
                        }`}>
                          {isCompleted ? '+100 XP' : '+50 XP'}
                        </span>
                      )}
                    </button>

                    {/* Expanded Active Node Detail Card */}
                    {isActive && (
                      <div className="mt-3 bg-white dark:bg-[#11281f] border border-primary/20 rounded-2xl p-4 shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-3 mb-3">
                          <CrescoMascot pose={mascotPose} size="sm" animation="float" speechText={`Let's master ${node.title}!`} speechPosition="right" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onOpenLesson(node.id);
                            }}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_4px_0_0_#047857] hover:bg-primary-container active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
                          >
                            <span>▶</span> Continue Learning
                          </button>
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onOpenLab(node.id);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm font-semibold border border-outline-variant/30 hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
                          >
                            🧪 Lab
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded Completed Node Detail */}
                    {isCompleted && isExpanded && (
                      <div className="mt-2 bg-surface-container-low dark:bg-[#11281f] border border-primary/20 rounded-xl p-3 shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-2 text-xs">
                          <CrescoMascot pose="correct" size="xs" animation="none" />
                          <span className="font-bold text-primary">Mastered!</span>
                          <span className="text-on-surface-variant/70">—</span>
                          <button
                            onClick={() => onOpenLesson(node.id)}
                            className="text-primary font-bold hover:underline"
                          >
                            Review →
                          </button>
                          <button
                            onClick={() => onOpenLab(node.id)}
                            className="text-on-surface-variant font-semibold hover:text-primary"
                          >
                            🧪 Sandbox
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* End of Path Celebration */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <CrescoMascot
                pose="achievement"
                size="lg"
                animation={completedCount === nodes.length ? 'bounce' : 'none'}
                withGlow={completedCount === nodes.length}
                badge={completedCount === nodes.length ? 'NETWORK MASTER' : undefined}
                className={completedCount === nodes.length ? '' : 'opacity-20 grayscale'}
              />
              <span className={`text-xs font-mono font-bold ${
                completedCount === nodes.length ? 'text-primary' : 'text-on-surface-variant/40'
              }`}>
                {completedCount === nodes.length ? '🎉 COURSE COMPLETED!' : `${nodes.length - completedCount} modules remaining`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Topology Tree View Mode */
        <div className="bg-white dark:bg-[#0c1e17] p-6 rounded-2xl shadow-sm border border-outline-variant/30 relative overflow-hidden min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CrescoMascot pose="connected" size="xs" animation="float" />
              <div>
                <h3 className="text-sm font-bold text-[#131b2e] dark:text-[#f0fdf4]">Network Topology Tree Explorer</h3>
                <p className="text-xs text-on-surface-variant">Interactive routing graph of the core syllabus nodes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary/30 border border-primary"></span> Completed</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span> Active</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-surface-container"></span> Locked</span>
            </div>
          </div>

          {/* Interactive Topology Graph SVG */}
          <div className="w-full h-80 bg-surface-container-low rounded-xl border border-outline-variant/20 relative overflow-hidden flex items-center justify-center p-4">
            <svg className="w-full h-full" viewBox="0 0 800 320">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b98120" strokeWidth="1" />
                </pattern>
                <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Topology Connecting Paths */}
              <line x1="120" y1="160" x2="260" y2="100" stroke="#10b981" strokeWidth="3" />
              <line x1="260" y1="100" x2="400" y2="160" stroke="url(#activeGrad)" strokeWidth="3" strokeDasharray="6,4" />
              <line x1="400" y1="160" x2="540" y2="90" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
              <line x1="400" y1="160" x2="540" y2="230" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
              <line x1="540" y1="90" x2="680" y2="90" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
              <line x1="540" y1="230" x2="680" y2="230" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />

              {/* Animated packet dot */}
              <circle r="5" fill="#10b981">
                <animateMotion path="M 260 100 L 400 160" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Node 1: Completed */}
              <g className="cursor-pointer" onClick={() => { soundFx.playClick(); onOpenLesson('node-01'); }}>
                <circle cx="120" cy="160" r="24" fill="#10b98130" stroke="#10b981" strokeWidth="2" />
                <text x="120" y="165" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">01</text>
                <text x="120" y="196" textAnchor="middle" fill="#062419" fontSize="10" fontWeight="600">Fundamentals</text>
              </g>

              {/* Node 2: Completed */}
              <g className="cursor-pointer" onClick={() => { soundFx.playClick(); onOpenLesson('node-02'); }}>
                <circle cx="260" cy="100" r="24" fill="#10b98130" stroke="#10b981" strokeWidth="2" />
                <text x="260" y="105" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">02</text>
                <text x="260" y="70" textAnchor="middle" fill="#062419" fontSize="10" fontWeight="600">Topologies</text>
              </g>

              {/* Node 3: Active */}
              <g className="cursor-pointer" onClick={() => { soundFx.playClick(); onOpenLesson('node-03'); }}>
                <circle cx="400" cy="160" r="32" fill="#10b98130" className="animate-ping" />
                <circle cx="400" cy="160" r="26" fill="#10b981" stroke="#ffffff" strokeWidth="3" />
                <text x="400" y="165" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">03</text>
                <text x="400" y="202" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">OSI 7-Layer</text>
              </g>

              {/* Locked Nodes */}
              {[
                { cx: 540, cy: 90, label: '04', name: 'TCP/IP', ny: 60 },
                { cx: 540, cy: 230, label: '05', name: 'CIDR Math', ny: 265 },
                { cx: 680, cy: 230, label: '06', name: 'Subnetting', ny: 265 },
                { cx: 680, cy: 90, label: '07', name: 'Routing', ny: 60 },
              ].map((n) => (
                <g key={n.label} className="cursor-pointer" onClick={() => soundFx.playClick()}>
                  <circle cx={n.cx} cy={n.cy} r="22" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                  <text x={n.cx} y={n.cy + 5} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">{n.label}</text>
                  <text x={n.cx} y={n.ny} textAnchor="middle" fill="#64748b" fontSize="10">{n.name}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Selected Node Details Box */}
          {(() => {
            const node = activeNode;
            return (
              <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CrescoMascot pose={getNodeMascotPose(node, 2)} size="sm" animation="float" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{node.nodeCode}</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-bold">Active</span>
                    </div>
                    <h4 className="text-base font-bold text-[#131b2e] dark:text-[#f0fdf4] mt-1">{node.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">{node.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenLesson(node.id)}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow hover:bg-primary-container transition-colors"
                  >
                    Resume Lesson
                  </button>
                  <button
                    onClick={() => onOpenLab(node.id)}
                    className="px-3 py-2 rounded-lg bg-white dark:bg-[#11281f] text-[#131b2e] dark:text-[#f0fdf4] text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container transition-colors flex items-center gap-1"
                  >
                    🧪 Sandbox
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
