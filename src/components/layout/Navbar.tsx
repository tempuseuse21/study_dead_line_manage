import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Plus,
  Sun,
  Moon,
  Bell,
  Search,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
  CheckSquare,
  Clock,
  Calendar,
  BookOpen,
  Megaphone,
  Settings,
  Maximize2,
  Minimize2,
  Smartphone,
  Download
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const {
    setIsCreateTaskModalOpen,
    notifications,
    setIsNotificationDrawerOpen,
    setIsSearchModalOpen,
    setIsUnlockAdminModalOpen,
    isAdmin,
    tasks,
    unreadAnnouncementsCount
  } = useTasks();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Listen for Fullscreen state change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Listen for PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Fullscreen request error:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error('Exit fullscreen error:', err);
        });
      }
    }
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      alert(
        '📲 Add to Home Screen Instructions:\n\n' +
        '• Android / Chrome: Tap browser menu (⋮) -> Select "Add to Home screen" or "Install App".\n' +
        '• iPhone / Safari: Tap Share button (⎋) -> Scroll & select "Add to Home Screen".'
      );
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const activeTaskCount = tasks.filter(t => t.status !== 'completed').length;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: activeTaskCount || undefined },
    { id: 'announcements', label: 'Notices', icon: Megaphone, badge: unreadAnnouncementsCount || undefined },
    { id: 'timetable', label: 'Timetable', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-30 flex w-full max-w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-all overflow-x-hidden">
      {/* Brand & Main Navigation Links */}
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-brand-bg flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Dhirubhai Ambani University
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] font-mono leading-none">
              MSc IT Shared Deadline Portal
            </p>
          </div>
        </div>

        {/* Upper Bar Navigation Links (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'gradient-brand-bg text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Action Buttons & Profile Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Add to Homescreen Button */}
        <button
          onClick={handleInstallApp}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer text-xs font-bold"
          title="Add to Home Screen / Install App"
        >
          <Smartphone className="w-4 h-4 text-indigo-500" />
          <span className="hidden sm:inline">Add to Homescreen</span>
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10 transition-all cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        {/* Search Button */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10 transition-all cursor-pointer"
          title="Search Tasks (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Admin Portal Button */}
        <button
          onClick={() => setIsUnlockAdminModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            isAdmin
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
              : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10'
          }`}
          title={isAdmin ? 'Super Admin Mode Active' : 'Super Admin Portal'}
        >
          {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-indigo-500" />}
          <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Admin'}</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-indigo-500/10 transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Switcher */}
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

        {/* Logged-In User Badge & Logout */}
        {user && (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-[var(--border-subtle)]">
            <span className="hidden lg:inline text-xs font-bold text-[var(--text-main)] max-w-[100px] truncate">
              {user.fullName.split(' ')[0]}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add Task Primary Action Button */}
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl gradient-brand-bg text-white font-bold text-xs shadow-md shadow-indigo-500/25 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>
    </header>
  );
};
