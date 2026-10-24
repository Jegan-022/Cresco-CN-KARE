import React from 'react';
import { NavTab } from '../../types';
import { 
  PersonalizedRecommendation,
  PersonalizationResult 
} from '../../types/personalization';
import { 
  formatRecommendationActionLabel, 
  getCategoryDisplayInfo 
} from '../../services/personalizedLearningService';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Clock, 
  AlertCircle, 
  Activity, 
  CheckCircle2, 
  HelpCircle,
  BookOpen,
  Bot
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface PersonalizedNextCardProps {
  result: PersonalizationResult | null;
  onNavigate: (tab: NavTab, lessonId?: string, sectionId?: number) => void;
  onAskTutor?: (rec: PersonalizedRecommendation) => void;
}

export const PersonalizedNextCard: React.FC<PersonalizedNextCardProps> = ({
  result,
  onNavigate,
  onAskTutor
}) => {
  const primary = result?.primaryRecommendation;
  const secondaries = result?.secondaryRecommendations || [];
  const summary = result?.summary;

  if (!result || !primary) {
    if (summary?.isCourseCompleted) {
      return (
        <section 
          id="personalized-recommendation-hero"
          className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-surface-container-lowest to-surface-container-low p-6 md:p-8 border border-emerald-500/30 shadow-md"
        >
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold mb-2">
            <CheckCircle2 size={24} />
            <span className="font-headline-sm text-headline-sm">Course Curriculum Mastered!</span>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            You have successfully completed all 30 syllabus modules of Computer Networks. Review any topic in the Learning Map or practice mock exams.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => onNavigate('learn-map')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Explore Island Map</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('exam')}
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm cursor-pointer"
            >
              <span>Take Final Capstone Exam</span>
            </button>
          </div>
        </section>
      );
    }

    return (
      <section 
        id="personalized-recommendation-hero"
        className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 text-center"
      >
        <p className="text-body-md text-on-surface-variant">
          Log in or begin your first lesson to view personalized recommendations.
        </p>
      </section>
    );
  }

  const categoryInfo = getCategoryDisplayInfo(primary.category);

  return (
    <section 
      id="personalized-recommendation-hero"
      className="rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-[0_8px_30px_rgba(19,27,46,0.06)] border border-outline-variant/20 relative overflow-hidden"
    >
      {/* Top Banner & Category Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-lg ${categoryInfo.badgeBg} ${categoryInfo.badgeText} font-label-md text-label-md font-bold flex items-center gap-1.5 shadow-xs`}>
            {primary.category === 'resolve_prerequisites' && <AlertCircle size={14} />}
            {primary.category === 'strengthen_understanding' && <Activity size={14} />}
            {primary.category === 'gather_evidence' && <CheckCircle2 size={14} />}
            {primary.category === 'continue_learning' && <Sparkles size={14} />}
            {primary.category === 'review_and_retain' && <Clock size={14} />}
            <span>{categoryInfo.label}</span>
          </span>

          {primary.unitTitle && (
            <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-md text-label-md">
              {primary.unitTitle}
            </span>
          )}

          {primary.xpReward && (
            <span className="px-2.5 py-1 rounded-md bg-tertiary-fixed/60 text-on-tertiary-fixed font-label-md text-label-md flex items-center gap-1 font-bold">
              <Zap size={13} className="fill-current" /> +{primary.xpReward} XP
            </span>
          )}

          {primary.estimatedMinutes && (
            <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center gap-1">
              <Clock size={13} /> {primary.estimatedMinutes} mins
            </span>
          )}
        </div>

        {/* Explainable Source Tag */}
        <span className="text-xs font-mono text-outline uppercase tracking-wider">
          {primary.sourceType === 'deterministic_pedagogy' ? 'Pedagogy Engine' : 'AI Assisted'}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex-1">
          <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-extrabold">
            {primary.title}
          </h2>

          <p className="font-body-md text-body-md text-on-surface-variant pt-2 leading-relaxed">
            {primary.description}
          </p>

          {/* Rationale Explainability Box */}
          <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <HelpCircle size={18} className="text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-on-surface">
              <span className="font-bold text-primary block mb-0.5">Why this is recommended:</span>
              <span className="text-on-surface-variant leading-normal">{primary.rationale}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="w-full md:w-60 shrink-0 flex flex-col gap-3 justify-center">
          <button 
            id="personalized-hero-action-btn"
            onClick={() => { 
              soundFx.playClick(); 
              onNavigate(primary.targetTab, primary.targetLessonId); 
            }}
            className="w-full py-3.5 px-5 rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-[0_4px_0_0_#047857,0_8px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_2px_0_0_#047857,0_4px_8px_rgba(16,185,129,0.2)] hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer"
          >
            <span>{formatRecommendationActionLabel(primary)}</span>
            <ArrowRight size={18} />
          </button>

          {onAskTutor && (
            <button 
              id="personalized-ask-tutor-btn"
              onClick={() => { 
                soundFx.playClick(); 
                onAskTutor(primary); 
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-container text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 cursor-pointer border border-outline-variant/30 text-xs"
            >
              <Bot size={15} className="text-primary" />
              <span>Ask Neta About This</span>
            </button>
          )}
        </div>
      </div>

      {/* Additional Eligible Next Steps */}
      {secondaries.length > 0 && (
        <div className="mt-6 pt-6 border-t border-outline-variant/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3 font-mono">
            Also Recommended for You ({secondaries.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {secondaries.map((sec) => {
              const secCategory = getCategoryDisplayInfo(sec.category);
              return (
                <div 
                  key={sec.id}
                  onClick={() => {
                    soundFx.playClick();
                    onNavigate(sec.targetTab, sec.targetLessonId);
                  }}
                  className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${secCategory.badgeBg} ${secCategory.badgeText}`}>
                        {secCategory.label}
                      </span>
                      {sec.estimatedMinutes && (
                        <span className="text-[11px] text-outline flex items-center gap-1">
                          <Clock size={11} /> {sec.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-xs text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                      {sec.title}
                    </h5>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1">
                      {sec.rationale}
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-primary font-bold">
                    <span>{formatRecommendationActionLabel(sec)}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
