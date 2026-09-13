import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, RefreshCw } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionData?: QuizQuestion;
  onComplete?: () => void;
}

const DEFAULT_QUESTION: QuizQuestion = {
  id: 'dns-quiz-1',
  lessonNumber: 12,
  totalLessons: 28,
  courseTitle: 'Computer Networks',
  question: 'Which protocol is responsible for translating a domain name into an IP address?',
  options: [
    { id: 'opt-http', text: 'HTTP (HyperText Transfer Protocol)' },
    { id: 'opt-dns', text: 'DNS (Domain Name System)' },
    { id: 'opt-ftp', text: 'FTP (File Transfer Protocol)' },
    { id: 'opt-tcp', text: 'TCP (Transmission Control Protocol)' },
  ],
  correctOptionId: 'opt-dns',
  explanation: 'DNS translates human-friendly domain names such as example.com into numerical IP addresses required for routing datagrams.',
};

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  questionData = DEFAULT_QUESTION,
  onComplete,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ = questionData;
  const isCorrect = selectedOptionId === currentQ.correctOptionId;
  const progressPercent = Math.round((currentQ.lessonNumber / currentQ.totalLessons) * 100);

  const handleSelect = (id: string) => {
    if (isSubmitted) return;
    setSelectedOptionId(id);
  };

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    setIsSubmitted(true);
  };

  const handleContinue = () => {
    setSelectedOptionId(null);
    setIsSubmitted(false);
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50  animate-in fade-in duration-150">
      
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span className="font-semibold text-slate-800">{currentQ.courseTitle}</span>
            <span>Lesson {currentQ.lessonNumber} / {currentQ.totalLessons}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all transform-gpu duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Body */}
        <div className="p-6 sm:p-7">
          <div className="flex items-start space-x-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600">Knowledge Check</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                {currentQ.question}
              </h3>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isOptionCorrect = opt.id === currentQ.correctOptionId;

              let buttonStyle = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';

              if (isSelected && !isSubmitted) {
                buttonStyle = 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-100 font-medium';
              } else if (isSubmitted) {
                if (isOptionCorrect) {
                  buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100 font-semibold';
                } else if (isSelected && !isOptionCorrect) {
                  buttonStyle = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-100';
                } else {
                  buttonStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  id={`quiz-option-${opt.id}`}
                  onClick={() => handleSelect(opt.id)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all transform-gpu flex items-center justify-between group ${buttonStyle}`}
                >
                  <span className="leading-snug">{opt.text}</span>
                  {isSubmitted && isOptionCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                  )}
                  {isSubmitted && isSelected && !isOptionCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Result Feedback Banner */}
          {isSubmitted && (
            <div className={`mt-5 p-4 rounded-xl border animate-in fade-in duration-200 ${
              isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>✓ Correct! Well done.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Incorrect. Let's review:</span>
                  </>
                )}
              </div>
              <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="mt-7 flex items-center justify-end space-x-3">
            {!isSubmitted ? (
              <button
                id="submit-quiz-btn"
                onClick={handleSubmit}
                disabled={!selectedOptionId}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  selectedOptionId
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                id="continue-quiz-btn"
                onClick={handleContinue}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-colors shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
