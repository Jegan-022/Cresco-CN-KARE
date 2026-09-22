import React, { useMemo } from 'react';
import { Flame, Calendar, Sparkles } from 'lucide-react';

interface StreakHeatmapProps {
  activityDates?: string[]; // Array of 'YYYY-MM-DD'
  currentStreak?: number;
  className?: string;
  weeksToShow?: number;
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  activityDates = [],
  currentStreak = 0,
  className = '',
  weeksToShow = 14,
}) => {
  const activeSet = useMemo(() => new Set(activityDates), [activityDates]);

  // Generate calendar days for the past N weeks ending on today
  const { weeks, totalActiveDays, maxMonthLabels } = useMemo(() => {
    const today = new Date();
    // Normalize to midnight
    today.setHours(0, 0, 0, 0);

    const daysCount = weeksToShow * 7;
    // Find the end of this week (Saturday) or today
    const days: { dateStr: string; date: Date; isActive: boolean; isToday: boolean }[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = i === 0;
      const isActive = activeSet.has(dateStr) || (isToday && currentStreak > 0);
      days.push({ dateStr, date: d, isActive, isToday });
    }

    // Group into 7-day columns (weeks)
    const weekGroups: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekGroups.push(days.slice(i, i + 7));
    }

    // Month headers
    const monthLabels: { label: string; colIndex: number }[] = [];
    let lastMonth = '';
    weekGroups.forEach((wk, idx) => {
      const firstDay = wk[0]?.date;
      if (firstDay) {
        const m = firstDay.toLocaleString('default', { month: 'short' });
        if (m !== lastMonth) {
          monthLabels.push({ label: m, colIndex: idx });
          lastMonth = m;
        }
      }
    });

    const activeCount = days.filter((d) => d.isActive).length;

    return {
      weeks: weekGroups,
      totalActiveDays: activeCount,
      maxMonthLabels: monthLabels,
    };
  }, [activityDates, currentStreak, weeksToShow, activeSet]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs select-none ${className}`}>
      {/* Header with Title and Streak Status */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Study Streak Activity</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                {currentStreak} Day{currentStreak === 1 ? '' : 's'} Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {totalActiveDays} active learning day{totalActiveDays === 1 ? '' : 's'} in the last {weeksToShow} weeks
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400/50" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 shadow-xs" />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[340px] inline-block">
          {/* Month labels */}
          <div className="flex text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-1 pl-7">
            {maxMonthLabels.map((m, i) => (
              <span
                key={i}
                style={{ marginLeft: i === 0 ? `${m.colIndex * 14}px` : undefined }}
                className="mr-6 font-semibold"
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day of week labels */}
            <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-400 dark:text-slate-500 pr-1.5 justify-between py-0.5">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      title={`${day.dateStr}${day.isActive ? ' • Active Lesson Session' : ' • No Activity'}`}
                      className={`w-3 h-3 rounded-xs transition-all duration-150 relative group ${
                        day.isActive
                          ? day.isToday
                            ? 'bg-emerald-500 ring-2 ring-emerald-400/60 shadow-xs scale-105'
                            : 'bg-emerald-500 hover:bg-emerald-400 hover:scale-115'
                          : day.isToday
                          ? 'bg-slate-200 dark:bg-slate-800 ring-1.5 ring-amber-400/80'
                          : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
