import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  Play,
  Clock,
  MapPin,
  User,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { getRecommendedTasks } from '../../services/priorityEngine';
import { formatDateDisplay } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { DayOfWeek, TimetableSlot } from '../../types';

interface DashboardViewProps {
  onNavigate?: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    tasks,
    subjects,
    exams,
    timetableSlots,
    setIsCreateTaskModalOpen,
    setSelectedTask,
    ticker
  } = useTasks();

  // Recommended priority tasks
  const recommended = useMemo(() => getRecommendedTasks(tasks, exams, 4), [tasks, exams, ticker]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Get current day of week and filter today's timetable
  const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[now.getDay()];
  const formattedTodayDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'long' });

  const todaySlots = useMemo(() => {
    return timetableSlots
      .filter(slot => slot.day === todayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timetableSlots, todayName]);

  const getTypeBadge = (t: TimetableSlot['type']) => {
    switch (t) {
      case 'lab':
        return { label: 'LAB', bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
      case 'tutorial':
        return { label: 'TUTORIAL', bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'seminar':
        return { label: 'SEMINAR', bg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' };
      default:
        return { label: 'LECTURE', bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' };
    }
  };

  const isSlotOngoing = (startTime: string, endTime: string) => {
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    return currentMins >= startMins && currentMins < endMins;
  };

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
              <span>Academic OS & Study Management Portal</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white">
              {greeting} 👋
            </h1>
            <p className="text-sm text-indigo-100 opacity-90 leading-relaxed">
              Manage academic deadlines, exam schedules, and class notices in one central platform.
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
          </div>
        </div>
      </div>

      {/* ── Today's Lecture Timetable ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
                Today's Lecture Timetable
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold border border-indigo-500/20">
                {formattedTodayDate}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Your scheduled lectures, lab sessions, and tutorials for today
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('timetable')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            Manage Timetable <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaySlots.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-[var(--text-faint)]" />
            <p className="font-semibold text-sm text-[var(--text-main)]">No classes scheduled for today!</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Enjoy your day or add lecture slots to your weekly timetable.</p>
            <button
              onClick={() => onNavigate?.('timetable')}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Open Timetable
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaySlots.map((slot) => {
              const badge = getTypeBadge(slot.type);
              const live = isSlotOngoing(slot.startTime, slot.endTime);

              return (
                <div
                  key={slot.id}
                  className={cn(
                    'p-4 rounded-2xl bg-[var(--bg-card)] border transition-all flex flex-col justify-between relative overflow-hidden',
                    live
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                      : 'border-[var(--border-subtle)] hover:border-indigo-500/40'
                  )}
                >
                  {live && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-0.5 rounded-bl-xl tracking-wider uppercase flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" /> Live Now
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 pr-12">
                      <span
                        className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: slot.color ? `${slot.color}15` : 'rgba(99,102,241,0.1)',
                          color: slot.color || '#4f46e5',
                          borderColor: slot.color ? `${slot.color}30` : 'rgba(99,102,241,0.3)'
                        }}
                      >
                        {slot.subjectCode || 'CLASS'}
                      </span>

                      <span className={cn('text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md border', badge.bg)}>
                        {badge.label}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-[var(--text-main)] mb-1">
                      {slot.subjectName}
                    </h3>

                    <div className="space-y-1.5 text-xs text-[var(--text-muted)] mt-2">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot.startTime} – {slot.endTime}</span>
                      </div>

                      {slot.room && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                          <span>{slot.room}</span>
                        </div>
                      )}

                      {slot.professor && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                          <span>{slot.professor}</span>
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

      {/* ── Recommended Priority Queue ── */}
      <div className="space-y-4">
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
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
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
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              + Add Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommended.map((task) => {
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
                        className="p-2 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-indigo-600 hover:text-white text-[var(--text-muted)] transition-colors cursor-pointer"
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
    </div>
  );
};

