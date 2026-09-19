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

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subtasks' | 'attachments' | 'comments'>('subtasks');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedTask) return null;

  const subject = subjects.find(s => s.id === selectedTask.subjectId);
  const countdown = formatLiveCountdown(
    selectedTask.dueDate,
    selectedTask.dueTime,
    false
  );
  const priorityInfo = getPriorityBadge(selectedTask.priority);
  const totalSubtasks = selectedTask.subtasks?.length || 0;

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

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt = {
      id: `st_${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    const updatedSubtasks = [...(selectedTask.subtasks || []), newSt];

    await updateTask(selectedTask.id, {
      subtasks: updatedSubtasks
    });
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = async (subtaskId: string) => {
    const updatedSubtasks = (selectedTask.subtasks || []).filter(s => s.id !== subtaskId);
    await updateTask(selectedTask.id, {
      subtasks: updatedSubtasks
    });
  };

  const handleAIBreakdown = async () => {
    setIsGeneratingAI(true);
    setAiTip(null);
    try {
      const res = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          subjectName: subject?.name || 'Computer Science'
        })
      });
      const data = await res.json();
      if (data.subtasks && Array.isArray(data.subtasks)) {
        const generated = data.subtasks.map((st: any, i: number) => ({
          id: `st_ai_${Date.now()}_${i}`,
          title: typeof st === 'string' ? st : st.title,
          completed: false
        }));
        await updateTask(selectedTask.id, {
          subtasks: [...(selectedTask.subtasks || []), ...generated]
        });
        if (data.studyTip) setAiTip(data.studyTip);
      }
    } catch {
      const localMileinks = [
        { id: `st_fb1_${Date.now()}`, title: 'Review core definitions and course reference material', completed: false },
        { id: `st_fb2_${Date.now()}`, title: 'Implement and verify solutions against problem rubric', completed: false },
        { id: `st_fb3_${Date.now()}`, title: 'Format submission document with diagrams & student details', completed: false }
      ];
      await updateTask(selectedTask.id, {
        subtasks: [...(selectedTask.subtasks || []), ...localMileinks]
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

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

          {aiTip && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Study Recommendation:</span>
                <span>{aiTip}</span>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs">
            <button
              onClick={() => setActiveTab('subtasks')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'subtasks'
                  ? 'gradient-brand-bg text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Milestones ({totalSubtasks})</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'comments'
                  ? 'gradient-brand-bg text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussion ({selectedTask.comments?.length || 0})</span>
            </button>
          </div>

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-[var(--text-muted)] uppercase">
                  Subtask Checklist
                </span>
                <button
                  onClick={handleAIBreakdown}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold gradient-brand-bg text-white shadow-xs hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingAI ? 'Generating...' : 'AI Breakdown'}</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(selectedTask.subtasks || []).length === 0 ? (
                  <div className="p-4 text-center rounded-2xl bg-[var(--bg-card-subtle)] text-xs text-[var(--text-muted)]">
                    No milestone steps created yet.
                  </div>
                ) : (
                  selectedTask.subtasks?.map((st, index) => (
                    <div
                      key={st.id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-500/10 text-[0.65rem] font-bold font-mono text-indigo-600">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-[var(--text-main)] truncate">
                          {st.title}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-500 rounded transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add milestone step..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-3">
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(selectedTask.comments || []).length === 0 ? (
                  <div className="p-4 text-center rounded-2xl bg-[var(--bg-card-subtle)] text-xs text-[var(--text-muted)]">
                    No comments yet.
                  </div>
                ) : (
                  selectedTask.comments?.map(c => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[0.65rem] text-[var(--text-faint)]">
                        <span className="font-bold text-[var(--text-muted)] font-mono">{c.userName}</span>
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
                  className="px-4 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
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
