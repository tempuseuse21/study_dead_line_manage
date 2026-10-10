import React, { useState, useMemo } from 'react';
import {
  Plus,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  User,
  ShieldCheck,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Check,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Task, Priority, DayOfWeek, TimetableSlot } from '../../types';
import { TaskCard } from '../tasks/TaskCard';
import { formatDateDisplay } from '../../lib/utils';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DashboardView: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const {
    tasks,
    subjects,
    timetableSlots,
    setIsCreateTaskModalOpen,
    setSelectedTask,
    toggleTaskComplete,
    deleteTask,
    ticker
  } = useTasks();

  const getTodayDayName = (): DayOfWeek => {
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[new Date().getDay()];
  };

  const todayName = getTodayDayName();
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<DayOfWeek>(todayName);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTabSection, setActiveTabSection] = useState<'all' | 'due_soon' | 'overdue' | 'upcoming' | 'completed'>('all');

  const now = new Date();
  const nowMs = now.getTime();

  // Helper to calculate exact deadline timestamp
  const getDeadlineMs = (task: Task): number => {
    try {
      const [year, month, day] = task.dueDate.split('-').map(Number);
      const [hour, min] = (task.dueTime || '23:59').split(':').map(Number);
      return new Date(year, month - 1, day, hour, min).getTime();
    } catch {
      return nowMs;
    }
  };

  // Filter and sort tasks
  const processedTasks = useMemo(() => {
    let list = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.createdByName?.toLowerCase().includes(q) ||
          t.createdById?.toLowerCase().includes(q)
      );
    }

    // Subject filter
    if (selectedSubjectId !== 'all') {
      list = list.filter(t => t.subjectId === selectedSubjectId);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'deadline') {
        const dA = getDeadlineMs(a);
        const dB = getDeadlineMs(b);
        return sortOrder === 'asc' ? dA - dB : dB - dA;
      } else if (sortBy === 'priority') {
        const pMap: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        const pA = pMap[a.priority] || 1;
        const pB = pMap[b.priority] || 1;
        return sortOrder === 'asc' ? pB - pA : pA - pB;
      } else {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }, [tasks, searchQuery, selectedSubjectId, sortBy, sortOrder, ticker]);

  // Derive Four Core Deadline Sections automatically
  const dueSoonTasks = useMemo(() => {
    return processedTasks.filter(t => {
      if (t.status === 'completed') return false;
      const dMs = getDeadlineMs(t);
      const diffHours = (dMs - nowMs) / (1000 * 3600);
      return diffHours >= 0 && diffHours <= 48;
    });
  }, [processedTasks, nowMs]);

  const overdueTasks = useMemo(() => {
    return processedTasks.filter(t => {
      if (t.status === 'completed') return false;
      const dMs = getDeadlineMs(t);
      return dMs < nowMs;
    });
  }, [processedTasks, nowMs]);

  const upcomingTasks = useMemo(() => {
    return processedTasks.filter(t => {
      if (t.status === 'completed') return false;
      const dMs = getDeadlineMs(t);
      const diffHours = (dMs - nowMs) / (1000 * 3600);
      return diffHours > 48;
    });
  }, [processedTasks, nowMs]);

  const completedTasks = useMemo(() => {
    return processedTasks.filter(t => t.status === 'completed');
  }, [processedTasks]);

  const activeCount = tasks.filter(t => t.status !== 'completed').length;

  // Selected Day Lecture Slots
  const selectedDaySlots = useMemo(() => {
    return timetableSlots
      .filter(s => s.day === selectedTimetableDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timetableSlots, selectedTimetableDay]);

  const isSlotLiveNow = (slot: TimetableSlot) => {
    if (slot.day !== todayName) return false;
    const n = new Date();
    const curM = n.getHours() * 60 + n.getMinutes();
    const [sH, sM] = (slot.startTime || '00:00').split(':').map(Number);
    const [eH, eM] = (slot.endTime || '23:59').split(':').map(Number);
    return curM >= (sH * 60 + sM) && curM <= (eH * 60 + eM);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl gradient-brand-bg text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/15">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-purple-400/20 blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Dhirubhai Ambani University • MSc IT Batch Portal</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-white">
              Welcome, {user?.fullName || 'Student'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 opacity-90 leading-relaxed font-mono">
              Roll No: <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold">{user?.studentId || '24MSCIT001'}</span> • All 125 batch members share live updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>+ Add Academic Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Compact 4 Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active */}
        <div
          onClick={() => setActiveTabSection('all')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTabSection === 'all'
              ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20'
              : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span className="font-bold">Total Active</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {activeCount}
          </p>
          <span className="text-[0.65rem] text-[var(--text-faint)]">Batch active assignments</span>
        </div>

        {/* Due Soon */}
        <div
          onClick={() => setActiveTabSection('due_soon')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTabSection === 'due_soon'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span className="font-bold">Due Soon (&le;48h)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {dueSoonTasks.length}
          </p>
          <span className="text-[0.65rem] text-[var(--text-faint)]">High urgency deadlines</span>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setActiveTabSection('overdue')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTabSection === 'overdue'
              ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span className="font-bold">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {overdueTasks.length}
          </p>
          <span className="text-[0.65rem] text-[var(--text-faint)]">Passed submission date</span>
        </div>

        {/* Completed */}
        <div
          onClick={() => setActiveTabSection('completed')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTabSection === 'completed'
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span className="font-bold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {completedTasks.length}
          </p>
          <span className="text-[0.65rem] text-[var(--text-faint)]">Submitted batch tasks</span>
        </div>
      </div>

      {/* ── Today's / Particular Day Lecture Timetable Card ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-base sm:text-lg text-[var(--text-main)]">
                  Class Schedule & Lectures
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold border border-indigo-500/20">
                  {selectedDaySlots.length} {selectedDaySlots.length === 1 ? 'Class' : 'Classes'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Timetable for {selectedTimetableDay} {selectedTimetableDay === todayName && '(Today)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onNavigate && (
              <button
                onClick={() => onNavigate('timetable')}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {DAYS.map(day => {
            const isToday = day === todayName;
            const isSelected = day === selectedTimetableDay;
            const count = timetableSlots.filter(s => s.day === day).length;
            return (
              <button
                key={day}
                onClick={() => setSelectedTimetableDay(day)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                    Today
                  </span>
                )}
                {count > 0 && <span className="font-mono text-[10px] opacity-75">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Lecture Slot Cards Grid */}
        {selectedDaySlots.length === 0 ? (
          <div className="p-6 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] text-xs text-[var(--text-muted)]">
            <Clock className="w-6 h-6 mx-auto mb-1.5 text-[var(--text-faint)]" />
            No lectures scheduled for {selectedTimetableDay}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDaySlots.map(slot => {
              const isLive = isSlotLiveNow(slot);
              const subject = subjects.find(s => s.id === slot.subjectId || s.name.toLowerCase() === slot.subjectName.toLowerCase());
              const prof = slot.professor || subject?.professor || subject?.teacherName;

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isLive
                      ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] hover:border-indigo-500/30'
                  }`}
                >
                  {isLive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black uppercase animate-pulse shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      Live Class Now
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: slot.color ? `${slot.color}15` : 'rgba(99,102,241,0.1)',
                          color: slot.color || '#4f46e5',
                          borderColor: slot.color ? `${slot.color}30` : 'rgba(99,102,241,0.3)'
                        }}
                      >
                        {slot.subjectCode || 'CLASS'}
                      </span>
                      <span className="text-[0.65rem] font-bold uppercase font-mono px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                        {slot.type}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--text-main)] leading-snug mb-2 pr-12">
                      {slot.subjectName}
                    </h3>

                    <div className="space-y-1 text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot.startTime} – {slot.endTime}</span>
                      </div>

                      {slot.room && (
                        <div className="flex items-center gap-1.5 text-[0.7rem]">
                          <MapPin className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                          <span>{slot.room}</span>
                        </div>
                      )}

                      {prof && (
                        <div className="flex items-center gap-1.5 text-[0.7rem] font-medium text-[var(--text-main)]">
                          <User className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                          <span>{prof}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Search & Filter Control Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-faint)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, description, creator roll number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] focus:outline-none"
          >
            <option value="all">All Subjects ({subjects.length})</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
            ))}
          </select>

          {/* Sort Option */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] focus:outline-none"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
            <option value="created">Sort: Recently Added</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs cursor-pointer"
            title="Toggle Sort Order"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── FOUR AUTOMATIC DEADLINE SECTIONS ── */}
      <div className="space-y-8">
        {/* SECTION 1: DUE SOON (Within 48 hours) */}
        {(activeTabSection === 'all' || activeTabSection === 'due_soon') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
                  ⚡ Due Soon (Next 48 Hours)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
                  {dueSoonTasks.length}
                </span>
              </div>
            </div>

            {dueSoonTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
                No tasks due in the next 48 hours.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dueSoonTasks.map(t => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: OVERDUE (Past Deadline) */}
        {(activeTabSection === 'all' || activeTabSection === 'overdue') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h2 className="font-display font-bold text-lg text-rose-600 dark:text-rose-400">
                  🔴 Overdue Submissions
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold border border-rose-500/20">
                  {overdueTasks.length}
                </span>
              </div>
            </div>

            {overdueTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
                Great job! No overdue tasks pending.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overdueTasks.map(t => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: UPCOMING (More than 48 hours away) */}
        {(activeTabSection === 'all' || activeTabSection === 'upcoming') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
                  📅 Upcoming Deadlines (&gt;48 Hours Away)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold border border-indigo-500/20">
                  {upcomingTasks.length}
                </span>
              </div>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
                No upcoming deadlines beyond 48 hours.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingTasks.map(t => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: COMPLETED TASKS */}
        {(activeTabSection === 'all' || activeTabSection === 'completed') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
                  ✅ Completed Tasks
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                  {completedTasks.length}
                </span>
              </div>
            </div>

            {completedTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
                No completed tasks recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-80">
                {completedTasks.map(t => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
