import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Plus,
  Sun,
  Moon,
  Bell,
  Database,
  Search,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  User,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, setShowAuthModal, setAuthMode } = useAuth();
  const {
    setIsCreateTaskModalOpen,
    notifications,
    setIsNotificationDrawerOpen,
    setIsSearchModalOpen,
    setIsUnlockAdminModalOpen,
    isAdmin,
    isSupabaseConnected
  } = useTasks();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="hidden lg:flex sticky top-0 z-30 w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-md px-3 sm:px-8 py-3.5 transition-all">
      {/* Brand Logo & Name */}
      <div
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-display font-bold text-base sm:text-xl tracking-tight text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              MSc IT <span className="gradient-text">Deadline Portal</span>
            </h1>
            <span className="text-[0.6rem] sm:text-[0.65rem] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Batch 2026
            </span>
            <span
              title={isSupabaseConnected ? 'Connected to Supabase Shared DB' : 'Local Storage Mode'}
              className={`hidden sm:inline-flex items-center gap-1 text-[0.65rem] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              <Database className="w-3 h-3" />
              {isSupabaseConnected ? 'Supabase Live' : 'Local DB'}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] hidden sm:block font-medium">
            Dhirubhai Ambani University • MSc IT Batch (125 Students)
          </p>
        </div>
      </div>

      {/* Global Actions & Student Profile Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer text-xs font-medium"
          title="Search Tasks (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Search...</span>
        </button>

        {/* Admin / CR Portal Button */}
        <button
          onClick={() => setIsUnlockAdminModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isAdmin
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
              : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10'
          }`}
          title={isAdmin ? 'CR Admin Mode Active' : 'CR Admin Portal'}
        >
          {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-indigo-500" />}
          <span className="hidden lg:inline">{isAdmin ? 'CR Admin' : 'Admin'}</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10 transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[0.6rem] font-bold font-mono flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10 transition-all cursor-pointer"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Logged In Student Profile Badge / Auth Buttons */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[var(--text-main)] leading-none">{user.fullName.split(' ')[0]}</span>
              <span className="text-[0.65rem] font-mono font-bold text-indigo-600 dark:text-indigo-400">{user.studentId}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
              title="Logout Student Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
        )}

        {/* Add Task Primary Action Button */}
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-brand-bg text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>
    </header>
  );
};
