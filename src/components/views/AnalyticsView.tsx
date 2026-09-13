import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COURSE_UNITS } from '../../data/courseContent';
import { supabase, isSupabaseConfigured, fromSupabaseStudentRow } from '../../lib/supabase';
import { 
  TrendingUp, 
  Target, 
  Flame, 
  Activity, 
  Zap, 
  Shield, 
  Sparkles,
  Users,
  Award,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface CohortMetrics {
  totalStudents: number;
  avgCohortXP: number;
  avgCohortAccuracy: number;
  avgCohortCompleted: number;
  userRank: number;
}

export const AnalyticsView: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  
  const displayName = userProfile?.displayName || userProfile?.name || currentUser?.email?.split('@')[0] || 'Student';
  const completedModules = userProfile?.completedModules || [];
  const streak = userProfile?.streak || 0;
  const xp = userProfile?.totalXP || userProfile?.xp || 0;
  const quizAccuracy = userProfile?.quizAverage ? Math.round(userProfile.quizAverage) : 0;
  const studentId = userProfile?.studentId || '';

  const [cohortMetrics, setCohortMetrics] = useState<CohortMetrics>({
    totalStudents: 0,
    avgCohortXP: 0,
    avgCohortAccuracy: 0,
    avgCohortCompleted: 0,
    userRank: 1,
  });
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Subscribe to Supabase 'students' table for cohort benchmarking
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLiveConnected(false);
      return;
    }

    const loadCohortData = async () => {
      try {
        const { data, error } = await supabase.from('students').select('*');
        if (!error && data && data.length > 0) {
          const studentsList = data.map((d: any) => fromSupabaseStudentRow(d));
          const total = studentsList.length;
          let sumXP = 0;
          let sumAccuracy = 0;
          let sumCompleted = 0;

          studentsList.forEach((s: any) => {
            sumXP += (s.totalXP ?? s.xp ?? 0);
            sumAccuracy += (s.quizAverage ?? s.quizAccuracy ?? 75);
            sumCompleted += (s.completedModules?.length ?? s.modulesCompleted ?? 0);
          });

          studentsList.sort((a: any, b: any) => (b.totalXP ?? b.xp ?? 0) - (a.totalXP ?? a.xp ?? 0));
          const currentUid = currentUser?.uid;
          const rankIndex = studentsList.findIndex(
            (s: any) => s.uid === currentUid || (studentId && s.studentId === studentId)
          );
          const computedRank = rankIndex !== -1 ? rankIndex + 1 : 1;

          setCohortMetrics({
            totalStudents: total,
            avgCohortXP: Math.round(sumXP / Math.max(1, total)),
            avgCohortAccuracy: Math.round(sumAccuracy / Math.max(1, total)),
            avgCohortCompleted: Math.round(sumCompleted / Math.max(1, total)),
            userRank: computedRank,
          });
          setIsLiveConnected(true);
        }
      } catch (e) {
        console.warn('AnalyticsView: Supabase query error:', e);
      }
    };

    loadCohortData();

    let channel: any = null;
    try {
      channel = supabase
        .channel('analytics_cohort_students')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
          loadCohortData();
        })
        .subscribe();
    } catch (e) {
      // Fallback
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [currentUser, studentId]);
  
  // Calculate completion by unit
  const unitStats = COURSE_UNITS.map(unit => {
    const total = unit.modules.length;
    const completed = unit.modules.filter(m => completedModules.includes(m.id)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { title: unit.title, percent, completed, total };
  });

  const xpDiff = xp - cohortMetrics.avgCohortXP;
  const accuracyDiff = quizAccuracy - cohortMetrics.avgCohortAccuracy;

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-500/30 shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Progress Analytics</h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                Live Metrics
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Personal performance & cohort benchmarks for <strong className="text-slate-900 dark:text-slate-100">{displayName}</strong>
            </p>
          </div>
        </div>

        {/* Real-time Firebase Sync Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 self-start sm:self-center">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-bold">
            {isLiveConnected ? 'REAL-TIME DB SYNCED' : 'FIRESTORE CONNECTED'}
          </span>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5"><Zap className="w-16 h-16 text-blue-600" /></div>
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Total XP</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{xp.toLocaleString()}</div>
          <div className="mt-2 flex items-center text-[11px] font-bold text-blue-600 dark:text-blue-400">
            <span>Level {Math.floor(xp / 500) + 1}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5"><Flame className="w-16 h-16 text-amber-500" /></div>
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Day Streak</span>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{streak}d</div>
          <div className="mt-2 flex items-center text-[11px] font-bold text-amber-600">
            <span>🔥 Active Learner</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5"><Target className="w-16 h-16 text-emerald-500" /></div>
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Completed</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{completedModules.length}/45</div>
          <div className="mt-2 flex items-center text-[11px] font-bold text-emerald-600">
            <span>{Math.round((completedModules.length / 45) * 100)}% Syllabus Done</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5"><Shield className="w-16 h-16 text-indigo-500" /></div>
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Quiz Accuracy</span>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{quizAccuracy}%</div>
          <div className="mt-2 flex items-center text-[11px] font-bold text-indigo-600">
            <span>Class Benchmark</span>
          </div>
        </div>
      </div>

      {/* Cohort Benchmarking (Live Class Comparison from Firestore) */}
      <div className="bg-white dark:bg-[#172033] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Live Cohort Benchmarking
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {cohortMetrics.totalStudents} Enrolled
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Ranked <strong className="text-blue-600 dark:text-blue-400 font-black">#{cohortMetrics.userRank}</strong> of {cohortMetrics.totalStudents} in Network Engineering
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">Cohort Avg XP</span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {cohortMetrics.avgCohortXP.toLocaleString()} XP
            </div>
            <div className={`mt-1.5 text-xs font-bold ${xpDiff >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {xpDiff >= 0 ? `+${xpDiff.toLocaleString()} XP above avg` : `${xpDiff.toLocaleString()} XP to avg`}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">Cohort Avg Modules</span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {cohortMetrics.avgCohortCompleted} Modules
            </div>
            <div className="mt-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              {completedModules.length >= cohortMetrics.avgCohortCompleted ? 'Pacing ahead of schedule' : 'Keep progressing!'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">Cohort Avg Accuracy</span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {cohortMetrics.avgCohortAccuracy}%
            </div>
            <div className={`mt-1.5 text-xs font-bold ${accuracyDiff >= 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
              {accuracyDiff >= 0 ? `+${accuracyDiff}% vs peer avg` : `${Math.abs(accuracyDiff)}% to peer avg`}
            </div>
          </div>
        </div>
      </div>

      {/* Unit Completion Bars */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Unit Mastery
        </h2>
        <div className="bg-white dark:bg-[#172033] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          {unitStats.map((stat, i) => (
            <div key={i}>
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">{stat.title}</span>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">{stat.percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${stat.percent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-mono">{stat.completed} of {stat.total} modules completed</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
