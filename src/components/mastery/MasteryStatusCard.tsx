/**
 * CRESCO Production — Step 21 Mastery Status Card Component
 * 
 * Renders an evidence-grounded, explainable mastery card according to
 * the CRESCO Pedagogy Specification (Five Pillars of Evidence) without fabricated scores.
 */

import React, { useState } from 'react';
import { MasteryEvaluationResult, MasteryState } from '../../types/mastery';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  BookOpen, 
  Target, 
  ShieldCheck, 
  Layers, 
  Info,
  XCircle,
  FileCheck2
} from 'lucide-react';
import { NavTab } from '../../types';

interface MasteryStatusCardProps {
  title: string;
  evaluation?: MasteryEvaluationResult | null;
  onNavigate?: (tab: NavTab) => void;
  isLoading?: boolean;
}

export const MasteryStatusCard: React.FC<MasteryStatusCardProps> = ({
  title,
  evaluation,
  onNavigate,
  isLoading = false
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 animate-pulse">
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{title}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">No verified evidence recorded yet</span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Not Started
        </span>
      </div>
    );
  }

  const getStateBadge = (state: MasteryState) => {
    switch (state) {
      case 'mastered':
        return {
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-400',
          label: 'Mastered',
          icon: Award
        };
      case 'pending_policy':
        return {
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-400',
          label: 'Pending Policy',
          icon: Clock
        };
      case 'proficient':
        return {
          bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-400',
          label: 'Proficient',
          icon: ShieldCheck
        };
      case 'ready_for_assessment':
        return {
          bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border-indigo-400',
          label: 'Ready for Exam',
          icon: Target
        };
      case 'developing':
        return {
          bg: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
          label: 'Developing',
          icon: Layers
        };
      case 'learning':
        return {
          bg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 border-sky-300',
          label: 'In Learning',
          icon: BookOpen
        };
      case 'needs_support':
        return {
          bg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border-rose-300',
          label: 'Needs Support',
          icon: AlertCircle
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300',
          label: 'Insufficient Evidence',
          icon: HelpCircle
        };
    }
  };

  const badge = getStateBadge(evaluation.masteryState);
  const BadgeIcon = badge.icon;

  return (
    <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 transition-all space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-xs font-black text-[#172033] dark:text-white uppercase tracking-wider">
            {title}
          </h4>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
            Competency Index: <strong className="text-slate-900 dark:text-slate-100">{evaluation.masteryScore}%</strong>
          </span>
        </div>

        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${badge.bg}`}>
          <BadgeIcon size={12} />
          <span>{badge.label}</span>
        </span>
      </div>

      {/* Progress bar representing genuine calculated mastery index */}
      <div className="w-full h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden border border-[#E5E0D8] dark:border-slate-700">
        <div 
          className={`h-full transition-all duration-500 ${
            evaluation.masteryState === 'mastered' 
              ? 'bg-emerald-500' 
              : evaluation.masteryState === 'pending_policy'
              ? 'bg-amber-500'
              : evaluation.masteryState === 'proficient'
              ? 'bg-[#3157D5]'
              : 'bg-slate-400'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, evaluation.masteryScore))}%` }} 
        />
      </div>

      {/* Concise Explanation */}
      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
        {evaluation.explanation}
      </p>

      {/* Toggle Details for Five Pillars Evidence */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="text-[11px] font-bold text-[#3157D5] dark:text-[#6D8CFF] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Info size={13} />
          <span>{detailsOpen ? 'Hide Evidence Pillars' : 'View Evidence Breakdown'}</span>
        </button>

        {evaluation.nextAction && onNavigate && (
          <button
            onClick={() => {
              if (evaluation.nextAction.action === 'start_lesson') onNavigate('lesson-player');
              else if (evaluation.nextAction.action === 'attempt_assessment') onNavigate('exam');
              else onNavigate('practice');
            }}
            className="text-[11px] font-black text-[#172033] dark:text-slate-200 hover:text-[#3157D5] flex items-center gap-1 cursor-pointer"
          >
            <span>{evaluation.nextAction.action === 'attempt_assessment' ? 'Take Exam' : 'Practice Now'}</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Expanded Five Pillars Evidence Modal / Drawer */}
      {detailsOpen && (
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-[11px] animate-in fade-in duration-150">
          <span className="font-mono font-bold text-[10px] text-slate-400 uppercase tracking-wider block">
            Five Pillars of Mastery Evidence:
          </span>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span>1. Summative Assessment (≥{evaluation.pillars.assessment.thresholdRequired}%)</span>
              <span className={`font-mono font-bold ${evaluation.pillars.assessment.satisfied ? 'text-emerald-600' : 'text-slate-400'}`}>
                {evaluation.pillars.assessment.satisfied ? `✓ Passed (${evaluation.pillars.assessment.bestScore}%)` : `✕ ${evaluation.pillars.assessment.bestScore !== undefined ? `${evaluation.pillars.assessment.bestScore}%` : 'Unattempted'}`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>2. Practice Drills (≥{evaluation.pillars.practice.minRequired})</span>
              <span className={`font-mono font-bold ${evaluation.pillars.practice.satisfied ? 'text-emerald-600' : 'text-slate-400'}`}>
                {evaluation.pillars.practice.satisfied ? `✓ ${evaluation.pillars.practice.attemptsCount} drills` : `✕ ${evaluation.pillars.practice.attemptsCount}/${evaluation.pillars.practice.minRequired}`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>3. Packet Simulation Lab</span>
              <span className={`font-mono font-bold ${evaluation.pillars.application.satisfied ? 'text-emerald-600' : 'text-slate-400'}`}>
                {evaluation.pillars.application.satisfied ? '✓ Completed' : '✕ Pending'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>4. Independence (Hint Ratio ≤{Math.round(evaluation.pillars.independence.maxAllowedRatio * 100)}%)</span>
              <span className={`font-mono font-bold ${evaluation.pillars.independence.satisfied ? 'text-emerald-600' : 'text-slate-400'}`}>
                {evaluation.pillars.independence.satisfied ? `✓ ${Math.round(evaluation.pillars.independence.hintRelianceRatio * 100)}%` : `✕ ${Math.round(evaluation.pillars.independence.hintRelianceRatio * 100)}%`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>5. Spaced Retention Check</span>
              <span className="font-mono font-bold text-slate-400">
                {evaluation.pillars.retention.retentionRequired ? (evaluation.pillars.retention.satisfied ? '✓ Verified' : '✕ Pending 7d') : '○ Optional'}
              </span>
            </div>
          </div>

          {/* Missing Evidence List */}
          {evaluation.missingEvidence.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 block text-[10px] uppercase">
                Missing Evidence to Reach Mastery:
              </span>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 text-[10px] space-y-0.5">
                {evaluation.missingEvidence.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Unresolved Policies Notice */}
          {evaluation.unresolvedPolicies.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-amber-700 dark:text-amber-400/90 font-mono">
              <strong>Academic Review Notice:</strong> {evaluation.unresolvedPolicies[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
