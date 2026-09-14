import React, { useState, useRef, useEffect } from 'react';
import { NavTab } from '../types';
import { soundFx } from '../utils/soundEffects';
import { useAuth } from '../context/AuthContext';
import { useCharacter } from '../context/CharacterContext';
import { GuideMasterAvatar } from './guidemaster/GuideMasterAvatar';
import { GUIDE_MASTERS, getGuideMasterById, GuideMasterId } from '../data/guideMasterCharacters';
import { 
  Zap, 
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  Diamond,
  Compass,
  Target,
  Swords,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';

interface HeaderProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  userStats?: {
    streak: number;
    xp: number;
    hearts: number;
  };
  onOpenStreak?: () => void;
  onOpenLevel?: () => void;
  onSearch?: () => void;
  onTriggerPreloader?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  userStats = { streak: 0, xp: 0, hearts: 5 },
  onOpenStreak,
  onOpenLevel,
  onSearch,
  onTriggerPreloader,
}) => {
  const { userProfile, currentUser, logout, resetStudentCourse } = useAuth();
  const { activeCharacter, openCharacterHub, isSpeaking, audioAmplitude, hasElevenLabsKey } = useCharacter();

  const activeGuideMasterId = (() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('netquest_guidemaster_id');
      if (saved && GUIDE_MASTERS.some((m) => m.id === saved)) {
        return saved as GuideMasterId;
      }
    }
    return 'mira';
  })();
  const activeGuideMaster = getGuideMasterById(activeGuideMasterId);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = userProfile?.displayName || userProfile?.name || 'Explorer';
  const firstName = displayName.split(' ')[0] || 'Explorer';
  const xp = userProfile?.totalXP ?? userProfile?.xp ?? userStats.xp ?? 0;
  const streak = userProfile?.streak ?? userStats.streak ?? 0;
  const level = Math.max(1, Math.floor(xp / 300) + 1);

  const notifications = [
    { 
      id: '1', 
      title: streak > 0 ? 'Daily Streak Active' : 'Start Your Streak', 
      desc: streak > 0 ? `Your ${streak}-day network connection is verified.` : 'Complete a lesson today to ignite your streak.', 
      time: 'Just now' 
    },
    { 
      id: '2', 
      title: 'Curriculum Active', 
      desc: 'Unit II Framing & Bit-Stuffing simulation ready.', 
      time: '1h ago' 
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/90 dark:bg-[#111827]/90 backdrop-blur-xl border-b border-[#E5E0D8] dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-colors">
      <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo + Course Pill */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-hidden group"
          >
            {/* Stylized Network Hub 3D Logo with green conic/emerald theme */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-all shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
                <circle cx="12" cy="3" r="1.5" />
                <circle cx="12" cy="21" r="1.5" />
                <circle cx="3" cy="12" r="1.5" />
                <circle cx="21" cy="12" r="1.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-2xl sm:text-[26px] font-black tracking-tight leading-none text-slate-900 dark:text-white flex items-center gap-1.5">
                CRESCO <span className="text-emerald-500 dark:text-emerald-400 font-black">CN</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400/90 font-extrabold tracking-widest uppercase leading-none mt-1">
                COMPUTER NETWORKS
              </span>
            </div>
          </button>

          {/* Course selector pill */}
          <div className="hidden md:flex items-center gap-1.5 bg-surface-container dark:bg-slate-800/80 px-3 py-1 rounded-full text-on-surface-variant border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="font-body text-xs text-on-surface dark:text-slate-200 font-bold">
              Computer Networks
            </span>
            <ChevronDown size={14} className="text-outline" />
          </div>
        </div>

        {/* Center: Search Bar (⌘K) */}
        <div 
          onClick={() => {
            soundFx.playClick();
            if (onSearch) onSearch();
          }}
          className="hidden lg:flex flex-1 max-w-md mx-2 items-center gap-2 bg-surface-container-low dark:bg-slate-800/50 hover:bg-surface-container dark:hover:bg-slate-800 px-3.5 py-2 rounded-xl text-on-surface-variant border border-outline-variant/30 transition-all cursor-pointer shadow-xs"
        >
          <Search size={16} className="text-outline" />
          <span className="font-body text-xs flex-1 select-none text-outline truncate">
            Search protocols, RFCs, packet labs...
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-lowest dark:bg-slate-700 text-[10px] font-mono font-bold text-outline shadow-2xs border border-outline-variant/40">
            ⌘K
          </kbd>
        </div>

        {/* Right Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* XP Pill */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onOpenLevel) onOpenLevel();
              else onNavigate('level');
            }}
            className="flex items-center gap-1.5 bg-surface-container dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-[0_3px_0_0_#fed7aa] dark:shadow-none border border-outline-variant/30 hover:border-primary transition-all cursor-pointer"
            title="Experience Points"
          >
            <Zap size={15} className="text-tertiary-fixed-dim fill-tertiary-fixed-dim" />
            <span className="font-headline text-xs font-bold text-on-surface dark:text-[#F9FAFB]">
              {xp.toLocaleString()} XP
            </span>
          </button>

          {/* Streak Pill */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onOpenStreak) onOpenStreak();
              else onNavigate('streak');
            }}
            className="flex items-center gap-1.5 bg-surface-container dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-[0_3px_0_0_#fed7aa] dark:shadow-none border border-outline-variant/30 hover:border-tertiary transition-all cursor-pointer"
            title={`${streak}-Day Active Streak`}
          >
            <span className="text-sm leading-none">🔥</span>
            <span className="font-headline text-xs font-bold text-on-surface dark:text-[#F9FAFB]">
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </span>
          </button>

          {/* League Tier Pill */}
          <div className="hidden xl:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200/80 dark:border-amber-800/50 shadow-xs">
            <Diamond size={15} className="text-amber-500 fill-amber-500/20" />
            <span className="font-body text-xs text-amber-900 dark:text-amber-200 font-bold">
              Diamond Tier
            </span>
          </div>

          {/* Active GuideMaster AI Tutor Pill */}
          <button
            onClick={() => {
              soundFx.playClick();
              window.dispatchEvent(new CustomEvent('netquest_toggle_guidemaster'));
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container dark:bg-slate-800 border border-outline-variant/30 hover:border-primary transition-all cursor-pointer shadow-2xs group"
            title={`GuideMaster: ${activeGuideMaster.name} • Click to chat`}
          >
            <GuideMasterAvatar
              characterId={activeGuideMaster.id}
              size="xs"
            />
            <span className="text-xs font-bold text-on-surface dark:text-[#F9FAFB] hidden md:inline">
              {activeGuideMaster.name}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Notification Icon & Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => {
                soundFx.playClick();
                setShowNotifications((prev) => !prev);
              }}
              className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1F2937] border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50 animate-scaleUp">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-container dark:border-slate-800">
                  <span className="font-headline text-xs font-black text-on-surface dark:text-[#F9FAFB] uppercase tracking-wider">
                    NOTIFICATIONS
                  </span>
                  <span className="text-[10px] font-mono text-outline">2 UNREAD</span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-surface-container-low dark:bg-slate-800/60 border border-outline-variant/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-headline text-xs font-bold text-on-surface dark:text-[#F9FAFB]">{n.title}</span>
                        <span className="text-[10px] text-outline font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant dark:text-slate-400 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark to Light Mode Switch Button */}
          <div className="flex items-center px-1" title="Toggle Dark / Light Theme">
            <ThemeToggleSwitch variant="switch" />
          </div>

          {/* User Profile Avatar with Level Badge */}
          <div className="relative pl-1" ref={profileMenuRef}>
            <button
              onClick={() => {
                soundFx.playClick();
                setShowProfileMenu((prev) => !prev);
              }}
              className="flex items-center gap-2 cursor-pointer focus:outline-hidden"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface-container-lowest shadow-sm">
                  {firstName[0]}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-surface-tint ring-2 ring-surface-container-lowest" />
              </div>
              <span className="hidden md:inline-flex bg-primary-container text-white font-headline text-[11px] font-bold px-2 py-0.5 rounded-full shadow-[0_2px_0_0_#047857]">
                Lvl {level}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1F2937] border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50 animate-scaleUp">
                <div className="pb-3 border-b border-surface-container dark:border-slate-800">
                  <div className="font-headline font-black text-sm text-on-surface dark:text-[#F9FAFB] truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-outline font-mono truncate">
                    {userProfile?.studentId ? `#${userProfile.studentId}` : currentUser?.email}
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                    <span>Level {level} Packet Cadet</span>
                  </div>
                </div>

                <div className="py-2 space-y-1">
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-container-low dark:bg-slate-800/60 border border-outline-variant/20 mb-1">
                    <span className="text-xs font-bold text-on-surface dark:text-[#F9FAFB]">Theme Mode</span>
                    <ThemeToggleSwitch variant="switch" />
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowProfileMenu(false);
                      onNavigate('profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <User size={15} />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowProfileMenu(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <Settings size={15} />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-surface-container dark:border-slate-800">
                  {onTriggerPreloader && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setShowProfileMenu(false);
                        onTriggerPreloader();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                      title="Replay Post-Login Preloader Screen with compliments"
                    >
                      <Sparkles size={15} className="text-cyan-500" />
                      <span>Preview Preloader Screen</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-error hover:bg-error/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
