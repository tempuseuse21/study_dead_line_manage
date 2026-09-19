import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Tag,
  Megaphone,
  CheckCircle2,
  ShieldCheck,
  User,
  AlertTriangle
} from 'lucide-react';
import { Priority } from '../../types';
import { useTasks } from '../../context/TaskContext';

export const TaskFormModal: React.FC = () => {
  const {
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    createTask,
    createAnnouncement,
    subjects
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'task' | 'announcement'>('task');

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [dueDate, setDueDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('high');
  const [tagInput, setTagInput] = useState('Assignment');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: 'st_1', title: 'Review lecture notes & requirements', completed: false },
    { id: 'st_2', title: 'Draft solution & verify with rubric', completed: false }
  ]);
  const [newSubtask, setNewSubtask] = useState('');

  // Announcement form state (CR)
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annSubjectId, setAnnSubjectId] = useState<string>('all');
  const [annAuthor, setAnnAuthor] = useState(() => localStorage.getItem('cr_poster_name') || '');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');
  const [annIsPinned, setAnnIsPinned] = useState(false);
  const [annPasscode, setAnnPasscode] = useState('');
  const [authorError, setAuthorError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateTaskModalOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: `st_${Date.now()}`, title: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedSubject = subjects.find(s => s.id === subjectId) || subjects[0];
      const tags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await createTask({
        title: title.trim(),
        description: description.trim(),
        subjectId: selectedSubject ? selectedSubject.id : subjects[0]?.id || '',
        dueDate,
        dueTime,
        priority,
        status: 'not_started',
        progress: 0,
        tags: tags.length > 0 ? tags : ['Academic'],
        subtasks,
        assignedToIds: ['all'],
        createdById: 'student',
        createdByName: 'Student'
      });

      setTitle('');
      setDescription('');
      setNewSubtask('');
      setIsCreateTaskModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthorError('');
    if (!annAuthor.trim()) {
      setAuthorError('Please enter your full name. Anonymous posting is disabled.');
      return;
    }
    if (!annTitle.trim() || !annContent.trim()) return;

    setIsSubmitting(true);
    try {
      localStorage.setItem('cr_poster_name', annAuthor.trim());
      const res = await createAnnouncement({
        title: (annTitle || '').trim(),
        content: (annContent || '').trim(),
        subjectId: annSubjectId === 'all' ? undefined : annSubjectId,
        authorName: (annAuthor || '').trim(),
        priority: annPriority,
        isPinned: annIsPinned
      }, annPasscode);

      if (res.success) {
        setAnnTitle('');
        setAnnContent('');
        setAnnPasscode('');
        setIsCreateTaskModalOpen(false);
      } else {
        setAuthorError(res.error || 'Failed to post announcement.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('task')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'task'
                  ? 'gradient-brand-bg text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Academic Task</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcement')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'announcement'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>CR Announcement</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateTaskModalOpen(false)}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeTab === 'task' ? (
          <form onSubmit={handleSubmitTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Task / Assignment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lab 4: SQL Query Optimization & Indexing"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-main)] focus:border-indigo-500 focus:bg-[var(--bg-card)] focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Curriculum Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as Priority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        priority === p
                          ? p === 'high'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : p === 'medium'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'gradient-brand-bg text-white shadow-sm'
                          : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm font-mono text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Submission Cutoff Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm font-mono text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Submission Instructions & Requirements
              </label>
              <textarea
                rows={3}
                placeholder="Add key rubric requirements, submission links or chapter references..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Subtasks & Milestones ({subtasks.length})
              </label>
              <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
                {subtasks.map((st, idx) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs"
                  >
                    <span className="text-[var(--text-main)] truncate font-medium">
                      {idx + 1}. {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-[var(--text-muted)] hover:text-rose-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add milestone step..."
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-indigo-500/10 text-indigo-600 font-bold text-xs border border-[var(--border-subtle)] transition-colors cursor-pointer"
                >
                  Add Step
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Assignment, Lab, Quiz, Project"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-6 py-2.5 rounded-xl gradient-brand-bg text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Publish Task'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-800 dark:text-amber-200">
                  Verified CR Announcement Policy
                </span>
                <span className="text-[0.7rem]">
                  Your full name will be attached to this notice to verify authenticity for all class members.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma (Class Rep)"
                  value={annAuthor}
                  onChange={e => setAnnAuthor(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--text-main)] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Announcement Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DBMS Lab Session Rescheduled"
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Related Subject
                </label>
                <select
                  value={annSubjectId}
                  onChange={e => setAnnSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] focus:outline-none"
                >
                  <option value="all">📢 General Class Notice</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnPriority('normal')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      annPriority === 'normal'
                        ? 'gradient-brand-bg text-white'
                        : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnPriority('urgent')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      annPriority === 'urgent'
                        ? 'bg-rose-600 text-white'
                        : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    🚨 Urgent
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Notice Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write detailed instructions..."
                value={annContent}
                onChange={e => setAnnContent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                CR Authorization Passcode <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Enter CR passcode"
                value={annPasscode}
                onChange={e => setAnnPasscode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !annAuthor.trim() || !annTitle.trim() || !annContent.trim()}
                className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Publishing...' : '📢 Post Announcement'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
