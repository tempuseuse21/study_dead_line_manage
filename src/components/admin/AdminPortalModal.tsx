import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Megaphone,
  Plus,
  Trash2,
  Pin,
  CheckCircle2,
  BookOpen,
  Calendar,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  Users,
  Send
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export const AdminPortalModal: React.FC = () => {
  const {
    isUnlockAdminModalOpen,
    setIsUnlockAdminModalOpen,
    isAdmin,
    adminRole,
    loginAdmin,
    logoutAdmin,
    announcements,
    createAnnouncement,
    deleteAnnouncement,
    tasks,
    deleteTask,
    pinTask,
    verifyTask,
    subjects,
    setIsCreateSubjectModalOpen
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'notices' | 'tasks' | 'subjects' | 'security'>('notices');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAuthorName, setAnnAuthorName] = useState('Class Representative (CR)');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  // Verify Task Note state
  const [editingVerifyTaskId, setEditingVerifyTaskId] = useState<string | null>(null);
  const [officialNoteInput, setOfficialNoteInput] = useState('');

  if (!isUnlockAdminModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    const res = await loginAdmin(pinInput);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Incorrect PIN');
    } else {
      setPinInput('');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    await createAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      authorName: annAuthorName.trim() || 'Class Representative (CR)',
      authorRole: 'Class Admin',
      priority: annPriority
    }, 'iamcr');

    setAnnTitle('');
    setAnnContent('');
  };

  return (
    <div
      id="admin-portal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsUnlockAdminModalOpen(false)}
    >
      <div
        id="admin-portal-modal-content"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl rounded-[32px] border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-[1.5px] border-ink-faint dark:border-ink-faint p-5 sm:p-6 bg-bg/50 dark:bg-ink-850/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-none ${isAdmin ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-[1.5px] border-emerald-500/20' : 'bg-ink-faint dark:bg-ink0/10 text-ink dark:text-bg dark:text-blue-400 border-[1.5px] border-blue-500/20'}`}>
              {isAdmin ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-ink dark:text-white">
                  {isAdmin ? 'Class Admin & CR Portal' : 'Class Admin Verification'}
                </h2>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border-[1.5px] border-emerald-200 dark:border-emerald-800">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted dark:text-ink-muted">
                {isAdmin
                  ? 'Manage class notices, verify official deadlines, and moderate tasks'
                  : 'Enter the Class Representative PIN to unlock moderation privileges'}
              </p>
            </div>
          </div>
          <button
            id="close-admin-portal-modal-btn"
            onClick={() => setIsUnlockAdminModalOpen(false)}
            className="rounded-full p-2 text-ink-muted hover:bg-ink-faint dark:hover:bg-ink hover:text-ink-muted dark:hover:text-bg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Not Authenticated / PIN Entry View */}
        {!isAdmin ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="rounded-none bg-ink-faint dark:bg-ink dark:bg-blue-950/40 border-[1.5px] border-ink-faint dark:border-ink-faint/60 dark:border-blue-900/60 p-4 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
              <KeyRound className="h-5 w-5 text-ink dark:text-bg flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Open Academic Dashboard for Students</p>
                <p className="text-blue-700 dark:text-blue-400">
                  All students can view deadlines and add academic tasks freely without signing in. Admin mode is reserved for the <strong>Class Representative (CR)</strong> to publish official announcements, verify exam deadlines, and clean up duplicate items.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted mb-1.5">
                  Enter Admin / CR Passcode:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoFocus
                    required
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    placeholder="Enter PIN (Default: admin2026)"
                    className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-3 text-sm font-semibold text-ink dark:text-white placeholder-ink-400 focus:border-blue-500 focus:outline-hidden shadow-inner"
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint py-3 text-xs font-bold text-white shadow-none shadow-blue-500/25 active:scale-95 transition-all"
                >
                  <Unlock className="h-4 w-4" />
                  <span>{isLoading ? 'Verifying...' : 'Unlock Admin Portal'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPinInput('admin2026');
                    loginAdmin('admin2026');
                  }}
                  className="px-4 py-3 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-ink-faint dark:bg-ink hover:bg-ink-faint dark:hover:bg-ink-700 text-xs font-bold text-ink-muted dark:text-ink-muted transition-colors"
                >
                  Use Demo PIN
                </button>
              </div>

              <p className="text-center text-[11px] text-ink-muted">
                Default class passcode: <code className="font-mono font-bold text-ink dark:text-bg dark:text-blue-400 bg-ink-faint dark:bg-ink dark:bg-blue-950 px-1.5 py-0.5 rounded">admin2026</code>
              </p>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Management Tabs */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs Navigation */}
            <div className="flex items-center border-b-[1.5px] border-ink-faint dark:border-ink-faint px-6 bg-bg/80 dark:bg-ink-850/80 overflow-x-auto gap-1">
              <button
                onClick={() => setActiveTab('notices')}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'notices'
                    ? 'border-blue-600 text-ink dark:text-bg dark:text-blue-400'
                    : 'border-transparent text-ink-muted hover:text-ink dark:hover:text-ink-muted'
                }`}
              >
                <Megaphone className="h-3.5 w-3.5" />
                <span>Class Notices & Announcements ({announcements.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'tasks'
                    ? 'border-blue-600 text-ink dark:text-bg dark:text-blue-400'
                    : 'border-transparent text-ink-muted hover:text-ink dark:hover:text-ink-muted'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Moderate Tasks ({tasks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('subjects')}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'subjects'
                    ? 'border-blue-600 text-ink dark:text-bg dark:text-blue-400'
                    : 'border-transparent text-ink-muted hover:text-ink dark:hover:text-ink-muted'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Manage Subjects ({subjects.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-blue-600 text-ink dark:text-bg dark:text-blue-400'
                    : 'border-transparent text-ink-muted hover:text-ink dark:hover:text-ink-muted'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Admin Lock / Exit</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* TAB 1: Class Notices */}
              {activeTab === 'notices' && (
                <div className="space-y-6">
                  {/* Post New Announcement */}
                  <form onSubmit={handleCreateAnnouncement} className="rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink-850 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-ink-muted dark:text-ink-muted flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-ink dark:text-bg" />
                        Broadcast New Class Notice
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-semibold text-ink-muted">Urgency:</label>
                        <select
                          value={annPriority}
                          onChange={e => setAnnPriority(e.target.value as 'normal' | 'urgent')}
                          className="rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-2 py-1 text-[11px] font-bold"
                        >
                          <option value="normal">Normal Announcement</option>
                          <option value="urgent">🔴 Urgent / Critical</option>
                        </select>
                      </div>
                    </div>

                    <input
                      type="text"
                      required
                      value={annTitle}
                      onChange={e => setAnnTitle(e.target.value)}
                      placeholder="Notice Title (e.g. Mid-Term Lab Exam Timetable Released)"
                      className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2 text-xs font-semibold text-ink dark:text-white focus:border-blue-500 focus:outline-hidden"
                    />

                    <textarea
                      required
                      rows={3}
                      value={annContent}
                      onChange={e => setAnnContent(e.target.value)}
                      placeholder="Write message details for the entire class..."
                      className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2 text-xs text-ink dark:text-white focus:border-blue-500 focus:outline-hidden resize-none"
                    />

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <input
                        type="text"
                        value={annAuthorName}
                        onChange={e => setAnnAuthorName(e.target.value)}
                        placeholder="Author (e.g. CR Rahul Sharma / Prof. Sen)"
                        className="rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-1.5 text-xs text-ink-muted dark:text-ink-muted w-64"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint px-4 py-2 text-xs font-bold text-white shadow-none shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Publish to Notice Board</span>
                      </button>
                    </div>
                  </form>

                  {/* Active Announcements List */}
                  <div>
                    <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                      Active Class Notices ({announcements.length})
                    </h4>
                    {announcements.length === 0 ? (
                      <p className="text-xs text-ink-muted italic">No class notices posted yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {announcements.map(ann => (
                          <div
                            key={ann.id}
                            className={`p-4 rounded-none border-[1.5px] flex items-start justify-between gap-4 ${
                              ann.priority === 'urgent'
                                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                                : 'bg-bg dark:bg-ink/60 border-ink-faint/80 dark:border-ink-faint/80'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  ann.priority === 'urgent'
                                    ? 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300'
                                    : 'bg-ink-faint dark:bg-ink dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                }`}>
                                  {ann.priority === 'urgent' ? '🔴 Urgent Notice' : '📢 Notice'}
                                </span>
                                <h4 className="text-xs font-bold text-ink dark:text-white">{ann.title}</h4>
                              </div>
                              <p className="text-xs text-ink-muted dark:text-ink-muted leading-relaxed">{ann.content}</p>
                              <p className="text-[10px] text-ink-muted pt-1">
                                Posted by <strong>{ann.authorName}</strong> ({ann.authorRole}) • {new Date(ann.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            <button
                              onClick={() => deleteAnnouncement(ann.id)}
                              title="Delete Notice"
                              className="text-ink-muted hover:text-rose-500 p-1.5 rounded-none hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Moderate Tasks */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-ink-muted">
                      Pin crucial assignments to the top banner or verify submission requirements.
                    </p>
                  </div>

                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink hover:border-ink-faint dark:hover:border-ink-faint transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {task.subject && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                                style={{ backgroundColor: task.subject.color }}
                              >
                                {task.subject.code}
                              </span>
                            )}
                            <h4 className="text-xs font-bold text-ink dark:text-white truncate">
                              {task.title}
                            </h4>
                            {task.isPinned && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                                <Pin className="h-2.5 w-2.5" /> Pinned
                              </span>
                            )}
                            {task.isVerifiedOfficial && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Official
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-ink-muted flex items-center gap-3">
                            <span>Due: <strong>{task.dueDate} {task.dueTime}</strong></span>
                            <span>•</span>
                            <span>Added by: <strong>{task.createdByName || 'Student'}</strong></span>
                          </p>

                          {task.officialNote && (
                            <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded inline-block">
                              CR Note: {task.officialNote}
                            </p>
                          )}
                        </div>

                        {/* Admin Task Action Buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => pinTask(task.id)}
                            title={task.isPinned ? 'Unpin Task' : 'Pin to Top of Dashboard'}
                            className={`p-2 rounded-none text-xs font-semibold flex items-center gap-1 transition-all ${
                              task.isPinned
                                ? 'bg-amber-500 text-white shadow-none'
                                : 'bg-ink-faint dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-ink-faint'
                            }`}
                          >
                            <Pin className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{task.isPinned ? 'Pinned' : 'Pin'}</span>
                          </button>

                          <button
                            onClick={() => verifyTask(task.id, 'Official Class Deadline')}
                            title="Toggle Verified by CR Status"
                            className={`p-2 rounded-none text-xs font-semibold flex items-center gap-1 transition-all ${
                              task.isVerifiedOfficial
                                ? 'bg-emerald-600 text-white shadow-none'
                                : 'bg-ink-faint dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-ink-faint'
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{task.isVerifiedOfficial ? 'Verified' : 'Verify'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete "${task.title}"?`)) {
                                deleteTask(task.id);
                              }
                            }}
                            title="Delete Task"
                            className="p-2 rounded-none bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Manage Subjects */}
              {activeTab === 'subjects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-ink-muted">
                      Configure semester subjects and course instructors.
                    </p>
                    <button
                      onClick={() => {
                        setIsUnlockAdminModalOpen(false);
                        setIsCreateSubjectModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint text-xs font-bold text-white transition-all shadow-none"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Subject</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects.map(sub => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-bold px-2.5 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: sub.color }}
                          >
                            {sub.code}
                          </span>
                          <span className="text-[10px] text-ink-muted font-mono">{sub.id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-ink dark:text-white">{sub.name}</h4>
                        <p className="text-[11px] text-ink-muted">Instructor: {sub.teacherName || 'Faculty'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Admin Lock / Exit */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-md mx-auto py-4 text-center">
                  <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/60 w-16 h-16 mx-auto flex items-center justify-center text-emerald-600 border-[1.5px] border-emerald-200">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink dark:text-white">Admin Session Active</h3>
                    <p className="text-xs text-ink-muted mt-1">
                      Logged in as <strong>{adminRole}</strong>. You can lock admin mode anytime to return to standard student view.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      logoutAdmin();
                      setIsUnlockAdminModalOpen(false);
                    }}
                    className="w-full py-3 rounded-none bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-none shadow-rose-500/25 active:scale-95 transition-all"
                  >
                    Lock & Exit Admin Mode
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
