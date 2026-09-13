import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ALL_MODULES, 
  getModuleById, 
  getNextModule, 
  getPreviousModule, 
  FlattenedModule 
} from '../../data/courseContent';
import { NetworkVisualizer } from '../NetworkVisualizer';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Trophy, 
  Sparkles,
  Layers, 
  Check, 
  ChevronRight, 
  Lock, 
  Clock, 
  Activity, 
  Compass,
  RotateCcw
} from 'lucide-react';
import { PacketIcon } from '../brand/NetworkNodeIcons';
import { GooeyButton } from '../ui/GooeyButton';

interface LessonPlayerViewProps {
  moduleId: string;
  unitIndex?: number;
  onClose: () => void;
  onNavigateToModule?: (nextModuleId: string, unitIndex?: number) => void;
  onOpenUnitQuiz?: (unitId: string) => void;
}

const LESSON_STAGES = [
  { id: 0, title: 'Introduction', subtitle: 'Overview & Principles', icon: BookOpen },
  { id: 1, title: 'Core Concepts', subtitle: 'Technical Architecture', icon: Layers },
  { id: 2, title: 'Visual Model', subtitle: 'Interactive Simulation', icon: Sparkles },
  { id: 3, title: 'Practice Drills', subtitle: 'Hands-on Problems', icon: HelpCircle },
  { id: 4, title: 'Module Quiz', subtitle: 'Knowledge Check', icon: Trophy },
];

