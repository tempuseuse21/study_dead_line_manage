import React from 'react';
import { useTasks } from '../../context/TaskContext';
import {
  Bell,
  Clock,
  Zap,
  Pin,
  ChevronRight,
  Flame,
  CheckCircle2,
  BookOpen,
  Calendar
} from 'lucide-react';

interface RightPanelProps {
  onNavigate?: (view: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onNavigate }) => {
  const {
    announcements,
    notifications,
    tasks,
    exams,
    subjects,
    setSelectedTask,
    setIsNotificationDrawerOpen
  } = useTasks();

  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const todayStr = new Date().toISOString().split('T')[0];

  const urgentTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  const upcomingExams = exams
    .filter(e => e.examDate >= todayStr)
    .sort((a, b) => a.examDate.localeCompare(b.examDate))
    .slice(0, 2);

  return (
    <aside className="hidden xl:flex flex-col w-full max-w-[320px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 gap-5 h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto">
      {/* Focus Timer Quick Trigger Widget */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.65rem] font-bold font-mono uppercase tracking-wider text-indigo-200">
              Focus Booster
            </span>
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          </div>
          <h3 className="font-display font-bold text-base mb-1">Pomodoro Timer</h3>
          <p className="text-xs text-indigo-100 mb-3 opacity-90 leading-relaxed">
            Start a 25-min study sprint with zero distractions.
          </p>
          <button
            onClick={() => onNavigate?.('focus')}
            className="w-full py-2 px-3 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
          >
            <span>Launch Focus Mode</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Urgent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              Urgent Tasks
            </h4>
          </div>
          <button
            onClick={() => onNavigate?.('tasks')}
            className="text-[0.7rem] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            View Tasks
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {urgentTasks.length === 0 ? (
            <div className="p-3.5 text-center rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              🎉 No urgent deadlines pending!
            </div>
          ) : (
            urgentTasks.map(task => {
              const isOverdue = task.dueDate < todayStr;
              const sub = subjects.find(s => s.id === task.subjectId);
              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task);
                    if (onNavigate) onNavigate('tasks');
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all hover:scale-[1.01] shadow-2xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: sub?.color ? `${sub.color}15` : 'rgba(99,102,241,0.1)',
                        borderColor: sub?.color ? `${sub.color}40` : 'rgba(99,102,241,0.3)',
                        color: sub?.color || '#4f46e5'
                      }}
                    >
                      {sub?.code || 'General'}
                    </span>
                    <span className={`text-[0.65rem] font-mono font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      {isOverdue ? 'Overdue' : task.dueDate}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {task.title}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upcoming Exams Countdown */}
      {upcomingExams.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Upcoming Exams
              </h4>
            </div>
            <button
              onClick={() => onNavigate?.('exams')}
              className="text-[0.7rem] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              All Exams
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {upcomingExams.map(exam => {
              const sub = subjects.find(s => s.id === exam.subjectId);
              return (
                <div
                  key={exam.id}
                  onClick={() => onNavigate?.('exams')}
                  className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 hover:border-amber-400 cursor-pointer transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[0.65rem] font-bold font-mono text-amber-800 dark:text-amber-300">
                      {sub?.code || 'Exam'}
                    </span>
                    <span className="text-[0.65rem] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100">
                      {exam.examDate}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {exam.title}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[0.65rem] text-slate-600 dark:text-slate-400">
                    <span>Syllabus Covered</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{exam.syllabusCoverage || 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notice Board Widget */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              Notice Board
            </h4>
          </div>
          <button
            onClick={() => onNavigate?.('announcements')}
            className="text-[0.7rem] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Bulletin
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {announcements.slice(0, 2).map((notice, idx) => (
            <div
              key={notice.id}
              onClick={() => onNavigate?.('announcements')}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[0.6rem] font-bold font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  {idx === 0 ? '📌 Pinned' : 'CR Notice'}
                </span>
                <span className="text-[0.65rem] font-mono text-slate-500 dark:text-slate-400">
                  {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h5 className="font-display font-bold text-xs text-slate-900 dark:text-white mb-1 line-clamp-1">
                {notice.title}
              </h5>
              <p className="text-[0.7rem] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {notice.content}
              </p>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[0.55rem] font-bold">
                  CR
                </div>
                <span className="text-[0.65rem] font-medium text-slate-600 dark:text-slate-400">
                  {notice.authorName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Center Widget */}
      <div className="mt-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-display font-bold text-xs text-slate-900 dark:text-white">
              Alerts & Updates
            </span>
          </div>
          {unreadNotifs > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[0.6rem] font-mono font-bold">
              {unreadNotifs} Unread
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          {unreadNotifs > 0
            ? `You have ${unreadNotifs} pending study alerts.`
            : 'All caught up! No unread notifications.'}
        </p>
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="w-full py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-900 dark:text-slate-100 font-semibold text-xs transition-all cursor-pointer shadow-2xs"
        >
          Open Notification Center
        </button>
      </div>
    </aside>
  );
};
