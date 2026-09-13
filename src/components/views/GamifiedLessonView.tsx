import React, { useState, useEffect, useRef } from 'react';
import { ByteBot, BytePose } from '../character/ByteBot';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { getLessonById } from '../lesson/lessonDatabase';
import { LessonDefinition, LessonPhase, McqOption, MatchingPair } from '../lesson/lessonTypes';
import { useAuth } from '../../context/AuthContext';

// Interactive Lesson Diagrams
import { InteractiveHandshakeDiagram } from '../lesson/InteractiveHandshakeDiagram';
import { InteractiveTcpUdpComparison } from '../lesson/InteractiveTcpUdpComparison';
import { InteractiveDnsResolution } from '../lesson/InteractiveDnsResolution';
import { InteractiveDhcpDora } from '../lesson/InteractiveDhcpDora';
import { InteractiveCongestionSimulation } from '../lesson/InteractiveCongestionSimulation';
import { SaveThePacketChallenge } from '../lesson/SaveThePacketChallenge';

import { 
  ArrowLeft, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Laptop, 
  Server, 
  ArrowRight,
  RotateCcw,
  Check,
  Package,
  Layers,
  HelpCircle,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
  Flame,
  ShieldCheck,
  Router,
  ChevronRight,
  Lock,
  Unlock
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

  // Lesson Phase Index
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const currentPhase: LessonPhase = lessonData.phases[phaseIndex] || lessonData.phases[0];

  const { userProfile } = useAuth();

  // Global Lesson Stats & Gamification
  const [hearts, setHearts] = useState<number>(5);
  const [userXp, setUserXp] = useState<number>(userProfile?.totalXP ?? userProfile?.xp ?? 0);
  const [showXpGainAnim, setShowXpGainAnim] = useState<number | null>(null);

  // Sync user XP when profile updates
  useEffect(() => {
    if (userProfile) {
      setUserXp(userProfile.totalXP ?? userProfile.xp ?? 0);
    }
  }, [userProfile?.totalXP, userProfile?.xp]);

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

  // Initialize Ordering items whenever phase changes
  useEffect(() => {
    if (currentPhase.type === 'ordering' && currentPhase.orderingItems) {
      // Shuffle ordering list initially
      const shuffled = [...currentPhase.orderingItems].sort(() => 0.5 - Math.random());
      setOrderingList(shuffled);
      setOrderingSolved(false);
    }
    // Reset answers
    setSelectedMcqOption(null);
    setMcqState('unanswered');
    setFillInValue('');
    setFillInState('unanswered');
    setActiveHint(null);
    setInspectedKeyword(null);
  }, [phaseIndex, currentPhase]);

  // Overall lesson elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Progress percentage
  const totalPhases = lessonData.phases.length;
  const progressPercent = Math.round(((phaseIndex + 1) / totalPhases) * 100);

  // Handle MCQ Option Selection
  const handleSelectOption = (id: string) => {
    if (mcqState === 'correct') return;
    soundFx.playClick();
    setSelectedMcqOption(id);
    setMcqState('unanswered');
  };

  // Check MCQ Answer
  const handleCheckMcq = () => {
    if (!selectedMcqOption || !currentPhase.mcqOptions) return;
    setQuestionsAnswered((prev) => prev + 1);

    const chosen = currentPhase.mcqOptions.find((o) => o.id === selectedMcqOption);
    if (chosen?.isCorrect) {
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
      setActiveHint(currentPhase.hint || 'Think about which protocol guarantees ordered transmission.');
    }
  };

  // Check Fill-in-the-blank
  const handleCheckFillIn = () => {
    if (!fillInValue.trim() || !currentPhase.fillInCorrectAnswer) return;
    setQuestionsAnswered((prev) => prev + 1);

    const isMatch = fillInValue.trim().toLowerCase() === currentPhase.fillInCorrectAnswer.toLowerCase();
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

    // Verify if order matches correctPosition
    const isCorrect = copy.every((item, index) => item.correctPosition === index);
    if (isCorrect) {
      soundFx.playCorrect();
      setOrderingSolved(true);
      setCorrectAnswersCount((prev) => prev + 1);
      const earned = currentPhase.xpReward || 15;
      setUserXp((prev) => prev + earned);
      setShowXpGainAnim(earned);
      setTimeout(() => setShowXpGainAnim(null), 1800);
    }
  };

  // Handle Matching Left Click
  const handleMatchLeft = (leftText: string) => {
    soundFx.playClick();
    setSelectedMatchLeft(leftText);
  };

  // Handle Matching Right Click
  const handleMatchRight = (rightText: string) => {
    if (!selectedMatchLeft || !currentPhase.matchingPairs) return;
    soundFx.playClick();

    const expectedPair = currentPhase.matchingPairs.find((p) => p.left === selectedMatchLeft);
    if (expectedPair && expectedPair.right === rightText) {
      soundFx.playPacketPop();
      setMatchedPairs((prev) => ({ ...prev, [selectedMatchLeft]: rightText }));
      setSelectedMatchLeft(null);

      // Check if all matched
      if (Object.keys(matchedPairs).length + 1 >= currentPhase.matchingPairs.length) {
        soundFx.playCorrect();
        const earned = currentPhase.xpReward || 20;
        setUserXp((prev) => prev + earned);
        setShowXpGainAnim(earned);
        setTimeout(() => setShowXpGainAnim(null), 1800);
      }
    } else {
      soundFx.playIncorrect();
      setSelectedMatchLeft(null);
    }
  };

  // Advance to Next Phase
  const handleAdvancePhase = () => {
    soundFx.playClick();
    if (phaseIndex < totalPhases - 1) {
      setPhaseIndex((prev) => prev + 1);
    } else {
      // Completed lesson!
      soundFx.playLevelUp();
      triggerSubtleSectionConfetti();
      setPhaseIndex(totalPhases); // completed state
      if (onCompleteLesson) {
        onCompleteLesson(50);
      }
    }
  };

  const isLastPhase = phaseIndex >= totalPhases - 1;
  const isLessonComplete = phaseIndex >= totalPhases;

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F5F0] dark:bg-[#111827] text-[#172033] dark:text-[#F9FAFB] flex flex-col justify-between overflow-y-auto select-none transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* 1. TOP PROGRESS BAR (Section 2 & 3)                                       */}
      {/* ========================================================================= */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-[#E5E0D8] dark:border-slate-800 shrink-0">
        
        {/* Left: ← Exit Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#64748B] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={17} />
          <span>Exit</span>
        </button>

        {/* Center: Thin, elegant progress indicator with Unit & Lesson indicators */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4 flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-[11px] sm:text-xs font-mono font-bold text-[#64748B] dark:text-slate-400 mb-1">
            <span className="text-[#3157D5] dark:text-[#6D8CFF] uppercase truncate">
              UNIT {lessonData.unitNumber} · {lessonData.unitName}
            </span>
            <span>Lesson {lessonData.lessonNumber} / {lessonData.totalLessonsInUnit}</span>
          </div>

          {/* Thin Progress Line */}
          <div className="w-full h-2 bg-[#EFECE6] dark:bg-slate-800 rounded-full overflow-hidden border border-[#E5E0D8] dark:border-slate-700">
            <div 
              className="h-full bg-[#35A86B] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${isLessonComplete ? 100 : progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Hearts & Animated XP Counter */}
        <div className="flex items-center gap-2">
          {/* Hearts Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-700 text-xs font-black text-[#D95C5C] shadow-2xs">
            <Heart size={15} fill="#D95C5C" />
            <span>{hearts}</span>
          </div>

          {/* XP Pill with Animated Increment */}
          <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-700 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] shadow-2xs">
            <Sparkles size={14} className="text-[#F0A63A]" />
            <span>{userXp.toLocaleString()} XP</span>

            {/* Floating upward XP gain indicator */}
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
        {!isLessonComplete && currentPhase.type === 'intro' && (
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

        {/* ================= PHASE 2: CONCEPT / EXPLANATION (Section 9) ================= */}
        {!isLessonComplete && currentPhase.type === 'explain' && (
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
              {currentPhase.highlightWords && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {currentPhase.highlightWords.map((hw) => (
                    <button
                      key={hw.word}
                      onClick={() => {
                        soundFx.playPacketPop();
                        setInspectedKeyword(hw.word);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
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

        {/* ================= PHASE 3: VISUALIZE PACKET FLOW (Section 10) ================= */}
        {!isLessonComplete && currentPhase.type === 'visualize' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div>
              <span className="text-xs font-mono font-bold text-[#35A86B] uppercase tracking-wider">
                NETWORK VISUALIZATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                {currentPhase.title}
              </h2>
            </div>

            {/* Visual Traversal: Client -> Packet -> Router -> Server */}
            <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between gap-2 sm:gap-4 py-6 px-2">
                {/* Client */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#3157D5] text-white flex items-center justify-center shadow-xs">
                    <Laptop size={26} />
                  </div>
                  <span className="text-xs font-black mt-2 font-mono">CLIENT</span>
                </div>

                {/* Packet Rail */}
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-full h-1 bg-[#E5E0D8] dark:bg-slate-700 relative flex items-center justify-around">
                    <div className="px-3 py-1 rounded-xl bg-[#3157D5] text-white font-mono text-xs font-black shadow-xs animate-pulse">
                      PACKET (Seq=1)
                    </div>
                  </div>
                </div>

                {/* Router */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#7957C7] text-white flex items-center justify-center shadow-xs">
                    <Router size={26} />
                  </div>
                  <span className="text-xs font-black mt-2 font-mono">ROUTER</span>
                </div>

                {/* Packet Rail */}
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-full h-1 bg-[#E5E0D8] dark:bg-slate-700 relative flex items-center justify-around">
                    <div className="w-3 h-3 rounded-full bg-[#35A86B] animate-ping" />
                  </div>
                </div>

                {/* Server */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#35A86B] text-white flex items-center justify-center shadow-xs">
                    <Server size={26} />
                  </div>
                  <span className="text-xs font-black mt-2 font-mono">SERVER</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D1D5DB] font-medium text-center">
                Lightweight vector packet transit ensures reliable hop-by-hop verification without cyberpunk clutter.
              </p>

            </div>

            {/* Byte Bot */}
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

        {/* ================= PHASE 4: INTERACTIVE DIAGRAMS ================= */}
        {!isLessonComplete && currentPhase.type === 'interact' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* TCP 3-Way Handshake (Section 11) */}
            {currentPhase.diagramType === 'tcp-handshake' && (
              <InteractiveHandshakeDiagram />
            )}

            {/* TCP vs UDP Side-by-Side (Section 14) */}
            {currentPhase.diagramType === 'tcp-vs-udp' && (
              <InteractiveTcpUdpComparison />
            )}

            {/* DNS Resolution (Section 34) */}
            {currentPhase.diagramType === 'dns-pipeline' && (
              <InteractiveDnsResolution />
            )}

            {/* DHCP DORA (Section 39) */}
            {currentPhase.diagramType === 'dhcp-dora' && (
              <InteractiveDhcpDora />
            )}

            {/* Congestion Control Simulation (Section 26) */}
            {currentPhase.diagramType === 'congestion' && (
              <InteractiveCongestionSimulation />
            )}

            {/* Byte Companion */}
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

        {/* ================= PHASE 5: TACTILE MCQ QUESTIONS (Section 16, 17, 18) ================= */}
        {!isLessonComplete && (currentPhase.type === 'question' || currentPhase.type === 'scenario' || currentPhase.type === 'topology') && (
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
                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
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
              <div className="p-5 rounded-3xl bg-[#35A86B]/10 border-2 border-[#35A86B] flex items-center gap-4 animate-slideUp">
                <ByteBot pose="celebrating" size="md" />
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
              <div className="p-5 rounded-3xl bg-[#F0A63A]/10 border-2 border-[#F0A63A] flex items-center gap-4 animate-slideUp">
                <ByteBot pose="wrong" size="md" />
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

        {/* ================= PHASE 6: ORDERING QUESTION (Section 22) ================= */}
        {!isLessonComplete && currentPhase.type === 'ordering' && (
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
                      className="px-3 py-1.5 rounded-xl bg-[#3157D5]/15 text-[#3157D5] text-xs font-bold hover:bg-[#3157D5]/25 cursor-pointer"
                    >
                      Swap Down ↓
                    </button>
                  )}

                  {orderingSolved && <CheckCircle2 size={20} className="text-[#35A86B]" />}
                </div>
              ))}
            </div>

            {orderingSolved && (
              <div className="p-4 rounded-2xl bg-[#35A86B]/10 border border-[#35A86B]/30 text-xs font-semibold text-[#35A86B]">
                ✓ Perfect sequence! {currentPhase.explanation}
              </div>
            )}

          </div>
        )}

        {/* ================= PHASE 7: FILL IN THE BLANK (Section 21) ================= */}
        {!isLessonComplete && currentPhase.type === 'fill-in' && (
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
                  placeholder="Type answer here..."
                  className="flex-1 px-4 py-3 bg-[#F7F5F0] dark:bg-[#111827] border-2 border-[#E5E0D8] dark:border-slate-700 rounded-2xl text-base font-bold focus:outline-hidden focus:border-[#3157D5]"
                />
                <button
                  onClick={handleCheckFillIn}
                  disabled={!fillInValue.trim()}
                  className="px-6 py-3 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-sm cursor-pointer shadow-xs"
                >
                  CHECK
                </button>
              </div>

              {fillInState === 'correct' && (
                <div className="p-3.5 rounded-xl bg-[#35A86B]/10 border border-[#35A86B]/30 text-xs font-semibold text-[#35A86B]">
                  ✓ Correct! {currentPhase.explanation}
                </div>
              )}

              {fillInState === 'incorrect' && (
                <div className="p-3.5 rounded-xl bg-[#F0A63A]/10 border border-[#F0A63A]/30 text-xs font-semibold text-[#B45309] dark:text-[#F0A63A]">
                  {activeHint}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= PHASE 8: MATCHING QUESTION (Section 20) ================= */}
        {!isLessonComplete && currentPhase.type === 'matching' && (
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
                      className={`w-full p-4 rounded-2xl border-2 text-left text-xs font-extrabold transition-all cursor-pointer ${
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
                      className={`w-full p-4 rounded-2xl border-2 text-left text-xs font-medium transition-all cursor-pointer ${
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

        {/* ================= PHASE 9: PACKET CHALLENGE MINI-GAME (Section 24) ================= */}
        {!isLessonComplete && currentPhase.type === 'packet-challenge' && (
          <SaveThePacketChallenge onComplete={() => handleAdvancePhase()} />
        )}

        {/* ========================================================================= */}
        {/* LESSON COMPLETION TRIUMPH (Sections 42, 43, 44, 46)                       */}
        {/* ========================================================================= */}
        {isLessonComplete && (
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#35A86B] rounded-3xl p-6 sm:p-10 text-center space-y-6 animate-scaleUp">
            
            <ByteBot pose="celebrating" size="xl" className="justify-center" />

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

            {/* Scorecard Strip: Accuracy, Time, Questions, XP (Section 42) */}
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

            {/* Next Unlocked Node Preview (Section 43) */}
            {lessonData.nextLessonId && (
              <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 max-w-md mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#35A86B] text-white flex items-center justify-center">
                    <Check size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#35A86B] font-bold block">NEW NODE UNLOCKED</span>
                    <span className="text-xs font-black text-[#172033] dark:text-white">
                      {lessonData.nextLessonTitle}
                    </span>
                  </div>
                </div>
                <Unlock size={18} className="text-[#35A86B]" />
              </div>
            )}

            {/* Streak & Mastery Pill (Sections 44 & 46) */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#F7F5F0] dark:bg-slate-800 font-mono text-xs font-bold text-[#172033] dark:text-slate-300">
              <span className="flex items-center gap-1 text-[#F0A63A]">
                <Flame size={14} className="fill-[#F0A63A]" /> 🔥 {userProfile?.streak ?? 0}-day streak safe
              </span>
              <span>•</span>
              <span className="text-[#3157D5] dark:text-[#6D8CFF]">
                Mastery: Strong ({lessonData.masteryRating}%)
              </span>
            </div>

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
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-xs tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-2"
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
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-800 hover:bg-[#EFECE6] text-[#172033] dark:text-white font-black text-xs border border-[#E5E0D8] dark:border-slate-700 cursor-pointer"
              >
                RETURN TO MAP
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 3. STICKY BOTTOM ACTION BAR                                               */}
      {/* ========================================================================= */}
      {!isLessonComplete && (
        <footer className="w-full bg-white dark:bg-[#1F2937] border-t border-[#E5E0D8] dark:border-slate-800 py-4 px-6 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            
            {/* Step Counter Indicator */}
            <div className="text-xs font-mono font-bold text-[#64748B] dark:text-slate-400">
              Phase {phaseIndex + 1} of {totalPhases} · {currentPhase.type.toUpperCase()}
            </div>

            {/* Action Buttons */}
            <div>
              {/* Intro or Explain or Visualize: Simple Continue */}
              {(currentPhase.type === 'intro' || currentPhase.type === 'explain' || currentPhase.type === 'visualize' || currentPhase.type === 'interact') && (
                <button
                  onClick={handleAdvancePhase}
                  className="px-8 py-3.5 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-sm tracking-wide shadow-[0_4px_0_0_#2442B0] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
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
                  className={`px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all cursor-pointer ${
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
                  className="px-8 py-3.5 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-sm tracking-wide shadow-[0_4px_0_0_#288654] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
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
                  className="px-8 py-3.5 rounded-2xl bg-[#F0A63A] hover:bg-[#D97706] text-white font-black text-sm tracking-wide shadow-[0_4px_0_0_#B45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  TRY AGAIN
                </button>
              )}

              {/* Ordering Solved -> Continue */}
              {currentPhase.type === 'ordering' && orderingSolved && (
                <button
                  onClick={handleAdvancePhase}
                  className="px-8 py-3.5 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-sm tracking-wide shadow-[0_4px_0_0_#288654] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>CONTINUE →</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {/* Fill-in Solved -> Continue */}
              {currentPhase.type === 'fill-in' && fillInState === 'correct' && (
                <button
                  onClick={handleAdvancePhase}
                  className="px-8 py-3.5 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-sm tracking-wide shadow-[0_4px_0_0_#288654] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>CONTINUE →</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {/* Matching: Allow continue when completed */}
              {currentPhase.type === 'matching' && Object.keys(matchedPairs).length >= (currentPhase.matchingPairs?.length || 1) && (
                <button
                  onClick={handleAdvancePhase}
                  className="px-8 py-3.5 rounded-2xl bg-[#35A86B] hover:bg-[#288654] text-white font-black text-sm tracking-wide shadow-[0_4px_0_0_#288654] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
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
