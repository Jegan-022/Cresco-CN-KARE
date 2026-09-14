import React, { useState } from 'react';
import { NavTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCharacter } from '../../context/CharacterContext';
import { useTheme } from '../../context/ThemeContext';
import { CharacterAvatar } from '../character/CharacterAvatar';
import { ThemeToggleSwitch } from '../ThemeToggleSwitch';
import { soundFx } from '../../utils/soundEffects';
import { 
  Settings as SettingsIcon, 
  User, 
  Volume2, 
  Bell, 
  Globe, 
  Shield, 
  LogOut, 
  Check, 
  Laptop,
  Sparkles,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { 
    activeCharacter, 
    openCharacterHub, 
  } = useCharacter();

  // Voice & Audio Settings
  const [lessonVoice, setLessonVoice] = useState(true);
  const [characterVoice, setCharacterVoice] = useState(true);
  const [soundEffects, setSoundEffects] = useState(() => !soundFx.getIsMuted());

  // Notification Preferences
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);

  // Language
  const [language, setLanguage] = useState('en');

  const handleToggleSoundEffects = () => {
    soundFx.playClick();
    const isMuted = soundFx.toggleMute();
    setSoundEffects(!isMuted);
  };

  const displayName = userProfile?.displayName || userProfile?.name || 'Network Explorer';
  const email = currentUser?.email || 'student@klu.ac.in';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest">
            <SettingsIcon size={14} />
            <span>PORTAL CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
            Settings
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
            Manage your student account, voice accessibility, audio synthesizer, and interface appearance.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: ACCOUNT */}
        <section className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFECE6] dark:border-slate-800">
            <User size={18} className="text-[#3157D5] dark:text-[#6D8CFF]" />
            <h2 className="font-extrabold text-base text-[#172033] dark:text-[#F9FAFB]">Account Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#64748B] dark:text-slate-400 font-medium block">Student Name</span>
              <span className="font-black text-sm text-[#172033] dark:text-[#F9FAFB] mt-0.5 block">{displayName}</span>
            </div>

            <div>
              <span className="text-[#64748B] dark:text-slate-400 font-medium block">Institutional Email</span>
              <span className="font-mono text-sm font-bold text-[#172033] dark:text-[#F9FAFB] mt-0.5 block">{email}</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: VOICE SETTINGS */}
        <section className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFECE6] dark:border-slate-800">
            <Volume2 size={18} className="text-[#7957C7]" />
            <h2 className="font-extrabold text-base text-[#172033] dark:text-[#F9FAFB]">Voice & Audio Settings</h2>
          </div>

          <div className="space-y-3">
            {/* Lesson Voice */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
              <div>
                <span className="font-extrabold text-xs text-[#172033] dark:text-[#F9FAFB] block">🔊 Lesson Voice</span>
                <span className="text-[11px] text-[#64748B] dark:text-slate-400">Read core networking principles and packet explanations aloud</span>
              </div>
              <button
                onClick={() => setLessonVoice(!lessonVoice)}
                className={`w-12 h-7 rounded-full transition-colors cursor-pointer p-0.5 ${
                  lessonVoice ? 'bg-[#35A86B]' : 'bg-[#E5E0D8] dark:bg-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${lessonVoice ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Active Character Companion Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-[#111C33] dark:to-[#1A253C] border border-blue-200/80 dark:border-blue-500/30">
              <div className="flex items-center gap-3">
                <CharacterAvatar characterId={activeCharacter.id} size="sm" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#172033] dark:text-[#F9FAFB] block">
                      Active Companion: {activeCharacter.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-600 dark:text-cyan-400 font-bold">
                      {activeCharacter.badgeText}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 block mt-0.5">
                    Voice: {activeCharacter.voiceName} • {activeCharacter.networkLayer}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={openCharacterHub}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Change Companion
              </button>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
              <div>
                <span className="font-extrabold text-xs text-[#172033] dark:text-[#F9FAFB] block">Tactile Sound Effects</span>
                <span className="text-[11px] text-[#64748B] dark:text-slate-400">Synthesizer button taps, correct chimes, and packet transit whooshes</span>
              </div>
              <button
                onClick={handleToggleSoundEffects}
                className={`w-12 h-7 rounded-full transition-colors cursor-pointer p-0.5 ${
                  soundEffects ? 'bg-[#35A86B]' : 'bg-[#E5E0D8] dark:bg-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${soundEffects ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERFACE APPEARANCE & THEME */}
        <section className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFECE6] dark:border-slate-800">
            <Palette size={18} className="text-[#F59E0B]" />
            <h2 className="font-extrabold text-base text-[#172033] dark:text-[#F9FAFB]">Interface Appearance & Theme</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#172033] dark:text-[#F9FAFB]">Dark / Light Theme Switch</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3157D5]/10 text-[#3157D5] dark:bg-[#6D8CFF]/20 dark:text-[#6D8CFF] uppercase tracking-wider">
                    {theme === 'dark' ? 'Dark Active' : 'Light Active'}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-md">
                  Toggle between high-contrast Dark Mode for late-night study sessions and crisp Light Mode for lecture halls.
                </p>
              </div>

              {/* Theme toggle switch */}
              <div className="flex items-center gap-3 self-start sm:self-center">
                <ThemeToggleSwitch variant="switch" />
              </div>
            </div>

            {/* Quick selector cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setTheme('light');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                  theme === 'light'
                    ? 'border-[#3157D5] bg-[#3157D5]/5 ring-2 ring-[#3157D5]/20'
                    : 'border-[#E5E0D8] dark:border-slate-800 bg-white dark:bg-[#1F2937] hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Sun size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-[#172033] dark:text-[#F9FAFB] flex items-center gap-1.5">
                    Light Mode
                    {theme === 'light' && <Check size={14} className="text-[#3157D5]" />}
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">Warm beige & high clarity</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setTheme('dark');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                  theme === 'dark'
                    ? 'border-[#818CF8] bg-[#818CF8]/10 ring-2 ring-[#818CF8]/20'
                    : 'border-[#E5E0D8] dark:border-slate-800 bg-white dark:bg-[#1F2937] hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0">
                  <Moon size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-[#172033] dark:text-[#F9FAFB] flex items-center gap-1.5">
                    Dark Mode
                    {theme === 'dark' && <Check size={14} className="text-[#818CF8]" />}
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">OLED black & slate contrast</div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 4: NOTIFICATIONS & PRIVACY */}
        <section className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFECE6] dark:border-slate-800">
            <Bell size={18} className="text-[#35A86B]" />
            <h2 className="font-extrabold text-base text-[#172033] dark:text-[#F9FAFB]">Notifications & Privacy</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
              <span className="font-bold text-xs text-[#172033] dark:text-[#F9FAFB]">Daily Study Reminders</span>
              <button
                onClick={() => setDailyReminder(!dailyReminder)}
                className={`w-12 h-7 rounded-full transition-colors cursor-pointer p-0.5 ${
                  dailyReminder ? 'bg-[#35A86B]' : 'bg-[#E5E0D8] dark:bg-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${dailyReminder ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
              <span className="font-bold text-xs text-[#172033] dark:text-[#F9FAFB]">Streak Protection Alerts</span>
              <button
                onClick={() => setStreakAlerts(!streakAlerts)}
                className={`w-12 h-7 rounded-full transition-colors cursor-pointer p-0.5 ${
                  streakAlerts ? 'bg-[#35A86B]' : 'bg-[#E5E0D8] dark:bg-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${streakAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 5: LOGOUT */}
        <div className="pt-2 flex justify-between items-center">
          <span className="text-xs font-mono text-[#64748B]">Cresco CN v2.4 • Educational Edition</span>
          <button
            onClick={() => {
              soundFx.playClick();
              logout();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#D95C5C]/10 text-[#D95C5C] hover:bg-[#D95C5C]/20 border border-[#D95C5C]/30 text-xs font-black transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out of Portal</span>
          </button>
        </div>

      </div>

    </div>
  );
};
