import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Lock, 
  User, 
  GraduationCap, 
  Hash, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth, UserProfileData } from '../../context/AuthContext';
import { Loader } from '../ui/Loader';
import { soundFx } from '../../utils/soundEffects';
import { findStudentCredential } from '../../data/studentCredentials';

interface KluRegistrationModalProps {
  isOpen: boolean;
  onCancel?: () => void;
  onSuccess?: (profile: UserProfileData) => void;
}

export const KluRegistrationModal: React.FC<KluRegistrationModalProps> = ({
  isOpen,
  onCancel,
  onSuccess
}) => {
  const { 
    pendingRegistration, 
    checkUsernameAvailable, 
    completeStudentRegistration, 
    cancelRegistration 
  } = useAuth();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering (CSE)');
  const [year, setYear] = useState('3rd Year');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('stu@sid');
  const [confirmPassword, setConfirmPassword] = useState('stu@sid');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize prefilled data from Google account & official roster
  useEffect(() => {
    if (pendingRegistration) {
      const email = pendingRegistration.email || '';
      const prefix = email.split('@')[0];
      const roster = findStudentCredential(email) || findStudentCredential(prefix);

      if (roster) {
        if (roster.name) setFullName(roster.name);
        if (roster.studentId) {
          setStudentId(roster.studentId);
          setUsername(roster.studentId);
        }
        if (roster.department) setDepartment(roster.department);
      } else {
        if (pendingRegistration.name) {
          setFullName(pendingRegistration.name);
        }
        const numericOnly = prefix.replace(/\D/g, '');
        const autoReg = numericOnly.length >= 10 ? numericOnly.slice(0, 11) : prefix;
        setStudentId(autoReg);
        setUsername(autoReg);
      }

      // Default password requested: stu@sid
      setPassword('stu@sid');
      setConfirmPassword('stu@sid');
    }
  }, [pendingRegistration]);

  // Live debounced 10/11-digit Register Number (Username) validation
  useEffect(() => {
    const clean = username.trim();
    if (!clean) {
      setUsernameStatus('idle');
      setUsernameError(null);
      return;
    }

    // Strictly enforce 10 or 11 digits format (e.g. 992400xxxxx)
    const isDigitsOnly = /^\d+$/.test(clean);
    if (!isDigitsOnly) {
      setUsernameStatus('invalid');
      setUsernameError('Register Number must contain digits only (e.g., 992400xxxxx).');
      return;
    }

    if (clean.length < 10 || clean.length > 11) {
      setUsernameStatus('invalid');
      setUsernameError(`Register Number must be 10 or 11 digits (current: ${clean.length} digits). Format: 992400xxxxx.`);
      return;
    }

    setUsernameStatus('checking');
    setUsernameError(null);

    const timer = setTimeout(async () => {
      try {
        const isAvail = await checkUsernameAvailable(clean);
        if (isAvail) {
          setUsernameStatus('available');
          setUsernameError(null);
        } else {
          setUsernameStatus('taken');
          setUsernameError('This Register Number is already registered. You can sign in with your password directly.');
        }
      } catch {
        setUsernameStatus('available');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailable]);

  if (!isOpen || !pendingRegistration) return null;

  const handleClose = () => {
    try {
      soundFx.playClick();
    } catch {}
    if (onCancel) {
      onCancel();
    } else {
      cancelRegistration();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    const cleanUser = username.trim();
    if (!/^\d{10,11}$/.test(cleanUser)) {
      setFormError('Register Number must strictly be 10 or 11 digits (e.g. 992400xxxxx).');
      return;
    }
    if (usernameStatus === 'taken') {
      setFormError('This Register Number is already registered. Please sign in directly.');
      return;
    }
    const cleanPass = password.trim() || 'stu@sid';
    if (cleanPass.length < 4) {
      setFormError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const profile = await completeStudentRegistration({
        username: cleanUser,
        password: cleanPass,
        name: fullName.trim(),
        studentId: cleanUser,
        department,
        year,
      });

      try {
        soundFx.playSuccess();
      } catch {}

      if (onSuccess) {
        onSuccess(profile);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const departments = [
    'Computer Science & Engineering (CSE)',
    'Artificial Intelligence & Data Science (AI & DS)',
    'Computer Science & Information Technology (CS & IT)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering (MECH)',
    'Civil Engineering (CIVIL)',
    'Biotechnology (BT)',
    'Other Specialization / Department',
  ];

  const years = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Postgraduate / Research Scholar',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0F172A] border border-cyan-500/30 rounded-3xl shadow-[0_20px_60px_-15px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col my-auto relative animate-scaleUp">
        
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
              <img
                src="/assets/mascot/cresco-mascot.png"
                alt="Cresco Mascot"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(6,182,212,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-headline font-black text-white tracking-tight">
                  Set Up Login Credentials
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  KLU Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                First-time setup: Create your login credentials to enable 2-way sign-in for all future visits.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cancel and sign out"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verified Google Account Badge */}
        <div className="px-6 py-2.5 bg-cyan-950/30 border-b border-cyan-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-mono">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="truncate max-w-[280px]">{pendingRegistration.email}</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            Verified KLU Email
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* 2-Way Login Explanation Banner */}
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>2-Way Login Enabled for All Subsequent Visits:</span>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-5">
              <li><strong>Way 1:</strong> Log in with your <strong>Register Number (992400xxxxx)</strong> & Password (default: <code className="text-cyan-300 font-mono">stu@sid</code>)</li>
              <li><strong>Way 2:</strong> Click <strong>Continue with Google</strong> with your verified KLU email</li>
            </ul>
          </div>

          {/* Section 1: Profile Information */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Step 1: Student Profile</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-xs placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-cyan-400" />
                  <span>Department</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white text-xs outline-none cursor-pointer transition-all"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  <span>Academic Year</span>
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white text-xs outline-none cursor-pointer transition-all"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 my-2" />

          {/* Section 2: Create Username & Password */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Step 2: Set Username &amp; Password</span>
            </div>

            {/* Username strictly 10 or 11 digit Register Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  <span>KLU Register Number / Username (Strictly 10 or 11 Digits)</span>
                </label>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">
                  {username.length} / 11 digits
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={username}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setUsername(digits);
                    setStudentId(digits);
                  }}
                  placeholder="e.g. 99240040116"
                  className={`w-full px-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border text-white text-xs outline-none transition-all font-mono tracking-wider ${
                    usernameStatus === 'available'
                      ? 'border-emerald-500/70 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                      : usernameStatus === 'taken' || usernameStatus === 'invalid'
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && (
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {usernameStatus === 'available' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>

              {/* Status Message */}
              {usernameStatus === 'available' && (
                <p className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Valid 10/11-digit Register Number. This will be your permanent username.</span>
                </p>
              )}
              {usernameError && (
                <p className="text-[10px] text-red-400 font-medium mt-1">
                  {usernameError}
                </p>
              )}
            </div>

            {/* Default Password Notice */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Default portal password is pre-filled as <code className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">stu@sid</code>. You can keep this or customize it. You can change your password anytime later in Settings.
              </span>
            </div>

            {/* Password Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Portal Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. stu@sid"
                    className="w-full px-3.5 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-xs placeholder-slate-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-xs placeholder-slate-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {password && confirmPassword && (
              <div className="text-[10px] font-medium">
                {password === confirmPassword ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Passwords match.</span>
                  </span>
                ) : (
                  <span className="text-red-400">
                    Passwords do not match yet.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={submitting || usernameStatus === 'checking' || usernameStatus === 'taken' || usernameStatus === 'invalid'}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:via-teal-500 hover:to-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader size="1.2em" />
                  <span>Creating Student Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Complete Profile &amp; Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel &amp; Sign out
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
