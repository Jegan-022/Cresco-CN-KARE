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
    { id: 'leaderboard', label: 'Leaderboard', icon: Award, index: '04' },
    { id: 'review', label: 'Notes', icon: BookOpen, index: '05' },
    { id: 'profile', label: 'Profile', icon: User, index: '06' },
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

        {/* Engine Status Card */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-emerald-500/25 text-center space-y-1 mt-2 shadow-xs">
          <div className="text-xs font-headline font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-emerald-500" />
            <span>CRESCO CN ENGINE</span>
          </div>
          <p className="text-[11px] text-on-surface-variant dark:text-slate-400 font-semibold leading-tight">
            Curriculum flight path synchronized.
          </p>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