export const LessonPlayerView: React.FC<LessonPlayerViewProps> = ({
  moduleId,
  unitIndex = 0,
  onClose,
  onNavigateToModule,
  onOpenUnitQuiz,
}) => {
  const { userProfile, awardStepXP, recordModuleCompletion } = useAuth();

  // Resilient module lookup
  const currentModule: FlattenedModule = useMemo(() => {
    let mod = getModuleById(moduleId);
    if (!mod) {
      mod = ALL_MODULES.find(
        (m) =>
          m.id === moduleId ||
          m.id.replace('m0', 'm') === moduleId ||
          m.id === moduleId.replace('m', 'm0')
      );
    }
    return mod || ALL_MODULES[0];
  }, [moduleId]);

  const completedSteps = userProfile?.completedSteps || [];
  const completedModules = userProfile?.completedModules || [];
  const introRewarded = completedSteps.includes(`${currentModule.id}_intro`);
  const isModuleCompleted = completedModules.includes(currentModule.id);

  const nextModuleData = getNextModule(currentModule.id);
  const prevModuleData = getPreviousModule(currentModule.id);

  // Prerequisite check: First module of Unit 3 is always unlocked; otherwise previous module must be completed
  const isModuleUnlocked = 
    !prevModuleData || 
    completedModules.includes(prevModuleData.id) || 
    isModuleCompleted ||
    currentModule.id === 'u3_m1' || 
    currentModule.id === 'u3_m01';

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [maxStepReached, setMaxStepReached] = useState<number>(() => isModuleCompleted ? 4 : 0);
  const [revealedDrills, setRevealedDrills] = useState<Record<number, boolean>>({});
  
  // Quiz state
  const [quizSelections, setQuizSelections] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  // Automatically award intro reading XP (+10 XP) on step 0
  useEffect(() => {
    if (currentStep === 0 && !introRewarded && isModuleUnlocked) {
      awardStepXP(`${currentModule.id}_intro`, 10).catch(() => {});
    }
  }, [currentStep, currentModule.id, introRewarded, awardStepXP, isModuleUnlocked]);

  // Reset interactive states when module changes
  useEffect(() => {
    setCurrentStep(0);
    setMaxStepReached(isModuleCompleted ? 4 : 0);
    setRevealedDrills({});
    setQuizSelections({});
    setIsQuizSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentModule.id, isModuleCompleted]);

  const advanceToStep = (targetStep: number) => {
    setMaxStepReached((prev) => Math.max(prev, targetStep));
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (quizSelections[qIdx] !== undefined) return;
    setQuizSelections((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    const questions = currentModule.quiz || [];
    questions.forEach((q, idx) => {
      if (quizSelections[idx] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleFinishQuiz = async () => {
    setIsQuizSubmitted(true);
    await recordModuleCompletion(currentModule.id, currentModule.unitId, 50);
  };

  const quizQuestions = currentModule.quiz || [];
  const score = calculateScore();
  const allAnswered = quizQuestions.length > 0 && Object.keys(quizSelections).length === quizQuestions.length;

  // Render blocked prerequisite screen if previous module is not completed
  if (!isModuleUnlocked) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-[#172033] border-2 border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Lock size={32} />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            PREREQUISITE REQUIRED
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Module is Locked
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            You must complete the previous module <strong className="text-slate-900 dark:text-slate-200">{prevModuleData?.title || 'earlier lesson'}</strong> before accessing this topic and its quiz assessment.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <GooeyButton onClick={onClose} variant="cyan" size="sm">
            <span>Back to Syllabus</span>
          </GooeyButton>
          {prevModuleData && (
            <GooeyButton onClick={() => onNavigateToModule?.(prevModuleData.id, unitIndex)} variant="cyan" size="sm">
              <span>Go to {prevModuleData.title}</span>
              <ChevronRight size={14} />
            </GooeyButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer self-start"
        >
          <ArrowLeft size={16} />
          <span>Back to Syllabus</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {currentModule.unitTitle || 'Network Layer'}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock size={14} />
            <span>{currentModule.readTimeMinutes || 7} Min Read</span>
          </span>
          {isModuleCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Check size={12} className="stroke-[3]" /> Completed
            </span>
          )}
        </div>
      </div>

      {/* Mobile Horizontal Stage Stepper (Visible on screens < md) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
        {LESSON_STAGES.map((stg) => {
          const isActive = currentStep === stg.id;
          const isDone = currentStep > stg.id || (stg.id === 4 && isModuleCompleted);
          const isStageLocked = !isModuleCompleted && stg.id > maxStepReached;

          return (
            <button
              key={stg.id}
              onClick={() => {
                if (isStageLocked) return;
                setCurrentStep(stg.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={isStageLocked}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 border transition-all ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs cursor-pointer'
                  : isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 cursor-pointer'
                  : isStageLocked
                  ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-slate-800 cursor-not-allowed opacity-60'
                  : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-pointer'
              }`}
            >
              <span className="font-mono text-[11px] font-bold">
                {isDone ? '✓' : isStageLocked ? <Lock size={10} /> : stg.id + 1}
              </span>
              <span>{stg.title}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Three-Column Editorial Learning Workspace */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Lesson Stage Progression Timeline */}
        <aside className="lg:col-span-3 space-y-2 sticky top-20 hidden md:block">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
            Lesson Flow
          </div>

          {LESSON_STAGES.map((stg) => {
            const Icon = stg.icon;
            const isActive = currentStep === stg.id;
            const isDone = currentStep > stg.id || (stg.id === 4 && isModuleCompleted);
            const isStageLocked = !isModuleCompleted && stg.id > maxStepReached;

            return (
              <button
                key={stg.id}
                onClick={() => {
                  if (isStageLocked) return;
                  setCurrentStep(stg.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={isStageLocked}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 shadow-2xs font-bold cursor-pointer'
                    : isDone
                    ? 'bg-white dark:bg-[#172033] border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium cursor-pointer'
                    : isStageLocked
                    ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800/40 text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed'
                    : 'bg-white dark:bg-[#172033] border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium cursor-pointer'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : isStageLocked
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check size={14} className="stroke-[3]" /> : isStageLocked ? <Lock size={12} /> : stg.id + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate">{stg.title}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {isStageLocked && stg.id === 4 
                      ? 'Complete drills to unlock quiz' 
                      : isStageLocked 
                      ? 'Complete earlier stages' 
                      : stg.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* CENTER COLUMN: Main Learning Content */}
        <main className="lg:col-span-6 bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 min-w-0">
          
          {/* Module Title Header */}
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Stage {currentStep + 1} of {LESSON_STAGES.length}: {LESSON_STAGES[currentStep].title}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {currentModule.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentModule.pedagogy?.concept || currentModule.lesson?.hook || 'Examine the fundamental mechanisms that govern this network protocol.'}
            </p>
          </div>

          {/* STEP 0: INTRODUCTION (Hook, Real-World Analogy & Context) */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Pedagogical Hook Card */}
              {currentModule.pedagogy?.hook && (
                <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono flex items-center gap-2">
                    <Sparkles size={15} />
                    <span>The Big Question (Hook)</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-amber-950 dark:text-amber-200 leading-relaxed">
                    "{currentModule.pedagogy.hook}"
                  </p>
                </div>
              )}

              {/* Real-World Everyday Analogy Card */}
              {currentModule.pedagogy?.analogy && (
                <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 font-mono flex items-center gap-2">
                    <Compass size={15} />
                    <span>Everyday Mental Model</span>
                  </div>
                  <p className="text-sm text-blue-950 dark:text-blue-200 leading-relaxed">
                    {currentModule.pedagogy.analogy}
                  </p>
                </div>
              )}

              {/* Core Concept Scope */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Concept Overview
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentModule.pedagogy?.concept || 'In computer networking, protocol architectures enable heterogeneous devices to synchronize states and transmit data reliably across diverse channels.'}
                </p>
              </div>

              {/* Learning Scope Box */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" />
                  <span>Key Learning Objectives</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {(currentModule.learningObjectives || [
                    'Understand architectural purpose, boundaries, and RFC standards.',
                    'Analyze packet framing, bit-level headers, and control flags.',
                    'Apply analytical formulas to subnetting and protocol throughput.'
                  ]).map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex justify-end">
                <GooeyButton
                  onClick={() => advanceToStep(1)}
                  variant="cyan"
                >
                  <span>Proceed to Core Concepts</span>
                  <ChevronRight size={16} />
                </GooeyButton>
              </div>
            </div>
          )}

          {/* STEP 1: CORE CONCEPTS */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Architectural Theory & Protocol Design
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentModule.pedagogy?.architecture ||
                    currentModule.pedagogy?.concept ||
                    'Packets traverse network interfaces using structured headers. Each layer encapsulates the payload of the higher layer, appending addressing information, error checksums, and sequence identifiers.'}
                </p>
              </div>

              {/* Key Takeaways Cards */}
              {(currentModule.keyTakeaways || []).length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
                    <Layers size={14} className="text-emerald-500" />
                    <span>Essential Architectural Principles</span>
                  </div>
                  <ul className="space-y-2.5">
                    {currentModule.keyTakeaways?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Header Encapsulation Graphic */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Standard Layer Encapsulation Flow
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 text-center text-xs font-mono">
                  <div className="w-full sm:w-1/3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">
                    [L2 Data Link Header]
                  </div>
                  <div className="w-full sm:w-1/3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">
                    [L3 IP Network Header]
                  </div>
                  <div className="w-full sm:w-1/3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                    [L4 Transport & Payload]
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <GooeyButton
                  onClick={() => setCurrentStep(0)}
                  variant="cyan"
                >
                  <span>Previous</span>
                </GooeyButton>
                <GooeyButton
                  onClick={() => advanceToStep(2)}
                  variant="cyan"
                >
                  <span>Open Visual Simulation</span>
                  <ChevronRight size={16} />
                </GooeyButton>
              </div>
            </div>
          )}

          {/* STEP 2: VISUAL MODEL (Topic-Dedicated Interactive Simulation) */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Interactive Protocol Visualizer
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Interact with the dedicated simulator below to test state transitions, packet inspections, and operational behaviors in real-time without glitches.
                </p>
              </div>

              {/* Dedicated Simulator via NetworkVisualizer */}
              <NetworkVisualizer moduleId={currentModule.id} mode="activity" />

              <div className="flex items-center justify-between pt-4">
                <GooeyButton
                  onClick={() => setCurrentStep(1)}
                  variant="cyan"
                >
                  <span>Previous</span>
                </GooeyButton>
                <GooeyButton
                  onClick={() => advanceToStep(3)}
                  variant="cyan"
                >
                  <span>Solve Practice Drills</span>
                  <ChevronRight size={16} />
                </GooeyButton>
              </div>
            </div>
          )}

          {/* STEP 3: PRACTICE DRILLS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Practical Problem Drills
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Test your technical understanding of the protocol formulas and problems before entering the final module evaluation.
                </p>
              </div>

              {/* Drills List */}
              <div className="space-y-4">
                {(currentModule.practiceDrills || (currentModule.practice || []).map(p => ({
                  prompt: p.question || '',
                  solution: p.answer || ''
                }))).map((drill, idx) => {
                  const isRevealed = revealedDrills[idx] || false;

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          Problem #{idx + 1}
                        </span>
                        <button
                          onClick={() =>
                            setRevealedDrills((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        >
                          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span>{isRevealed ? 'Hide Solution' : 'Reveal Solution'}</span>
                        </button>
                      </div>

                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {drill.prompt}
                      </div>

                      {isRevealed && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-mono">
                          {drill.solution}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <GooeyButton
                  onClick={() => setCurrentStep(2)}
                  variant="cyan"
                >
                  <span>Previous</span>
                </GooeyButton>
                <GooeyButton
                  onClick={() => advanceToStep(4)}
                  variant="cyan"
                >
                  <span>Unlock &amp; Start Module Quiz</span>
                  <ChevronRight size={16} />
                </GooeyButton>
              </div>
            </div>
          )}

          {/* STEP 4: MODULE QUIZ (Product Spec Section 16, 17, 18) */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {!isQuizSubmitted ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {currentModule.unitTitle || 'Network Layer'}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Module Knowledge Check
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {Object.keys(quizSelections).length} of {quizQuestions.length} Answered
                    </span>
                  </div>

                  {/* Questions List with Distinctive A, B, C, D Option Buttons */}
                  <div className="space-y-8">
                    {quizQuestions.map((q, qIdx) => {
                      const selectedOpt = quizSelections[qIdx];
                      const isAnswered = selectedOpt !== undefined;

                      return (
                        <div key={qIdx} className="space-y-4">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-800">
                              Q{qIdx + 1}
                            </span>
                            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {q.question}
                            </div>
                          </div>

                          {/* Distinctive Option Buttons */}
                          <div className="grid gap-2.5 pl-9">
                            {q.options.map((opt, optIdx) => {
                              const letter = ['A', 'B', 'C', 'D'][optIdx];
                              const isSelected = selectedOpt === optIdx;
                              const isCorrect = optIdx === q.correctIndex;

                              let buttonStyle = 'bg-white dark:bg-[#172033] border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200';
                              
                              if (isAnswered) {
                                if (isSelected) {
                                  buttonStyle = isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold'
                                    : 'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-800 dark:text-red-200 font-bold';
                                } else if (isCorrect) {
                                  buttonStyle = 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 text-emerald-800 dark:text-emerald-200';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                  disabled={isAnswered}
                                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer disabled:cursor-default ${buttonStyle}`}
                                >
                                  {/* Large Letter Indicator */}
                                  <span
                                    className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                                      isSelected
                                        ? isCorrect
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : 'bg-red-600 text-white border-red-600'
                                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}
                                  >
                                    {letter}
                                  </span>

                                  <span className="text-xs sm:text-sm flex-1 leading-snug">
                                    {opt}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Instant Feedback Explanation */}
                          {isAnswered && (
                            <div className="ml-9 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                              <span className="font-bold text-slate-900 dark:text-slate-100">Explanation: </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <GooeyButton
                      onClick={handleFinishQuiz}
                      disabled={!allAnswered}
                      variant="cyan"
                    >
                      <span>Complete Module & Record Progress</span>
                    </GooeyButton>
                  </div>
                </div>
              ) : (
                /* POLISHED RESULTS VIEW (Section 18) */
                <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={32} />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Module Complete
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      Great work! {score} / {quizQuestions.length} Correct
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      You earned +50 XP and recorded verified progress toward your degree.
                    </p>
                  </div>

                  {/* Results Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{score}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">Correct</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{Math.round((score / (quizQuestions.length || 1)) * 100)}%</div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">Accuracy</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">+50 XP</div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">Reward</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <GooeyButton
                      onClick={() => {
                        setQuizSelections({});
                        setIsQuizSubmitted(false);
                      }}
                      variant="cyan"
                    >
                      <RotateCcw size={14} />
                      <span>Review Mistakes</span>
                    </GooeyButton>

                    {nextModuleData ? (
                      <GooeyButton
                        onClick={() => onNavigateToModule?.(nextModuleData.id, unitIndex)}
                        variant="cyan"
                      >
                        <span>Next Module: {nextModuleData.title}</span>
                        <ChevronRight size={14} />
                      </GooeyButton>
                    ) : (
                      <GooeyButton
                        onClick={onClose}
                        variant="cyan"
                      >
                        <span>Return to Syllabus</span>
                      </GooeyButton>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </main>

        {/* RIGHT COLUMN: Key Takeaways & Quick Navigation */}
        <aside className="lg:col-span-3 space-y-4 sticky top-20 hidden lg:block">
          
          {/* Key Takeaways Card */}
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Layers size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Key Takeaway</span>
            </div>
            {currentModule.keyTakeaways && currentModule.keyTakeaways.length > 0 ? (
              <ul className="space-y-2">
                {currentModule.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                Headers encapsulate lower layers while physical links govern bit transmission.
              </p>
            )}
          </div>

          {/* Quick Navigation / Next Up */}
          {nextModuleData && (
            <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Up Next in Syllabus
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                {nextModuleData.title}
              </div>
              <GooeyButton
                onClick={() => onNavigateToModule?.(nextModuleData.id, unitIndex)}
                variant="cyan"
                fullWidth
              >
                <span>Preview Next</span>
                <ChevronRight size={14} />
              </GooeyButton>
            </div>
          )}

        </aside>

      </div>

    </div>
  );
};
