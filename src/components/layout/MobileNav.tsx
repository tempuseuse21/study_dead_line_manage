import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Target,
  Plus,
  Megaphone
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

interface MobileNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, onNavigate }) => {
  const { setIsCreateTaskModalOpen, analytics, unreadAnnouncementsCount } = useTasks();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: analytics.pendingTasks, badgeColor: 'bg-ink dark:bg-ink-faint text-bg dark:text-ink' },
    { id: 'announcements', label: 'CR Notices', icon: Megaphone, badge: unreadAnnouncementsCount, badgeColor: 'bg-amber-500' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'focus', label: 'Focus', icon: Target },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t-[1.5px] border-ink-faint dark:border-ink-faint bg-bg/95 dark:bg-ink/95 backdrop-blur-md px-2 lg:hidden">
        {navItems.slice(0, 2).map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] min-h-[44px] relative transition-colors ${
                isActive
                  ? 'text-ink dark:text-bg dark:text-blue-400 font-bold'
                  : 'text-ink-muted dark:text-ink-muted hover:text-ink dark:hover:text-bg'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute top-1 right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full ${item.badgeColor || 'bg-ink dark:bg-ink-faint text-bg dark:text-ink'} text-[9px] font-bold text-white shadow-none`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Center Floating Plus Button */}
        <div className="relative -top-3">
          <button
            id="mobile-add-task-fab"
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-ink dark:bg-ink-faint text-bg dark:text-ink text-white shadow-none shadow-blue-500/30 active:scale-95 transition-all"
            title="Add Academic Task"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {navItems.slice(2).map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] min-h-[44px] relative transition-colors ${
                isActive
                  ? 'text-ink dark:text-bg dark:text-blue-400 font-bold'
                  : 'text-ink-muted dark:text-ink-muted hover:text-ink dark:hover:text-bg'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute top-1 right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full ${item.badgeColor || 'bg-amber-500'} text-[9px] font-bold text-white shadow-none`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
