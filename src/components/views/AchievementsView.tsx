import React from 'react';
import { NavTab } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { Trophy, Sparkles, Check, Lock, ShieldCheck, Zap, Award } from 'lucide-react';

interface AchievementsViewProps {
  onNavigate?: (tab: NavTab) => void;
}

interface CollectibleBadge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  color: string;
  iconSvg: React.ReactNode;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ onNavigate }) => {
  const badges: CollectibleBadge[] = [
    {
      id: 'first-connection',
      title: 'FIRST CONNECTION',
      description: 'Complete your first lesson and initialize your network.',
      unlocked: true,
      progress: '1/1',
      tier: 'Bronze',
      color: '#3157D5',
      iconSvg: (
        <svg viewBox="0 0 48 48" className="w-12 h-12">
          <circle cx="24" cy="24" r="20" fill="#3157D5" opacity="0.15" />
          <circle cx="16" cy="24" r="5" fill="#3157D5" />
          <circle cx="32" cy="24" r="5" fill="#35A86B" />
          <line x1="16" y1="24" x2="32" y2="24" stroke="#3157D5" strokeWidth="3" strokeDasharray="3 3" />
        </svg>
      ),
    },
    {
      id: 'packet-master',
      title: 'PACKET MASTER',
      description: 'Answer 50 packet questions across daily sprints and drills.',
      unlocked: false,
      progress: '42 / 50',
      tier: 'Silver',
      color: '#5B7CFA',
      iconSvg: (
        <svg viewBox="0 0 48 48" className="w-12 h-12">
          <rect x="10" y="12" width="28" height="24" rx="6" fill="#5B7CFA" opacity="0.2" />
          <rect x="14" y="16" width="20" height="16" rx="4" fill="#5B7CFA" />
          <path d="M 19 24 L 23 28 L 29 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      ),
    },
    {
      id: 'routing-expert',
      title: 'ROUTING EXPERT',
      description: 'Master routing algorithms including Bellman-Ford and Dijkstra SPF.',
      unlocked: true,
      progress: 'Completed',
      tier: 'Gold',
      color: '#F0A63A',
      iconSvg: (
        <svg viewBox="0 0 48 48" className="w-12 h-12">
          <circle cx="24" cy="24" r="20" fill="#F0A63A" opacity="0.15" />
          <circle cx="24" cy="14" r="4" fill="#F0A63A" />
          <circle cx="14" cy="32" r="4" fill="#F0A63A" />
          <circle cx="34" cy="32" r="4" fill="#F0A63A" />
          <path d="M 24 14 L 14 32 M 24 14 L 34 32" stroke="#B45309" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      id: 'protocol-pro',
      title: 'PROTOCOL PRO',
      description: 'Master 10 networking protocols across Layer 3, 4, and 5.',
      unlocked: false,
      progress: '7 / 10',
      tier: 'Silver',
      color: '#7957C7',
      iconSvg: (
        <svg viewBox="0 0 48 48" className="w-12 h-12">
          <polygon points="24,6 40,16 40,32 24,42 8,32 8,16" fill="#7957C7" opacity="0.2" />
          <circle cx="24" cy="24" r="7" fill="#7957C7" />
          <circle cx="24" cy="24" r="2" fill="white" />
        </svg>
      ),
    },
    {
      id: 'security-guardian',
      title: 'SECURITY GUARDIAN',
      description: 'Complete Network Security, TLS handshake, and 802.1X drills.',
      unlocked: false,
      progress: 'Locked',
      tier: 'Diamond',
      color: '#35A86B',
      iconSvg: (
        <svg viewBox="0 0 48 48" className="w-12 h-12">
          <path d="M 24 8 C 32 12 36 14 36 24 C 36 34 24 40 24 40 C 24 40 12 34 12 24 C 12 14 16 12 24 8 Z" fill="#35A86B" opacity="0.2" />
          <path d="M 24 13 C 29 16 32 17 32 24 C 32 31 24 35 24 35 C 24 35 16 31 16 24 C 16 17 19 16 24 13 Z" fill="#35A86B" />
          <circle cx="24" cy="24" r="3" fill="white" />
        </svg>
      ),
    },
    {
      id: 'network-engineer',
      title: 'NETWORK ENGINEER',
      description: 'Complete all syllabus modules and boss challenges across Units III–V.',
      unlocked: false,
      progress: '14 / 31',
      tier: 'Diamond',
      color: '#3157D5',
      iconSvg: (
        <svg viewBox="0 0 48 48" className="w-12 h-12">
          <rect x="8" y="8" width="32" height="32" rx="10" fill="#3157D5" opacity="0.15" />
          <circle cx="24" cy="18" r="4" fill="#3157D5" />
          <circle cx="16" cy="32" r="4" fill="#5B7CFA" />
          <circle cx="32" cy="32" r="4" fill="#35A86B" />
          <line x1="24" y1="18" x2="16" y2="32" stroke="#3157D5" strokeWidth="2" />
          <line x1="24" y1="18" x2="32" y2="32" stroke="#3157D5" strokeWidth="2" />
          <line x1="16" y1="32" x2="32" y2="32" stroke="#3157D5" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0A63A]/15 text-[#F0A63A] flex items-center justify-center shrink-0">
            <Trophy size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-black text-[#F0A63A] uppercase tracking-widest">
              <span>CREDENTIAL VAULT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-0.5">
              Achievements
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400">
              Collectible credentials earned through genuine computer networking mastery.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 bg-[#F7F5F0] dark:bg-[#111827] rounded-2xl border border-[#E5E0D8] dark:border-slate-700 text-xs font-mono font-bold self-start sm:self-auto">
          <span>UNLOCKED: </span>
          <span className="text-[#3157D5] dark:text-[#6D8CFF] font-black">{unlockedCount}</span>
          <span className="text-[#64748B]"> / {badges.length}</span>
        </div>
      </div>

      {/* Collectible Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {badges.map((b) => (
          <div
            key={b.id}
            onClick={() => soundFx.playClick()}
            className={`rounded-3xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer ${
              b.unlocked
                ? 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800 shadow-sm hover:border-[#3157D5]'
                : 'bg-[#F7F5F0]/60 dark:bg-slate-900/40 border-[#E5E0D8] dark:border-slate-800/80 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                  {b.iconSvg}
                </div>

                <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full ${
                  b.unlocked
                    ? 'bg-[#35A86B]/15 text-[#35A86B]'
                    : 'bg-[#E5E0D8] dark:bg-slate-800 text-[#64748B]'
                }`}>
                  {b.tier}
                </span>
              </div>

              <h3 className="text-base font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
                {b.title}
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#D1D5DB] font-medium mt-1 leading-relaxed">
                "{b.description}"
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#EFECE6] dark:border-slate-800 flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#64748B] dark:text-slate-400">Progress:</span>
              <span className={b.unlocked ? 'text-[#35A86B]' : 'text-[#3157D5] dark:text-[#6D8CFF]'}>
                {b.progress}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
