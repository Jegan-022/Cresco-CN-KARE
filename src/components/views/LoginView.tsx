import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  ArrowLeft,
  ExternalLink,
  Globe,
  Key,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  ShieldCheck,
  Check,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LiquidLines } from '../ui/LiquidLines';
import { Loader } from '../ui/Loader';

interface LoginViewProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  initialPortal?: 'student' | 'developer' | 'teacher';
  onSuccess?: () => void;
  onNavigateMode?: (mode: 'login' | 'signup') => void;
  onCancel?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  initialMode = 'login',
  onSuccess, 
  onCancel 
}) => {
  const { 
    loginWithStudentId, 
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
    authError, 
    clearAuthError 
  } = useAuth();
  
  // Unified active tab: 'login' or 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
    initialMode === 'signup' ? 'signup' : 'login'
  );

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [signUpTermsAgreed, setSignUpTermsAgreed] = useState(true);

  // Common UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(initialMode === 'forgot');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const displayError = localError || authError;

  // Load remembered identifier on mount
  useEffect(() => {
    try {
      const savedId = localStorage.getItem('cresco_remember_student_id');
      if (savedId) {
        setLoginIdentifier(savedId);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  // Listen for Escape key to return to launch/landing page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onCancel) onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const clearErrors = () => {
    clearAuthError();
    setLocalError(null);
  };

  // Compute password strength for Sign Up
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700', text: 'text-slate-500' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-cyan-500', text: 'text-cyan-400' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const passwordStrength = getPasswordStrength(signUpPassword);

  // Google sign in / sign up
  const handleGoogleAuth = async () => {
    clearErrors();
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.message !== 'SIGN_IN_CANCELLED') {
        setLocalError(err.message || 'Google verification failed. Please verify your official KLU account.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToReset = resetEmail.trim();
    if (!emailToReset) {
      setLocalError('Please enter your student email address.');
      return;
    }
    setResetLoading(true);
    setResetSuccess(null);
    clearErrors();
    try {
      let resolvedEmail = emailToReset;
      if (!resolvedEmail.includes('@')) {
        resolvedEmail = `${resolvedEmail}@klu.ac.in`;
      }
      await resetPassword(resolvedEmail);
      setResetSuccess('Password reset link sent! Please check your student inbox.');
    } catch (err: any) {
      setLocalError(err.message || 'Unable to send password reset. Please check the email address or contact support.');
    } finally {
      setResetLoading(false);
    }
  };

  // 1. Student Login Handler
  const handleStudentLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const identifier = loginIdentifier.trim();
    const pwd = loginPassword.trim();

    if (!identifier) {
      setLocalError('Please enter your Email address or Register Number.');
      return;
    }
    if (!pwd) {
      setLocalError('Please enter your password.');
      return;
    }

    clearErrors();
    setLoading(true);
    try {
      // Remember me persistence
      if (rememberMe) {
        try { localStorage.setItem('cresco_remember_student_id', identifier); } catch {}
      } else {
        try { localStorage.removeItem('cresco_remember_student_id'); } catch {}
      }

      // Supports both Email address and Register Number (CSV roster students or direct Firebase Auth)
      await loginWithStudentId(identifier, pwd);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please verify your Email/Register Number and Password.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Student Sign Up Handler
  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = signUpName.trim();
    const email = signUpEmail.trim().toLowerCase();
    const pwd = signUpPassword.trim();
    const confirmPwd = signUpConfirmPassword.trim();

    if (!name) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid student email address.');
      return;
    }
    if (pwd.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (pwd !== confirmPwd) {
      setLocalError('Passwords do not match. Please verify your confirm password.');
      return;
    }
    if (!signUpTermsAgreed) {
      setLocalError('You must agree to CRESCO CN\'s Terms & Conditions and Privacy Policy to create an account.');
      return;
    }

    clearErrors();
    setLoading(true);
    try {
      await registerWithEmail(email, pwd, name, 'student');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed. Please check your credentials or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070D18] flex items-center justify-center p-3 sm:p-4 overflow-hidden select-none">
      
      {/* Back to Home Page Fixed Button */}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          id="fixed-back-to-launch-button"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#0E1626]/85 hover:bg-[#142036] border border-cyan-500/30 hover:border-cyan-400/50 text-slate-200 hover:text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg hover:-translate-x-0.5 group"
          title="Back to Home (Esc)"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>
      )}

      {/* Liquid Lines Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <LiquidLines
          speed={0.35}
          iterations={4}
          waveFrequency={46}
          depthStep={0.06}
          lineThickness={0.010}
          waveAmplitude={0.55}
          lineColor="#06c8d9"
          darkBackground="#070D18"
          lightBackground="#070D18"
          brightness={2.2}
          contrast={1.15}
          scale={0.32}
          opacity={0.85}
          interactive={true}
        />
      </div>

      {/* Atmospheric vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070D18]/30 to-[#070D18]/80 pointer-events-none z-0" />

      {/* Auth Card Container */}
      <div className="uiverse-login-card relative z-10 my-4 sm:my-6 max-w-full">
        <style>{`
          .uiverse-login-card .container {
            display: flex;
            width: 620px;
            min-height: 540px;
            max-height: 94vh;
            max-width: 95vw;
            align-items: stretch;
            justify-content: center;
            position: relative;
            overflow: hidden;
            background-color: rgba(14, 22, 38, 0.88);
            border-radius: 22px;
            box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.6), 0 0 35px rgba(6, 200, 217, 0.18);
            border: 1px solid rgba(56, 189, 248, 0.28);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
          }

          .uiverse-login-card .left {
            width: 64%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 20px 0;
            position: relative;
            z-index: 2;
            overflow-y: auto;
            max-height: 94vh;
            scrollbar-width: thin;
            scrollbar-color: rgba(56, 189, 248, 0.3) transparent;
          }

          .uiverse-login-card .left::-webkit-scrollbar {
            width: 4px;
          }
          .uiverse-login-card .left::-webkit-scrollbar-thumb {
            background-color: rgba(56, 189, 248, 0.3);
            border-radius: 4px;
          }

          @media (max-width: 640px) {
            .uiverse-login-card .container {
              width: 95vw;
              min-height: auto;
            }
            .uiverse-login-card .left {
              width: 100%;
            }
            .uiverse-login-card .right {
              display: none !important;
            }
          }

          .uiverse-login-card .right {
            width: 36%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-right: 14px;
            position: relative;
          }

          .uiverse-login-card .img {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>

        <div className="container">
          <div className="left">
            <div>
              
              {/* Header Title & Badges */}
              <div className="px-6 pb-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                    Join CRESCO CN to start coding
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                    KLU
                  </span>
                </div>

                {/* Sign In / Sign Up Segmented Tab Toggle */}
                {!showForgotPassword && (
                  <div className="mt-3 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center">
                    <button
                      type="button"
                      id="tab-toggle-login"
                      onClick={() => { setActiveTab('login'); clearErrors(); }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'login'
                          ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <LogIn size={13} />
                      <span>Sign In</span>
                    </button>
                    <button
                      type="button"
                      id="tab-toggle-signup"
                      onClick={() => { setActiveTab('signup'); clearErrors(); }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'signup'
                          ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <UserPlus size={13} />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-2">
                  {showForgotPassword ? (
                    <>
                      <Key size={18} className="text-cyan-400" />
                      <span>Reset Password</span>
                    </>
                  ) : activeTab === 'login' ? (
                    <>
                      <Key size={18} className="text-cyan-400" />
                      <span>Student Sign In</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="text-cyan-400" />
                      <span>Create Account</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {showForgotPassword
                    ? 'Enter your student email address to receive password reset instructions.'
                    : activeTab === 'login'
                    ? 'Log in with your Email address or Register Number & Password.'
                    : 'Register with your student email to begin your networking course.'}
                </p>
              </div>

              {/* Error Alert Display */}
              {displayError && (
                <div className="mx-6 mb-3 p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] flex flex-col gap-1.5 leading-snug">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span className="flex-1">{displayError}</span>
                  </div>

                  {displayError.toLowerCase().includes('unauthorized') && (
                    <div className="pt-1 border-t border-red-500/20 flex flex-wrap items-center gap-2">
                      {typeof window !== 'undefined' && window.location.hostname === '127.0.0.1' && (
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = window.location.href.replace('127.0.0.1', 'localhost');
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Switch to http://localhost:{window.location.port || '3000'}</span>
                        </button>
                      )}
                      <a
                        href="https://console.firebase.google.com/project/cresco-cn/authentication/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded transition-colors flex items-center gap-1 inline-flex cursor-pointer"
                      >
                        <span>Open Firebase Settings</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Google Auth Button + OR Divider (Shown in both Login & Signup) */}
              {!showForgotPassword && (
                <div className="px-6 space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading || googleLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    title="Sign in with your official KLU institutional Google account"
                  >
                    {googleLoading ? (
                      <Loader size="1.2em" />
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span>Continue with Google</span>
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          {activeTab === 'login' ? 'KLU Sign In' : 'KLU Sign Up'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* OR Divider */}
                  <div className="flex items-center gap-2 py-0.5">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">OR</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                </div>
              )}

              {/* FORGOT PASSWORD VIEW */}
              {showForgotPassword ? (
                <form onSubmit={handlePasswordReset} className="px-6 space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Key size={13} className="text-cyan-400" />
                        <span>Reset Student Password</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(false); setResetSuccess(null); clearErrors(); }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                      >
                        Back to Login
                      </button>
                    </div>

                    {resetSuccess && (
                      <div className="p-2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] leading-snug">
                        {resetSuccess}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Registered Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. 992400xxxxx@klu.ac.in"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {resetLoading ? <Loader size="1.1em" /> : 'Send Password Reset Link'}
                    </button>
                  </div>
                </form>
              ) : activeTab === 'login' ? (
                /* ======================== 1. LOGIN PAGE ======================== */
                <form onSubmit={handleStudentLogin} className="px-6 space-y-2.5">
                  {/* Email address / Register Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Mail size={13} className="text-cyan-400" />
                      <span>Email or Register Number</span>
                    </label>
                    <input 
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white text-xs outline-none transition-all font-mono" 
                      type="text" 
                      id="login-identifier-input" 
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. 992400xxxxx@klu.ac.in or 992400xxxxx"
                      required 
                      autoFocus
                    />
                  </div>

                  {/* Password with Show/Hide Toggle & Forgot Password link */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Lock size={13} className="text-cyan-400" />
                        <span>Password</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => { setShowForgotPassword(true); clearErrors(); }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline bg-transparent border-0 cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        className="w-full px-3.5 pr-9 py-2 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white text-xs outline-none transition-all font-mono" 
                        type={showLoginPassword ? 'text' : 'password'} 
                        id="login-password-input" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        id="login-remember-me-checkbox"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-400 cursor-pointer accent-cyan-500"
                      />
                      <span className="text-[11px] text-slate-300 font-medium">Remember me</span>
                    </label>
                  </div>

                  {/* Sign In Button with Loading Indicator */}
                  <button 
                    type="submit" 
                    id="login-submit-button"
                    className="w-full py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                    disabled={loading || googleLoading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader size="1.25em" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <>
                        <LogIn size={14} />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>

                  {/* Don't have an account? Sign Up Switch */}
                  <div className="text-center pt-1">
                    <p className="text-[11.5px] text-slate-400">
                      <span>Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('signup'); clearErrors(); }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold underline bg-transparent border-0 cursor-pointer"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* ======================== 2. SIGN UP PAGE ======================== */
                <form onSubmit={handleStudentSignUp} className="px-6 space-y-2">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-0.5 flex items-center gap-1.5">
                      <User size={13} className="text-cyan-400" />
                      <span>Full Name</span>
                    </label>
                    <input 
                      className="w-full px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white text-xs outline-none transition-all" 
                      type="text" 
                      id="signup-name-input" 
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      required 
                      autoFocus
                    />
                  </div>

                  {/* Email address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-0.5 flex items-center gap-1.5">
                      <Mail size={13} className="text-cyan-400" />
                      <span>Email Address</span>
                    </label>
                    <input 
                      className="w-full px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white text-xs outline-none transition-all font-mono" 
                      type="email" 
                      id="signup-email-input" 
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="e.g. 992400xxxxx@klu.ac.in"
                      required 
                    />
                  </div>

                  {/* Password with Show/Hide toggle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-0.5 flex items-center gap-1.5">
                      <Lock size={13} className="text-cyan-400" />
                      <span>Password</span>
                    </label>
                    <div className="relative">
                      <input 
                        className="w-full px-3.5 pr-9 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white text-xs outline-none transition-all font-mono" 
                        type={showSignUpPassword ? 'text' : 'password'} 
                        id="signup-password-input" 
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Create a strong password"
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                        title={showSignUpPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignUpPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {signUpPassword && (
                      <div className="mt-1 space-y-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Password strength:</span>
                          <span className={`font-bold ${passwordStrength.text}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                            style={{ width: `${passwordStrength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password with Show/Hide toggle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-0.5 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-cyan-400" />
                      <span>Confirm Password</span>
                    </label>
                    <div className="relative">
                      <input 
                        className={`w-full px-3.5 pr-9 py-1.5 rounded-xl bg-slate-900/90 border ${
                          signUpConfirmPassword && signUpPassword !== signUpConfirmPassword
                            ? 'border-red-500/70 focus:border-red-400'
                            : signUpConfirmPassword && signUpPassword === signUpConfirmPassword
                            ? 'border-emerald-500/70 focus:border-emerald-400'
                            : 'border-slate-700 focus:border-cyan-400'
                        } text-white text-xs outline-none transition-all font-mono`} 
                        type={showSignUpConfirmPassword ? 'text' : 'password'} 
                        id="signup-confirm-password-input" 
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                        title={showSignUpConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignUpConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {signUpConfirmPassword && signUpPassword !== signUpConfirmPassword && (
                      <p className="text-[10px] text-red-400 mt-0.5">Passwords do not match.</p>
                    )}
                  </div>

                  {/* Terms & Conditions Agreement Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none leading-snug">
                      <input
                        id="signup-terms-checkbox"
                        type="checkbox"
                        checked={signUpTermsAgreed}
                        onChange={(e) => setSignUpTermsAgreed(e.target.checked)}
                        className="w-3.5 h-3.5 mt-0.5 rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-400 cursor-pointer accent-cyan-500 shrink-0"
                      />
                      <span className="text-[10.5px] text-slate-300">
                        <span>I agree to CRESCO CN's </span>
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline font-semibold">
                          Terms &amp; Conditions
                        </a>
                        <span> and </span>
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline font-semibold">
                          Privacy Policy
                        </a>.
                      </span>
                    </label>
                  </div>

                  {/* Create Account Button with Loading Indicator */}
                  <button 
                    type="submit" 
                    id="signup-submit-button"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                    disabled={loading || googleLoading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader size="1.25em" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>

                  {/* Already have an account? Login Switch */}
                  <div className="text-center pt-0.5">
                    <p className="text-[11.5px] text-slate-400">
                      <span>Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('login'); clearErrors(); }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold underline bg-transparent border-0 cursor-pointer"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* Bottom Notice for Provisioned Students */}
              <div className="px-6 pt-2 pb-1 text-center text-[10px] text-slate-400 border-t border-slate-800/60 mt-2">
                <p>
                  Institutional student? Log in with your registered credentials or official Google account.
                </p>
              </div>
            </div>

          </div>

          {/* Right Mascot / Coding Illustration */}
          <div className="right">
            <div className="img">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 731.67004 550.61784" xmlnsXlink="http://www.w3.org/1999/xlink">
                <path d="M0,334.13393c0,.66003,.53003,1.19,1.19006,1.19H730.48004c.65997,0,1.19-.52997,1.19-1.19,0-.65997-.53003-1.19-1.19-1.19H1.19006c-.66003,0-1.19006,.53003-1.19006,1.19Z" fill="#3f3d56" />
                <polygon points="466.98463 81.60598 470.81118 130.55703 526.26809 107.39339 494.98463 57.60598 466.98463 81.60598" fill="#a0616a" />
                <circle cx="465.32321" cy="55.18079" r="41.33858" fill="#a0616a" />
                <polygon points="387.98463 440.60598 394.98463 503.39339 345.98463 496.60598 361.98463 438.60598 387.98463 440.60598" fill="#a0616a" />
                <polygon points="578.98463 449.60598 585.98463 512.39339 536.98463 505.60598 552.98463 447.60598 578.98463 449.60598" fill="#a0616a" />
                <path d="M462.48463,260.10598c-.66897,0-54.14584,2.68515-89.47714,4.46286-16.72275,.84141-29.45202,15.31527-28.15459,32.00884l12.63173,162.5283,36,1,.87795-131,71.12205,4-3-73Z" fill="#2f2e41" />
                <path d="M619.48463,259.10598s9,69,2,76c-7,7-226.5-5.5-226.5-5.5,0,0,48.15354-69.53704,56.82677-71.51852,8.67323-1.98148,146.67323-8.98148,146.67323-8.98148l21,10Z" fill="#2f2e41" />
                <path id="uuid-91047c5b-47d7-4179-8a16-40bd6d529b28-203" d="M335.12666,172.23337c-8.35907-11.69074-9.10267-25.48009-1.66174-30.79863,7.44093-5.31854,20.24665-.15219,28.60713,11.54383,3.40375,4.62627,5.65012,10.00041,6.55111,15.67279l34.79215,49.9814-19.8001,13.70807-35.7745-48.83421c-5.07753-2.68845-9.43721-6.55406-12.71405-11.27326Z" fill="#a0616a" />
                <path d="M464.98463,112.60598l51-21,96,148s-67,15-90,18c-23,3-49-9-49-9l-8-136Z" fill="#6c63ff" />
                <path d="M526.98463,137.60598l-18.5-57.70866,24,18.20866s68,45,68,64c0,19,21,77,21,77,0,0,23.5,19.5,15.5,37.5-8,18,10.5,15.5,12.5,28.5,2,13-28.5,30.5-28.5,30.5,0,0-7.5-73.5-31.5-73.5-24,0-62.5-124.5-62.5-124.5Z" fill="#3f3d56" />
                <path d="M468.56831,111.13035l-25.08368,9.97563s4,70,8,76c4,6,18,38,18,38v10.42913s-28,8.57087-27,13.57087c1,5,66,19,66,19,0,0-13-40-21-53-8-13-18.91632-113.97563-18.91632-113.97563Z" fill="#3f3d56" />
                <path d="M452.48463,121.10598s-29-4-34,30c-5,34-1.82283,38.5-1.82283,38.5l-8.17717,19.5-27-30-26,17s47,76,66,74c19-2,47-57,47-57l-16-92Z" fill="#3f3d56" />
                <path d="M597.32321,270.14478l-14.83858,209.96121-38.5-1.5s-8.5-198.5-8.5-201.5c0-3,4-20,29-21,25-1,32.83858,14.03879,32.83858,14.03879Z" fill="#2f2e41" />
                <path d="M541.48463,484.10598s20-6,23-2c3,4,20,6,20,6l5,49s-14,10-16,12-55,4-56-8c-1-12,14-27,14-27l10-30Z" fill="#2f2e41" />
                <path d="M394.48463,470.10598s6-5,8,9c2,14,9,37-1,40-10,3-110,4-110-5v-9l9-7,18.00394-2.869s34.99606-32.131,38.99606-32.131c4,0,17,13,17,13l20-6Z" fill="#2f2e41" />
                <path d="M505.98463,77.60598s-20-24-28-22-3,5-3,5l-20-22s-16-6-31,13c0,0-9-16,0-25,9-9,12-8,14-13,2-5,16-9,16-9,0,0-.80315-7.19685,3.59843-3.59843s15.3937,3.59843,15.3937,3.59843c0,0,.06299-4,4.53543,0,4.47244,4,9.47244,2,9.47244,2,0,0,0,6.92126,3.5,6.96063,3.5,.03937,9.5-4.96063,10.5-.96063,1,4,8,6,9,18,1,12-4,47-4,47Z" fill="#2f2e41" />
                <g>
                  <path d="M342.99463,178.84874l-114.2362,78.82694c-3.94205,2.72015-9.36214,1.72624-12.08229-2.21581l-32.16176-46.60891c-2.72015-3.94205-1.7259-9.36208,2.21615-12.08223l114.2362-78.82694c3.94205-2.72015,9.36214-1.72624,12.08229,2.21581l32.16176,46.60891c2.72015,3.94205,1.7259,9.36208-2.21615,12.08223Z" fill="#fff" />
                  <path d="M312.83914,120.30274l32.16148,46.6085c2.64627,3.83499,1.68408,9.08121-2.15091,11.72749l-56.06388,38.68602c-14.78562-4.04015-28.2774-13.11486-37.66263-26.71596-6.14766-8.9092-9.85314-18.77211-11.26649-28.80885l63.25494-43.6481c3.83499-2.64627,9.08121-1.68408,11.72749,2.15091Z" fill="#e6e6e6" />
                  <path d="M223.84012,260.20913c-3.0791,0-6.10938-1.46094-7.9873-4.18066l-32.16211-46.60938c-1.4668-2.12695-2.01758-4.7002-1.5498-7.24805,.4668-2.54785,1.89551-4.75879,4.02246-6.22559l114.23535-78.82715c4.39746-3.03223,10.44043-1.92285,13.47363,2.4707l32.16211,46.60938c1.4668,2.12695,2.01758,4.7002,1.5498,7.24805-.4668,2.54688-1.89551,4.75879-4.02148,6.22559l-114.23633,78.82715c-1.67578,1.15527-3.59082,1.70996-5.48633,1.70996Zm82.04785-142.80176c-1.50391,0-3.02344,.44043-4.35254,1.35742l-114.23633,78.82715c-1.6875,1.16309-2.82031,2.91797-3.19141,4.94043-.37109,2.02148,.06543,4.06445,1.22949,5.75l32.16211,46.60938c2.40625,3.48633,7.20215,4.36816,10.69043,1.96094l114.2373-78.82715c1.68652-1.16309,2.81934-2.91797,3.19043-4.94043,.37109-2.02148-.06543-4.06445-1.22949-5.75l-32.16211-46.60938c-1.48926-2.1582-3.89453-3.31836-6.33789-3.31836Z" fill="#3f3d56" />
                  <path d="M224.6666,236.93718c-2.89521,1.9978-3.6253,5.97848-1.6275,8.87369,1.9978,2.89521,5.97848,3.6253,8.87369,1.6275l11.76134-8.11573c2.89521-1.9978,3.6253-5.97848,1.6275-8.87369-1.9978-2.89521-5.97848-3.6253-8.87369-1.6275l-11.76134,8.11573Z" fill="#6c63ff" />
                  <path d="M232.63862,171.91114c-4.56802,3.15209-5.71978,9.43286-2.56769,14.00088,3.15209,4.56802,9.43252,5.71972,14.00054,2.56763l18.29546-12.6245c4.56802-3.15209,5.72007-9.43245,2.56797-14.00047-3.15209-4.56802-9.4328-5.72013-14.00082-2.56804l-18.29546,12.6245Z" fill="#6c63ff" />
                </g>
                <g>
                  <path d="M340.25926,185.80874H201.4659c-4.78947,0-8.68608-3.89636-8.68608-8.68583v-56.62834c0-4.78947,3.89661-8.68583,8.68608-8.68583h138.79336c4.78947,0,8.68608,3.89636,8.68608,8.68583v56.62834c0,4.78947-3.89661,8.68583-8.68608,8.68583Z" fill="#fff" />
                  <path d="M348.69017,120.49482v56.62784c0,4.65939-3.77152,8.43091-8.43091,8.43091h-68.11583c-9.87497-11.72273-15.82567-26.8544-15.82567-43.37931,0-10.82439,2.55172-21.04674,7.08876-30.11034h76.85275c4.65939,0,8.43091,3.77152,8.43091,8.43091Z" fill="#e6e6e6" />
                  <path d="M340.25907,186.80874H201.4661c-5.34082,0-9.68652-4.34473-9.68652-9.68555v-56.62891c0-5.34082,4.3457-9.68555,9.68652-9.68555h138.79297c5.34082,0,9.68652,4.34473,9.68652,9.68555v56.62891c0,5.34082-4.3457,9.68555-9.68652,9.68555ZM201.4661,112.80874c-4.23828,0-7.68652,3.44727-7.68652,7.68555v56.62891c0,4.23828,3.44824,7.68555,7.68652,7.68555h138.79297c4.23828,0,7.68652-3.44727,7.68652-7.68555v-56.62891c0-4.23828-3.44824-7.68555-7.68652-7.68555H201.4661Z" fill="#3f3d56" />
                  <path d="M209.87637,166.41564c-3.51759,0-6.37931,2.86172-6.37931,6.37931s2.86172,6.37931,6.37931,6.37931h14.28966c3.51759,0,6.37931-2.86172,6.37931-6.37931s-2.86172-6.37931-6.37931-6.37931h-14.28966Z" fill="#6c63ff" />
                  <path d="M253.36907,117.42253c-5.55,0-10.06511,4.51536-10.06511,10.06536s4.51511,10.06486,10.06511,10.06486h22.22841c5.55,0,10.06511-4.51486,10.06511-10.06486s-4.51511-10.06536-10.06511-10.06536h-22.22841Z" fill="#6c63ff" />
                </g>
                <g>
                  <path d="M456.25926,381.80874h-138.79336c-4.78947,0-8.68608-3.89636-8.68608-8.68583v-56.62834c0-4.78947,3.89661-8.68583,8.68608-8.68583h138.79336c4.78947,0,8.68608,3.89636,8.68608,8.68583v56.62834c0,4.78947-3.89661,8.68583-8.68608,8.68583Z" fill="#fff" />
                  <path d="M464.69017,316.49482v56.62784c0,4.65939-3.77152,8.43091-8.43091,8.43091h-68.11583c-9.87497-11.72273-15.82567-26.8544-15.82567-43.37931,0-10.82439,2.55172-21.04674,7.08876-30.11034h76.85275c4.65939,0,8.43091,3.77152,8.43091,8.43091Z" fill="#e6e6e6" />
                  <path d="M456.25907,382.80874h-138.79297c-5.34082,0-9.68652-4.34473-9.68652-9.68555v-56.62891c0-5.34082,4.3457-9.68555,9.68652-9.68555h138.79297c5.34082,0,9.68652,4.34473,9.68652,9.68555v56.62891c0,5.34082-4.3457,9.68555-9.68652,9.68555Zm-138.79297-74c-4.23828,0-7.68652,3.44727-7.68652,7.68555v56.62891c0,4.23828,3.44824,7.68555,7.68652,7.68555h138.79297c4.23828,0,7.68652-3.44727,7.68652-7.68555v-56.62891c0-4.23828-3.44824-7.68555-7.68652-7.68555h-138.79297Z" fill="#3f3d56" />
                  <path d="M325.87637,362.41564c-3.51759,0-6.37931,2.86172-6.37931,6.37931s2.86172,6.37931,6.37931,6.37931h14.28966c3.51759,0,6.37931-2.86172,6.37931-6.37931s-2.86172-6.37931-6.37931-6.37931h-14.28966Z" fill="#6c63ff" />
                  <path d="M369.36907,313.42253c-5.55,0-10.06511,4.51536-10.06511,10.06536s4.51511,10.06486,10.06511,10.06486h22.22841c5.55,0,10.06511-4.51486,10.06511-10.06486s-4.51511-10.06536-10.06511-10.06536h-22.22841Z" fill="#6c63ff" />
                </g>
                <path id="uuid-c026fd96-7d81-4b34-bb39-0646c0e08e96-204" d="M465.67391,331.01678c-12.74718,6.63753-26.5046,5.44058-30.72743-2.67249-4.22283-8.11308,2.6878-20.06802,15.44041-26.70621,5.05777-2.72156,10.69376-4.19231,16.43644-4.28916l54.36547-27.44139,10.79681,21.52636-53.36733,28.57487c-3.37375,4.65048-7.81238,8.42516-12.94437,11.00803Z" fill="#a0616a" />
                <path d="M527.48463,97.10598s56-3,68,27c12,30,22,128,22,128l-122,66.37402-21-32.37402,82-64-29-125Z" fill="#3f3d56" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
