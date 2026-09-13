import React, { useState, useMemo, useEffect } from 'react';
import { Course, CourseSection, NavTab } from '../../types';
import { 
  calculateOverallProgress,
  FlattenedModule
} from '../../data/courseContent';
import { useAuth } from '../../context/AuthContext';
import { UnitChallengeQuizModal } from '../modals/UnitChallengeQuizModal';
import { AddCourseModal } from '../modals/AddCourseModal';
import { AddModuleModal } from '../modals/AddModuleModal';
import { 
  getMergedCourses, 
  getMergedUnits, 
  getMergedAllModules, 
  moveModule, 
  deleteCustomModule 
} from '../../utils/courseManager';
import { 
  BookOpen, 
  Award,
  Lock, 
  ChevronRight, 
  Trophy, 
  Check, 
  Clock, 
  Sparkles, 
  Activity,
  Compass,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Layers,
  GraduationCap,
  ExternalLink,
  BookPlus,
  RotateCcw
} from 'lucide-react';
import { GooeyButton } from '../ui/GooeyButton';
import { PacketIcon } from '../brand/NetworkNodeIcons';

interface CoursesViewProps {
  course: Course;
  sections: CourseSection[];
  onSelectLesson: (lessonId: string, sectionId: number) => void;
  onNavigate: (tab: NavTab) => void;
  onMarkLessonCompleted?: (lessonId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  onSelectLesson,
  onNavigate,
}) => {
  const { userProfile, recordQuizAttempt } = useAuth();
  const [activeQuizUnitId, setActiveQuizUnitId] = useState<string | null>(null);

  // Dynamic Course & Module Management State
  const [courses, setCourses] = useState<Course[]>(() => getMergedCourses());
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'cn-cs4200');
  const [units, setUnits] = useState(() => getMergedUnits());
  const [allModules, setAllModules] = useState<FlattenedModule[]>(() => getMergedAllModules());

  // Modals state
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [addModuleUnitId, setAddModuleUnitId] = useState<string | null>(null);

  // Sync state when curriculum changes dynamically
  useEffect(() => {
    const handleCurriculumUpdate = () => {
      setCourses(getMergedCourses());
      setUnits(getMergedUnits());
      setAllModules(getMergedAllModules());
    };
    window.addEventListener('netquest_curriculum_updated', handleCurriculumUpdate);
    return () => window.removeEventListener('netquest_curriculum_updated', handleCurriculumUpdate);
  }, []);

  const completedModules = useMemo(() => {
    return userProfile?.completedModules || [];
  }, [userProfile?.completedModules]);

  const unlockedUnits = useMemo(() => {
    return userProfile?.unlockedUnits || ['unit_3', 'unit-3'];
  }, [userProfile?.unlockedUnits]);

  const isUnitUnlocked = (unitId: string) => {
    const norm = unitId.replace('-', '_');
    const kebab = unitId.replace('_', '-');
    return unlockedUnits.includes(norm) || unlockedUnits.includes(kebab) || norm === 'unit_3';
  };

  const totalModules = allModules.length || 30;
  const completedCount = completedModules.length;
  const overallProgress = calculateOverallProgress(completedCount);

  // Selected Course details
  const activeCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Check if course is 100% finished
  const isUnit5Passed =
    (userProfile?.completedUnits || 0) >= 3 ||
    (userProfile?.completedSteps || []).includes('quiz_unit_5') ||
    (userProfile?.completedSteps || []).includes('quiz_unit-5');
  const isCourseComplete = completedCount >= totalModules && isUnit5Passed;

  const handlePassUnitChallenge = async (unitId: string, xp: number) => {
    await recordQuizAttempt(unitId, 100, true, xp);
    setActiveQuizUnitId(null);
  };

  const handleMoveModule = (unitId: string, modId: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    moveModule(unitId, modId, direction);
  };

  const handleDeleteModule = (modId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this custom module?')) {
      deleteCustomModule(modId);
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-200">
      
      {/* 1. Header Bar with Course Information */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Compass size={14} />
            <span>Academic Curriculum • {activeCourse?.id === 'cn-cs4200' ? 'CS-4200' : activeCourse?.category || 'Active Track'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {activeCourse?.title || 'Computer Networks Syllabus'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {activeCourse?.description || '17 structured pedagogical modules across Network, Transport, and Application Layers with visual packet flows and unit examination benchmarks.'}
          </p>
        </div>

        {/* Course Progress Summary Capsule */}
        <div className="flex items-center gap-4 bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs shrink-0">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Overall Completion
            </div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {completedCount} of {totalModules} Modules ({overallProgress}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-mono font-bold text-sm">
            {overallProgress}%
          </div>
        </div>
      </div>

      {/* 2. Course Switcher & Management Hub ("More Courses") */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
              Academic Courses Catalog
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono font-semibold">
              {courses.length} Available
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddCourseOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookPlus size={14} />
              <span>+ Add Course</span>
            </button>

            <GooeyButton
              onClick={() => setAddModuleUnitId('unit_3')}
              variant="cyan"
              size="sm"
            >
              <Plus size={13} />
              <span>Add Module</span>
            </GooeyButton>
          </div>
        </div>

        {/* Horizontal Course Selector Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {courses.map((c) => {
            const isSelected = c.id === selectedCourseId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCourseId(c.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#172033] border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs ring-2 ring-blue-500/10'
                    : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                <span>{c.title}</span>
                {c.id === 'cn-cs4200' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    Primary
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Completion Banner if All Done */}
      {isCourseComplete && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
              Computer Networks Curriculum Accomplished!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              You have completed all {totalModules} syllabus modules and passed every academic unit examination benchmark.
            </p>
          </div>
        </div>
      )}

      {/* 3. Editorial Timeline for Each Unit */}
      <div className="space-y-12">
        {units.map((unit, unitIdx) => {
          const isUnlocked = isUnitUnlocked(unit.id);
          const unitModules = unit.modules || [];
          const unitCompletedCount = unitModules.filter((m) => completedModules.includes(m.id)).length;
          const unitTotal = unitModules.length;
          const unitProgress = unitTotal > 0 ? Math.round((unitCompletedCount / unitTotal) * 100) : 0;
          const allModulesDone = unitCompletedCount === unitTotal && unitTotal > 0;

          const unitIdStr = unit.id as string;
          const isU3 = unitIdStr === 'unit_3' || unitIdStr === 'unit-3';
          const isU4 = unitIdStr === 'unit_4' || unitIdStr === 'unit-4';
          const isU5 = unitIdStr === 'unit_5' || unitIdStr === 'unit-5';

          const isQuizPassed =
            (isU3 && (userProfile?.completedUnits || 0) >= 1) ||
            (isU4 && (userProfile?.completedUnits || 0) >= 2) ||
            (isU5 && (userProfile?.completedUnits || 0) >= 3) ||
            (userProfile?.completedSteps || []).includes(`quiz_${unit.id}`);

          return (
            <section
              key={unit.id}
              className={`bg-white dark:bg-[#172033] border rounded-3xl p-6 sm:p-8 transition-all ${
                isUnlocked
                  ? 'border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'border-slate-200/60 dark:border-slate-800/60 opacity-60'
              }`}
            >
              {/* Unit Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs border ${
                      isQuizPassed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : isUnlocked
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200'
                    }`}
                  >
                    {isQuizPassed ? <Check size={18} className="stroke-[3]" /> : isUnlocked ? `U${unitIdx + 3}` : <Lock size={16} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Academic Unit {unitIdx + 3}
                      </span>
                      <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {unitTotal} Modules
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {unit.title}
                    </h2>
                  </div>
                </div>

                {/* Status Badge & Add Module to Unit Button */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setAddModuleUnitId(unit.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title={`Add new module to ${unit.title}`}
                  >
                    <Plus size={13} />
                    <span>Add Module</span>
                  </button>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isQuizPassed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : isUnlocked
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isQuizPassed ? 'Unit Passed ✓' : isUnlocked ? `${unitProgress}% In Progress` : 'Locked Unit'}
                  </span>
                </div>
              </div>

              {/* Editorial Timeline with Move Up / Move Down Controls */}
              <div className="pt-6">
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
                  {unitModules.map((mod, modIdx) => {
                    const isModCompleted = completedModules.includes(mod.id);
                    const formattedNumber = String(modIdx + 1).padStart(2, '0');
                    const isCustomMod = (mod as any).isCustom || mod.id.startsWith('mod_');

                    // Sequential unlocking: a module is only unlocked if unit is unlocked AND
                    // (it is the first module in unit, OR the previous module is completed, OR it is already completed)
                    const prevMod = modIdx > 0 ? unitModules[modIdx - 1] : null;
                    const isPrevCompleted = modIdx === 0 || (prevMod ? completedModules.includes(prevMod.id) : false);
                    const isModUnlocked = isUnlocked && (isModCompleted || isPrevCompleted);

                    return (
                      <div
                        key={mod.id}
                        className="relative group transition-all"
                      >
                        {/* Timeline Node Dot on Left Line */}
                        <div
                          className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                            isModCompleted
                              ? 'bg-emerald-500 border-white dark:border-slate-900 ring-2 ring-emerald-200 dark:ring-emerald-900'
                              : isModUnlocked
                              ? 'bg-blue-600 border-white dark:border-slate-900 ring-2 ring-blue-200 dark:ring-blue-900'
                              : 'bg-slate-300 dark:bg-slate-700 border-white dark:border-slate-900'
                          }`}
                        />

                        {/* Module Row */}
                        <div
                          onClick={() => {
                            if (!isModUnlocked) return;
                            onSelectLesson(mod.id, unitIdx);
                          }}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isModUnlocked
                              ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 cursor-pointer shadow-2xs hover:shadow-xs'
                              : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                                {formattedNumber}
                              </span>
                              <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                {mod.duration || `${mod.readTimeMinutes || 7} Min Read`}
                              </span>

                              {isCustomMod && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                  Custom Added
                                </span>
                              )}

                              {isModCompleted ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                  <Check size={11} className="stroke-[3]" />
                                  <span>Done</span>
                                </span>
                              ) : !isModUnlocked ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                  <Lock size={10} />
                                  <span>Locked</span>
                                </span>
                              ) : null}
                            </div>

                            <h3 className={`text-base font-bold transition-colors ${
                              isModUnlocked 
                                ? 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400' 
                                : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {mod.title}
                            </h3>

                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                              {mod.lesson?.hook || mod.pedagogy?.hook || 'Core networking architecture, packet handling, and protocol mechanics.'}
                            </p>

                            {!isModUnlocked && prevMod && (
                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 pt-0.5">
                                <Lock size={11} />
                                <span>Complete {prevMod.title} to unlock this module</span>
                              </div>
                            )}
                          </div>

                          {/* Right Controls: Move Up, Move Down, Delete (if custom), and Start / Review / Locked */}
                          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                            
                            {/* Reorder / Move Controls */}
                            <div className="flex items-center bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl p-0.5">
                              <button
                                onClick={(e) => handleMoveModule(unit.id, mod.id, 'up', e)}
                                disabled={modIdx === 0}
                                className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-500 rounded transition-colors cursor-pointer"
                                title="Move Module Up"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                onClick={(e) => handleMoveModule(unit.id, mod.id, 'down', e)}
                                disabled={modIdx === unitModules.length - 1}
                                className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-500 rounded transition-colors cursor-pointer"
                                title="Move Module Down"
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>

                            {/* Delete custom module if applicable */}
                            {isCustomMod && (
                              <button
                                onClick={(e) => handleDeleteModule(mod.id, e)}
                                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Remove Custom Module"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}

                            {isModUnlocked ? (
                              <GooeyButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectLesson(mod.id, unitIdx);
                                }}
                                variant="cyan"
                                size="sm"
                              >
                                <span>{isModCompleted ? 'Review' : 'Start'}</span>
                                <ChevronRight size={14} />
                              </GooeyButton>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-300/60 dark:border-slate-700 select-none">
                                <Lock size={12} />
                                <span>Locked</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Unit Final Challenge Exam Milestone Card */}
                <div className="mt-8 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                        isQuizPassed
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : allModulesDone && isUnlocked
                          ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {allModulesDone || isQuizPassed ? <Award size={24} /> : <Lock size={20} />}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Benchmark Assessment
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {unit.title}: Final Unit Examination
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isQuizPassed
                          ? 'Benchmark passed with verified credentials.'
                          : allModulesDone
                          ? 'All modules finished! Take the unit final challenge exam to unlock next unit.'
                          : `Complete all ${unitTotal} modules above to unlock the final examination (${unitCompletedCount}/${unitTotal} finished).`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!isUnlocked || (!allModulesDone && !isQuizPassed)) return;
                      setActiveQuizUnitId(unit.id);
                    }}
                    disabled={!isUnlocked || (!allModulesDone && !isQuizPassed)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-2 ${
                      isQuizPassed
                        ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer'
                        : allModulesDone && isUnlocked
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                        : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-300/50 dark:border-slate-700 cursor-not-allowed opacity-75'
                    }`}
                  >
                    {isQuizPassed ? (
                      'Retake Exam'
                    ) : allModulesDone ? (
                      'Take Final Exam →'
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>Locked: Finish All {unitTotal} Modules</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Unit Challenge Examination Modal */}
      {activeQuizUnitId && (
        <UnitChallengeQuizModal
          unitId={activeQuizUnitId}
          isOpen={!!activeQuizUnitId}
          onClose={() => setActiveQuizUnitId(null)}
          onPassChallenge={handlePassUnitChallenge}
        />
      )}

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isAddCourseOpen}
        onClose={() => setIsAddCourseOpen(false)}
        onCourseAdded={(courseId) => setSelectedCourseId(courseId)}
      />

      {/* Add Module Modal */}
      <AddModuleModal
        isOpen={!!addModuleUnitId}
        defaultUnitId={addModuleUnitId || 'unit_3'}
        onClose={() => setAddModuleUnitId(null)}
        onModuleAdded={() => {}}
      />

    </div>
  );
};
