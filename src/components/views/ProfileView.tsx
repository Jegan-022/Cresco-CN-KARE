import React, { useState, useEffect } from 'react';
import { Course, NavTab } from '../../types';
import { CrescoMascot } from '../brand/CrescoMascot';
import { soundFx } from '../../utils/soundEffects';
import { 
  Flame, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  LogOut,
  Target,
  Trophy,
  RotateCcw,
  Edit3,
  Save,
  X,
  User,
  Mail,
  Hash,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  Phone,
  Github,
  Linkedin,
  ExternalLink,
  Lock,
  Check,
  Copy,
  FileText,
  AlertCircle,
  Layers,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StreakHeatmap } from '../StreakHeatmap';

interface ProfileViewProps {
  primaryCourse?: Course;
  onNavigate: (tab: NavTab) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Artificial Intelligence & Data Science (AI&DS)',
  'Computer Science & Information Technology (CS&IT)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (ME)',
  'Biotechnology (BT)',
  'Civil Engineering (CE)',
  'Other / Interdisciplinary'
];

const ACADEMIC_YEARS = [
  '1st Year (B.Tech)',
  '2nd Year (B.Tech)',
  '3rd Year (B.Tech)',
  '4th Year (B.Tech)',
  'Post Graduate (M.Tech / MS)',
  'Faculty / Researcher',
  'Alumni'
];

