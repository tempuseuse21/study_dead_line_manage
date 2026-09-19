import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw, CheckCircle2, Trash2, ChevronRight, X, BookMarked } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { RevisionTopic, RevisionStatus } from '../../types';
import { cn, getTodayStr, generateId } from '../../lib/utils';

const STATUS_META: Record<RevisionStatus, { label: string; color: string; next?: RevisionStatus }> = {
  not_started: { label: 'Not Started', color: 'text-ink/40 dark:text-bg/40', next: 'learned' },
  learned: { label: 'Learned', color: 'text-blue-600 dark:text-blue-400', next: 'revision_1' },
  revision_1: { label: 'Rev 1', color: 'text-indigo-600 dark:text-indigo-400', next: 'revision_2' },
  revision_2: { label: 'Rev 2', color: 'text-violet-600 dark:text-violet-400', next: 'revision_3' },
  revision_3: { label: 'Rev 3', color: 'text-purple-600 dark:text-purple-400', next: 'mastered' },
  mastered: { label: 'Mastered', color: 'text-emerald-600 dark:text-emerald-400', next: undefined }
};

const STATUS_ORDER: RevisionStatus[] = ['not_started', 'learned', 'revision_1', 'revision_2', 'revision_3', 'mastered'];

// Spaced repetition intervals in days
const REVISION_INTERVALS: Partial<Record<RevisionStatus, number>> = {
  learned: 1,
  revision_1: 3,
  revision_2: 7,
  revision_3: 14
};

