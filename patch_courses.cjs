const fs = require('fs');

const content = `import React, { useMemo } from 'react';
import { Course, CourseSection, NavTab } from '../../types';
import { NEW_CURRICULUM } from '../../data/newCourseData';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Activity, 
  Users, 
  GraduationCap, 
  Award,
  Network,
  Sparkles
} from 'lucide-react';

interface CoursesViewProps {
  course: Course;
  sections: CourseSection[];
  onSelectLesson: (lessonId: string, sectionId: number) => void;
  onNavigate: (tab: NavTab) => void;
  onMarkLessonCompleted?: (lessonId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  onSelectLesson
}) => {
  const { userProfile } = useAuth();
  
  const completedModules = useMemo(() => {
    return userProfile?.completedModules || [];
  }, [userProfile?.completedModules]);

  // Overall course progress
  const totalModules = NEW_CURRICULUM.units.reduce((acc, unit) => acc + unit.modules.length, 0);
  const totalCompleted = completedModules.length;
  const overallProgress = totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#1c1d21] text-slate-200 py-8 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 mb-8">
        
        {/* Main Course Info Card */}
        <div className="flex-1 bg-[#25262b] rounded-xl p-6 border border-slate-700/50 shadow-lg relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
              <Network className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{NEW_CURRICULUM.courseTitle}</h1>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {NEW_CURRICULUM.courseDescription}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-slate-400"/> {totalModules} Modules</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400"/> ~2 Hours Read</div>
                <div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400"/> Theory & Concepts</div>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400"/> 1.4K Learners</div>
                <div className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-slate-400"/> College Level</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 bg-[#1c1d21] p-4 rounded-lg border border-slate-700/50">
             <div className="flex-1">
               <div className="flex justify-between text-xs mb-1.5 font-medium">
                 <span className="text-slate-300 flex items-center gap-2">
                   <Award className="w-4 h-4 text-amber-500" />
                   Your Progress:
                 </span>
                 <span className="text-emerald-500">{overallProgress}% Completed ({totalCompleted}/{totalModules})</span>
               </div>
               <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                   style={{ width: \`\${overallProgress}%\` }}
                 />
               </div>
             </div>
             <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-8 rounded shadow-lg transition-colors whitespace-nowrap">
               Resume
             </button>
          </div>
        </div>
      </div>

      {/* Curriculum List */}
      <div className="max-w-6xl mx-auto space-y-4">
        {NEW_CURRICULUM.units.map((unit, index) => {
          const unitCompletedModules = unit.modules.filter(m => completedModules.includes(m.id)).length;
          const unitTotal = unit.modules.length;
          const unitProgress = unitTotal > 0 ? Math.round((unitCompletedModules / unitTotal) * 100) : 0;
          
          return (
            <div key={unit.id} className="bg-[#25262b] rounded-xl p-6 border border-slate-700/50 shadow-sm transition-all hover:border-slate-600">
              <div className="flex items-start gap-6">
                
                {/* Number Circle */}
                <div className="w-16 h-16 rounded-xl bg-[#1c1d21] shadow-inner border border-slate-800 flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                  <span className="text-xl mb-0.5" style={{ color: unit.color }}>{unit.icon}</span>
                  <span className="text-xs font-bold text-slate-500">U{index + 3}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1">
                  <h2 className="text-lg font-bold text-white mb-2">{unit.title}</h2>
                  <p className="text-sm text-slate-400 mb-4">{unit.summary}</p>

                  <div className="text-xs font-semibold text-emerald-500 mb-6 flex items-center gap-2">
                    <div className="w-full bg-slate-700 h-1.5 rounded-full max-w-xs overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: \`\${unitProgress}%\` }}></div>
                    </div>
                    {unitProgress}% Solved ({unitCompletedModules}/{unitTotal})
                  </div>
                  
                  {/* Modules List */}
                  <div className="space-y-3">
                    {unit.modules.map(mod => {
                      const isCompleted = completedModules.includes(mod.id);
                      return (
                        <div key={mod.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-[#1c1d21]/50 border border-slate-700/30 hover:border-blue-500/30 transition-colors group">
                          <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1">
                            <div className="w-5 flex justify-center flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-blue-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <button
                                onClick={() => onSelectLesson(mod.id, index)}
                                className="text-blue-400 hover:text-blue-300 text-sm font-semibold text-left transition-colors"
                              >
                                {mod.title}
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 pl-8 sm:pl-0 text-xs font-mono text-slate-500 shrink-0">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              +{mod.xp} XP
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {mod.readTimeMinutes} min read
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/views/CoursesView.tsx', content);
console.log("Rewrote CoursesView.tsx to use new JSON structure successfully.");
