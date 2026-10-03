import React, { useState, useEffect } from 'react';
import { NavTab } from '../types';
import { soundFx } from '../utils/soundEffects';
import { 
  LayoutDashboard, 
  Map, 
  Terminal, 
  Award, 
  BookOpen, 
  User, 
  Settings, 
  Sparkles,
  X,
  Cpu,
  Film
} from 'lucide-react';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';

export interface SidebarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onSearch?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  onSearch,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    try {
      soundFx.playClick();
    } catch {}
    if (isControlled && controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const handleClose = () => {
    try {
      soundFx.playClick();
    } catch {}
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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

  const secondaryItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    index: string;
  }[] = [
    { id: 'simulator', label: 'Packet Lab', icon: Cpu, index: '07' },
  ];

  const animatedLearningItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    badge?: string;
    index: string;
  }[] = [
    { id: 'animated-learning', label: 'Animated Learning', icon: Film, badge: 'New', index: '08' },
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
      activeTab === 'quiz-and-practice' ||
      activeTab === 'quiz' ||
      activeTab === 'exam' ||
      activeTab === 'challenges' ||
      activeTab === 'boss-challenge' ||
      activeTab === 'daily-challenge'
    ) {
      return 'practice';
    }
    if (activeTab === 'lab') return 'simulator';
    return activeTab;
  })();

  const handleItemClick = (id: NavTab) => {
    try {
      soundFx.playClick();
    } catch {}
    onNavigate(id);
    handleClose();
  };

  return (
    <>
      {/* 1. Fixed ☰ Hamburger Icon Button (Minimal Glassmorphic Floating Pill) */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? 'Close navigation sidebar (Esc)' : 'Open navigation sidebar (☰)'}
        aria-expanded={isOpen}
        aria-controls="floating-glass-sidebar"
        title={isOpen ? 'Close sidebar (Esc)' : 'Open sidebar (☰)'}
        className={`fixed top-3 left-3 sm:left-4 z-[55] w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center cursor-pointer select-none transition-all duration-300 active:scale-95 group backdrop-blur-xl ${
          isOpen
            ? 'bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-[0_8px_24px_rgba(16,185,129,0.25)]'
            : 'bg-white/80 dark:bg-[#0c1e17]/85 border border-white/80 dark:border-emerald-500/25 text-slate-700 dark:text-emerald-200/90 shadow-[0_4px_18px_rgba(6,36,25,0.08)] dark:shadow-[0_4px_22px_rgba(0,0,0,0.45)] hover:border-emerald-500/50 hover:bg-white/95 dark:hover:bg-[#11281f] hover:shadow-[0_8px_25px_rgba(16,185,129,0.2)]'
        }`}
      >
        {/* Animated 3-Bar / Cross Icon */}
        <div className="w-5 h-4 relative flex flex-col justify-between items-center pointer-events-none">
          <span 
            className={`w-full h-0.5 rounded-full transition-all duration-300 ease-out origin-center ${
              isOpen 
                ? 'rotate-45 translate-y-[7px] bg-emerald-600 dark:bg-emerald-400' 
                : 'bg-slate-700 dark:bg-emerald-300 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-300'
            }`} 
          />
          <span 
            className={`w-full h-0.5 rounded-full transition-all duration-200 ease-out ${
              isOpen 
                ? 'opacity-0 scale-x-0 bg-emerald-600 dark:bg-emerald-400' 
                : 'opacity-100 bg-slate-700 dark:bg-emerald-300 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-300'
            }`} 
          />
          <span 
            className={`w-full h-0.5 rounded-full transition-all duration-300 ease-out origin-center ${
              isOpen 
                ? '-rotate-45 -translate-y-[7px] bg-emerald-600 dark:bg-emerald-400' 
                : 'bg-slate-700 dark:bg-emerald-300 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-300'
            }`} 
          />
        </div>
      </button>

      {/* 2. Frosted Backdrop Overlay */}
      <div
        role="presentation"
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-slate-950/20 dark:bg-black/55 backdrop-blur-[3px] transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* 3. Minimal Glassmorphic Floating Sidebar Drawer */}
      <aside
        id="floating-glass-sidebar"
        aria-label="Navigation Sidebar"
        aria-hidden={!isOpen}
        className={`fixed top-3 bottom-3 left-3 sm:left-4 z-50 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-3xl flex flex-col overflow-hidden select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white/85 dark:bg-[#0a1813]/90 backdrop-blur-2xl border border-white/70 dark:border-emerald-500/20 ring-1 ring-emerald-500/10 dark:ring-white/5 shadow-[0_20px_60px_-15px_rgba(6,36,25,0.22),0_10px_25px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_65px_-10px_rgba(0,0,0,0.7)] ${
          isOpen 
            ? 'translate-x-0 opacity-100 pointer-events-auto scale-100' 
            : '-translate-x-[calc(100%+32px)] opacity-0 pointer-events-none scale-[0.98]'
        }`}
      >
        {/* Header Bar: Aligned with fixed toggle + Brand Mark + Close Button */}
        <div className="h-16 px-3.5 flex items-center justify-between border-b border-emerald-500/15 dark:border-white/5 shrink-0 bg-white/40 dark:bg-emerald-950/20">
          
          {/* Left area: Reserved space for the fixed toggle button + Brand mark */}
          <div className="flex items-center gap-2.5">
            {/* 40px spacer reserving slot for the fixed hamburger button */}
            <div className="w-10 h-10 shrink-0" aria-hidden="true" />

            {/* Mascot Brand Badge & Title */}
            <button
              type="button"
              onClick={() => handleItemClick('home')}
              className="flex items-center gap-2 text-left cursor-pointer group"
              title="Return to Dashboard"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                <img
                  src="/assets/mascot/cresco-mascot.png"
                  alt="Cresco CN"
                  className="w-full h-full object-contain drop-shadow-xs"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-black text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                  CRESCO <span className="text-emerald-500 dark:text-emerald-400">CN</span>
                </span>
                <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold tracking-widest uppercase mt-0.5 leading-none">
                  NETWORKS
                </span>
              </div>
            </button>
          </div>

          {/* Explicit ✕ Close Icon Button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-surface-container/70 dark:bg-white/5 hover:bg-surface-container-high dark:hover:bg-white/10 border border-outline-variant/30 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Close sidebar (✕)"
            aria-label="Close sidebar"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
          
          {/* Main Curriculum Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-headline font-bold text-outline dark:text-emerald-400/70 uppercase tracking-wider flex items-center justify-between">
              <span>CURRICULUM PORTAL</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isCurrent = normalizedActiveTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl font-headline font-bold text-[13px] tracking-tight transition-all duration-200 cursor-pointer select-none text-left relative ${
                      isCurrent
                        ? 'bg-gradient-to-r from-emerald-500/18 to-teal-500/10 text-emerald-950 dark:text-emerald-200 border-l-[3px] border-emerald-500 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-emerald-500/8 dark:hover:bg-white/5'
                    }`}
                  >
                    {/* Index number */}
                    <span className="font-mono text-[10px] opacity-60 w-4 shrink-0 text-slate-400 dark:text-emerald-400/60">
                      {item.index}
                    </span>

                    {/* Icon */}
                    <Icon
                      size={17}
                      strokeWidth={isCurrent ? 2.5 : 2}
                      className={`shrink-0 ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                    />

                    {/* Label */}
                    <span className="flex-1 truncate">
                      {item.label}
                    </span>

                    {/* Optional Badge */}
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 shadow-2xs ${
                          isCurrent
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
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

          {/* Secondary Labs Section */}
          <div className="space-y-1 pt-1">
            <div className="px-3 pb-1 text-[10px] font-headline font-bold text-outline dark:text-emerald-400/70 uppercase tracking-wider">
              INTERACTIVE LABS
            </div>

            <nav className="space-y-1">
              {secondaryItems.map((item) => {
                const isCurrent = normalizedActiveTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl font-headline font-bold text-[13px] tracking-tight transition-all duration-200 cursor-pointer select-none text-left relative ${
                      isCurrent
                        ? 'bg-gradient-to-r from-emerald-500/18 to-teal-500/10 text-emerald-950 dark:text-emerald-200 border-l-[3px] border-emerald-500 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-emerald-500/8 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-60 w-4 shrink-0 text-slate-400 dark:text-emerald-400/60">
                      {item.index}
                    </span>
                    <Icon
                      size={17}
                      strokeWidth={isCurrent ? 2.5 : 2}
                      className={`shrink-0 ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                    />
                    <span className="flex-1 truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Dedicated Animated Learning Section (Separate Section) */}
          <div className="space-y-1 pt-1">
            <div className="px-3 pb-1 text-[10px] font-headline font-bold text-outline dark:text-emerald-400/70 uppercase tracking-wider flex items-center justify-between">
              <span>ANIMATED LEARNING</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">NEW</span>
            </div>

            <nav className="space-y-1">
              {animatedLearningItems.map((item) => {
                const isCurrent = normalizedActiveTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl font-headline font-bold text-[13px] tracking-tight transition-all duration-200 cursor-pointer select-none text-left relative ${
                      isCurrent
                        ? 'bg-gradient-to-r from-emerald-500/18 to-teal-500/10 text-emerald-950 dark:text-emerald-200 border-l-[3px] border-emerald-500 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-emerald-500/8 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-60 w-4 shrink-0 text-slate-400 dark:text-emerald-400/60">
                      {item.index}
                    </span>
                    <Icon
                      size={17}
                      strokeWidth={isCurrent ? 2.5 : 2}
                      className={`shrink-0 ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                    />
                    <span className="flex-1 truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 shadow-2xs ${
                        isCurrent
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Bottom Panel: Settings + Theme Mode + Engine Status */}
        <div className="p-3 border-t border-emerald-500/15 dark:border-white/5 space-y-2 bg-white/40 dark:bg-emerald-950/20 shrink-0">
          
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const isCurrent = normalizedActiveTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl font-headline font-bold text-[13px] tracking-tight transition-all cursor-pointer select-none text-left ${
                    isCurrent
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-l-[3px] border-emerald-500'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-emerald-500/8 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={isCurrent ? 2.5 : 2}
                    className={`shrink-0 ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                  />
                  <span className="flex-1 truncate">
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Dark / Light Mode Switch in Floating Sidebar */}
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-surface-container/60 dark:bg-white/5 border border-outline-variant/20 hover:bg-surface-container transition-colors">
              <span className="text-xs font-headline font-bold text-slate-700 dark:text-slate-300">
                Theme Mode
              </span>
              <ThemeToggleSwitch variant="switch" />
            </div>
          </nav>

          {/* Engine Status Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/5 border border-emerald-500/25 text-center space-y-1 shadow-xs">
            <div className="text-xs font-headline font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-emerald-500 animate-spin-slow" />
              <span>CRESCO CN ENGINE</span>
            </div>
            <p className="text-[11px] text-on-surface-variant dark:text-slate-400 font-semibold leading-tight">
              Curriculum flight path synchronized.
            </p>
          </div>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;
