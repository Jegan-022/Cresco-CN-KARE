import React, { useState } from 'react';
import { X, AlertCircle, RefreshCw, ArrowRight, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Loader } from './ui/Loader';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle, loginWithStudentId, authError, clearAuthError } = useAuth();
  
  const [studentIdInput, setStudentIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const displayError = localError || authError;

  const handleStudentIdLogin = async (idToUse?: string) => {
    const id = idToUse || studentIdInput;
    if (!id.trim()) {
      setLocalError('Please enter your KLU Student ID or Roll Number.');
      return;
    }
    if (!passwordInput.trim()) {
      setLocalError('Please enter your student portal password.');
      return;
    }
    if (passwordInput.trim().length < 4) {
      setLocalError('Password must be at least 4 characters.');
      return;
    }
    clearAuthError();
    setLocalError(null);
    setLoading(true);
    try {
      await loginWithStudentId(id.trim(), passwordInput.trim());
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearAuthError();
    setLocalError(null);
    setLoading(true);
    
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      if (err.message === 'SIGN_IN_CANCELLED') {
        return;
      }
      console.error(err);
      setLocalError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-cyan-400/40 shadow-xs bg-gradient-to-br from-[#0d3b46] to-[#08252d] flex items-center justify-center shrink-0">
              <img 
                src="/assets/brand/cresco-favicon.png" 
                alt="Cresco CN Mascot" 
                className="w-full h-full object-contain p-0.5" 
              />
              <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-slate-900 shadow-xs animate-packet-beacon" />
            </div>
            <div>
              <h2 className="text-base font-headline font-black text-slate-900 tracking-tight leading-none">
                Cresco<span className="text-cyan-600">-CN</span> Portal
              </h2>
              <span className="text-[10px] font-mono text-emerald-600 font-bold tracking-wider uppercase leading-none block mt-1">
                Student Verification
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-500 text-center">
            Enter your Student ID / Roll Number or sign in with Google to continue.
          </p>

          {displayError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start space-x-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Student ID Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStudentIdLogin();
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                KLU Student ID / Roll No.
              </label>
              <input
                type="text"
                placeholder="e.g. 99240040116 or 40116"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password (e.g. Klu@40116)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? (
                <Loader size="1.4em" />
              ) : (
                <>
                  <span>Access Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Direct ID &amp; Password sign-in enabled. No Google account required.
            </p>
          </form>

          <div className="p-6 pt-0 bg-white">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-mono">Or via Google</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium rounded-xl text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <Loader size="1.4em" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
