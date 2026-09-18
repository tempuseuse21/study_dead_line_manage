import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Mail,
  User,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    user,
    members,
    showAuthModal,
    setShowAuthModal,
    login,
    register,
    switchUser
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('MSc Information Technology');
  const [semester, setSemester] = useState('2');
  const [college, setCollege] = useState('St. Xavier Institute of Technology');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showAuthModal) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your student email');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email);
      setShowAuthModal(false);
    } catch {
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please provide your name and email');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await register({
        name,
        email,
        college,
        course,
        semester,
        groupAction: 'join',
        inviteCode: 'MSCIT2026'
      });
      setShowAuthModal(false);
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = async (memberId: string) => {
    setIsLoading(true);
    try {
      await switchUser(memberId);
      setShowAuthModal(false);
    } catch {
      setError('Failed to switch user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-[32px] border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-ink-muted hover:text-ink-muted dark:hover:text-bg hover:bg-ink-faint dark:hover:bg-ink transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink text-white shadow-none shadow-blue-500/20 mb-3">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-ink dark:text-white tracking-tight">
            {mode === 'signin' ? 'Welcome to StudySync' : 'Join Academic Workspace'}
          </h2>
          <p className="text-xs text-ink-muted dark:text-ink-muted mt-1">
            Common Academic Dashboard & Deadline Tracker for MSc IT
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex p-1 mb-5 rounded-none bg-ink-faint dark:bg-ink text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`flex-1 py-2 rounded-none transition-all ${
              mode === 'signin'
                ? 'bg-bg dark:bg-ink text-ink dark:text-bg dark:text-blue-400 shadow-none'
                : 'text-ink-muted dark:text-ink-muted hover:text-ink'
            }`}
          >
            Sign In / Quick Access
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2 rounded-none transition-all ${
              mode === 'register'
                ? 'bg-bg dark:bg-ink text-ink dark:text-bg dark:text-blue-400 shadow-none'
                : 'text-ink-muted dark:text-ink-muted hover:text-ink'
            }`}
          >
            Register Student
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-none bg-rose-50 dark:bg-rose-950/40 border-[1.5px] border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-medium text-center">
            {error}
          </div>
        )}

        {mode === 'signin' ? (
          <div className="space-y-4">
            {/* Quick Demo Student Profiles */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2">
                Quick Select Student Account
              </label>
              <div className="grid grid-cols-2 gap-2">
                {members.slice(0, 4).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickSelect(m.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-none border-[1.5px] text-left transition-all ${
                      user?.id === m.id
                        ? 'border-blue-500 bg-ink-faint dark:bg-ink/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-ink-faint dark:border-ink-faint bg-bg/50 dark:bg-ink/40 hover:border-blue-300 hover:bg-ink-faint'
                    }`}
                  >
                    <img
                      src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={m.name}
                      className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink dark:text-bg truncate">{m.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-ink-muted truncate">Sem {m.semester || '2'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t-[1.5px] border-ink-faint dark:border-ink-faint" />
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-ink-muted">or sign in with email</span>
              <div className="flex-grow border-t-[1.5px] border-ink-faint dark:border-ink-faint" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@mscit.edu"
                    className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink pl-10 pr-4 py-2.5 text-xs text-ink dark:text-white placeholder:text-ink-muted focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint py-3 text-xs font-bold text-white shadow-none shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink pl-10 pr-4 py-2.5 text-xs text-ink dark:text-white placeholder:text-ink-muted focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted mb-1">
                Student Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink pl-10 pr-4 py-2.5 text-xs text-ink dark:text-white placeholder:text-ink-muted focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted mb-1">
                  Course
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-2.5 text-xs text-ink dark:text-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint py-3 text-xs font-bold text-white shadow-none shadow-blue-500/25 active:scale-95 transition-all mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Join Shared Dashboard'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Continue as Guest Footer */}
        <div className="mt-5 pt-4 border-t-[1.5px] border-ink-faint dark:border-ink-faint text-center">
          <button
            type="button"
            onClick={() => setShowAuthModal(false)}
            className="text-xs font-semibold text-ink-muted dark:text-ink-muted hover:text-ink dark:text-bg dark:hover:text-blue-400 transition-colors"
          >
            Continue as Guest (Browse & Add Tasks Freely) →
          </button>
        </div>
      </div>
    </div>
  );
};
