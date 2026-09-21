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
  Menu
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

interface MobileNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, onNavigate }) => {
  const { setIsCreateTaskModalOpen, tasks, unreadAnnouncementsCount } = useTasks();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const activeCount = tasks.filter(t => t.status !== 'completed').length;

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
    { id: 'focus', label: 'Focus Pomodoro Mode', icon: Zap }
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
            className="w-full bg-[var(--bg-card)] border-t border-[var(--border-subtle)] rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-display text-base font-bold text-[var(--text-main)]">
                Navigation Menu
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
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
            ['calendar', 'focus', 'settings'].includes(activeView)
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
