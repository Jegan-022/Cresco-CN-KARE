import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PacketIcon } from '../brand/NetworkNodeIcons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No lessons completed yet',
  description = 'Your network journey starts here. Explore syllabus modules, run packet simulations, and earn XP.',
  actionLabel = 'Start First Lesson',
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-xs">
        <PacketIcon size={24} />
      </div>

      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <span>{actionLabel}</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
};
