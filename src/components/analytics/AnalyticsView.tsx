import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Award,
  TrendingUp,
  BookOpen,
  PieChart
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const AnalyticsView: React.FC = () => {
  const { tasks, subjects, analytics } = useTasks();

  const total = analytics.totalTasks || 1;
  const completed = analytics.completedTasks;
  const overdue = analytics.overdueTasks;

  const urgentCount = tasks.filter(t => t.priority === 'urgent').length;
  const highCount = tasks.filter(t => t.priority === 'high').length;
  const mediumCount = tasks.filter(t => t.priority === 'medium').length;
  const lowCount = tasks.filter(t => t.priority === 'low').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
            Productivity & Academic Analytics
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Insights on your submission velocity, subject workloads, and deadline adherence.
        </p>
      </div>

      {/* Top 4 Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-display">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-[var(--text-main)]">
            {analytics.completionRate}%
          </p>
          <span className="text-[0.7rem] text-[var(--text-faint)]">
            {completed} of {analytics.totalTasks} tasks submitted
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-display">
            <span>On-Time Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {analytics.onTimeCompletionRate}%
          </p>
          <span className="text-[0.7rem] text-[var(--text-faint)]">
            Submitted before deadline
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-display">
            <span>Total Focus Time</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-purple-500">
            {Math.round(analytics.totalFocusMinutes / 60)}h {analytics.totalFocusMinutes % 60}m
          </p>
          <span className="text-[0.7rem] text-[var(--text-faint)]">
            Cumulative focused study sessions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-display">
            <span>Overdue Rate</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-rose-500">
            {Math.round((overdue / total) * 100)}%
          </p>
          <span className="text-[0.7rem] text-rose-500 font-semibold">
            {overdue} overdue items
          </span>
        </div>
      </div>

      {/* 2 Big Analytic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Workload Distribution */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Subject Workload Distribution</span>
            </h3>
            <span className="text-xs text-[var(--text-faint)] font-mono">{subjects.length} Subjects</span>
          </div>

          <div className="space-y-4">
            {subjects.map(subject => {
              const subTasks = tasks.filter(t => t.subjectId === subject.id);
              const subCompleted = subTasks.filter(t => t.status === 'completed').length;
              const subPct = subTasks.length > 0 ? Math.round((subCompleted / subTasks.length) * 100) : 0;

              return (
                <div key={subject.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                      <span className="font-display font-semibold text-[var(--text-main)] truncate">
                        {subject.name}
                      </span>
                    </div>
                    <span className="font-mono text-[var(--text-muted)]">
                      {subCompleted}/{subTasks.length} ({subPct}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${subPct}%`,
                        backgroundColor: subject.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Task Volume Grid */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-500" />
              <span>Priority & Task Volume</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block font-mono">
                🔥 Urgent Priority
              </span>
              <p className="font-mono text-3xl font-extrabold text-[var(--text-main)]">{urgentCount}</p>
              <span className="text-[0.65rem] text-[var(--text-muted)]">Immediate action required</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block font-mono">
                ⚡ High Priority
              </span>
              <p className="font-mono text-3xl font-extrabold text-[var(--text-main)]">{highCount}</p>
              <span className="text-[0.65rem] text-[var(--text-muted)]">Due within 3 days</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block font-mono">
                🔷 Medium Priority
              </span>
              <p className="font-mono text-3xl font-extrabold text-[var(--text-main)]">{mediumCount}</p>
              <span className="text-[0.65rem] text-[var(--text-muted)]">Standard assignments</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-xs font-bold text-[var(--text-muted)] block font-mono">
                ◽ Low Priority
              </span>
              <p className="font-mono text-3xl font-extrabold text-[var(--text-main)]">{lowCount}</p>
              <span className="text-[0.65rem] text-[var(--text-muted)]">Optional / preparatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
