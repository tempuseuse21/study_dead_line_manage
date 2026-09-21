import React, { useState } from 'react';
import {
  CheckCircle2,
  Search,
  RotateCcw,
  Clock,
  Sparkles,
  Calendar,
  Check
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from './TaskCard';

export const CompletedTasksView: React.FC = () => {
  const { tasks, toggleTaskComplete, setSelectedTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');

  const completedTasks = tasks.filter(t => t.status === 'completed');

  const filteredCompletedTasks = completedTasks.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
              Completed Tasks Archive
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Separate archive for all finished assignments, completed deadlines, and verified submissions.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center gap-2 self-start sm:self-auto">
          <Check className="w-4 h-4" />
          <span>{completedTasks.length} Completed Total</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-faint)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search completed tasks by title, tag, or topic..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Task List / Grid */}
      {filteredCompletedTasks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)]">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/40" />
          <h3 className="font-display font-bold text-base text-[var(--text-main)] mb-1">
            {searchQuery ? 'No matching completed tasks' : 'No completed tasks yet'}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            {searchQuery
              ? 'Try adjusting your search query.'
              : 'Tasks marked as completed will automatically shift here into this separate archive.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompletedTasks.map(task => (
            <div key={task.id} className="relative group">
              <TaskCard task={task} />
              <div
                className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono flex items-center gap-1 backdrop-blur-xs pointer-events-none"
                title="Completed and Archived"
              >
                <Check className="w-3 h-3" />
                <span>Archived</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
