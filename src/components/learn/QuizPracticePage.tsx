import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  Flame, 
  Trophy, 
  RotateCcw,
  Check
} from 'lucide-react';
import { ModularLesson, QuizQuestion } from '../../data/lessons/lessonModel';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';

interface QuizPracticePageProps {
  lesson: ModularLesson;
  onNext: () => void;
  onPrev: () => void;
}

export const QuizPracticePage: React.FC<QuizPracticePageProps> = ({
  lesson,
  onNext,
  onPrev
}) => {
  const quiz = lesson.quiz;
  const questions: QuizQuestion[] = quiz.questions;

  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [answeredState, setAnsweredState] = useState<Record<number, { selected: 'A' | 'B' | 'C' | 'D'; isCorrect: boolean }>>({});
  const [streakCount, setStreakCount] = useState(2);
  const [secondsElapsed, setSecondsElapsed] = useState(84); // 01:24 baseline

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQ = questions[questionIdx] || questions[0];
  const totalQuestions = questions.length;
  const answeredInfo = answeredState[questionIdx];
  const isAnswered = !!answeredInfo;

  // Compute live score
  const totalCorrect = Object.values(answeredState).filter((s) => s.isCorrect).length;
  const totalAnswered = Object.keys(answeredState).length;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return;
    setSelectedOption(optId);

    const isCorrect = optId === currentQ.correctOptionId;
    if (isCorrect) {
      soundFx.playCorrect();
      triggerSubtleSectionConfetti();
      setStreakCount((prev) => prev + 1);
    } else {
      soundFx.playIncorrect();
      setStreakCount(0);
    }

    setAnsweredState((prev) => ({
      ...prev,
      [questionIdx]: { selected: optId, isCorrect }
    }));
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    if (questionIdx < totalQuestions - 1) {
      setQuestionIdx(questionIdx + 1);
      setSelectedOption(null);
    } else {
      onNext();
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 1. QUIZ HEADER STRIP WITH PROGRESS BAR                                    */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            ✍️
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {quiz.title}
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {quiz.subtitle}
            </p>
          </div>
        </div>

        {/* Progress pill & bar */}
        <div className="w-full sm:w-60 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-400">
            <span>Question {questionIdx + 1} of {totalQuestions}</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {Math.round(((questionIdx + 1) / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${((questionIdx + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN QUIZ AREA: QUESTION CARD (LEFT) + WIDGETS (RIGHT)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Active MCQ Question Card */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          
          {/* Question Text */}
          <div>
            <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider mb-3">
              MCQ
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options.map((option) => {
              const isSelected = (selectedOption === option.id) || (answeredInfo?.selected === option.id);
              const isCorrectAnswer = option.id === currentQ.correctOptionId;

              let optionStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-800 dark:text-slate-200';

              if (isAnswered) {
                if (isCorrectAnswer) {
                  optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-300';
                } else {
                  optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-500';
                }
              } else if (isSelected) {
                optionStyle = 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isAnswered && isCorrectAnswer
                          ? 'bg-emerald-500 text-white'
                          : isAnswered && isSelected && !isCorrectAnswer
                          ? 'bg-rose-500 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {option.id}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {option.text}
                    </span>
                  </div>

                  {isAnswered && isCorrectAnswer && (
                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrectAnswer && (
                    <XCircle size={20} className="text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 animate-slideUp">
              <div className="flex items-center gap-2 text-xs font-black text-blue-700 dark:text-blue-300 mb-1">
                <span>📘 Explanation:</span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Widgets matching Panel 3 in User Mockup */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Mascot Celebration Card */}
          <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="size-16 shrink-0 relative">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Octo Reaction"
                className="size-full object-contain filter drop-shadow-xs animate-octo-float"
              />
            </div>
            <div>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block">
                {answeredInfo?.isCorrect ? 'Amazing!' : isAnswered ? 'Keep going!' : 'Think carefully!'}
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 leading-snug">
                {answeredInfo?.isCorrect ? 'You got it right! 🌟' : isAnswered ? 'Review the explanation!' : lesson.octoQuizSpeech}
              </p>
            </div>
          </div>

          {/* Live Scorecard: Score | Time Taken | Streak */}
          <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {totalCorrect}/{Math.max(1, totalAnswered)}
              </span>
            </div>
            <div className="border-x border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Time</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">
                {formatTimer(secondsElapsed)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Streak</span>
              <span className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                <Flame size={14} className="fill-amber-500" />
                <span>{streakCount}</span>
              </span>
            </div>
          </div>

          {/* Question Navigator Circles */}
          <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Question Navigator
            </span>
            <div className="flex items-center gap-2">
              {questions.map((q, idx) => {
                const info = answeredState[idx];
                const isCurrent = idx === questionIdx;

                let circleClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                if (info) {
                  circleClass = info.isCorrect
                    ? 'bg-emerald-500 text-white shadow-2xs'
                    : 'bg-rose-500 text-white';
                } else if (isCurrent) {
                  circleClass = 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-600 shadow-xs';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      soundFx.playClick();
                      setQuestionIdx(idx);
                      setSelectedOption(null);
                    }}
                    className={`size-8 rounded-full font-black text-xs flex items-center justify-center transition-all cursor-pointer ${circleClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-2">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Quick Tips</span>
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {quiz.quickTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1.5 font-medium">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ACTION BAR                                                      */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            soundFx.playClick();
            onPrev();
          }}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          <span>Previous: Simulation</span>
        </button>

        <button
          onClick={handleNextQuestion}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <span>{questionIdx < totalQuestions - 1 ? 'Next Question' : 'Next: Lesson Summary'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};