function getNextRevisionDate(status: RevisionStatus): string | undefined {
  const days = REVISION_INTERVALS[status];
  if (!days) return undefined;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Topic Form Modal ─────────────────────────────────────────────────────────

interface TopicFormProps {
  topic?: RevisionTopic;
  onClose: () => void;
}

const TopicFormModal: React.FC<TopicFormProps> = ({ topic, onClose }) => {
  const { subjects, exams, createRevisionTopic, updateRevisionTopic } = useTasks();
  const isEdit = !!topic;

  const [form, setForm] = useState({
    title: topic?.title || '',
    subjectId: topic?.subjectId || '',
    examId: topic?.examId || '',
    difficulty: topic?.difficulty || 'moderate' as RevisionTopic['difficulty'],
    notes: topic?.notes || ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    const data = {
      ...form,
      subjectId: form.subjectId || undefined,
      examId: form.examId || undefined
    };
    if (isEdit && topic) updateRevisionTopic(topic.id, data);
    else createRevisionTopic(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-bg/30 backdrop-blur-sm">
      <div className="bg-bg dark:bg-ink border-[1.5px] border-ink/20 dark:border-bg/20 w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-ink/10 dark:border-bg/10">
          <h2 className="font-serif text-2xl text-ink dark:text-bg">{isEdit ? 'Edit Topic' : 'Add Topic'}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-ink/50 dark:text-bg/50" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Topic Title *</label>
            <input
              value={form.title}
              onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setError(''); }}
              className={cn('w-full bg-transparent border-b-[1.5px] py-2 text-sm text-ink dark:text-bg focus:outline-none', error ? 'border-rose-500' : 'border-ink/30 dark:border-bg/30 focus:border-ink dark:focus:border-bg')}
              placeholder="e.g., Normalization in DBMS"
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Subject</label>
              <select
                value={form.subjectId}
                onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}
                className="w-full bg-transparent border-b-[1.5px] border-ink/30 dark:border-bg/30 py-2 text-sm text-ink dark:text-bg focus:outline-none"
              >
                <option value="">— None —</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
              </select>
            </div>
            <div>
              <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={e => setForm(p => ({ ...p, difficulty: e.target.value as RevisionTopic['difficulty'] }))}
                className="w-full bg-transparent border-b-[1.5px] border-ink/30 dark:border-bg/30 py-2 text-sm text-ink dark:text-bg focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {exams.length > 0 && (
            <div>
              <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Linked Exam</label>
              <select
                value={form.examId}
                onChange={e => setForm(p => ({ ...p, examId: e.target.value }))}
                className="w-full bg-transparent border-b-[1.5px] border-ink/30 dark:border-bg/30 py-2 text-sm text-ink dark:text-bg focus:outline-none"
              >
                <option value="">— None —</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full bg-transparent border-[1.5px] border-ink/20 dark:border-bg/20 p-2 text-sm text-ink dark:text-bg focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="mono text-xs text-ink/50 dark:text-bg/50 px-4 py-2 border-[1.5px] border-ink/20 dark:border-bg/20">Cancel</button>
            <button type="submit" className="mono text-xs bg-ink dark:bg-bg text-bg dark:text-ink px-6 py-2 hover:bg-accent hover:text-white transition-colors">
              {isEdit ? 'Save' : 'Add Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── RevisionView ─────────────────────────────────────────────────────────────

export const RevisionView: React.FC = () => {
  const { revisionTopics, subjects, updateRevisionTopic, deleteRevisionTopic } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<RevisionTopic | null>(null);
  const [filterSubjectId, setFilterSubjectId] = useState('all');
  const [filterStatus, setFilterStatus] = useState<RevisionStatus | 'all'>('all');

  const todayStr = getTodayStr();

  const filtered = useMemo(() => {
    return revisionTopics.filter(t => {
      if (filterSubjectId !== 'all' && t.subjectId !== filterSubjectId) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });
  }, [revisionTopics, filterSubjectId, filterStatus]);

  // Topics due for revision today
  const dueTodayCount = revisionTopics.filter(t =>
    t.nextRevisionDue && t.nextRevisionDue <= todayStr && t.status !== 'mastered'
  ).length;

  const advanceStatus = (topic: RevisionTopic) => {
    const next = STATUS_META[topic.status].next;
    if (!next) return;
    const now = new Date().toISOString();
    const update: Partial<RevisionTopic> = {
      status: next,
      nextRevisionDue: getNextRevisionDate(next)
    };
    if (next === 'learned') update.learnedAt = now;
    else if (next === 'revision_1') update.revision1At = now;
    else if (next === 'revision_2') update.revision2At = now;
    else if (next === 'revision_3') update.revision3At = now;
    else if (next === 'mastered') update.masteredAt = now;
    updateRevisionTopic(topic.id, update);
  };

  const masteredCount = revisionTopics.filter(t => t.status === 'mastered').length;
  const dueCount = dueTodayCount;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="mono text-accent block mb-2">[ REVISION ]</span>
          <h1 className="font-serif text-4xl text-ink dark:text-bg">Spaced Repetition</h1>
          <p className="text-sm text-ink/60 dark:text-bg/60 mt-2">
            Track topic mastery using a simple spaced repetition approach.
          </p>
        </div>
        <button
          onClick={() => { setEditingTopic(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-ink dark:bg-bg text-bg dark:text-ink mono text-xs px-4 py-2.5 hover:bg-accent hover:text-white transition-colors flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Topic
        </button>
      </div>

      {/* Stats */}
      {revisionTopics.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="border-[1.5px] border-ink/15 dark:border-bg/15 p-4">
            <div className="mono text-xs text-ink/50 dark:text-bg/50 mb-1">TOTAL TOPICS</div>
            <div className="font-mono text-3xl text-ink dark:text-bg">{revisionTopics.length.toString().padStart(2, '0')}</div>
          </div>
          <div className={cn('border-[1.5px] p-4', dueCount > 0 ? 'border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10' : 'border-ink/15 dark:border-bg/15')}>
            <div className={cn('mono text-xs mb-1', dueCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-ink/50 dark:text-bg/50')}>DUE TODAY</div>
            <div className={cn('font-mono text-3xl', dueCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-ink dark:text-bg')}>
              {dueCount.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="border-[1.5px] border-ink/15 dark:border-bg/15 p-4">
            <div className="mono text-xs text-ink/50 dark:text-bg/50 mb-1">MASTERED</div>
            <div className="font-mono text-3xl text-emerald-600 dark:text-emerald-400">{masteredCount.toString().padStart(2, '0')}</div>
          </div>
        </div>
      )}

      {/* Spaced repetition legend */}
      <div className="flex flex-wrap gap-2">
        {STATUS_ORDER.map(status => (
          <div key={status} className="flex items-center gap-1.5 mono text-[0.6rem] px-2 py-1 border-[1.5px] border-ink/10 dark:border-bg/10">
            <span className={STATUS_META[status].color}>●</span>
            <span className="text-ink/60 dark:text-bg/60">{STATUS_META[status].label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 mono text-[0.6rem] text-ink/40 dark:text-bg/40 ml-2">
          → 1d → 3d → 7d → 14d
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <select
          value={filterSubjectId}
          onChange={e => setFilterSubjectId(e.target.value)}
          className="bg-transparent border-[1.5px] border-ink/20 dark:border-bg/20 px-3 py-2 text-sm text-ink dark:text-bg focus:outline-none"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as RevisionStatus | 'all')}
          className="bg-transparent border-[1.5px] border-ink/20 dark:border-bg/20 px-3 py-2 text-sm text-ink dark:text-bg focus:outline-none"
        >
          <option value="all">All Statuses</option>
          {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
      </div>

      {/* Topics List */}
      {filtered.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-ink/20 dark:border-bg/20 p-12 text-center">
          <BookMarked className="h-12 w-12 mx-auto mb-4 text-ink/20 dark:text-bg/20" />
          <h3 className="font-serif text-xl text-ink dark:text-bg mb-2">
            {revisionTopics.length === 0 ? 'No topics yet' : 'No topics found'}
          </h3>
          <p className="text-sm text-ink/50 dark:text-bg/50 mb-4">
            Add topics you need to learn and revise them using spaced repetition.
          </p>
          {revisionTopics.length === 0 && (
            <button onClick={() => setShowForm(true)} className="mono text-xs bg-ink dark:bg-bg text-bg dark:text-ink px-6 py-2 hover:bg-accent hover:text-white transition-colors">
              + Add First Topic
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(topic => {
            const subject = subjects.find(s => s.id === topic.subjectId);
            const meta = STATUS_META[topic.status];
            const isDueToday = topic.nextRevisionDue && topic.nextRevisionDue <= todayStr && topic.status !== 'mastered';
            const canAdvance = !!meta.next;

            return (
              <div
                key={topic.id}
                className={cn(
                  'flex items-center gap-4 border-[1.5px] p-4 transition-all',
                  isDueToday ? 'border-amber-500/40 bg-amber-50/10 dark:bg-amber-950/10' : 'border-ink/12 dark:border-bg/12',
                  topic.status === 'mastered' && 'opacity-60'
                )}
              >
                {/* Status indicator */}
                <div className={cn('mono text-xs font-bold w-20 text-center flex-shrink-0', meta.color)}>
                  {meta.label}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {subject && (
                      <span className="mono text-[0.6rem] px-1.5 py-0.5" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                        {subject.code}
                      </span>
                    )}
                    {topic.difficulty && (
                      <span className={cn('mono text-[0.6rem]',
                        topic.difficulty === 'hard' ? 'text-rose-500' :
                        topic.difficulty === 'moderate' ? 'text-amber-500' : 'text-emerald-500'
                      )}>
                        {topic.difficulty}
                      </span>
                    )}
                    {isDueToday && (
                      <span className="mono text-[0.6rem] text-amber-600 dark:text-amber-400 font-bold">DUE</span>
                    )}
                  </div>
                  <p className={cn('text-sm font-semibold', topic.status === 'mastered' ? 'line-through text-ink/40 dark:text-bg/40' : 'text-ink dark:text-bg')}>
                    {topic.title}
                  </p>
                  {topic.nextRevisionDue && topic.status !== 'mastered' && (
                    <p className="text-xs text-ink/40 dark:text-bg/40 mt-0.5">
                      Next revision: {new Date(topic.nextRevisionDue + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {canAdvance && (
                    <button
                      onClick={() => advanceStatus(topic)}
                      className="flex items-center gap-1 mono text-xs px-2 py-1 border-[1.5px] border-ink/20 dark:border-bg/20 text-ink/60 dark:text-bg/60 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      title={`Advance to: ${meta.next ? STATUS_META[meta.next].label : ''}`}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                      {meta.next ? STATUS_META[meta.next].label : ''}
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingTopic(topic); setShowForm(true); }}
                    className="p-1.5 text-ink/20 dark:text-bg/20 hover:text-ink dark:hover:text-bg"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this topic?')) deleteRevisionTopic(topic.id); }}
                    className="p-1.5 text-ink/20 dark:text-bg/20 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <TopicFormModal
          topic={editingTopic || undefined}
          onClose={() => { setShowForm(false); setEditingTopic(null); }}
        />
      )}
    </div>
  );
};
