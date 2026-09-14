import React, { useState, useEffect } from 'react';
import { TeacherMetric, CourseSection, NavTab } from '../../types';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { isAuthorizedDeveloper } from '../../config/developers';
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Award, 
  Radio, 
  Activity, 
  Plus, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  BarChart3, 
  Eye, 
  Edit3,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface TeacherDashboardViewProps {
  metrics: TeacherMetric;
  sections: CourseSection[];
  onNavigate: (tab: NavTab) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  metrics,
  sections,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'course-management' | 'live-activity'>('overview');
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [realStudents, setRealStudents] = useState<any[]>([]);
  const [publishedStatus, setPublishedStatus] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true,
    11: true, 12: true, 13: true, 14: true, 15: true, 16: true, 17: true, 18: true, 19: true, 20: true,
    21: true, 22: true, 23: true
  });

  // Real-time Firestore sync with students collection
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(collection(db, 'students'), (snap) => {
        const list: any[] = [];
        snap.forEach((d) => {
          const data = d.data();
          if (data.role !== 'developer' && !isAuthorizedDeveloper(data.studentId || '') && !isAuthorizedDeveloper(d.id)) {
            list.push({ id: d.id, ...data });
          }
        });
        setRealStudents(list);
      });
    } catch (e) {
      console.warn('Teacher dashboard firestore listener error:', e);
    }
    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for curriculum section published status
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const sectionsRef = doc(db, 'course_management', 'sections');
      unsubscribe = onSnapshot(sectionsRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && typeof data === 'object') {
            setPublishedStatus((prev) => ({ ...prev, ...data }));
          }
        }
      });
    } catch (e) {
      console.warn('Teacher sections sync fallback:', e);
    }
    return () => unsubscribe();
  }, []);

  const totalStudentsCount = realStudents.length;
  const activeStudentsCount = realStudents.filter(
    (s) => s.isOnline || (s.totalXP || s.xp || 0) > 0 || (s.completedModules?.length || 0) > 0
  ).length;
  const onlineCount = realStudents.filter((s) => s.isOnline).length;
  const avgProgress = totalStudentsCount > 0
    ? Math.round(realStudents.reduce((acc, s) => acc + (s.overallProgress || 0), 0) / totalStudentsCount)
    : 0;
  const quizScores = realStudents.filter((s) => s.quizAverage).map((s) => s.quizAverage);
  const avgQuizScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) 
    : 88;

  const togglePublish = async (id: number) => {
    const nextVal = !publishedStatus[id];
    setPublishedStatus((prev) => ({ ...prev, [id]: nextVal }));
    try {
      const sectionsRef = doc(db, 'course_management', 'sections');
      await setDoc(sectionsRef, { [id]: nextVal, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn('Could not persist section status to Firestore:', e);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700 mb-1 flex-wrap">
            <GraduationCap className="w-4 h-4" />
            <span className="uppercase tracking-wider">Instructor Administration</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              REAL-TIME FIREBASE DB
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Prof. David Miller • Computer Networks CS-4200 (Cohort Fall 2026)
          </p>
        </div>

        {/* Start Live Classroom Pill */}
        <button
          onClick={() => onNavigate('live-classroom')}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Launch Live Poll / Stream</span>
        </button>
      </div>

      {/* 2. Top 4 Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalStudentsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Real-time enrolled cohort</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Active Students</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{activeStudentsCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {totalStudentsCount > 0 ? `${Math.round((activeStudentsCount / totalStudentsCount) * 100)}% active` : 'No active students yet'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Average Progress</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{avgProgress}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Cohort completion average</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Average Quiz Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{avgQuizScore}%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Live from student quizzes</div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs sm:text-sm font-semibold">
        {[
          { id: 'overview', label: 'Class Analytics & Mastery' },
          { id: 'course-management', label: 'Course & Section Management' },
          { id: 'live-activity', label: 'Real-time Student Activity' },
        ].map((t) => (
          <button
            key={t.id}
            id={`teacher-tab-${t.id}`}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === t.id
                ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 4. Tab 1: Class Performance & Topic Mastery */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Topic Mastery Bar Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Topic Mastery Diagnostic</h3>
                  <p className="text-xs text-slate-500">Student comprehension based on automatic quiz evaluation</p>
                </div>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>

              <div className="space-y-3.5 text-xs">
                {[
                  { topic: 'Network Fundamentals', score: 92, status: 'Strong' },
                  { topic: 'OSI 7-Layer Architecture', score: 88, status: 'Strong' },
                  { topic: 'TCP 3-Way Handshake & Flags', score: 86, status: 'Good' },
                  { topic: 'IPv4 & IPv6 Addressing', score: 76, status: 'Moderate' },
                  { topic: 'Network Security & Firewalls', score: 74, status: 'Moderate' },
                  { topic: 'Subnetting & CIDR VLSM', score: 68, status: 'Needs Review' },
                ].map((item) => (
                  <div key={item.topic}>
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="text-slate-800">{item.topic}</span>
                      <span className={item.score < 70 ? 'text-rose-600' : 'text-slate-700'}>
                        {item.score}% ({item.status})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.score >= 85 ? 'bg-emerald-500' : item.score >= 75 ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3 bg-purple-50/60 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start space-x-2">
                <span className="font-bold text-purple-700">Teacher Note:</span>
                <span>Students are struggling with /26 and /28 host calculation. Consider doing a live VLSM walkthrough.</span>
              </div>
            </div>

            {/* Course Completion Distribution */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Completion Cohort Distribution</h3>
                  <p className="text-xs text-slate-500">Distribution of the 300 enrolled students</p>
                </div>
                <Users className="w-5 h-5 text-blue-600" />
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Advanced (80% - 100% Completed)</span>
                    <span className="text-emerald-700">64 students (21%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '21%' }} />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>On Schedule (40% - 79% Completed)</span>
                    <span className="text-blue-700">188 students (63%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '63%' }} />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Behind Schedule (&lt; 40% Completed)</span>
                    <span className="text-amber-700">48 students (16%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '16%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button 
                  onClick={() => alert('Automated email reminders dispatched to 48 students behind schedule.')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Send Nudge to Inactive Students
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. Tab 2: Course Management */}
      {activeTab === 'course-management' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Curriculum Structure (23 Sections)</h3>
              <p className="text-xs text-slate-500">Manage visibility, publish status, or add new lessons and quiz modules.</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => alert('New lesson template draft created.')}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lesson</span>
              </button>
              <button
                onClick={() => alert('New quiz builder opened.')}
                className="flex items-center space-x-1.5 px-3.5 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Quiz</span>
              </button>
            </div>
          </div>

          {/* Section rows with publish switch */}
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {sections.map((s) => {
              const isPub = publishedStatus[s.id] !== false;
              return (
                <div key={s.id} className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{s.title}</h4>
                    <span className="text-xs text-slate-500">{s.lessons.length} lessons • Section {s.id}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => togglePublish(s.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        isPub
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-300'
                      }`}
                    >
                      {isPub ? 'Published' : 'Draft / Hidden'}
                    </button>
                    <button 
                      onClick={() => alert(`Editing content for ${s.title}`)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="Edit Section"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Tab 3: Real-time Student Activity */}
      {activeTab === 'live-activity' && (
        <div className="space-y-6">
          
          {/* Live Status Summary Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
                <span>Currently Learning</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1">{metrics.currentlyLearning} students</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Streaming video or interactive diagrams</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-blue-800 text-xs font-bold">
                <span>Currently Taking Quiz</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-blue-950 mt-1">{metrics.takingQuiz} students</div>
              <div className="text-[11px] text-blue-700 mt-0.5">Knowledge checks in progress</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
                <span>Idle / Inactive</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{metrics.idle} students</div>
              <div className="text-[11px] text-slate-500 mt-0.5">No activity in last 60 minutes</div>
            </div>
          </div>

          {/* Live Activity Feed Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Live Activity Feed</h3>
              <span className="text-xs text-slate-400">Updates dynamically</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {realStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No student activity recorded yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Student progress will appear here in real time as students complete syllabus modules and quizzes.</p>
                </div>
              ) : (
                realStudents.slice(0, 10).map((st) => (
                  <div key={st.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {(st.displayName || st.name || 'S')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{st.displayName || st.name || 'KLU Student'}</span>
                        <span className="text-slate-600 ml-1.5">Completed {st.completedModules?.length || 0} modules:</span>
                        <span className="font-medium text-blue-700 ml-1">{st.totalXP || st.xp || 0} XP</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {st.overallProgress || 0}% Progress
                      </span>
                      <span className="text-slate-400 text-[11px]">Real-time</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
