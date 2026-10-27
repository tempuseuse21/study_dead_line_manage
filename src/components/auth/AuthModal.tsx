import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_BATCH_REGISTRATION_CODE } from '../../lib/authorizedRoster';

interface AuthModalProps {
  forceFullPage?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ forceFullPage = false }) => {
  const {
    user,
    showAuthModal,
    setShowAuthModal,
    loginStudent,
    registerStudent,
    resetPassword,
    authMode,
    setAuthMode
  } = useAuth();

  // Login form state
  const [loginStudentId, setLoginStudentId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regStudentId, setRegStudentId] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regCode, setRegCode] = useState(DEFAULT_BATCH_REGISTRATION_CODE);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password form state
  const [forgotStudentId, setForgotStudentId] = useState('');
  const [forgotCode, setForgotCode] = useState(DEFAULT_BATCH_REGISTRATION_CODE);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isMandatory = forceFullPage || !user;

  if (!isMandatory && !showAuthModal) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const res = await loginStudent(loginStudentId, loginPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed');
    } else {
      setShowAuthModal(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const res = await registerStudent({
      studentId: regStudentId,
      fullName: regFullName,
      registrationCode: regCode,
      password: regPassword,
      confirmPassword: regConfirmPassword
    });

    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed');
    } else {
      setSuccessMsg('Registration successful! You are now logged in.');
      setTimeout(() => setShowAuthModal(false), 1200);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const res = await resetPassword({
      studentId: forgotStudentId,
      registrationCode: forgotCode,
      newPassword: forgotNewPassword,
      confirmPassword: forgotConfirmPassword
    });

    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Password reset failed');
    } else {
      setSuccessMsg('Password updated successfully! You can now log in with your new password.');
      setLoginStudentId(forgotStudentId.trim().toUpperCase());
      setLoginPassword('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setTimeout(() => {
        setAuthMode('login');
      }, 1500);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-lg overflow-y-auto animate-in fade-in duration-200 ${
        isMandatory ? 'min-h-screen' : ''
      }`}
      onClick={() => {
        if (!isMandatory) setShowAuthModal(false);
      }}
    >
      <div
        className="relative w-full max-w-md my-auto max-h-[90vh] rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-8 shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button (only if not mandatory login) */}
        {!isMandatory && (
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-5 right-5 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header Banner */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand-bg text-white shadow-lg shadow-indigo-500/25 mb-3">
            <GraduationCap className="h-7 w-7" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-indigo-500/20">
            Dhirubhai Ambani University
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--text-main)] tracking-tight">
            MSc IT Shared Deadline Portal
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Sign in to access shared assignments, calendar, and batch timetable.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {authMode === 'forgot_password' ? (
          <div className="flex items-center justify-between p-2 mb-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-2 pl-2">
              <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-[var(--text-main)]">Reset Account Password</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="px-3 py-1.5 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15 transition-all cursor-pointer"
            >
              &larr; Back to Login
            </button>
          </div>
        ) : (
          <div className="flex p-1 mb-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'gradient-brand-bg text-white shadow-sm font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'gradient-brand-bg text-white shadow-sm font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              First-Time Registration
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {authMode === 'login' ? (
          /* Student Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Student ID / Roll Number *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-faint)]" />
                <input
                  type="text"
                  required
                  value={loginStudentId}
                  onChange={e => setLoginStudentId(e.target.value)}
                  placeholder="e.g. 202612045 or admin"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] uppercase font-mono font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[var(--text-muted)]">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot_password');
                    setErrorMsg('');
                    setSuccessMsg('');
                    if (loginStudentId) setForgotStudentId(loginStudentId);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-faint)]" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your account password..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-10 pr-10 py-2.5 text-xs text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-[var(--text-faint)] hover:text-[var(--text-muted)] cursor-pointer"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl gradient-brand-bg text-white py-3 text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Log In to Batch Portal'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('forgot_password');
                  setErrorMsg('');
                  setSuccessMsg('');
                  if (loginStudentId) setForgotStudentId(loginStudentId);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Forgot password? Reset here</span>
              </button>
            </div>
          </form>
        ) : authMode === 'forgot_password' ? (
          /* Forgot Password / Reset Form */
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Student ID / Roll Number *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-faint)]" />
                <input
                  type="text"
                  required
                  value={forgotStudentId}
                  onChange={e => setForgotStudentId(e.target.value)}
                  placeholder="e.g. 202612045 or admin"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] uppercase font-mono font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[var(--text-muted)]">
                  Batch Registration Passcode *
                </label>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                  Default: MSCIT2026
                </span>
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-faint)]" />
                <input
                  type="text"
                  required
                  value={forgotCode}
                  onChange={e => setForgotCode(e.target.value)}
                  placeholder="MSCIT2026"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] font-mono font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-[var(--text-faint)] mt-1">
                Passcode authorized by MSc IT Department (default: MSCIT2026).
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  New Password * (Min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-faint)]" />
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={e => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new secure password..."
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-10 pr-10 py-2.5 text-xs text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute right-3 top-3 text-[var(--text-faint)] hover:text-[var(--text-muted)] cursor-pointer"
                    title={showForgotNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showForgotNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-faint)]" />
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={forgotConfirmPassword}
                    onChange={e => setForgotConfirmPassword(e.target.value)}
                    placeholder="Confirm new secure password..."
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-1/3 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl gradient-brand-bg text-white py-2.5 text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Resetting Password...' : 'Reset & Save Password'}</span>
                <KeyRound className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Student Registration Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Student ID / Roll Number *
              </label>
              <input
                type="text"
                required
                value={regStudentId}
                onChange={e => setRegStudentId(e.target.value)}
                placeholder="e.g. 202612045"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs text-[var(--text-main)] uppercase font-mono font-semibold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Authorized Full Name *
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={e => setRegFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma (Must match batch roster name)"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Batch Registration Passcode *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--text-faint)]" />
                <input
                  type="text"
                  required
                  value={regCode}
                  onChange={e => setRegCode(e.target.value)}
                  placeholder="Passcode (Default: MSCIT2026)"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-9 pr-3 py-2 text-xs text-[var(--text-main)] font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-3 pr-8 py-2 text-xs text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-2.5 text-[var(--text-faint)] hover:text-[var(--text-muted)] cursor-pointer"
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-3 pr-8 py-2 text-xs text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl gradient-brand-bg text-white py-2.5 text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-98 transition-all mt-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Validating Roster & Registering...' : 'Complete Batch Registration'}</span>
              <ShieldCheck className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
