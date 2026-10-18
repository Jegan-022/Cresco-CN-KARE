/**
 * CRESCO Adaptation Card Component
 *
 * Lightweight, non-intrusive presentation card displaying learner-facing
 * pedagogical guidance and safe navigation suggestions.
 *
 * References:
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/APPLICATION_ADAPTATION_IMPLEMENTATION.md
 */

import React from 'react';
import {
  Compass,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Info,
  ArrowRight,
  X
} from 'lucide-react';
import { AdaptationViewModel, AdaptationAction } from '../../types/adaptationViewModel';

interface AdaptationCardProps {
  adaptation: AdaptationViewModel;
  onAction?: (action: AdaptationAction) => void;
  onDismiss?: () => void;
  className?: string;
}

export const AdaptationCard: React.FC<AdaptationCardProps> = ({
  adaptation,
  onAction,
  onDismiss,
  className = '',
}) => {
  if (!adaptation) return null;

  const { title, message, action, severity, evidenceHighlights } = adaptation;

  const getSeverityStyles = () => {
    switch (severity) {
      case 'guidance':
        return {
          container: 'border-blue-200/80 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100',
          badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
        };
      case 'review':
        return {
          container: 'border-amber-200/80 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100',
          badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
          icon: <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
        };
      case 'success':
        return {
          container: 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100',
          badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
          button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        };
      case 'info':
      default:
        return {
          container: 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100',
          badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
          button: 'bg-slate-800 hover:bg-slate-900 text-white',
          icon: <Info className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />,
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div
      className={`relative w-full rounded-2xl border p-4 sm:p-5 shadow-xs transition-all text-left ${styles.container} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {styles.icon}
          <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">
            Adaptive Guidance
          </span>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss guidance"
            className="p-1 -mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="mt-2 space-y-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
          {title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>
      </div>

      {evidenceHighlights && evidenceHighlights.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {evidenceHighlights.map((highlight, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold ${styles.badge}`}
            >
              <span>{highlight.label}:</span>
              <span className="font-bold">{highlight.value}</span>
            </span>
          ))}
        </div>
      )}

      {action && onAction && (
        <div className="mt-4 pt-1">
          <button
            onClick={() => onAction(action)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:translate-y-0.5 cursor-pointer ${styles.button}`}
          >
            <span>{action.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
