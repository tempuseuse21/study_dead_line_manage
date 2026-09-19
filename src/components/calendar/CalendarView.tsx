import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Task } from '../../types';

export const CalendarView: React.FC = () => {
  const { tasks, subjects, setSelectedTask, setIsCreateTaskModalOpen } = useTasks();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month for padding
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );
  };

  // Calendar cells
  const calendarCells = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarCells.push({
      dayNum,
      dateStr: dStr,
      isCurrentMonth: false,
      isToday: false,
      tasks: tasks.filter(t => t.dueDate === dStr)
    });
  }

  // Current month days
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNum: d,
      dateStr: dStr,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      tasks: tasks.filter(t => t.dueDate === dStr)
    });
  }

  // Next month padding to fill 35 or 42 grid cells
  const remainingCells = 35 - calendarCells.length > 0 ? 35 - calendarCells.length : 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNum: d,
      dateStr: dStr,
      isCurrentMonth: false,
      isToday: false,
      tasks: tasks.filter(t => t.dueDate === dStr)
    });
  }

  const selectedDayTasks = tasks.filter(t => t.dueDate === selectedDateStr);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
            <span>Academic Calendar & Submissions</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted mt-1">
            Visual month planner for deadlines, group presentations, and exam cutoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-none hover:bg-ink-faint dark:hover:bg-ink text-ink-muted dark:text-ink-muted"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-ink dark:text-white min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-none hover:bg-ink-faint dark:hover:bg-ink text-ink-muted dark:text-ink-muted"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-2 text-xs font-semibold text-ink-muted dark:text-ink-muted hover:bg-bg dark:hover:bg-ink"
          >
            Today
          </button>

          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="flex items-center gap-1.5 rounded-none bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-none hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Deadline</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar (Left 2 cols) & Day Agenda (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-4 sm:p-5 shadow-none overflow-hidden">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-ink-muted uppercase tracking-wider mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDateStr;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[75px] sm:min-h-[90px] rounded-none border-[1.5px] p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : cell.isCurrentMonth
                      ? 'border-ink-faint/70 dark:border-ink-faint bg-bg dark:bg-ink-850 hover:border-ink-faint dark:hover:border-ink-faint'
                      : 'border-ink-faint dark:border-ink-850/60 bg-bg/40 dark:bg-ink/30 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                          : 'text-ink dark:text-bg'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {cell.tasks.length > 0 && (
                      <span className="text-[10px] font-bold text-ink-muted">
                        {cell.tasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Badges in Cell */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {cell.tasks.slice(0, 2).map(task => {
                      const subject = subjects.find(s => s.id === task.subjectId);
                      return (
                        <div
                          key={task.id}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTask(task);
                          }}
                          className="truncate rounded px-1 py-0.5 text-[9px] font-semibold transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: `${subject?.color || '#6366f1'}20`,
                            color: subject?.color || '#6366f1'
                          }}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                    {cell.tasks.length > 2 && (
                      <div className="text-[9px] text-ink-muted font-medium pl-0.5">
                        +{cell.tasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Drawer */}
        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-5 shadow-none flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-[1.5px] border-ink-faint dark:border-ink-faint">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Selected Date
              </span>
              <h3 className="text-base font-extrabold text-ink dark:text-white">
                {(() => {
                  const [y, m, d] = selectedDateStr.split('-').map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                })()}
              </h3>
            </div>

            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="p-1.5 rounded-none bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
              title="Add task on this date"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {selectedDayTasks.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-ink-faint dark:border-ink-faint rounded-none text-ink-muted">
                <Clock className="h-8 w-8 mx-auto mb-2 text-ink-muted dark:text-ink-muted" />
                <p className="text-xs font-semibold text-ink-muted dark:text-ink-muted">No submissions scheduled</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Enjoy your free study time!</p>
              </div>
            ) : (
              selectedDayTasks.map(task => {
                const sub = subjects.find(s => s.id === task.subjectId);
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="p-3.5 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg/70 dark:bg-ink-850 hover:bg-ink-faint/80 dark:hover:bg-ink transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: `${sub?.color || '#6366f1'}15`,
                          color: sub?.color || '#6366f1',
                          borderColor: `${sub?.color || '#6366f1'}30`
                        }}
                      >
                        {sub?.name || 'General'}
                      </span>
                      <span className="text-[10px] text-ink-muted">{task.dueTime || '23:59'}</span>
                    </div>

                    <h4
                      className={`text-xs font-bold leading-snug ${
                        isDone ? 'line-through text-ink-muted' : 'text-ink dark:text-white'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-ink-muted dark:text-ink-muted mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t-[1.5px] border-ink-faint/60 dark:border-ink-faint text-[10px] text-ink-muted">
                      <span>Status</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
