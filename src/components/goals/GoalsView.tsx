import React, { useState } from 'react';
import { Plus, Target, CheckCircle2, Trash2, Edit3, X, TrendingUp } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Goal, GoalStatus } from '../../types';
import { cn, getTodayStr, generateId } from '../../lib/utils';

interface GoalFormProps {
  goal?: Goal;
  onClose: () => void;
}

const GoalFormModal: React.FC<GoalFormProps> = ({ goal, onClose }) => {
  const { subjects, createGoal, updateGoal } = useTasks();
  const isEdit = !!goal;

  const [form, setForm] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    subjectId: goal?.subjectId || '',
    targetValue: goal?.targetValue || 100,
    currentValue: goal?.currentValue || 0,
    unit: goal?.unit || '%',
    deadline: goal?.deadline || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      ...form,
      subjectId: form.subjectId || undefined,
      deadline: form.deadline || undefined
    };
    if (isEdit && goal) updateGoal(goal.id, data);
    else createGoal(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-display font-bold text-lg text-[var(--text-main)]">{isEdit ? 'Edit Goal' : 'Create New Goal'}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Goal Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={cn(
                'w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border text-sm text-[var(--text-main)] focus:outline-none',
                errors.title ? 'border-rose-500' : 'border-[var(--border-subtle)] focus:border-indigo-500'
              )}
              placeholder="e.g. Master DBMS Normalization"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Subject</label>
              <select
                value={form.subjectId}
                onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
              >
                <option value="">— None —</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Unit</label>
              <input
                value={form.unit}
                onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
                placeholder="%, hours, tasks"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Current</label>
              <input
                type="number" min={0}
                value={form.currentValue}
                onChange={e => setForm(p => ({ ...p, currentValue: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Target</label>
              <input
                type="number" min={1}
                value={form.targetValue}
                onChange={e => setForm(p => ({ ...p, targetValue: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Target Date</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl gradient-brand-bg text-white font-semibold text-xs shadow-md">
              {isEdit ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const GoalsView: React.FC = () => {
  const { goals, subjects, updateGoal, deleteGoal } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all');

  const filteredGoals = filter === 'all' ? goals : goals.filter(g => g.status === filter);
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
              Academic Goals & Targets
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Set study targets, track milestone progress, and build academic momentum.
          </p>
        </div>
        <button
          onClick={() => { setEditingGoal(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand-bg text-white font-semibold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'active', 'completed', 'paused'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              filter === f
                ? 'gradient-brand-bg text-white shadow-xs'
                : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-3">
            <Target className="w-10 h-10 text-[var(--text-faint)] mx-auto" />
            <h3 className="font-display font-bold text-base text-[var(--text-main)]">No goals found</h3>
            <p className="text-xs text-[var(--text-muted)]">Create your first academic goal to track progress.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-xl gradient-brand-bg text-white font-semibold text-xs"
            >
              + Create First Goal
            </button>
          </div>
        ) : (
          filteredGoals.map(goal => {
            const subject = subjects.find(s => s.id === goal.subjectId);
            const pct = goal.targetValue
              ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              : 0;
            const isComplete = pct >= 100;

            return (
              <div key={goal.id} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {subject && (
                        <span className="text-[0.65rem] font-mono font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                          {subject.code}
                        </span>
                      )}
                      <span className="text-[0.65rem] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {goal.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-sm sm:text-base text-[var(--text-main)]">{goal.title}</h3>
                    {goal.description && <p className="text-xs text-[var(--text-muted)]">{goal.description}</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingGoal(goal); setShowForm(true); }} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)]">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm(`Delete "${goal.title}"?`)) deleteGoal(goal.id); }} className="p-1.5 text-[var(--text-muted)] hover:text-rose-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[var(--text-muted)]">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <GoalFormModal
          goal={editingGoal || undefined}
          onClose={() => { setShowForm(false); setEditingGoal(null); }}
        />
      )}
    </div>
  );
};
