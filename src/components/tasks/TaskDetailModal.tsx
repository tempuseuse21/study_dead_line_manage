import React, { useState } from 'react';
import {
  X,
  Clock,
  Plus,
  Trash2,
  Paperclip,
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  Send,
  Download,
  FileText,
  BookOpen,
  Database,
  Binary,
  Code,
  GitFork,
  User,
  Lock
} from 'lucide-react';
import { formatLiveCountdown, getPriorityBadge, formatDateDisplay } from '../../lib/utils';
import { Priority } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { DeleteTaskConfirmationModal } from './DeleteTaskConfirmationModal';

export const TaskDetailModal: React.FC = () => {
  const { user } = useAuth();
  const {
    selectedTask,
    setSelectedTask,
    updateTask,
    addComment,
    subjects,
    isAdmin
  } = useTasks();

  const [commentInput, setCommentInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedTask) return null;

  // Check if current user uploaded this task or is CR Admin
  const canModifyTask = Boolean(
    isAdmin ||
    !selectedTask.createdById ||
    selectedTask.createdById === 'student' ||
    selectedTask.createdById === user?.studentId ||
    selectedTask.createdById === user?.id ||
    selectedTask.createdByName === user?.fullName
  );

  const subject = subjects.find(s => s.id === selectedTask.subjectId);
  const countdown = formatLiveCountdown(
    selectedTask.dueDate,
    selectedTask.dueTime,
    false
  );
  const priorityInfo = getPriorityBadge(selectedTask.priority);

  const getSubjectIcon = (code?: string) => {
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

  const SubIcon = getSubjectIcon(subject?.code);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    await addComment(selectedTask.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        id="task-detail-modal"
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-mono font-bold border ${countdown.badgeClass}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{countdown.text}</span>
            </div>

            {subject && (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                style={{
                  backgroundColor: `${subject.color}15`,
                  color: subject.color
                }}
              >
                <SubIcon className="w-3.5 h-3.5" />
                <span>{subject.code} — {subject.name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canModifyTask ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <span className="p-1.5 rounded-xl text-[var(--text-faint)] bg-[var(--bg-card)] cursor-not-allowed" title="Only creator can delete this task">
                <Lock className="w-4 h-4 text-amber-500" />
              </span>
            )}
            <button
              id="close-task-modal-btn"
              onClick={() => setSelectedTask(null)}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Uploader Meta & Permission Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-2 text-[var(--text-muted)] font-medium">
              <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>
                Uploaded by: <strong className="text-[var(--text-main)]">{selectedTask.createdByName || 'Student'}</strong> {selectedTask.createdById ? `(${selectedTask.createdById})` : ''}
              </span>
            </div>

            {!canModifyTask && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-[0.7rem]">
                <Lock className="w-3 h-3" />
                Read-Only (Uploaded by {selectedTask.createdByName || 'another user'})
              </span>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div
              className="mt-1 w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-white shadow-xs"
              style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
            >
              <SubIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                readOnly={!canModifyTask}
                value={selectedTask.title}
                onChange={e => canModifyTask && updateTask(selectedTask.id, { title: e.target.value })}
                className={`w-full text-lg sm:text-xl font-display font-bold text-[var(--text-main)] bg-transparent border-b border-transparent py-0.5 ${
                  canModifyTask ? 'hover:border-[var(--border-subtle)] focus:border-indigo-500 focus:outline-none' : 'cursor-not-allowed'
                }`}
                placeholder="Task title"
              />
              <textarea
                readOnly={!canModifyTask}
                value={selectedTask.description || ''}
                onChange={e => canModifyTask && updateTask(selectedTask.id, { description: e.target.value })}
                rows={2}
                className={`mt-2 w-full text-xs sm:text-sm text-[var(--text-muted)] bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] rounded-xl p-3 resize-none leading-relaxed ${
                  canModifyTask ? 'focus:outline-none' : 'cursor-not-allowed'
                }`}
                placeholder="Assignment instructions or notes..."
              />
            </div>
          </div>

          {/* Quick Properties */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs">
            <div>
              <span className="text-[0.65rem] font-bold font-mono text-[var(--text-muted)] uppercase block mb-1">
                Deadline
              </span>
              <input
                type="date"
                disabled={!canModifyTask}
                value={selectedTask.dueDate}
                onChange={e => canModifyTask && updateTask(selectedTask.id, { dueDate: e.target.value })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-main)] font-mono focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <span className="text-[0.65rem] font-bold font-mono text-[var(--text-muted)] uppercase block mb-1">
                Time
              </span>
              <input
                type="time"
                disabled={!canModifyTask}
                value={selectedTask.dueTime || '23:59'}
                onChange={e => canModifyTask && updateTask(selectedTask.id, { dueTime: e.target.value })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-main)] font-mono focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <span className="text-[0.65rem] font-bold font-mono text-[var(--text-muted)] uppercase block mb-1">
                Subject
              </span>
              <select
                disabled={!canModifyTask}
                value={selectedTask.subjectId}
                onChange={e => canModifyTask && updateTask(selectedTask.id, { subjectId: e.target.value })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-main)] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[0.65rem] font-bold font-mono text-[var(--text-muted)] uppercase block mb-1">
                Priority
              </span>
              <select
                disabled={!canModifyTask}
                value={selectedTask.priority}
                onChange={e => canModifyTask && updateTask(selectedTask.id, { priority: e.target.value as Priority })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-main)] capitalize focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold gradient-brand-bg text-white shadow-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discussion ({selectedTask.comments?.length || 0})</span>
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(selectedTask.comments || []).length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-[var(--bg-card-subtle)] text-xs text-[var(--text-muted)]">
                  No comments yet. Be the first to start the discussion!
                </div>
              ) : (
                selectedTask.comments?.map(c => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[0.65rem] text-[var(--text-faint)]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{c.userName || c.authorName}</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[var(--text-main)]">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-4 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <DeleteTaskConfirmationModal
        isOpen={showDeleteConfirm}
        task={selectedTask}
        onClose={() => setShowDeleteConfirm(false)}
        onSuccess={() => {
          setShowDeleteConfirm(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
};
