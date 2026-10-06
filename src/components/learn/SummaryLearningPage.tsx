import React from 'react';
import { LevelDefinition } from '../../levels/types';
import { 
  Award, 
  CheckCircle2, 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Globe, 
  Network, 
  Cpu, 
  Share2,
  FileCheck
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';

interface SummaryLearningPageProps {
  level: LevelDefinition;
  onPrev: () => void;
  onNextLesson?: () => void;
  onTakeUnitQuiz?: () => void;
  onReturnToMap?: () => void;
}

export const SummaryLearningPage: React.FC<SummaryLearningPageProps> = ({
  level,
  onPrev,
  onNextLesson,
  onTakeUnitQuiz,
  onReturnToMap,
}) => {
  const sum = level.summary;

  const handleDownloadPDF = () => {
    soundFx.playClick();
    triggerSubtleSectionConfetti();
    const summaryText = `CRESCO CN - LESSON SUMMARY\n=========================================\nLevel: ${level.id} (${level.title})\nUnit: ${level.unitTitle}\n\n1. KEY CONCEPTS:\n${sum.keyConcepts.map(c => `• ${c}`).join('\n')}\n\n2. IMPORTANT POINTS:\n${sum.importantPoints.map(p => `• ${p}`).join('\n')}\n\n3. REAL WORLD ANALOGY:\n${sum.realWorldAnalogy}\n\n4. COMMON USES:\n${sum.commonUses.map(u => `• ${u}`).join('\n')}\n\n=========================================\nGenerated for KLU Cresco CN Student\n`;
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${level.slug}-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Award size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Lesson Summary
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Let's quickly recap what you have learned in this lesson.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs self-start sm:self-center"
        >
          <Download size={15} />
          <span>Download Summary (PDF)</span>
        </button>
      </div>

      {/* 4 Summary Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Key Concepts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
            <BookOpen size={18} />
            <span>Key Concepts</span>
          </div>
          <ul className="flex flex-col gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {sum.keyConcepts.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 2: Important Points */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <FileCheck size={18} />
            <span>Important Points</span>
          </div>
          <ul className="flex flex-col gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {sum.importantPoints.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3: Real World Analogy */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Lightbulb size={18} />
            <span>Real World Analogy</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
            "{sum.realWorldAnalogy}"
          </p>
        </div>

        {/* Card 4: Common Uses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Globe size={18} />
            <span>Common Uses</span>
          </div>
          <ul className="flex flex-col gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {sum.commonUses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mind Map Section & Next Steps (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mind Map Interactive Diagram (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <Network size={20} className="text-blue-500" />
            <span>Visual Concept Mind Map</span>
          </div>

          <div className="relative min-h-[300px] w-full bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Center Core Node */}
            <div className="relative z-10 p-4 rounded-2xl bg-blue-600 text-white font-black text-sm sm:text-base text-center shadow-xl shadow-blue-500/25 border-2 border-white/20">
              {sum.mindMap.center}
            </div>

            {/* Orbiting Satellite Concept Nodes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[85%] h-[80%] border border-dashed border-blue-400/40 rounded-full" />
            </div>

            {/* Satellite Nodes Grid */}
            <div className="absolute inset-0 p-4 flex flex-wrap items-center justify-between content-between pointer-events-auto">
              {sum.mindMap.nodes.map((node, i) => {
                let badgeClass = 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200';
                if (node.category === 'accent') {
                  badgeClass = 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200';
                } else if (node.category === 'secondary') {
                  badgeClass = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
                }

                return (
                  <div
                    key={node.id}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold shadow-xs transition-transform hover:scale-105 cursor-default ${badgeClass}`}
                  >
                    {node.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mascot & Next Step Card (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Mascot Celebration */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-3xl border border-emerald-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="relative size-16 shrink-0 flex items-center justify-center">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Guide Mascot"
                className="w-full h-full object-contain filter drop-shadow-md animate-bounce-up"
              />
            </div>
            <div>
              <p className="font-black text-sm text-emerald-900 dark:text-emerald-300 leading-tight">
                Great Job! 🎉
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                You have completed Level {level.id}: {level.title}!
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full">
                <Sparkles size={12} />
                <span>+{level.xpReward} XP Earned</span>
              </div>
            </div>
          </div>

          {/* Next Steps CTA Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Next Step
              </span>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                You can now move to the next lesson or take a full unit quiz.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {level.nextLevelSlug && onNextLesson && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onNextLesson();
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all transform hover:scale-101 active:scale-99 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Next Lesson</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {onTakeUnitQuiz && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onTakeUnitQuiz();
                  }}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Take Unit Quiz</span>
                </button>
              )}

              {onReturnToMap && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onReturnToMap();
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Return to Island Map
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-start pt-2">
        <button
          onClick={() => {
            soundFx.playClick();
            onPrev();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Previous: Quiz</span>
        </button>
      </div>
    </div>
  );
};
