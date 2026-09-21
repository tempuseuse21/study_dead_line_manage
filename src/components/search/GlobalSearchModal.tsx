import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  CheckSquare,
  BookOpen,
  Megaphone,
  Calendar,
  FileText,
  Bookmark,
  ArrowRight,
  Sparkles,
  Tag
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

interface GlobalSearchModalProps {
  onNavigate: (view: string) => void;
}

type SearchCategory = 'all' | 'tasks' | 'subjects' | 'announcements' | 'exams' | 'notes';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onNavigate }) => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    tasks,
    subjects,
    announcements,
    exams,
    notes,
    setSelectedTask
  } = useTasks();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard listener for Ctrl+K and ESC
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

  // Auto focus input when opened
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveCategory('all');
    }
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const q = query.toLowerCase().trim();

  // Search logic across all entities
  const matchedTasks = (activeCategory === 'all' || activeCategory === 'tasks')
    ? (q
        ? tasks.filter(
            t =>
              t.title.toLowerCase().includes(q) ||
              t.description?.toLowerCase().includes(q) ||
              t.tags?.some(tag => tag.toLowerCase().includes(q))
          )
        : tasks.slice(0, 5))
    : [];

  const matchedSubjects = (activeCategory === 'all' || activeCategory === 'subjects')
    ? (q
        ? subjects.filter(
            s =>
              s.name.toLowerCase().includes(q) ||
              s.code.toLowerCase().includes(q) ||
              s.teacherName?.toLowerCase().includes(q) ||
              s.professor?.toLowerCase().includes(q)
          )
        : subjects.slice(0, 4))
    : [];

  const matchedAnnouncements = (activeCategory === 'all' || activeCategory === 'announcements')
    ? (q
        ? announcements.filter(
            a =>
              a.title.toLowerCase().includes(q) ||
              a.content.toLowerCase().includes(q) ||
              a.authorName.toLowerCase().includes(q)
          )
        : announcements.slice(0, 3))
    : [];

  const matchedExams = (activeCategory === 'all' || activeCategory === 'exams')
    ? (q
        ? exams.filter(
            e =>
              e.title.toLowerCase().includes(q) ||
              e.notes?.toLowerCase().includes(q) ||
              e.venue?.toLowerCase().includes(q)
          )
        : exams.slice(0, 3))
    : [];

  const matchedNotes = (activeCategory === 'all' || activeCategory === 'notes')
    ? (q
        ? notes.filter(
            n =>
              n.title.toLowerCase().includes(q) ||
              n.content.toLowerCase().includes(q) ||
              n.tags?.some(t => t.toLowerCase().includes(q))
          )
        : notes.slice(0, 3))
    : [];

  const totalResults =
    matchedTasks.length +
    matchedSubjects.length +
    matchedAnnouncements.length +
    matchedExams.length +
    matchedNotes.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsSearchModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-[var(--border-subtle)] px-4 py-3.5 bg-[var(--bg-card-subtle)]">
          <Search className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search assignments, subjects, announcements, exams, notes..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-[var(--text-main)] placeholder-[var(--text-faint)] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="mr-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-x-auto no-scrollbar text-xs">
          {(
            [
              { id: 'all', label: 'All Items' },
              { id: 'tasks', label: `Tasks (${matchedTasks.length})` },
              { id: 'subjects', label: `Subjects (${matchedSubjects.length})` },
              { id: 'announcements', label: `Notices (${matchedAnnouncements.length})` },
              { id: 'exams', label: `Exams (${matchedExams.length})` },
              { id: 'notes', label: `Notes (${matchedNotes.length})` }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as SearchCategory)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Tasks */}
          {matchedTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[var(--text-faint)] flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Assignments & Tasks ({matchedTasks.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {matchedTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTask(t);
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-indigo-500/50 hover:shadow-xs text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-display font-semibold text-xs text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {t.title}
                        </p>
                        <p className="text-[0.65rem] text-[var(--text-muted)] font-mono">
                          Due {t.dueDate} {t.dueTime ? `at ${t.dueTime}` : ''} • Priority: {t.priority.toUpperCase()} • {t.progress}% done
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-faint)] group-hover:text-indigo-500 flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subjects */}
          {matchedSubjects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[var(--text-faint)] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  Academic Subjects ({matchedSubjects.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {matchedSubjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate('subjects');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" style={{ backgroundColor: s.color }} />
                      <div className="truncate">
                        <p className="font-display font-semibold text-xs text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {s.name} ({s.code})
                        </p>
                        <p className="text-[0.65rem] text-[var(--text-muted)] font-mono">
                          Faculty: {s.teacherName || s.professor || 'Department'} • {s.credits || 3} Credits
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-faint)] group-hover:text-emerald-500 flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Announcements / Notices */}
          {matchedAnnouncements.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[var(--text-faint)] flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                  Class Announcements ({matchedAnnouncements.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {matchedAnnouncements.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onNavigate('announcements');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-amber-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-display font-semibold text-xs text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                          {a.title}
                        </p>
                        <p className="text-[0.65rem] text-[var(--text-muted)] font-mono truncate">
                          By {a.authorName} ({a.authorRole}) • {a.content}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-faint)] group-hover:text-amber-500 flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exams */}
          {matchedExams.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[var(--text-faint)] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  Upcoming Exams ({matchedExams.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {matchedExams.map(e => (
                  <button
                    key={e.id}
                    onClick={() => {
                      onNavigate('exams');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-rose-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 flex-shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-display font-semibold text-xs text-[var(--text-main)] group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                          {e.title}
                        </p>
                        <p className="text-[0.65rem] text-[var(--text-muted)] font-mono">
                          Date: {e.examDate} {e.examTime ? `at ${e.examTime}` : ''} • Prep: {e.preparationPercent}%
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-faint)] group-hover:text-rose-500 flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {matchedNotes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[var(--text-faint)] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  Notes & Summaries ({matchedNotes.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {matchedNotes.map(n => (
                  <div
                    key={n.id}
                    className="flex w-full items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-purple-500/50 text-left transition-all"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-display font-semibold text-xs text-[var(--text-main)] truncate">
                          {n.title}
                        </p>
                        <p className="text-[0.65rem] text-[var(--text-muted)] truncate">
                          {n.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalResults === 0 && (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-[var(--text-main)]">
                  No matching results found
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  We couldn't find anything matching "{query}". Try checking for typos or using different keywords.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] flex items-center justify-between text-[0.65rem] font-mono text-[var(--text-faint)]">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] font-semibold">ESC</kbd> to exit</span>
          </div>
          <span className="flex items-center gap-1 text-indigo-500 font-semibold">
            <Sparkles className="w-3 h-3" /> StudySync Instant Search
          </span>
        </div>
      </div>
    </div>
  );
};
