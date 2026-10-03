import React, { useState, useRef, useEffect } from 'react';
import { NavTab } from '../types';
import { soundFx } from '../utils/soundEffects';
import { useAuth } from '../context/AuthContext';
import { useCharacter } from '../context/CharacterContext';
import { 
  Zap, 
  Bell,
  User,
  Settings, 
  LogOut,
  Search
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
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  userStats = { streak: 0, xp: 0, hearts: 5 },
  onOpenStreak,
  onOpenLevel,
  onSearch,
}) => {
  const { userProfile, currentUser, logout, resetStudentCourse } = useAuth();
  const { activeCharacter, openCharacterHub, isSpeaking, audioAmplitude } = useCharacter();

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
    <header className="sticky top-0 z-30 w-full bg-surface-container-lowest/90 dark:bg-[#111827]/90 backdrop-blur-xl border-b border-[#E5E0D8] dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-colors">
      <div className="max-w-[1440px] mx-auto h-16 pl-14 sm:pl-16 pr-4 sm:pr-6 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-hidden group"
          >
            {/* Network Octopus Mascot Brand Mark */}
            <div className="w-11 h-11 relative flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform shrink-0">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Cresco CN Mascot Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-2xl sm:text-[26px] font-black tracking-tight leading-none text-slate-900 dark:text-white flex items-center gap-1.5">
                CRESCO <span className="text-[#06B6D4] dark:text-[#22D3EE] font-black">CN</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-extrabold tracking-widest uppercase leading-none mt-1">
                COMPUTER NETWORKS
              </span>
            </div>
          </button>
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
          
          {/* Compact XP Chip */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onOpenLevel) onOpenLevel();
              else onNavigate('level');
            }}
            className="h-7 sm:h-7.5 px-2 sm:px-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/30 flex items-center gap-1 text-[11px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title={`Experience Points: ${xp.toLocaleString()} XP (Click for Level Progress)`}
            aria-label="View XP Level Progress"
          >
            <Zap size={12} className="text-amber-500 fill-amber-500 shrink-0" />
            <span className="font-mono font-bold leading-none">
              {xp.toLocaleString()} XP
            </span>
          </button>

          {/* Compact Streak Chip */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onOpenStreak) onOpenStreak();
              else onNavigate('streak');
            }}
            className="h-7 sm:h-7.5 px-2 sm:px-2.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30 dark:border-orange-400/30 flex items-center gap-1 text-[11px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title={`${streak}-Day Active Streak (Click for details)`}
            aria-label="View Active Streak"
          >
            <span className="text-xs leading-none shrink-0">🔥</span>
            <span className="font-mono font-bold leading-none">
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </span>
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
