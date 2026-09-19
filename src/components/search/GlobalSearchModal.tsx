import React, { useState, useEffect } from 'react';
import { Search, X, CheckSquare, BookOpen, ArrowRight } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

interface GlobalSearchModalProps {
  onNavigate: (view: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onNavigate }) => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    tasks,
    subjects,
    setSelectedTask
  } = useTasks();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedTasks = q
    ? tasks.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some(tag => tag.toLowerCase().includes(q))
      )
    : tasks.slice(0, 4);

  const matchedSubjects = q
    ? subjects.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.professor?.toLowerCase().includes(q)
      )
    : subjects.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-[var(--border-subtle)] px-4 py-3.5 bg-[var(--bg-card-subtle)]">
          <Search className="w-5 h-5 text-[var(--text-faint)] mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search assignments, subjects, topics, tags..."
            className="flex-1 bg-transparent text-sm font-medium text-[var(--text-main)] placeholder-[var(--text-faint)] focus:outline-none"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="p-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {matchedTasks.length > 0 && (
            <div>
              <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[var(--text-faint)] block mb-2 px-1">
                Assignments & Tasks ({matchedTasks.length})
              </span>
              <div className="space-y-1.5">
                {matchedTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTask(t);
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-indigo-500/40 hover:shadow-xs text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <CheckSquare className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-display font-semibold text-xs text-[var(--text-main)] truncate">{t.title}</p>
                        <p className="text-[0.65rem] text-[var(--text-muted)] font-mono">Due {t.dueDate} • {t.progress}% done</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-faint)] flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedSubjects.length > 0 && (
            <div>
              <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[var(--text-faint)] block mb-2 px-1">
                Subjects ({matchedSubjects.length})
              </span>
              <div className="space-y-1.5">
                {matchedSubjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate('subjects');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-indigo-500/40 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="truncate">
                        <p className="font-display font-semibold text-xs text-[var(--text-main)] truncate">{s.name}</p>
                        <p className="text-[0.65rem] text-[var(--text-muted)] font-mono">{s.code} • {s.professor || 'Faculty'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-faint)] flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedTasks.length === 0 && matchedSubjects.length === 0 && (
            <div className="p-8 text-center text-[var(--text-muted)]">
              <p>No results matching "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] flex items-center justify-between text-[0.65rem] font-mono text-[var(--text-faint)]">
          <span>Press ESC to exit</span>
          <span>StudySync Global Search</span>
        </div>
      </div>
    </div>
  );
};
