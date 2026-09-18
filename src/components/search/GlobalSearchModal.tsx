import React, { useState, useEffect } from 'react';
import { Search, X, CheckSquare, BookOpen, Users, ArrowRight, Clock } from 'lucide-react';
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

  // ⌘K shortcut listener
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-ink/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b-[1.5px] border-ink-faint dark:border-ink-faint px-4 py-3 bg-bg/50 dark:bg-ink-850">
          <Search className="h-5 w-5 text-ink-muted mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search assignments, subjects, topics, tags..."
            className="flex-1 bg-transparent text-sm font-medium text-ink dark:text-white placeholder-ink-400 focus:outline-hidden"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="p-1 rounded-none text-ink-muted hover:text-ink-muted dark:hover:text-bg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {/* Matched Tasks */}
          {matchedTasks.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-2">
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
                    className="flex w-full items-center justify-between p-2.5 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg/50 dark:bg-ink/30 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckSquare className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-ink dark:text-white truncate">{t.title}</p>
                        <p className="text-[10px] text-ink-muted">Due {t.dueDate} • {t.progress}% done</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-muted flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Subjects */}
          {matchedSubjects.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-2">
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
                    className="flex w-full items-center justify-between p-2.5 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg/50 dark:bg-ink/30 hover:bg-ink-faint text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <div className="truncate">
                        <p className="font-bold text-ink dark:text-white truncate">{s.name}</p>
                        <p className="text-[10px] text-ink-muted">{s.code} • {s.professor}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-muted flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedTasks.length === 0 && matchedSubjects.length === 0 && (
            <div className="p-8 text-center text-ink-muted">
              <p>No results matching "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink-850 flex items-center justify-between text-[11px] text-ink-muted">
          <span>Press ESC to exit</span>
          <span>StudySync Quick Search</span>
        </div>
      </div>
    </div>
  );
};
