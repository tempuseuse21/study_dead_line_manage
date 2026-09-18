import React, { useState } from 'react';
import { X, BookOpen, User, Hash, Palette, Plus } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const SubjectFormModal: React.FC = () => {
  const {
    isCreateSubjectModalOpen,
    setIsCreateSubjectModalOpen,
    createSubject
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
    await createSubject({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      professor: professor.trim() || undefined,
      color,
      credits: Number(credits) || 4,
      semester: Number(semester) || 2
    });

    setIsSubmitting(false);
    setIsCreateSubjectModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
      <div
        id="subject-form-modal"
        className="relative flex flex-col w-full max-w-md rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b-[1.5px] border-ink-faint dark:border-ink-faint bg-bg/70 dark:bg-ink-850">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-ink dark:text-white">
              Add New MSc IT Subject
            </h2>
          </div>
          <button
            onClick={() => setIsCreateSubjectModalOpen(false)}
            className="p-1.5 rounded-none text-ink-muted hover:text-ink-muted dark:hover:text-bg hover:bg-ink-faint dark:hover:bg-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-ink dark:text-white mb-1">
              Subject Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Distributed Computing & Cloud Infrastructure"
              className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2.5 text-xs sm:text-sm font-medium text-ink dark:text-white focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink dark:text-white mb-1">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. MIT-205"
                className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-2 text-xs font-semibold text-ink dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-ink dark:text-white mb-1">
                Faculty / Professor
              </label>
              <input
                type="text"
                value={professor}
                onChange={e => setProfessor(e.target.value)}
                placeholder="e.g. Dr. A. Verma"
                className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-2 text-xs text-ink dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink dark:text-white mb-1">
                Credits
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={credits}
                onChange={e => setCredits(Number(e.target.value))}
                className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-2 text-xs text-ink dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-ink dark:text-white mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
                className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-2 text-xs text-ink dark:text-white focus:border-indigo-500 focus:outline-hidden"
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
            <label className="block font-bold text-ink dark:text-white mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-2">
              {presetColors.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t-[1.5px] border-ink-faint dark:border-ink-faint flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateSubjectModalOpen(false)}
              className="rounded-none px-4 py-2 font-semibold text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !code.trim()}
              className="flex items-center gap-1.5 rounded-none bg-indigo-600 px-4 py-2 font-bold text-white shadow-none hover:bg-indigo-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Add Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
