import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  CheckCircle2,
  Calendar,
  Bell,
  Zap,
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const { tasks, analytics, unreadAnnouncementsCount } = useTasks();

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const activeCount = tasks.filter(t => t.status !== 'completed').length;

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Active Tasks', icon: CheckSquare, badge: activeCount },
        { id: 'completed', label: 'Completed Tasks', icon: CheckCircle2, badge: completedCount || undefined },
        { id: 'calendar', label: 'Calendar', icon: Calendar }
      ]
    },
    {
      title: 'Academic & Focus',
      items: [
        { id: 'announcements', label: 'Notice Board', icon: Bell, badge: unreadAnnouncementsCount || undefined },
        { id: 'focus', label: 'Focus Mode', icon: Zap }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[280px] bg-[var(--bg-card)] border-r border-[var(--border-subtle)] px-4 py-6 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto shadow-sm">
      <nav className="flex flex-col gap-5 flex-1">
        {sections.map(section => (
          <div key={section.title}>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-faint)] px-3 mb-2 block font-mono">
              {section.title}
            </span>
            <div className="flex flex-col gap-1">
              {section.items.map(item => {
                const isActive = activeView === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      'group w-full px-3 py-2.5 rounded-xl font-medium text-sm flex items-center justify-between transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs border-l-4 border-indigo-600 dark:border-indigo-400'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IconComponent
                        className={cn(
                          'w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                          isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--text-faint)] group-hover:text-[var(--text-muted)]'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge !== 0 && (
                      <span className={cn(
                        'text-[0.65rem] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 font-mono transition-all',
                        isActive
                          ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                          : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] group-hover:bg-indigo-500/10 group-hover:text-indigo-600'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Progress Footer Card */}
      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-[var(--text-main)]">Daily Target</span>
          </div>
          <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {analytics.completionRate}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${Math.max(5, analytics.completionRate)}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
