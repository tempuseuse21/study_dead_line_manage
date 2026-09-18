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
  const pending = analytics.pendingTasks;

  const urgentCount = tasks.filter(t => t.priority === 'urgent').length;
  const highCount = tasks.filter(t => t.priority === 'high').length;
  const mediumCount = tasks.filter(t => t.priority === 'medium').length;
  const lowCount = tasks.filter(t => t.priority === 'low').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          <span>Academic Productivity & Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted mt-1">
          Insights on your submission velocity, subject workloads, and deadline adherence.
        </p>
      </div>

      {/* Top 4 Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-5 shadow-none">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold">Completion Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-ink dark:text-white">
            {analytics.completionRate}%
          </p>
          <span className="text-[11px] text-ink-muted dark:text-ink-muted">
            {completed} of {analytics.totalTasks} tasks submitted
          </span>
        </div>

        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-5 shadow-none">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold">On-Time Submission</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {analytics.onTimeSubmissionRate}%
          </p>
          <span className="text-[11px] text-ink-muted dark:text-ink-muted">
            Submitted before cutoff
          </span>
        </div>

        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-5 shadow-none">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold">Study Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-500">
            {analytics.currentStreak} Days
          </p>
          <span className="text-[11px] text-ink-muted dark:text-ink-muted">
            Personal Best: {analytics.bestStreak} days
          </span>
        </div>

        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-5 shadow-none">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold">Overdue Rate</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-500">
            {Math.round((overdue / total) * 100)}%
          </p>
          <span className="text-[11px] text-rose-500 font-medium">
            {overdue} overdue items
          </span>
        </div>
      </div>

      {/* 2 Big Analytical Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Workload Distribution */}
        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink dark:text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>Subject Workload Distribution</span>
            </h3>
            <span className="text-xs text-ink-muted">{subjects.length} active subjects</span>
          </div>

          <div className="space-y-4">
            {subjects.map(subject => {
              const subTasks = tasks.filter(t => t.subjectId === subject.id);
              const subCompleted = subTasks.filter(t => t.status === 'completed').length;
              const subPct = subTasks.length > 0 ? Math.round((subCompleted / subTasks.length) * 100) : 0;

              return (
                <div key={subject.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-bold text-ink dark:text-bg truncate">
                        {subject.name}
                      </span>
                    </div>
                    <span className="text-ink-muted dark:text-ink-muted font-medium flex-shrink-0">
                      {subCompleted}/{subTasks.length} ({subPct}%)
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-ink-faint dark:bg-ink overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
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

        {/* Priority & Status Breakdown */}
        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink dark:text-white flex items-center gap-2">
              <PieChart className="h-4 w-4 text-cyan-500" />
              <span>Priority & Task Volume</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-none bg-rose-50/60 dark:bg-rose-950/30 border-[1.5px] border-rose-200/60 dark:border-rose-900/40">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mb-1">
                🔥 Urgent Priority
              </span>
              <p className="text-2xl font-black text-ink dark:text-white">{urgentCount}</p>
              <span className="text-[10px] text-ink-muted">Immediate action required</span>
            </div>

            <div className="p-4 rounded-none bg-amber-50/60 dark:bg-amber-950/30 border-[1.5px] border-amber-200/60 dark:border-amber-900/40">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-1">
                ⚡ High Priority
              </span>
              <p className="text-2xl font-black text-ink dark:text-white">{highCount}</p>
              <span className="text-[10px] text-ink-muted">Due within upcoming days</span>
            </div>

            <div className="p-4 rounded-none bg-ink-faint dark:bg-ink/60 dark:bg-blue-950/30 border-[1.5px] border-ink-faint dark:border-ink-faint/60 dark:border-blue-900/40">
              <span className="text-xs font-bold text-ink dark:text-bg dark:text-blue-400 block mb-1">
                🔷 Medium Priority
              </span>
              <p className="text-2xl font-black text-ink dark:text-white">{mediumCount}</p>
              <span className="text-[10px] text-ink-muted">Standard assignments</span>
            </div>

            <div className="p-4 rounded-none bg-bg dark:bg-ink/50 border-[1.5px] border-ink-faint dark:border-ink-faint">
              <span className="text-xs font-bold text-ink-muted dark:text-ink-muted block mb-1">
                ◽ Low Priority
              </span>
              <p className="text-2xl font-black text-ink dark:text-white">{lowCount}</p>
              <span className="text-[10px] text-ink-muted">Optional / preparatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
