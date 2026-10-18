import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavTab } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Bookmark, 
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { CrescoMascot } from '../brand/CrescoMascot';
import { UNIT_CHALLENGES } from '../../data/unitQuizzes';
import { ALL_MODULE_QUIZ_QUESTIONS } from '../../data/courseContent';
import { useAuth } from '../../context/AuthContext';
import { recordLearningEvent } from '../../services/learningEventService';
import { 
  evaluateAssessmentSubmission, 
  AssessmentQuestion, 
  AssessmentSubmission, 
  AssessmentEvaluationResult 
} from '../../services/assessmentScoringService';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';

interface ExamModeViewProps {
  onNavigate: (tab: NavTab) => void;
}

interface ExamConfig {
  id: string;
  title: string;
  unit: string;
  unitId: string;
  timeMinutes: number;
  difficulty: 'Standard' | 'Advanced' | 'Comprehensive';
  description: string;
}

export const ExamModeView: React.FC<ExamModeViewProps> = ({ onNavigate }) => {
  const { currentUser, recordQuizAttempt } = useAuth();
  const [viewState, setViewState] = useState<'hub' | 'exam' | 'results'>('hub');
  const [selectedExam, setSelectedExam] = useState<ExamConfig | null>(null);

  // Exam Questions & State
  const [examQuestions, setExamQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(60 * 25);
  const [attemptId, setAttemptId] = useState<string>('');
  const [startedAt, setStartedAt] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<AssessmentEvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Guard against duplicate submission and duplicate telemetry
  const submissionLockRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);

  const examOptions: ExamConfig[] = [
    {
      id: 'unit-3-test',
      title: 'UNIT III TEST',
      unit: 'Network Layer',
      unitId: 'unit_3',
      timeMinutes: 25,
      difficulty: 'Standard',
      description: 'Routing algorithms, distance vector, link state, IP addressing, CIDR, and QoS.',
    },
    {
      id: 'unit-4-test',
      title: 'UNIT IV TEST',
      unit: 'Transport Layer',
      unitId: 'unit_4',
      timeMinutes: 25,
      difficulty: 'Standard',
      description: 'TCP 3-way handshake, sequence tracking, UDP datagrams, SSL/TLS, and flow control.',
    },
    {
      id: 'unit-5-test',
      title: 'UNIT V TEST',
      unit: 'Application Layer',
      unitId: 'unit_5',
      timeMinutes: 25,
      difficulty: 'Standard',
      description: 'DNS recursion, HTTP/HTTPS headers, electronic mail SMTP/IMAP, and web security.',
    },
    {
      id: 'full-mock',
      title: 'FULL SYLLABUS MOCK TEST',
      unit: 'Units III, IV & V',
      unitId: 'all',
      timeMinutes: 50,
      difficulty: 'Comprehensive',
      description: 'Comprehensive timed examination spanning all layer 3, 4, and 5 syllabus specifications.',
    },
  ];

  // Helper to load real curriculum questions for the selected exam
  const loadExamQuestions = (exam: ExamConfig): AssessmentQuestion[] => {
    let rawList: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      topic?: string;
      moduleId?: string;
      unitId?: string;
    }> = [];

    if (exam.unitId === 'unit_3' || exam.unitId === 'unit-3') {
      const challenge = UNIT_CHALLENGES['unit_3'] || UNIT_CHALLENGES['unit-3'];
      if (challenge) rawList = challenge.questions;
    } else if (exam.unitId === 'unit_4' || exam.unitId === 'unit-4') {
      const challenge = UNIT_CHALLENGES['unit_4'] || UNIT_CHALLENGES['unit-4'];
      if (challenge) rawList = challenge.questions;
    } else if (exam.unitId === 'unit_5' || exam.unitId === 'unit-5') {
      const challenge = UNIT_CHALLENGES['unit_5'] || UNIT_CHALLENGES['unit-5'];
      if (challenge) rawList = challenge.questions;
    } else {
      // Full mock: combine all module quiz questions from syllabus
      rawList = ALL_MODULE_QUIZ_QUESTIONS.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        topic: q.moduleTitle,
        moduleId: q.moduleId,
        unitId: q.unitId
      }));
    }

    // Map to canonical AssessmentQuestion format
    return rawList.map((q, idx) => ({
      id: q.id || `exam-q-${idx}`,
      type: 'single_choice' as const,
      prompt: q.question,
      options: q.options,
      correctOptionIndex: q.correctIndex,
      explanation: q.explanation,
      unitId: q.unitId || exam.unitId,
      moduleId: q.moduleId,
      conceptReference: q.topic,
      points: 1
    }));
  };

  // Timer during active exam
  useEffect(() => {
    if (viewState === 'exam' && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState, secondsRemaining]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartExam = (exam: ExamConfig) => {
    soundFx.playClick();
    setSelectedExam(exam);
    const questions = loadExamQuestions(exam);
    setExamQuestions(questions);
    setSecondsRemaining(exam.timeMinutes * 60);
    setSelectedAnswers({});
    setMarkedForReview({});
    setCurrentQuestionIndex(0);
    setEvaluationResult(null);
    submissionLockRef.current = false;
    setIsSubmitting(false);

    const newAttemptId = `exam_${exam.id}_${Date.now()}`;
    setAttemptId(newAttemptId);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setViewState('exam');

    // Emit ASSESSMENT_STARTED telemetry
    if (currentUser?.uid) {
      recordLearningEvent({
        eventType: 'ASSESSMENT_STARTED',
        courseId: 'cs-4200',
        unitId: exam.unitId !== 'all' ? exam.unitId : undefined,
        assessmentId: exam.id,
        studentId: currentUser.uid,
        metadata: {
          attemptNumber: 1,
          questionCount: questions.length
        }
      }).catch(err => console.warn('[ExamMode] Telemetry start warning:', err));
    }
  };

  const handleSelectOption = (optIndex: number) => {
    soundFx.playClick();
    const currentQ = examQuestions[currentQuestionIndex];
    if (!currentQ) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex,
    }));

    // Record question answered telemetry
    if (currentUser?.uid && selectedExam) {
      recordLearningEvent({
        eventType: 'QUESTION_ANSWERED',
        courseId: 'cs-4200',
        unitId: selectedExam.unitId !== 'all' ? selectedExam.unitId : undefined,
        assessmentId: selectedExam.id,
        studentId: currentUser.uid,
        metadata: {
          questionId: currentQ.id,
          selectedAnswer: optIndex
        }
      }).catch(err => console.warn('[ExamMode] Telemetry question warning:', err));
    }
  };

  const handleToggleMark = () => {
    soundFx.playClick();
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex],
    }));
  };

  const handleAutoSubmitOnTimeout = () => {
    executeSubmission();
  };

  const handleRequestSubmit = () => {
    soundFx.playClick();
    setShowConfirmModal(true);
  };

  const executeSubmission = async () => {
    if (submissionLockRef.current || isSubmitting) return;
    submissionLockRef.current = true;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const submission: AssessmentSubmission = {
        assessmentId: selectedExam?.id || 'formal-exam',
        studentId: currentUser?.uid || 'guest_student',
        attemptId: attemptId || `exam_${Date.now()}`,
        mode: 'formal_assessment',
        unitId: selectedExam?.unitId,
        startedAt,
        submittedAt: new Date().toISOString(),
        responses: examQuestions.map(q => ({
          questionId: q.id,
          response: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : null
        }))
      };

      // Authoritative evaluation via deterministic scoring service
      const evalResult = evaluateAssessmentSubmission(submission, examQuestions);
      setEvaluationResult(evalResult);

      const passed = evalResult.percentageScore >= 70;
      const xpReward = Math.max(30, Math.round(evalResult.percentageScore * 1.5));

      if (passed) {
        soundFx.playSuccess();
        triggerSubtleSectionConfetti();
      } else {
        soundFx.playClick();
      }

      // Persist genuine attempt to AuthContext
      if (selectedExam) {
        try {
          await recordQuizAttempt(
            selectedExam.unitId,
            evalResult.percentageScore,
            passed,
            xpReward
          );
        } catch (e) {
          console.warn('[ExamMode] Fallback recording error:', e);
        }
      }

      // Emit canonical ASSESSMENT_COMPLETED telemetry
      if (currentUser?.uid && selectedExam) {
        recordLearningEvent({
          eventType: 'ASSESSMENT_COMPLETED',
          courseId: 'cs-4200',
          unitId: selectedExam.unitId !== 'all' ? selectedExam.unitId : undefined,
          assessmentId: selectedExam.id,
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
        }).catch(err => console.warn('[ExamMode] Telemetry completed warning:', err));
      }

      setViewState('results');
    } catch (err) {
      console.error('[ExamMode] Evaluation error:', err);
      submissionLockRef.current = false;
      setIsSubmitting(false);
      alert('An error occurred during evaluation. Please try again.');
    }
  };

  const currentQ = examQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = examQuestions.length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
      
      {/* ================= VIEW 1: EXAM HUB ================= */}
      {viewState === 'hub' && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CrescoMascot pose="exam-mode" size="lg" animation="float" />
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest">
                  <GraduationCap size={16} />
                  <span>FORMAL ASSESSMENT (ASSESS STAGE)</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                  Exam Mode
                </h1>
                <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
                  Authoritative timed assessments evaluated objectively against curriculum standards.
                </p>
              </div>
            </div>

            <div className="px-4 py-2 bg-[#F7F5F0] dark:bg-[#111827] rounded-2xl border border-[#E5E0D8] dark:border-slate-700 text-xs font-mono font-bold text-[#64748B]">
              Deterministic Scoring Engine
            </div>
          </div>

          {/* Exam Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {examOptions.map((exam) => {
              const questions = loadExamQuestions(exam);
              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 hover:border-[#3157D5] dark:hover:border-[#6D8CFF] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#3157D5]/10 text-[#3157D5] dark:text-[#6D8CFF] text-[10px] font-mono font-bold uppercase tracking-wider">
                        {exam.unit}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                        <Clock size={13} /> {exam.timeMinutes} Mins
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#172033] dark:text-[#F9FAFB]">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#EFECE6] dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs font-mono text-slate-500">
                      <span><strong>{questions.length}</strong> Questions</span>
                      <span className="mx-2">•</span>
                      <span>Pass: <strong>70%</strong></span>
                    </div>

                    <button
                      onClick={() => handleStartExam(exam)}
                      disabled={questions.length === 0}
                      className="px-5 py-2.5 rounded-xl bg-[#3157D5] hover:bg-[#2442B0] text-white text-xs font-black tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>START EXAM</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ================= VIEW 2: ACTIVE EXAM ================= */}
      {viewState === 'exam' && currentQ && (
        <div className="space-y-6">
          
          {/* Top Bar: Progress, Timer, Action */}
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-[#3157D5]/10 text-[#3157D5] dark:text-[#6D8CFF] font-mono text-xs font-black uppercase">
                {selectedExam?.title}
              </span>
              <span className="text-xs font-mono text-[#64748B] dark:text-slate-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 font-mono font-black text-sm px-3 py-1.5 rounded-xl border ${
                secondsRemaining < 300 
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-600 animate-pulse'
                  : 'bg-[#F7F5F0] dark:bg-slate-800 border-[#E5E0D8] dark:border-slate-700 text-[#172033] dark:text-white'
              }`}>
                <Clock size={16} />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <button
                onClick={handleRequestSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Exam'}
              </button>
            </div>
          </div>

          {/* Main Layout: Question Canvas & Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left 3 Cols: Question Details */}
            <div className="lg:col-span-3 bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between min-h-[480px]">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <span>{currentQ.conceptReference ? `Topic: ${currentQ.conceptReference}` : 'Curriculum Standard'}</span>
                  <span className="text-[#3157D5] dark:text-[#6D8CFF] font-black">1.0 Mark</span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-[#172033] dark:text-[#F9FAFB] leading-relaxed">
                  {currentQuestionIndex + 1}. {currentQ.prompt}
                </h2>

                {/* Options List */}
                <div className="space-y-3 pt-2" role="radiogroup" aria-label="Answer options">
                  {currentQ.type === 'single_choice' && currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === optIdx;
                    const letters = ['A', 'B', 'C', 'D', 'E'];

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-semibold transition-all cursor-pointer flex items-center gap-4 focus-visible:ring-2 focus-visible:ring-[#3157D5] ${
                          isSelected
                            ? 'bg-[#3157D5]/10 border-[#3157D5] text-[#172033] dark:text-[#F9FAFB] shadow-xs'
                            : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                          isSelected ? 'bg-[#3157D5] text-white' : 'bg-[#F7F5F0] dark:bg-slate-800 text-[#64748B]'
                        }`}>
                          {letters[optIdx] || optIdx + 1}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar: Previous, Mark for Review, Next */}
              <div className="pt-6 border-t border-[#EFECE6] dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] dark:border-slate-700 text-xs font-bold text-[#64748B] hover:bg-[#F7F5F0] disabled:opacity-40 cursor-pointer"
                >
                  ← Previous
                </button>

                <button
                  onClick={handleToggleMark}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    markedForReview[currentQuestionIndex]
                      ? 'bg-amber-500 text-white'
                      : 'bg-[#F7F5F0] dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                  }`}
                >
                  <Bookmark size={14} />
                  <span>{markedForReview[currentQuestionIndex] ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>

                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="px-6 py-2.5 rounded-xl bg-[#3157D5] hover:bg-[#2442B0] text-white text-xs font-black tracking-wider cursor-pointer shadow-xs disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Right 1 Col: Question Navigation Palette */}
            <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Question Palette
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {examQuestions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isMarked = markedForReview[idx];
                  const isCurrent = idx === currentQuestionIndex;

                  let bgClass = 'bg-[#F7F5F0] dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                  if (isAnswered) {
                    bgClass = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-400';
                  }
                  if (isMarked) {
                    bgClass = 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-400';
                  }
                  if (isCurrent) {
                    bgClass += ' ring-2 ring-[#3157D5] dark:ring-[#6D8CFF] font-black';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-xl border text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                      title={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-[#EFECE6] dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                  <span>Marked for Review ({Object.values(markedForReview).filter(Boolean).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#F7F5F0] dark:bg-slate-800 border inline-block"></span>
                  <span>Unanswered ({unansweredCount})</span>
                </div>
              </div>
            </div>

          </div>

          {/* Submission Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-slate-200 dark:border-slate-700 shadow-xl space-y-5">
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                  <AlertCircle size={28} />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Confirm Submission
                  </h3>
                </div>

                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.
                  </p>
                  {unansweredCount > 0 && (
                    <p className="text-amber-600 dark:text-amber-400 font-semibold">
                      ⚠️ You have {unansweredCount} unanswered question(s). Unanswered questions will receive 0 points.
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Once submitted, your responses will be scored authoritatively against the syllabus rubric.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Continue Exam
                  </button>
                  <button
                    onClick={executeSubmission}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? 'Evaluating...' : 'Confirm & Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= VIEW 3: EXAM RESULTS ================= */}
      {viewState === 'results' && evaluationResult && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#35A86B] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFECE6] dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-black text-[#35A86B] uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  OBJECTIVE ASSESSMENT EVALUATION
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                  {selectedExam?.title} Results
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Attempt ID: <code className="font-mono">{evaluationResult.attemptId}</code>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#64748B] block">TOTAL SCORE</span>
                  <span className="text-3xl font-black text-[#3157D5] dark:text-[#6D8CFF] font-mono">
                    {evaluationResult.totalPointsEarned} / {evaluationResult.totalPointsPossible}{' '}
                    <span className={`text-base ${evaluationResult.percentageScore >= 70 ? 'text-[#35A86B]' : 'text-amber-500'}`}>
                      ({evaluationResult.percentageScore}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Score Metrics Strip — Genuine Values from evaluationResult */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">CORRECT</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {evaluationResult.correctCount}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800">
                <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block">INCORRECT</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {evaluationResult.incorrectCount}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 font-bold block">UNANSWERED</span>
                <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
                  {evaluationResult.unansweredCount}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800">
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold block">STATUS</span>
                <span className={`text-xl font-black ${evaluationResult.percentageScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {evaluationResult.percentageScore >= 70 ? 'PASSED' : 'NEEDS REVIEW'}
                </span>
              </div>
            </div>

            {/* Question by Question Detailed Feedback */}
            <div className="space-y-4 pt-4 border-t border-[#EFECE6] dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen size={18} className="text-[#3157D5]" />
                <span>Question Review & Curriculum Explanations</span>
              </h3>

              <div className="space-y-4">
                {evaluationResult.questionResults.map((qr, idx) => {
                  const originalQ = examQuestions.find(q => q.id === qr.questionId);
                  const isCorrect = qr.status === 'correct';
                  const isUnanswered = qr.status === 'unanswered';

                  return (
                    <div
                      key={qr.questionId}
                      className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                        isCorrect
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                          : isUnanswered
                          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              Q{idx + 1}
                            </span>
                            {isCorrect ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                Correct (+{qr.pointsEarned} pts)
                              </span>
                            ) : isUnanswered ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                Unanswered (0 pts)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                                Incorrect (0 pts)
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {originalQ?.prompt}
                          </p>
                        </div>
                      </div>

                      {/* Disclosed Correct Answer post-submission */}
                      {originalQ?.type === 'single_choice' && (
                        <div className="text-xs space-y-1 pt-1 font-sans">
                          {qr.userResponse !== null && (
                            <p className="text-slate-600 dark:text-slate-400">
                              <strong>Your response:</strong> Option {Number(qr.userResponse) + 1} — {originalQ.options[Number(qr.userResponse)]}
                            </p>
                          )}
                          {!isCorrect && (
                            <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                              <strong>Correct response:</strong> Option {Number(qr.correctAnswer) + 1} — {originalQ.options[Number(qr.correctAnswer)]}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Explanation from Curriculum */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl">
                        <strong className="text-slate-900 dark:text-white block mb-1">Pedagogical Explanation:</strong>
                        {qr.explanation}
                      </div>

                      {/* Navigation back to Lesson if module reference exists */}
                      {originalQ?.moduleId && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => onNavigate('lesson-player')}
                            className="text-xs font-bold text-[#3157D5] dark:text-[#6D8CFF] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Review associated lesson</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Back to Hub / Review Options */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#EFECE6] dark:border-slate-800">
              <button
                onClick={() => setViewState('hub')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ← Return to Exam Hub
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('practice')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Practice Weak Topics
                </button>
                <button
                  onClick={() => onNavigate('courses')}
                  className="px-5 py-2.5 rounded-xl bg-[#3157D5] hover:bg-[#2442B0] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Return to Syllabus
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
