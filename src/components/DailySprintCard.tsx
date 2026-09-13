import React from 'react';
import { soundFx } from '../utils/audio';

interface DailySprintCardProps {
  onStartSprint: () => void;
  completed?: boolean;
}

export const DailySprintCard: React.FC<DailySprintCardProps> = ({
  onStartSprint,
  completed = false,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all transform-gpu relative overflow-hidden border border-[#dae2fd]/60">
      {/* Ambient yellow/cyan bloom for excitement */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#57dffe]/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#00687a]">
          <span className="material-symbols-outlined font-bold fill-1">bolt</span>
          <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
            DAILY SPRINT
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#434655] font-mono text-[11px] font-bold">
          EXP: 08H 14M
        </span>
      </div>

      <h3 className="text-[18px] font-bold text-[#131b2e] mt-2">
        Packet Header Blitz
      </h3>
      <p className="text-[12px] text-[#434655] mt-1">
        Analyze 5 raw frame hex dumps against RFC specifications before the countdown timer expires.
      </p>

      {/* Challenge Metric Badges */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-[#eaedff] p-2 rounded-xl flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#004ac6] text-base">quiz</span>
          <div>
            <div className="font-mono text-[11px] text-[#434655]">Questions</div>
            <div className="text-[14px] font-bold text-[#131b2e]">5 In 5 Mins</div>
          </div>
        </div>

        <div className="bg-[#eaedff] p-2 rounded-xl flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#00687a] text-base">military_tech</span>
          <div>
            <div className="font-mono text-[11px] text-[#434655]">Bounty</div>
            <div className="text-[14px] font-bold text-[#00687a]">+50 XP</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          onStartSprint();
        }}
        className="w-full mt-4 py-2 rounded-xl bg-[#004ac6] text-white text-[14px] font-bold shadow hover:bg-[#003ea8] transition-all transform-gpu flex items-center justify-center gap-1.5 active:scale-95"
      >
        <span>{completed ? 'Replay Challenge' : 'Start Now'}</span>
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
    </div>
  );
};
