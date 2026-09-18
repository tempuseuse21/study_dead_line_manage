import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { calculateDeadlineUrgency, formatLiveCountdown } from '../../lib/utils';
import { TaskCard } from '../tasks/TaskCard';

export const OverdueView: React.FC = () => {
  const { tasks, updateTask, setSelectedTask } = useTasks();

  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    const urgency = calculateDeadlineUrgency(t.dueDate, t.dueTime);
    return urgency === 'overdue' || t.status === 'overdue';
  });

  // Quick deadline extension helper
  const extendDeadline = async (taskId: string, daysToAdd: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const current = new Date(task.dueDate);
    current.setDate(current.getDate() + daysToAdd);
    const newDueDate = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

    await updateTask(taskId, {
      dueDate: newDueDate,
      status: 'in_progress'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Alert Header */}
      <div className="rounded-3xl border-[1.5px] border-rose-200 dark:border-rose-900/60 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-rose-500 text-white shadow-none shadow-rose-500/30 flex-shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">
              <span>High-Visibility Triage</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tracking-tight">
              Overdue Tasks & Submissions
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-ink-muted dark:text-ink-muted max-w-2xl leading-relaxed">
              These assignments have passed their target cutoff date. Triage them immediately by submitting your work, updating progress, or rescheduling with teacher approval.
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Items List with Quick Reschedule Actions */}
      <div className="space-y-4">
        {overdueTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border-[1.5px] border-dashed border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink">
            <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-ink dark:text-white">Zero Overdue Assignments! 🎉</h3>
            <p className="text-xs text-ink-muted dark:text-ink-muted mt-1">
              You are completely on top of all your academic work. Keep up the high standard!
            </p>
          </div>
        ) : (
          overdueTasks.map(task => {
            const countdown = formatLiveCountdown(task.dueDate, task.dueTime, false);
            return (
              <div
                key={task.id}
                className="rounded-3xl border-[1.5px] border-rose-200 dark:border-rose-900/60 bg-bg dark:bg-ink p-5 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0" onClick={() => setSelectedTask(task)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-none bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-bold px-2.5 py-1 border-[1.5px] border-rose-200 dark:border-rose-800">
                      {countdown.text}
                    </span>
                    <span className="text-xs text-ink-muted font-medium">Was due {task.dueDate} at {task.dueTime || '23:59'}</span>
                  </div>

                  <h3 className="text-base font-bold text-ink dark:text-white hover:text-indigo-600 cursor-pointer">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-ink-muted dark:text-ink-muted mt-1 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Quick Triage Buttons */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateTask(task.id, { status: 'completed', progress: 100, completedAt: new Date().toISOString() })}
                    className="flex items-center gap-1.5 rounded-none bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-none hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submit & Complete</span>
                  </button>

                  <div className="flex items-center gap-1 bg-ink-faint dark:bg-ink p-1 rounded-none">
                    <span className="text-[10px] font-semibold text-ink-muted px-1.5">Extend:</span>
                    <button
                      onClick={() => extendDeadline(task.id, 1)}
                      className="px-2 py-1 rounded-none bg-bg dark:bg-ink-700 text-xs font-medium text-ink-muted dark:text-bg hover:bg-bg shadow-2xs"
                    >
                      +1 Day
                    </button>
                    <button
                      onClick={() => extendDeadline(task.id, 3)}
                      className="px-2 py-1 rounded-none bg-bg dark:bg-ink-700 text-xs font-medium text-ink-muted dark:text-bg hover:bg-bg shadow-2xs"
                    >
                      +3 Days
                    </button>
                    <button
                      onClick={() => extendDeadline(task.id, 7)}
                      className="px-2 py-1 rounded-none bg-bg dark:bg-ink-700 text-xs font-medium text-ink-muted dark:text-bg hover:bg-bg shadow-2xs"
                    >
                      +1 Week
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
