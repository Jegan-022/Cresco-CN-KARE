import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Monitor, 
  Router, 
  Server, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  Lightbulb,
  FileText,
  Share2
} from 'lucide-react';
import { ModularLesson } from '../../data/lessons/lessonModel';
import { soundFx } from '../../utils/soundEffects';

interface ConceptLearningPageProps {
  lesson: ModularLesson;
  onNext: () => void;
  onPrev: () => void;
}

type ConceptSubTab = 'overview' | 'keyConcepts' | 'analogy' | 'examples' | 'quickNotes';

export const ConceptLearningPage: React.FC<ConceptLearningPageProps> = ({
  lesson,
  onNext,
  onPrev
}) => {
  const [activeTab, setActiveTab] = useState<ConceptSubTab>('overview');

  const tabs: { key: ConceptSubTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'keyConcepts', label: 'Key Concepts' },
    { key: 'analogy', label: 'Real World Analogy' },
    { key: 'examples', label: 'Examples' },
    { key: 'quickNotes', label: 'Quick Notes' }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER WITH OCTO MASCOT                                           */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#EFF6FF] via-[#F5F3FF] to-[#FAF5FF] dark:from-[#1E293B] dark:via-[#1A2035] dark:to-[#171B2F] border border-[#DBEAFE] dark:border-[#334155] shadow-xs overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Column: Lesson Title & Meta */}
        <div className="flex-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 dark:bg-blue-400/15 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] uppercase tracking-wider mb-2">
            <span>LESSON {lesson.lessonNumber} OF {lesson.totalLessonsInUnit}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {lesson.title}
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {lesson.subtitle}
          </p>
        </div>

        {/* Right Column: Octo Mascot with Cap & Speech Bubble */}
        <div className="relative flex items-center justify-center shrink-0 z-10">
          {/* Speech Bubble */}
          <div className="hidden sm:block absolute -top-8 right-24 bg-white dark:bg-[#111C44] border-2 border-blue-500/30 rounded-2xl px-3.5 py-2 shadow-md text-xs font-extrabold text-slate-800 dark:text-slate-100 max-w-[200px] leading-tight animate-bounce-up">
            <span>{lesson.octoConceptSpeech}</span>
            {/* Bubble arrow */}
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white dark:bg-[#111C44] border-r-2 border-b-2 border-blue-500/30 rotate-45" />
          </div>

          {/* Friendly Mascot Image */}
          <div className="relative size-28 sm:size-32">
            <img
              src="/assets/mascot/cresco-mascot.png"
              alt="Octo Mascot Tutor"
              className="size-full object-contain filter drop-shadow-md animate-octo-float"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS                                                    */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.key);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111C44] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTIVE TAB CONTENT                                                     */}
      {/* ========================================================================= */}
      <div className="flex-1">
        
        {/* TAB 1: OVERVIEW (Matching Image 1) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* Left Card: Core Concept Definition & Visual Diagram */}
            <div className="lg:col-span-7 bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-base mb-3">
                  <span className="text-xl">🚀</span>
                  <h3>{lesson.concept.overview.heading}</h3>
                </div>

                <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson.concept.overview.body}
                </p>
              </div>

              {/* Visual Architectural Diagram: Source -> Network Layer -> Destination */}
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-slate-800/60 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-700/60 flex items-center justify-around gap-2">
                
                {/* Source Host */}
                <div className="flex flex-col items-center gap-2">
                  <div className="size-12 rounded-2xl bg-white dark:bg-slate-700 border-2 border-blue-400 shadow-xs flex items-center justify-center text-blue-600 dark:text-blue-300">
                    <Monitor size={22} />
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 text-center">
                    {lesson.concept.overview.sourceLabel || 'Source'}
                  </span>
                </div>

                {/* Arrow 1 */}
                <div className="flex-1 max-w-[60px] flex items-center justify-center">
                  <div className="h-0.5 w-full bg-blue-300 dark:bg-blue-600 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 border-solid border-l-blue-400 border-l-[6px] border-y-transparent border-y-[4px] border-r-0" />
                  </div>
                </div>

                {/* Network Layer Router */}
                <div className="flex flex-col items-center gap-2">
                  <div className="size-16 rounded-2xl bg-blue-600 text-white shadow-md flex flex-col items-center justify-center gap-1 border-2 border-blue-400 animate-pulse">
                    <Router size={24} />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest">Route</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 text-center">
                    {lesson.concept.overview.layerLabel || 'Network Layer'}
                  </span>
                </div>

                {/* Arrow 2 */}
                <div className="flex-1 max-w-[60px] flex items-center justify-center">
                  <div className="h-0.5 w-full bg-blue-300 dark:bg-blue-600 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 border-solid border-l-blue-400 border-l-[6px] border-y-transparent border-y-[4px] border-r-0" />
                  </div>
                </div>

                {/* Destination Host */}
                <div className="flex flex-col items-center gap-2">
                  <div className="size-12 rounded-2xl bg-white dark:bg-slate-700 border-2 border-blue-400 shadow-xs flex items-center justify-center text-blue-600 dark:text-blue-300">
                    <Monitor size={22} />
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 text-center">
                    {lesson.concept.overview.destinationLabel || 'Destination'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Key Takeaways */}
            <div className="lg:col-span-5 bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base mb-4">
                <span className="text-xl">📌</span>
                <h3>Key Takeaways</h3>
              </div>

              <div className="space-y-3.5 flex-1">
                {lesson.concept.overview.takeaways.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="size-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} className="stroke-[3]" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Core Pillar: OSI Layer 3</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">Host-to-Host Protocol</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: KEY CONCEPTS */}
        {activeTab === 'keyConcepts' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeIn">
            {lesson.concept.keyConcepts.points.map((pt, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-500 transition-all"
              >
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] uppercase tracking-wider mb-3">
                    {pt.badge || `Concept ${idx + 1}`}
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">
                    {pt.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: REAL WORLD ANALOGY */}
        {activeTab === 'analogy' && (
          <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs animate-fadeIn space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xl">
                📬
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {lesson.concept.analogy.heading}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  How computer networking mirrors everyday real-world systems
                </p>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-500/5 border border-amber-500/15 p-4 rounded-2xl">
              {lesson.concept.analogy.story}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Direct Comparison</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.concept.analogy.comparison.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                    <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">🌍 Real World: {item.realWorld}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">⚡ Networking: {item.networking}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXAMPLES */}
        {activeTab === 'examples' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
            {lesson.concept.examples.items.map((ex, idx) => (
              <div key={idx} className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">Case Study {idx + 1}</span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 mb-2">{ex.title}</h4>
                  <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 mb-3">
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Scenario:</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{ex.scenario}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">How it Works:</span>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{ex.howItWorks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: QUICK NOTES */}
        {activeTab === 'quickNotes' && (
          <div className="bg-white dark:bg-[#111C44] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs animate-fadeIn space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>Exam & Revision Cheat Sheet</span>
            </h3>
            <ul className="space-y-2.5">
              {lesson.concept.quickNotes.map((note, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span className="size-2 rounded-full bg-blue-600 shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
          <span>Previous</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNext();
          }}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Next: Interactive Simulation</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};
