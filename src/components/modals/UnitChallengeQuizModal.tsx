import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UNIT_CHALLENGES, UnitChallenge } from '../../data/unitQuizzes';
import { 
  X, Award, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, 
  RotateCcw, Sparkles, HelpCircle, Lock, Unlock, Clock, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnitChallengeQuizModalProps {
  unitId: 'unit-3' | 'unit-4' | 'unit-5' | 'unit_3' | 'unit_4' | 'unit_5' | string;
  isOpen: boolean;
  onClose: () => void;
  onPassChallenge: (unitId: string, xp: number, unlocksUnitId?: string) => void;
}

export const UnitChallengeQuizModal: React.FC<UnitChallengeQuizModalProps> = ({
  unitId,
  isOpen,
  onClose,
  onPassChallenge,
}) => {
  const challenge = UNIT_CHALLENGES[unitId] || UNIT_CHALLENGES[unitId.replace('_', '-')] || UNIT_CHALLENGES[unitId.replace('-', '_')] || UNIT_CHALLENGES['unit-3'];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen || !challenge) return null;

  const currentQ = challenge.questions[currentIndex];
  const totalQuestions = challenge.questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Calculate results
  const score = challenge.questions.reduce((acc, q, idx) => {
    return answers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const scorePercent = Math.round((score / totalQuestions) * 100);
  const isPassed = scorePercent >= challenge.passingScorePercent;

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    if (isPassed) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#22C55E', '#5B7CFF', '#F59E0B']
      });
      onPassChallenge(unitId, challenge.xpReward, challenge.unlocksUnitId);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-[#0B0D12]/85 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#11141B] rounded-2xl border border-slate-200 dark:border-[#252B36] shadow-2xl w-full max-w-3xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#252B36] flex items-center justify-between bg-slate-50 dark:bg-[#171B24]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B7CFF] bg-[#5B7CFF]/15 border border-[#5B7CFF]/30 px-2.5 py-0.5 rounded-full">
                20-Question Exam Challenge
              </span>
              <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-semibold">
                Pass Mark: {challenge.passingScorePercent}% (14/20)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {challenge.unitTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:text-[#94A3B8] dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-[#252B36] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isSubmitted ? (
            /* Question Active Mode */
            <div className="space-y-6">
              {/* Progress & counter */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-[#94A3B8] mb-2">
                  <span>Question {currentIndex + 1} of {totalQuestions}</span>
                  <span className="text-[#5B7CFF]">{answeredCount} of {totalQuestions} Answered</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#171B24] border border-slate-200 dark:border-[#252B36] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#5B7CFF] h-full transition-all transform-gpu duration-300"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="p-5 bg-slate-50 dark:bg-[#0B0D12] border border-slate-200 dark:border-[#252B36] rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-[#5B7CFF] uppercase tracking-wider font-mono">
                  Topic: {currentQ.topic}
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all transform-gpu flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#5B7CFF] bg-[#5B7CFF]/15 text-[#5B7CFF] dark:text-white font-bold shadow-xs'
                          : 'border-slate-200 dark:border-[#252B36] bg-white dark:bg-[#171B24] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1E2330]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-[#5B7CFF] text-white' : 'bg-slate-100 dark:bg-[#0B0D12] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#252B36]'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#5B7CFF] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Direct Jump Question Grid */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#252B36]">
                <span className="text-[11px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider block mb-2 font-mono">
                  Jump to Question:
                </span>
                <div className="grid grid-cols-10 sm:grid-cols-20 gap-1">
                  {challenge.questions.map((_, idx) => {
                    const isAnswered = answers[idx] !== undefined;
                    const isCurrent = currentIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-7 rounded text-[11px] font-bold transition-all transform-gpu cursor-pointer ${
                          isCurrent
                            ? 'bg-[#5B7CFF] text-white'
                            : isAnswered
                            ? 'bg-[#5B7CFF]/20 text-[#5B7CFF] border border-[#5B7CFF]/40'
                            : 'bg-slate-100 dark:bg-[#171B24] border border-slate-200 dark:border-[#252B36] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Results & Review Mode */
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl text-center space-y-3 border ${
                isPassed ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-slate-900 dark:text-white' : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-slate-900 dark:text-white'
              }`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md ${
                  isPassed ? 'bg-[#22C55E] text-white' : 'bg-[#EF4444] text-white'
                }`}>
                  {isPassed ? <Award className="w-9 h-9" /> : <AlertCircle className="w-9 h-9" />}
                </div>

                <h3 className="text-2xl font-black">
                  {isPassed ? 'Challenge Passed! Outstanding Work!' : 'Score: Needs Review'}
                </h3>

                <div className="flex items-center justify-center space-x-4 font-mono">
                  <span className="text-3xl font-extrabold">{scorePercent}%</span>
                  <span className="text-sm font-semibold opacity-80">({score} / {totalQuestions} Correct)</span>
                </div>

                <p className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed text-slate-600 dark:text-slate-300">
                  {isPassed
                    ? `Congratulations! You scored above the 70% benchmark, unlocking the next curriculum unit and earning +${challenge.xpReward} XP!`
                    : 'A minimum of 70% (14/20) is required to certify mastery of this unit. Review the missed questions below and retake the test!'}
                </p>

                {isPassed && challenge.unlocksUnitId && (
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#22C55E]/20 rounded-xl text-[#22C55E] font-bold text-xs shadow-xs border border-[#22C55E]/40">
                    <Unlock className="w-4 h-4 text-[#22C55E]" />
                    <span>Unlocked: {challenge.unlocksUnitId === 'unit-4' ? 'Unit 4 (Transport Layer)' : 'Unit 5 (Application Layer)'}</span>
                  </div>
                )}
              </div>

              {/* Review missed questions */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Detailed Question Breakdown:</h4>
                {challenge.questions.map((q, qIdx) => {
                  const userAns = answers[qIdx];
                  const isCorrect = userAns === q.correctIndex;
                  return (
                    <div key={q.id} className={`p-4 rounded-xl border text-xs space-y-2 ${
                      isCorrect ? 'bg-slate-50 dark:bg-[#0B0D12] border-slate-200 dark:border-[#252B36]' : 'bg-[#EF4444]/10 border-[#EF4444]/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Q{qIdx + 1}: {q.topic}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCorrect ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                        }`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">{q.question}</p>
                      <div className="text-[11px] space-y-1">
                        <div>
                          <span className="text-slate-500 dark:text-[#94A3B8]">Your Answer:</span>{' '}
                          <span className={isCorrect ? 'text-[#22C55E] font-medium' : 'text-[#EF4444] font-medium'}>
                            {userAns !== undefined ? q.options[userAns] : 'Not answered'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="text-slate-500 dark:text-[#94A3B8]">Correct Answer:</span>{' '}
                            <span className="text-[#22C55E] font-bold">{q.options[q.correctIndex]}</span>
                          </div>
                        )}
                        <p className="text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-[#252B36] leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 dark:border-[#252B36] bg-slate-50 dark:bg-[#171B24] flex items-center justify-between">
          {!isSubmitted ? (
            <>
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer ${
                  currentIndex === 0 ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1E2330]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex space-x-2">
                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-[#5B7CFF] hover:bg-[#5B7CFF]/90 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2 bg-[#22C55E] hover:bg-[#22C55E]/90 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Exam Challenge</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleRetake}
                className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#5B7CFF] hover:bg-[#5B7CFF]/90 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
