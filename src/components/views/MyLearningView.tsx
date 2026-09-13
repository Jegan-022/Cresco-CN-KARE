import React, { useState } from 'react';
import { Course, NavTab } from '../../types';
import { FolderCheck, Play, Star, Clock, CheckCircle2, BookOpen, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ALL_MODULES } from '../../data/courseContent';

interface MyLearningViewProps {
  primaryCourse: Course;
  secondaryCourses: Course[];
  onNavigate: (tab: NavTab, lessonId?: string, sectionId?: number) => void;
}

export const MyLearningView: React.FC<MyLearningViewProps> = ({
  primaryCourse,
  secondaryCourses,
  onNavigate,
}) => {
  const { userProfile } = useAuth();
  const [filter, setFilter] = useState<'continue' | 'completed' | 'saved'>('continue');

  const overallProgress = userProfile ? userProfile.overallProgress : 0;
  const modulesCount = userProfile?.completedModules?.length || 0;
  const totalModules = ALL_MODULES.length || 30;

  return (
    <div className="space-y-6 pb-16 font-sans max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B7CFF] mb-1 font-semibold">
          <FolderCheck className="w-4 h-4" />
          <span className="uppercase tracking-wider">ACADEMIC ENROLLMENT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Learning Pathway
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
          Track syllabus completion, module achievements, and certificate milestones.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-[#252B36] pb-3 text-xs sm:text-sm font-semibold">
        {[
          { id: 'continue', label: 'Active Course (1)' },
          { id: 'completed', label: `Completed (${overallProgress === 100 ? 1 : 0})` },
          { id: 'saved', label: 'Electives (1)' },
        ].map((t) => (
          <button
            key={t.id}
            id={`my-learning-tab-${t.id}`}
            onClick={() => setFilter(t.id as any)}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === t.id
                ? 'bg-[#5B7CFF] text-white font-bold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#171B24]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Courses List */}
      {filter === 'continue' ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#252B36] rounded-2xl p-6 shadow-sm dark:shadow-xl hover:border-[#5B7CFF]/40 transition-all transform-gpu flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-[#5B7CFF] bg-[#5B7CFF]/15 px-2 py-0.5 rounded font-mono">
                  CS-4200 CORE
                </span>
                <span className="text-slate-400 dark:text-[#94A3B8]">•</span>
                <span className="text-slate-500 dark:text-[#94A3B8]">Department: CSE (3rd Year)</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Computer Networks: Interactive Visual Learning
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Comprehensive 17-module curriculum covering Unit 3 (Network Layer), Unit 4 (Transport Layer), and Unit 5 (Application Layer) with structured pedagogical visual simulations.
              </p>

              {/* Real Student Progress info */}
              <div className="pt-2 max-w-md space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-800 dark:text-white font-bold">{overallProgress}% completed</span>
                  <span className="text-slate-500 dark:text-[#94A3B8]">{modulesCount} / {totalModules} modules</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-[#171B24] border border-slate-200 dark:border-[#252B36] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#5B7CFF] to-[#22C55E] transition-all transform-gpu duration-500"
                    style={{ width: `${Math.max(2, overallProgress)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-[#94A3B8] pt-1">
                <Clock className="w-3.5 h-3.5 text-[#5B7CFF]" />
                <span>Last updated: {userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : 'Today'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                id="continue-mylearning-primary"
                onClick={() => onNavigate('courses')}
                className="px-6 py-3 bg-[#5B7CFF] hover:bg-[#5B7CFF]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#5B7CFF]/20 transition-all transform-gpu flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Continue Course</span>
              </button>

              <button
                onClick={() => onNavigate('practice')}
                className="px-5 py-2.5 border border-slate-200 dark:border-[#252B36] bg-slate-50 dark:bg-[#171B24] hover:bg-slate-100 dark:hover:bg-[#252B36] text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Practice Drills
              </button>
            </div>
          </div>
        </div>
      ) : filter === 'completed' ? (
        <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#252B36] rounded-2xl p-12 text-center text-slate-500 dark:text-[#94A3B8] shadow-sm">
          <CheckCircle2 className="w-12 h-12 mx-auto text-[#5B7CFF] mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {overallProgress === 100 ? 'Curriculum Completed!' : 'No completed courses yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-sm mx-auto">
            {overallProgress === 100 
              ? 'Congratulations! You have mastered all 17 modules of Computer Networks.'
              : `You are currently ${overallProgress}% through Computer Networks (${modulesCount} of ${totalModules} modules). Complete all modules to earn your certificate.`}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#252B36] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 text-xs text-[#8B5CF6] font-mono mb-1">
            <span>ELECTIVE PREVIEW</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Network Security & Cryptography</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">CS-4250 • Available for 4th Year CSE Students</p>
          <div className="mt-4">
            <button 
              onClick={() => onNavigate('courses')}
              className="px-4 py-2 bg-slate-50 dark:bg-[#171B24] border border-slate-200 dark:border-[#252B36] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Explore Course
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
