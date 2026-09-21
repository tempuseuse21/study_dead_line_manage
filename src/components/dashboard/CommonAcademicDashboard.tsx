import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Plus,
  Target,
  BookOpen,
  ChevronRight,
  Filter,
  TrendingUp,
  Database,
  Binary,
  MessageSquare,
  Code,
  GitFork,
  CheckSquare
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { formatLiveCountdown, formatDateDisplay } from '../../lib/utils';
import { Task, Subject } from '../../types';
import { TaskCard } from '../tasks/TaskCard';

interface CommonAcademicDashboardProps {
  onNavigate: (view: string) => void;
}

export const CommonAcademicDashboard: React.FC<CommonAcademicDashboardProps> = ({ onNavigate }) => {
  const {
    tasks,
    subjects,
    analytics,
    setIsCreateTaskModalOpen,
    setSelectedTask,
    toggleTaskComplete
  } = useTasks();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [, setLiveSecondTicker] = useState<number>(0);

  // Live second ticking for Next Deadline countdown precision
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSecondTicker(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter tasks based on subject & type filters
  const sharedTasks = tasks.filter(t => {
    if (selectedSubjectFilter !== 'all' && t.subjectId !== selectedSubjectFilter) return false;
    if (selectedTypeFilter !== 'all') {
      const tags = t.tags || [];
      const hasType = tags.some(tag => tag.toLowerCase().includes(selectedTypeFilter.toLowerCase()));
      if (!hasType && !t.title.toLowerCase().includes(selectedTypeFilter.toLowerCase())) return false;
    }
    return true;
  });

  const now = Date.now();
  const todayDateObj = new Date();
  const todayStr = `${todayDateObj.getFullYear()}-${String(todayDateObj.getMonth() + 1).padStart(2, '0')}-${String(todayDateObj.getDate()).padStart(2, '0')}`;

  const parseTaskTime = (t: Task) => {
    const [h, m] = (t.dueTime || '23:59').split(':').map(Number);
    const [y, mon, d] = t.dueDate.split('-').map(Number);
    return new Date(y, mon - 1, d, h || 23, m || 59).getTime();
  };

  const overdueTasks = sharedTasks.filter(t => {
    if (t.status === 'completed') return false;
    return parseTaskTime(t) < now;
  });

  const activePendingTasks = sharedTasks
    .filter(t => t.status !== 'completed' && parseTaskTime(t) >= now)
    .sort((a, b) => parseTaskTime(a) - parseTaskTime(b));

  const nextDeadlineTask = activePendingTasks[0] || overdueTasks[0] || null;

  // Urgency Tiers
  const tierImmediate = activePendingTasks.filter(t => {
    const diffHours = (parseTaskTime(t) - now) / (1000 * 60 * 60);
    return diffHours <= 24 || t.dueDate === todayStr;
  });

  const tierHigh = activePendingTasks.filter(t => {
    const diffHours = (parseTaskTime(t) - now) / (1000 * 60 * 60);
    return diffHours > 24 && diffHours <= 72 && t.dueDate !== todayStr;
  });

  const tierMedium = activePendingTasks.filter(t => {
    const diffHours = (parseTaskTime(t) - now) / (1000 * 60 * 60);
    return diffHours > 72 && diffHours <= 168;
  });

  const tierLater = activePendingTasks.filter(t => {
    const diffHours = (parseTaskTime(t) - now) / (1000 * 60 * 60);
    return diffHours > 168;
  });

  const getAccurateCountdown = (task: Task | null) => {
    if (!task) return { days: 0, hours: 0, mins: 0, secs: 0, isOverdue: false, text: 'No upcoming deadlines' };
    const target = parseTaskTime(task);
    const diff = target - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, mins: 0, secs: 0, isOverdue: true, text: 'Deadline Passed' };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, mins, secs, isOverdue: false, text: `${days > 0 ? `${days}d ` : ''}${hours}h ${mins}m ${secs}s` };
  };

  const nextCountdown = getAccurateCountdown(nextDeadlineTask);
  const nextTaskSubject = nextDeadlineTask ? subjects.find(s => s.id === nextDeadlineTask.subjectId) : null;

  const typeFilterOptions = [
    { id: 'all', label: 'All Tasks' },
    { id: 'assignment', label: 'Assignments' },
    { id: 'lab', label: 'Labs & Practicals' },
    { id: 'quiz', label: 'Quizzes & Tests' },
    { id: 'presentation', label: 'Presentations' },
    { id: 'project', label: 'Projects' }
  ];

  const getSubjectIcon = (code: string) => {
    switch (code) {
      case 'IT615':
        return Database;
      case 'SC612':
        return Binary;
      case 'PC613':
        return MessageSquare;
      case 'IT603':
        return Code;
      case 'IT639':
        return GitFork;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Workspace Banner */}
      <div className="relative overflow-hidden rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-5 sm:p-7 shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink dark:bg-ink-faint text-bg dark:text-ink/10 dark:bg-ink-faint dark:bg-ink0/10 border-[1.5px] border-blue-600/20 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-400">
                <BookOpen className="h-3.5 w-3.5" />
                ACADEMIC DASHBOARD
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-faint dark:bg-ink px-3 py-1 text-xs font-semibold text-ink-muted dark:text-ink-muted">
                5 Core Subjects Curriculum
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-ink dark:text-white tracking-tight">
              Academic Workload & Deadlines
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted max-w-2xl leading-relaxed">
              Track assignments, practical lab tasks, and preparation timelines across your 5 curriculum subjects.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dashboard-new-task-btn"
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="flex items-center gap-2 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-none shadow-blue-500/20 active:scale-95 transition-all min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Task</span>
            </button>
            <button
              onClick={() => onNavigate('focus')}
              className="flex items-center gap-2 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-2.5 text-xs font-semibold text-ink-muted dark:text-bg shadow-none hover:bg-bg dark:hover:bg-ink-700 transition-all min-h-[44px]"
            >
              <Target className="h-4 w-4 text-amber-500" />
              <span>Focus Mode</span>
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-2 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-2.5 text-xs font-semibold text-ink-muted dark:text-bg shadow-none hover:bg-bg dark:hover:bg-ink-700 transition-all min-h-[44px]"
            >
              <Calendar className="h-4 w-4 text-ink dark:text-bg" />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* 2. Top Metric Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[var(--border-subtle)]">
          {/* Due Today */}
          <div
            onClick={() => onNavigate('tasks')}
            className="cursor-pointer rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Due Today</span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {tierImmediate.length}
            </p>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              {tierImmediate.length > 0 ? 'Urgent class submissions' : 'All clear for today'}
            </span>
          </div>

          {/* Active Deliverables */}
          <div
            onClick={() => onNavigate('tasks')}
            className="cursor-pointer rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 hover:border-indigo-500/40 transition-all"
          >
            <div className="flex items-center justify-between text-[var(--text-main)] mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Deliverables</span>
              <CheckSquare className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-[var(--text-main)]">
              {activePendingTasks.length}
            </p>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Pending assignments & labs
            </span>
          </div>

          {/* Overdue Submissions */}
          <div
            onClick={() => onNavigate('completed')}
            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
              overdueTasks.length > 0
                ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50'
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'
            }`}
          >
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Shifted to Completed</span>
              <AlertTriangle className={`h-4 w-4 ${overdueTasks.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
            </div>
            <p className={`text-2xl font-black ${overdueTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {overdueTasks.length}
            </p>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              {overdueTasks.length > 0 ? 'Past deadline tasks archived' : '0 overdue items 🎉'}
            </span>
          </div>

          {/* 5 Core Curriculum Subjects */}
          <div
            onClick={() => onNavigate('subjects')}
            className="cursor-pointer rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 hover:border-indigo-500/40 transition-all"
          >
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Curriculum</span>
              <BookOpen className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-[var(--text-main)]">
              {subjects.length} Subjects
            </p>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Core academic courses
            </span>
          </div>
        </div>
      </div>

      {/* 3. Next Deadline Spotlight Card */}
      {nextDeadlineTask && (
        <div className="rounded-3xl bg-ink text-white p-5 sm:p-7 shadow-xl relative overflow-hidden border-[1.5px] border-ink-faint">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-500/20 border-[1.5px] border-amber-500/40 px-3 py-0.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  NEXT UPCOMING DEADLINE
                </span>

                {nextTaskSubject && (
                  <span
                    className="rounded-full px-3 py-0.5 text-[11px] font-bold border"
                    style={{
                      backgroundColor: `${nextTaskSubject.color}20`,
                      color: '#93c5fd',
                      borderColor: `${nextTaskSubject.color}40`
                    }}
                  >
                    {nextTaskSubject.code} • {nextTaskSubject.name}
                  </span>
                )}

                <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                  Priority: {nextDeadlineTask.priority.toUpperCase()}
                </span>
              </div>

              <h2
                onClick={() => setSelectedTask(nextDeadlineTask)}
                className="text-xl sm:text-2xl font-extrabold text-white hover:text-blue-400 cursor-pointer transition-colors tracking-tight line-clamp-2"
              >
                {nextDeadlineTask.title}
              </h2>

              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-2">
                {nextDeadlineTask.description || 'Complete required deliverables and verify solutions before submission.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted pt-1">
                <div>
                  Due: <strong className="text-white">{formatDateDisplay(nextDeadlineTask.dueDate)} at {nextDeadlineTask.dueTime}</strong>
                </div>
              </div>
            </div>

            {/* Countdown & Action */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-end justify-between gap-4 p-4 rounded-none bg-ink/80 border-[1.5px] border-ink-faint lg:min-w-[260px]">
              <div className="text-center sm:text-right w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">
                  Time Remaining
                </span>

                {nextCountdown.isOverdue ? (
                  <div className="text-xl font-extrabold text-rose-400">
                    Deadline Passed
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-end gap-1.5 text-white">
                    {nextCountdown.days > 0 && (
                      <div className="flex flex-col items-center px-2 py-1 rounded-none bg-ink-700 min-w-[40px]">
                        <span className="text-base font-black">{nextCountdown.days}</span>
                        <span className="text-[8px] uppercase text-ink-muted font-bold">Days</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center px-2 py-1 rounded-none bg-ink-700 min-w-[40px]">
                      <span className="text-base font-black text-amber-400">{String(nextCountdown.hours).padStart(2, '0')}</span>
                      <span className="text-[8px] uppercase text-ink-muted font-bold">Hrs</span>
                    </div>
                    <span className="text-ink-muted font-bold">:</span>
                    <div className="flex flex-col items-center px-2 py-1 rounded-none bg-ink-700 min-w-[40px]">
                      <span className="text-base font-black text-amber-400">{String(nextCountdown.mins).padStart(2, '0')}</span>
                      <span className="text-[8px] uppercase text-ink-muted font-bold">Min</span>
                    </div>
                    <span className="text-ink-muted font-bold">:</span>
                    <div className="flex flex-col items-center px-2 py-1 rounded-none bg-ink-700 min-w-[40px]">
                      <span className="text-base font-black text-blue-400">{String(nextCountdown.secs).padStart(2, '0')}</span>
                      <span className="text-[8px] uppercase text-ink-muted font-bold">Sec</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 w-full pt-1">
                <button
                  onClick={() => setSelectedTask(nextDeadlineTask)}
                  className="flex-1 py-2 px-3 rounded-none bg-ink-700 hover:bg-ink-600 text-xs font-bold text-bg transition-colors text-center"
                >
                  Details
                </button>
                <button
                  disabled={nextDeadlineTask.status === 'completed'}
                  onClick={() => toggleTaskComplete(nextDeadlineTask.id)}
                  className={`flex-1 py-2 px-3 rounded-none text-xs font-bold text-center transition-all ${
                    nextDeadlineTask.status === 'completed'
                      ? 'bg-emerald-600 text-white cursor-default opacity-90'
                      : 'bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint text-white shadow-none shadow-blue-500/20 active:scale-95 cursor-pointer'
                  }`}
                >
                  {nextDeadlineTask.status === 'completed' ? 'Done ✓' : 'Mark Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Filter Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-none bg-bg dark:bg-ink border-[1.5px] border-ink-faint dark:border-ink-faint shadow-none">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {typeFilterOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedTypeFilter(opt.id)}
              className={`px-3 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTypeFilter === opt.id
                  ? 'bg-ink dark:bg-ink-faint text-bg dark:text-ink text-white shadow-none'
                  : 'bg-ink-faint dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-ink-muted" />
          <select
            value={selectedSubjectFilter}
            onChange={e => setSelectedSubjectFilter(e.target.value)}
            className="rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-1.5 text-xs font-semibold text-ink dark:text-bg focus:outline-hidden"
          >
            <option value="all">All 5 Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. 5 CURRICULUM SUBJECTS CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-ink-faint dark:bg-ink dark:bg-blue-950 text-ink dark:text-bg dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink dark:text-white tracking-tight">
                5 Curriculum Subjects
              </h2>
              <p className="text-xs text-ink-muted dark:text-ink-muted">
                Click any subject card to filter tasks
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs font-bold text-ink dark:text-bg dark:text-blue-400 hover:underline"
          >
            View Subject Details
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {subjects.map(sub => {
            const SubIcon = getSubjectIcon(sub.code);
            const subTasks = tasks.filter(t => t.subjectId === sub.id);
            const pendingSubTasks = subTasks.filter(t => t.status !== 'completed');
            const completedCount = subTasks.filter(t => t.status === 'completed').length;
            const isSelected = selectedSubjectFilter === sub.id;

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubjectFilter(isSelected ? 'all' : sub.id)}
                className={`cursor-pointer rounded-none border-[1.5px] p-4 transition-all shadow-none flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-ink-faint dark:bg-ink/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink hover:border-ink-faint dark:hover:border-ink-faint'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: sub.color }}
                    >
                      {sub.code}
                    </span>
                    <SubIcon className="h-4 w-4 text-ink-muted" />
                  </div>

                  <h3 className="text-xs font-bold text-ink dark:text-white line-clamp-2 mb-1">
                    {sub.name}
                  </h3>

                  <p className="text-[11px] text-ink-muted dark:text-ink-muted line-clamp-1 mb-3">
                    {sub.teacherName}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t-[1.5px] border-ink-faint dark:border-ink-faint">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-ink-muted dark:text-ink-muted">
                    <span>{pendingSubTasks.length} pending</span>
                    <span>{completedCount}/{subTasks.length} done</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-ink-faint dark:bg-ink overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: sub.color,
                        width: `${subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. DEADLINE RADAR (Grouped Urgency Tiers) */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-ink-faint dark:bg-ink dark:bg-blue-950 text-ink dark:text-bg dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink dark:text-white tracking-tight">
                Deadline Radar
              </h2>
              <p className="text-xs text-ink-muted dark:text-ink-muted">
                Academic tasks organized by upcoming due dates
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1 text-xs font-bold text-ink dark:text-bg dark:text-blue-400 hover:underline"
          >
            <span>All Tasks ({sharedTasks.length})</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Tier 1: Due Today / Urgent */}
        {tierImmediate.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-[1.5px] border-amber-200 dark:border-amber-900/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  🔴 Due Today / Next 24 Hours ({tierImmediate.length})
                </h3>
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Immediate Action</span>
            </div>

            <div className="space-y-3">
              {tierImmediate.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Tier 2: Due in 2-3 Days */}
        {tierHigh.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-[1.5px] border-ink-faint dark:border-ink-faint pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-ink-faint dark:bg-ink0" />
                <h3 className="text-xs font-black uppercase tracking-wider text-ink dark:text-bg dark:text-blue-400">
                  ⚡ Due in 2 to 3 Days ({tierHigh.length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {tierHigh.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Tier 3: Due Later This Week */}
        {tierMedium.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-[1.5px] border-ink-faint dark:border-ink-faint pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-ink-muted dark:text-ink-muted">
                  🔷 Due Later This Week ({tierMedium.length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {tierMedium.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Tier 4: Next Week & Beyond */}
        {tierLater.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-[1.5px] border-ink-faint dark:border-ink-faint pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-ink-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-ink-muted">
                  ◽ Upcoming — Next Week & Beyond ({tierLater.length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {tierLater.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* If no pending tasks at all */}
        {activePendingTasks.length === 0 && (
          <div className="p-8 rounded-3xl bg-bg dark:bg-ink/40 border-[1.5px] border-dashed border-ink-faint dark:border-ink-faint text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-ink dark:text-white">All Caught Up!</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              No pending assignments or tasks for the selected filters. Use "+ Add Task" to create a new task.
            </p>
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink px-4 py-2 text-xs font-semibold text-white shadow-none hover:bg-ink dark:hover:bg-ink-faint transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Task</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
