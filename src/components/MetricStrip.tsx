import React from 'react';

interface MetricStripProps {
  totalXp: number;
  streakDays: number;
  progressPercent: number;
  completedNodes: number;
  totalNodes: number;
}

export const MetricStrip: React.FC<MetricStripProps> = ({
  totalXp,
  streakDays,
  progressPercent,
  completedNodes,
  totalNodes,
}) => {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Level Tier */}
      <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all transform-gpu flex flex-col justify-between group border border-[#dae2fd]/60">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#434655] uppercase tracking-wider">
            TIER RANK
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#eaedff] font-mono text-[11px] text-[#004ac6] font-bold">
            LVL 08
          </span>
        </div>
        <div className="my-2">
          <div className="text-[24px] font-bold text-[#131b2e] leading-tight">
            Packet Architect
          </div>
          <div className="font-mono text-[11px] text-[#434655] mt-0.5">
            Role: Routing Spec L3
          </div>
        </div>
        <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#004ac6] h-full rounded-full transition-all transform-gpu duration-700"
            style={{ width: '68%' }}
          ></div>
        </div>
      </div>

      {/* 2. Experience & Progression */}
      <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all transform-gpu flex flex-col justify-between border border-[#dae2fd]/60">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#434655] uppercase tracking-wider">
            EXPERIENCE POINTS
          </span>
          <span className="material-symbols-outlined text-[#00687a] text-lg fill-1">
            star
          </span>
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] font-bold text-[#131b2e]">
              {totalXp.toLocaleString()}
            </span>
            <span className="font-mono text-[11px] font-medium text-[#434655]">
              XP
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#434655] mt-0.5">
            40 / 200 to Level 9
          </div>
        </div>
        <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden flex">
          <div
            className="bg-[#00687a] h-full rounded-full transition-all transform-gpu duration-700"
            style={{ width: '20%' }}
          ></div>
        </div>
      </div>

      {/* 3. Flame Streak with Freeze Shield */}
      <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all transform-gpu flex flex-col justify-between border border-[#dae2fd]/60">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#434655] uppercase tracking-wider">
            ROUTING STREAK
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-mono text-[11px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">ac_unit</span> SHIELD ON
          </span>
        </div>
        <div className="my-2">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#ba1a1a] font-bold fill-1">
              local_fire_department
            </span>
            <span className="text-[24px] font-bold text-[#131b2e]">
              {streakDays} Days
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#434655] mt-0.5">
            Freeze Protection Active
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < streakDays ? 'bg-[#ba1a1a]' : 'bg-[#eaedff]'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* 4. Syllabus Completion */}
      <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all transform-gpu flex flex-col justify-between border border-[#dae2fd]/60">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#434655] uppercase tracking-wider">
            COURSE PROGRESS
          </span>
          <span className="font-mono text-[11px] text-[#004ac6] font-bold">
            {completedNodes} / {totalNodes} NODES
          </span>
        </div>
        <div className="my-2 flex items-center justify-between">
          <div>
            <div className="text-[24px] font-bold text-[#131b2e]">
              {progressPercent}%
            </div>
            <div className="font-mono text-[11px] text-[#434655] mt-0.5">
              Overall Completion
            </div>
          </div>
          {/* Radial Micro Progress Indicator */}
          <div className="relative w-11 h-11">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#eaedff]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              ></path>
              <path
                className="text-[#004ac6]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${progressPercent}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-[#004ac6]">
                flag
              </span>
            </div>
          </div>
        </div>
        <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#004ac6] h-full rounded-full transition-all transform-gpu duration-700"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
