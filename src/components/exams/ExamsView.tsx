import React, { useState, useMemo } from 'react';
import {
  BookOpen, Plus, Calendar, Target, Trash2, Edit3,
  CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, X, Sparkles, GraduationCap
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Exam, ExamTopic } from '../../types';
import { cn, daysBetween, getTodayStr, generateId } from '../../lib/utils';

interface ExamFormProps {
  exam?: Exam;
  onClose: () => void;
}

const ExamFormModal: React.FC<ExamFormProps> = ({ exam, onClose }) => {
  const { subjects, createExam, updateExam } = useTasks();
  const isEdit = !!exam;

  const [form, setForm] = useState({
    title: exam?.title || '',
    subjectId: exam?.subjectId || subjects[0]?.id || '',
    examDate: exam?.examDate || getTodayStr(),
    examTime: exam?.examTime || '10:00',
    venue: exam?.venue || '',
    difficulty: exam?.difficulty || 'moderate' as Exam['difficulty'],
    preparationPercent: exam?.preparationPercent ?? 0,
    targetScore: exam?.targetScore || 75,
    notes: exam?.notes || ''
  });

  const [topics, setTopics] = useState<ExamTopic[]>(exam?.topics || []);
  const [newTopic, setNewTopic] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTopic = () => {
    const t = newTopic.trim();
    if (!t) return;
    setTopics(prev => [...prev, { id: generateId('tp'), title: t, isLearned: false }]);
    setNewTopic('');
  };

  const toggleTopic = (id: string) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, isLearned: !t.isLearned } : t));
  };

  const removeTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.examDate) e.examDate = 'Exam date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...form, topics };
    if (isEdit && exam) {
      updateExam(exam.id, data);
    } else {
      createExam(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] w-full max-w-xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-display font-bold text-lg text-[var(--text-main)]">{isEdit ? 'Edit Exam' : 'Schedule New Exam'}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Exam Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={cn(
                'w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border text-sm text-[var(--text-main)] focus:outline-none',
                errors.title ? 'border-rose-500' : 'border-[var(--border-subtle)] focus:border-indigo-500'
              )}
              placeholder="e.g. DBMS Final Semester Exam"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Subject</label>
              <select
                value={form.subjectId}
                onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={e => setForm(p => ({ ...p, difficulty: e.target.value as Exam['difficulty'] }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
                <option value="very_hard">Very Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Exam Date *</label>
              <input
                type="date"
                value={form.examDate}
                onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))}
                className={cn(
                  'w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border text-sm text-[var(--text-main)] focus:outline-none',
                  errors.examDate ? 'border-rose-500' : 'border-[var(--border-subtle)] focus:border-indigo-500'
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Time</label>
              <input
                type="time"
                value={form.examTime}
                onChange={e => setForm(p => ({ ...p, examTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Preparation %</label>
              <input
                type="number"
                min={0} max={100}
                value={form.preparationPercent}
                onChange={e => setForm(p => ({ ...p, preparationPercent: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Target Score %</label>
              <input
                type="number"
                min={0} max={100}
                value={form.targetScore}
                onChange={e => setForm(p => ({ ...p, targetScore: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-mono">Syllabus Topics</label>
            <div className="flex gap-2 mb-2">
              <input
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                placeholder="Add topic title..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none"
              />
              <button type="button" onClick={addTopic} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs">Add</button>
            </div>
            {topics.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {topics.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-[var(--bg-card-subtle)]">
                    <button type="button" onClick={() => toggleTopic(t.id)}>
                      <CheckCircle2 className={cn('w-4 h-4', t.isLearned ? 'text-emerald-500' : 'text-[var(--text-faint)]')} />
                    </button>
                    <span className={cn('flex-1', t.isLearned ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-main)]')}>
                      {t.title}
                    </span>
                    <button type="button" onClick={() => removeTopic(t.id)}>
                      <X className="w-3.5 h-3.5 text-[var(--text-faint)] hover:text-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl gradient-brand-bg text-white font-semibold text-xs shadow-md">
              {isEdit ? 'Save Changes' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ExamsView: React.FC = () => {
  const { exams, subjects, deleteExam, updateExam } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const todayStr = getTodayStr();

  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => a.examDate.localeCompare(b.examDate));
  }, [exams]);

  const upcoming = sortedExams.filter(e => e.examDate >= todayStr);
  const past = sortedExams.filter(e => e.examDate < todayStr);

  const difficultyColors: Record<string, string> = {
    easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    moderate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    hard: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    very_hard: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
  };

  const renderExamCard = (exam: Exam) => {
    const subject = subjects.find(s => s.id === exam.subjectId);
    const daysLeft = daysBetween(todayStr, exam.examDate);
    const isPast = daysLeft < 0;
    const isExpanded = expandedId === exam.id;
    const learnedCount = exam.topics.filter(t => t.isLearned).length;

    return (
      <div key={exam.id} className={cn('rounded-2xl border transition-all bg-[var(--bg-card)]', isPast ? 'border-[var(--border-subtle)] opacity-60' : 'border-[var(--border-subtle)] hover:border-indigo-500/40 shadow-xs')}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {subject && (
                  <span
                    className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                  >
                    {subject.code}
                  </span>
                )}
                {exam.difficulty && (
                  <span className={cn('text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md', difficultyColors[exam.difficulty])}>
                    {exam.difficulty.replace('_', ' ').toUpperCase()}
                  </span>
                )}
                {!isPast && (
                  <span className={cn(
                    'text-[0.65rem] font-bold font-mono px-2.5 py-0.5 rounded-md',
                    daysLeft === 0 ? 'bg-rose-500 text-white animate-pulse' :
                    daysLeft <= 3 ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  )}>
                    {daysLeft === 0 ? 'EXAM TODAY' : `${daysLeft} Days Left`}
                  </span>
                )}
              </div>

              <h3 className="font-display font-semibold text-base text-[var(--text-main)] mb-1">{exam.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                  {exam.examDate} {exam.examTime && `at ${exam.examTime}`}
                </span>
                {exam.venue && <span>📍 {exam.venue}</span>}
                {exam.targetScore && (
                  <span className="flex items-center gap-1 font-mono">
                    <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Target: {exam.targetScore}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { setEditingExam(exam); setShowForm(true); }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => { if (confirm(`Delete "${exam.title}"?`)) deleteExam(exam.id); }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setExpandedId(isExpanded ? null : exam.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)]">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Preparation Level</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{exam.preparationPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${exam.preparationPercent}%` }}
              />
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-[var(--border-subtle)] p-5 space-y-3 bg-[var(--bg-card-subtle)]/50 rounded-b-2xl">
            {exam.topics.length > 0 ? (
              <div>
                <span className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase mb-2">
                  Syllabus Topics ({learnedCount}/{exam.topics.length} Mastered)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {exam.topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        const updated = exam.topics.map(t =>
                          t.id === topic.id ? { ...t, isLearned: !t.isLearned } : t
                        );
                        const learned = updated.filter(t => t.isLearned).length;
                        const prep = updated.length > 0 ? Math.round((learned / updated.length) * 100) : 0;
                        updateExam(exam.id, { topics: updated, preparationPercent: prep });
                      }}
                      className="flex items-center gap-2 text-xs p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/30 text-left transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className={cn('w-4 h-4 flex-shrink-0', topic.isLearned ? 'text-emerald-500' : 'text-[var(--text-faint)]')} />
                      <span className={cn(topic.isLearned ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-main)]')}>
                        {topic.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-faint)]">No syllabus topics added yet.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
              Exam Schedule & Preparation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Track exam dates, countdowns, target scores, and syllabus readiness.
          </p>
        </div>
        <button
          onClick={() => { setEditingExam(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand-bg text-white font-semibold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Exam</span>
        </button>
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-bold text-sm text-[var(--text-muted)] uppercase tracking-wider font-mono">Upcoming Exams</h2>
          {upcoming.map(renderExamCard)}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-bold text-sm text-[var(--text-muted)] uppercase tracking-wider font-mono">Completed / Past Exams</h2>
          {past.map(renderExamCard)}
        </div>
      )}

      {exams.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-3">
          <BookOpen className="w-10 h-10 text-[var(--text-faint)] mx-auto" />
          <h3 className="font-display font-bold text-base text-[var(--text-main)]">No exams scheduled</h3>
          <p className="text-xs text-[var(--text-muted)]">Add your upcoming midterms and finals to track syllabus prep.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl gradient-brand-bg text-white font-semibold text-xs"
          >
            + Schedule First Exam
          </button>
        </div>
      )}

      {showForm && (
        <ExamFormModal
          exam={editingExam || undefined}
          onClose={() => { setShowForm(false); setEditingExam(null); }}
        />
      )}
    </div>
  );
};
