import React, { useState } from 'react';
import {
  List,
  LayoutGrid,
  Filter,
  ArrowUpDown,
  Plus,
  Search,
  CheckCircle2,
  X,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Priority, TaskStatus } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from './TaskCard';

export const TasksView: React.FC = () => {
  const {
    filteredTasks,
    tasks,
    subjects,
    filters,
    setFilters,
    resetFilters,
    setIsCreateTaskModalOpen
  } = useTasks();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const quickFilterTabs: { id: typeof filters.quickFilter; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'today', label: 'Due Today' },
    { id: 'tomorrow', label: 'Due Tomorrow' },
    { id: 'this_week', label: 'This Week' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'high_priority', label: 'High Priority' }
  ];

  const kanbanColumns: { status: TaskStatus; label: string; dotColor: string }[] = [
    { status: 'not_started', label: 'Not Started', dotColor: 'bg-ink-400' },
    { status: 'in_progress', label: 'In Progress', dotColor: 'bg-ink-faint dark:bg-ink0' },
    { status: 'waiting', label: 'Waiting on Others', dotColor: 'bg-amber-500' },
    { status: 'completed', label: 'Completed', dotColor: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header with Title, Stats & Add Task Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tracking-tight">
            Academic Tasks & Assignments
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted">
            Manage your coursework, track subtasks, and coordinate project submissions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="flex items-center gap-2 rounded-none bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-none shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Quick Filter Tabs & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b-[1.5px] border-ink-faint dark:border-ink-faint pb-3">
        {/* Horizontal Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {quickFilterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilters(prev => ({ ...prev, quickFilter: tab.id }))}
              className={`rounded-none px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                filters.quickFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-none'
                  : 'bg-ink-faint dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher (List vs Kanban) & Filter Trigger */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Sorting */}
          <select
            value={filters.sortBy}
            onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-2.5 py-1.5 text-xs text-ink-muted dark:text-ink-muted font-medium focus:outline-hidden"
          >
            <option value="urgency">Sort by Urgency Score</option>
            <option value="deadline">Sort by Deadline Earliest</option>
            <option value="priority">Sort by Priority</option>
            <option value="progress">Sort by Progress %</option>
            <option value="created">Sort by Date Created</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-ink-faint dark:bg-ink p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-none p-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-bg dark:bg-ink text-indigo-600 shadow-none font-semibold'
                  : 'text-ink-muted hover:text-ink-muted'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`rounded-none p-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-bg dark:bg-ink text-indigo-600 shadow-none font-semibold'
                  : 'text-ink-muted hover:text-ink-muted'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`flex items-center gap-1.5 rounded-none border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-colors ${
              showFilterDrawer
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-600'
                : 'border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink text-ink-muted dark:text-ink-muted'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer (if toggled) */}
      {showFilterDrawer && (
        <div className="p-4 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink/60 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={filters.subjectId}
              onChange={e => setFilters(prev => ({ ...prev, subjectId: e.target.value }))}
              className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-2 py-1.5 text-xs text-ink dark:text-bg"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-2 py-1.5 text-xs text-ink dark:text-bg"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-2 py-1.5 text-xs text-ink dark:text-bg"
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-1.5 text-xs font-semibold text-ink-muted dark:text-ink-muted hover:text-ink dark:hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View: List View or Kanban Board View */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border-[1.5px] border-dashed border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink">
              <CheckCircle2 className="h-10 w-10 text-ink-muted dark:text-ink-muted mx-auto mb-2" />
              <h3 className="text-sm font-bold text-ink dark:text-white">No tasks found</h3>
              <p className="text-xs text-ink-muted dark:text-ink-muted mt-1">
                Try clearing your filters or create a new assignment task.
              </p>
              <button
                onClick={resetFilters}
                className="mt-3 rounded-none bg-ink-faint dark:bg-ink px-4 py-1.5 text-xs font-semibold text-ink-muted dark:text-ink-muted"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            return (
              <div
                key={col.status}
                className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg/70 dark:bg-ink/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className="text-xs font-bold text-ink dark:text-white">{col.label}</h3>
                  </div>
                  <span className="rounded-md bg-bg dark:bg-ink px-2 py-0.5 text-[11px] font-bold text-ink-muted">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} compact />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-ink-faint dark:border-ink-faint/80 rounded-none text-xs text-ink-muted">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
