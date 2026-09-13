import React, { useEffect } from 'react';
import { Award, X, Sparkles } from 'lucide-react';
import { triggerSubtleSectionConfetti } from '../utils/confetti';

interface SectionCompletionToastProps {
  sectionTitle: string;
  bonusXp?: number;
  onClose: () => void;
}

export const SectionCompletionToast: React.FC<SectionCompletionToastProps> = ({
  sectionTitle,
  bonusXp = 100,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      id="section-completion-celebration-toast"
      role="alert"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-white border border-blue-200/80 rounded-2xl shadow-xl p-4 transition-all transform-gpu duration-300 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto"
    >
      <div className="flex items-start space-x-3">
        {/* Celebration Trophy Icon */}
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
          <Award className="w-5 h-5 text-blue-600 animate-bounce" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center space-x-1.5 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Section Completed
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
              +{bonusXp} XP
            </span>
          </div>

          <h4 className="text-xs font-bold text-slate-900 truncate" title={sectionTitle}>
            {sectionTitle}
          </h4>

          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            All lessons in this section have been completed. Great progress!
          </p>

          <div className="mt-2.5 flex items-center space-x-3">
            <button
              id="celebrate-again-confetti-btn"
              onClick={() => triggerSubtleSectionConfetti()}
              className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Sparkle again</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          id="close-section-completion-toast-btn"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Dismiss completion celebration"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle bottom progress bar showing auto-dismiss countdown */}
      <div className="mt-3 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
        <div className="bg-blue-500 h-full w-full origin-left animate-pulse" />
      </div>
    </div>
  );
};
