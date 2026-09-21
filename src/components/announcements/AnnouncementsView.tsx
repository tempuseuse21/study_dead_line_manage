import React, { useState } from 'react';
import {
  Megaphone,
  ShieldCheck,
  Pin,
  AlertCircle,
  BookOpen,
  CheckCheck,
  Check,
  Plus,
  Trash2,
  Calendar,
  User,
  Filter,
  Search,
  Database,
  Binary,
  MessageSquare,
  Code,
  GitFork,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

interface AnnouncementsViewProps {
  onNavigate?: (view: string) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ onNavigate }) => {
  const {
    announcements,
    subjects,
    createAnnouncement,
    deleteAnnouncement,
    markAnnouncementRead,
    markAllAnnouncementsRead,
    toggleAnnouncementRead,
    unreadAnnouncementsCount
  } = useTasks();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'urgent' | 'pinned'>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostingOpen, setIsPostingOpen] = useState(false);

  // Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annSubjectId, setAnnSubjectId] = useState('all');
  const [annAuthor, setAnnAuthor] = useState(() => localStorage.getItem('cr_poster_name') || '');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');
  const [annIsPinned, setAnnIsPinned] = useState(false);
  const [annPasscode, setAnnPasscode] = useState('');
  const [annAuthorError, setAnnAuthorError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const getSubjectIcon = (code: string) => {
    switch (code) {
      case 'IT615':
        return Database;
      case 'SC612':
        return Binary;
      case 'PC613':
        return MessageSquare;
      case 'IT603':
        return Code;
      case 'IT639':
        return GitFork;
      default:
        return BookOpen;
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnAuthorError('');
    if (!annAuthor.trim()) {
      setAnnAuthorError('Your full name is required to post announcements and prevent false notices.');
      return;
    }
    if (!annPasscode.trim()) {
      setAnnAuthorError('CR authorization passcode is required to post announcements.');
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

      if (!res.success) {
        setAnnAuthorError(res.error || 'Incorrect CR passcode. Posting denied.');
        return;
      }

      setAnnTitle('');
      setAnnContent('');
      setAnnPasscode('');
      setAnnSubjectId('all');
      setAnnPriority('normal');
      setAnnIsPinned(false);
      setPostSuccess(true);
      setTimeout(() => {
        setPostSuccess(false);
        setIsPostingOpen(false);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements
    .filter(ann => {
      // Filter tab
      if (activeFilter === 'unread' && ann.isRead) return false;
      if (activeFilter === 'urgent' && ann.priority !== 'urgent') return false;
      if (activeFilter === 'pinned' && !ann.isPinned) return false;

      // Subject filter
      if (selectedSubjectId !== 'all' && ann.subjectId !== selectedSubjectId) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sub = subjects.find(s => s.id === ann.subjectId);
        const matchTitle = ann.title.toLowerCase().includes(q);
        const matchContent = ann.content.toLowerCase().includes(q);
        const matchSub = sub?.name.toLowerCase().includes(q) || sub?.code.toLowerCase().includes(q);
        const matchAuthor = ann.authorName.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchSub && !matchAuthor) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Unread first
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;
      // Chronological
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border-[1.5px] border-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Megaphone className="h-3.5 w-3.5" />
                CR Official Noticeboard
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-ink-faint dark:bg-ink dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-[1.5px] border-blue-300 dark:border-blue-800">
                <ShieldCheck className="h-3 w-3" />
                Class Representative Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink dark:text-white tracking-tight">
              Class Representative Announcements
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted max-w-2xl">
              Official circulars, exam schedules, lab journal submissions, and verified academic announcements for all 5 core curriculum courses.
            </p>
          </div>

          {/* Unread Counter Badge Card & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2.5 rounded-none border-[1.5px] text-center transition-all ${
              unreadAnnouncementsCount > 0
                ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-300 dark:border-amber-700/60'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
            }`}>
              <div className="text-[10px] font-black uppercase tracking-wider text-ink-muted dark:text-ink-muted">
                Left to Read
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className={`text-xl font-black ${
                  unreadAnnouncementsCount > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {unreadAnnouncementsCount}
                </span>
                <span className="text-xs font-semibold text-ink-muted dark:text-ink-muted">
                  {unreadAnnouncementsCount === 1 ? 'Notice' : 'Notices'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {unreadAnnouncementsCount > 0 && (
                <button
                  id="mark-all-announcements-read-btn"
                  onClick={markAllAnnouncementsRead}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-none text-xs font-bold bg-ink-faint hover:bg-ink-faint dark:bg-ink dark:hover:bg-ink-700 text-ink-muted dark:text-bg border-[1.5px] border-ink-faint dark:border-ink-faint transition-colors"
                  title="Mark all notices as read"
                >
                  <CheckCheck className="h-4 w-4 text-ink dark:text-bg dark:text-blue-400" />
                  <span>Mark All Read</span>
                </button>
              )}

              <button
                id="post-announcement-toggle-btn"
                onClick={() => setIsPostingOpen(prev => !prev)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-none text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-none shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>{isPostingOpen ? 'Close Composer' : '+ Post Notice (CR)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Post Announcement Composer (CR Mode) */}
      {isPostingOpen && (
        <div className="rounded-3xl border-[1.5px] border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 p-5 sm:p-6 shadow-none animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-[1.5px] border-amber-200/60 dark:border-amber-800/60">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-amber-600 text-white">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-ink dark:text-white">
                  Post New Announcement to Class
                </h2>
                <p className="text-[11px] text-ink-muted dark:text-ink-muted">
                  Broadcast verified schedules, deadlines, or instructions to all students
                </p>
              </div>
            </div>
          </div>

          {postSuccess ? (
            <div className="p-4 rounded-none bg-emerald-50 dark:bg-emerald-950/50 border-[1.5px] border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Announcement published successfully! All students notified under verified name {annAuthor}.</span>
            </div>
          ) : (
            <form onSubmit={handlePostSubmit} className="space-y-4">
              {/* Anti-Fraud Notice banner */}
              <div className="p-3.5 rounded-none bg-amber-500/10 border-[1.5px] border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-800 dark:text-amber-300">
                    Verified Identity Required (Anti-False Notice Policy)
                  </span>
                  <span className="text-[11px] text-ink-muted dark:text-ink-muted">
                    To eliminate fake or unauthorized circulars, your full name will be visibly attached to this notice for the whole class.
                  </span>
                </div>
              </div>

              {/* Poster Full Name & Identity Check */}
              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-1">
                  Your Full Name (Person Posting Announcement) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -tranink-y-1/2 h-4 w-4 text-ink-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma (Class Representative, Section A)"
                    value={annAuthor}
                    onChange={e => {
                      setAnnAuthor(e.target.value);
                      if (annAuthorError) setAnnAuthorError('');
                    }}
                    className={`w-full rounded-none border-[1.5px] ${
                      annAuthorError
                        ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                        : 'border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink'
                    } pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-ink dark:text-white placeholder-ink-400 focus:border-amber-500 focus:outline-hidden transition-colors`}
                  />
                </div>
                {annAuthorError && (
                  <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {annAuthorError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-ink-muted dark:text-ink-muted">
                    Announcement Headline / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DBMS (IT615) Lab Journal Submission Deadline Friday 5 PM"
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                    className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-muted dark:text-ink-muted">
                    Subject Scope
                  </label>
                  <select
                    value={annSubjectId}
                    onChange={e => setAnnSubjectId(e.target.value)}
                    className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="all">📢 All 5 Subjects (General Notice)</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-muted dark:text-ink-muted">
                  Full Announcement Content & Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide all essential details, room numbers, deadlines, lab journal requirements, or links for the entire class..."
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-amber-500 focus:outline-none resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-muted dark:text-ink-muted">
                  CR Authorization Passcode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter CR authorization passcode..."
                  value={annPasscode}
                  onChange={e => {
                    setAnnPasscode(e.target.value);
                    if (annAuthorError) setAnnAuthorError('');
                  }}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t-[1.5px] border-amber-200/60 dark:border-amber-800/60">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer text-ink-muted dark:text-ink-muted">
                    <input
                      type="checkbox"
                      checked={annIsPinned}
                      onChange={e => setAnnIsPinned(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <Pin className="h-3.5 w-3.5 text-amber-500" />
                    <span>Pin to top of board</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-ink-muted dark:text-ink-muted">
                    <input
                      type="checkbox"
                      checked={annPriority === 'urgent'}
                      onChange={e => setAnnPriority(e.target.checked ? 'urgent' : 'normal')}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                    <span>Mark as Urgent Notice</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPostingOpen(false)}
                    className="px-4 py-2 rounded-none text-xs font-semibold text-ink-muted dark:text-ink-muted hover:bg-ink-faint/60 dark:hover:bg-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !annAuthor.trim() || !annTitle.trim() || !annContent.trim() || !annPasscode.trim()}
                    className="px-5 py-2 rounded-none text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-none disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Verified Announcement'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -tranink-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search announcements, subjects, instructions..."
            className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink pl-10 pr-4 py-2.5 text-xs text-ink dark:text-white placeholder-ink-400 focus:border-blue-500 focus:outline-none shadow-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-ink text-white dark:bg-bg dark:text-ink shadow-none'
                : 'bg-bg dark:bg-ink text-ink-muted dark:text-ink-muted border-[1.5px] border-ink-faint dark:border-ink-faint hover:bg-ink-faint dark:hover:bg-ink'
            }`}
          >
            All ({announcements.length})
          </button>

          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'unread'
                ? 'bg-amber-600 text-white shadow-none'
                : 'bg-bg dark:bg-ink text-amber-700 dark:text-amber-400 border-[1.5px] border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Unread ({unreadAnnouncementsCount} left)</span>
          </button>

          <button
            onClick={() => setActiveFilter('pinned')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold flex items-center gap-1 transition-all ${
              activeFilter === 'pinned'
                ? 'bg-amber-500 text-white shadow-none'
                : 'bg-bg dark:bg-ink text-ink-muted dark:text-ink-muted border-[1.5px] border-ink-faint dark:border-ink-faint hover:bg-ink-faint dark:hover:bg-ink'
            }`}
          >
            <Pin className="h-3 w-3" />
            <span>Pinned</span>
          </button>

          <button
            onClick={() => setActiveFilter('urgent')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold flex items-center gap-1 transition-all ${
              activeFilter === 'urgent'
                ? 'bg-rose-600 text-white shadow-none'
                : 'bg-bg dark:bg-ink text-rose-600 dark:text-rose-400 border-[1.5px] border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertCircle className="h-3 w-3" />
            <span>Urgent</span>
          </button>
        </div>
      </div>

      {/* 4. Subject Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mr-1 whitespace-nowrap">
          Course Scope:
        </span>
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3 py-1 rounded-none font-semibold whitespace-nowrap transition-colors ${
            selectedSubjectId === 'all'
              ? 'bg-ink dark:bg-ink-faint text-bg dark:text-ink text-white'
              : 'bg-ink-faint dark:bg-ink/80 text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink-700'
          }`}
        >
          All 5 Subjects
        </button>
        {subjects.map(sub => {
          const isSelected = selectedSubjectId === sub.id;
          const SubIcon = getSubjectIcon(sub.code);
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-none font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'text-white shadow-none'
                  : 'bg-ink-faint dark:bg-ink/80 text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink-700'
              }`}
              style={isSelected ? { backgroundColor: sub.color } : {}}
            >
              <SubIcon className="h-3 w-3" />
              <span>{sub.code}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-ink-faint dark:bg-ink text-ink-muted mx-auto">
            <Megaphone className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-ink dark:text-bg">
            {activeFilter === 'unread'
              ? 'All caught up! No unread announcements.'
              : 'No announcements matching filter'}
          </h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            {activeFilter === 'unread'
              ? 'You have read all official notices posted by the Class Representative.'
              : 'Try clearing your search query or switching subject scopes to see other circulars.'}
          </p>
          {activeFilter !== 'all' && (
            <button
              onClick={() => {
                setActiveFilter('all');
                setSelectedSubjectId('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-none text-xs font-bold text-ink dark:text-bg dark:text-blue-400 hover:underline"
            >
              Show All Announcements
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredAnnouncements.map(ann => {
            const subject = subjects.find(s => s.id === ann.subjectId);
            const SubIcon = subject ? getSubjectIcon(subject.code) : BookOpen;
            const isUrgent = ann.priority === 'urgent';
            const isUnread = !ann.isRead;

            return (
              <div
                key={ann.id}
                id={`announcement-card-${ann.id}`}
                className={`group relative rounded-3xl border-[1.5px] p-5 sm:p-6 transition-all flex flex-col justify-between ${
                  isUnread
                    ? 'border-amber-300 dark:border-amber-600/70 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/25 dark:to-ink-900 shadow-none'
                    : 'border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink/90 hover:border-ink-faint dark:hover:border-ink-faint'
                }`}
              >
                <div>
                  {/* Top Metadata Row: Status, Subject, Urgency, Date */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Unread / Read Indicator Pill */}
                      <button
                        onClick={() => toggleAnnouncementRead(ann.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all ${
                          isUnread
                            ? 'bg-amber-500 text-white shadow-none'
                            : 'bg-ink-faint dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-ink-faint'
                        }`}
                        title={isUnread ? 'Click to mark as read' : 'Click to mark as unread'}
                      >
                        {isUnread ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-bg animate-pulse" />
                            <span>UNREAD</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span>Read</span>
                          </>
                        )}
                      </button>

                      {ann.isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300 border-[1.5px] border-amber-300 dark:border-amber-800">
                          <Pin className="h-3 w-3 fill-amber-500" />
                          PINNED
                        </span>
                      )}

                      {subject ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: subject.color }}
                        >
                          <SubIcon className="h-3 w-3" />
                          <span>{subject.code}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-ink-faint dark:bg-ink px-2 py-0.5 text-[10px] font-bold text-ink-muted dark:text-ink-muted border-[1.5px] border-ink-faint dark:border-ink-faint">
                          <BookOpen className="h-3 w-3" />
                          All 5 Subjects
                        </span>
                      )}

                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:text-rose-300 border-[1.5px] border-rose-200 dark:border-rose-800">
                          <AlertCircle className="h-3 w-3" />
                          URGENT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-ink-muted font-medium">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(ann.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Announcement Title */}
                  <h3
                    onClick={() => {
                      if (isUnread) markAnnouncementRead(ann.id);
                    }}
                    className={`text-sm sm:text-base font-bold leading-snug mb-2.5 cursor-pointer ${
                      isUnread
                        ? 'text-ink dark:text-white font-black'
                        : 'text-ink dark:text-bg'
                    }`}
                  >
                    {ann.title}
                  </h3>

                  {/* Announcement Body Content */}
                  <p className="text-xs text-ink-muted dark:text-ink-muted leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                {/* Footer: Author Info & Mark as Read Toggle & Delete */}
                <div className="mt-5 pt-3.5 border-t-[1.5px] border-ink-faint dark:border-ink-faint/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-ink dark:text-bg leading-tight">
                        {ann.authorName}
                      </span>
                      <span className="text-[9px] text-ink-muted font-medium">
                        Class Representative • Verified Notice
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleAnnouncementRead(ann.id)}
                      className={`px-2.5 py-1 rounded-none text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                        isUnread
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200'
                          : 'text-ink-muted hover:text-ink-muted dark:hover:text-bg'
                      }`}
                    >
                      {isUnread ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Mark Read</span>
                        </>
                      ) : (
                        <span>Mark Unread</span>
                      )}
                    </button>

                    <button
                      onClick={async () => {
                        const passcode = prompt('Enter CR Authorization Passcode:');
                        if (passcode !== null) {
                          const res = await deleteAnnouncement(ann.id, passcode);
                          if (!res.success) {
                            alert(res.error);
                          }
                        }
                      }}
                      className="p-1.5 rounded-none text-ink-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete notice"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
