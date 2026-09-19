import React, { useState, useMemo } from 'react';
import { Plus, Search, Pin, Trash2, Edit3, X, StickyNote, Tag } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Note } from '../../types';
import { cn, generateId } from '../../lib/utils';

// ─── Note Form Modal ──────────────────────────────────────────────────────────

interface NoteFormProps {
  note?: Note;
  onClose: () => void;
}

const NoteFormModal: React.FC<NoteFormProps> = ({ note, onClose }) => {
  const { subjects, createNote, updateNote } = useTasks();
  const isEdit = !!note;

  const [form, setForm] = useState({
    title: note?.title || '',
    content: note?.content || '',
    subjectId: note?.subjectId || '',
    isPinned: note?.isPinned || false
  });
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...form, tags, subjectId: form.subjectId || undefined };
    if (isEdit && note) updateNote(note.id, data);
    else createNote(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-bg/30 backdrop-blur-sm">
      <div className="bg-bg dark:bg-ink border-[1.5px] border-ink/20 dark:border-bg/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-ink/10 dark:border-bg/10">
          <h2 className="font-serif text-2xl text-ink dark:text-bg">{isEdit ? 'Edit Note' : 'New Note'}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-ink/50 dark:text-bg/50" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={cn(
                'w-full bg-transparent border-b-[1.5px] py-2 text-sm text-ink dark:text-bg focus:outline-none',
                errors.title ? 'border-rose-500' : 'border-ink/30 dark:border-bg/30 focus:border-ink dark:focus:border-bg'
              )}
              placeholder="Note title..."
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Subject</label>
            <select
              value={form.subjectId}
              onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}
              className="w-full bg-transparent border-b-[1.5px] border-ink/30 dark:border-bg/30 py-2 text-sm text-ink dark:text-bg focus:outline-none"
            >
              <option value="">— No Subject —</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={8}
              className="w-full bg-transparent border-[1.5px] border-ink/20 dark:border-bg/20 p-3 text-sm text-ink dark:text-bg focus:outline-none focus:border-ink dark:focus:border-bg resize-y font-mono"
              placeholder="Write your notes here..."
            />
          </div>

          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 bg-transparent border-b-[1.5px] border-ink/30 dark:border-bg/30 py-1.5 text-xs text-ink dark:text-bg focus:outline-none"
              />
              <button type="button" onClick={addTag} className="mono text-xs text-accent hover:underline px-2">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 mono text-[0.6rem] px-2 py-1 bg-ink/10 dark:bg-bg/10 text-ink/70 dark:text-bg/70">
                    {t}
                    <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="pinNote"
              type="checkbox"
              checked={form.isPinned}
              onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="pinNote" className="text-sm text-ink/70 dark:text-bg/70 flex items-center gap-1">
              <Pin className="h-3.5 w-3.5" /> Pin this note
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="mono text-xs text-ink/50 dark:text-bg/50 px-4 py-2 border-[1.5px] border-ink/20 dark:border-bg/20">Cancel</button>
            <button type="submit" className="mono text-xs bg-ink dark:bg-bg text-bg dark:text-ink px-6 py-2 hover:bg-accent hover:text-white transition-colors">
              {isEdit ? 'Save' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── NotesView ────────────────────────────────────────────────────────────────

export const NotesView: React.FC = () => {
  const { notes, subjects, deleteNote, updateNote } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return notes.filter(note => {
      if (selectedSubjectId !== 'all' && note.subjectId !== selectedSubjectId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!note.title.toLowerCase().includes(q) &&
            !note.content.toLowerCase().includes(q) &&
            !note.tags.some(t => t.includes(q))) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [notes, searchQuery, selectedSubjectId]);

  const pinned = filtered.filter(n => n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  const renderNote = (note: Note) => {
    const subject = subjects.find(s => s.id === note.subjectId);
    const isExpanded = expandedId === note.id;
    return (
      <div key={note.id} className="border-[1.5px] border-ink/15 dark:border-bg/15 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {note.isPinned && <Pin className="h-3.5 w-3.5 text-accent flex-shrink-0" />}
              {subject && (
                <span className="mono text-[0.6rem] px-1.5 py-0.5" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                  {subject.code}
                </span>
              )}
              {note.tags.map(t => (
                <span key={t} className="mono text-[0.6rem] px-1.5 py-0.5 bg-ink/10 dark:bg-bg/10 text-ink/50 dark:text-bg/50">{t}</span>
              ))}
            </div>
            <h3
              className="font-semibold text-sm text-ink dark:text-bg cursor-pointer hover:text-accent"
              onClick={() => setExpandedId(isExpanded ? null : note.id)}
            >
              {note.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
              className={cn('p-1.5', note.isPinned ? 'text-accent' : 'text-ink/30 dark:text-bg/30 hover:text-ink dark:hover:text-bg')}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { setEditingNote(note); setShowForm(true); }} className="p-1.5 text-ink/30 dark:text-bg/30 hover:text-ink dark:hover:text-bg">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { if (confirm('Delete this note?')) deleteNote(note.id); }} className="p-1.5 text-ink/30 dark:text-bg/30 hover:text-rose-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Preview / Expanded */}
        {note.content && (
          <div
            className={cn('text-xs text-ink/60 dark:text-bg/60 font-mono whitespace-pre-wrap cursor-pointer', !isExpanded && 'line-clamp-2')}
            onClick={() => setExpandedId(isExpanded ? null : note.id)}
          >
            {note.content}
          </div>
        )}

        <div className="mt-2 text-[0.6rem] mono text-ink/30 dark:text-bg/30">
          {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="mono text-accent block mb-2">[ NOTES ]</span>
          <h1 className="font-serif text-4xl text-ink dark:text-bg">Study Notes</h1>
          <p className="text-sm text-ink/60 dark:text-bg/60 mt-2">{notes.length} note{notes.length !== 1 ? 's' : ''} saved</p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-ink dark:bg-bg text-bg dark:text-ink mono text-xs px-4 py-2.5 hover:bg-accent hover:text-white transition-colors flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 dark:text-bg/40" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-2 border-[1.5px] border-ink/20 dark:border-bg/20 bg-transparent text-sm text-ink dark:text-bg focus:outline-none focus:border-ink dark:focus:border-bg"
          />
        </div>
        <select
          value={selectedSubjectId}
          onChange={e => setSelectedSubjectId(e.target.value)}
          className="bg-transparent border-[1.5px] border-ink/20 dark:border-bg/20 px-3 py-2 text-sm text-ink dark:text-bg focus:outline-none focus:border-ink dark:focus:border-bg"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
        </select>
      </div>

      {/* Notes */}
      {filtered.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-ink/20 dark:border-bg/20 p-12 text-center">
          <StickyNote className="h-12 w-12 mx-auto mb-4 text-ink/20 dark:text-bg/20" />
          <h3 className="font-serif text-xl text-ink dark:text-bg mb-2">
            {searchQuery || selectedSubjectId !== 'all' ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-sm text-ink/50 dark:text-bg/50 mb-4">
            {searchQuery || selectedSubjectId !== 'all' ? 'Try a different search' : 'Start capturing your study notes.'}
          </p>
          {!searchQuery && selectedSubjectId === 'all' && (
            <button onClick={() => setShowForm(true)} className="mono text-xs bg-ink dark:bg-bg text-bg dark:text-ink px-6 py-2 hover:bg-accent hover:text-white transition-colors">
              + Create First Note
            </button>
          )}
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div>
              <span className="mono text-xs text-accent block mb-3">PINNED</span>
              <div className="space-y-3">{pinned.map(renderNote)}</div>
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <span className="mono text-xs text-ink/50 dark:text-bg/50 block mb-3">ALL NOTES</span>}
              <div className="space-y-3">{unpinned.map(renderNote)}</div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <NoteFormModal
          note={editingNote || undefined}
          onClose={() => { setShowForm(false); setEditingNote(null); }}
        />
      )}
    </div>
  );
};
