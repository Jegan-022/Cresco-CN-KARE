import React, { useState } from 'react';
import { CrescoMascot } from '../brand/CrescoMascot';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { 
  Network, 
  Server, 
  Router as RouterIcon, 
  Laptop, 
  Layers, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DragDropNetworkViewProps {
  onComplete?: () => void;
  onBack?: () => void;
}

type ComponentType = 'router' | 'switch' | 'server' | 'client';

interface DraggableItem {
  id: string;
  type: ComponentType;
  name: string;
  role: string;
  icon: any;
  color: string;
}

const PALETTE_ITEMS: DraggableItem[] = [
  { id: 'item-router', type: 'router', name: 'Edge Router', role: 'Routes packets across networks (Layer 3)', icon: RouterIcon, color: '#3157D5' },
  { id: 'item-switch', type: 'switch', name: 'Core Switch', role: 'Frames switching within subnet (Layer 2)', icon: Layers, color: '#35A86B' },
  { id: 'item-server', type: 'server', name: 'Web Server', role: 'Hosts web app & responds to requests', icon: Server, color: '#7957C7' },
  { id: 'item-client', type: 'client', name: 'Client PC', role: 'Initiates DNS queries & TCP streams', icon: Laptop, color: '#F0A63A' },
];

export const DragDropNetworkView: React.FC<DragDropNetworkViewProps> = ({
  onComplete,
  onBack,
}) => {
  // Slots in topology:
  // Slot 1: Edge Router (connects to ISP)
  // Slot 2: Core Switch (connects router to endpoints)
  // Slot 3: Web Server (endpoint A)
  // Slot 4: Client PC (endpoint B)
  const [placedSlots, setPlacedSlots] = useState<{
    router: boolean;
    switch: boolean;
    server: boolean;
    client: boolean;
  }>({
    router: false,
    switch: false,
    server: false,
    client: false,
  });

  const [selectedTool, setSelectedTool] = useState<ComponentType | null>(null);
  const isComplete = placedSlots.router && placedSlots.switch && placedSlots.server && placedSlots.client;

  const handlePlace = (targetSlot: ComponentType) => {
    if (!selectedTool) {
      soundFx.playIncorrect();
      return;
    }

    if (selectedTool === targetSlot) {
      soundFx.playCorrect();
      setPlacedSlots((prev) => {
        const next = { ...prev, [targetSlot]: true };
        if (next.router && next.switch && next.server && next.client) {
          soundFx.playLevelUp();
          triggerSubtleSectionConfetti();
        }
        return next;
      });
      setSelectedTool(null);
    } else {
      soundFx.playIncorrect();
    }
  };

  const handleReset = () => {
    soundFx.playClick();
    setPlacedSlots({ router: false, switch: false, server: false, client: false });
    setSelectedTool(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* 1. Header */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest">
            <Network size={14} />
            <span>INTERACTIVE BUILDER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
            Build The Network
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
            Select components from your inventory and place them into the correct topology slots.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] dark:text-slate-400 border border-[#E5E0D8] dark:border-slate-700 hover:bg-[#F7F5F0] dark:hover:bg-slate-800 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw size={14} />
          <span>Reset Grid</span>
        </button>
      </div>

      {/* 2. Component Inventory Bar */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        <span className="text-[11px] font-mono font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
          COMPONENT PALETTE (TAP TO SELECT)
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PALETTE_ITEMS.map((item) => {
            const isPlaced = placedSlots[item.type];
            const isSelected = selectedTool === item.type;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                disabled={isPlaced}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTool(item.type);
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isPlaced
                    ? 'opacity-40 bg-[#F7F5F0] dark:bg-slate-800/50 border-[#E5E0D8] dark:border-slate-800 cursor-not-allowed'
                    : isSelected
                    ? 'bg-white dark:bg-[#1F2937] border-[#3157D5] ring-4 ring-[#3157D5]/20 shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800 hover:border-slate-400 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="p-2 rounded-xl text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon size={18} />
                  </div>
                  {isPlaced && <CheckCircle2 size={16} className="text-[#35A86B]" />}
                </div>

                <div className="font-extrabold text-sm text-[#172033] dark:text-[#F9FAFB]">{item.name}</div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium line-clamp-1 mt-0.5">{item.role}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Live Topology Interactive Canvas with SVG Connection Cables */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Real-time SVG Network Cables */}
        <svg className="w-full h-80 absolute inset-0 pointer-events-none" viewBox="0 0 600 320">
          {/* ISP Cloud to Router cable */}
          <line x1="120" y1="60" x2="300" y2="60" stroke="#3157D5" strokeWidth="3" strokeDasharray={placedSlots.router ? 'none' : '4 4'} opacity={placedSlots.router ? 0.9 : 0.4} />
          
          {/* Router to Switch vertical cable */}
          <line x1="300" y1="80" x2="300" y2="170" stroke="#35A86B" strokeWidth="3" strokeDasharray={placedSlots.router && placedSlots.switch ? 'none' : '4 4'} opacity={placedSlots.switch ? 0.9 : 0.4} />
          
          {/* Switch to Server cable */}
          <line x1="280" y1="180" x2="160" y2="260" stroke="#7957C7" strokeWidth="3" strokeDasharray={placedSlots.switch && placedSlots.server ? 'none' : '4 4'} opacity={placedSlots.server ? 0.9 : 0.4} />
          
          {/* Switch to Client cable */}
          <line x1="320" y1="180" x2="440" y2="260" stroke="#F0A63A" strokeWidth="3" strokeDasharray={placedSlots.switch && placedSlots.client ? 'none' : '4 4'} opacity={placedSlots.client ? 0.9 : 0.4} />

          {/* Animated data packet flowing when complete */}
          {isComplete && (
            <circle cx="300" cy="120" r="5" fill="#35A86B" className="animate-ping origin-center" />
          )}
        </svg>

        {/* Interactive Topology Nodes Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-6 items-center min-h-[300px]">
          
          {/* Top-Left: External ISP */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border-2 border-[#E5E0D8] dark:border-slate-700 flex items-center justify-center text-2xl shadow-xs">
              🌐
            </div>
            <span className="text-xs font-mono font-bold text-[#64748B] mt-2">External ISP</span>
          </div>

          {/* Top-Center: Slot 1 - Edge Router */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handlePlace('router')}
              className={`w-20 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                placedSlots.router
                  ? 'bg-[#3157D5] border-[#3157D5] text-white shadow-md'
                  : 'bg-[#F7F5F0] dark:bg-[#111827] border-[#3157D5] hover:bg-[#3157D5]/10'
              }`}
            >
              <RouterIcon size={28} />
              <span className="text-[10px] font-mono font-bold mt-1">
                {placedSlots.router ? 'Router' : 'Drop Router'}
              </span>
            </button>
            <span className="text-xs font-bold text-[#172033] dark:text-[#F9FAFB] mt-2">Gateway</span>
          </div>

          {/* Top-Right: Spacer */}
          <div />

          {/* Mid-Center: Slot 2 - Core Switch */}
          <div className="col-start-2 flex flex-col items-center">
            <button
              onClick={() => handlePlace('switch')}
              className={`w-20 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                placedSlots.switch
                  ? 'bg-[#35A86B] border-[#35A86B] text-white shadow-md'
                  : 'bg-[#F7F5F0] dark:bg-[#111827] border-[#35A86B] hover:bg-[#35A86B]/10'
              }`}
            >
              <Layers size={28} />
              <span className="text-[10px] font-mono font-bold mt-1">
                {placedSlots.switch ? 'Switch' : 'Drop Switch'}
              </span>
            </button>
            <span className="text-xs font-bold text-[#172033] dark:text-[#F9FAFB] mt-2">Distribution</span>
          </div>

          {/* Bottom-Left: Slot 3 - Web Server */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handlePlace('server')}
              className={`w-20 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                placedSlots.server
                  ? 'bg-[#7957C7] border-[#7957C7] text-white shadow-md'
                  : 'bg-[#F7F5F0] dark:bg-[#111827] border-[#7957C7] hover:bg-[#7957C7]/10'
              }`}
            >
              <Server size={28} />
              <span className="text-[10px] font-mono font-bold mt-1">
                {placedSlots.server ? 'Server' : 'Drop Server'}
              </span>
            </button>
            <span className="text-xs font-bold text-[#172033] dark:text-[#F9FAFB] mt-2">Web Host</span>
          </div>

          {/* Bottom-Center: Spacer */}
          <div />

          {/* Bottom-Right: Slot 4 - Client PC */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handlePlace('client')}
              className={`w-20 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                placedSlots.client
                  ? 'bg-[#F0A63A] border-[#F0A63A] text-white shadow-md'
                  : 'bg-[#F7F5F0] dark:bg-[#111827] border-[#F0A63A] hover:bg-[#F0A63A]/10'
              }`}
            >
              <Laptop size={28} />
              <span className="text-[10px] font-mono font-bold mt-1">
                {placedSlots.client ? 'Client PC' : 'Drop Client'}
              </span>
            </button>
            <span className="text-xs font-bold text-[#172033] dark:text-[#F9FAFB] mt-2">End Host</span>
          </div>

        </div>

      </div>

      {/* 4. Completion Status & Byte Celebration */}
      {isComplete && (
        <div className="bg-[#35A86B]/15 border-2 border-[#35A86B] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 animate-scaleUp">
          <div className="flex items-center gap-4">
            <CrescoMascot pose="connected" size="lg" animation="bounce" withGlow />
            <div>
              <div className="text-lg font-black text-[#35A86B] flex items-center gap-2">
                <Sparkles size={20} />
                <span>Topology Successfully Connected! +50 XP</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#172033] dark:text-[#F9FAFB] mt-1 max-w-md">
                Packets now traverse seamlessly between Client, Switch, Gateway Router, and Web Server.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              if (onComplete) onComplete();
            }}
            className="px-6 py-3 rounded-2xl bg-[#35A86B] hover:bg-[#2F855A] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#276749] active:translate-y-1 active:shadow-none transition-all cursor-pointer shrink-0"
          >
            CONTINUE JOURNEY →
          </button>
        </div>
      )}

    </div>
  );
};
