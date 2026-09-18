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
  Database,
  Binary,
  MessageSquare,
  Code,
  GitFork,
  Pin,
  ShieldCheck,
  User,
  AlertTriangle
} from 'lucide-react';
import { Priority, RecurringFrequency, TaskReminder } from '../../types';
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
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || 'sub_it615');
  const [dueDate, setDueDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('high');
  const [tagInput, setTagInput] = useState('Assignment');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: 'st_1', title: 'Review lecture notes & problem requirements', completed: false },
    { id: 'st_2', title: 'Draft solutions & verify with rubric', completed: false }
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
        subjectId: selectedSubject ? selectedSubject.id : subjects[0]?.id || 'sub_it615',
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

      // Reset form
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
      setAuthorError('Please enter your full name. Anonymous posting is disabled to prevent false announcements.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header with Switcher Tabs */}
        <div className="flex items-center justify-between border-b-[1.5px] border-ink-faint dark:border-ink-faint pb-4 mb-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('task')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-none text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'task'
                  ? 'bg-ink dark:bg-ink-faint text-bg dark:text-ink text-white shadow-none shadow-blue-500/20'
                  : 'text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Academic Task</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcement')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-none text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'announcement'
                  ? 'bg-amber-600 text-white shadow-none shadow-amber-500/20'
                  : 'text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink'
              }`}
            >
              <Megaphone className="h-4 w-4" />
              <span>📢 CR Announcement</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateTaskModalOpen(false)}
            className="p-2 rounded-none text-ink-muted hover:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {activeTab === 'task' ? (
          <form onSubmit={handleSubmitTask} className="space-y-5">
            {/* Task Title */}
            <div>
              <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1.5">
                Task / Assignment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lab 4: SQL Query Optimization & Indexing"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-3 text-sm text-ink dark:text-white focus:border-blue-600 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Subject & Priority (2 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject Selector (5 Subjects) */}
              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1.5">
                  5 Curriculum Subjects <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-3 text-xs sm:text-sm font-semibold text-ink dark:text-white focus:border-blue-600 focus:outline-hidden transition-colors"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as Priority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2.5 rounded-none text-xs font-bold uppercase transition-all ${
                        priority === p
                          ? p === 'high'
                            ? 'bg-rose-600 text-white shadow-none'
                            : p === 'medium'
                            ? 'bg-amber-600 text-white shadow-none'
                            : 'bg-ink dark:bg-ink-faint text-bg dark:text-ink text-white shadow-none'
                          : 'bg-ink-faint dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Due Date & Due Time (2 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-3 text-sm text-ink dark:text-white focus:border-blue-600 focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1.5">
                  Submission Time (24h)
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-3 text-sm text-ink dark:text-white focus:border-blue-600 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1.5">
                Description / Submission Requirements
              </label>
              <textarea
                rows={3}
                placeholder="Add key rubric requirements, submission links or chapter references..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-3 text-xs sm:text-sm text-ink dark:text-white focus:border-blue-600 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Subtasks Mileink List */}
            <div>
              <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1.5">
                Mileinks & Steps ({subtasks.length})
              </label>
              <div className="space-y-2 mb-2 max-h-32 overflow-y-auto">
                {subtasks.map((st, idx) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2.5 rounded-none bg-bg dark:bg-ink/80 border-[1.5px] border-ink-faint dark:border-ink-faint text-xs"
                  >
                    <span className="text-ink-muted dark:text-bg truncate">
                      {idx + 1}. {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-ink-muted hover:text-rose-500 p-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add mileink step..."
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2 text-xs text-ink dark:text-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3.5 py-2 rounded-none bg-ink-faint dark:bg-ink-700 text-xs font-bold text-ink-muted dark:text-bg hover:bg-ink-300 transition-colors"
                >
                  Add Step
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1.5">
                Tags
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Assignment, Lab, Submission, Quiz"
                className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-2.5 text-xs text-ink dark:text-white focus:outline-hidden"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t-[1.5px] border-ink-faint dark:border-ink-faint">
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="px-5 py-2.5 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint text-xs font-semibold text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-6 py-2.5 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint text-xs font-bold text-white shadow-none shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save & Publish Task'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
            {/* Anti-fraud Verified Identity Notice banner */}
            <div className="p-3.5 rounded-none bg-amber-500/10 border-[1.5px] border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-800 dark:text-amber-300">
                  Verified Identity Required (Anti-False Notice Policy)
                </span>
                <span className="text-[11px] text-ink-muted dark:text-ink-muted">
                  To eliminate fake or unverified circulars, your full name will be visibly attached to this notice for all students.
                </span>
              </div>
            </div>

            {/* Poster Full Name & CR Designation (Mandatory Identity Check) */}
            <div>
              <label htmlFor="modal-ann-author-input" className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1">
                Your Full Name (Person Posting Announcement) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -tranink-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  id="modal-ann-author-input"
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma (Class Representative, Section A)"
                  value={annAuthor}
                  onChange={e => {
                    setAnnAuthor(e.target.value);
                    if (authorError) setAuthorError('');
                  }}
                  className={`w-full rounded-none border-[1.5px] ${
                    authorError
                      ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink'
                  } pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-ink dark:text-white placeholder-ink-400 focus:border-amber-600 focus:outline-hidden transition-colors`}
                />
              </div>
              {authorError && (
                <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {authorError}
                </p>
              )}
            </div>

            {/* Announcement Title */}
            <div>
              <label htmlFor="modal-ann-title-input" className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1">
                Announcement Headline <span className="text-rose-500">*</span>
              </label>
              <input
                id="modal-ann-title-input"
                type="text"
                required
                placeholder="e.g. DBMS Lab Session Rescheduled / Assignment Submission Guide"
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-2.5 text-xs sm:text-sm text-ink dark:text-white focus:border-amber-600 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Related Subject & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1">
                  Related Subject
                </label>
                <select
                  value={annSubjectId}
                  onChange={e => setAnnSubjectId(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink dark:text-white focus:border-amber-600 focus:outline-hidden transition-colors"
                >
                  <option value="all">📢 All 5 Subjects / General Class Notice</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnPriority('normal')}
                    className={`py-2 rounded-none text-xs font-bold transition-all ${
                      annPriority === 'normal'
                        ? 'bg-ink dark:bg-ink-faint text-bg dark:text-ink text-white shadow-none'
                        : 'bg-ink-faint dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-ink-faint'
                    }`}
                  >
                    Standard Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnPriority('urgent')}
                    className={`py-2 rounded-none text-xs font-bold transition-all ${
                      annPriority === 'urgent'
                        ? 'bg-rose-600 text-white shadow-none'
                        : 'bg-ink-faint dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-ink-faint'
                    }`}
                  >
                    🚨 Urgent Alert
                  </button>
                </div>
              </div>
            </div>

            {/* Announcement Message Content */}
            <div>
              <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1">
                Announcement Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write detailed instructions, venue details, submission links or deadlines announced by professor..."
                value={annContent}
                onChange={e => setAnnContent(e.target.value)}
                className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-2.5 text-xs sm:text-sm text-ink dark:text-white focus:border-amber-600 focus:outline-hidden transition-colors"
              />
            </div>

            {/* CR Passcode */}
            <div>
              <label htmlFor="modal-ann-passcode-input" className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1">
                CR Authorization Passcode <span className="text-rose-500">*</span>
              </label>
              <input
                id="modal-ann-passcode-input"
                type="password"
                required
                placeholder="Enter CR passcode"
                value={annPasscode}
                onChange={e => {
                  setAnnPasscode(e.target.value);
                  if (authorError) setAuthorError('');
                }}
                className={`w-full rounded-none border-[1.5px] ${
                  authorError
                    ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                    : 'border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink'
                } px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink dark:text-white placeholder-ink-400 focus:border-amber-600 focus:outline-hidden transition-colors`}
              />
            </div>

            {/* Pin to Top Checkbox */}
            <div className="p-3 rounded-none bg-bg dark:bg-ink/50 border-[1.5px] border-ink-faint dark:border-ink-faint flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-xs font-bold text-ink-muted dark:text-ink-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={annIsPinned}
                  onChange={e => setAnnIsPinned(e.target.checked)}
                  className="rounded border-ink-faint text-amber-600 focus:ring-0 h-4 w-4"
                />
                <Pin className="h-3.5 w-3.5 text-amber-500" />
                <span>Pin this Announcement to Top of Class Feed</span>
              </label>
              <span className="text-[10px] text-ink-muted font-medium">CR Noticeboard</span>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t-[1.5px] border-ink-faint dark:border-ink-faint">
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="px-5 py-2.5 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint text-xs font-semibold text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !annAuthor.trim() || !annTitle.trim() || !annContent.trim()}
                className="px-6 py-2.5 rounded-none bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-none shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : '📢 Post Verified Announcement (CR)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
