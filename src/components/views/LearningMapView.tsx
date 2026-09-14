import React, { useState } from 'react';
import { NavTab } from '../../types';
import { CrescoMascot } from '../brand/CrescoMascot';
import { soundFx } from '../../utils/soundEffects';
import { useAuth } from '../../context/AuthContext';
import { 
  Check, 
  Lock, 
  Trophy, 
  Play, 
  Sparkles, 
  Truck, 
  Globe, 
  Network, 
  ShieldCheck, 
  Info,
  ChevronDown,
  Compass
} from 'lucide-react';

interface LearningMapViewProps {
  onSelectLesson: (lessonId: string, sectionId: number) => void;
  onNavigate: (tab: NavTab) => void;
}

interface MapNode {
  id: string;
  unit: 3 | 4 | 5;
  title: string;
  status: 'completed' | 'current' | 'locked' | 'boss';
  type: 'single' | 'branch-left' | 'branch-right' | 'merge';
  xOffset?: number; // -1 for left, 0 for center, 1 for right
  xp: number;
  bossChallengeId?: string;
  icon?: string;
}

export const LearningMapView: React.FC<LearningMapViewProps> = ({
  onSelectLesson,
  onNavigate,
}) => {
  const { userProfile } = useAuth();
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [activeUnitTab, setActiveUnitTab] = useState<3 | 4 | 5>(3);

  const completedIds = userProfile?.completedModules || [];

  // Handcrafted syllabus node templates
  const rawUnit3Nodes = [
    { id: 'u3_m01', unit: 3 as const, title: 'Network Layer — Need & Issues', type: 'single' as const, xOffset: 0, xp: 20 },
    { id: 'u3_m02', unit: 3 as const, title: 'Routing Algorithms', type: 'branch-left' as const, xOffset: -1, xp: 25 },
    { id: 'u3_m03', unit: 3 as const, title: 'Congestion Control Algorithms', type: 'single' as const, xOffset: 0, xp: 30 },
    { id: 'u3_m04', unit: 3 as const, title: 'Quality of Service (QoS)', type: 'single' as const, xOffset: 0, xp: 20 },
    { id: 'u3_m05', unit: 3 as const, title: 'Network Layer in Internet', type: 'branch-left' as const, xOffset: -1, xp: 25 },
    { id: 'u3_m06', unit: 3 as const, title: 'Network Addressing', type: 'branch-right' as const, xOffset: 1, xp: 25 },
    { id: 'u3_m07', unit: 3 as const, title: 'Router Configuration', type: 'merge' as const, xOffset: 0, xp: 25 },
    { id: 'u3_m08', unit: 3 as const, title: 'ARP & RARP', type: 'single' as const, xOffset: 0, xp: 20 },
    { id: 'u3_m09', unit: 3 as const, title: 'Network Access Control', type: 'branch-left' as const, xOffset: -1, xp: 20 },
    { id: 'u3_m10', unit: 3 as const, title: 'Extensible Authentication Protocol', type: 'branch-right' as const, xOffset: 1, xp: 25 },
    { id: 'u3_m11', unit: 3 as const, title: 'IEEE 802.1X', type: 'single' as const, xOffset: 0, xp: 25 },
    { id: 'u3_boss', unit: 3 as const, title: 'NETWORK LAYER CHALLENGE: Route the packets', type: 'single' as const, xOffset: 0, xp: 100, bossChallengeId: 'boss-route' },
  ];

  const rawUnit4Nodes = [
    { id: 'u4_m01', unit: 4 as const, title: 'Transport Layer — Need & Issues', type: 'single' as const, xOffset: 0, xp: 20 },
    { id: 'u4_m02', unit: 4 as const, title: 'Transport Services', type: 'single' as const, xOffset: 0, xp: 20 },
    { id: 'u4_m03', unit: 4 as const, title: 'Elements of Transport Protocols', type: 'branch-left' as const, xOffset: -1, xp: 25 },
    { id: 'u4_m04', unit: 4 as const, title: 'Simple Transport Protocol', type: 'branch-right' as const, xOffset: 1, xp: 25 },
    { id: 'u4_m05', unit: 4 as const, title: 'TCP', type: 'branch-left' as const, xOffset: -1, xp: 30 },
    { id: 'u4_m06', unit: 4 as const, title: 'UDP', type: 'branch-right' as const, xOffset: 1, xp: 25 },
    { id: 'u4_m07', unit: 4 as const, title: 'Transport-Level Security', type: 'merge' as const, xOffset: 0, xp: 25 },
    { id: 'u4_m08', unit: 4 as const, title: 'SSL', type: 'branch-left' as const, xOffset: -1, xp: 20 },
    { id: 'u4_m09', unit: 4 as const, title: 'TLS', type: 'branch-right' as const, xOffset: 1, xp: 25 },
    { id: 'u4_m10', unit: 4 as const, title: 'SSH', type: 'merge' as const, xOffset: 0, xp: 25 },
    { id: 'u4_boss', unit: 4 as const, title: 'TRANSPORT CHALLENGE: Deliver the data', type: 'single' as const, xOffset: 0, xp: 100, bossChallengeId: 'boss-transport' },
  ];

  const rawUnit5Nodes = [
    { id: 'u5_m01', unit: 5 as const, title: 'Application Layer — Need & Issues', type: 'single' as const, xOffset: 0, xp: 20 },
    { id: 'u5_m02', unit: 5 as const, title: 'DNS', type: 'branch-left' as const, xOffset: -1, xp: 25 },
    { id: 'u5_m03', unit: 5 as const, title: 'Electronic Mail', type: 'branch-right' as const, xOffset: 1, xp: 25 },
    { id: 'u5_m04', unit: 5 as const, title: 'FTP', type: 'merge' as const, xOffset: 0, xp: 20 },
    { id: 'u5_m05', unit: 5 as const, title: 'HTTP', type: 'branch-left' as const, xOffset: -1, xp: 25 },
    { id: 'u5_m06', unit: 5 as const, title: 'WWW', type: 'branch-right' as const, xOffset: 1, xp: 20 },
    { id: 'u5_m07', unit: 5 as const, title: 'HTTPS', type: 'merge' as const, xOffset: 0, xp: 25 },
    { id: 'u5_m08', unit: 5 as const, title: 'DHCP', type: 'single' as const, xOffset: 0, xp: 25 },
    { id: 'u5_m09', unit: 5 as const, title: 'Security', type: 'branch-left' as const, xOffset: -1, xp: 25 },
    { id: 'u5_m10', unit: 5 as const, title: 'Web Security', type: 'branch-right' as const, xOffset: 1, xp: 30 },
    { id: 'u5_boss', unit: 5 as const, title: 'APPLICATION CHALLENGE: Bring the Internet online', type: 'single' as const, xOffset: 0, xp: 100, bossChallengeId: 'boss-web' },
  ];

  // Dynamically compute real status based on actual user progression
  const isUnit4Unlocked = (userProfile?.completedUnits || 0) >= 1 || (userProfile?.completedSteps || []).includes('quiz_unit_3');
  const isUnit5Unlocked = (userProfile?.completedUnits || 0) >= 2 || (userProfile?.completedSteps || []).includes('quiz_unit_4');

  const resolveNodes = (rawList: Array<Omit<MapNode, 'status'>>, unit: 3 | 4 | 5): MapNode[] => {
    const isUnitUnlocked = unit === 3 ? true : unit === 4 ? isUnit4Unlocked : isUnit5Unlocked;

    if (!isUnitUnlocked) {
      return rawList.map((n) => ({ ...n, status: 'locked' as const }));
    }

    // Find the first uncompleted lesson in this unit
    const firstUnfinishedIndex = rawList.findIndex(
      (n) => !n.id.includes('boss') && !completedIds.includes(n.id) && !completedIds.includes(n.id.replace('_m0', '_m'))
    );

    return rawList.map((n, idx) => {
      if (n.id.includes('boss')) {
        // Boss challenge unlocks only when all unit lessons are completed
        const allLessonsDone = rawList
          .filter((l) => !l.id.includes('boss'))
          .every((l) => completedIds.includes(l.id) || completedIds.includes(l.id.replace('_m0', '_m')));
        return { ...n, status: allLessonsDone ? 'boss' : 'locked' };
      }

      const isCompleted = completedIds.includes(n.id) || completedIds.includes(n.id.replace('_m0', '_m'));
      if (isCompleted) {
        return { ...n, status: 'completed' as const };
      }

      // If this is the next unfinished module to be played, mark it 'current'
      if (idx === firstUnfinishedIndex) {
        return { ...n, status: 'current' as const };
      }

      // Otherwise locked
      return { ...n, status: 'locked' as const };
    });
  };

  const unit3Nodes: MapNode[] = resolveNodes(rawUnit3Nodes, 3);
  const unit4Nodes: MapNode[] = resolveNodes(rawUnit4Nodes, 4);
  const unit5Nodes: MapNode[] = resolveNodes(rawUnit5Nodes, 5);

  const activeNodes = activeUnitTab === 3 ? unit3Nodes : activeUnitTab === 4 ? unit4Nodes : unit5Nodes;

  // Real progress counts
  const unit3Total = rawUnit3Nodes.filter((n) => !n.id.includes('boss')).length;
  const unit4Total = rawUnit4Nodes.filter((n) => !n.id.includes('boss')).length;
  const unit5Total = rawUnit5Nodes.filter((n) => !n.id.includes('boss')).length;
  const unit3Done = unit3Nodes.filter((n) => n.status === 'completed' && !n.id.includes('boss')).length;
  const unit4Done = unit4Nodes.filter((n) => n.status === 'completed' && !n.id.includes('boss')).length;
  const unit5Done = unit5Nodes.filter((n) => n.status === 'completed' && !n.id.includes('boss')).length;

  const handleNodeClick = (node: MapNode) => {
    setSelectedNode(node);
    if (node.status === 'locked') {
      soundFx.playError();
      return;
    }
    if (node.status === 'boss') {
      soundFx.playCorrect();
      onNavigate('boss-challenge');
    } else if (node.status === 'current' || node.status === 'completed') {
      soundFx.playPacketPop();
      const canonicalId = node.id.replace('_m0', '_m');
      onSelectLesson(canonicalId, node.unit === 3 ? 0 : node.unit === 4 ? 1 : 2);
    } else {
      soundFx.playIncorrect();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* 1. Map Header & Unit Switcher Tabs */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest">
              <Compass size={14} />
              <span>THE INTERNET AS A JOURNEY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
              Network Topology Map
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
              Every lesson is a node. Every completed topic forms a living connection.
            </p>
          </div>

          {/* Unit Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F7F5F0] dark:bg-[#111827] rounded-2xl border border-[#E5E0D8] dark:border-slate-700">
            <button
              onClick={() => { soundFx.playClick(); setActiveUnitTab(3); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeUnitTab === 3 
                  ? 'bg-[#3157D5] text-white shadow-xs' 
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#172033]'
              }`}
            >
              UNIT III
            </button>
            <button
              onClick={() => { 
                if (!isUnit4Unlocked) {
                  soundFx.playError();
                  return;
                }
                soundFx.playClick(); 
                setActiveUnitTab(4); 
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                activeUnitTab === 4 
                  ? 'bg-[#3157D5] text-white shadow-xs cursor-pointer' 
                  : isUnit4Unlocked
                  ? 'text-[#64748B] dark:text-slate-400 hover:text-[#172033] cursor-pointer'
                  : 'text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed'
              }`}
            >
              {!isUnit4Unlocked && <Lock size={10} />}
              <span>UNIT IV</span>
            </button>
            <button
              onClick={() => { 
                if (!isUnit5Unlocked) {
                  soundFx.playError();
                  return;
                }
                soundFx.playClick(); 
                setActiveUnitTab(5); 
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                activeUnitTab === 5 
                  ? 'bg-[#3157D5] text-white shadow-xs cursor-pointer' 
                  : isUnit5Unlocked
                  ? 'text-[#64748B] dark:text-slate-400 hover:text-[#172033] cursor-pointer'
                  : 'text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed'
              }`}
            >
              {!isUnit5Unlocked && <Lock size={10} />}
              <span>UNIT V</span>
            </button>
          </div>
        </div>

        {/* Active Unit Banner */}
        <div className="mt-5 pt-5 border-t border-[#EFECE6] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CrescoMascot
              pose={activeUnitTab === 3 ? 'connected' : activeUnitTab === 4 ? 'security' : 'coding-lab'}
              size="sm"
              animation="float"
              withGlow
            />
            <div>
              <span className="text-xs font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase font-mono">
                {activeUnitTab === 3 ? 'UNIT III — NETWORK LAYER' : activeUnitTab === 4 ? 'UNIT IV — TRANSPORT LAYER' : 'UNIT V — APPLICATION LAYER'}
              </span>
              <h2 className="text-lg font-black text-[#172033] dark:text-[#F9FAFB]">
                {activeUnitTab === 3 ? '"Find the best path."' : activeUnitTab === 4 ? '"Move data reliably."' : '"Explore the Internet."'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 font-mono">
                {activeUnitTab === 3 ? `${unit3Done} / ${unit3Total} lessons` : activeUnitTab === 4 ? `${unit4Done} / ${unit4Total} lessons` : `${unit5Done} / ${unit5Total} lessons`}
              </span>
              <div className="w-32 h-2.5 bg-[#F7F5F0] dark:bg-slate-800 rounded-full overflow-hidden border border-[#E5E0D8] dark:border-slate-700 mt-1">
                <div 
                  className="h-full bg-[#35A86B] rounded-full transition-all duration-700"
                  style={{ width: activeUnitTab === 3 ? `${Math.round((unit3Done / unit3Total) * 100)}%` : activeUnitTab === 4 ? `${Math.round((unit4Done / unit4Total) * 100)}%` : `${Math.round((unit5Done / unit5Total) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hand-Crafted Vertical Network Journey Topology */}
      <div className="relative py-6 flex flex-col items-center">
        
        {/* Living Topology SVG Background Cables */}
        <div className="w-full max-w-lg mx-auto flex flex-col items-center space-y-6 relative">
          
          {activeNodes.map((node, index) => {
            const isCompleted = node.status === 'completed';
            const isCurrent = node.status === 'current';
            const isBoss = node.status === 'boss';
            const isLocked = node.status === 'locked';

            // Calculate x-translation for branching topology nodes
            const translateX = node.xOffset === -1 ? '-translate-x-20 sm:-translate-x-28' : node.xOffset === 1 ? 'translate-x-20 sm:translate-x-28' : 'translate-x-0';

            return (
              <div key={node.id} className="w-full flex flex-col items-center relative">
                
                {/* Connecting Cable to Previous Node */}
                {index > 0 && (
                  <div className="w-1 h-10 -mt-6 -mb-1 bg-[#E5E0D8] dark:bg-slate-700 relative z-0">
                    {(isCompleted || isCurrent) && (
                      <div className="w-full h-full bg-[#3157D5] dark:bg-[#6D8CFF]" />
                    )}
                  </div>
                )}

                {/* Node Tile */}
                <div className={`relative z-10 transform ${translateX} transition-all duration-200`}>
                  
                  {/* Network Octopus Mascot floating above current node */}
                  {isCurrent && (
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-20">
                      <CrescoMascot
                        pose="front"
                        size="sm"
                        animation="bounce"
                        withGlow
                        speechText="YOU ARE HERE"
                        speechPosition="top"
                      />
                    </div>
                  )}

                  {/* Interactive Node Button */}
                  <button
                    onClick={() => handleNodeClick(node)}
                    className={`relative flex items-center justify-center transition-all cursor-pointer ${
                      isBoss
                        ? 'w-20 h-20 rounded-3xl bg-[#F0A63A] hover:bg-[#D97706] text-white shadow-[0_6px_0_0_#B45309] active:translate-y-1 active:shadow-none'
                        : isCurrent
                        ? 'w-18 h-18 rounded-full bg-[#3157D5] hover:bg-[#2442B0] text-white shadow-[0_6px_0_0_#2442B0] ring-8 ring-[#3157D5]/20 animate-pulse active:translate-y-1 active:shadow-none'
                        : isCompleted
                        ? 'w-14 h-14 rounded-full bg-[#35A86B] hover:bg-[#2F855A] text-white shadow-[0_4px_0_0_#276749] active:translate-y-0.5 active:shadow-none'
                        : 'w-13 h-13 rounded-full bg-white dark:bg-[#1F2937] text-[#94A3B8] border-2 border-[#E5E0D8] dark:border-slate-700 shadow-xs hover:border-slate-400'
                    }`}
                    title={node.title}
                  >
                    {isCompleted && <Check size={26} strokeWidth={3.5} />}
                    {isCurrent && <Play size={26} fill="currentColor" className="ml-1" />}
                    {isBoss && <Trophy size={32} strokeWidth={2.5} />}
                    {isLocked && <Lock size={18} />}
                  </button>

                  {/* Node Title Label Pill */}
                  <div 
                    onClick={() => handleNodeClick(node)}
                    className={`mt-2.5 max-w-[180px] text-center px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-[#3157D5] text-white shadow-xs'
                        : isBoss
                        ? 'bg-[#F0A63A]/15 text-[#B45309] dark:text-[#F0A63A] border border-[#F0A63A]/30'
                        : isCompleted
                        ? 'text-[#172033] dark:text-[#F9FAFB] hover:text-[#35A86B]'
                        : 'text-[#64748B] dark:text-slate-500'
                    }`}
                  >
                    {node.title}
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* 3. Node Detail Inspector Modal / Drawer */}
      {selectedNode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-slideUp">
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#3157D5] rounded-3xl p-5 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#3157D5]/10 dark:bg-[#3157D5]/20 flex items-center justify-center shrink-0">
                {selectedNode.status === 'boss' ? (
                  <Trophy size={24} className="text-[#F0A63A]" />
                ) : (
                  <Network size={24} className="text-[#3157D5] dark:text-[#6D8CFF]" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#3157D5] dark:text-[#6D8CFF]">
                  Unit {selectedNode.unit} · +{selectedNode.xp} XP
                </span>
                <h4 className="text-sm font-black text-[#172033] dark:text-[#F9FAFB] line-clamp-1">
                  {selectedNode.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F7F5F0] dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => handleNodeClick(selectedNode)}
                className="px-5 py-2.5 rounded-xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs tracking-wider shadow-xs cursor-pointer"
              >
                {selectedNode.status === 'boss' ? 'START BOSS' : 'START LESSON'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
