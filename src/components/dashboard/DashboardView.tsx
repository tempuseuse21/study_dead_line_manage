import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  BookOpen,
  Plus,
  ArrowRight,
  Target,
  Calendar,
  Sparkles,
  Zap,
  Play,
  TrendingUp,
  Award
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { getRecommendedTasks } from '../../services/priorityEngine';
import { formatDateDisplay, formatDuration, getTodayStr, daysBetween } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface DashboardViewProps {
  onNavigate?: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    tasks,
    subjects,
    exams,
    analytics,
    focusSessions,
    setIsCreateTaskModalOpen,
    setSelectedTask,
    ticker
  } = useTasks();

  const todayStr = getTodayStr();

  // Today's stats
  const todayTasks = tasks.filter(t => t.dueDate === todayStr && t.status !== 'completed' && t.status !== 'cancelled');
  const completedToday = tasks.filter(t => t.completedAt?.startsWith(todayStr));
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate < todayStr);

  // Upcoming exams (next 30 days)
  const upcomingExams = useMemo(() => {
    return exams
      .filter(e => {
        const daysLeft = daysBetween(todayStr, e.examDate);
        return daysLeft >= 0 && daysLeft <= 30;
      })
      .sort((a, b) => a.examDate.localeCompare(b.examDate))
      .slice(0, 3);
  }, [exams, todayStr]);

  // Recommended priority tasks
  const recommended = useMemo(() => getRecommendedTasks(tasks, exams, 4), [tasks, exams, ticker]);

  // Focus time today
  const focusToday = focusSessions
    .filter(s => s.startedAt?.startsWith(todayStr))
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Welcome Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl gradient-brand-bg text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/15">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-purple-400/20 blur-xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Student Overview & Academic OS</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white">
              {greeting}, Student 👋
            </h1>
            <p className="text-sm text-indigo-100 opacity-90 leading-relaxed">
              {todayTasks.length > 0
                ? `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} scheduled for today. ${overdueTasks.length > 0 ? `${overdueTasks.length} tasks require immediate action!` : 'Keep up the momentum!'}`
                : overdueTasks.length > 0
                ? `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} need your attention.`
                : 'All clear for today! You are ahead of schedule.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Task</span>
            </button>
            <button
              onClick={() => onNavigate?.('focus')}
              className="px-5 py-3 rounded-2xl bg-indigo-900/40 hover:bg-indigo-900/60 border border-white/20 font-bold text-xs sm:text-sm text-white flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Start Focus Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Due Today',
            value: todayTasks.length.toString().padStart(2, '0'),
            icon: Calendar,
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            sub: todayTasks.length > 0 ? 'Pending tasks' : 'All clear!'
          },
          {
            label: 'Completed Today',
            value: completedToday.length.toString().padStart(2, '0'),
            icon: CheckCircle2,
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            sub: `${analytics.completionRate}% overall rate`
          },
          {
            label: 'Overdue Tasks',
            value: overdueTasks.length.toString().padStart(2, '0'),
            icon: AlertTriangle,
            color: overdueTasks.length > 0 ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
            sub: overdueTasks.length > 0 ? 'Needs attention' : 'On schedule'
          },
          {
            label: 'Today Focus',
            value: focusToday >= 60 ? `${Math.floor(focusToday / 60)}h ${focusToday % 60}m` : `${focusToday}m`,
            icon: Flame,
            color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
            sub: 'Total focused time'
          }
        ].map(stat => {
          const IconComp = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs hover:border-indigo-500/30 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[var(--text-muted)] font-display">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <IconComp className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[var(--text-main)] mb-1">
                {stat.value}
              </div>
              <div className="text-[0.7rem] text-[var(--text-faint)] font-medium">
                {stat.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recommended Tasks & Upcoming Exams Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Recommended Priority Queue (2 Cols) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
                  Smart Priority Queue
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                AI & rule-engine recommended tasks to tackle next
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('tasks')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recommended.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
              <p className="font-semibold text-sm text-[var(--text-main)]">No pending tasks!</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">You've finished everything on your priority list.</p>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors"
              >
                + Add Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recommended.map((task, idx) => {
                const subject = subjects.find(s => s.id === task.subjectId);
                const { priorityResult } = task;
                const isCritical = priorityResult.score >= 80;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      'p-4 rounded-2xl bg-[var(--bg-card)] border transition-all cursor-pointer hover:shadow-md hover:scale-[1.005]',
                      isCritical
                        ? 'border-rose-500/40 dark:border-rose-500/30 bg-gradient-to-r from-rose-500/5 to-transparent'
                        : 'border-[var(--border-subtle)] hover:border-indigo-500/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {subject && (
                            <span
                              className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: `${subject.color}20`,
                                color: subject.color
                              }}
                            >
                              {subject.code}
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md',
                              priorityResult.urgencyLabel === 'Critical' || priorityResult.urgencyLabel === 'Very High'
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                : priorityResult.urgencyLabel === 'High'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            )}
                          >
                            Score: {priorityResult.score} ({priorityResult.urgencyLabel})
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-sm text-[var(--text-main)] truncate">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>Due {formatDateDisplay(task.dueDate, task.dueTime)}</span>
                          {task.estimatedDurationMinutes && (
                            <span>• {task.estimatedDurationMinutes} mins est.</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                          }}
                          className="p-2 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-indigo-600 hover:text-white text-[var(--text-muted)] transition-colors"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar Widget (1 Col) */}
        <div className="space-y-6">
          {/* Upcoming Exams Card */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-display font-bold text-sm text-[var(--text-main)]">
                  Upcoming Exams
                </h3>
              </div>
              <button
                onClick={() => onNavigate?.('exams')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage
              </button>
            </div>

            {upcomingExams.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">
                No exams scheduled in the next 30 days.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map(exam => {
                  const subject = subjects.find(s => s.id === exam.subjectId);
                  const daysLeft = daysBetween(todayStr, exam.examDate);
                  return (
                    <div
                      key={exam.id}
                      className="p-3.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          {subject?.code || 'Exam'}
                        </span>
                        <span className="text-xs font-mono font-bold text-rose-500">
                          {daysLeft === 0 ? 'TODAY!' : `${daysLeft} days left`}
                        </span>
                      </div>
                      <h4 className="font-display font-semibold text-xs text-[var(--text-main)] truncate">
                        {exam.title}
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[0.65rem] text-[var(--text-muted)]">
                          <span>Preparation</span>
                          <span>{exam.preparationPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                            style={{ width: `${exam.preparationPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Academic Progress Summary */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display text-[var(--text-main)] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Semester Progress
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {analytics.completionRate}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${Math.max(5, analytics.completionRate)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[0.7rem] text-[var(--text-muted)] pt-1">
              <span>{analytics.completedTasks} Tasks Completed</span>
              <span>{analytics.totalTasks} Total Tasks</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Subjects Overview Grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
              Enrolled Subjects
            </h2>
          </div>
          <button
            onClick={() => onNavigate?.('subjects')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Manage Subjects
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {subjects.map(subject => {
            const subTasks = tasks.filter(t => t.subjectId === subject.id);
            const done = subTasks.filter(t => t.status === 'completed').length;
            const pct = subTasks.length > 0 ? Math.round((done / subTasks.length) * 100) : 0;
            return (
              <button
                key={subject.id}
                onClick={() => onNavigate?.('subjects')}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-left hover:border-indigo-500/40 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[0.65rem] font-mono font-bold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${subject.color}20`,
                      color: subject.color
                    }}
                  >
                    {subject.code}
                  </span>
                  <span className="text-[0.65rem] font-mono text-[var(--text-faint)]">
                    {subject.credits} Credits
                  </span>
                </div>
                <h3 className="font-display font-semibold text-xs text-[var(--text-main)] line-clamp-2 mb-3 min-h-[32px]">
                  {subject.name}
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-[0.65rem] text-[var(--text-muted)]">
                    <span>{done}/{subTasks.length} tasks</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
