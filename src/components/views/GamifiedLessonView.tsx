import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ByteBot, BytePose } from '../character/ByteBot';
import { CrescoMascot } from '../brand/CrescoMascot';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { getLessonById, findLessonById } from '../lesson/lessonDatabase';
import { LessonDefinition, LessonPhase } from '../lesson/lessonTypes';
import { useAuth } from '../../context/AuthContext';
import { AdaptationCard } from '../common/AdaptationCard';
import { getBoundaryAdaptation } from '../../services/adaptationService';
import { AdaptationViewModel } from '../../types/adaptationViewModel';
import { recordLearningEvent } from '../../services/learningEventService';

// Interactive Lesson Diagrams
import { InteractiveHandshakeDiagram } from '../lesson/InteractiveHandshakeDiagram';
import { InteractiveTcpUdpComparison } from '../lesson/InteractiveTcpUdpComparison';
import { InteractiveDnsResolution } from '../lesson/InteractiveDnsResolution';
import { InteractiveDhcpDora } from '../lesson/InteractiveDhcpDora';
import { InteractiveCongestionSimulation } from '../lesson/InteractiveCongestionSimulation';
import { SaveThePacketChallenge } from '../lesson/SaveThePacketChallenge';

import { 
  ArrowLeft, 
  ArrowRight,
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Laptop, 
  Server, 
  RotateCcw,
  Check,
  Package,
  Layers,
  HelpCircle,
  Clock,
  Play,
  Pause,
  Award,
  Flame,
  ShieldCheck,
  Router,
  ChevronRight,
  ChevronLeft,
  Lock,
  Unlock,
  Zap,
  Activity,
  Globe,
  Sliders,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface GamifiedLessonViewProps {
  lessonId?: string;
  onClose: () => void;
  onCompleteLesson?: (xpEarned: number) => void;
  onNavigateNextLesson?: (nextLessonId: string) => void;
}

export const GamifiedLessonView: React.FC<GamifiedLessonViewProps> = ({
  lessonId = 'u4_m05',
  onClose,
  onCompleteLesson,
  onNavigateNextLesson,
}) => {
  const lessonData: LessonDefinition = getLessonById(lessonId);
  const isUnavailable = !lessonData || lessonData.isUnavailable || !lessonData.phases || lessonData.phases.length === 0;

  // Lesson Phase Index
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const totalPhases = lessonData?.phases?.length || 0;
  const currentPhase: LessonPhase | undefined = lessonData?.phases ? (lessonData.phases[phaseIndex] || lessonData.phases[0]) : undefined;

  const { userProfile, currentUser } = useAuth();
  const [adaptation, setAdaptation] = useState<AdaptationViewModel | null>(null);

  // Global Lesson Stats & Gamification
  const [hearts, setHearts] = useState<number>(5);
  const [userXp, setUserXp] = useState<number>(userProfile?.totalXP ?? userProfile?.xp ?? 0);
  const [showXpGainAnim, setShowXpGainAnim] = useState<number | null>(null);

  // Question States for Current Phase
  const [selectedMcqOption, setSelectedMcqOption] = useState<string | null>(null);
  const [mcqState, setMcqState] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [activeHint, setActiveHint] = useState<string | null>(null);

  // Fill-in-the-blank state
  const [fillInValue, setFillInValue] = useState<string>('');
  const [fillInState, setFillInState] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');

  // Ordering question state
  const [orderingList, setOrderingList] = useState<any[]>([]);
  const [orderingSolved, setOrderingSolved] = useState<boolean>(false);

  // Matching question state
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<string | null>(null);

  // Interactive Keyword Inspector
  const [inspectedKeyword, setInspectedKeyword] = useState<string | null>(null);

  // Timer & Tracking
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);

  // Accessible Motion & Animation Control
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(true);
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // 1x, 1.5x, 2x

  // Telemetry Guard Refs (Prevent duplicate events)
  const lessonStartedRecordedRef = useRef<boolean>(false);
  const phaseRecordedRef = useRef<Set<number>>(new Set());
  const completionRecordedRef = useRef<boolean>(false);

  // Reset all interactive states whenever advancing or changing lessons
  useEffect(() => {
    setPhaseIndex(0);
    setQuestionsAnswered(0);
    setCorrectAnswersCount(0);
    setSelectedMcqOption(null);
    setMcqState('unanswered');
    setActiveHint(null);
    setFillInValue('');
    setFillInState('unanswered');
    setOrderingSolved(false);
    setMatchedPairs({});
    setSelectedMatchLeft(null);
    setInspectedKeyword(null);
    setElapsedSeconds(0);
    setAnimationStep(0);
    setIsPlayingAnimation(!isReducedMotion);
    lessonStartedRecordedRef.current = false;
    phaseRecordedRef.current = new Set();
    completionRecordedRef.current = false;
  }, [lessonId]);

  // Sync user XP when profile updates
  useEffect(() => {
    if (userProfile) {
      setUserXp(userProfile.totalXP ?? userProfile.xp ?? 0);
    }
  }, [userProfile?.totalXP, userProfile?.xp]);

  // Telemetry: Record LESSON_STARTED on mount if lesson is available
  useEffect(() => {
    if (isUnavailable || !lessonData) return;
    if (!lessonStartedRecordedRef.current) {
      lessonStartedRecordedRef.current = true;
      recordLearningEvent({
        eventType: 'LESSON_STARTED',
        lessonId: lessonData.id,
        unitId: `unit-${lessonData.unitNumber}`,
        levelId: lessonData.lessonNumber,
        metadata: {
          topicTitle: lessonData.topicTitle,
          totalPhases: lessonData.phases.length,
          estimatedDuration: lessonData.estimatedDuration,
        }
      }).catch((err) => console.warn('[Telemetry] Non-fatal LESSON_STARTED error:', err));
    }
  }, [lessonData, isUnavailable]);

  // Telemetry: Record CONTENT_VIEWED or VISUAL_VIEWED on phase transition
  useEffect(() => {
    if (isUnavailable || !currentPhase || phaseIndex >= totalPhases) return;
    if (!phaseRecordedRef.current.has(phaseIndex)) {
      phaseRecordedRef.current.add(phaseIndex);
      const isVisual = currentPhase.type === 'visualize' || currentPhase.type === 'interact';
      recordLearningEvent({
        eventType: isVisual ? 'VISUAL_VIEWED' : 'CONTENT_VIEWED',
        lessonId: lessonData.id,
        unitId: `unit-${lessonData.unitNumber}`,
        activityId: currentPhase.id,
        metadata: {
          phaseIndex,
          phaseType: currentPhase.type,
          title: currentPhase.title,
          diagramType: currentPhase.diagramType,
        }
      }).catch((err) => console.warn('[Telemetry] Non-fatal phase view event error:', err));
    }
  }, [phaseIndex, currentPhase, isUnavailable, lessonData, totalPhases]);

  // Initialize Ordering items whenever phase changes
  useEffect(() => {
    if (currentPhase && currentPhase.type === 'ordering' && currentPhase.orderingItems) {
      const shuffled = [...currentPhase.orderingItems].sort(() => 0.5 - Math.random());
      setOrderingList(shuffled);
      setOrderingSolved(false);
    }
    setSelectedMcqOption(null);
    setMcqState('unanswered');
    setFillInValue('');
    setFillInState('unanswered');
    setActiveHint(null);
    setInspectedKeyword(null);
    setAnimationStep(0);
  }, [phaseIndex, currentPhase]);

  // Overall lesson elapsed timer
  useEffect(() => {
    if (isUnavailable) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isUnavailable]);

  // Animation Autoplay loop for packet flow visualizer
  useEffect(() => {
    if (isReducedMotion || !isPlayingAnimation) return;
    const intervalMs = 2400 / animationSpeed;
    const timer = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlayingAnimation, animationSpeed, isReducedMotion]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Progress percentage
  const isLessonComplete = phaseIndex >= totalPhases && totalPhases > 0;
  const progressPercent = totalPhases > 0 
    ? Math.round(((phaseIndex + 1) / totalPhases) * 100)
    : 0;

  // Determine if student can advance to the next phase
  const canAdvancePhase = useCallback((): boolean => {
    if (!currentPhase) return false;
    switch (currentPhase.type) {
      case 'intro':
      case 'explain':
      case 'visualize':
      case 'interact':
        return true;
      case 'question':
      case 'scenario':
      case 'topology':
        return mcqState === 'correct';
      case 'ordering':
        return orderingSolved;
      case 'fill-in':
        return fillInState === 'correct';
      case 'matching':
        return Object.keys(matchedPairs).length >= (currentPhase.matchingPairs?.length || 1);
      case 'packet-challenge':
        return true;
      default:
        return true;
    }
  }, [currentPhase, mcqState, orderingSolved, fillInState, matchedPairs]);

  // Handle MCQ Option Selection
  const handleSelectOption = (id: string) => {
    if (mcqState === 'correct') return;
    soundFx.playClick();
    setSelectedMcqOption(id);
    setMcqState('unanswered');
  };

  // Check MCQ Answer
  const handleCheckMcq = () => {
    if (!selectedMcqOption || !currentPhase?.mcqOptions) return;
    setQuestionsAnswered((prev) => prev + 1);

    const chosen = currentPhase.mcqOptions.find((o) => o.id === selectedMcqOption);
    const isCorrect = !!chosen?.isCorrect;

    // Telemetry: UNDERSTANDING_CHECK_COMPLETED
    recordLearningEvent({
      eventType: 'UNDERSTANDING_CHECK_COMPLETED',
      lessonId: lessonData.id,
      unitId: `unit-${lessonData.unitNumber}`,
      activityId: currentPhase.id,
      metadata: {
        correctness: isCorrect,
        questionId: currentPhase.id,
        selectedAnswer: selectedMcqOption,
        xpEarned: isCorrect ? (currentPhase.xpReward || 10) : 0,
      }
    }).catch((err) => console.warn('[Telemetry] Non-fatal question check error:', err));

    if (isCorrect) {
      soundFx.playCorrect();
      setMcqState('correct');
      setCorrectAnswersCount((prev) => prev + 1);
      const earned = currentPhase.xpReward || 10;
      setUserXp((prev) => prev + earned);
      setShowXpGainAnim(earned);
      setTimeout(() => setShowXpGainAnim(null), 1800);
    } else {
      soundFx.playIncorrect();
      setMcqState('incorrect');
      setHearts((prev) => Math.max(1, prev - 1));
      setActiveHint(currentPhase.hint || 'Carefully review the core protocol specifications and state invariants.');
    }
  };

  // Check Fill-in-the-blank
  const handleCheckFillIn = () => {
    if (!fillInValue.trim() || !currentPhase?.fillInCorrectAnswer) return;
    setQuestionsAnswered((prev) => prev + 1);

    const isMatch = fillInValue.trim().toLowerCase() === currentPhase.fillInCorrectAnswer.toLowerCase();
    
    // Telemetry
    recordLearningEvent({
      eventType: 'UNDERSTANDING_CHECK_COMPLETED',
      lessonId: lessonData.id,
      unitId: `unit-${lessonData.unitNumber}`,
      activityId: currentPhase.id,
      metadata: {
        correctness: isMatch,
        questionId: currentPhase.id,
        selectedAnswer: fillInValue.trim(),
        xpEarned: isMatch ? (currentPhase.xpReward || 10) : 0,
      }
    }).catch((err) => console.warn('[Telemetry] Non-fatal fill-in check error:', err));

    if (isMatch) {
      soundFx.playCorrect();
      setFillInState('correct');
      setCorrectAnswersCount((prev) => prev + 1);
      const earned = currentPhase.xpReward || 10;
      setUserXp((prev) => prev + earned);
      setShowXpGainAnim(earned);
      setTimeout(() => setShowXpGainAnim(null), 1800);
    } else {
      soundFx.playIncorrect();
      setFillInState('incorrect');
      setHearts((prev) => Math.max(1, prev - 1));
      setActiveHint(currentPhase.fillInHint || 'Review the connection establishment terminology.');
    }
  };

  // Swap Ordering Items
  const handleSwapOrder = (idx1: number, idx2: number) => {
    soundFx.playClick();
    const copy = [...orderingList];
    const temp = copy[idx1];
    copy[idx1] = copy[idx2];
    copy[idx2] = temp;
    setOrderingList(copy);

    const isCorrect = copy.every((item, index) => item.correctPosition === index);
    if (isCorrect) {
      soundFx.playCorrect();
      setOrderingSolved(true);
      setCorrectAnswersCount((prev) => prev + 1);
      const earned = currentPhase?.xpReward || 15;
      setUserXp((prev) => prev + earned);
      setShowXpGainAnim(earned);
      setTimeout(() => setShowXpGainAnim(null), 1800);

      recordLearningEvent({
        eventType: 'UNDERSTANDING_CHECK_COMPLETED',
        lessonId: lessonData.id,
        unitId: `unit-${lessonData.unitNumber}`,
        activityId: currentPhase?.id,
        metadata: {
          correctness: true,
          questionId: currentPhase?.id,
          xpEarned: earned,
        }
      }).catch((err) => console.warn('[Telemetry] Non-fatal ordering check error:', err));
    }
  };

  // Handle Matching Left Click
  const handleMatchLeft = (leftText: string) => {
    soundFx.playClick();
    setSelectedMatchLeft(leftText);
  };

  // Handle Matching Right Click
  const handleMatchRight = (rightText: string) => {
    if (!selectedMatchLeft || !currentPhase?.matchingPairs) return;
    soundFx.playClick();

    const expectedPair = currentPhase.matchingPairs.find((p) => p.left === selectedMatchLeft);
    if (expectedPair && expectedPair.right === rightText) {
      soundFx.playPacketPop();
      const updated = { ...matchedPairs, [selectedMatchLeft]: rightText };
      setMatchedPairs(updated);
      setSelectedMatchLeft(null);

      // Check if all matched
      if (Object.keys(updated).length >= currentPhase.matchingPairs.length) {
        soundFx.playCorrect();
        const earned = currentPhase.xpReward || 20;
        setUserXp((prev) => prev + earned);
        setShowXpGainAnim(earned);
        setTimeout(() => setShowXpGainAnim(null), 1800);

        recordLearningEvent({
          eventType: 'UNDERSTANDING_CHECK_COMPLETED',
          lessonId: lessonData.id,
          unitId: `unit-${lessonData.unitNumber}`,
          activityId: currentPhase.id,
          metadata: {
            correctness: true,
            questionId: currentPhase.id,
            xpEarned: earned,
          }
        }).catch((err) => console.warn('[Telemetry] Non-fatal matching check error:', err));
      }
    } else {
      soundFx.playIncorrect();
      setSelectedMatchLeft(null);
    }
  };

  // Previous Phase Navigation
  const handlePrevPhase = useCallback(() => {
    if (phaseIndex > 0) {
      soundFx.playClick();
      setPhaseIndex((prev) => prev - 1);
    }
  }, [phaseIndex]);

  // Advance to Next Phase / Complete Lesson
  const handleAdvancePhase = useCallback(() => {
    soundFx.playClick();
    if (phaseIndex < totalPhases - 1) {
      setPhaseIndex((prev) => prev + 1);
    } else {
      // Completed lesson!
      soundFx.playLevelUp();
      triggerSubtleSectionConfetti();
      setPhaseIndex(totalPhases); // completed state

      // Telemetry: Record LESSON_COMPLETED strictly once
      if (!completionRecordedRef.current) {
        completionRecordedRef.current = true;
        const accuracy = questionsAnswered > 0 
          ? Math.round((correctAnswersCount / questionsAnswered) * 100) 
          : 92;

        recordLearningEvent({
          eventType: 'LESSON_COMPLETED',
          lessonId: lessonData.id,
          unitId: `unit-${lessonData.unitNumber}`,
          levelId: lessonData.lessonNumber,
          metadata: {
            score: accuracy,
            durationMs: elapsedSeconds * 1000,
            xpEarned: 50,
            correctAnswersCount,
            questionsAnswered,
          }
        }).catch((err) => console.warn('[Telemetry] Non-fatal LESSON_COMPLETED error:', err));

        if (onCompleteLesson) {
          onCompleteLesson(50);
        }
      }

      if (currentUser?.uid) {
        getBoundaryAdaptation(currentUser.uid, {
          courseId: 'cs-4200',
          unitId: `unit-${lessonData.unitNumber}`,
          lessonId,
          targetScope: 'lesson',
        }).then((res) => {
          if (res) setAdaptation(res);
        }).catch((err) => {
          console.warn('[Adaptation] Non-fatal boundary adaptation error:', err);
        });
      }
    }
  }, [phaseIndex, totalPhases, lessonData, questionsAnswered, correctAnswersCount, elapsedSeconds, onCompleteLesson, currentUser, lessonId]);

  // Jump directly to a previously visited phase
  const handleJumpToPhase = (targetIdx: number) => {
    if (targetIdx <= phaseIndex || phaseRecordedRef.current.has(targetIdx)) {
      soundFx.playClick();
      setPhaseIndex(targetIdx);
    }
  };

  // Keyboard Shortcuts (ArrowLeft, ArrowRight, Enter, Escape, Space, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        if (phaseIndex > 0 && !isLessonComplete) {
          e.preventDefault();
          handlePrevPhase();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (canAdvancePhase() && !isLessonComplete) {
          e.preventDefault();
          handleAdvancePhase();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        soundFx.playClick();
        onClose();
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentPhase?.type === 'visualize') {
          e.preventDefault();
          setAnimationStep(0);
          soundFx.playClick();
        }
      } else if (e.key === ' ') {
        if (currentPhase?.type === 'visualize') {
          e.preventDefault();
          setIsPlayingAnimation((prev) => !prev);
          soundFx.playClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phaseIndex, isLessonComplete, canAdvancePhase, handleAdvancePhase, handlePrevPhase, onClose, currentPhase]);

  // Toggle Reduced Motion Setting
  const handleToggleReducedMotion = () => {
    soundFx.playClick();
    setIsReducedMotion((prev) => {
      const next = !prev;
      if (next) {
        setIsPlayingAnimation(false);
      }
      return next;
    });
  };

  // =========================================================================
  // EMPTY / UNAVAILABLE CONTENT STATE (Section 4)
  // =========================================================================
  if (isUnavailable) {
    return (
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Lesson Content Unavailable"
        className="fixed inset-0 z-50 bg-[#F7F5F0] dark:bg-[#111827] text-[#172033] dark:text-[#F9FAFB] flex flex-col justify-between overflow-y-auto select-none"
      >
        <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#E5E0D8] dark:border-slate-800 shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            aria-label="Return to Curriculum Map"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#64748B] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5] rounded-xl px-2 py-1"
          >
            <ArrowLeft size={17} />
            <span>Exit</span>
          </button>
          <span className="font-mono text-xs font-bold text-[#64748B] dark:text-slate-400">
            CURRICULUM INVENTORY
          </span>
        </header>

        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#F0A63A]/15 text-[#F0A63A] flex items-center justify-center mb-5 border-2 border-[#F0A63A]/30 shadow-xs">
            <AlertCircle size={32} />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F0A63A]/15 text-[#B45309] dark:text-[#F0A63A] border border-[#F0A63A]/30 uppercase mb-3">
            Module Unavailable
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
            Lesson Content Unavailable
          </h1>

          <p className="text-sm font-medium text-[#64748B] dark:text-[#D1D5DB] mt-3 leading-relaxed">
            The requested module identifier <code className="px-2 py-0.5 rounded-md bg-[#E5E0D8] dark:bg-slate-800 text-[#3157D5] dark:text-[#6D8CFF] font-mono font-bold">{lessonId}</code> is currently not available in the active curriculum inventory.
          </p>

          <div className="w-full mt-6 p-4 rounded-2xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 text-left text-xs text-[#64748B] dark:text-slate-400 space-y-2">
            <div className="font-bold text-[#172033] dark:text-white flex items-center gap-1.5">
              <Info size={14} className="text-[#3157D5]" />
              <span>Available Learning Modules:</span>
            </div>
            <p>
              Please navigate to the verified 30 curriculum modules across Unit 3 (Network Layer), Unit 4 (Transport Layer), or Unit 5 (Application Layer), or select any of the 21 interactive level routes.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-6 py-3.5 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5]"
            >
              <ArrowLeft size={14} />
              <span>RETURN TO LEARNING MAP</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // ACTIVE LESSON PLAYER (Sections 2, 3, 5, 6)
  // =========================================================================
  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={`${lessonData.topicTitle} Lesson Player`}
      className="fixed inset-0 z-50 bg-[#F7F5F0] dark:bg-[#111827] text-[#172033] dark:text-[#F9FAFB] flex flex-col justify-between overflow-y-auto select-none transition-colors duration-200"
    >
      
      {/* ========================================================================= */}
      {/* 1. TOP PROGRESS BAR & ACCESSIBILITY CONTROLS                              */}
      {/* ========================================================================= */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 border-b border-[#E5E0D8] dark:border-slate-800 shrink-0">
        
        {/* Left: ← Exit Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          aria-label="Exit Lesson and return to learning map"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#64748B] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5] rounded-xl px-2 py-1"
        >
          <ArrowLeft size={17} />
          <span>Exit</span>
        </button>

        {/* Center: Thin progress indicator with Unit & Lesson indicators and phase dots */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4 flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-[11px] sm:text-xs font-mono font-bold text-[#64748B] dark:text-slate-400 mb-1">
            <span className="text-[#3157D5] dark:text-[#6D8CFF] uppercase truncate">
              UNIT {lessonData.unitNumber} · {lessonData.unitName}
            </span>
            <span>Lesson {lessonData.lessonNumber} / {lessonData.totalLessonsInUnit}</span>
          </div>

          {/* Stepper Dots & Progress Bar */}
          <div 
            role="progressbar"
            aria-valuenow={isLessonComplete ? 100 : progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Lesson Completion Progress"
            className="w-full h-2 bg-[#EFECE6] dark:bg-slate-800 rounded-full overflow-hidden border border-[#E5E0D8] dark:border-slate-700 relative"
          >
            <div 
              className="h-full bg-[#35A86B] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${isLessonComplete ? 100 : progressPercent}%` }}
            />
          </div>

          {/* Interactive Phase Indicator Pills */}
          <div className="flex items-center justify-center gap-1.5 mt-1.5" aria-label="Lesson Sections">
            {lessonData.phases.map((p, idx) => {
              const isCurrent = idx === phaseIndex && !isLessonComplete;
              const isPast = idx < phaseIndex || isLessonComplete;
              return (
                <button
                  key={p.id}
                  onClick={() => handleJumpToPhase(idx)}
                  disabled={!isPast && !isCurrent}
                  aria-label={`Jump to phase ${idx + 1}: ${p.title}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3157D5] ${
                    isCurrent 
                      ? 'w-6 bg-[#3157D5] dark:bg-[#6D8CFF]' 
                      : isPast 
                      ? 'w-2 bg-[#35A86B] hover:opacity-80' 
                      : 'w-1.5 bg-[#E5E0D8] dark:bg-slate-700 cursor-not-allowed'
                  }`}
                  title={`Phase ${idx + 1}: ${p.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Motion Toggle, Hearts & Animated XP Counter */}
        <div className="flex items-center gap-2">
          {/* Reduced-Motion Toggle */}
          <button
            onClick={handleToggleReducedMotion}
            aria-label={isReducedMotion ? 'Enable smooth animations' : 'Enable reduced motion'}
            title={isReducedMotion ? 'Reduced motion active (Click for standard motion)' : 'Standard motion active (Click for reduced motion)'}
            className={`px-2 py-1.5 rounded-2xl border text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5] ${
              isReducedMotion
                ? 'bg-[#F0A63A]/15 border-[#F0A63A] text-[#B45309] dark:text-[#F0A63A]'
                : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-700 text-[#64748B] hover:text-[#172033] dark:hover:text-white'
            }`}
          >
            <Activity size={13} />
            <span className="hidden sm:inline">{isReducedMotion ? 'Motion Off' : 'Motion On'}</span>
          </button>

          {/* Hearts Pill */}
          <div 
            aria-label={`Student health: ${hearts} hearts`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-700 text-xs font-black text-[#D95C5C] shadow-2xs"
          >
            <Heart size={15} fill="#D95C5C" />
            <span>{hearts}</span>
          </div>

          {/* XP Pill with Animated Increment */}
          <div 
            aria-label={`Student total score: ${userXp} XP`}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-700 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] shadow-2xs"
          >
            <Sparkles size={14} className="text-[#F0A63A]" />
            <span>{userXp.toLocaleString()} XP</span>

            {showXpGainAnim && (
              <span className="absolute -bottom-6 right-2 text-xs font-black text-[#35A86B] animate-bounce">
                +{showXpGainAnim} XP
              </span>
            )}
          </div>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN LESSON FOCUS AREA (Maximum comfortable width, never stretched)    */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center">
        
        {/* ================= PHASE 1: LESSON INTRO (Section 4) ================= */}
        {!isLessonComplete && currentPhase?.type === 'intro' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-mono font-bold text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-wider">
                UNIT {lessonData.unitNumber} · {lessonData.topicTitle}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                {currentPhase.title}
              </h1>
              <p className="text-sm sm:text-base font-medium text-[#64748B] dark:text-[#D1D5DB] mt-1.5">
                "{lessonData.subtitle}"
              </p>
            </div>

            {/* Mascot Companion Introduction */}
            <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <ByteBot
                pose="explaining"
                size="lg"
                showSpeech={true}
                speechText={currentPhase.byteQuote}
              />
            </div>

            {/* Learning Objectives Checklist */}
            {lessonData.objectives && lessonData.objectives.length > 0 && (
              <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2.5">
                <div className="text-xs font-mono font-bold uppercase text-[#35A86B] tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Key Learning Objectives:</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm font-medium text-[#475569] dark:text-[#D1D5DB]">
                  {lessonData.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#35A86B] font-bold">✓</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Metadata Pill */}
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-[#64748B] dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock size={14} /> Duration: {lessonData.estimatedDuration}
              </span>
              <span>•</span>
              <span className="text-[#35A86B]">Interactive Hands-on Experience</span>
            </div>
          </div>
        )}

        {/* ================= PHASE 2: CONCEPT / EXPLANATION ================= */}
        {!isLessonComplete && currentPhase?.type === 'explain' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-mono font-bold text-[#7957C7] uppercase tracking-wider">
                {currentPhase.conceptHeading || 'CORE PRINCIPLE'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                {currentPhase.title}
              </h2>
            </div>

            {/* Concept Card with Interactive Clickable Keywords */}
            <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <p className="text-lg sm:text-xl font-medium text-[#172033] dark:text-[#F9FAFB] leading-relaxed">
                {currentPhase.conceptBody}
              </p>

              {/* Highlight Keywords */}
              {currentPhase.highlightWords && currentPhase.highlightWords.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {currentPhase.highlightWords.map((hw) => (
                    <button
                      key={hw.word}
                      onClick={() => {
                        soundFx.playPacketPop();
                        setInspectedKeyword(hw.word);
                      }}
                      aria-label={`Inspect keyword: ${hw.word}`}
                      className={`px-3 py-1 rounded-xl text-xs font-black font-mono transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5] ${
                        inspectedKeyword === hw.word
                          ? 'bg-[#3157D5] text-white shadow-xs'
                          : 'bg-[#3157D5]/15 text-[#3157D5] dark:text-[#6D8CFF] hover:bg-[#3157D5]/25'
                      }`}
                    >
                      {hw.word}
                    </button>
                  ))}
                </div>
              )}

              {/* Inspected Keyword Popup */}
              {inspectedKeyword && currentPhase.highlightWords && (
                <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 text-xs sm:text-sm animate-fadeIn">
                  <div className="font-bold text-[#3157D5] dark:text-[#6D8CFF] mb-1">
                    {inspectedKeyword}:
                  </div>
                  <p className="text-[#475569] dark:text-[#D1D5DB] font-medium leading-relaxed">
                    {currentPhase.highlightWords.find((h) => h.word === inspectedKeyword)?.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Byte Companion Reaction */}
            <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <ByteBot
                pose="thinking"
                size="md"
                showSpeech={true}
                speechText={currentPhase.byteQuote}
              />
            </div>
          </div>
        )}

        {/* ================= PHASE 3: EDUCATIONAL VISUALIZATION & SIMULATION ================= */}
        {!isLessonComplete && (currentPhase?.type === 'visualize' || currentPhase?.type === 'interact') && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-mono font-bold text-[#35A86B] uppercase tracking-wider">
                {currentPhase.type === 'interact' ? 'HANDS-ON PROTOCOL LAB' : 'EDUCATIONAL ANIMATION'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                {currentPhase.title}
              </h2>
              {currentPhase.subtitle && (
                <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-1">
                  {currentPhase.subtitle}
                </p>
              )}
            </div>

            {/* Specialized Interactive Diagrams */}
            {currentPhase.diagramType === 'tcp-handshake' && (
              <InteractiveHandshakeDiagram />
            )}

            {currentPhase.diagramType === 'tcp-vs-udp' && (
              <InteractiveTcpUdpComparison />
            )}

            {currentPhase.diagramType === 'dns-pipeline' && (
              <InteractiveDnsResolution />
            )}

            {currentPhase.diagramType === 'dhcp-dora' && (
              <InteractiveDhcpDora />
            )}

            {currentPhase.diagramType === 'congestion' && (
              <InteractiveCongestionSimulation />
            )}

            {/* Reusable Vector Packet Flow Simulation with Play/Pause & Step Controls */}
            {(!currentPhase.diagramType || currentPhase.diagramType === 'packet-flow' || currentPhase.diagramType === 'routing-topology') && (
              <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* Visual Simulation Canvas */}
                <div className="relative py-8 px-4 bg-[#F7F5F0] dark:bg-[#111827] rounded-2xl border border-[#E5E0D8] dark:border-slate-800 overflow-hidden">
                  
                  {/* Transmission Wire */}
                  <div className="absolute top-1/2 left-20 right-20 h-1 bg-[#E5E0D8] dark:bg-slate-700 -translate-y-1/2 z-0">
                    <div 
                      className={`h-full bg-[#35A86B] transition-all ${isReducedMotion ? 'w-full' : 'duration-500 ease-out'}`}
                      style={{ width: isReducedMotion ? '100%' : `${(animationStep / 3) * 100}%` }}
                    />
                  </div>

                  {/* Dynamic Traveling Packet */}
                  {!isReducedMotion && (
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-500 ease-out"
                      style={{ left: `${Math.max(14, Math.min(80, (animationStep / 3) * 66 + 14))}%` }}
                    >
                      <div className="px-3 py-1 rounded-xl bg-[#3157D5] text-white font-mono text-xs font-black shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                        <Zap size={12} />
                        <span>IP Packet (TTL={64 - animationStep}, Seq={100 + animationStep * 50})</span>
                      </div>
                    </div>
                  )}

                  {/* Nodes Row */}
                  <div className="relative z-10 flex items-center justify-between">
                    {/* Client */}
                    <div className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        animationStep === 0 || isReducedMotion ? 'bg-[#3157D5] text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-[#64748B] border border-[#E5E0D8] dark:border-slate-700'
                      }`}>
                        <Laptop size={26} />
                      </div>
                      <span className="text-xs font-black mt-2 font-mono">CLIENT</span>
                      <span className="text-[10px] font-mono text-[#64748B]">192.168.1.10</span>
                    </div>

                    {/* Intermediate Router */}
                    <div className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        animationStep === 1 || animationStep === 2 || isReducedMotion ? 'bg-[#7957C7] text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-[#64748B] border border-[#E5E0D8] dark:border-slate-700'
                      }`}>
                        <Router size={26} />
                      </div>
                      <span className="text-xs font-black mt-2 font-mono">ROUTER HOP</span>
                      <span className="text-[10px] font-mono text-[#64748B]">10.0.0.1</span>
                    </div>

                    {/* Server */}
                    <div className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        animationStep === 3 || isReducedMotion ? 'bg-[#35A86B] text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-[#64748B] border border-[#E5E0D8] dark:border-slate-700'
                      }`}>
                        <Server size={26} />
                      </div>
                      <span className="text-xs font-black mt-2 font-mono">SERVER</span>
                      <span className="text-[10px] font-mono text-[#64748B]">142.250.190.46</span>
                    </div>
                  </div>
                </div>

                {/* Reduced-Motion Static Educational Summary */}
                {isReducedMotion && (
                  <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 text-xs text-[#475569] dark:text-[#D1D5DB] space-y-1.5">
                    <div className="font-bold text-[#172033] dark:text-white flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#35A86B]" />
                      <span>Static Transmission Path (Reduced Motion Active):</span>
                    </div>
                    <p>
                      Packets are formatted with an IP header at the Client, verified and forwarded hop-by-hop through the Router routing table, and delivered reliably to the Server endpoint.
                    </p>
                  </div>
                )}

                {/* Interactive Controls Bar: Play/Pause, Step, Speed, Replay */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E0D8] dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setIsPlayingAnimation((prev) => !prev);
                      }}
                      aria-label={isPlayingAnimation ? 'Pause packet animation' : 'Play packet animation'}
                      className="px-3 py-1.5 rounded-xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5]"
                    >
                      {isPlayingAnimation ? <Pause size={13} /> : <Play size={13} />}
                      <span>{isPlayingAnimation ? 'Pause' : 'Play'}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setIsPlayingAnimation(false);
                        setAnimationStep((prev) => (prev > 0 ? prev - 1 : 3));
                      }}
                      aria-label="Step Backward"
                      className="px-2.5 py-1.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-800 hover:bg-[#EFECE6] text-[#172033] dark:text-white font-mono text-xs font-bold border border-[#E5E0D8] dark:border-slate-700 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setIsPlayingAnimation(false);
                        setAnimationStep((prev) => (prev + 1) % 4);
                      }}
                      aria-label="Step Forward"
                      className="px-2.5 py-1.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-800 hover:bg-[#EFECE6] text-[#172033] dark:text-white font-mono text-xs font-bold border border-[#E5E0D8] dark:border-slate-700 cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setAnimationStep(0);
                      }}
                      aria-label="Replay animation from start"
                      className="p-1.5 rounded-xl text-[#64748B] hover:text-[#172033] dark:hover:text-white hover:bg-[#F7F5F0] dark:hover:bg-slate-800 cursor-pointer"
                      title="Replay from start"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#64748B]">Speed:</span>
                    {[1, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          soundFx.playClick();
                          setAnimationSpeed(spd);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          animationSpeed === spd
                            ? 'bg-[#3157D5] text-white'
                            : 'bg-[#F7F5F0] dark:bg-slate-800 text-[#64748B] hover:text-[#172033]'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Byte Bot Companion Explanation */}
            <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <ByteBot
                pose="explaining"
                size="md"
                showSpeech={true}
                speechText={currentPhase.byteQuote}
              />
            </div>
          </div>
        )}

        {/* ================= PHASE 4: TACTILE MCQ QUESTIONS ================= */}
        {!isLessonComplete && (currentPhase?.type === 'question' || currentPhase?.type === 'scenario' || currentPhase?.type === 'topology') && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-mono font-bold text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-wider">
                {currentPhase.subtitle || 'CHECK YOUR UNDERSTANDING'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                {currentPhase.questionText}
              </h2>
            </div>

            {/* Answer Options Grid: Tactile A, B, C, D buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentPhase.mcqOptions?.map((opt) => {
                const isSelected = selectedMcqOption === opt.id;
                const isSuccess = mcqState === 'correct' && opt.isCorrect;
                const isFailed = mcqState === 'incorrect' && isSelected;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    aria-label={`Option ${opt.id}: ${opt.text}`}
                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5] ${
                      isSuccess
                        ? 'bg-[#35A86B]/15 border-[#35A86B] text-[#172033] dark:text-[#F9FAFB] shadow-[0_4px_0_0_#35A86B]'
                        : isFailed
                        ? 'bg-[#F0A63A]/15 border-[#F0A63A] text-[#172033] dark:text-[#F9FAFB]'
                        : isSelected
                        ? 'bg-white dark:bg-[#1F2937] border-[#3157D5] shadow-[0_4px_0_0_#3157D5]'
                        : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800 hover:border-slate-400 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-sm ${
                        isSelected ? 'bg-[#3157D5] text-white' : 'bg-[#F7F5F0] dark:bg-slate-800 text-[#172033] dark:text-white'
                      }`}>
                        {opt.id}
                      </span>
                      <div>
                        <div className="font-extrabold text-base">{opt.text}</div>
                        {opt.sublabel && (
                          <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium">{opt.sublabel}</div>
                        )}
                      </div>
                    </div>

                    {isSuccess && <CheckCircle2 size={22} className="text-[#35A86B]" />}
                    {isFailed && <AlertCircle size={22} className="text-[#F0A63A]" />}
                  </button>
                );
              })}
            </div>

            {/* Instant Educational Feedback Panel */}
            {mcqState === 'correct' && (
              <div role="status" aria-live="polite" className="p-5 rounded-3xl bg-[#35A86B]/10 border-2 border-[#35A86B] flex items-center gap-4 animate-slideUp">
                <CrescoMascot pose="correct" size="md" animation={isReducedMotion ? 'none' : 'bounce'} withGlow={!isReducedMotion} />
                <div>
                  <div className="text-base font-black text-[#35A86B] flex items-center gap-1.5">
                    <Sparkles size={18} />
                    <span>✓ CORRECT (+{currentPhase.xpReward || 10} XP)</span>
                  </div>
                  <p className="text-xs text-[#172033] dark:text-[#F9FAFB] font-semibold mt-0.5 leading-relaxed">
                    {currentPhase.explanation}
                  </p>
                </div>
              </div>
            )}

            {mcqState === 'incorrect' && (
              <div role="status" aria-live="polite" className="p-5 rounded-3xl bg-[#F0A63A]/10 border-2 border-[#F0A63A] flex items-center gap-4 animate-slideUp">
                <CrescoMascot pose="wrong" size="md" animation={isReducedMotion ? 'none' : 'float'} />
                <div>
                  <div className="text-sm font-black text-[#B45309] dark:text-[#F0A63A]">
                    Not quite.
                  </div>
                  <p className="text-xs text-[#172033] dark:text-[#F9FAFB] font-medium mt-0.5 leading-relaxed">
                    {activeHint}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PHASE 5: ORDERING QUESTION ================= */}
        {!isLessonComplete && currentPhase?.type === 'ordering' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-mono font-bold text-[#7957C7] uppercase tracking-wider">
                SEQUENCING & ORDERING
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                {currentPhase.questionText}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                Click adjacent items to swap positions until the sequence is correct.
              </p>
            </div>

            <div className="space-y-3">
              {orderingList.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    orderingSolved
                      ? 'bg-[#35A86B]/15 border-[#35A86B] text-[#35A86B]'
                      : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-[#F7F5F0] dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-sm text-[#172033] dark:text-white">
                      {item.label}
                    </span>
                  </div>

                  {!orderingSolved && idx < orderingList.length - 1 && (
                    <button
                      onClick={() => handleSwapOrder(idx, idx + 1)}
                      className="px-3 py-1.5 rounded-xl bg-[#3157D5]/15 text-[#3157D5] text-xs font-bold hover:bg-[#3157D5]/25 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5]"
                    >
                      Swap Down ↓
                    </button>
                  )}

                  {orderingSolved && <CheckCircle2 size={20} className="text-[#35A86B]" />}
                </div>
              ))}
            </div>

            {orderingSolved && (
              <div role="status" aria-live="polite" className="p-4 rounded-2xl bg-[#35A86B]/10 border border-[#35A86B]/30 text-xs font-semibold text-[#35A86B]">
                ✓ Perfect sequence! {currentPhase.explanation}
              </div>
            )}
          </div>
        )}

        {/* ================= PHASE 6: FILL IN THE BLANK ================= */}
        {!isLessonComplete && currentPhase?.type === 'fill-in' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-mono font-bold text-[#35A86B] uppercase tracking-wider">
                TERMINOLOGY RECALL
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                {currentPhase.questionText}
              </h2>
            </div>

            <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={fillInValue}
                  onChange={(e) => setFillInValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && fillInValue.trim()) {
                      handleCheckFillIn();
                    }
                  }}
                  placeholder="Type answer here..."
                  aria-label="Your answer"
                  className="flex-1 px-4 py-3 bg-[#F7F5F0] dark:bg-[#111827] border-2 border-[#E5E0D8] dark:border-slate-700 rounded-2xl text-base font-bold focus:outline-none focus:border-[#3157D5]"
                />
                <button
                  onClick={handleCheckFillIn}
                  disabled={!fillInValue.trim()}
                  className="px-6 py-3 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-sm cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5]"
                >
                  CHECK
                </button>
              </div>

              {fillInState === 'correct' && (
                <div role="status" aria-live="polite" className="p-3.5 rounded-xl bg-[#35A86B]/10 border border-[#35A86B]/30 text-xs font-semibold text-[#35A86B]">
                  ✓ Correct! {currentPhase.explanation}
                </div>
              )}

              {fillInState === 'incorrect' && (
                <div role="status" aria-live="polite" className="p-3.5 rounded-xl bg-[#F0A63A]/10 border border-[#F0A63A]/30 text-xs font-semibold text-[#B45309] dark:text-[#F0A63A]">
                  {activeHint}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PHASE 7: MATCHING QUESTION ================= */}
        {!isLessonComplete && currentPhase?.type === 'matching' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-mono font-bold text-[#7957C7] uppercase tracking-wider">
                TAP-TO-MATCH PROTOCOL DRILL
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                Match each protocol to its property
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-2.5">
                {currentPhase.matchingPairs?.map((pair) => {
                  const isMatched = !!matchedPairs[pair.left];
                  const isSelected = selectedMatchLeft === pair.left;
                  return (
                    <button
                      key={pair.id}
                      onClick={() => handleMatchLeft(pair.left)}
                      disabled={isMatched}
                      aria-label={`Protocol item: ${pair.left}`}
                      className={`w-full p-4 rounded-2xl border-2 text-left text-xs font-extrabold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5] ${
                        isMatched
                          ? 'bg-[#35A86B]/15 border-[#35A86B] text-[#35A86B]'
                          : isSelected
                          ? 'bg-[#3157D5] text-white border-[#2442B0] shadow-xs'
                          : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800'
                      }`}
                    >
                      {pair.left} {isMatched ? '✓' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Right column */}
              <div className="space-y-2.5">
                {currentPhase.matchingPairs?.map((pair) => {
                  const isMatched = Object.values(matchedPairs).includes(pair.right);
                  return (
                    <button
                      key={pair.right}
                      onClick={() => handleMatchRight(pair.right)}
                      disabled={isMatched || !selectedMatchLeft}
                      aria-label={`Property description: ${pair.right}`}
                      className={`w-full p-4 rounded-2xl border-2 text-left text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5] ${
                        isMatched
                          ? 'bg-[#35A86B]/15 border-[#35A86B] text-[#35A86B]'
                          : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800 hover:border-[#3157D5]'
                      }`}
                    >
                      {pair.right}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= PHASE 8: PACKET CHALLENGE MINI-GAME ================= */}
        {!isLessonComplete && currentPhase?.type === 'packet-challenge' && (
          <SaveThePacketChallenge onComplete={() => handleAdvancePhase()} />
        )}

        {/* ========================================================================= */}
        {/* LESSON COMPLETION TRIUMPH (Sections 42, 43, 44, 46)                       */}
        {/* ========================================================================= */}
        {isLessonComplete && (
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#35A86B] rounded-3xl p-6 sm:p-10 text-center space-y-6 animate-scaleUp">
            
            <div className="flex justify-center">
              <CrescoMascot
                pose="achievement"
                size="2xl"
                animation={isReducedMotion ? 'none' : 'bounce'}
                withGlow={!isReducedMotion}
                speechText="Connection Complete! Outstanding!"
                speechPosition="top"
              />
            </div>

            <div>
              <span className="text-xs font-mono font-black text-[#35A86B] uppercase tracking-widest">
                CONNECTION COMPLETE!
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#172033] dark:text-[#F9FAFB] mt-1">
                You Mastered {lessonData.topicTitle}!
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-sm mx-auto mt-2 font-medium">
                Another node connected to your living network topology.
              </p>
            </div>

            {/* Scorecard Strip: Accuracy, Time, Questions, XP */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 font-mono max-w-md mx-auto">
              <div className="p-3 rounded-2xl bg-[#35A86B]/10 border border-[#35A86B]/30">
                <span className="text-[10px] text-[#35A86B] font-bold block">XP EARNED</span>
                <span className="text-xl font-black text-[#35A86B]">+50 XP</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <span className="text-[10px] text-[#64748B] font-bold block">ACCURACY</span>
                <span className="text-xl font-black text-[#172033] dark:text-white">
                  {questionsAnswered > 0 ? Math.round((correctAnswersCount / questionsAnswered) * 100) : 92}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <span className="text-[10px] text-[#64748B] font-bold block">TIME</span>
                <span className="text-xl font-black text-[#172033] dark:text-white">
                  {formatElapsed(elapsedSeconds)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <span className="text-[10px] text-[#64748B] font-bold block">DRILLS</span>
                <span className="text-xl font-black text-[#172033] dark:text-white">
                  {correctAnswersCount} / {Math.max(1, questionsAnswered)}
                </span>
              </div>
            </div>

            {/* Next Unlocked Node Preview */}
            {lessonData.nextLessonId && (
              <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 max-w-md mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#35A86B] text-white flex items-center justify-center">
                    <Check size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#35A86B] font-bold block">NEW NODE UNLOCKED</span>
                    <span className="text-xs font-black text-[#172033] dark:text-white">
                      {lessonData.nextLessonTitle || 'Next Curriculum Node'}
                    </span>
                  </div>
                </div>
                <Unlock size={18} className="text-[#35A86B]" />
              </div>
            )}

            {/* Streak & Mastery Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#F7F5F0] dark:bg-slate-800 font-mono text-xs font-bold text-[#172033] dark:text-slate-300">
              <span className="flex items-center gap-1 text-[#F0A63A]">
                <Flame size={14} className="fill-[#F0A63A]" /> 🔥 {userProfile?.streak ?? 0}-day streak safe
              </span>
              <span>•</span>
              <span className="text-[#3157D5] dark:text-[#6D8CFF]">
                Mastery: Strong ({lessonData.masteryRating}%)
              </span>
            </div>

            {/* Pedagogical Adaptive Guidance */}
            {adaptation && (
              <div className="max-w-md mx-auto w-full">
                <AdaptationCard
                  adaptation={adaptation}
                  onDismiss={() => setAdaptation(null)}
                  onAction={(action) => {
                    if (action.targetLessonId && onNavigateNextLesson) {
                      onNavigateNextLesson(action.targetLessonId);
                    } else {
                      onClose();
                    }
                  }}
                />
              </div>
            )}

            {/* Next Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              {lessonData.nextLessonId && (
                <button
                  onClick={() => {
                    soundFx.playCorrect();
                    if (onNavigateNextLesson) {
                      onNavigateNextLesson(lessonData.nextLessonId!);
                    } else {
                      onClose();
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-xs tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35A86B]"
                >
                  <span>CONTINUE TO NEXT LESSON</span>
                  <ArrowRight size={14} />
                </button>
              )}

              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-800 hover:bg-[#EFECE6] text-[#172033] dark:text-white font-black text-xs border border-[#E5E0D8] dark:border-slate-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5]"
              >
                RETURN TO MAP
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 3. STICKY BOTTOM ACTION BAR (Previous & Next Navigation)                  */}
      {/* ========================================================================= */}
      {!isLessonComplete && currentPhase && (
        <footer className="w-full bg-white dark:bg-[#1F2937] border-t border-[#E5E0D8] dark:border-slate-800 py-3.5 px-4 sm:px-6 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            
            {/* Left: Previous Phase Button */}
            <button
              onClick={handlePrevPhase}
              disabled={phaseIndex === 0}
              aria-label="Return to previous section"
              className={`px-4 sm:px-5 py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5] ${
                phaseIndex > 0
                  ? 'bg-[#F7F5F0] dark:bg-slate-800 hover:bg-[#EFECE6] text-[#172033] dark:text-white border border-[#E5E0D8] dark:border-slate-700 cursor-pointer'
                  : 'opacity-40 text-[#94A3B8] cursor-not-allowed border border-transparent'
              }`}
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">PREVIOUS</span>
            </button>

            {/* Center: Phase Counter Indicator with Keyboard Hints */}
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-mono font-bold text-[#64748B] dark:text-slate-400">
                Phase {phaseIndex + 1} of {totalPhases} · {currentPhase.type.toUpperCase()}
              </span>
              <span className="hidden md:inline text-[10px] font-mono text-[#94A3B8] dark:text-slate-500">
                Shortcuts: [← Prev] [→ Next / Enter] [Esc Exit]
              </span>
            </div>

            {/* Right: Next / Check / Continue Action Buttons */}
            <div>
              {/* Intro / Explain / Visualize / Interact: Simple Continue */}
              {(currentPhase.type === 'intro' || currentPhase.type === 'explain' || currentPhase.type === 'visualize' || currentPhase.type === 'interact') && (
                <button
                  onClick={handleAdvancePhase}
                  className="px-6 sm:px-8 py-3 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_0_0_#2442B0] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5]"
                >
                  <span>{currentPhase.type === 'intro' ? 'START LESSON →' : 'CONTINUE →'}</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {/* MCQ Check button */}
              {(currentPhase.type === 'question' || currentPhase.type === 'scenario' || currentPhase.type === 'topology') && mcqState === 'unanswered' && (
                <button
                  onClick={handleCheckMcq}
                  disabled={!selectedMcqOption}
                  className={`px-6 sm:px-8 py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157D5] ${
                    selectedMcqOption
                      ? 'bg-[#3157D5] hover:bg-[#2442B0] text-white shadow-[0_4px_0_0_#2442B0] active:translate-y-1 active:shadow-none'
                      : 'bg-[#E5E0D8] dark:bg-slate-800 text-[#94A3B8] cursor-not-allowed'
                  }`}
                >
                  CHECK
                </button>
              )}

              {/* MCQ Correct -> Continue */}
              {(currentPhase.type === 'question' || currentPhase.type === 'scenario' || currentPhase.type === 'topology') && mcqState === 'correct' && (
                <button
                  onClick={handleAdvancePhase}
                  className="px-6 sm:px-8 py-3 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_0_0_#288654] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35A86B]"
                >
                  <span>CONTINUE →</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {/* MCQ Incorrect -> Try Again */}
              {(currentPhase.type === 'question' || currentPhase.type === 'scenario' || currentPhase.type === 'topology') && mcqState === 'incorrect' && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setMcqState('unanswered');
                    setSelectedMcqOption(null);
                  }}
                  className="px-6 sm:px-8 py-3 rounded-2xl bg-[#F0A63A] hover:bg-[#D97706] text-white font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_0_0_#B45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A63A]"
                >
                  TRY AGAIN
                </button>
              )}

              {/* Ordering Solved -> Continue */}
              {currentPhase.type === 'ordering' && orderingSolved && (
                <button
                  onClick={handleAdvancePhase}
                  className="px-6 sm:px-8 py-3 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_0_0_#288654] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35A86B]"
                >
                  <span>CONTINUE →</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {/* Fill-in Solved -> Continue */}
              {currentPhase.type === 'fill-in' && fillInState === 'correct' && (
                <button
                  onClick={handleAdvancePhase}
                  className="px-6 sm:px-8 py-3 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_0_0_#288654] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35A86B]"
                >
                  <span>CONTINUE →</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {/* Matching: Allow continue when completed */}
              {currentPhase.type === 'matching' && Object.keys(matchedPairs).length >= (currentPhase.matchingPairs?.length || 1) && (
                <button
                  onClick={handleAdvancePhase}
                  className="px-6 sm:px-8 py-3 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_0_0_#288654] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35A86B]"
                >
                  <span>CONTINUE →</span>
                  <ArrowRight size={16} />
                </button>
              )}

            </div>

          </div>
        </footer>
      )}

    </div>
  );
};
