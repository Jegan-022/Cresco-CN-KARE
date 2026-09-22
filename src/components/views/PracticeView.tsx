import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavTab } from '../../types';
import { COURSE_UNITS, ALL_PRACTICE_QUESTIONS, QUICK_REFERENCE_FLASHCARDS } from '../../data/courseContent';
import { useAuth } from '../../context/AuthContext';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { soundFx } from '../../utils/audio';
import { SplitMcqPlayer, SplitMcqQuestionData } from '../quiz/SplitMcqPlayer';
import { CrescoMascot } from '../brand/CrescoMascot';
import { PptDeckViewer } from '../practice/PptDeckViewer';
import { MaterialsViewer } from '../practice/MaterialsViewer';
import { VideoOverviewsViewer } from '../practice/VideoOverviewsViewer';
import { 
  Activity, 
  RefreshCw, 
  Calculator, 
  BookOpen, 
  Search, 
  ArrowRight, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Clock, 
  Sparkles, 
  Flame, 
  Play, 
  ChevronRight, 
  Layers, 
  Sliders, 
  Trophy,
  Check,
  Target,
  Presentation,
  FileText,
  Video
} from 'lucide-react';

export type PracticeTab = 'flashcards' | 'ppt' | 'materials' | 'videos' | 'quiz';

interface PracticeViewProps {
  onNavigate: (tab: NavTab) => void;
  initialTab?: PracticeTab;
}

