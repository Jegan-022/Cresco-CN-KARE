import React from 'react';
import { 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Key, 
  Compass, 
  Share2, 
  Globe, 
  Layers, 
  Trophy, 
  Check 
} from 'lucide-react';
import { ModularLesson } from '../../data/lessons/lessonModel';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';

interface LessonSummaryPageProps {
  lesson: ModularLesson;
  onFinish: () => void;
  onPrev: () => void;
  onTakeUnitQuiz?: () => void;
  onContinueNextLesson?: () => void;
}

export const LessonSummaryPage: React.FC<LessonSummaryPageProps> = ({
  lesson,
  onFinish,
  onPrev,
  onTakeUnitQuiz,
  onContinueNextLesson
}) => {
  const summary = lesson.summary;

  const handleDownloadPDF = () => {
    soundFx.playCorrect();
    triggerSubtleSectionConfetti();
    alert(`Downloading ${lesson.title} summary PDF!`);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fadeIn pb-6">
      
      {/* ========================================================================= */}
      {/* 1. SUMMARY HEADER STRIP WITH PDF DOWNLOAD BUTTON                          */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            📜
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Lesson Summary
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Let's quickly recap what you have learned in this lesson.
            </p>
          </div>
        </div>

        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-extrabold transition-all shadow-2xs cursor-pointer"
        >
          <Download size={14} />
          <span>Download Summary (PDF)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 RECAP CARDS GRID (Key Concepts | Important Points | Analogy | Uses)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Key Concepts */}
        <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 mb-3">
            <span className="text-base">🔑</span>
            <h4>Key Concepts</h4>
          </div>
          <ul className="space-y-2 flex-1">
            {summary.keyConcepts.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-blue-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 2: Important Points */}
        <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-600 dark:text-purple-400 mb-3">
            <span className="text-base">📌</span>
            <h4>Important Points</h4>
          </div>
          <ul className="space-y-2 flex-1">
            {summary.importantPoints.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-purple-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3: Real World Analogy */}
        <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-400 mb-3">
            <span className="text-base">📬</span>
            <h4>Real World Analogy</h4>
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
            {summary.realWorldAnalogy}
          </p>
        </div>

        {/* Card 4: Common Uses */}
        <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mb-3">
            <span className="text-base">🌐</span>
            <h4>Common Uses</h4>
          </div>
          <ul className="space-y-2 flex-1">
            {summary.commonUses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. VISUAL MIND MAP + COMPLETION CARD                                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Mind Map Diagram */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white mb-4">
            <span className="text-base">🧠</span>
            <h3>Interactive Mind Map</h3>
          </div>

          {/* Interactive Node Map Canvas */}
          <div className="flex-1 min-h-[280px] bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0B132B] dark:to-[#171F38] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Center Core Node */}
            <div className="z-10 px-5 py-3 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg border-2 border-blue-400 text-center animate-pulse">
              {summary.mindMapCenter}
            </div>

            {/* Radial Connected Branches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full mt-6 z-10">
              {summary.mindMapBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 shadow-2xs text-center transition-all hover:scale-105 cursor-pointer"
                  style={{ borderColor: branch.color || '#3B82F6' }}
                >
                  <span
                    className="text-xs font-extrabold block"
                    style={{ color: branch.color || '#3B82F6' }}
                  >
                    {branch.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Completion Card with Octo Mascot */}
        <div className="lg:col-span-4 bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-white dark:from-[#1E293B] dark:via-[#161F38] dark:to-[#111C44] border border-blue-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between items-center text-center gap-5">
          
          <div className="flex flex-col items-center">
            {/* Celebration Mascot */}
            <div className="size-24 sm:size-28 relative my-2">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Octo Completed"
                className="size-full object-contain filter drop-shadow-md animate-bounce-up"
              />
            </div>

            <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">
              GREAT JOB!
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              You Have Completed This Lesson! 🎓
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 max-w-xs">
              You can now move to the next lesson or take a comprehensive unit quiz.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="w-full space-y-2.5">
            <button
              onClick={() => {
                soundFx.playCorrect();
                triggerSubtleSectionConfetti();
                if (onContinueNextLesson) onContinueNextLesson();
                else onFinish();
              }}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Next Lesson</span>
              <ArrowRight size={14} />
            </button>

            {onTakeUnitQuiz && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onTakeUnitQuiz();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Take Unit Quiz
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                onFinish();
              }}
              className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white font-extrabold text-xs transition-colors cursor-pointer"
            >
              Return to Island Map
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ACTION BAR                                                      */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            soundFx.playClick();
            onPrev();
          }}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          <span>Previous: Practice Quiz</span>
        </button>

        <button
          onClick={() => {
            soundFx.playCorrect();
            onFinish();
          }}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Complete & Exit</span>
          <Check size={14} />
        </button>
      </div>

    </div>
  );
};
