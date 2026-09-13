import React, { useState } from 'react';
import { PracticeCategory, QuizQuestion } from '../types';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, RotateCcw, X, Layers } from 'lucide-react';

interface PracticeDrillModalProps {
  isOpen: boolean;
  category: PracticeCategory | null;
  onClose: () => void;
}

export const PracticeDrillModal: React.FC<PracticeDrillModalProps> = ({
  isOpen,
  category,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { recordPracticeAttempt } = useAuth();

  if (!isOpen || !category) return null;

  const currentQ: QuizQuestion = category.questions[currentIndex] || {
    id: `q-fallback-${currentIndex}`,
    lessonNumber: currentIndex + 1,
    totalLessons: 5,
    courseTitle: category.title,
    question: `In ${category.title}, what is the fundamental design principle governing reliable delivery and packet routing?`,
    options: [
      { id: 'opt-1', text: 'Hop-by-hop local hardware verification' },
      { id: 'opt-2', text: 'End-to-end principle with hierarchical addressing' },
      { id: 'opt-3', text: 'Unbounded broadcast storming' },
      { id: 'opt-4', text: 'Static single-path transmission only' },
    ],
    correctOptionId: 'opt-2',
    explanation: 'The Internet architecture follows the end-to-end principle where intermediate routers focus purely on best-effort forwarding.',
  };

  const isCorrect = selectedOptionId === currentQ.correctOptionId;

  const handleSelect = (id: string) => {
    if (isSubmitted) return;
    setSelectedOptionId(id);
  };

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    setIsSubmitted(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < (category.questions.length || 1)) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsSubmitted(false);
    } else {
      setIsCompleted(true);
      const finalScore = score + (isCorrect && !isSubmitted ? 1 : 0); // Need to make sure score is accurate
      const maxScore = Math.max(category.questions.length, 1);
      const scorePercent = Math.round((finalScore / maxScore) * 100);
      recordPracticeAttempt(category.id, scorePercent, finalScore * 10);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50  animate-in fade-in duration-150">
      
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{category.title} Drill</h3>
              <p className="text-[11px] text-slate-500">Question {currentIndex + 1} of {Math.max(category.questions.length, 1)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question Area or Summary */}
        <div className="p-6">
          {!isCompleted ? (
            <div>
              <div className="flex items-start space-x-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isOptionCorrect = opt.id === currentQ.correctOptionId;

                  let style = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';
                  if (isSelected && !isSubmitted) {
                    style = 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-100 font-medium';
                  } else if (isSubmitted) {
                    if (isOptionCorrect) {
                      style = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100 font-semibold';
                    } else if (isSelected && !isOptionCorrect) {
                      style = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-100';
                    } else {
                      style = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all transform-gpu flex items-center justify-between ${style}`}
                    >
                      <span>{opt.text}</span>
                      {isSubmitted && isOptionCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-2 shrink-0" />}
                      {isSubmitted && isSelected && !isOptionCorrect && <XCircle className="w-4 h-4 text-rose-500 ml-2 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isSubmitted && (
                <div className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <strong className="font-semibold">{isCorrect ? '✓ Correct!' : 'Incorrect:'} </strong>
                  {currentQ.explanation}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedOptionId}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors ${
                      selectedOptionId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold"
                  >
                    <span>{currentIndex + 1 < (category.questions.length || 1) ? 'Next Question' : 'Complete Drill'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Drill Completed!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                You scored {score} / {Math.max(category.questions.length, 1)} on {category.title}. Keep practicing to maintain your streak!
              </p>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-1 px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Drill</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Return to Practice
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
