import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { TOTAL_MODULES_COUNT } from '../../data/courseContent';
import { NavTab } from '../../types';
import { isAuthorizedDeveloper } from '../../config/developers';
import { STUDENT_CREDENTIALS, STUDENT_CREDENTIALS_CSV, StudentCredential } from '../../data/studentCredentials';
import { 
  ShieldAlert, 
  RotateCcw, 
  CheckCircle2, 
  Users, 
  Search, 
  Download, 
  TrendingUp, 
  Clock, 
  Award, 
  AlertTriangle, 
  X, 
  Terminal, 
  LogOut, 
  Flame, 
  Check, 
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpRight,
  Key,
  Copy,
  CheckCheck,
  FileSpreadsheet,
  FileText,
  Lock,
  ExternalLink,
  Database,
  Layers,
  Cloud,
  Server,
  FileCode,
  UploadCloud,
  FolderTree,
  BookOpen
} from 'lucide-react';
import { seedAllFirestoreCollections, ALL_SEEDS } from '../../services/firestoreSeedService';
import { uploadCategorizedAsset } from '../../services/storageService';

interface StudentData {
  uid: string;
  name?: string;
  displayName?: string;
  studentId?: string;
  email?: string;
  college?: string;
  completedModules?: string[];
  overallProgress?: number;
  modulesCompleted?: number;
  totalXP?: number;
  xp?: number;
  courseCompletedAt?: any;
  updatedAt?: any;
  isOnline?: boolean;
  lastLogin?: any;
}

