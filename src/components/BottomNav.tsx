import React from 'react';
import { NavTab } from '../types';
import { soundFx } from '../utils/soundEffects';
import { Home, Compass, Target, Swords, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
  const items = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'learn-map' as NavTab, label: 'Learn', icon: Compass },
    { id: 'practice' as NavTab, label: 'Practice', icon: Target },
    { id: 'boss-challenge' as NavTab, label: 'Challenges', icon: Swords },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1F2937]/95 backdrop-blur-md border-t border-[#E5E0D8] dark:border-slate-800 px-3 py-2 select-none">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = activeTab === item.id || 
            (item.id === 'learn-map' && activeTab === 'courses') ||
            (item.id === 'boss-challenge' && (activeTab === 'challenges' || activeTab === 'daily-challenge'));
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                onNavigate(item.id);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#3157D5] dark:text-[#6D8CFF] font-black scale-105'
                  : 'text-[#64748B] dark:text-slate-400 font-semibold hover:text-[#172033]'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
