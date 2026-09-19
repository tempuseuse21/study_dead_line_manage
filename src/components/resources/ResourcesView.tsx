import React, { useState, useMemo } from 'react';
import { Plus, Search, ExternalLink, Trash2, Edit3, X, Library, Youtube, FileText, Globe, HardDrive, BookOpen } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Resource, ResourceType } from '../../types';
import { cn } from '../../lib/utils';

const RESOURCE_TYPE_META: Record<ResourceType, { label: string; icon: React.ReactNode; color: string }> = {
  pdf: { label: 'PDF', icon: <FileText className="h-4 w-4" />, color: 'text-rose-600 dark:text-rose-400' },
  youtube: { label: 'YouTube', icon: <Youtube className="h-4 w-4" />, color: 'text-red-600 dark:text-red-400' },
  website: { label: 'Website', icon: <Globe className="h-4 w-4" />, color: 'text-blue-600 dark:text-blue-400' },
  notes: { label: 'Notes', icon: <BookOpen className="h-4 w-4" />, color: 'text-amber-600 dark:text-amber-400' },
  drive: { label: 'Drive', icon: <HardDrive className="h-4 w-4" />, color: 'text-indigo-600 dark:text-indigo-400' },
  other: { label: 'Other', icon: <ExternalLink className="h-4 w-4" />, color: 'text-ink/50 dark:text-bg/50' }
};

// ─── Resource Form ────────────────────────────────────────────────────────────

interface ResourceFormProps {
  resource?: Resource;
  onClose: () => void;
}

