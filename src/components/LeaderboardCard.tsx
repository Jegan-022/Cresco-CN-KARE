import React, { useState } from 'react';
import { LeaderboardUser } from '../types';
import { soundFx } from '../utils/audio';

interface LeaderboardCardProps {
  users: LeaderboardUser[];
  onViewFullBoard: () => void;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  users,
  onViewFullBoard,
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(4);

  const bellCurve = [
    { label: 'Bottom 10%', height: '30%', count: 4 },
    { label: '10-25%', height: '50%', count: 8 },
    { label: '25-50%', height: '75%', count: 15 },
    { label: '50-75%', height: '90%', count: 22 },
    { label: 'Top 18% (YOU)', height: '82%', isUser: true, count: 6 },
    { label: 'Top 10%', height: '60%', count: 5 },
    { label: 'Top 5%', height: '35%', count: 3 },
    { label: 'Top 1%', height: '20%', count: 1 },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all transform-gpu border border-[#dae2fd]/60">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-mono text-[11px] text-[#434655] uppercase font-semibold">
            CS-4200: SECTION B
          </span>
          <h3 className="text-[18px] font-bold text-[#131b2e]">
            Leaderboard Snapshot
          </h3>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            onViewFullBoard();
          }}
          className="font-mono text-[11px] text-[#004ac6] hover:underline font-bold flex items-center gap-1"
        >
          <span>View Full Board</span>
          <span className="material-symbols-outlined text-xs">open_in_new</span>
        </button>
      </div>

      {/* Peer Distribution Mini Chart */}
      <div className="bg-[#eaedff] p-3 rounded-xl mb-3">
        <div className="flex justify-between items-center text-[#434655] mb-1 font-mono text-[11px]">
          <span>Class Bell Curve</span>
          <span className="text-[#004ac6] font-bold">Top 18% Rank</span>
        </div>

        {/* Dynamic Mini Distribution Bars */}
        <div className="flex items-end gap-1.5 h-16 w-full pt-2">
          {bellCurve.map((bar, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredBar(idx)}
              className={`flex-1 rounded-t-sm transition-all transform-gpu duration-300 relative cursor-pointer ${
                bar.isUser ? 'bg-[#004ac6]' : 'bg-[#dae2fd] hover:bg-[#b4c5ff]'
              }`}
              style={{ height: bar.height }}
            >
              {(hoveredBar === idx || bar.isUser) && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#131b2e] text-white font-mono text-[10px] rounded whitespace-nowrap shadow-sm z-10 pointer-events-none">
                  {bar.isUser ? 'YOU #4' : `${bar.count} peers`}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User Standings Micro-List */}
      <div className="flex flex-col gap-1.5">
        {users.slice(0, 4).map((user) => {
          if (user.isCurrentUser) {
            return (
              <div
                key={user.rank}
                className="flex items-center justify-between p-2 rounded-xl bg-[#dbe1ff] text-[#00174b] shadow-sm border border-[#004ac6]/30"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-extrabold text-[#004ac6] w-6">
                    #0{user.rank}
                  </span>
                  <img
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-[#004ac6]"
                    src={user.avatar}
                  />
                  <span className="text-[12px] font-extrabold text-[#131b2e]">
                    {user.name}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-extrabold text-[#004ac6]">
                  {user.xp.toLocaleString()} XP
                </span>
              </div>
            );
          }

          return (
            <div
              key={user.rank}
              className="flex items-center justify-between p-2 rounded-xl bg-[#f2f3ff] text-[#131b2e] hover:bg-[#eaedff] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-[11px] font-extrabold w-6 ${
                    user.rank === 1
                      ? 'text-[#00687a]'
                      : 'text-[#434655]'
                  }`}
                >
                  #0{user.rank}
                </span>
                <img
                  className="w-7 h-7 rounded-full object-cover"
                  alt={user.name}
                  src={user.avatar}
                />
                <span className="text-[12px] font-semibold text-[#131b2e]">
                  {user.name}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#434655]">
                {user.xp.toLocaleString()} XP
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
