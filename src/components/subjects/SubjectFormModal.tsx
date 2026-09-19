import React, { useState } from 'react';
import { X, BookOpen, Plus } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const SubjectFormModal: React.FC = () => {
  const {
    isCreateSubjectModalOpen,
    setIsCreateSubjectModalOpen,
    addSubject
  } = useTasks();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [credits, setCredits] = useState(4);
  const [semester, setSemester] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetColors = [
    '#6366f1', // Indigo
    '#0ea5e9', // Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#14b8a6', // Teal
  ];

  if (!isCreateSubjectModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setIsSubmitting(true);
    addSubject({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      professor: professor.trim() || undefined,
      teacherName: professor.trim() || 'Faculty',
      color,
      credits: Number(credits) || 4,
      semester: Number(semester) || 2
    });

    setIsSubmitting(false);
    setIsCreateSubjectModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="subject-form-modal"
        className="relative flex flex-col w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-display font-bold text-[var(--text-main)]">
              Add New Curriculum Subject
            </h2>
          </div>
          <button
            onClick={() => setIsCreateSubjectModalOpen(false)}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
              Subject Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Cloud Computing & Distributed Systems"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs sm:text-sm font-medium text-[var(--text-main)] focus:border-indigo-500 focus:bg-[var(--bg-card)] focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. IT615"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-mono font-bold text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
                Professor / Faculty
              </label>
              <input
                type="text"
                value={professor}
                onChange={e => setProfessor(e.target.value)}
                placeholder="e.g. Dr. A. Verma"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
                Credits
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={credits}
                onChange={e => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
                <option value={3}>Semester 3</option>
                <option value={4}>Semester 4</option>
              </select>
            </div>
          </div>

          {/* Color Picker Palette */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-2">
              Color Accent Tag
            </label>
            <div className="flex items-center gap-2">
              {presetColors.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateSubjectModalOpen(false)}
              className="px-4 py-2 rounded-xl font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !code.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl gradient-brand-bg text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving...' : 'Add Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