interface DeveloperDashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DeveloperDashboardView: React.FC<DeveloperDashboardViewProps> = ({ onNavigate }) => {
  const { userProfile, logout, resetStudentCourse } = useAuth();

  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress' | 'not-started'>('all');
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isRetryingDb, setIsRetryingDb] = useState(false);

  // Reset Modal State
  const [selectedStudentForReset, setSelectedStudentForReset] = useState<StudentData | null>(null);
  const [resetXP, setResetXP] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Manual Reset Input
  const [manualRollNumber, setManualRollNumber] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  // Main Dashboard Tab: 'progress' | 'credentials' | 'firestore'
  const [activeMainTab, setActiveMainTab] = useState<'progress' | 'credentials' | 'firestore'>('progress');
  const [credentialSearch, setCredentialSearch] = useState('');
  const [showPasswords, setShowPasswords] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawCsv, setShowRawCsv] = useState(false);

  // Firestore & Storage Management State
  const [isSeedingFirestore, setIsSeedingFirestore] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState<{ collection: string; current: number; total: number; status: string } | null>(null);
  const [seedingSummary, setSeedingSummary] = useState<{ totalSeeded: number; errors: string[] } | null>(null);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [uploadedAssetUrl, setUploadedAssetUrl] = useState<string | null>(null);
  const [activeRulesView, setActiveRulesView] = useState<'none' | 'firestore' | 'storage'>('none');

  const handleSeedFirestore = async () => {
    setIsSeedingFirestore(true);
    setSeedingSummary(null);
    try {
      const res = await seedAllFirestoreCollections({
        overwrite: true,
        onProgress: (collection, current, total, status) => {
          setSeedingProgress({ collection, current, total, status });
        }
      });
      setSeedingSummary({ totalSeeded: res.seededCount, errors: res.errors });
      if (res.success) {
        showToast(`Successfully seeded all 15 Firestore collections (${res.seededCount} items)!`, 'success');
      } else {
        showToast(`Seeded with ${res.errors.length} warnings.`, 'error');
      }
    } catch (err: any) {
      showToast(`Seeding failed: ${err.message}`, 'error');
    } finally {
      setIsSeedingFirestore(false);
    }
  };

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAsset(true);
    try {
      const res = await uploadCategorizedAsset(file, 'images', 'test_uploads');
      setUploadedAssetUrl(res.url);
      showToast(`Uploaded ${file.name} to Firebase Storage!`, 'success');
    } catch (err: any) {
      showToast(`Storage upload error: ${err.message}`, 'error');
    } finally {
      setUploadingAsset(false);
    }
  };

  const handleCopy = (text: string, key: string, label: string = 'Copied to clipboard!') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(label, 'success');
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleDownloadCredentialsCSV = () => {
    try {
      const blob = new Blob([STUDENT_CREDENTIALS_CSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'students_credentials.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded students_credentials.csv successfully!', 'success');
    } catch {
      const link = document.createElement('a');
      link.href = '/students_credentials.csv';
      link.download = 'students_credentials.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloaded students_credentials.csv', 'success');
    }
  };

  const filteredCredentials = STUDENT_CREDENTIALS.filter(s => {
    const q = credentialSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.registerNumber.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.shortId.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  // Merge any locally cached student profiles with remote data
  const getMergedStudents = (firestoreStudents: StudentData[]): StudentData[] => {
    const list = [...firestoreStudents];
    if (typeof window === 'undefined') return list;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('klu_profile_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const data = JSON.parse(raw);
              const sId = data.studentId || key.replace('klu_profile_', '');
              if (data.role !== 'developer' && !isAuthorizedDeveloper(sId) && !isAuthorizedDeveloper(data.email || '')) {
                const uid = data.uid || `klu_${sId}`;
                const completedList = data.completedModules || [];
                const calculatedProgress = data.overallProgress ?? Math.min(100, Math.round((completedList.length / TOTAL_MODULES_COUNT) * 100));
                const calculatedXP = data.totalXP ?? data.xp ?? 0;

                const existingIndex = list.findIndex(s => s.uid === uid || s.studentId === sId);
                if (existingIndex >= 0) {
                  const remote = list[existingIndex];
                  if ((completedList.length > (remote.completedModules?.length || 0)) || (calculatedXP > (remote.totalXP || 0))) {
                    list[existingIndex] = {
                      ...remote,
                      ...data,
                      completedModules: completedList,
                      modulesCompleted: data.modulesCompleted ?? completedList.length,
                      overallProgress: calculatedProgress,
                      totalXP: calculatedXP,
                    };
                  }
                } else {
                  list.push({
                    uid,
                    ...data,
                    studentId: sId,
                    completedModules: completedList,
                    modulesCompleted: data.modulesCompleted ?? completedList.length,
                    overallProgress: calculatedProgress,
                    totalXP: calculatedXP,
                  });
                }
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.warn("Error scanning local student profiles:", e);
    }

    return list;
  };

  // Real-time Firestore sync on all students
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    try {
      const studentsRef = collection(db, 'students');
      unsubscribe = onSnapshot(
        studentsRef,
        (snapshot) => {
          setFirestoreError(null);
          const list: StudentData[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            const sId = data.studentId || docSnap.id.replace('klu_', '').replace('dev_', '');
            if (data.role === 'developer' || isAuthorizedDeveloper(sId) || isAuthorizedDeveloper(data.email || '')) {
              return;
            }
            const completedList = data.completedModules || [];
            const calculatedProgress = data.overallProgress ?? Math.min(100, Math.round((completedList.length / TOTAL_MODULES_COUNT) * 100));
            const calculatedXP = data.totalXP ?? data.xp ?? 0;

            list.push({
              uid: docSnap.id,
              ...data,
              completedModules: completedList,
              modulesCompleted: data.modulesCompleted ?? completedList.length,
              overallProgress: calculatedProgress,
              totalXP: calculatedXP,
              isOnline: !!data.isOnline,
              lastLogin: data.lastLogin,
            });
          });
          setStudents(getMergedStudents(list));
          setLoading(false);
        },
        (err: any) => {
          console.warn("Developer Dashboard Firestore sync error:", err);
          const errMsg = err?.message || String(err);
          if (errMsg.includes('PERMISSION_DENIED') || errMsg.includes('has not been used') || err?.code === 'permission-denied') {
            setFirestoreError("Cloud Firestore Database API is not initialized or not enabled in Firebase project 'computernetworks-af026'. Please create the database in the Firebase Console so student progress syncs across devices.");
          } else {
            setFirestoreError(errMsg);
          }
          setStudents(getMergedStudents([]));
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.warn("Failed to listen to students collection:", err);
      setFirestoreError(err?.message || String(err));
      setStudents(getMergedStudents([]));
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const handleRetryConnection = async () => {
    setIsRetryingDb(true);
    try {
      const snap = await getDocs(collection(db, 'students'));
      setFirestoreError(null);
      const list: StudentData[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const sId = data.studentId || docSnap.id.replace('klu_', '').replace('dev_', '');
        if (data.role === 'developer' || isAuthorizedDeveloper(sId) || isAuthorizedDeveloper(data.email || '')) {
          return;
        }
        const completedList = data.completedModules || [];
        const calculatedProgress = data.overallProgress ?? Math.min(100, Math.round((completedList.length / TOTAL_MODULES_COUNT) * 100));
        list.push({
          uid: docSnap.id,
          ...data,
          completedModules: completedList,
          modulesCompleted: data.modulesCompleted ?? completedList.length,
          overallProgress: calculatedProgress,
          totalXP: data.totalXP ?? data.xp ?? 0,
        });
      });
      setStudents(getMergedStudents(list));
      showToast("Successfully connected to Cloud Firestore!", "success");
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('PERMISSION_DENIED') || errMsg.includes('has not been used') || err?.code === 'permission-denied') {
        setFirestoreError("Cloud Firestore Database API is not initialized or not enabled in Firebase project 'computernetworks-af026'. Please create the database in the Firebase Console.");
      } else {
        setFirestoreError(errMsg);
      }
      showToast("Could not connect to Cloud Firestore. See warning banner above.", "error");
    } finally {
      setIsRetryingDb(false);
    }
  };

  // Compute Metrics
  const totalStudents = students.length;
  // A student has completed the course if they finished all modules OR overallProgress >= 100
  const completedStudents = students.filter(s => (s.completedModules?.length || 0) >= TOTAL_MODULES_COUNT || (s.overallProgress || 0) >= 100);
  const inProgressStudents = students.filter(s => {
    const count = s.completedModules?.length || 0;
    const progress = s.overallProgress || 0;
    return count > 0 && count < TOTAL_MODULES_COUNT && progress < 100;
  });
  const notStartedStudents = students.filter(s => (s.completedModules?.length || 0) === 0 && (s.overallProgress || 0) === 0);

  const cohortCompletionRate = totalStudents > 0 
    ? Math.round((completedStudents.length / totalStudents) * 100) 
    : 0;

  // Filter students based on query and selected status
  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (s.name || s.displayName || '').toLowerCase().includes(q);
    const idMatch = (s.studentId || '').toLowerCase().includes(q) || s.uid.toLowerCase().includes(q);
    const emailMatch = (s.email || '').toLowerCase().includes(q);
    const matchesQuery = !q || nameMatch || idMatch || emailMatch;

    if (!matchesQuery) return false;

    const count = s.completedModules?.length || 0;
    const progress = s.overallProgress || 0;
    const isCompleted = count >= TOTAL_MODULES_COUNT || progress >= 100;

    if (filterStatus === 'completed') return isCompleted;
    if (filterStatus === 'in-progress') return count > 0 && !isCompleted;
    if (filterStatus === 'not-started') return count === 0 && progress === 0;

    return true;
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Perform Student Reset
  const handleConfirmReset = async () => {
    if (!selectedStudentForReset) return;
    setIsResetting(true);
    try {
      await resetStudentCourse(selectedStudentForReset.uid, { resetXP });
      showToast(`Successfully reset course for ${selectedStudentForReset.name || selectedStudentForReset.studentId || 'Student'}.`);
      setSelectedStudentForReset(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset student course.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Quick Manual Reset
  const handleManualReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualRollNumber.trim();
    if (!cleanId) return;

    // Find student or target by UID
    const matched = students.find(s => 
      s.studentId?.toLowerCase() === cleanId.toLowerCase() || 
      s.uid.toLowerCase() === cleanId.toLowerCase() ||
      s.uid.toLowerCase() === `klu_${cleanId.toLowerCase()}`
    );

    const targetUid = matched ? matched.uid : (cleanId.startsWith('klu_') ? cleanId : `klu_${cleanId}`);

    setIsResetting(true);
    try {
      await resetStudentCourse(targetUid, { resetXP });
      showToast(`Successfully reset course for Roll Number: ${cleanId}.`);
      setManualRollNumber('');
      setShowManualModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset student course.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['UID', 'Roll Number', 'Name', 'Email', `Modules Completed (out of ${TOTAL_MODULES_COUNT})`, 'Progress Percent', 'Total XP', 'Status'];
    const rows = students.map(s => {
      const count = s.completedModules?.length || 0;
      const progress = s.overallProgress || 0;
      const isCompleted = count >= TOTAL_MODULES_COUNT || progress >= 100;
      const status = isCompleted ? 'Completed' : count > 0 ? 'In Progress' : 'Not Started';
      return [
        `"${s.uid}"`,
        `"${s.studentId || ''}"`,
        `"${s.name || s.displayName || 'Student'}"`,
        `"${s.email || ''}"`,
        count,
        `${progress}%`,
        s.totalXP || 0,
        status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `klu_cn_student_completion_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-semibold border ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
            : 'bg-red-950/90 border-red-500/50 text-red-200'
        } animate-in fade-in slide-in-from-bottom-5 duration-200`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Developer Header & Controls */}
      <div className="bg-[#11141B] border border-purple-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                Developer Console • Root Access
              </span>
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>REAL-TIME FIREBASE DB</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Developer Platform Control
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Logged in as: <strong className="text-purple-300 font-mono">{userProfile?.studentId || 'AUTHORIZED_DEVELOPER'}</strong> ({userProfile?.name || 'Platform Lead'})
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setActiveMainTab('credentials')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              activeMainTab === 'credentials'
                ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#1A1F2B] hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span>Student Passwords & CSV</span>
          </button>

          <button
            onClick={handleDownloadCredentialsCSV}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Download full student credentials CSV roster"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download Credentials CSV</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#1A1F2B] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset by Roll No.</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#1A1F2B] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Progress CSV</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Console</span>
          </button>
        </div>
      </div>

      {/* 2. Main Navigation Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveMainTab('progress')}
          className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === 'progress'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400'
              : 'bg-[#141822] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Course Completion & Reset Hub</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-[10px] font-mono font-bold">
            Live
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('credentials')}
          className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === 'credentials'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
              : 'bg-[#141822] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
          }`}
        >
          <Key className="w-4 h-4 text-blue-300" />
          <span>Student Credentials & CSV Roster</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[10px] font-mono font-bold">
            {STUDENT_CREDENTIALS.length} Students • CSV File
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('firestore')}
          className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === 'firestore'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
              : 'bg-[#141822] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-300" />
          <span>Firestore & Storage Architecture</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-mono font-bold">
            15 Collections • Storage SDK
          </span>
        </button>
      </div>

      {/* 3. SYLLABUS PROGRESS & RESET VIEW */}
      {activeMainTab === 'progress' && (
        <div className="space-y-8 animate-in fade-in duration-300">

      {/* Cloud Firestore Inactive / Permission Warning Banner */}
      {firestoreError && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Cloud Firestore Database Is Not Activated
                </h3>
                <p className="text-xs text-red-300">
                  Firebase Project: <span className="font-mono font-bold">computernetworks-af026</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleRetryConnection}
              disabled={isRetryingDb}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-red-600/30 cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetryingDb ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          <div className="p-3 bg-black/40 border border-red-500/20 rounded-xl text-xs text-slate-300 leading-relaxed font-mono">
            {firestoreError}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Student course completions cannot sync across multiple devices until <strong>Cloud Firestore</strong> is initialized in your Firebase Console. Please follow step 1 below to activate it in 30 seconds.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://console.firebase.google.com/project/computernetworks-af026/firestore"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <span>1. Click Here: Create Firestore Database (Firebase Console)</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <a
              href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=computernetworks-af026"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#1A1F2B] hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <span>2. Enable Firestore API in Google Cloud</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* 2. Top Metric Cards: Student Course Completion Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Online Students */}
        <div className="bg-[#11141B] border border-emerald-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1">
            <span className="flex items-center space-x-1.5">
              <span>Online Now</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Live DB</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
            {loading ? <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" /> : students.filter(s => s.isOnline).length}
          </div>
          <div className="text-xs text-emerald-500/80 font-medium mt-1">
            Active sessions in Firebase
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Total Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {loading ? <RefreshCw className="w-6 h-6 animate-spin text-slate-500" /> : totalStudents}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Registered KLU accounts
          </div>
        </div>

        {/* Completed Course (100% / 45 Modules) */}
        <div className="bg-[#11141B] border border-emerald-500/40 rounded-2xl p-5 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 opacity-10">
            <CheckCircle2 className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1">
            <span className="flex items-center space-x-1.5">
              <span>Course Completed (45/45)</span>
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">
            {loading ? <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" /> : completedStudents.length}
          </div>
          <div className="text-xs text-emerald-500 font-medium mt-1">
            {cohortCompletionRate}% of enrolled students finished
          </div>
        </div>

        {/* In Progress Students */}
        <div className="bg-[#11141B] border border-blue-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
            <span>In Progress (1-{TOTAL_MODULES_COUNT - 1} Modules)</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400 mt-1">
            {loading ? <RefreshCw className="w-6 h-6 animate-spin text-blue-500" /> : inProgressStudents.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Actively studying the syllabus
          </div>
        </div>

        {/* Not Started */}
        <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Not Started (0 Modules)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">
            {loading ? <RefreshCw className="w-6 h-6 animate-spin text-amber-500" /> : notStartedStudents.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Yet to complete Module 1
          </div>
        </div>

      </div>

      {/* 3. Cohort Completion Progress Bar */}
      <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Overall Cohort Syllabus Completion Rate</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                {completedStudents.length} / {totalStudents} Completed
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Percentage of students who have completed all {TOTAL_MODULES_COUNT} computer networking modules (Units 3, 4, and 5)
            </p>
          </div>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {cohortCompletionRate}%
          </span>
        </div>

        <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${cohortCompletionRate}%` }}
          />
        </div>
      </div>

      {/* 4. Student Directory & Reset Control Section */}
      <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Student Course Control & Reset Hub</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              View individual student completion states, monitor module progress, and reset course progress when required.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-[#1A1F2B] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'all' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'completed' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({completedStudents.length})
            </button>
            <button
              onClick={() => setFilterStatus('in-progress')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'in-progress' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              In Progress ({inProgressStudents.length})
            </button>
            <button
              onClick={() => setFilterStatus('not-started')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'not-started' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Not Started ({notStartedStudents.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or university email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1A1F2B] border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1A1F2B] text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Roll No. / Email</th>
                <th className="px-4 py-3">Modules (out of {TOTAL_MODULES_COUNT})</th>
                <th className="px-4 py-3">Course Progress</th>
                <th className="px-4 py-3">Total XP</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                    <span>Loading student records from Firestore...</span>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No student records matching your query or filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const completedCount = student.completedModules?.length || 0;
                  const progress = student.overallProgress || 0;
                  const isCompleted = completedCount >= TOTAL_MODULES_COUNT || progress >= 100;

                  return (
                    <tr key={student.uid} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                            {(student.name || student.displayName || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {student.name || student.displayName || 'Student'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              UID: {student.uid.slice(0, 14)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs">
                        <div className="text-slate-200">{student.studentId || 'N/A'}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{student.email || '—'}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-white">{completedCount}</span>
                        <span className="text-slate-500 text-xs"> / {TOTAL_MODULES_COUNT}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-mono font-semibold text-white">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-amber-400 font-semibold text-xs">
                        {student.totalXP || 0} XP
                      </td>

                      <td className="px-4 py-3">
                        {isCompleted ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        ) : completedCount > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <TrendingUp className="w-3 h-3" />
                            <span>In Progress</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            <span>Not Started</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentForReset(student);
                            setResetXP(false);
                          }}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors cursor-pointer"
                          title="Reset student course progress back to 0 modules"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Course</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
      </div>
      )}

      {/* 4. STUDENT CREDENTIALS & CSV ROSTER TAB */}
      {activeMainTab === 'credentials' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Credentials Header & Quick Action Banner */}
          <div className="bg-gradient-to-r from-blue-950/40 via-[#11141B] to-purple-950/30 border border-blue-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                    CSV Roster • Student Authentication
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    Direct Login Active
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                  <span>Student ID & Password Credentials Roster</span>
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generated from university roster (<code className="text-slate-300 font-mono">KLU_Student_Register_Email_List.csv</code>). All {STUDENT_CREDENTIALS.length} students can log in directly using their Register Number & assigned password. Google OAuth login is optional.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadCredentialsCSV}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                  title="Download students_credentials.csv to your computer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV File</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(STUDENT_CREDENTIALS_CSV, 'all-csv', 'Full CSV text copied to clipboard!')}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#1A1F2B] hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title="Copy full CSV text to clipboard"
                >
                  {copiedKey === 'all-csv' ? (
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-400" />
                  )}
                  <span>{copiedKey === 'all-csv' ? 'Copied CSV!' : 'Copy All CSV'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="flex items-center space-x-2 px-3.5 py-2.5 bg-[#1A1F2B] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title={showPasswords ? 'Mask passwords' : 'Show passwords'}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  <span>{showPasswords ? 'Hide Pwds' : 'Show Pwds'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRawCsv(!showRawCsv)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    showRawCsv
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-[#1A1F2B] hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title="Toggle raw CSV code view"
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>{showRawCsv ? 'Hide Raw CSV' : 'View Raw CSV'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics (4 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-4.5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Total Registered Students</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {STUDENT_CREDENTIALS.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Full university cohort roster
              </div>
            </div>

            <div className="bg-[#11141B] border border-emerald-500/30 rounded-2xl p-4.5 shadow-lg">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1">
                <span>Credentials Configured</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                {STUDENT_CREDENTIALS.length} / {STUDENT_CREDENTIALS.length}
              </div>
              <div className="text-xs text-emerald-500 mt-1">
                100% ready for student login
              </div>
            </div>

            <div className="bg-[#11141B] border border-purple-500/30 rounded-2xl p-4.5 shadow-lg">
              <div className="flex items-center justify-between text-purple-400 text-xs font-semibold mb-1">
                <span>Standard Password Syntax</span>
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-mono font-bold text-purple-300 mt-1">
                Klu@&lt;Roll5&gt;
              </div>
              <div className="text-xs text-slate-500 mt-1">
                e.g. Klu@40116 (also accepts 40116)
              </div>
            </div>

            <div className="bg-[#11141B] border border-indigo-500/30 rounded-2xl p-4.5 shadow-lg">
              <div className="flex items-center justify-between text-indigo-400 text-xs font-semibold mb-1">
                <span>Google OAuth Dependency</span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-lg font-bold text-indigo-300 mt-1">
                Bypassed / Optional
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Direct ID + password login enabled
              </div>
            </div>
          </div>

          {/* Collapsible Raw CSV Viewer */}
          {showRawCsv && (
            <div className="bg-[#0B0D13] border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-mono font-bold text-white">students_credentials.csv</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                    {STUDENT_CREDENTIALS.length} rows • text/csv
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(STUDENT_CREDENTIALS_CSV, 'raw-box', 'Copied raw CSV!')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1A1F2B] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    {copiedKey === 'raw-box' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'raw-box' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <a
                    href="/students_credentials.csv"
                    download="students_credentials.csv"
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                </div>
              </div>
              <pre className="text-xs font-mono text-slate-300 bg-black/60 p-4 rounded-xl overflow-x-auto max-h-72 leading-relaxed border border-slate-800/80 selection:bg-purple-600 selection:text-white">
                {STUDENT_CREDENTIALS_CSV}
              </pre>
            </div>
          )}

          {/* Credentials Table & Search */}
          <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span>Student Accounts & Passwords Table</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any copy icon to copy student Register Number or Password. Use search to find any student instantly.
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Showing <strong className="text-white">{filteredCredentials.length}</strong> of <strong className="text-white">{STUDENT_CREDENTIALS.length}</strong> accounts
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Student Name, Register Number (e.g. 99240040116 or 40116), Email, or Department..."
                value={credentialSearch}
                onChange={(e) => setCredentialSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1A1F2B] border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              {credentialSearch && (
                <button
                  type="button"
                  onClick={() => setCredentialSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#1A1F2B] text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Student ID / Roll No.</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">University Email</th>
                    <th className="px-4 py-3">Login Password</th>
                    <th className="px-4 py-3">Short ID</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredCredentials.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        No students matched &ldquo;{credentialSearch}&rdquo;. Try another search term.
                      </td>
                    </tr>
                  ) : (
                    filteredCredentials.map((student, idx) => {
                      const isDevUser = student.registerNumber === '99240040285' || student.registerNumber === '99240040279';
                      const rowKey = `s_${student.studentId}`;
                      const isCopied = copiedKey === rowKey;

                      return (
                        <tr 
                          key={student.studentId}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isDevUser ? 'bg-purple-950/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-center text-xs text-slate-500 font-mono">
                            {idx + 1}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-white text-xs">
                                {student.studentId}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(student.studentId, `id_${student.studentId}`, `Copied Student ID: ${student.studentId}`)}
                                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                                title="Copy Student ID"
                              >
                                {copiedKey === `id_${student.studentId}` ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                                {student.name.charAt(0)}
                              </div>
                              <span className="text-white text-xs font-semibold">
                                {student.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-slate-400 font-mono">
                                {student.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(student.email, `email_${student.studentId}`, `Copied Email: ${student.email}`)}
                                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                                title="Copy Email"
                              >
                                {copiedKey === `email_${student.studentId}` ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs px-2 py-1 rounded bg-[#1A1F2B] border border-slate-700 text-blue-300 font-bold">
                                {showPasswords ? student.password : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(student.password, `pwd_${student.studentId}`, `Copied Password for ${student.studentId}`)}
                                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                title="Copy Password"
                              >
                                {copiedKey === `pwd_${student.studentId}` ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-slate-400">
                              {student.shortId}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {isDevUser ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300">
                                Developer & Student
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                                Student
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy(
                                `User ID: ${student.studentId}\nPassword: ${student.password}\nName: ${student.name}\nEmail: ${student.email}`,
                                rowKey,
                                `Copied credentials for ${student.name}!`
                              )}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-colors cursor-pointer"
                              title="Copy full credentials pair"
                            >
                              {isCopied ? (
                                <>
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Login Info</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Direct Student Login Instruction Footer */}
            <div className="p-4 bg-[#1A1F2B]/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>How Students Sign In Without Google:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-slate-400">
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <strong className="text-slate-200 block mb-0.5">1. Enter Student ID</strong>
                  Student enters their 11-digit Register Number (e.g. <span className="font-mono text-blue-300">99240040116</span>) or roll suffix (<span className="font-mono text-blue-300">40116</span>).
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <strong className="text-slate-200 block mb-0.5">2. Enter Assigned Password</strong>
                  Student enters their portal password (e.g. <span className="font-mono text-blue-300">Klu@40116</span> or <span className="font-mono text-blue-300">40116</span>).
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <strong className="text-slate-200 block mb-0.5">3. Immediate Access</strong>
                  Student is signed in directly to the Computer Networks learning modules. No Google sign-in required.
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. FIRESTORE (NOSQL) + FIREBASE STORAGE ARCHITECTURE VIEW */}
      {activeMainTab === 'firestore' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header Overview Card */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#11141B] to-[#11141B] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Cloud Firestore (NoSQL) + Firebase Storage Setup
                  </h2>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Cresco CN architecture powered by Google Firebase. Houses 15 top-level NoSQL collections for pedagogical modules, XP progression, and mastery tracking alongside segmented Cloud Storage for multimedia assets.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Project: computernetworks-af026</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
                    Mode: Production Mode
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    DB: (default)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    Storage: computernetworks-af026.firebasestorage.app
                  </span>
                </div>
              </div>

              {/* Seed Button */}
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleSeedFirestore}
                  disabled={isSeedingFirestore}
                  className="flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isSeedingFirestore ? 'animate-spin' : ''}`} />
                  <span>{isSeedingFirestore ? 'Syncing Collections...' : 'Seed All 15 Collections'}</span>
                </button>
                <span className="text-[10px] text-slate-400 text-center font-mono">
                  CLI: <code className="text-emerald-400">npm run seed:firestore</code>
                </span>
              </div>
            </div>

            {/* Live Seeding Progress Banner */}
            {isSeedingFirestore && seedingProgress && (
              <div className="mt-5 p-4 rounded-xl bg-black/60 border border-emerald-500/40 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-mono font-bold flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Seeding collection: <strong className="text-white">{seedingProgress.collection}</strong></span>
                  </span>
                  <span className="text-slate-400 font-mono">
                    {seedingProgress.current} / {seedingProgress.total} documents
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${Math.round((seedingProgress.current / seedingProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Seeding Completion Summary */}
            {seedingSummary && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Successfully synchronized <strong>{seedingSummary.totalSeeded}</strong> curriculum documents across all 15 top-level collections!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSeedingSummary(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 15 Top-Level Collections Grid */}
          <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FolderTree className="w-4 h-4 text-emerald-400" />
                  <span>Top-Level Firestore Collections (15)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Organized into curriculum content, user state, gamification tiers, and assessment audit logs.
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
                Total Collections: <strong className="text-white">15</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'courses', desc: 'Course catalog metadata, syllabus links, unit mappings', count: ALL_SEEDS.courses.docs.length, icon: BookOpen, color: 'text-cyan-400', border: 'border-cyan-500/30' },
                { name: 'units', desc: 'Unit 3 (Network), Unit 4 (Transport), Unit 5 (App/Security)', count: ALL_SEEDS.units.docs.length, icon: Layers, color: 'text-blue-400', border: 'border-blue-500/30' },
                { name: 'levels', desc: '10-level gamified XP tiers (Byte Scout to NetQuest Grandmaster)', count: ALL_SEEDS.levels.docs.length, icon: Award, color: 'text-amber-400', border: 'border-amber-500/30' },
                { name: 'lessons', desc: '30 interactive modules with pedagogy, hooks, and takeaways', count: ALL_SEEDS.lessons.docs.length, icon: FileText, color: 'text-purple-400', border: 'border-purple-500/30' },
                { name: 'concepts', desc: 'Atomic concepts with real-world analogies and key points', count: ALL_SEEDS.concepts.docs.length, icon: Sparkles, color: 'text-pink-400', border: 'border-pink-500/30' },
                { name: 'questions', desc: 'Comprehensive module quiz question bank with explanations', count: ALL_SEEDS.questions.docs.length, icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/30' },
                { name: 'flashcards', desc: 'Quick-reference recall cards for active study and revisions', count: ALL_SEEDS.flashcards.docs.length, icon: RotateCcw, color: 'text-teal-400', border: 'border-teal-500/30' },
                { name: 'activities', desc: 'Interactive drills, subnet calculators, and protocol labs', count: ALL_SEEDS.activities.docs.length, icon: Terminal, color: 'text-indigo-400', border: 'border-indigo-500/30' },
                { name: 'missions', desc: 'Daily, weekly, and milestone quest goals with XP awards', count: ALL_SEEDS.missions.docs.length, icon: Flame, color: 'text-orange-400', border: 'border-orange-500/30' },
                { name: 'bosses', desc: 'Unit Boss battle arena entities (Colossus, Slayer, Cipher King)', count: ALL_SEEDS.bosses.docs.length, icon: ShieldAlert, color: 'text-red-400', border: 'border-red-500/30' },
                { name: 'users', desc: 'Student and instructor profile records with role permissions', count: ALL_SEEDS.users.docs.length, icon: Users, color: 'text-emerald-400', border: 'border-emerald-500/30' },
                { name: 'userProgress', desc: 'Per-user module completion tracking and unit progress', count: ALL_SEEDS.userProgress.docs.length, icon: TrendingUp, color: 'text-sky-400', border: 'border-sky-500/30' },
                { name: 'userMastery', desc: 'Spaced repetition concept mastery and retention scores', count: ALL_SEEDS.userMastery.docs.length, icon: Clock, color: 'text-violet-400', border: 'border-violet-500/30' },
                { name: 'quizAttempts', desc: 'Historical quiz attempt audit log with scores and timing', count: ALL_SEEDS.quizAttempts.docs.length, icon: CheckCheck, color: 'text-yellow-400', border: 'border-yellow-500/30' },
                { name: 'achievements', desc: 'Milestone badges, streak trophies, and special accolades', count: ALL_SEEDS.achievements.docs.length, icon: Award, color: 'text-amber-300', border: 'border-amber-400/30' }
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.name} className={`bg-[#0E1117] border ${c.border} rounded-xl p-4 flex flex-col justify-between hover:bg-[#141822] transition-colors`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${c.color}`} />
                          <span className="font-mono font-bold text-white text-xs">
                            {c.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                          {c.count} items
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>doc(db, &apos;{c.name}&apos;, id)</span>
                      <span className="text-emerald-400">Ready</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Firebase Storage Architecture Card */}
          <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  <span>Firebase Storage (Media Assets & Documents)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bucket: <span className="font-mono text-blue-300">computernetworks-af026.firebasestorage.app</span>. Segregated into 4 primary asset categories.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0E1117] border border-blue-500/20 space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold">
                  <FolderTree className="w-4 h-4" />
                  <span>images/</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Avatars, badges, concept diagrams, UI thumbnails, course banners.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Subfolders: avatars, badges, diagrams
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1117] border border-purple-500/20 space-y-2">
                <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold">
                  <FolderTree className="w-4 h-4" />
                  <span>videos/</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Curriculum lecture clips, protocol demonstrations, video drills.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Subfolders: lectures, demos, concepts
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1117] border border-emerald-500/20 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                  <FolderTree className="w-4 h-4" />
                  <span>documents/</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  PDF slide decks, PPTs, syllabus files, student lab worksheets.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Subfolders: pdfs, ppts, syllabus
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1117] border border-amber-500/20 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                  <FolderTree className="w-4 h-4" />
                  <span>animations/</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lottie JSON files, animated SVGs, interactive packet flow visualizers.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Subfolders: lottie, packet-flows
                </div>
              </div>
            </div>

            {/* Test Upload Widget */}
            <div className="p-4 bg-[#0B0D13] border border-slate-800 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    <span>Test Upload to Firebase Storage</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select an image or asset to test client-side upload to Firebase Cloud Storage.
                  </p>
                </div>

                <label className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-md shadow-blue-600/20">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{uploadingAsset ? 'Uploading...' : 'Choose File to Upload'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleTestUpload}
                    disabled={uploadingAsset}
                  />
                </label>
              </div>

              {uploadedAssetUrl && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-300 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate font-mono">{uploadedAssetUrl}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(uploadedAssetUrl, 'uploaded_url', 'Copied Storage URL!')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium cursor-pointer"
                    >
                      Copy URL
                    </button>
                    <a
                      href={uploadedAssetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium inline-flex items-center space-x-1"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Rules Inspector Box */}
          <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>Production Security Rules (Ready for Firebase Console)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-configured production security rules for Firestore NoSQL and Cloud Storage.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveRulesView(activeRulesView === 'firestore' ? 'none' : 'firestore')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeRulesView === 'firestore'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  firestore.rules
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRulesView(activeRulesView === 'storage' ? 'none' : 'storage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeRulesView === 'storage'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  storage.rules
                </button>
              </div>
            </div>

            {activeRulesView !== 'none' && (
              <div className="p-4 bg-[#0B0D13] border border-slate-800 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-purple-300">
                    {activeRulesView === 'firestore' ? 'firestore.rules (15 Collections + Students)' : 'storage.rules (Images, Videos, Docs, Animations)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = activeRulesView === 'firestore'
                        ? `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} { allow read, write: if request.auth != null; }\n  }\n}`
                        : `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /{allPaths=**} { allow read: if true; allow write: if request.auth != null; }\n  }\n}`;
                      handleCopy(text, 'rules_copy', 'Copied rules snippet!');
                    }}
                    className="flex items-center space-x-1 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Copy this rule set and paste directly into <strong>Firebase Console → Build → {activeRulesView === 'firestore' ? 'Firestore Database' : 'Storage'} → Rules</strong> tab.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {selectedStudentForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#11141B] border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-5 border-b border-slate-800 bg-red-500/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-red-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">
                  Confirm Course Reset
                </h3>
              </div>
              <button 
                onClick={() => setSelectedStudentForReset(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                You are about to reset the entire course progress for:
              </p>

              <div className="p-3.5 bg-[#1A1F2B] border border-slate-800 rounded-xl space-y-1">
                <div className="text-sm font-bold text-white">
                  {selectedStudentForReset.name || selectedStudentForReset.displayName || 'Student'}
                </div>
                <div className="text-xs text-purple-400 font-mono">
                  Roll No: {selectedStudentForReset.studentId || selectedStudentForReset.uid}
                </div>
                <div className="text-xs text-slate-400">
                  Current: {selectedStudentForReset.completedModules?.length || 0}/{TOTAL_MODULES_COUNT} modules completed ({selectedStudentForReset.overallProgress || 0}%)
                </div>
              </div>

              {/* Reset Scope Options */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Reset Scope
                </label>

                <div 
                  onClick={() => setResetXP(false)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    !resetXP 
                      ? 'bg-purple-500/10 border-purple-500/50 text-white' 
                      : 'bg-[#1A1F2B] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    !resetXP ? 'border-purple-400 bg-purple-500' : 'border-slate-600'
                  }`}>
                    {!resetXP && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Reset Course Progress Only (Recommended)</div>
                    <div className="text-[11px] text-slate-400">
                      Clears all {TOTAL_MODULES_COUNT} module completions & resets to 0%, but preserves earned XP ({selectedStudentForReset.totalXP || 0} XP) and streak.
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setResetXP(true)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    resetXP 
                      ? 'bg-red-500/10 border-red-500/50 text-white' 
                      : 'bg-[#1A1F2B] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    resetXP ? 'border-red-400 bg-red-500' : 'border-slate-600'
                  }`}>
                    {resetXP && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-red-300">Full Reset (Progress + XP)</div>
                    <div className="text-[11px] text-slate-400">
                      Completely wipes modules, progress percentage, AND resets student XP back to 0.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForReset(null)}
                  disabled={isResetting}
                  className="flex-1 py-2.5 px-4 bg-[#1A1F2B] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={isResetting}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Confirm Reset</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* QUICK MANUAL RESET MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#11141B] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-5 border-b border-slate-800 bg-purple-500/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-purple-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">
                  Quick Reset by Roll Number
                </h3>
              </div>
              <button 
                onClick={() => setShowManualModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualReset} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Student Roll Number or UID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2300030042"
                  value={manualRollNumber}
                  onChange={(e) => setManualRollNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1F2B] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 font-mono transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Reset Mode
                </label>

                <div 
                  onClick={() => setResetXP(false)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    !resetXP 
                      ? 'bg-purple-500/10 border-purple-500/50 text-white' 
                      : 'bg-[#1A1F2B] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    !resetXP ? 'border-purple-400 bg-purple-500' : 'border-slate-600'
                  }`}>
                    {!resetXP && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Reset Course Progress Only</div>
                    <div className="text-[11px] text-slate-400">Preserves student XP & level</div>
                  </div>
                </div>

                <div 
                  onClick={() => setResetXP(true)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    resetXP 
                      ? 'bg-red-500/10 border-red-500/50 text-white' 
                      : 'bg-[#1A1F2B] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    resetXP ? 'border-red-400 bg-red-500' : 'border-slate-600'
                  }`}>
                    {resetXP && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-red-300">Full Reset (Progress + XP)</div>
                    <div className="text-[11px] text-slate-400">Wipes all course data & resets XP to 0</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  disabled={isResetting}
                  className="flex-1 py-2.5 px-4 bg-[#1A1F2B] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting || !manualRollNumber.trim()}
                  className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Student</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
