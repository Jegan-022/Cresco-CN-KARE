const fs = require('fs');

const content = `import React, { useState, useEffect, useMemo } from 'react';
import { Course, StudentProfile, NavTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CURRICULUM } from '../../data/courseData';
import { 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Activity, 
  Users, 
  GraduationCap, 
  Award,
  Network,
  Sparkles,
  Flame
} from 'lucide-react';

export interface StudentFirestoreData {
  uid?: string;
  name?: string;
  displayName?: string;
  studentId?: string;
  email?: string;
  college?: string;
  course?: string;
  year?: string;
  section?: string;
  role?: 'student' | 'teacher';
  totalXP?: number;
  xp?: number;
  streak?: number;
  overallProgress?: number;
  completedModules?: string[];
  unlockedUnits?: string[];
}

interface HomeViewProps {
  primaryCourse: Course;
  secondaryCourses: Course[];
  studentProfile?: StudentProfile;
  onNavigate: (tab: NavTab, lessonId?: string, sectionId?: number) => void;
  onStartQuiz: () => void;
  onOpenUnitChallenge?: (unitId: 'unit-3' | 'unit-4' | 'unit-5') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate
}) => {
  const { userProfile, currentUser } = useAuth();
  
  const [studentData, setStudentData] = useState<StudentFirestoreData | null>(null);

  useEffect(() => {
    if (userProfile) {
      setStudentData(userProfile as any);
    } else if (!currentUser) {
      setStudentData(null);
    }
  }, [userProfile, currentUser]);

  // Real student identity
  const studentId = studentData?.studentId || userProfile?.studentId || (currentUser?.email ? currentUser.email.split('@')[0] : '—');
  const studentName = studentData?.displayName || studentData?.name || userProfile?.displayName || userProfile?.name || currentUser?.displayName || studentId || 'Student';

  // Strictly real student metrics
  const streakDays = typeof studentData?.streak === 'number' 
    ? studentData.streak 
    : (typeof userProfile?.streak === 'number' ? userProfile.streak : 0);
    
  const totalXp = typeof studentData?.totalXP === 'number' 
    ? studentData.totalXP 
    : (typeof studentData?.xp === 'number' 
        ? studentData.xp 
        : (typeof userProfile?.totalXP === 'number' ? userProfile.totalXP : 0));
        
  const completedModules = Array.isArray(studentData?.completedModules)
    ? studentData.completedModules
    : (Array.isArray(userProfile?.completedModules) ? userProfile.completedModules : []);

  // Overall course progress
  const totalModules = CURRICULUM.reduce((acc, unit) => acc + unit.modules.length, 0);
  const totalCompleted = completedModules.length;
  const overallProgress = totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#1c1d21] text-slate-200 py-8 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 mb-8">
        
        {/* Main Dashboard Card */}
        <div className="flex-1 bg-[#25262b] rounded-xl p-6 border border-slate-700/50 shadow-lg relative overflow-hidden">
          
          {/* Personalized Welcome */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-700/50">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome, {studentName}</h1>
              <p className="text-sm text-slate-400 mt-1">Student Portal • {studentId}</p>
            </div>
            
            {/* Real-time Metrics Badges */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 bg-[#1c1d21] border border-slate-700/50 rounded-xl flex items-center space-x-2 text-xs">
                <Flame className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="text-slate-400">Streak: </span>
                  <strong className="text-white font-mono">{streakDays} Days</strong>
                </div>
              </div>
              <div className="px-3.5 py-2 bg-[#1c1d21] border border-slate-700/50 rounded-xl flex items-center space-x-2 text-xs">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <div>
                  <span className="text-slate-400">Score: </span>
                  <strong className="text-white font-mono">{totalXp} XP</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
              <Network className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Computer Networks</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Practical course on Computer Networks based on the syllabus followed at Engineering colleges in India. Solutions and approaches explained using interactive simulators.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-slate-400"/> {totalModules} Modules</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400"/> 15 Hours</div>
                <div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400"/> 90 Activities</div>
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
             <button 
               onClick={() => onNavigate('courses')}
               className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-8 rounded shadow-lg transition-colors whitespace-nowrap"
             >
               {totalCompleted > 0 ? 'Resume Learning' : 'Start Course'}
             </button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="w-full lg:w-80 bg-[#25262b] rounded-xl p-6 border border-slate-700/50 shadow-lg flex flex-col items-center justify-center text-center">
          <div className="w-40 h-28 bg-slate-100 rounded mb-4 relative overflow-hidden shadow-inner flex flex-col items-center justify-center p-2">
             <Award className="w-10 h-10 text-amber-600 mb-1" />
             <div className="text-[9px] font-bold text-slate-800 uppercase tracking-widest">Certificate</div>
             <div className="text-[7px] text-slate-500 mt-1">on Completion</div>
             <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end opacity-50">
               <div className="w-6 h-1 bg-slate-300 rounded-full"></div>
               <div className="w-4 h-4 rounded-full border border-slate-300"></div>
             </div>
          </div>
          <h3 className="text-sm font-bold text-white mb-2">Certification available</h3>
          <p className="text-xs text-slate-400">
            On Completing all the lessons in this course, you'll get a course completion certificate.
          </p>
        </div>
      </div>

      {/* Curriculum List (Mirrored on Dashboard for quick access) */}
      <div className="max-w-6xl mx-auto space-y-4">
        {CURRICULUM.map((unit, index) => {
          const unitCompletedModules = unit.modules.filter(m => completedModules.includes(m.id)).length;
          const unitTotal = unit.modules.length;
          const unitProgress = unitTotal > 0 ? Math.round((unitCompletedModules / unitTotal) * 100) : 0;
          
          return (
            <div key={unit.id} className="bg-[#25262b] rounded-xl p-6 border border-slate-700/50 shadow-sm transition-all hover:border-slate-600">
              <div className="flex items-start gap-6">
                
                {/* Number Circle */}
                <div className="w-14 h-14 rounded-xl bg-[#1c1d21] shadow-inner border border-slate-800 flex items-center justify-center text-2xl font-bold text-slate-400 flex-shrink-0">
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1">
                  <h2 className="text-lg font-bold text-white mb-1">{unit.title.split(': ')[1] || unit.title}</h2>
                  <div className="text-xs font-semibold text-emerald-500 mb-6">
                    {unitProgress}% Solved ({unitCompletedModules}/{unitTotal})
                  </div>
                  
                  {/* Modules List */}
                  <div className="space-y-4">
                    {unit.modules.map(mod => {
                      const isCompleted = completedModules.includes(mod.id);
                      return (
                        <div key={mod.id} className="flex items-center gap-3">
                          <div className="w-5 flex justify-center flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : null}
                          </div>
                          <button
                            onClick={() => onNavigate('courses', mod.id, index)}
                            className="text-blue-500 hover:text-blue-400 hover:underline text-sm font-medium text-left transition-colors"
                          >
                            {mod.title}
                          </button>
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

fs.writeFileSync('src/components/views/HomeView.tsx', content);
console.log("Rewrote HomeView.tsx successfully.");