const ResourceFormModal: React.FC<ResourceFormProps> = ({ resource, onClose }) => {
  const { subjects, createResource, updateResource } = useTasks();
  const isEdit = !!resource;

  const [form, setForm] = useState({
    title: resource?.title || '',
    url: resource?.url || '',
    type: resource?.type || 'website' as ResourceType,
    subjectId: resource?.subjectId || '',
    topic: resource?.topic || '',
    notes: resource?.notes || ''
  });
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(resource?.tags || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.url && !form.url.startsWith('http')) e.url = 'Must be a valid URL starting with http(s)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...form, tags, subjectId: form.subjectId || undefined };
    if (isEdit && resource) updateResource(resource.id, data);
    else createResource(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-bg/30 backdrop-blur-sm">
      <div className="bg-bg dark:bg-ink border-[1.5px] border-ink/20 dark:border-bg/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-ink/10 dark:border-bg/10">
          <h2 className="font-serif text-2xl text-ink dark:text-bg">{isEdit ? 'Edit Resource' : 'Add Resource'}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-ink/50 dark:text-bg/50" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={cn('w-full bg-transparent border-b-[1.5px] py-2 text-sm text-ink dark:text-bg focus:outline-none', errors.title ? 'border-rose-500' : 'border-ink/30 dark:border-bg/30 focus:border-ink dark:focus:border-bg')}
              placeholder="DBMS Lecture Slides"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as ResourceType }))}
                className="w-full bg-transparent border-b-[1.5px] border-ink/30 dark:border-bg/30 py-2 text-sm text-ink dark:text-bg focus:outline-none"
              >
                {Object.entries(RESOURCE_TYPE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
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
          </div>

          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">URL</label>
            <input
              value={form.url}
              onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
              className={cn('w-full bg-transparent border-b-[1.5px] py-2 text-sm text-ink dark:text-bg focus:outline-none', errors.url ? 'border-rose-500' : 'border-ink/30 dark:border-bg/30 focus:border-ink dark:focus:border-bg')}
              placeholder="https://..."
            />
            {errors.url && <p className="text-xs text-rose-500 mt-1">{errors.url}</p>}
          </div>

          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-1">Topic / Chapter</label>
            <input
              value={form.topic}
              onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
              className="w-full bg-transparent border-b-[1.5px] border-ink/30 dark:border-bg/30 py-2 text-sm text-ink dark:text-bg focus:outline-none"
              placeholder="e.g., Normalization"
            />
          </div>

          <div>
            <label className="mono text-xs text-ink/60 dark:text-bg/60 block mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="tag..."
                className="flex-1 bg-transparent border-b-[1.5px] border-ink/30 dark:border-bg/30 py-1 text-xs text-ink dark:text-bg focus:outline-none"
              />
              <button type="button" onClick={addTag} className="mono text-xs text-accent hover:underline px-2">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 mono text-[0.6rem] px-2 py-0.5 bg-ink/10 dark:bg-bg/10">
                    {t}
                    <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))}><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

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
              {isEdit ? 'Save' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── ResourcesView ────────────────────────────────────────────────────────────

export const ResourcesView: React.FC = () => {
  const { resources, subjects, deleteResource } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  const filtered = useMemo(() => {
    return resources.filter(r => {
      if (selectedSubjectId !== 'all' && r.subjectId !== selectedSubjectId) return false;
      if (selectedType !== 'all' && r.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!r.title.toLowerCase().includes(q) &&
            !r.topic?.toLowerCase().includes(q) &&
            !r.tags.some(t => t.includes(q))) return false;
      }
      return true;
    });
  }, [resources, searchQuery, selectedType, selectedSubjectId]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="mono text-accent block mb-2">[ RESOURCES ]</span>
          <h1 className="font-serif text-4xl text-ink dark:text-bg">Resource Library</h1>
          <p className="text-sm text-ink/60 dark:text-bg/60 mt-2">
            {resources.length} saved resource{resources.length !== 1 ? 's' : ''} — PDFs, videos, links, and notes
          </p>
        </div>
        <button
          onClick={() => { setEditingResource(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-ink dark:bg-bg text-bg dark:text-ink mono text-xs px-4 py-2.5 hover:bg-accent hover:text-white transition-colors flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 dark:text-bg/40" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-9 pr-3 py-2 border-[1.5px] border-ink/20 dark:border-bg/20 bg-transparent text-sm text-ink dark:text-bg focus:outline-none focus:border-ink dark:focus:border-bg"
          />
        </div>
        <select
          value={selectedSubjectId}
          onChange={e => setSelectedSubjectId(e.target.value)}
          className="bg-transparent border-[1.5px] border-ink/20 dark:border-bg/20 px-3 py-2 text-sm text-ink dark:text-bg focus:outline-none"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
        </select>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value as ResourceType | 'all')}
          className="bg-transparent border-[1.5px] border-ink/20 dark:border-bg/20 px-3 py-2 text-sm text-ink dark:text-bg focus:outline-none"
        >
          <option value="all">All Types</option>
          {Object.entries(RESOURCE_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Resource Grid */}
      {filtered.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-ink/20 dark:border-bg/20 p-12 text-center">
          <Library className="h-12 w-12 mx-auto mb-4 text-ink/20 dark:text-bg/20" />
          <h3 className="font-serif text-xl text-ink dark:text-bg mb-2">
            {searchQuery || selectedType !== 'all' || selectedSubjectId !== 'all' ? 'No resources found' : 'No resources yet'}
          </h3>
          <p className="text-sm text-ink/50 dark:text-bg/50 mb-4">
            Save links, PDFs, and videos for easy access during study sessions.
          </p>
          {!searchQuery && selectedType === 'all' && selectedSubjectId === 'all' && (
            <button onClick={() => setShowForm(true)} className="mono text-xs bg-ink dark:bg-bg text-bg dark:text-ink px-6 py-2 hover:bg-accent hover:text-white transition-colors">
              + Add First Resource
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(resource => {
            const subject = subjects.find(s => s.id === resource.subjectId);
            const meta = RESOURCE_TYPE_META[resource.type];
            return (
              <div key={resource.id} className="border-[1.5px] border-ink/15 dark:border-bg/15 p-4 group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={cn('flex items-center gap-1.5', meta.color)}>
                    {meta.icon}
                    <span className="mono text-[0.6rem]">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingResource(resource); setShowForm(true); }} className="p-1 text-ink/30 dark:text-bg/30 hover:text-ink dark:hover:text-bg">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (confirm('Delete this resource?')) deleteResource(resource.id); }} className="p-1 text-ink/30 dark:text-bg/30 hover:text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-ink dark:text-bg mb-1 line-clamp-2">{resource.title}</h3>

                {resource.topic && (
                  <p className="text-xs text-ink/50 dark:text-bg/50 mb-2">{resource.topic}</p>
                )}

                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {subject && (
                    <span className="mono text-[0.6rem] px-1.5 py-0.5" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                      {subject.code}
                    </span>
                  )}
                  {resource.tags.slice(0, 2).map(t => (
                    <span key={t} className="mono text-[0.6rem] px-1.5 py-0.5 bg-ink/10 dark:bg-bg/10 text-ink/50 dark:text-bg/50">{t}</span>
                  ))}
                </div>

                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1 mono text-xs text-accent hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ResourceFormModal
          resource={editingResource || undefined}
          onClose={() => { setShowForm(false); setEditingResource(null); }}
        />
      )}
    </div>
  );
};
