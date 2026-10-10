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
  Clock,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  Users,
  Send,
  Search,
  RefreshCw,
  Download,
  UserCheck,
  UserPlus,
  Database
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { rosterService, AuthorizedStudent } from '../../lib/authorizedRoster';

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
    timetableSlots,
    deleteTimetableSlot,
    setIsCreateSubjectModalOpen,
    exportData,
    isSupabaseConnected
  } = useTasks();

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'notices' | 'tasks' | 'roster' | 'subjects' | 'security'>('notices');
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAuthorName, setAnnAuthorName] = useState('Super Admin (Dhirubhai Ambani University)');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  // Student Roster State
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterList, setRosterList] = useState<AuthorizedStudent[]>(() => rosterService.getRoster());
  const [registeredUsersCount, setRegisteredUsersCount] = useState<number>(() => rosterService.getRegisteredStudents().length);

  // Add New Student Form State
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [studentActionSuccess, setStudentActionSuccess] = useState('');
  const [studentActionError, setStudentActionError] = useState('');

  if (!isUnlockAdminModalOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const username = adminUsernameInput.trim().toLowerCase();
    const pass = adminPasswordInput.trim();

    if ((username === 'admin' || username === 'iamcr') && (pass === 'mscit2026' || pass === 'admin' || pass === 'iamcr')) {
      const res = await loginAdmin('mscit2026');
      setIsLoading(false);
      if (res.success) {
        setAdminUsernameInput('');
        setAdminPasswordInput('');
      } else {
        setErrorMsg(res.message || 'Authentication failed');
      }
    } else {
      setIsLoading(false);
      setErrorMsg('Invalid Credentials. Username: admin | Password: mscit2026');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    await createAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      authorName: annAuthorName.trim() || 'Super Admin',
      authorRole: 'Dhirubhai Ambani University Admin',
      priority: annPriority
    }, 'iamcr');

    setAnnTitle('');
    setAnnContent('');
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentActionSuccess('');
    setStudentActionError('');

    if (!newStudentId.trim() || !newStudentName.trim()) {
      setStudentActionError('Roll Number and Full Name are required.');
      return;
    }

    const added = rosterService.addAuthorizedStudent(newStudentId.trim(), newStudentName.trim());
    if (added) {
      setRosterList(rosterService.getRoster());
      setStudentActionSuccess(`Student ${newStudentName.trim()} (${newStudentId.trim().toUpperCase()}) added to roster.`);
      setNewStudentId('');
      setNewStudentName('');
    } else {
      setStudentActionError(`Student ID "${newStudentId.trim().toUpperCase()}" already exists in roster.`);
    }
  };

  const handleDeleteStudent = (studentId: string, name: string) => {
    if (confirm(`Remove student ${name} (${studentId}) from authorized roster?`)) {
      rosterService.deleteAuthorizedStudent(studentId);
      setRosterList(rosterService.getRoster());
      setRegisteredUsersCount(rosterService.getRegisteredStudents().length);
    }
  };

  const handleResetStudent = (studentId: string, name: string) => {
    if (confirm(`Reset registration status and password for ${name} (${studentId})?`)) {
      rosterService.resetStudentRegistration(studentId);
      setRosterList(rosterService.getRoster());
      setRegisteredUsersCount(rosterService.getRegisteredStudents().length);
    }
  };

  const filteredRoster = rosterList.filter(
    s =>
      s.studentId.toLowerCase().includes(rosterSearch.toLowerCase().trim()) ||
      s.fullName.toLowerCase().includes(rosterSearch.toLowerCase().trim())
  );

  return (
    <div
      id="admin-portal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setIsUnlockAdminModalOpen(false)}
    >
      <div
        id="admin-portal-modal-content"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5 sm:p-6 bg-[var(--bg-card-subtle)]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isAdmin ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'}`}>
              {isAdmin ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-extrabold text-[var(--text-main)]">
                  {isAdmin ? 'Dhirubhai Ambani University — Super Admin Panel' : 'Super Admin Portal Verification'}
                </h2>
                {isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/20">
                    🟢 Super Admin Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {isAdmin
                  ? 'Master controls for student roster, class notices, timetable, and task moderation'
                  : 'Enter Super Admin credentials (username: admin) to unlock control panel'}
              </p>
            </div>
          </div>
          <button
            id="close-admin-portal-modal-btn"
            onClick={() => setIsUnlockAdminModalOpen(false)}
            className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Not Authenticated / Login Form View */}
        {!isAdmin ? (
          <div className="p-5 sm:p-8 space-y-6 overflow-y-auto">
            <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
              <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Dhirubhai Ambani University — Master Admin Portal</p>
                <p className="text-indigo-600 dark:text-indigo-300 leading-relaxed font-mono">
                  Default Credentials: Username: <strong className="bg-white/20 px-1 rounded text-white">admin</strong> | Password: <strong className="bg-white/20 px-1 rounded text-white">mscit2026</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Admin Username *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={adminUsernameInput}
                  onChange={e => setAdminUsernameInput(e.target.value)}
                  placeholder="Enter username (e.g. admin)"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] px-4 py-2.5 text-xs font-mono font-semibold text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Admin Password *
                </label>
                <input
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={e => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter password (e.g. mscit2026)"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] px-4 py-2.5 text-xs font-mono font-semibold text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl gradient-brand-bg text-white py-3 text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Unlock className="h-4 w-4" />
                <span>{isLoading ? 'Authenticating...' : 'Unlock Super Admin Panel'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Super Admin Management Tabs */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs Navigation Bar */}
            <div className="flex items-center border-b border-[var(--border-subtle)] px-6 bg-[var(--bg-card-subtle)] overflow-x-auto gap-1">
              <button
                onClick={() => setActiveTab('notices')}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'notices'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Megaphone className="h-3.5 w-3.5" />
                <span>Class Notices ({announcements.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('roster')}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'roster'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Student Roster ({rosterList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Moderate Tasks ({tasks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('subjects')}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'subjects'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Manage Subjects ({subjects.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'security'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Security & Backup</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* TAB 1: Class Notices */}
              {activeTab === 'notices' && (
                <div className="space-y-6">
                  {/* Post New Announcement */}
                  <form onSubmit={handleCreateAnnouncement} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Broadcast Official Notice to MSc IT Batch
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-semibold text-[var(--text-muted)]">Urgency:</label>
                        <select
                          value={annPriority}
                          onChange={e => setAnnPriority(e.target.value as 'normal' | 'urgent')}
                          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-bold focus:outline-none"
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
                      placeholder="Notice Title (e.g. Dhirubhai Ambani University Mid-Term Schedule)"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-main)] focus:border-indigo-500 focus:outline-none"
                    />

                    <textarea
                      required
                      rows={3}
                      value={annContent}
                      onChange={e => setAnnContent(e.target.value)}
                      placeholder="Write notice details for all 125 MSc IT students..."
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs text-[var(--text-main)] focus:border-indigo-500 focus:outline-none resize-none"
                    />

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <input
                        type="text"
                        value={annAuthorName}
                        onChange={e => setAnnAuthorName(e.target.value)}
                        placeholder="Author Signature"
                        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text-muted)] w-64"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-xl gradient-brand-bg text-white px-4 py-2 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Publish Notice</span>
                      </button>
                    </div>
                  </form>

                  {/* Active Announcements List */}
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                      Active Class Notices ({announcements.length})
                    </h4>
                    {announcements.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] italic">No class notices posted yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {announcements.map(ann => (
                          <div
                            key={ann.id}
                            className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                              ann.priority === 'urgent'
                                ? 'bg-rose-500/10 border-rose-500/30'
                                : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)]'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                                  ann.priority === 'urgent'
                                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                                }`}>
                                  {ann.priority === 'urgent' ? '🔴 Urgent Notice' : '📢 Notice'}
                                </span>
                                <h4 className="text-xs font-bold text-[var(--text-main)]">{ann.title}</h4>
                              </div>
                              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{ann.content}</p>
                              <p className="text-[10px] text-[var(--text-faint)] pt-1">
                                Posted by <strong>{ann.authorName}</strong> ({ann.authorRole}) • {new Date(ann.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            <button
                              onClick={() => deleteAnnouncement(ann.id)}
                              title="Delete Notice"
                              className="text-[var(--text-muted)] hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
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

              {/* TAB 2: Student Roster Manager (125 Students) */}
              {activeTab === 'roster' && (
                <div className="space-y-6">
                  {/* Summary Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">Total Authorized Roster</span>
                      <p className="font-mono text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{rosterList.length}</p>
                      <span className="text-[0.65rem] text-[var(--text-faint)]">MSc IT Batch Students</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">Registered Accounts</span>
                      <p className="font-mono text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{registeredUsersCount}</p>
                      <span className="text-[0.65rem] text-[var(--text-faint)]">Active Portal Users</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">Registration Passcode</span>
                      <p className="font-mono text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-1.5">MSCIT2026</p>
                      <span className="text-[0.65rem] text-[var(--text-faint)]">Batch Passkey</span>
                    </div>
                  </div>

                  {/* Add New Student Form */}
                  <form onSubmit={handleAddStudent} className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-bold text-xs text-[var(--text-main)]">Add Student to Dhirubhai Ambani University Roster</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={newStudentId}
                        onChange={e => setNewStudentId(e.target.value)}
                        placeholder="Student ID / Roll No (e.g. 202612046)"
                        className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono font-semibold uppercase text-[var(--text-main)] focus:outline-none"
                      />

                      <input
                        type="text"
                        required
                        value={newStudentName}
                        onChange={e => setNewStudentName(e.target.value)}
                        placeholder="Authorized Student Full Name"
                        className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none"
                      />
                    </div>

                    {studentActionSuccess && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{studentActionSuccess}</p>
                    )}
                    {studentActionError && (
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{studentActionError}</p>
                    )}

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-xs hover:scale-105 transition-all cursor-pointer"
                    >
                      + Authorize Student
                    </button>
                  </form>

                  {/* Roster Table */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Authorized Students List ({filteredRoster.length})
                      </h4>

                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-faint)]" />
                        <input
                          type="text"
                          value={rosterSearch}
                          onChange={e => setRosterSearch(e.target.value)}
                          placeholder="Search roll number or student name..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
                      {filteredRoster.map(s => (
                        <div key={s.studentId} className="p-3 bg-[var(--bg-card)] flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px]">
                              {s.studentId}
                            </span>
                            <div>
                              <p className="font-bold text-[var(--text-main)]">{s.fullName}</p>
                              <span className="text-[10px] text-[var(--text-faint)]">
                                Code: {s.registrationCode}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {s.isRegistered ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                Registered
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                Pending Registration
                              </span>
                            )}

                            <button
                              onClick={() => handleResetStudent(s.studentId, s.fullName)}
                              className="px-2 py-1 rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-amber-500 text-[10px] font-semibold"
                              title="Reset Password / Account"
                            >
                              Reset
                            </button>

                            <button
                              onClick={() => handleDeleteStudent(s.studentId, s.fullName)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
                              title="Remove Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Moderate Tasks */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-muted)]">
                      Super Admin override: Moderate, pin, verify, or delete any task across all batch members.
                    </p>
                  </div>

                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              {task.subjectId}
                            </span>
                            <h4 className="text-xs font-bold text-[var(--text-main)] truncate">
                              {task.title}
                            </h4>
                            {task.isPinned && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1 border border-amber-500/20">
                                <Pin className="h-2.5 w-2.5" /> Pinned
                              </span>
                            )}
                            {task.isVerifiedOfficial && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/20">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Official
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-3">
                            <span>Due: <strong>{task.dueDate} {task.dueTime}</strong></span>
                            <span>•</span>
                            <span>Uploaded by: <strong>{task.createdByName || 'Student'} ({task.createdById || '202612045'})</strong></span>
                          </p>
                        </div>

                        {/* Admin Task Action Buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => pinTask(task.id)}
                            title={task.isPinned ? 'Unpin Task' : 'Pin to Top of Dashboard'}
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              task.isPinned
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            <Pin className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{task.isPinned ? 'Pinned' : 'Pin'}</span>
                          </button>

                          <button
                            onClick={() => verifyTask(task.id, 'Official Class Deadline')}
                            title="Toggle Verified Official Status"
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              task.isVerifiedOfficial
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{task.isVerifiedOfficial ? 'Verified' : 'Verify'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Super Admin Action: Delete "${task.title}"?`)) {
                                deleteTask(task.id, 'iamcr');
                              }
                            }}
                            title="Delete Task"
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Manage Subjects & Faculty */}
              {activeTab === 'subjects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-muted)]">
                      Configure Dhirubhai Ambani University core MSc IT subjects and faculty instructors.
                    </p>
                    <button
                      onClick={() => {
                        setIsUnlockAdminModalOpen(false);
                        setIsCreateSubjectModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-brand-bg text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Subject</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects.map(sub => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-bold px-2.5 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: sub.color }}
                          >
                            {sub.code}
                          </span>
                          <span className="text-[10px] text-[var(--text-faint)] font-mono">{sub.id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[var(--text-main)]">{sub.name}</h4>
                        <p className="text-[11px] text-[var(--text-muted)]">Faculty: {sub.professor || sub.teacherName || 'Faculty'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Security & System Backup */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-lg mx-auto py-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                        <Database className="w-4 h-4 text-indigo-500" />
                        Database Status
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isSupabaseConnected
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        {isSupabaseConnected ? 'Supabase Live' : 'Local Storage DB'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Dhirubhai Ambani University shared MSc IT database is synchronized in real-time across all connected batch members.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-3">
                    <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-500" />
                      Data Backup & Export
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Download full JSON backup of portal tasks, subjects, timetable, and announcements.
                    </p>
                    <button
                      onClick={() => {
                        const data = exportData();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `dau_mscit_portal_backup_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="px-4 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      logoutAdmin();
                      setIsUnlockAdminModalOpen(false);
                    }}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
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
