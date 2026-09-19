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
  GitFork
} from 'lucide-react';
import { formatLiveCountdown, getPriorityBadge, formatDateDisplay } from '../../lib/utils';
import { Priority } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { DeleteTaskConfirmationModal } from './DeleteTaskConfirmationModal';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    updateTask,
    addComment,
    subjects
  } = useTasks();

  const [commentInput, setCommentInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedTask) return null;

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
        <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]">
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="close-task-modal-btn"
              onClick={() => setSelectedTask(null)}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                value={selectedTask.title}
                onChange={e => updateTask(selectedTask.id, { title: e.target.value })}
                className="w-full text-lg sm:text-xl font-display font-bold text-[var(--text-main)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-indigo-500 focus:outline-none py-0.5"
                placeholder="Task title"
              />
              <textarea
                value={selectedTask.description || ''}
                onChange={e => updateTask(selectedTask.id, { description: e.target.value })}
                rows={2}
                className="mt-2 w-full text-xs sm:text-sm text-[var(--text-muted)] bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] rounded-xl p-3 focus:outline-none resize-none leading-relaxed"
                placeholder="Add assignment instructions, notes, or criteria..."
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
                value={selectedTask.dueDate}
                onChange={e => updateTask(selectedTask.id, { dueDate: e.target.value })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-main)] font-mono focus:outline-none"
              />
            </div>

            <div>
              <span className="text-[0.65rem] font-bold font-mono text-[var(--text-muted)] uppercase block mb-1">
                Time
              </span>
              <input
                type="time"
                value={selectedTask.dueTime || '23:59'}
                onChange={e => updateTask(selectedTask.id, { dueTime: e.target.value })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-main)] font-mono focus:outline-none"
              />
            </div>

            <div>
              <span className="text-[0.65rem] font-bold font-mono text-[var(--text-muted)] uppercase block mb-1">
                Subject
              </span>
              <select
                value={selectedTask.subjectId}
                onChange={e => updateTask(selectedTask.id, { subjectId: e.target.value })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-main)] focus:outline-none"
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
                value={selectedTask.priority}
                onChange={e => updateTask(selectedTask.id, { priority: e.target.value as Priority })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-main)] capitalize focus:outline-none"
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
