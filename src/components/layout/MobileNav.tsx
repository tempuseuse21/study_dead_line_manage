import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  CheckCircle2,
  Calendar,
  Clock,
  Zap,
  Plus,
  Bell,
  X,
  Menu,
  BookOpen,
  GraduationCap,
  ListTodo,
  RotateCcw,
  StickyNote,
  Library,
  Target,
  BarChart3,
  Activity,
  Settings,
  Search,
  Sun,
  Moon,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  LogIn,
  Sparkles
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface MobileNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, onNavigate }) => {
  const {
    setIsCreateTaskModalOpen,
    tasks,
    unreadAnnouncementsCount,
    notifications,
    setIsNotificationDrawerOpen,
    setIsSearchModalOpen,
    setIsUnlockAdminModalOpen,
    isAdmin
  } = useTasks();
  const { user, logout, setShowAuthModal, setAuthMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const activeCount = tasks.filter(t => t.status !== 'completed').length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const leftNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Active', icon: CheckSquare, badge: activeCount }
  ];

  const rightNavItems = [
    { id: 'completed', label: 'Completed', icon: CheckCircle2, badge: completedCount || undefined },
    { id: 'announcements', label: 'Notices', icon: Bell, badge: unreadAnnouncementsCount || undefined }
  ];

  const moreMenuItems = [
    { id: 'timetable', label: 'Class Timetable', icon: Clock },
    { id: 'calendar', label: 'Calendar Planner', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'settings', label: 'Settings & Data Backup', icon: Settings }
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Mobile More Sheet Overlay */}
      {showMoreMenu && (
        <div
          onClick={() => setShowMoreMenu(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full bg-[var(--bg-card)] border-t border-[var(--border-subtle)] rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-brand-bg flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--text-main)]">
                  Menu & Quick Tools
                </h3>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Profile Card & Logout */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-main)] leading-snug">
                        {user.fullName}
                      </div>
                      <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        Roll: {user.studentId}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMoreMenu(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-brand-bg text-white font-bold text-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Portal</span>
                </button>
              )}
            </div>

            {/* Quick Actions Grid: Search, Notifications, Theme, Admin */}
            <div className="grid grid-cols-4 gap-2">
              {/* Search */}
              <button
                onClick={() => {
                  setIsSearchModalOpen(true);
                  setShowMoreMenu(false);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-indigo-500/30 text-[var(--text-main)] transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 mb-1 text-indigo-500" />
                <span className="text-[10px] font-semibold">Search</span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => {
                  setIsNotificationDrawerOpen(true);
                  setShowMoreMenu(false);
                }}
                className="relative flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-indigo-500/30 text-[var(--text-main)] transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4 mb-1 text-amber-500" />
                <span className="text-[10px] font-semibold">Alerts</span>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono flex items-center justify-center">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-indigo-500/30 text-[var(--text-main)] transition-all cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 mb-1 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 mb-1 text-indigo-600" />
                )}
                <span className="text-[10px] font-semibold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>

              {/* CR Admin */}
              <button
                onClick={() => {
                  setIsUnlockAdminModalOpen(true);
                  setShowMoreMenu(false);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-emerald-500/30 text-[var(--text-main)] transition-all cursor-pointer"
              >
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 mb-1 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 mb-1 text-purple-500" />
                )}
                <span className="text-[10px] font-semibold">{isAdmin ? 'CR Admin' : 'Admin'}</span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-faint)] px-1">
                Academic Views
              </span>
              {moreMenuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'gradient-brand-bg text-white shadow-md'
                        : 'bg-[var(--bg-card-subtle)] text-[var(--text-main)] hover:bg-indigo-500/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/95 backdrop-blur-md px-2 lg:hidden shadow-lg">
        {leftNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[52px] min-h-[44px] relative transition-colors cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-0.5 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-indigo-600 text-white text-[9px] font-bold font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Center Floating Plus Action Button */}
        <div className="relative -top-3">
          <button
            id="mobile-add-task-fab"
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full gradient-brand-bg text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer"
            title="Add Academic Task"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {rightNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[52px] min-h-[44px] relative transition-colors cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-0.5 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[52px] min-h-[44px] transition-colors cursor-pointer ${
            ['calendar', 'timetable', 'subjects', 'settings'].includes(activeView)
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
