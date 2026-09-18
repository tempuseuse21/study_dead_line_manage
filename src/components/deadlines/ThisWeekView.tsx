import React from 'react';
import { CalendarRange, Clock, CheckCircle2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { formatLiveCountdown } from '../../lib/utils';
import { Task } from '../../types';

export const ThisWeekView: React.FC = () => {
  const { tasks, subjects, setSelectedTask, setIsCreateTaskModalOpen } = useTasks();

  // Current week Monday - Sunday
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    const dayTasks = tasks.filter(t => t.dueDate === dateStr);

    return {
      date: d,
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
      shortName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday,
      tasks: dayTasks
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tracking-tight flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-indigo-600" />
            <span>This Week’s Workload & Timetable</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted mt-1">
            Monday through Sunday academic schedule. Plan ahead for seminars, quizzes, and assignment cutoffs.
          </p>
        </div>

        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="flex items-center gap-2 rounded-none bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-none hover:bg-indigo-700 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map(day => (
          <div
            key={day.dateStr}
            className={`rounded-3xl border-[1.5px] p-4 flex flex-col min-h-[360px] transition-all ${
              day.isToday
                ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20'
                : 'bg-bg dark:bg-ink border-ink-faint dark:border-ink-faint'
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between pb-3 border-b-[1.5px] border-ink-faint/80 dark:border-ink-faint/80 mb-3">
              <div>
                <p
                  className={`text-xs font-extrabold uppercase tracking-wider ${
                    day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-ink-muted dark:text-ink-muted'
                  }`}
                >
                  {day.shortName}
                </p>
                <p className="text-lg font-black text-ink dark:text-white leading-tight">
                  {day.dayNumber} <span className="text-xs font-normal text-ink-muted">{day.monthName}</span>
                </p>
              </div>

              {day.isToday && (
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                  Today
                </span>
              )}
            </div>

            {/* Tasks on this day */}
            <div className="space-y-2.5 flex-1">
              {day.tasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6 text-ink-muted">
                  <p className="text-xs italic">No deadlines</p>
                </div>
              ) : (
                day.tasks.map(task => {
                  const subject = subjects.find(s => s.id === task.subjectId);
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-2.5 rounded-none border-[1.5px] text-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all ${
                        isDone
                          ? 'bg-ink-faint dark:bg-ink/60 border-ink-faint dark:border-ink-faint opacity-60'
                          : 'bg-bg dark:bg-ink-850 border-ink-faint dark:border-ink-750 shadow-none'
                      }`}
                    >
                      {subject && (
                        <span
                          className="inline-block text-[10px] font-bold truncate max-w-full mb-1"
                          style={{ color: subject.color }}
                        >
                          {subject.name}
                        </span>
                      )}

                      <h4
                        className={`font-bold text-xs leading-snug line-clamp-2 ${
                          isDone ? 'line-through text-ink-muted' : 'text-ink dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t-[1.5px] border-ink-faint dark:border-ink-faint text-[10px] text-ink-muted">
                        <span>{task.dueTime || '11:59 PM'}</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
