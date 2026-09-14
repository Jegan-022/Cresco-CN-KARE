import React from 'react';
import { NavTab } from '../types';
import { soundFx } from '../utils/soundEffects';
import { 
  LayoutDashboard, 
  Map, 
  Terminal, 
  Flag, 
  Trophy, 
  Award, 
  BookOpen, 
  LineChart, 
  Settings, 
  Sparkles, 
  User 
} from 'lucide-react';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';
import { CrescoMascot } from './brand/CrescoMascot';

interface SidebarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    badge?: string;
    index: string;
  }[] = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard, index: '01' },
    { id: 'learn-map', label: 'Learn', icon: Map, badge: 'Flight', index: '02' },
    { id: 'practice', label: 'Practice', icon: Terminal, index: '03' },
    { id: 'boss-challenge', label: 'Challenges', icon: Flag, index: '04' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award, index: '05' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, index: '06' },
    { id: 'review', label: 'Notes', icon: BookOpen, index: '07' },
    { id: 'exam', label: 'Progress', icon: LineChart, index: '08' },
    { id: 'profile', label: 'Profile', icon: User, index: '09' },
  ];

  const bottomItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  }[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Resolve normalized active tab
  const normalizedActiveTab: NavTab = (() => {
    if (activeTab === 'courses' || activeTab === 'learn') return 'learn-map';
    if (
      activeTab === 'challenges' || 
      activeTab === 'daily-challenge' || 
      activeTab === 'simulator' || 
      activeTab === 'drag-drop'
    ) {
      return 'boss-challenge';
    }
    return activeTab;
  })();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 select-none py-4 px-3 justify-between transition-colors shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] overflow-y-auto overflow-x-hidden">
      
      {/* Top Nav: Static, Crisp, No Shifting Animation */}
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[10px] font-headline font-bold text-outline uppercase tracking-wider">
          CURRICULUM PORTAL
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isCurrent = normalizedActiveTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onNavigate(item.id);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-headline font-bold text-[13px] tracking-tight transition-colors cursor-pointer select-none text-left relative ${
                  isCurrent
                    ? 'bg-primary/10 text-primary border-l-3 border-primary'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-surface-container/60'
                }`}
              >
                {/* Index number */}
                <span className="font-mono text-[10px] opacity-50 w-4 shrink-0">
                  {item.index}
                </span>

                {/* Icon */}
                <Icon
                  size={17}
                  strokeWidth={isCurrent ? 2.5 : 2}
                  className={`shrink-0 ${isCurrent ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                />

                {/* Label */}
                <span className="flex-1 truncate">
                  {item.label}
                </span>

                {/* Optional Badge */}
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                      isCurrent
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container text-primary'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Nav Links */}
      <div className="space-y-2 pt-3 border-t border-outline-variant/30">
        <nav className="space-y-1">
          {bottomItems.map((item) => {
            const isCurrent = normalizedActiveTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onNavigate(item.id);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-headline font-bold text-[13px] tracking-tight transition-colors cursor-pointer select-none text-left ${
                  isCurrent
                    ? 'bg-primary/10 text-primary border-l-3 border-primary'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-surface-container/60'
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={isCurrent ? 2.5 : 2}
                  className={`shrink-0 ${isCurrent ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                />
                <span className="flex-1 truncate">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Dark to Light Mode Switch in Sidebar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container/60 hover:bg-surface-container transition-colors">
            <span className="text-xs font-headline font-bold text-slate-700 dark:text-slate-300">
              Theme Mode
            </span>
            <ThemeToggleSwitch variant="switch" />
          </div>
        </nav>

        {/* Cresco CN Engine Mascot Card */}
        <div className="p-3 rounded-2xl bg-surface-container border border-cyan-500/25 flex items-center gap-3 mt-2 shadow-xs group cursor-pointer hover:border-cyan-400/50 transition-all">
          <CrescoMascot 
            pose="coding-lab" 
            size="sm" 
            animation="float" 
            withGlow={true}
            className="shrink-0"
            alt="Cresco CN Network Mascot"
          />
          <div className="flex flex-col min-w-0">
            <div className="text-[11px] font-headline font-black text-cyan-700 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-packet-beacon shrink-0" />
              <span className="truncate">OCTO ENGINE</span>
            </div>
            <p className="text-[10px] text-on-surface-variant dark:text-slate-400 font-semibold leading-tight truncate">
              Node packet sync active
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
