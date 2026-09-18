import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Trash2,
  Megaphone,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

interface NotificationDrawerProps {
  onNavigate?: (view: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onNavigate }) => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    setSelectedTask,
    tasks,
    browserNotificationPermission,
    enableBrowserNotifications,
    sendTestWebsiteNotification
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'all' | 'announcements' | 'tasks' | 'deadlines'>('all');

  if (!isNotificationDrawerOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'announcements') {
      return n.title.includes('Announcement') || n.title.includes('CR') || n.title.includes('Notice');
    }
    if (activeTab === 'tasks') {
      return n.type === 'TASK_CREATED' || n.type === 'TASK_ASSIGNED' || n.title.includes('Assignment') || n.title.includes('Task');
    }
    if (activeTab === 'deadlines') {
      return n.type.includes('DEADLINE') || n.type === 'TASK_OVERDUE' || n.title.includes('Due');
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-bg dark:bg-ink h-full border-l-[1.5px] border-ink-faint dark:border-ink-faint shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b-[1.5px] border-ink-faint dark:border-ink-faint flex items-center justify-between bg-bg/80 dark:bg-ink-850/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-none bg-ink-faint dark:bg-ink0/10 text-ink dark:text-bg dark:text-blue-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-ink dark:text-white">
                  Website Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-ink dark:bg-ink-faint text-bg dark:text-ink text-white text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink-muted dark:text-ink-muted">
                Live alerts for all class assignments & CR notices
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationDrawerOpen(false)}
            className="p-2 rounded-none text-ink-muted hover:text-ink-muted dark:hover:text-bg hover:bg-ink-faint/60 dark:hover:bg-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Browser Desktop Push Notification Banner */}
        <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-ink-850 dark:to-indigo-950/40 border-b-[1.5px] border-blue-100 dark:border-ink-faint flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-semibold text-ink dark:text-bg">
                {browserNotificationPermission === 'granted'
                  ? 'Desktop Alerts: Active ✅'
                  : 'Desktop Alerts: Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={sendTestWebsiteNotification}
                className="px-2.5 py-1 rounded-none bg-bg dark:bg-ink border-[1.5px] border-ink-faint dark:border-ink-faint text-[11px] font-semibold text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink-700 flex items-center gap-1 transition-all shadow-none"
                title="Test sound & desktop alert"
              >
                <Volume2 className="h-3 w-3 text-ink dark:text-bg" />
                <span>Test Alert</span>
              </button>

              {browserNotificationPermission !== 'granted' && (
                <button
                  onClick={enableBrowserNotifications}
                  className="px-2.5 py-1 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-none"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Enable</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-ink-muted dark:text-ink-muted">
            {browserNotificationPermission === 'granted'
              ? 'Everyone receives live pop-up notifications & chimes whenever a task or CR notice is posted.'
              : 'Allow browser notifications so you never miss an urgent assignment or CR announcement even in other tabs.'}
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center px-4 py-2 border-b-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-none font-semibold transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-ink dark:bg-bg text-white dark:text-ink'
                : 'text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-none font-semibold transition-all shrink-0 ${
              activeTab === 'announcements'
                ? 'bg-amber-600 text-white'
                : 'text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink'
            }`}
          >
            📢 CR Notices
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-none font-semibold transition-all shrink-0 ${
              activeTab === 'tasks'
                ? 'bg-ink dark:bg-ink-faint text-bg dark:text-ink text-white'
                : 'text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink'
            }`}
          >
            📋 Tasks
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`px-3 py-1.5 rounded-none font-semibold transition-all shrink-0 ${
              activeTab === 'deadlines'
                ? 'bg-rose-600 text-white'
                : 'text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink'
            }`}
          >
            ⏰ Deadlines
          </button>
        </div>

        {/* Notification Actions Toolbar */}
        {notifications.length > 0 && (
          <div className="px-5 py-2 border-b-[1.5px] border-ink-faint/70 dark:border-ink-faint/70 flex items-center justify-between text-[11px] text-ink-muted bg-bg/50 dark:bg-ink/50">
            <span>Showing {filteredNotifications.length} items</span>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllNotificationsRead}
                className="font-semibold text-ink dark:text-bg dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
              <button
                onClick={clearAllNotifications}
                className="font-medium text-rose-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear all</span>
              </button>
            </div>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-ink-muted">
              <Bell className="h-10 w-10 mx-auto mb-2.5 text-ink-muted dark:text-ink-muted" />
              <p className="text-sm font-semibold text-ink-muted dark:text-ink-muted">
                No notifications in this category
              </p>
              <p className="text-xs text-ink-muted mt-1">
                New assignment submissions and CR announcements will appear here instantly.
              </p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const isAnnouncement =
                n.title.includes('Announcement') || n.title.includes('CR') || n.title.includes('Notice');
              const isDeadline =
                n.type.includes('DEADLINE') || n.type === 'TASK_OVERDUE' || n.title.includes('Due');

              return (
                <div
                  key={n.id}
                  id={`notif-item-${n.id}`}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (isAnnouncement) {
                      setIsNotificationDrawerOpen(false);
                      if (onNavigate) onNavigate('announcements');
                    } else if (n.taskId) {
                      const t = tasks.find(tsk => tsk.id === n.taskId);
                      if (t) {
                        setSelectedTask(t);
                        setIsNotificationDrawerOpen(false);
                      }
                    }
                  }}
                  className={`p-3.5 rounded-none border-[1.5px] text-xs transition-all cursor-pointer relative group ${
                    !n.isRead
                      ? isAnnouncement
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/80 shadow-none'
                        : isDeadline
                        ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300/80 dark:border-rose-800/80 shadow-none'
                        : 'bg-ink-faint dark:bg-ink/70 dark:bg-blue-950/20 border-blue-300/80 dark:border-blue-800/80 shadow-none'
                      : 'bg-bg dark:bg-ink-850 border-ink-faint/80 dark:border-ink-faint opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isAnnouncement ? (
                        <span className="p-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          <Megaphone className="h-3.5 w-3.5" />
                        </span>
                      ) : isDeadline ? (
                        <span className="p-1 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300">
                          <Clock className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="p-1 rounded-md bg-ink-faint dark:bg-ink0/20 text-blue-700 dark:text-blue-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      )}

                      <h4 className="font-bold text-ink dark:text-white flex items-center gap-1.5">
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-ink dark:bg-ink-faint text-bg dark:text-ink flex-shrink-0 animate-pulse" />
                        )}
                        <span>{n.title}</span>
                      </h4>
                    </div>

                    <span className="text-[10px] text-ink-muted flex-shrink-0">
                      {new Date(n.sentAt || n.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="text-ink-muted dark:text-ink-muted leading-relaxed pl-6">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t-[1.5px] border-ink-faint dark:border-ink-faint pl-6">
                    <span className="text-[10px] text-ink dark:text-bg dark:text-blue-400 font-semibold flex items-center gap-1 group-hover:underline">
                      <span>{isAnnouncement ? 'Open Noticeboard' : 'View Details'}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </span>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="text-[10px] text-ink-muted hover:text-rose-500 transition-colors p-1"
                      title="Delete notification"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
