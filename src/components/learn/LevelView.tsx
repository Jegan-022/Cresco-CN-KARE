import React, { useState, useEffect } from 'react';
import { LevelDefinition } from '../../levels/types';
import { getLevelDefinition } from '../../levels/registry';
import { ConceptLearningPage } from './ConceptLearningPage';
import { InteractiveLearningPage } from './InteractiveLearningPage';
import { QuizLearningPage } from './QuizLearningPage';
import { SummaryLearningPage } from './SummaryLearningPage';
import { 
  Flame, 
  Trophy, 
  Search, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  ChevronRight,
  Layers,
  Zap,
  Award,
  HelpCircle,
  Home
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { useAuth } from '../../context/AuthContext';

export type LearnStage = 'concept' | 'interactive' | 'quiz' | 'summary';

interface LevelViewProps {
  levelIdentifier?: string | number; // 'level-1' | 1 | 'u3_m01'
  onNavigateHome: () => void;
  onNavigateLevel: (levelSlug: string) => void;
  onCompleteLesson?: (earnedXp: number) => void;
}

export const LevelView: React.FC<LevelViewProps> = ({
  levelIdentifier = 'level-1',
  onNavigateHome,
  onNavigateLevel,
  onCompleteLesson,
}) => {
  const { userProfile, currentUser } = useAuth();
  const [level, setLevel] = useState<LevelDefinition>(() => getLevelDefinition(levelIdentifier));
  const [currentStage, setCurrentStage] = useState<LearnStage>('concept');
  const [searchQuery, setSearchQuery] = useState('');

  // Update level definition when prop changes
  useEffect(() => {
    const nextLevel = getLevelDefinition(levelIdentifier);
    setLevel(nextLevel);
    setCurrentStage('concept');

    // Update browser URL to /learn/level-X for clean self-deployed link
    if (typeof window !== 'undefined') {
      const targetPath = `/learn/${nextLevel.slug}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ level: nextLevel.slug }, '', targetPath);
      }
    }
  }, [levelIdentifier]);

  // Real or fallback student metrics
  const streak = userProfile?.streakCount ?? 12;
  const xp = userProfile?.totalXP ?? userProfile?.xp ?? 850;

  // List of all lessons in this unit for the left sidebar
  const unitLessons = [
    { num: 1, title: 'Need and Issues', slug: 'level-1' },
    { num: 2, title: 'Datagram & Routing', slug: 'level-2' },
    { num: 3, title: 'Virtual Circuit Network', slug: 'level-3' },
    { num: 4, title: 'Routing Algorithms', slug: 'level-4' },
    { num: 5, title: 'Congestion Control', slug: 'level-5' },
    { num: 6, title: 'IPv4 & IPv6', slug: 'level-6' },
    { num: 7, title: 'Quality of Service', slug: 'level-7' },
    { num: 8, title: 'Unit 3 Quiz & Review', slug: 'level-8' },
  ];

  const handleStageChange = (stage: LearnStage) => {
    soundFx.playClick();
    setCurrentStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextLesson = () => {
    if (level.nextLevelSlug) {
      onNavigateLevel(level.nextLevelSlug);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. TOP HEADER (Matching Smart Learn Reference) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateHome();
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
            title="Return to Island Dashboard"
          >
            <div className="size-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Smart Learn"
                className="size-7 object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Smart Learn
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                KLU Portal
              </span>
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center gap-2 max-w-md w-full px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search topics, ask AI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 font-medium"
          />
        </div>

        {/* User Stats & Profile Controls */}
        <div className="flex items-center gap-3">
          {/* Streak Flame */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs border border-amber-500/20 shadow-2xs">
            <Flame size={15} className="fill-amber-500" />
            <span>{streak}</span>
          </div>

          {/* XP Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-black text-xs border border-amber-500/20 shadow-2xs">
            <Trophy size={14} className="text-amber-500" />
            <span>{xp}</span>
          </div>

          {/* User Avatar */}
          <button
            onClick={onNavigateHome}
            className="size-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm cursor-pointer"
            title="Profile"
          >
            {userProfile?.studentId ? userProfile.studentId.slice(-2).toUpperCase() : 'KL'}
          </button>
        </div>
      </header>

      {/* 2. BREADCRUMBS & TOP BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 overflow-x-auto no-scrollbar font-medium">
          <button
            onClick={onNavigateHome}
            className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer"
          >
            <Home size={13} />
            <span>Computer Networks</span>
          </button>
          <ChevronRight size={12} />
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{level.unitTitle}</span>
          <ChevronRight size={12} />
          <span className="text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
            {level.lessonNumber}. {level.title}
          </span>
        </div>

        {/* Exit back to map */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Exit to Map</span>
        </button>
      </div>

      {/* 3. MAIN WORKSPACE WITH SIDEBAR */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col md:flex-row">
        {/* Left Lesson Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 shrink-0 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {level.unitTitle}
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                {level.lessonNumber}/{level.totalLessonsInUnit} lessons
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${(level.lessonNumber / level.totalLessonsInUnit) * 100}%` }}
              />
            </div>
          </div>

          {/* Lessons List in this Unit */}
          <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {unitLessons.map((item) => {
              const isCurrent = level.slug === item.slug || level.id === item.num;
              return (
                <button
                  key={item.slug}
                  onClick={() => {
                    soundFx.playClick();
                    onNavigateLevel(item.slug);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className={`size-6 rounded-lg font-black text-[11px] flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.num}
                  </span>
                  <span className="flex-1 truncate">{item.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Center / Right Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-5xl">
          {/* 4 STAGE TABS BAR (Matching Image 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            {[
              { id: 'concept', label: '1. CONCEPT', fullLabel: '1. Concept Learning' },
              { id: 'interactive', label: '2. SIMULATION', fullLabel: '2. Interactive Sim' },
              { id: 'quiz', label: '3. QUIZ', fullLabel: '3. Practice Quiz' },
              { id: 'summary', label: '4. SUMMARY', fullLabel: '4. Lesson Summary' },
            ].map((stage) => {
              const isActive = currentStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id as LearnStage)}
                  className={`py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="hidden sm:inline">{stage.fullLabel}</span>
                  <span className="sm:hidden">{stage.label}</span>
                </button>
              );
            })}
          </div>

          {/* Stage 1: Concept Learning */}
          {currentStage === 'concept' && (
            <ConceptLearningPage
              level={level}
              onNext={() => handleStageChange('interactive')}
              onPrev={level.prevLevelSlug ? () => onNavigateLevel(level.prevLevelSlug!) : undefined}
            />
          )}

          {/* Stage 2: Interactive Simulation */}
          {currentStage === 'interactive' && (
            <InteractiveLearningPage
              level={level}
              onNext={() => handleStageChange('quiz')}
              onPrev={() => handleStageChange('concept')}
            />
          )}

          {/* Stage 3: Practice Quiz */}
          {currentStage === 'quiz' && (
            <QuizLearningPage
              level={level}
              onNext={() => handleStageChange('summary')}
              onPrev={() => handleStageChange('interactive')}
              onRecordScore={(score, total) => {
                if (onCompleteLesson) {
                  onCompleteLesson(level.xpReward);
                }
              }}
            />
          )}

          {/* Stage 4: Lesson Summary */}
          {currentStage === 'summary' && (
            <SummaryLearningPage
              level={level}
              onPrev={() => handleStageChange('quiz')}
              onNextLesson={level.nextLevelSlug ? handleNextLesson : undefined}
              onTakeUnitQuiz={() => {
                handleStageChange('quiz');
              }}
              onReturnToMap={onNavigateHome}
            />
          )}
        </main>
      </div>
    </div>
  );
};