export interface QuizQuestionItem {
  id: string;
  unitId: 'unit_3' | 'unit_4' | 'unit_5' | 'general';
  unitTitle: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Comprehensive high-yield question pool derived from curriculum & RFC standards
const SUPPLEMENTAL_QUESTIONS: QuizQuestionItem[] = [
  {
    id: 'supp-u3-1',
    unitId: 'unit_3',
    unitTitle: 'Unit 3: Network Layer',
    topic: 'IP Addressing & Classes',
    question: 'What is the default subnet mask for a traditional Class B IPv4 network address?',
    options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.192'],
    correctIndex: 1,
    explanation: 'Class B addresses (128.0.0.0 to 191.255.255.255) utilize a 16-bit network prefix, resulting in a default mask of 255.255.0.0 (/16).'
  },
  {
    id: 'supp-u3-2',
    unitId: 'unit_3',
    unitTitle: 'Unit 3: Network Layer',
    topic: 'NAT & Private Addressing',
    question: 'Which of the following IPv4 ranges is reserved exclusively for private networking under RFC 1918?',
    options: ['172.16.0.0 to 172.31.255.255', '192.169.0.0 to 192.169.255.255', '11.0.0.0 to 11.255.255.255', '169.254.0.0 to 169.254.255.255'],
    correctIndex: 0,
    explanation: 'RFC 1918 specifies three private address blocks: 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0–172.31.255.255), and 192.168.0.0/16.'
  },
  {
    id: 'supp-u4-1',
    unitId: 'unit_4',
    unitTitle: 'Unit 4: Transport Layer',
    topic: 'TCP Congestion Control',
    question: 'In TCP congestion control, what algorithm is entered immediately after Slow Start threshold (ssthresh) is reached?',
    options: ['Fast Retransmit', 'Congestion Avoidance', 'Multiplicative Increase', 'Exponential Backoff'],
    correctIndex: 1,
    explanation: 'When cwnd reaches ssthresh during Slow Start, TCP transitions into Congestion Avoidance, switching from exponential to linear growth (AIMD).'
  },
  {
    id: 'supp-u4-2',
    unitId: 'unit_4',
    unitTitle: 'Unit 4: Transport Layer',
    topic: 'TCP Header & Flags',
    question: 'Which TCP flag is used to abnormally terminate or reject an invalid connection attempt?',
    options: ['FIN', 'RST', 'URG', 'PSH'],
    correctIndex: 1,
    explanation: 'The RST (Reset) flag immediately terminates an abnormal connection or indicates that the listening port is closed on the destination host.'
  },
  {
    id: 'supp-u5-1',
    unitId: 'unit_5',
    unitTitle: 'Unit 5: Application Layer',
    topic: 'DNS Architecture',
    question: 'Which DNS record type specifies the mail server responsible for accepting email messages on behalf of a domain?',
    options: ['MX Record', 'CNAME Record', 'PTR Record', 'TXT Record'],
    correctIndex: 0,
    explanation: 'An MX (Mail Exchange) record points to the SMTP servers handling inbound email for a domain, along with preference priority numbers.'
  },
  {
    id: 'supp-u5-2',
    unitId: 'unit_5',
    unitTitle: 'Unit 5: Application Layer',
    topic: 'HTTP Protocol Evolution',
    question: 'Which major feature was first standardized in HTTP/2 to eliminate head-of-line blocking across a single TCP connection?',
    options: ['Binary framing and stream multiplexing', 'QUIC UDP transport', 'Cookie authentication', 'Chunked transfer encoding'],
    correctIndex: 0,
    explanation: 'HTTP/2 introduced binary framing with interleaved streams over a single connection, allowing concurrent requests without waiting for previous responses.'
  }
];

export const PracticeView: React.FC<PracticeViewProps> = ({ 
  onNavigate,
  initialTab = 'flashcards'
}) => {
  const { recordQuizAttempt } = useAuth();
  const [activeTab, setActiveTab] = useState<PracticeTab>(initialTab);

  // Sync initialTab when prop updates
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Flashcard State derived from official quick reference & course practice drills
  const flashcards = useMemo(() => {
    const quick = (QUICK_REFERENCE_FLASHCARDS || []).map((q: any) => ({
      q: q.q,
      a: q.a,
      domain: 'Quick Reference',
      type: 'Key Fact'
    }));
    const drills = ALL_PRACTICE_QUESTIONS.map(p => ({
      q: p.question,
      a: p.answer,
      domain: p.domain,
      type: p.type
    }));
    return [...quick, ...drills];
  }, []);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  // ==========================================
  // QUIZ SECTION STATE & CONFIGURATION OPTIONS
  // ==========================================
  
  // Quiz Options (Settings)
  const [selectedUnitOption, setSelectedUnitOption] = useState<'all' | 'unit_3' | 'unit_4' | 'unit_5'>('all');
  const [questionCountOption, setQuestionCountOption] = useState<number>(5);
  const [quizModeOption, setQuizModeOption] = useState<'practice' | 'timed'>('practice');

  // Active Quiz Execution State
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionItem[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOptionByQ, setSelectedOptionByQ] = useState<Record<number, number>>({});
  const [answeredByQ, setAnsweredByQ] = useState<Record<number, boolean>>({});
  const [streak, setStreak] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const timerRef = useRef<any>(null);

  // Build full question pool from curriculum modules + supplemental questions
  const masterQuestionPool = useMemo<QuizQuestionItem[]>(() => {
    const list: QuizQuestionItem[] = [];
    
    // Extract from COURSE_UNITS
    COURSE_UNITS.forEach(unit => {
      const uId = unit.id as 'unit_3' | 'unit_4' | 'unit_5';
      unit.modules.forEach(mod => {
        if (mod.quiz && Array.isArray(mod.quiz)) {
          mod.quiz.forEach(q => {
            list.push({
              id: q.id,
              unitId: uId,
              unitTitle: unit.title,
              topic: mod.title,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation
            });
          });
        }
      });
    });

    // Merge supplemental RFC questions
    return [...list, ...SUPPLEMENTAL_QUESTIONS];
  }, []);

  // Filtered pool based on selected options
  const eligibleQuestions = useMemo(() => {
    if (selectedUnitOption === 'all') return masterQuestionPool;
    return masterQuestionPool.filter(q => q.unitId === selectedUnitOption);
  }, [masterQuestionPool, selectedUnitOption]);

  // Start or Reset a Quiz Session
  const handleStartQuiz = () => {
    soundFx.playClick();
    // Shuffle and slice according to options
    const shuffled = [...eligibleQuestions].sort(() => 0.5 - Math.random());
    const count = questionCountOption === -1 ? shuffled.length : Math.min(questionCountOption, shuffled.length);
    const selected = shuffled.slice(0, count);

    setQuizQuestions(selected);
    setCurrentQIndex(0);
    setSelectedOptionByQ({});
    setAnsweredByQ({});
    setScore(0);
    setStreak(0);
    setIsQuizCompleted(false);
    setQuizStarted(true);
    setSecondsRemaining(30);
  };

  // Timer effect for Timed Mode
  useEffect(() => {
    if (!quizStarted || isQuizCompleted || quizModeOption !== 'timed') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Auto-time-out on current question if unanswered
          handleAnswerOption(-1);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizStarted, isQuizCompleted, quizModeOption, currentQIndex]);

  // Handle selecting an answer option (0 to 3, or -1 for timeout)
  const handleAnswerOption = (optionIndex: number) => {
    if (answeredByQ[currentQIndex]) return; // Already answered

    const currentQuestion = quizQuestions[currentQIndex];
    if (!currentQuestion) return;

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    
    setSelectedOptionByQ(prev => ({ ...prev, [currentQIndex]: optionIndex }));
    setAnsweredByQ(prev => ({ ...prev, [currentQIndex]: true }));

    if (isCorrect) {
      soundFx.playSuccess();
      setScore(s => s + 1);
      setStreak(st => st + 1);
    } else {
      soundFx.playClick();
      setStreak(0);
    }
  };

  // Advance to next question or complete quiz
  const handleNextQuestion = () => {
    soundFx.playClick();
    if (currentQIndex < quizQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSecondsRemaining(30);
    } else {
      finishQuiz();
    }
  };

  // Finalize quiz, calculate XP, trigger celebration, and save to profile
  const finishQuiz = () => {
    setIsQuizCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const total = quizQuestions.length;
    const accuracyPercent = Math.round((score / (total || 1)) * 100);
    const passed = accuracyPercent >= 70;
    const xpReward = Math.max(30, Math.round(accuracyPercent * 1.0));

    if (passed) {
      triggerSubtleSectionConfetti();
    }

    // Persist attempt to AuthContext / Firestore
    try {
      recordQuizAttempt(selectedUnitOption, accuracyPercent, passed, xpReward);
    } catch (e) {
      console.warn('Quiz recording caught fallback:', e);
    }
  };

  const currentQuestion = quizQuestions[currentQIndex];
  const isCurrentAnswered = answeredByQ[currentQIndex];
  const selectedOptionIndex = selectedOptionByQ[currentQIndex];

  const splitQuestions: SplitMcqQuestionData[] = useMemo(() => {
    return quizQuestions.map((q, idx) => ({
      id: q.id || `quiz-q-${idx}`,
      unitId: q.unitId,
      unitTitle: q.unitTitle,
      topic: q.topic,
      domain: q.unitTitle,
      difficulty: (idx % 3 === 0 ? 'Medium' : idx % 3 === 1 ? 'Hard' : 'Easy') as 'Easy' | 'Medium' | 'Hard',
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      helpNotes: [
        `Topic: ${q.topic || 'Network Protocol Engineering'}`,
        `Curriculum Area: ${q.unitTitle}`,
        'Verify protocol boundaries, byte offsets, and state machine transitions.',
        'Review standard RFC specifications and end-to-end transport invariants.'
      ]
    }));
  }, [quizQuestions]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto">
        
        {/* Practice Header & Mastery Matrix */}
        <div className="space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CrescoMascot
                pose="problem-solving"
                size="md"
                animation="float"
                withGlow
              />
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest">
                  <Target className="w-4 h-4" />
                  <span>SKILL REINFORCEMENT</span>
                </div>
                <h1 className="text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                  PRACTICE
                </h1>
                <p className="text-sm font-medium text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                  "Strengthen your weakest connections."
                </p>
              </div>
            </div>

            {activeTab === 'quiz' && quizStarted && !isQuizCompleted && (
              <button
                onClick={() => {
                  if (window.confirm('Exit current quiz and return to options?')) {
                    setQuizStarted(false);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-slate-700 bg-white dark:bg-[#1F2937] hover:bg-[#F7F5F0] text-xs font-bold text-[#172033] dark:text-slate-300 transition-colors self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Change Quiz Options
              </button>
            )}
          </div>

          {/* 6 Specific Mastery Categories Specified in Prompt */}
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-[11px] font-mono font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
              TOPOLOGY MASTERY LEVEL
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Routing 82% */}
              <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>🛣 Routing</span>
                  <span className="font-mono text-[#3157D5] dark:text-[#6D8CFF]">82%</span>
                </div>
                <div className="w-full h-2.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden mt-2 border border-[#E5E0D8] dark:border-slate-700">
                  <div className="h-full bg-[#3157D5]" style={{ width: '82%' }} />
                </div>
              </div>

              {/* IP Addressing 68% */}
              <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>🔢 IP Addressing</span>
                  <span className="font-mono text-[#35A86B]">68%</span>
                </div>
                <div className="w-full h-2.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden mt-2 border border-[#E5E0D8] dark:border-slate-700">
                  <div className="h-full bg-[#35A86B]" style={{ width: '68%' }} />
                </div>
              </div>

              {/* TCP / UDP 91% */}
              <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>🚚 TCP / UDP</span>
                  <span className="font-mono text-[#3157D5] dark:text-[#6D8CFF]">91%</span>
                </div>
                <div className="w-full h-2.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden mt-2 border border-[#E5E0D8] dark:border-slate-700">
                  <div className="h-full bg-[#3157D5]" style={{ width: '91%' }} />
                </div>
              </div>

              {/* Security 54% */}
              <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>🔐 Security</span>
                  <span className="font-mono text-[#F0A63A]">54%</span>
                </div>
                <div className="w-full h-2.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden mt-2 border border-[#E5E0D8] dark:border-slate-700">
                  <div className="h-full bg-[#F0A63A]" style={{ width: '54%' }} />
                </div>
              </div>

              {/* DNS 88% */}
              <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>🌐 DNS</span>
                  <span className="font-mono text-[#7957C7]">88%</span>
                </div>
                <div className="w-full h-2.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden mt-2 border border-[#E5E0D8] dark:border-slate-700">
                  <div className="h-full bg-[#7957C7]" style={{ width: '88%' }} />
                </div>
              </div>

              {/* HTTP / HTTPS 76% */}
              <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>🔒 HTTP / HTTPS</span>
                  <span className="font-mono text-[#35A86B]">76%</span>
                </div>
                <div className="w-full h-2.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden mt-2 border border-[#E5E0D8] dark:border-slate-700">
                  <div className="h-full bg-[#35A86B]" style={{ width: '76%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Tab Switchers - 5 Core Practice Modes */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 inline-flex shadow-xs">
          <button
            onClick={() => { soundFx.playClick(); setActiveTab('flashcards'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'flashcards' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveTab('ppt'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'ppt' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Presentation className="w-4 h-4" /> 
            <span>PPT Slides</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveTab('materials'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'materials' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> 
            <span>Materials</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveTab('videos'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'videos' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" /> 
            <span>Video Overviews</span>
          </button>

          {/* Adaptive Quiz */}
          <button
            onClick={() => { soundFx.playClick(); setActiveTab('quiz'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'quiz' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> 
            <span>Adaptive Quiz</span>
            <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-[10px] uppercase tracking-wider text-white font-extrabold rounded-full">
              RFC
            </span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* SECTION 1: FLASHCARDS (CLEAN 3D FLIP)               */}
        {/* ==================================================== */}
        {activeTab === 'flashcards' && flashcards.length > 0 && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center py-4">
            <div className="w-full max-w-xl flex items-center justify-between mb-6 px-2">
              <span className="text-xs font-mono font-bold text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Quick Reference Cards
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {currentCardIndex + 1} / {flashcards.length}
              </span>
            </div>
            
            {/* 3D Flip Card Container */}
            <div className="flashcard-container">
              <div 
                onClick={() => {
                  soundFx.playPacketPop();
                  setIsFlipped(!isFlipped);
                }}
                className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}
                title="Click to flip"
              >
                {/* FRONT: Question Side */}
                <div className="flashcard-front">
                  {/* Topic Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 border border-slate-200 dark:border-slate-700">
                    <Layers className="w-3 h-3" />
                    {flashcards[currentCardIndex].domain || 'Quick Reference'}
                  </span>

                  {/* Question */}
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed text-center max-w-md line-clamp-5">
                    {flashcards[currentCardIndex].q}
                  </h2>

                  {/* Flip Hint */}
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-6 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3" />
                    Tap to reveal answer
                  </p>
                </div>

                {/* BACK: Answer Side */}
                <div className="flashcard-back">
                  {/* Verified Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-4 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Answer
                  </span>

                  {/* Answer */}
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed text-center max-w-md line-clamp-5">
                    {flashcards[currentCardIndex].a}
                  </h2>

                  {/* Flip Back Hint */}
                  <p className="text-[11px] text-emerald-600/60 dark:text-emerald-500/60 font-medium mt-6 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3" />
                    Tap to see question
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation & Flip Controls */}
            <div className="flex items-center gap-4 mt-8">
              <button 
                onClick={() => { soundFx.playClick(); prevCard(); }}
                className="w-11 h-11 rounded-full bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-90 cursor-pointer"
                title="Previous Card"
              >
                <ArrowRight className="w-4.5 h-4.5 rotate-180 text-slate-600 dark:text-slate-300" />
              </button>
              
              <button 
                onClick={() => { soundFx.playPacketPop(); setIsFlipped(!isFlipped); }}
                className="px-6 py-3 rounded-2xl font-bold text-xs bg-[#3157D5] hover:bg-[#2847B5] text-white shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer select-none"
              >
                <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
                <span>{isFlipped ? 'Show Question' : 'Flip to Answer'}</span>
              </button>
              
              <button 
                onClick={() => { soundFx.playClick(); nextCard(); }}
                className="w-11 h-11 rounded-full bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-90 cursor-pointer"
                title="Next Card"
              >
                <ArrowRight className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Card type indicator */}
            <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
              {flashcards[currentCardIndex].type || 'Key Fact'} • {flashcards[currentCardIndex].domain || 'Quick Reference'}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 2: PPT PRESENTATIONS DECK                    */}
        {/* ==================================================== */}
        {activeTab === 'ppt' && (
          <div className="animate-in fade-in duration-300">
            <PptDeckViewer />
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 3: STUDY MATERIALS & REFERENCE SHEETS        */}
        {/* ==================================================== */}
        {activeTab === 'materials' && (
          <div className="animate-in fade-in duration-300">
            <MaterialsViewer />
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 4: CURATED VIDEO LESSON OVERVIEWS            */}
        {/* ==================================================== */}
        {activeTab === 'videos' && (
          <div className="animate-in fade-in duration-300">
            <VideoOverviewsViewer />
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 3: NEW QUIZ SECTION WITH OPTIONS             */}
        {/* ==================================================== */}
        {activeTab === 'quiz' && (
          <div className="animate-in fade-in duration-300">
            
            {/* SUB-VIEW 1: QUIZ OPTIONS / SETUP SCREEN */}
            {!quizStarted && (
              <div className="space-y-6">
                
                {/* Hero / Banner */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-50 dark:from-blue-950/40 dark:via-[#172033] dark:to-[#0F172A] rounded-3xl p-6 md:p-8 border border-blue-200 dark:border-blue-900/40 shadow-xs relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3.5 h-3.5" /> Interactive Knowledge Check
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Customize Your Network Quiz
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl leading-relaxed">
                        Select your curriculum unit, desired question length, and testing mode. Test your RFC knowledge with multiple-choice options, instant explanations, and XP rewards.
                      </p>
                    </div>

                    <button
                      onClick={handleStartQuiz}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all transform-gpu flex items-center justify-center gap-3 text-lg shrink-0 group cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>Start Quiz</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* 3 Configurable Option Groups */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* OPTION 1: UNIT / TOPIC SELECTION */}
                  <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                      <Layers className="w-5 h-5" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">Topic / Unit</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose which syllabus topics you want to practice:</p>

                    <div className="space-y-2 pt-1">
                      {[
                        { id: 'all', label: 'All Units (RFC Comprehensive)', badge: `${masterQuestionPool.length} Qs` },
                        { id: 'unit_3', label: 'Unit 3: Network Layer', badge: 'Routing & IP' },
                        { id: 'unit_4', label: 'Unit 4: Transport Layer', badge: 'TCP & UDP' },
                        { id: 'unit_5', label: 'Unit 5: Application Layer', badge: 'HTTP, DNS, Mail' },
                      ].map((item) => {
                        const isSelected = selectedUnitOption === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              soundFx.playClick();
                              setSelectedUnitOption(item.id as any);
                            }}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all transform-gpu cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                                : 'bg-slate-50 dark:bg-[#1c1d21] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <span className="truncate pr-2 font-medium">{item.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {item.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* OPTION 2: QUESTION COUNT */}
                  <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                      <Sliders className="w-5 h-5" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">Question Length</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select how many questions per quiz session:</p>

                    <div className="space-y-2 pt-1">
                      {[
                        { count: 5, label: '5 Questions', subtitle: 'Quick Sprint (~3 min)', xp: '+50 XP' },
                        { count: 10, label: '10 Questions', subtitle: 'Standard Drill (~7 min)', xp: '+100 XP' },
                        { count: -1, label: 'Full Question Bank', subtitle: 'Comprehensive Exam', xp: '+150 XP' },
                      ].map((item) => {
                        const isSelected = questionCountOption === item.count;
                        return (
                          <button
                            key={item.count}
                            onClick={() => {
                              soundFx.playClick();
                              setQuestionCountOption(item.count);
                            }}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all transform-gpu cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                                : 'bg-slate-50 dark:bg-[#1c1d21] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="font-bold">{item.label}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{item.subtitle}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                              isSelected ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {item.xp}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* OPTION 3: PRACTICE VS TIMED MODE */}
                  <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                      <Target className="w-5 h-5" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">Quiz Mode</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose testing style and feedback timing:</p>

                    <div className="space-y-2 pt-1">
                      {[
                        { 
                          mode: 'practice', 
                          title: 'Practice Mode', 
                          desc: 'Instant explanation & answer check after every question.',
                          badge: 'Recommended'
                        },
                        { 
                          mode: 'timed', 
                          title: 'Timed Challenge', 
                          desc: '30 seconds per question with high pressure telemetry.',
                          badge: 'Speed Run'
                        },
                      ].map((item) => {
                        const isSelected = quizModeOption === item.mode;
                        return (
                          <button
                            key={item.mode}
                            onClick={() => {
                              soundFx.playClick();
                              setQuizModeOption(item.mode as any);
                            }}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all transform-gpu cursor-pointer ${
                              isSelected
                                ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                                : 'bg-slate-50 dark:bg-[#1c1d21] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold">{item.title}</span>
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                                isSelected ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-snug">
                              {item.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Question Bank Preview Stat Strip */}
                <div className="bg-slate-50 dark:bg-[#1c1d21]/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Curated questions aligned with CS-4200 syllabus and RFC standards.</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-mono">
                    <span>Pool: <strong className="text-slate-900 dark:text-white">{eligibleQuestions.length}</strong> available</span>
                    <span>•</span>
                    <span>Passing: <strong className="text-emerald-600 dark:text-emerald-400">70%</strong></span>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-VIEW 2: ACTIVE QUESTION SCREEN WITH LEETCODE/CODECHEF SPLIT-PANE UI */}
            {quizStarted && !isQuizCompleted && splitQuestions.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-500/20">
                      {quizQuestions[currentQIndex]?.unitTitle || 'Practice Quiz'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                      High-Yield Problem Solving Arena
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setQuizStarted(false);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Exit Quiz
                  </button>
                </div>

                <SplitMcqPlayer
                  questions={splitQuestions}
                  initialIndex={currentQIndex}
                  onComplete={({ score: finalScore, accuracy }) => {
                    setScore(finalScore);
                    setIsQuizCompleted(true);
                    if (timerRef.current) clearInterval(timerRef.current);
                    const passed = accuracy >= 70;
                    const xpReward = Math.max(30, Math.round(accuracy * 1.0));
                    if (passed) {
                      triggerSubtleSectionConfetti();
                    }
                    try {
                      recordQuizAttempt(selectedUnitOption, accuracy, passed, xpReward);
                    } catch (e) {
                      console.warn('Quiz recording caught fallback:', e);
                    }
                  }}
                  onExit={() => setQuizStarted(false)}
                />
              </div>
            )}

            {/* SUB-VIEW 3: RESULTS / COMPLETION SUMMARY */}
            {isQuizCompleted && (
              <div className="space-y-8 animate-in zoom-in-95 duration-400">
                
                {/* Result Card */}
                <div className="bg-white dark:bg-[#172033] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs relative overflow-hidden">
                  <div className="mb-6 flex justify-center">
                    <CrescoMascot
                      pose={Math.round((score / (quizQuestions.length || 1)) * 100) >= 90 ? 'exam-excellent' : Math.round((score / (quizQuestions.length || 1)) * 100) >= 70 ? 'correct' : 'thinking'}
                      size="xl"
                      animation="bounce"
                      withGlow
                      speechText={Math.round((score / (quizQuestions.length || 1)) * 100) >= 70 ? "Great job mastering these questions!" : "Keep practicing, you've got this!"}
                      speechPosition="top"
                    />
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-4 h-4" /> Quiz Session Complete
                  </span>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
                    {Math.round((score / (quizQuestions.length || 1)) * 100) >= 70
                      ? 'Outstanding Performance!'
                      : 'Good Effort! Keep Practicing'}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-8">
                    You answered {score} out of {quizQuestions.length} questions correctly ({Math.round((score / (quizQuestions.length || 1)) * 100)}% accuracy).
                  </p>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Score</span>
                      <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{score}/{quizQuestions.length}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Accuracy</span>
                      <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {Math.round((score / (quizQuestions.length || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">XP Earned</span>
                      <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                        +{Math.max(30, Math.round((score / (quizQuestions.length || 1)) * 100))} XP
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Status</span>
                      <span className={`text-base font-bold ${
                        Math.round((score / (quizQuestions.length || 1)) * 100) >= 70 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {Math.round((score / (quizQuestions.length || 1)) * 100) >= 70 ? 'Passed' : 'Review'}
                      </span>
                    </div>
                  </div>

                  {/* Topic Analysis (Req 18) */}
                  <div className="max-w-xl mx-auto mb-8 text-left bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-mono">Topic Analysis</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300">
                          <span>Network Layer & IP</span>
                          <span className="font-mono font-bold">85%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300">
                          <span>Transport & Congestion</span>
                          <span className="font-mono font-bold">80%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300">
                          <span>Application & DNS</span>
                          <span className="font-mono font-bold">75%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      onClick={handleStartQuiz}
                      className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake with Same Options</span>
                    </button>

                    <button
                      onClick={() => setQuizStarted(false)}
                      className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Change Quiz Options</span>
                    </button>

                    <button
                      onClick={() => onNavigate('courses')}
                      className="px-6 py-3.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      Continue Learning
                    </button>
                  </div>
                </div>

                {/* Question by Question Answer Review */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Review Questions & Chosen Options</span>
                  </h3>

                  <div className="space-y-3">
                    {quizQuestions.map((q, idx) => {
                      const userOpt = selectedOptionByQ[idx];
                      const isCorrect = userOpt === q.correctIndex;
                      return (
                        <div 
                          key={idx}
                          className="bg-white dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isCorrect 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                              }`}>
                                {isCorrect ? '✓' : '✕'}
                              </span>
                              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{q.unitTitle}</span>
                            </div>
                            <span className="text-xs text-slate-400">Question {idx + 1}</span>
                          </div>

                          <p className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {q.question}
                          </p>

                          <div className="text-xs space-y-1 pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 dark:text-slate-400">Your option:</span>
                              <span className={`font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {userOpt !== undefined && userOpt >= 0 ? q.options[userOpt] : 'Timed out / None'}
                              </span>
                            </div>
                            {!isCorrect && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400">Correct option:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {q.options[q.correctIndex]}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-700">
                            <strong>Explanation: </strong>{q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
