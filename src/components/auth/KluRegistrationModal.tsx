import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  X,
  Sparkles,
  Hash
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
    completeStudentRegistration, 
    cancelRegistration 
  } = useAuth();

  // Form fields
  const [registerNumber, setRegisterNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering (CSE)');
  const [year, setYear] = useState('3rd Year (UG)');
  const [password, setPassword] = useState('stu@sid');
  const [confirmPassword, setConfirmPassword] = useState('stu@sid');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const verifiedEmail = (pendingRegistration?.email || '').toLowerCase().trim();

  // Initialize prefilled data from Google account & official roster
  useEffect(() => {
    if (pendingRegistration) {
      const email = pendingRegistration.email.toLowerCase().trim();
      const prefix = email.split('@')[0];
      const digitsFromPrefix = prefix.replace(/\D/g, '');
      const roster = findStudentCredential(email) || findStudentCredential(prefix);

      if (roster) {
        if (roster.name) setFullName(roster.name);
        if (roster.studentId) setRegisterNumber(roster.studentId.replace(/\D/g, '').slice(0, 11));
        if (roster.department) setDepartment(roster.department);
      } else {
        if (pendingRegistration.name) {
          setFullName(pendingRegistration.name);
        }
        if (digitsFromPrefix.length >= 10) {
          setRegisterNumber(digitsFromPrefix.slice(0, 11));
        }
      }

      // Default initial password: stu@sid
      setPassword('stu@sid');
      setConfirmPassword('stu@sid');
    }
  }, [pendingRegistration]);

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

    const cleanReg = registerNumber.trim().replace(/\D/g, '');
    if (!cleanReg || cleanReg.length < 10 || cleanReg.length > 11) {
      setFormError('Username must strictly be your 10 or 11 digit KLU Register Number (e.g. 992400xxxxx).');
      return;
    }

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const cleanPass = password.trim() || 'stu@sid';
    if (cleanPass.length < 4) {
      setFormError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setSubmitting(true);
    try {
      // Fix Register Number permanently as username, and save password (changeable in profile settings)
      const profile = await completeStudentRegistration({
        username: cleanReg,
        password: cleanPass,
        name: fullName.trim(),
        studentId: cleanReg,
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
      setFormError(err.message || 'Failed to complete setup. Please check your Register Number and try again.');
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
    'Aerospace Engineering',
    'Chemical Engineering',
    'KL College of Pharmacy',
    'KL Business School (MBA / BBA)',
    'KL College of Law',
    'KL College of Architecture',
    'Science & Humanities',
    'Other College Specialization / Department',
  ];

  const years = [
    '1st Year (UG)',
    '2nd Year (UG)',
    '3rd Year (UG)',
    '4th Year (UG)',
    'Postgraduate (PG / M.Tech / MBA)',
    'Research Scholar / Faculty',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
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
                  Fix Login Credentials
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  First-Time Setup
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Set your Register Number (permanent Username) and Password. This is asked only once.
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

        {/* Verified Google Account Banner */}
        <div className="px-6 py-2 bg-cyan-950/30 border-b border-cyan-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-mono">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="truncate max-w-[280px] font-bold">{verifiedEmail}</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            Verified KLU Email
          </span>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Step 1: Fixed Username (Register Number) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span>Fix Username (Strictly Register Number)</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {registerNumber.length} / 11 digits
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                maxLength={11}
                value={registerNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setRegisterNumber(digits);
                }}
                placeholder="e.g. 99240040285"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-xs outline-none transition-all font-mono tracking-wider"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {registerNumber.length >= 10 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[9px] text-slate-500 font-mono">10-11 digits</span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>
                <strong>Fixed Username:</strong> For all subsequent visits, you will log in strictly using this Register Number and your Password.
              </span>
            </p>
          </div>

          <div className="border-t border-slate-800 my-2" />

          {/* Step 2: Set Password (Changeable in profile settings) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Set Password</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Changeable in Profile Settings
              </span>
            </div>

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
                    placeholder="Enter password (min. 4 chars)"
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

            <p className="text-[10px] text-slate-400">
              Default password is pre-filled as <code className="text-cyan-300 font-mono font-bold">stu@sid</code>. You can customize it now or update it anytime later in Profile Settings.
            </p>
          </div>

          <div className="border-t border-slate-800 my-2" />

          {/* Step 3: Student Details (Saved once) */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Student Profile (Saved Once)</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Student Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-xs placeholder-slate-500 outline-none transition-all"
              />
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

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={submitting || registerNumber.length < 10}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:via-teal-500 hover:to-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader size="1.2em" />
                  <span>Saving &amp; Locking Credentials...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Fix Credentials &amp; Enter Dashboard</span>
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

export default KluRegistrationModal;
