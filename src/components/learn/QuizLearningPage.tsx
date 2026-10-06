import React, { useState, useEffect } from 'react';
import { LevelDefinition, QuizQuestion } from '../../levels/types';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Flame, 
  Clock, 
  Trophy, 
  Sparkles,
  Lightbulb,
  Check
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface QuizLearningPageProps {
  level: LevelDefinition;
  onNext: () => void;
  onPrev: () => void;
  onRecordScore?: (score: number, total: number) => void;
}

export const QuizLearningPage: React.FC<QuizLearningPageProps> = ({
  level,
  onNext,
  onPrev,
  onRecordScore,
}) => {
  const quiz = level.quiz;
  const questions: QuizQuestion[] = quiz.questions;
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const currentQ = questions[currentIdx] || questions[0];

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedOptId = selectedAnswers[currentQ.id];
  const isSelected = Boolean(selectedOptId);
  const isCorrect = selectedOptId && currentQ.options.find(o => o.id === selectedOptId)?.isCorrect;

  const handleSelectOption = (optId: string) => {
    if (selectedAnswers[currentQ.id]) return; // already locked

    const option = currentQ.options.find(o => o.id === optId);
    const correct = option?.isCorrect ?? false;

    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
    setIsAnswered(true);

    if (correct) {
      soundFx.playCorrect();
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
    } else {
      soundFx.playWrong();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setIsAnswered(Boolean(selectedAnswers[questions[currentIdx + 1]?.id]));
    } else {
      if (onRecordScore) {
        onRecordScore(score, questions.length);
      }
      onNext();
    }
  };

  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Quiz Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {quiz.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {quiz.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Quiz Area (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Card (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold w-fit">
            <span>MCQ</span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3 mt-2">
            {currentQ.options.map((opt) => {
              const isChosen = selectedOptId === opt.id;
              const hasAnswered = Boolean(selectedOptId);
              let btnClass = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200';

              if (hasAnswered) {
                if (opt.isCorrect) {
                  btnClass = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30';
                } else if (isChosen && !opt.isCorrect) {
                  btnClass = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30';
                } else {
                  btnClass = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-400';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={hasAnswered}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left text-sm sm:text-base font-semibold transition-all cursor-pointer ${btnClass}`}
                >
                  <span className={`size-8 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center shrink-0 ${
                    hasAnswered && opt.isCorrect
                      ? 'bg-emerald-500 text-white'
                      : hasAnswered && isChosen && !opt.isCorrect
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {hasAnswered && opt.isCorrect ? <Check size={16} /> : opt.id}
                  </span>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Card */}
          {isSelected && (
            <div className={`mt-2 p-5 rounded-2xl border flex flex-col gap-2 animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Lightbulb size={16} className={isCorrect ? 'text-emerald-500' : 'text-amber-500'} />
                <span>Explanation</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Score, Mascot & Question Navigator (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Mascot Encouragement Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800/80 p-5 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="relative size-16 shrink-0 flex items-center justify-center">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Guide Mascot"
                className="w-full h-full object-contain filter drop-shadow-md animate-bounce-up"
              />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                {isSelected ? (isCorrect ? 'Amazing! You got it right! 🎉' : 'Good try! Learn from this! 💡') : 'Think carefully and select your answer!'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every quiz question boosts your network mastery score.
              </p>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Score</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{score}/{questions.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Time</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{formatTimer(elapsedSeconds)}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Streak</span>
              <span className="text-lg font-black text-amber-500 flex items-center justify-center gap-0.5">
                <Flame size={15} />
                {streak}
              </span>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Question Navigator
            </span>
            <div className="flex flex-wrap gap-2.5">
              {questions.map((q, idx) => {
                const ans = selectedAnswers[q.id];
                const isCur = idx === currentIdx;
                let circleClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                if (ans) {
                  const correct = q.options.find(o => o.id === ans)?.isCorrect;
                  circleClass = correct 
                    ? 'bg-emerald-500 text-white shadow-xs' 
                    : 'bg-rose-500 text-white shadow-xs';
                } else if (isCur) {
                  circleClass = 'bg-blue-600 text-white ring-2 ring-blue-500/40';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      soundFx.playClick();
                      setCurrentIdx(idx);
                      setIsAnswered(Boolean(selectedAnswers[q.id]));
                    }}
                    className={`size-9 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${circleClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tips */}
          {quiz.quickTips.length > 0 && (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 p-5 rounded-3xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Lightbulb size={16} />
                <span>Quick Tips</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-1.5 pl-1">
                {quiz.quickTips.map((tip, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-amber-400" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav Action Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            soundFx.playClick();
            onPrev();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Previous: Simulation</span>
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={!isSelected}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all transform shadow-md cursor-pointer ${
            isSelected
              ? 'bg-blue-600 hover:bg-blue-700 hover:scale-102 active:scale-98 shadow-blue-500/25'
              : 'bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed'
          }`}
        >
          <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Next: Lesson Summary'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
