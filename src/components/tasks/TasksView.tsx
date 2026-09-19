import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  Sparkles
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
    { id: 'all', label: 'Active Tasks' },
    { id: 'today', label: 'Due Today' },
    { id: 'tomorrow', label: 'Due Tomorrow' },
    { id: 'this_week', label: 'This Week' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'high_priority', label: 'High Priority' }
  ];

  const kanbanColumns: { status: TaskStatus; label: string; dotColor: string }[] = [
    { status: 'not_started', label: 'Not Started', dotColor: 'bg-slate-400' },
    { status: 'in_progress', label: 'In Progress', dotColor: 'bg-indigo-500' },
    { status: 'waiting', label: 'Waiting on Others', dotColor: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
              Active Tasks & Coursework
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Manage your active study assignments, track progress, and organize deadlines.
          </p>
        </div>

        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand-bg text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Quick Filters Bar & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {quickFilterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilters(prev => ({ ...prev, quickFilter: tab.id }))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filters.quickFilter === tab.id
                  ? 'gradient-brand-bg text-white shadow-xs'
                  : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-indigo-500/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher & Options */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <select
            value={filters.sortBy}
            onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-medium focus:outline-none"
          >
            <option value="urgency">Sort by Urgency</option>
            <option value="deadline">Sort by Deadline</option>
            <option value="priority">Sort by Priority</option>
            <option value="progress">Sort by Progress</option>
          </select>

          {/* List vs Kanban toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-[var(--text-muted)]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-[var(--text-muted)]'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showFilterDrawer
                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {showFilterDrawer && (
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">
              Subject
            </label>
            <select
              value={filters.subjectId}
              onChange={e => setFilters(prev => ({ ...prev, subjectId: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] px-2.5 py-1.5 text-xs text-[var(--text-main)]"
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
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] px-2.5 py-1.5 text-xs text-[var(--text-main)]"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">
              Status
            </label>
            <select
              value={filters.status}
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] px-2.5 py-1.5 text-xs text-[var(--text-main)]"
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
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--text-faint)] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">No tasks found</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Try adjusting your filters or create a new assignment task.
              </p>
            </div>
          ) : (
            filteredTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            return (
              <div
                key={col.status}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className="text-xs font-bold font-display text-[var(--text-main)]">{col.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-card-subtle)] text-[0.65rem] font-mono font-bold text-[var(--text-muted)]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[250px]">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} compact />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-32 flex items-center justify-center border border-dashed border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-faint)]">
                      Empty column
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
