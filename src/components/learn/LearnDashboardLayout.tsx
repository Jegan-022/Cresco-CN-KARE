import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Flame, 
  Crown, 
  X, 
  Download, 
  BookOpen, 
  ChevronRight, 
  Sparkles,
  Layers,
  Cpu,
  HelpCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { CrescoMascot } from '../brand/CrescoMascot';
import { soundFx } from '../../utils/soundEffects';
import { ModularLesson } from '../../data/lessons/lessonModel';
import { UNIT_LESSON_LIST } from '../../data/lessons/lessonRegistry';

export type LearnPhaseKey = 'concept' | 'interactive' | 'quiz' | 'summary';

interface LearnDashboardLayoutProps {
  lesson: ModularLesson;
  currentPhase: LearnPhaseKey;
  onSelectPhase: (phase: LearnPhaseKey) => void;
  onClose: () => void;
  onSelectLesson?: (lessonId: string) => void;
  userStats: {
    streak: number;
    xp: number;
    userName?: string;
  };
  children: React.ReactNode;
}

export const LearnDashboardLayout: React.FC<LearnDashboardLayoutProps> = ({
  lesson,
  currentPhase,
  onSelectPhase,
  onClose,
  onSelectLesson,
  userStats,
  children
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  const unitLessons = UNIT_LESSON_LIST[lesson.unitId] || UNIT_LESSON_LIST['unit_3'] || [];

  const phases: { key: LearnPhaseKey; label: string; number: number }[] = [
    { key: 'concept', label: '1. CONCEPT LEARNING', number: 1 },
    { key: 'interactive', label: '2. INTERACTIVE SIMULATION', number: 2 },
    { key: 'quiz', label: '3. PRACTICE QUIZ', number: 3 },
    { key: 'summary', label: '4. LESSON SUMMARY', number: 4 }
  ];

  return (
    <div className="w-full h-screen bg-[#F4F7FB] dark:bg-[#0B132B] text-[#1E293B] dark:text-[#E2E8F0] flex flex-col overflow-hidden font-sans select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR                                                         */}
      {/* ========================================================================= */}
      <header className="h-[64px] bg-white dark:bg-[#111C44] border-b border-[#E2E8F0] dark:border-[#1E2C60] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-30">
        
        {/* Brand Logo & Mascot */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            title="Return to Map"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Exit Map</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 cursor-pointer" onClick={onClose}>
            <div className="relative size-8 shrink-0">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Smart Learn Mascot"
                className="size-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] tracking-tight bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent leading-none">
                Smart Learn
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
                Interactive Campus Edition
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="w-full relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, ask AI..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-[#F1F5F9] dark:bg-[#0B132B] border border-transparent focus:border-[#3B82F6] dark:focus:border-[#3B82F6] text-xs font-medium text-slate-800 dark:text-slate-200 outline-hidden transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* User Stats & Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
            <Flame size={14} className="fill-amber-500 text-amber-500 animate-pulse" />
            <span>{userStats.streak || 12}</span>
          </div>

          {/* XP Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-extrabold text-xs">
            <Crown size={14} className="fill-yellow-500 text-yellow-500" />
            <span>{(userStats.xp || 850).toLocaleString()}</span>
          </div>

          {/* User Profile Avatar */}
          <div className="size-8 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] p-[2px] cursor-pointer">
            <div className="size-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
              {userStats.userName ? userStats.userName.charAt(0).toUpperCase() : 'S'}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            title="Close Lesson"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY: LEFT SIDEBAR + MAIN LEARNING CANVAS                              */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar: Syllabus Lessons */}
        <aside className="w-[260px] bg-white dark:bg-[#111C44] border-r border-[#E2E8F0] dark:border-[#1E2C60] flex flex-col shrink-0 overflow-hidden shadow-2xs hidden lg:flex">
          
          {/* Unit Header in Sidebar */}
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E2C60] bg-slate-50/50 dark:bg-[#0B132B]/40">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>{lesson.unitName}</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
              Lesson {lesson.lessonNumber} of {unitLessons.length} lessons
            </p>
          </div>

          {/* Lesson List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {unitLessons.map((item, idx) => {
              const isCurrent = item.number === lesson.lessonNumber || item.id === lesson.id;
              return (
                <button
                  key={item.id || idx}
                  onClick={() => {
                    soundFx.playClick();
                    if (onSelectLesson) onSelectLesson(item.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`size-6 rounded-lg flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.number}
                  </div>
                  <span className="truncate flex-1">{item.title}</span>
                  {isCurrent && <ChevronRight size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Download Notes CTA */}
          <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E2C60] bg-slate-50/50 dark:bg-[#0B132B]/30">
            <button
              onClick={() => {
                soundFx.playCorrect();
                alert(`Downloaded full study notes for ${lesson.title}!`);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all shadow-2xs cursor-pointer"
            >
              <Download size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Download Notes</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-[#F4F7FB] dark:bg-[#0B132B]">
          
          {/* Breadcrumb Bar & Phase Switcher */}
          <div className="bg-white/80 dark:bg-[#111C44]/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E2C60] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
            
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-wrap">
              <span>Computer Networks</span>
              <span>›</span>
              <span className="text-slate-700 dark:text-slate-300">{lesson.unitName}</span>
              <span>›</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{lesson.lessonNumber}. {lesson.title}</span>
            </div>

            {/* Stage / Phase Tabs (matching the 4 pages from Image 1!) */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] dark:bg-[#0B132B] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C60]">
              {phases.map((p) => {
                const isActive = currentPhase === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => {
                      soundFx.playClick();
                      onSelectPhase(p.key);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* The Active Page Component Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col justify-start">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};
