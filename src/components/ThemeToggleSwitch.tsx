import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface ThemeToggleSwitchProps {
  variant?: 'switch' | 'compact' | 'pill' | 'slider';
  className?: string;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({
  variant = 'switch',
  className = '',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      soundFx.playClick();
    } catch {}
    toggleTheme();
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all cursor-pointer relative group ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <Sun size={18} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon size={18} className="text-slate-600 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-headline font-bold text-xs transition-all cursor-pointer shadow-2xs select-none ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <>
            <Sun size={14} className="text-amber-400 animate-spin-slow" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon size={14} className="text-slate-700" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  // Default: iOS / tactile style pill slider switch
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={handleClick}
      className={`relative inline-flex h-8 w-15 items-center rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer select-none ${
        isDark 
          ? 'bg-slate-800 border border-slate-700 shadow-inner' 
          : 'bg-[#FED7AA]/60 border border-[#FDBA74] shadow-xs'
      } ${className}`}
      title={isDark ? 'Currently Dark — Click for Light Mode' : 'Currently Light — Click for Dark Mode'}
      aria-label="Toggle dark and light theme"
    >
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun size={13} className={`transition-opacity duration-200 ${isDark ? 'opacity-30 text-amber-500' : 'opacity-80 text-amber-600'}`} />
        <Moon size={13} className={`transition-opacity duration-200 ${isDark ? 'opacity-90 text-indigo-400' : 'opacity-30 text-slate-500'}`} />
      </div>

      {/* Sliding Knob */}
      <span
        className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
          isDark ? 'translate-x-7 bg-[#1F2937] text-indigo-300' : 'translate-x-0 bg-white text-amber-500'
        }`}
      >
        {isDark ? (
          <Moon size={13} className="fill-indigo-400/30 text-indigo-300" />
        ) : (
          <Sun size={13} className="fill-amber-400/30 text-amber-500" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggleSwitch;
