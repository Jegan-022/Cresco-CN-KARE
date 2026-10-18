import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavTab } from '../../types';
import { COURSE_UNITS, ALL_MODULES, ALL_PRACTICE_QUESTIONS, QUICK_REFERENCE_FLASHCARDS } from '../../data/courseContent';
import { curriculumCloudService, CloudFlashcardItem } from '../../services/curriculumCloudService';
import { useAuth } from '../../context/AuthContext';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { soundFx } from '../../utils/audio';
import { SplitMcqPlayer, SplitMcqQuestionData } from '../quiz/SplitMcqPlayer';
import { CrescoMascot } from '../brand/CrescoMascot';
import { PptDeckViewer } from '../practice/PptDeckViewer';
import { MaterialsViewer } from '../practice/MaterialsViewer';
import { VideoOverviewsViewer } from '../practice/VideoOverviewsViewer';
import { AdaptationCard } from '../common/AdaptationCard';
import { getBoundaryAdaptation } from '../../services/adaptationService';
import { AdaptationViewModel } from '../../types/adaptationViewModel';
import { recordLearningEvent } from '../../services/learningEventService';
import { executeUnifiedLearningCycle } from '../../services/unifiedLearningLoopService';
import { 
  evaluateAssessmentSubmission, 
  AssessmentQuestion, 
  AssessmentSubmission, 
  AssessmentEvaluationResult 
} from '../../services/assessmentScoringService';
import { MasteryStatusCard } from '../mastery/MasteryStatusCard';
import { evaluateMastery } from '../../services/masteryEngineService';
import { getStudentLearningEvents } from '../../services/learningEventReadService';
import { MasteryEvaluationResult } from '../../types/mastery';
import { RemediationRecommendationsView } from '../remediation/RemediationRecommendationsView';
import { evaluateRemediation } from '../../services/remediationEngineService';
import { trackRemediationStarted } from '../../services/remediationTrackingService';
import { RemediationEvaluationResult } from '../../types/remediation';
import { 
  Bot,
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
  moduleId?: string;
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
  const { recordQuizAttempt, recordPracticeAttempt, currentUser } = useAuth();
  const [quizAdaptation, setQuizAdaptation] = useState<AdaptationViewModel | null>(null);
  const [activeTab, setActiveTab] = useState<PracticeTab>(initialTab);
  const [selectedUnitOption, setSelectedUnitOption] = useState<'all' | 'unit_3' | 'unit_4' | 'unit_5'>('all');
  const [selectedModuleOption, setSelectedModuleOption] = useState<string>('all');
  const [evaluationResult, setEvaluationResult] = useState<AssessmentEvaluationResult | null>(null);
  const [attemptId, setAttemptId] = useState<string>('');
  const [startedAt, setStartedAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const submissionLockRef = useRef<boolean>(false);
  const [unitMasteryMap, setUnitMasteryMap] = useState<Record<string, MasteryEvaluationResult>>({});
  const [isMasteryLoading, setIsMasteryLoading] = useState<boolean>(false);
  const [remediationEvaluation, setRemediationEvaluation] = useState<RemediationEvaluationResult | null>(null);
  const [isRemediationLoading, setIsRemediationLoading] = useState<boolean>(false);

  // Evaluate genuine mastery across units from real student learning events (Step 21 & Step 22)
  useEffect(() => {
    let mounted = true;
    if (currentUser?.uid) {
      setIsMasteryLoading(true);
      setIsRemediationLoading(true);
      getStudentLearningEvents(currentUser.uid, 'cs-4200').then((events) => {
        if (!mounted) return;
        const u3Eval = evaluateMastery({
          studentId: currentUser.uid,
          scopeId: 'unit_3',
          scopeType: 'unit',
          evidence: events,
        });
        const u4Eval = evaluateMastery({
          studentId: currentUser.uid,
          scopeId: 'unit_4',
          scopeType: 'unit',
          evidence: events,
          config: {
            prerequisites: ['unit_3']
          }
        });
        const u5Eval = evaluateMastery({
          studentId: currentUser.uid,
          scopeId: 'unit_5',
          scopeType: 'unit',
          evidence: events,
          config: {
            prerequisites: ['unit_4']
          }
        });
        setUnitMasteryMap({
          unit_3: u3Eval,
          unit_4: u4Eval,
          unit_5: u5Eval,
        });
        setIsMasteryLoading(false);

        // Step 22 Targeted Remediation Evaluation
        const remEval = evaluateRemediation({
          studentId: currentUser.uid,
          scopeId: selectedUnitOption !== 'all' ? selectedUnitOption : 'unit_3',
          courseId: 'cs-4200',
          masteryResult: selectedUnitOption === 'unit_4' ? u4Eval : selectedUnitOption === 'unit_5' ? u5Eval : u3Eval,
          evidence: events,
          recentAssessment: evaluationResult || undefined
        });
        setRemediationEvaluation(remEval);
        setIsRemediationLoading(false);
      }).catch((err) => {
        console.warn('[PracticeView] Mastery evaluation error:', err);
        if (mounted) {
          setIsMasteryLoading(false);
          setIsRemediationLoading(false);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [currentUser?.uid, evaluationResult, selectedUnitOption]);

  // Sync initialTab when prop updates
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Flashcard State derived from cloud storage / Firestore with local syllabus fallback
  const [cloudFlashcards, setCloudFlashcards] = useState<CloudFlashcardItem[]>([]);

  useEffect(() => {
    let mounted = true;
    curriculumCloudService.getFlashcards().then((cards) => {
      if (mounted && cards && cards.length > 0) {
        setCloudFlashcards(cards);
      }
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const flashcards = useMemo(() => {
    if (cloudFlashcards.length > 0) {
      return cloudFlashcards;
    }
    const quick = (QUICK_REFERENCE_FLASHCARDS || []).map((q: any) => ({
      id: 'quick_fallback',
      q: q.q,
      a: q.a,
      domain: 'Quick Reference',
      type: 'Key Fact'
    }));
    const drills = ALL_PRACTICE_QUESTIONS.map(p => ({
      id: p.id,
      q: p.question,
      a: p.answer,
      domain: p.domain,
      type: p.type
    }));
    return [...quick, ...drills];
  }, [cloudFlashcards]);
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
              moduleId: mod.id,
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

  // Filtered pool based on selected unit and module options
  const eligibleQuestions = useMemo(() => {
    let pool = masterQuestionPool;
    if (selectedUnitOption !== 'all') {
      pool = pool.filter(q => q.unitId === selectedUnitOption);
    }
    if (selectedModuleOption !== 'all') {
      pool = pool.filter(q => q.moduleId === selectedModuleOption);
    }
    return pool;
  }, [masterQuestionPool, selectedUnitOption, selectedModuleOption]);

  // Start or Reset a Quiz Session
  const handleStartQuiz = () => {
    soundFx.playClick();
    // Shuffle and slice according to options
    const shuffled = [...eligibleQuestions].sort(() => 0.5 - Math.random());
    const count = questionCountOption === -1 ? shuffled.length : Math.min(questionCountOption, shuffled.length);
    const selected = shuffled.slice(0, count);

    const newAttemptId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setAttemptId(newAttemptId);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    submissionLockRef.current = false;
    setIsSubmitting(false);
    setEvaluationResult(null);

    setQuizQuestions(selected);
    setCurrentQIndex(0);
    setSelectedOptionByQ({});
    setAnsweredByQ({});
    setScore(0);
    setStreak(0);
    setIsQuizCompleted(false);
    setQuizAdaptation(null);
    setQuizStarted(true);
    setSecondsRemaining(30);

    // Telemetry: PRACTICE_STARTED or ASSESSMENT_STARTED
    if (currentUser?.uid) {
      recordLearningEvent({
        eventType: quizModeOption === 'timed' ? 'ASSESSMENT_STARTED' : 'PRACTICE_STARTED',
        courseId: 'cs-4200',
        unitId: selectedUnitOption !== 'all' ? selectedUnitOption : undefined,
        lessonId: selectedModuleOption !== 'all' ? selectedModuleOption : undefined,
        assessmentId: newAttemptId,
        studentId: currentUser.uid,
        metadata: {
          questionCount: selected.length,
          mode: quizModeOption
        }
      }).catch(err => console.warn('[PracticeView] Telemetry start warning:', err));
    }
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

    // Emit question answered telemetry
    if (currentUser?.uid) {
      recordLearningEvent({
        eventType: 'QUESTION_ANSWERED',
        courseId: 'cs-4200',
        unitId: currentQuestion.unitId !== 'general' ? currentQuestion.unitId : undefined,
        lessonId: currentQuestion.moduleId,
        assessmentId: attemptId || 'practice_quiz',
        studentId: currentUser.uid,
        metadata: {
          questionId: currentQuestion.id,
          selectedAnswer: optionIndex,
          correctness: isCorrect
        }
      }).catch(err => console.warn('[PracticeView] Telemetry question warning:', err));
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

  // Finalize quiz with deterministic scoring and telemetry
  const finishQuiz = async () => {
    if (submissionLockRef.current || isSubmitting) return;
    submissionLockRef.current = true;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    if (timerRef.current) clearInterval(timerRef.current);

    const assessmentQuestions: AssessmentQuestion[] = quizQuestions.map(q => ({
      id: q.id,
      type: 'single_choice',
      prompt: q.question,
      options: q.options,
      correctOptionIndex: q.correctIndex,
      explanation: q.explanation,
      moduleId: q.moduleId,
      unitId: q.unitId,
      conceptReference: q.topic,
      points: 1
    }));

    const finalAttemptId = attemptId || `quiz_${Date.now()}`;
    const submission: AssessmentSubmission = {
      assessmentId: `quiz_${selectedUnitOption}`,
      studentId: currentUser?.uid || 'guest_student',
      attemptId: finalAttemptId,
      mode: quizModeOption === 'timed' ? 'formal_assessment' : 'practice',
      unitId: selectedUnitOption !== 'all' ? selectedUnitOption : undefined,
      moduleId: selectedModuleOption !== 'all' ? selectedModuleOption : undefined,
      startedAt: startedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      responses: quizQuestions.map((q, idx) => ({
        questionId: q.id,
        response: selectedOptionByQ[idx] !== undefined && selectedOptionByQ[idx] >= 0
          ? selectedOptionByQ[idx]
          : null
      }))
    };

    try {
      const evalResult = evaluateAssessmentSubmission(submission, assessmentQuestions);
      setEvaluationResult(evalResult);
      setScore(evalResult.correctCount);
      setIsQuizCompleted(true);

      const passed = evalResult.percentageScore >= 70;
      const xpReward = Math.max(30, Math.round(evalResult.percentageScore * 1.0));

      if (passed) {
        soundFx.playSuccess();
        triggerSubtleSectionConfetti();
      }

      // Persist attempt to AuthContext
      if (quizModeOption === 'timed') {
        try {
          await recordQuizAttempt(selectedUnitOption, evalResult.percentageScore, passed, xpReward);
        } catch (e) {
          console.warn('Quiz recording fallback:', e);
        }
      } else {
        try {
          const category = selectedModuleOption !== 'all' ? selectedModuleOption : selectedUnitOption;
          await recordPracticeAttempt(category, evalResult.percentageScore, xpReward);
        } catch (e) {
          console.warn('Practice recording fallback:', e);
        }
      }

      // Emit canonical telemetry
      if (currentUser?.uid) {
        recordLearningEvent({
          eventType: quizModeOption === 'timed' ? 'ASSESSMENT_COMPLETED' : 'PRACTICE_COMPLETED',
          courseId: 'cs-4200',
          unitId: selectedUnitOption !== 'all' ? selectedUnitOption : undefined,
          lessonId: selectedModuleOption !== 'all' ? selectedModuleOption : undefined,
          assessmentId: finalAttemptId,
          studentId: currentUser.uid,
          metadata: {
            score: evalResult.percentageScore,
            correctness: passed,
            totalPointsEarned: evalResult.totalPointsEarned,
            totalPointsPossible: evalResult.totalPointsPossible,
            correctCount: evalResult.correctCount,
            incorrectCount: evalResult.incorrectCount,
            unansweredCount: evalResult.unansweredCount
          }
        }).catch(err => console.warn('[PracticeView] Telemetry complete warning:', err));

        // Step 25: Trigger Unified Adaptive Learning Loop
        executeUnifiedLearningCycle({
          actionId: finalAttemptId,
          actionType: quizModeOption === 'timed' ? 'submit_assessment' : 'submit_practice',
          studentId: currentUser.uid,
          courseId: 'cs-4200',
          unitId: selectedUnitOption !== 'all' ? selectedUnitOption : 'unit_3',
          lessonId: selectedModuleOption !== 'all' ? selectedModuleOption : undefined,
          score: evalResult.percentageScore,
          assessmentResult: evalResult as any
        }).catch(err => console.warn('[PracticeView] Unified learning loop warning:', err));
      }

      // Evaluate pedagogical boundary adaptation (Step 10)
      if (currentUser?.uid) {
        getBoundaryAdaptation(currentUser.uid, {
          courseId: 'cs-4200',
          unitId: selectedUnitOption !== 'all' ? selectedUnitOption : undefined,
          targetScope: 'assessment',
        }).then((res) => {
          if (res) setQuizAdaptation(res);
        }).catch((err) => {
          console.warn('[Adaptation] Non-fatal quiz boundary adaptation error:', err);
        });
      }
    } catch (err) {
      console.error('[PracticeView] Evaluation error:', err);
      submissionLockRef.current = false;
      setIsSubmitting(false);
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

          {/* Evidence-Based Mastery Status (Step 21 - Five Pillars Evaluation) */}
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                EVIDENCE-BASED MASTERY STATUS (FIVE PILLARS EVALUATION)
              </span>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                Governance Status: PENDING ACADEMIC APPROVAL (85% Cutoff)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MasteryStatusCard
                title="Unit 3: Network Layer"
                evaluation={unitMasteryMap['unit_3']}
                isLoading={isMasteryLoading}
                onNavigate={onNavigate}
              />
              <MasteryStatusCard
                title="Unit 4: Transport Layer"
                evaluation={unitMasteryMap['unit_4']}
                isLoading={isMasteryLoading}
                onNavigate={onNavigate}
              />
              <MasteryStatusCard
                title="Unit 5: Application Layer"
                evaluation={unitMasteryMap['unit_5']}
                isLoading={isMasteryLoading}
                onNavigate={onNavigate}
              />
            </div>
          </div>

          {/* Targeted Remediation & Gap Recovery (Step 22) */}
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <RemediationRecommendationsView
              evaluation={remediationEvaluation}
              isLoading={isRemediationLoading}
              onNavigate={onNavigate}
              onAcceptRecommendation={(rec) => {
                if (currentUser?.uid) {
                  trackRemediationStarted(rec, currentUser.uid);
                }
              }}
            />
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

            {/* Contextual AI Tutor Trigger */}
            <button
              type="button"
              onClick={() => {
                const card = flashcards[currentCardIndex];
                window.dispatchEvent(new CustomEvent('cresco:open-ai-tutor', {
                  detail: {
                    courseId: 'cs-4200',
                    conceptTopic: card.domain || 'Networking Protocol Concept',
                    questionPrompt: card.q,
                    explanationSnippet: card.a,
                    actionType: 'explain_concept'
                  }
                }));
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Ask ByteBot to explain this flashcard</span>
            </button>
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
                      disabled={eligibleQuestions.length === 0}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all transform-gpu flex items-center justify-center gap-3 text-lg shrink-0 group cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>{eligibleQuestions.length === 0 ? 'No Questions Available' : 'Start Quiz'}</span>
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

                    {/* Specific Module / Lesson Filter */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <label htmlFor="practice-module-select" className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Drill by Specific Module:
                      </label>
                      <select
                        id="practice-module-select"
                        value={selectedModuleOption}
                        onChange={(e) => {
                          soundFx.playClick();
                          setSelectedModuleOption(e.target.value);
                        }}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                      >
                        <option value="all">All Modules ({eligibleQuestions.length} Qs)</option>
                        {ALL_MODULES.filter(m => selectedUnitOption === 'all' || m.unitId === selectedUnitOption).map(m => (
                          <option key={m.id} value={m.id}>
                            {m.title}
                          </option>
                        ))}
                      </select>
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
                  onComplete={() => {
                    finishQuiz();
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
                      <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                        {evaluationResult ? `${evaluationResult.totalPointsEarned}/${evaluationResult.totalPointsPossible}` : `${score}/${quizQuestions.length}`}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Accuracy</span>
                      <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {evaluationResult ? `${evaluationResult.percentageScore}%` : `${Math.round((score / (quizQuestions.length || 1)) * 100)}%`}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">XP Earned</span>
                      <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                        +{evaluationResult ? Math.max(30, Math.round(evaluationResult.percentageScore * 1.0)) : Math.max(30, Math.round((score / (quizQuestions.length || 1)) * 100))} XP
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Status</span>
                      <span className={`text-base font-bold ${
                        (evaluationResult ? evaluationResult.percentageScore : Math.round((score / (quizQuestions.length || 1)) * 100)) >= 70 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {(evaluationResult ? evaluationResult.percentageScore : Math.round((score / (quizQuestions.length || 1)) * 100)) >= 70 ? 'Passed' : 'Review'}
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

                  {/* Pedagogical Adaptive Guidance (Step 10) */}
                  {quizAdaptation && (
                    <div className="max-w-xl mx-auto mb-8">
                      <AdaptationCard
                        adaptation={quizAdaptation}
                        onDismiss={() => setQuizAdaptation(null)}
                        onAction={(action) => {
                          if (action.targetTab && onNavigate) {
                            onNavigate(action.targetTab);
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Targeted Diagnostic Remediation (Step 22) */}
                  {remediationEvaluation && remediationEvaluation.recommendations.length > 0 && (
                    <div className="max-w-xl mx-auto mb-8 text-left">
                      <RemediationRecommendationsView
                        evaluation={remediationEvaluation}
                        isLoading={false}
                        onNavigate={onNavigate}
                        onAcceptRecommendation={(rec) => {
                          if (currentUser?.uid) {
                            trackRemediationStarted(rec, currentUser.uid);
                          }
                        }}
                      />
                    </div>
                  )}

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

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => onNavigate('lesson-player')}
                              className="text-xs font-bold text-[#3157D5] dark:text-[#6D8CFF] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Review associated lesson in Animated Learning</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
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