export const ProfileView: React.FC<ProfileViewProps> = ({ primaryCourse, onNavigate }) => {
  const { currentUser, userProfile, logout, resetStudentCourse, updateStudentProfile } = useAuth();
  
  const [isResetting, setIsResetting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    section: '',
    bio: '',
    phoneNumber: '',
    githubUrl: '',
    linkedinUrl: '',
  });

  // Keep form data synchronized with current userProfile
  useEffect(() => {
    if (userProfile || currentUser) {
      setFormData({
        name: userProfile?.displayName || userProfile?.name || currentUser?.displayName || '',
        department: userProfile?.department || 'Computer Science & Engineering (CSE)',
        year: userProfile?.year || '3rd Year (B.Tech)',
        section: userProfile?.section || 'Sec-14',
        bio: userProfile?.bio || '',
        phoneNumber: userProfile?.phoneNumber || '',
        githubUrl: userProfile?.githubUrl || '',
        linkedinUrl: userProfile?.linkedinUrl || '',
      });
    }
  }, [userProfile, currentUser, isEditing]);

  const displayName = userProfile?.displayName || userProfile?.name || (currentUser?.displayName) || 'KLU Student';
  const username = userProfile?.username || (currentUser?.email ? currentUser.email.split('@')[0] : '');
  const studentId = userProfile?.studentId || '';
  const email = userProfile?.email || currentUser?.email || 'student@klu.ac.in';
  const college = userProfile?.college || 'K L University (KARE)';
  const courseTitle = primaryCourse?.title || userProfile?.course || 'CS2004 - Computer Networks & Protocols';
  const department = userProfile?.department || 'Computer Science & Engineering (CSE)';
  const academicYear = userProfile?.year || '3rd Year (B.Tech)';
  const section = userProfile?.section || 'Section 14';
  const role = userProfile?.role || 'student';
  const bio = userProfile?.bio || '';
  const phoneNumber = userProfile?.phoneNumber || '';
  const githubUrl = userProfile?.githubUrl || '';
  const linkedinUrl = userProfile?.linkedinUrl || '';
  const uid = currentUser?.uid || userProfile?.uid || '';

  const totalXp = userProfile?.totalXP ?? userProfile?.xp ?? 0;
  const streak = userProfile?.streak ?? 0;
  const level = Math.max(1, Math.floor(totalXp / 500) + 1);
  const lessonsCompleted = userProfile?.completedModules?.length || userProfile?.modulesCompleted || 0;
  const quizAccuracy = userProfile?.quizAverage ? `${Math.round(userProfile.quizAverage)}%` : (lessonsCompleted > 0 ? '94%' : '0%');
  const topicsMastered = userProfile?.completedUnits || (lessonsCompleted > 0 ? Math.min(14, Math.floor(lessonsCompleted / 2)) : 0);
  const questionsAnswered = (userProfile?.quizAttempts ? userProfile.quizAttempts * 10 : 0) + (userProfile?.completedSteps?.length ? userProfile.completedSteps.length * 4 : lessonsCompleted * 8);

  const u3Prog = userProfile?.unit3Progress ?? (lessonsCompleted > 0 ? Math.min(100, Math.round((lessonsCompleted / 12) * 100)) : 0);
  const u4Prog = userProfile?.unit4Progress ?? 0;
  const u5Prog = userProfile?.unit5Progress ?? 0;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Current Semester';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    soundFx.playClick();
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Full name cannot be empty.' });
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    soundFx.playClick();

    try {
      await updateStudentProfile({
        displayName: formData.name.trim(),
        name: formData.name.trim(),
        department: formData.department.trim(),
        year: formData.year.trim(),
        section: formData.section.trim(),
        bio: formData.bio.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        githubUrl: formData.githubUrl.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
      });
      soundFx.playSuccess();
      setFeedback({ type: 'success', message: 'Profile details saved and synced with Firebase Firestore!' });
      setIsEditing(false);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { label: 'Lessons Completed', value: `${lessonsCompleted}`, icon: BookOpen, color: '#3157D5' },
    { label: 'Quiz Accuracy', value: quizAccuracy, icon: Target, color: '#35A86B' },
    { label: 'Topics Mastered', value: `${topicsMastered}`, icon: CheckCircle2, color: '#7957C7' },
    { label: 'Questions Answered', value: `${questionsAnswered}`, icon: HelpCircle, color: '#F0A63A' },
  ];

  const badges = [
    { 
      id: 'b1', 
      name: 'First Connection', 
      icon: '⚡', 
      tier: 'Bronze',
      unlocked: lessonsCompleted >= 1,
      req: 'Complete 1 module'
    },
    { 
      id: 'b2', 
      name: 'Routing Expert', 
      icon: '🛣', 
      tier: 'Gold',
      unlocked: lessonsCompleted >= 5,
      req: 'Master 5 modules'
    },
    { 
      id: 'b3', 
      name: 'TCP Master', 
      icon: '🚚', 
      tier: 'Silver',
      unlocked: lessonsCompleted >= 10 || totalXp >= 800,
      req: 'Reach 800 XP'
    },
    { 
      id: 'b4', 
      name: 'Security Cadet', 
      icon: '🛡️', 
      tier: 'Silver',
      unlocked: totalXp >= 1500,
      req: 'Reach 1,500 XP'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* 1. Profile Header Card */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 transition-all">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Byte Mascot Companion */}
          <CrescoMascot pose="front" size="lg" animation="float" withGlow />

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
                {displayName}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#3157D5]/15 text-[#3157D5] dark:text-[#6D8CFF]">
                Level {level}
              </span>
              {studentId && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ID: #{studentId}
                </span>
              )}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>REAL-TIME FIREBASE SYNC</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-1">
              {department} • {academicYear} • <span className="capitalize">{role}</span>
            </p>

            {bio && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 italic max-w-md line-clamp-2">
                &ldquo;{bio}&rdquo;
              </p>
            )}

            <div className="mt-3 flex items-center justify-center sm:justify-start gap-4">
              <div className="flex items-center gap-1 text-xs font-black text-[#F0A63A]">
                <Flame size={16} className="fill-[#F0A63A]" />
                <span>🔥 {streak} day streak</span>
              </div>
              <span className="text-[#E5E0D8] dark:text-slate-700">•</span>
              <div className="flex items-center gap-1 text-xs font-black text-[#3157D5] dark:text-[#6D8CFF]">
                <Zap size={16} className="fill-[#3157D5] dark:fill-[#6D8CFF]" />
                <span>{totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap sm:flex-col items-stretch gap-2 w-full sm:w-auto self-center sm:self-start">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsEditing(!isEditing);
            }}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isEditing 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' 
                : 'bg-[#3157D5] hover:bg-[#2546B8] text-white'
            }`}
          >
            {isEditing ? <X size={14} /> : <Edit3 size={14} />}
            <span>{isEditing ? 'Close Editor' : 'Edit Profile'}</span>
          </button>

          <button
            disabled={isResetting}
            onClick={async () => {
              const targetId = userProfile?.studentId ? `klu_${userProfile.studentId}` : (currentUser?.uid || '');
              if (!targetId) return;
              if (window.confirm("Reset your learning progress back to clean 0 baseline (0 XP, 0 Streak, 0 Completed Modules)? Your personal profile details will remain safe.")) {
                setIsResetting(true);
                soundFx.playClick();
                try {
                  await resetStudentCourse(targetId, { resetXP: true });
                  if (userProfile?.studentId) {
                    localStorage.removeItem(`klu_profile_${userProfile.studentId}`);
                  }
                  window.location.reload();
                } catch (e: any) {
                  alert("Failed to reset: " + (e?.message || e));
                } finally {
                  setIsResetting(false);
                }
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 transition-all cursor-pointer"
            title="Reset progress to 0 baseline"
          >
            <RotateCcw size={13} className={isResetting ? 'animate-spin' : ''} />
            <span>{isResetting ? 'Resetting...' : 'Reset to 0'}</span>
          </button>

          {(currentUser || userProfile) && (
            <button
              onClick={async () => {
                soundFx.playClick();
                await logout();
                onNavigate('landing');
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#D95C5C] hover:bg-[#D95C5C]/10 border border-[#D95C5C]/30 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium border shadow-xs animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 2. Interactive Profile Editor (Shown when isEditing === true) */}
      {isEditing && (
        <div className="bg-white dark:bg-[#1F2937] border-2 border-[#3157D5]/40 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-[#172033] dark:text-[#F9FAFB] flex items-center gap-2">
                <Edit3 size={20} className="text-[#3157D5]" />
                <span>Edit Student Profile Details</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your student record. All changes are instantly synced to your Firestore database.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User size={13} className="text-[#3157D5]" />
                  <span>Full Name / Display Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3157D5]/40 transition-all font-medium"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 size={13} className="text-[#3157D5]" />
                  <span>Department / Branch</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3157D5]/40 transition-all font-medium"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-[#3157D5]" />
                  <span>Academic Year</span>
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3157D5]/40 transition-all font-medium"
                >
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              {/* Section / Class */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers size={13} className="text-[#3157D5]" />
                  <span>Section / Division</span>
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="e.g. Section 14 / Sec-A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3157D5]/40 transition-all font-medium"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone size={13} className="text-[#3157D5]" />
                  <span>Contact Phone (Optional)</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3157D5]/40 transition-all font-medium"
                />
              </div>

              {/* GitHub Profile */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Github size={13} className="text-[#3157D5]" />
                  <span>GitHub Profile URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/your-username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3157D5]/40 transition-all font-medium"
                />
              </div>

              {/* LinkedIn Profile */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Linkedin size={13} className="text-[#3157D5]" />
                  <span>LinkedIn Profile URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://www.linkedin.com/in/your-profile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3157D5]/40 transition-all font-medium"
                />
              </div>

              {/* Bio / About */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText size={13} className="text-[#3157D5]" />
                  <span>Bio / Learning Goals (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={250}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Aspiring Cloud & Network Engineer passionate about routing algorithms, TCP optimization, and cybersecurity..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3157D5]/40 transition-all font-medium resize-none"
                />
                <div className="text-right text-[10px] text-slate-400">
                  {formData.bio.length}/250 characters
                </div>
              </div>

            </div>

            {/* Read-Only Academic Credentials Notice */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock size={13} className="text-amber-500" />
                <span>Protected University Credentials (Read-Only)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                <div><span className="font-semibold text-slate-500">Student ID:</span> {studentId || 'N/A'}</div>
                <div><span className="font-semibold text-slate-500">Email:</span> {email}</div>
                <div><span className="font-semibold text-slate-500">Institution:</span> {college}</div>
              </div>
              <p className="text-[10px] text-slate-400">
                These credentials are verified via official K L University Google SSO authentication and cannot be edited manually.
              </p>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#3157D5] hover:bg-[#2546B8] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} className={isSaving ? 'animate-spin' : ''} />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Comprehensive Student Profile Record (Showing All User Details) */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#3157D5]/10 text-[#3157D5]">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
                Student Profile & Academic Record
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete student information registered in Cresco NetQuest
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => {
                soundFx.playClick();
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#3157D5] dark:text-[#6D8CFF] bg-[#3157D5]/10 hover:bg-[#3157D5]/20 transition-all cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* Full Name */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <User size={12} className="text-[#3157D5]" />
              <span>Full Name</span>
            </span>
            <div className="text-sm font-black text-[#172033] dark:text-[#F9FAFB] mt-2">
              {displayName}
            </div>
          </div>

          {/* Username */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Hash size={12} className="text-[#7957C7]" />
              <span>Username Handle</span>
            </span>
            <div className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 mt-2">
              @{username || 'klu_student'}
            </div>
          </div>

          {/* Student ID / Roll Number */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award size={12} className="text-[#F0A63A]" />
                <span>Student ID / Roll No</span>
              </span>
              {studentId && (
                <button
                  onClick={() => handleCopy(studentId, 'id')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Copy Student ID"
                >
                  {copiedField === 'id' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              )}
            </span>
            <div className="text-sm font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] mt-2">
              {studentId ? `#${studentId}` : 'Not Assigned'}
            </div>
          </div>

          {/* University Email */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Mail size={12} className="text-[#35A86B]" />
              <span>Official KLU Email</span>
            </span>
            <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mt-2 break-all flex items-center gap-1.5">
              <span>{email}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-sans font-bold">
                SSO
              </span>
            </div>
          </div>

          {/* Department */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Building2 size={12} className="text-[#3157D5]" />
              <span>Department / Branch</span>
            </span>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">
              {department}
            </div>
          </div>

          {/* Academic Year */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <GraduationCap size={12} className="text-[#F0A63A]" />
              <span>Academic Year</span>
            </span>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">
              {academicYear}
            </div>
          </div>

          {/* Section */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Layers size={12} className="text-[#7957C7]" />
              <span>Section / Division</span>
            </span>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-2">
              {section}
            </div>
          </div>

          {/* Institution / College */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Institution / College</span>
            </span>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">
              {college}
            </div>
          </div>

          {/* Enrolled Course */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <BookOpen size={12} className="text-[#3157D5]" />
              <span>Enrolled Course Track</span>
            </span>
            <div className="text-xs font-bold text-[#3157D5] dark:text-[#6D8CFF] mt-2">
              {courseTitle}
            </div>
          </div>

          {/* Account Role & Status */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>Role & Verification</span>
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">
                {role}
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                Verified
              </span>
            </div>
          </div>

          {/* Account Created At */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-500" />
              <span>Registration Date</span>
            </span>
            <div className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-2">
              {formatDate(userProfile?.createdAt)}
            </div>
          </div>

          {/* Firebase System UID */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                <span>Firebase User UID</span>
              </span>
              {uid && (
                <button
                  onClick={() => handleCopy(uid, 'uid')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Copy UID"
                >
                  {copiedField === 'uid' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              )}
            </span>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2 truncate">
              {uid ? `${uid.slice(0, 16)}...` : 'N/A'}
            </div>
          </div>

        </div>

        {/* Optional Social Links & Contact */}
        {(githubUrl || linkedinUrl || phoneNumber) && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold text-slate-500">Connected Profiles:</span>
            
            {githubUrl && (
              <a
                href={githubUrl.startsWith('http') ? githubUrl : `https://github.com/${githubUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Github size={13} />
                <span>GitHub</span>
                <ExternalLink size={11} className="opacity-60" />
              </a>
            )}

            {linkedinUrl && (
              <a
                href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://linkedin.com/in/${linkedinUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-xs font-bold text-[#0A66C2] dark:text-[#388be8] transition-colors"
              >
                <Linkedin size={13} />
                <span>LinkedIn</span>
                <ExternalLink size={11} className="opacity-60" />
              </a>
            )}

            {phoneNumber && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200">
                <Phone size={13} className="text-emerald-500" />
                <span>{phoneNumber}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Statistics Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight flex items-center justify-between">
          <span>Learning Statistics</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">Live synced from Firestore</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div 
                    className="p-1.5 rounded-lg text-white"
                    style={{ backgroundColor: stat.color }}
                  >
                    <Icon size={14} />
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-black font-mono text-[#172033] dark:text-[#F9FAFB]">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Course Unit Progress Breakdown */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight flex items-center gap-2">
          <Layers size={18} className="text-[#3157D5]" />
          <span>Curriculum Unit Mastery Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Unit 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Unit 3: Network Layer</span>
              <span className="text-xs font-mono font-black text-[#3157D5]">{u3Prog}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#3157D5] h-full rounded-full transition-all duration-500" 
                style={{ width: `${u3Prog}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              IP Addressing, Routing Algorithms & ICMP
            </div>
          </div>

          {/* Unit 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Unit 4: Transport Layer</span>
              <span className="text-xs font-mono font-black text-[#7957C7]">{u4Prog}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#7957C7] h-full rounded-full transition-all duration-500" 
                style={{ width: `${u4Prog}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              TCP 3-Way Handshake, Flow & Congestion Control
            </div>
          </div>

          {/* Unit 5 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Unit 5: Application Layer</span>
              <span className="text-xs font-mono font-black text-[#35A86B]">{u5Prog}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#35A86B] h-full rounded-full transition-all duration-500" 
                style={{ width: `${u5Prog}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              DNS Resolution, HTTP/HTTPS, SSH & Cryptography
            </div>
          </div>
        </div>
      </div>

      {/* 6. Study Streak Heatmap */}
      <StreakHeatmap
        activityDates={userProfile?.activityDates || []}
        currentStreak={userProfile?.streak || 0}
        weeksToShow={16}
      />

      {/* 7. Collected Badges Showcase */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-[#172033] dark:text-[#F9FAFB] text-lg">
            <Trophy size={18} className="text-[#F0A63A]" />
            <span>Collected Badges</span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('leaderboard');
            }}
            className="text-xs font-bold text-[#3157D5] dark:text-[#6D8CFF] hover:underline cursor-pointer"
          >
            View Leaderboard Standings →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                b.unlocked
                  ? 'bg-[#F7F5F0] dark:bg-[#111827] border-[#E5E0D8] dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
              }`}
            >
              <span className={`text-3xl ${!b.unlocked && 'grayscale'}`}>{b.icon}</span>
              <div className="font-extrabold text-xs text-[#172033] dark:text-[#F9FAFB]">{b.name}</div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-[#64748B]">
                  {b.tier}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                  b.unlocked 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {b.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">{b.req}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
