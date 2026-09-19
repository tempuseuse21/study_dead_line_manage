import React, { useState, useEffect } from 'react';
import {
  Bell,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  ExternalLink,
  ShieldCheck,
  Volume2,
  Calendar
} from 'lucide-react';
import {
  WebsiteToast,
  subscribeToWebsiteToasts,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission
} from '../../lib/webNotifications';
import { useTasks } from '../../context/TaskContext';

interface ActiveToast extends WebsiteToast {
  timerId?: any;
  progress: number;
}

interface NotificationToastContainerProps {
  onNavigate?: (view: string) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({ onNavigate }) => {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const { setSelectedTask, tasks, setIsNotificationDrawerOpen } = useTasks();
  const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>(() =>
    getBrowserNotificationPermission()
  );

  useEffect(() => {
    // Listen for incoming toasts
    const unsubscribe = subscribeToWebsiteToasts(newToast => {
      setToasts(prev => {
        // Keep at most 4 simultaneous toasts
        const next = [
          { ...newToast, progress: 100 },
          ...prev.filter(t => t.id !== newToast.id).slice(0, 3)
        ];
        return next;
      });
    });

    return () => unsubscribe();
  }, []);

  // Update permission status
  useEffect(() => {
    setPermStatus(getBrowserNotificationPermission());
  }, []);

  const handleDismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermStatus(res);
  };

  const handleToastClick = (toast: ActiveToast) => {
    handleDismiss(toast.id);
    if (toast.type === 'announcement') {
      if (onNavigate) onNavigate('announcements');
    } else if (toast.taskId) {
      const task = tasks.find(t => t.id === toast.taskId);
      if (task) {
        setSelectedTask(task);
      } else if (onNavigate) {
        onNavigate('tasks');
      }
    } else if (toast.type === 'task') {
      if (onNavigate) onNavigate('tasks');
    }
  };

  // Auto-dismiss countdown
  useEffect(() => {
    if (toasts.length === 0) return;

    const interval = setInterval(() => {
      setToasts(prev =>
        prev
          .map(t => ({ ...t, progress: Math.max(0, t.progress - 2) }))
          .filter(t => t.progress > 0)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [toasts.length]);

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {/* Optional Quick Browser Permission Banner if not enabled */}
      {permStatus === 'default' && toasts.length > 0 && (
        <div className="pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-none bg-indigo-900 text-white shadow-xl border-[1.5px] border-indigo-700/50 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 text-xs">
            <Bell className="h-4 w-4 text-indigo-300 shrink-0 animate-bounce" />
            <span>Enable website desktop alerts for assignments & CR notices?</span>
          </div>
          <button
            onClick={handleRequestPermission}
            className="px-3 py-1 bg-bg text-indigo-900 font-bold rounded-none text-xs hover:bg-indigo-50 transition-colors shrink-0"
          >
            Allow
          </button>
        </div>
      )}

      {/* Stacked Toasts */}
      {toasts.map(toast => {
        const isAnnouncement = toast.type === 'announcement';
        const isTask = toast.type === 'task';
        const isUrgent = toast.priority === 'urgent' || toast.priority === 'high';

        return (
          <div
            key={toast.id}
            id={`website-notification-${toast.id}`}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border-[1.5px] shadow-2xl transition-all transform animate-in slide-in-from-right duration-300 ${
              isAnnouncement
                ? 'bg-amber-50 dark:bg-slate-900 border-amber-400 dark:border-amber-600 text-slate-900 dark:text-white shadow-amber-500/10'
                : isUrgent
                ? 'bg-rose-50 dark:bg-slate-900 border-rose-400 dark:border-rose-600 text-slate-900 dark:text-white shadow-rose-500/10'
                : 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-600 text-slate-900 dark:text-white shadow-indigo-500/10'
            }`}
          >
            <div className="p-4">
              {/* Header Badge & Title */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {isAnnouncement ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                      <Megaphone className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      CR Class Notice
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border"
                      style={{
                        backgroundColor: toast.subjectColor ? `${toast.subjectColor}25` : 'rgba(99,102,241,0.15)',
                        borderColor: toast.subjectColor ? `${toast.subjectColor}60` : 'rgba(99,102,241,0.4)',
                        color: toast.subjectColor || '#4f46e5'
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {toast.subjectCode || 'Task Post'}
                    </span>
                  )}

                  {toast.authorName && (
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      {toast.authorName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                    <Volume2 className="h-3 w-3 animate-pulse" />
                    Live
                  </span>
                  <button
                    onClick={() => handleDismiss(toast.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                {toast.title}
              </h4>

              {/* Message Body */}
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2.5">
                {toast.message}
              </p>

              {/* Due Date & Action Button Footer */}
              <div className="flex items-center justify-between pt-2 border-t-[1.5px] border-ink-faint/60 dark:border-ink-faint/80 gap-2">
                {toast.dueDate ? (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-ink-muted dark:text-ink-muted">
                    <Calendar className="h-3 w-3 text-ink-muted" />
                    <span>Due: {toast.dueDate}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-ink-muted font-medium">Broadcasted to Class Feed</span>
                )}

                <button
                  onClick={() => handleToastClick(toast)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-none text-xs font-bold transition-all shadow-none ${
                    isAnnouncement
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint text-white'
                  }`}
                >
                  <span>{isAnnouncement ? 'View Notice' : 'View Task'}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div className="h-1 w-full bg-ink-faint/50 dark:bg-ink">
              <div
                className={`h-full transition-all duration-100 ${
                  isAnnouncement ? 'bg-amber-500' : isUrgent ? 'bg-rose-500' : 'bg-ink-faint dark:bg-ink0'
                }`}
                style={{ width: `${toast.progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
