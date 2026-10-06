import React, { useState } from 'react';
import { LevelDefinition, ConceptTabContent } from '../../levels/types';
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Sparkles, 
  Laptop, 
  Server, 
  Router, 
  Lightbulb,
  FileText,
  Share2
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface ConceptLearningPageProps {
  level: LevelDefinition;
  onNext: () => void;
  onPrev?: () => void;
  onSelectTab?: (tabId: string) => void;
}

export const ConceptLearningPage: React.FC<ConceptLearningPageProps> = ({
  level,
  onNext,
  onPrev,
}) => {
  const tabs = level.concept.tabs;
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || 'overview');

  const currentTab: ConceptTabContent = 
    tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleDownloadNotes = () => {
    soundFx.playClick();
    const notesText = `# ${level.title} - Notes\nUnit: ${level.unitTitle} (Lesson ${level.lessonNumber})\n\n${currentTab.title}\n\n${currentTab.content.join('\n\n')}\n\nKey Takeaways:\n${currentTab.keyTakeaways.map(t => `- ${t}`).join('\n')}`;
    const blob = new Blob([notesText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${level.slug}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Lesson Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 border border-white/20">
        <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3 text-amber-300">
              <Sparkles size={13} className="animate-spin" />
              Lesson {level.lessonNumber} of {level.totalLessonsInUnit}
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              {level.title}
            </h1>
            
            <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
              {level.subtitle}
            </p>
          </div>

          {/* Octo Guide Mascot Speech Bubble */}
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3 sm:p-4 shrink-0 shadow-lg max-w-sm">
            <div className="relative size-14 sm:size-16 shrink-0 flex items-center justify-center">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Guide Mascot"
                className="w-full h-full object-contain filter drop-shadow-md animate-bounce-up"
              />
            </div>
            <div className="text-xs sm:text-sm text-white font-medium leading-snug">
              <p className="font-bold text-amber-300 mb-0.5 flex items-center gap-1">
                <span>Octo Guide</span>
                <span className="text-[10px] bg-amber-400/20 px-1.5 py-0.2 rounded text-amber-200">Tips</span>
              </p>
              {level.mascotQuote}
            </div>
          </div>
        </div>
      </div>

      {/* Concept Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTabId(tab.id);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Concept Content Card */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Explanatory Content & Architecture Diagram */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Lightbulb size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {currentTab.title}
              </h2>
            </div>

            <div className="flex flex-col gap-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {currentTab.content.map((paragraph, idx) => (
                <p key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Architecture Diagram Visualization */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/60 dark:to-slate-800/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center gap-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Network Architecture Pipeline
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-lg py-2">
                {/* Source Node */}
                <div className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs w-28 text-center">
                  <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Laptop size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Source</span>
                </div>

                <div className="text-blue-500 dark:text-blue-400 font-bold hidden sm:block">
                  <ArrowRight size={22} className="animate-pulse" />
                </div>

                {/* Central Layer Router Node */}
                <div className="flex flex-col items-center gap-2 p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/25 w-36 text-center transform scale-105 border-2 border-white/20">
                  <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Router size={22} />
                  </div>
                  <span className="text-xs font-black tracking-wide uppercase">
                    {level.unitTitle.split(':')[1]?.trim() || 'Network Layer'}
                  </span>
                  <span className="text-[10px] text-blue-200">Routing & Forwarding</span>
                </div>

                <div className="text-blue-500 dark:text-blue-400 font-bold hidden sm:block">
                  <ArrowRight size={22} className="animate-pulse" />
                </div>

                {/* Destination Node */}
                <div className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs w-28 text-center">
                  <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Server size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Destination</span>
                </div>
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                {currentTab.diagram?.caption || 'End-to-End Packet Routing across Autonomous Systems'}
              </span>
            </div>
          </div>

          {/* Right Column: Key Takeaways Card */}
          <div className="lg:col-span-5 flex flex-col gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-base">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <span>Key Takeaways</span>
            </div>

            <div className="flex flex-col gap-3">
              {currentTab.keyTakeaways.map((takeaway, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-2xs"
                >
                  <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={13} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {takeaway}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/30 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
              <span className="font-semibold">Quick Review</span>
              <span className="bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full font-bold">
                Level {level.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleDownloadNotes}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
        >
          <Download size={15} />
          <span>Download Notes</span>
        </button>

        <div className="flex items-center gap-3">
          {onPrev && (
            <button
              onClick={() => {
                soundFx.playClick();
                onPrev();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Previous</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playClick();
              onNext();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all transform hover:scale-102 active:scale-98 shadow-md shadow-blue-500/25 cursor-pointer"
          >
            <span>Next: Interactive Simulation</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
