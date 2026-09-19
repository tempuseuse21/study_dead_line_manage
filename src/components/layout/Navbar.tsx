import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import {
  Sparkles,
  Plus,
  Search,
  Sun,
  Moon,
  Flame,
  Bell,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const {
    setIsCreateTaskModalOpen,
    setIsSearchModalOpen,
    notifications,
    analytics,
    setIsNotificationDrawerOpen
  } = useTasks();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-md px-3 sm:px-8 py-3.5 transition-all">
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
              Study<span className="gradient-text">Sync</span>
            </h1>
            <span className="text-[0.6rem] sm:text-[0.65rem] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Academic OS
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] hidden sm:block">
            Smart Deadline & Study Productivity Manager
          </p>
        </div>
      </div>

      {/* Global Actions & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-4">
        {/* Quick Search Bar Trigger */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-indigo-500/30 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
          title="Search Tasks & Notices"
        >
          <Search className="w-4 h-4 text-[var(--text-faint)]" />
          <span className="hidden md:inline">Search tasks, notices...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[0.65rem] font-mono rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-faint)]">
            Ctrl+K
          </kbd>
        </button>

        {/* Streak Counter Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono shadow-xs">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
          <span>{analytics.currentStreak || 5}d Streak</span>
        </div>

        {/* Notifications Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer"
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
          className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Add Task Primary Action Button */}
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand-bg text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>
    </header>
  );
};
