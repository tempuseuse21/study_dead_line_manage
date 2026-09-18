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
  AlertCircle,
  FileText,
  BookOpen,
  Database,
  Binary,
  Code,
  GitFork,
  Check
} from 'lucide-react';
import { formatLiveCountdown, getPriorityBadge, formatDateDisplay } from '../../lib/utils';
import { Priority, Task } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { DeleteTaskConfirmationModal } from './DeleteTaskConfirmationModal';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    updateTask,
    deleteTask,
    addComment,
    addAttachment,
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

  // Handle Subtask Add
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

  // Handle Remove Subtask
  const handleRemoveSubtask = async (subtaskId: string) => {
    const updatedSubtasks = (selectedTask.subtasks || []).filter(s => s.id !== subtaskId);
    await updateTask(selectedTask.id, {
      subtasks: updatedSubtasks
    });
  };

  // Handle AI Subtask Generator
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
      // Fallback local breakdown
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

  // Handle Comment Add
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    await addComment(selectedTask.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="task-detail-modal"
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Urgency Banner */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b-[1.5px] ${
            countdown.isOverdue
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              : 'bg-bg dark:bg-ink-850 border-ink-faint dark:border-ink-faint text-ink dark:text-bg'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 rounded-none px-3 py-1 text-xs font-bold border-[1.5px] ${countdown.badgeClass}`}>
              <Clock className="h-3.5 w-3.5" />
              <span>{countdown.text}</span>
            </div>

            {subject && (
              <span
                className="inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 text-xs font-semibold border"
                style={{
                  backgroundColor: `${subject.color}15`,
                  color: subject.color,
                  borderColor: `${subject.color}30`
                }}
              >
                <SubIcon className="h-3.5 w-3.5" />
                <span>{subject.code} • {subject.name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-none text-ink-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              id="close-task-modal-btn"
              onClick={() => setSelectedTask(null)}
              className="p-1.5 rounded-none text-ink-muted hover:text-ink-muted dark:hover:text-bg hover:bg-ink-faint dark:hover:bg-ink transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <div className="flex items-start gap-3">
              <div
                className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-none text-white shadow-none"
                style={{ backgroundColor: subject ? subject.color : '#3b82f6' }}
              >
                <SubIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={e => updateTask(selectedTask.id, { title: e.target.value })}
                  className="w-full text-lg sm:text-xl font-bold text-ink dark:text-white bg-transparent border-b-[1.5px] border-transparent hover:border-ink-faint dark:hover:border-ink-faint focus:border-blue-500 focus:outline-hidden py-0.5"
                  placeholder="Task title"
                />
                <textarea
                  value={selectedTask.description || ''}
                  onChange={e => updateTask(selectedTask.id, { description: e.target.value })}
                  rows={2}
                  className="mt-2 w-full text-xs sm:text-sm text-ink-muted dark:text-ink-muted bg-transparent border-[1.5px] border-transparent hover:border-ink-faint dark:hover:border-ink-faint focus:border-blue-500 rounded-none p-1.5 focus:outline-hidden resize-none leading-relaxed"
                  placeholder="Add assignment instructions, notes, or criteria..."
                />
              </div>
            </div>
          </div>

          {/* Quick Properties Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-none bg-bg dark:bg-ink/40 border-[1.5px] border-ink-faint dark:border-ink-faint text-xs">
            {/* Due Date & Time */}
            <div>
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                Deadline
              </span>
              <input
                type="date"
                value={selectedTask.dueDate}
                onChange={e => updateTask(selectedTask.id, { dueDate: e.target.value })}
                className="w-full bg-bg dark:bg-ink border-[1.5px] border-ink-faint dark:border-ink-faint rounded-none px-2 py-1 text-xs text-ink dark:text-bg focus:outline-hidden"
              />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                Time
              </span>
              <input
                type="time"
                value={selectedTask.dueTime || '23:59'}
                onChange={e => updateTask(selectedTask.id, { dueTime: e.target.value })}
                className="w-full bg-bg dark:bg-ink border-[1.5px] border-ink-faint dark:border-ink-faint rounded-none px-2 py-1 text-xs text-ink dark:text-bg focus:outline-hidden"
              />
            </div>

            {/* Subject Selector */}
            <div>
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                Subject
              </span>
              <select
                value={selectedTask.subjectId}
                onChange={e => updateTask(selectedTask.id, { subjectId: e.target.value })}
                className="w-full bg-bg dark:bg-ink border-[1.5px] border-ink-faint dark:border-ink-faint rounded-none px-2 py-1 text-xs text-ink dark:text-bg focus:outline-hidden"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                Priority
              </span>
              <select
                value={selectedTask.priority}
                onChange={e => updateTask(selectedTask.id, { priority: e.target.value as Priority })}
                className="w-full bg-bg dark:bg-ink border-[1.5px] border-ink-faint dark:border-ink-faint rounded-none px-2 py-1 text-xs text-ink dark:text-bg focus:outline-hidden capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* AI Tip if Generated */}
          {aiTip && (
            <div className="p-3.5 rounded-none bg-ink-faint dark:bg-ink0/10 border-[1.5px] border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5 animate-in fade-in">
              <Sparkles className="h-4 w-4 text-ink dark:text-bg flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Academic Recommendation:</span>
                <span>{aiTip}</span>
              </div>
            </div>
          )}

          {/* Tabs Navigation: Subtasks, Attachments, Comments */}
          <div className="flex items-center gap-2 border-b-[1.5px] border-ink-faint dark:border-ink-faint pb-2 text-xs">
            <button
              onClick={() => setActiveTab('subtasks')}
              className={`flex items-center gap-1.5 rounded-none px-3 py-1.5 font-semibold transition-colors ${
                activeTab === 'subtasks'
                  ? 'bg-ink-faint dark:bg-ink dark:bg-blue-950 text-ink dark:text-bg dark:text-blue-400'
                  : 'text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Mileinks & Steps ({totalSubtasks})</span>
            </button>

            <button
              onClick={() => setActiveTab('attachments')}
              className={`flex items-center gap-1.5 rounded-none px-3 py-1.5 font-semibold transition-colors ${
                activeTab === 'attachments'
                  ? 'bg-ink-faint dark:bg-ink dark:bg-blue-950 text-ink dark:text-bg dark:text-blue-400'
                  : 'text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink'
              }`}
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span>Files ({selectedTask.attachments?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-1.5 rounded-none px-3 py-1.5 font-semibold transition-colors ${
                activeTab === 'comments'
                  ? 'bg-ink-faint dark:bg-ink dark:bg-blue-950 text-ink dark:text-bg dark:text-blue-400'
                  : 'text-ink-muted dark:text-ink-muted hover:bg-ink-faint dark:hover:bg-ink'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Discussion ({selectedTask.comments?.length || 0})</span>
            </button>
          </div>

          {/* Tab Content: Subtasks / Mileinks */}
          {activeTab === 'subtasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider">
                  Mileink Steps & Requirements
                </span>

                <button
                  onClick={handleAIBreakdown}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-none hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{isGeneratingAI ? 'Generating...' : 'AI Mileinks'}</span>
                </button>
              </div>

              {/* Subtask List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(selectedTask.subtasks || []).length === 0 ? (
                  <div className="p-4 text-center rounded-none bg-bg dark:bg-ink/40 text-xs text-ink-muted">
                    No mileink steps yet. Add key steps below or use AI Mileinks.
                  </div>
                ) : (
                  selectedTask.subtasks?.map((st, index) => (
                    <div
                      key={st.id}
                      className="group flex items-center justify-between p-3 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink-850 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-ink-faint dark:bg-ink dark:bg-blue-950 text-[11px] font-black text-blue-700 dark:text-blue-300">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-ink dark:text-bg truncate">
                          {st.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-rose-500 rounded transition-opacity"
                        title="Remove step"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Subtask Input */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add mileink step (e.g. Test edge cases, format bibliography)..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2 text-xs text-ink dark:text-bg focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-4 py-2 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint text-xs font-bold text-white shadow-none disabled:opacity-40 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tab Content: Attachments */}
          {activeTab === 'attachments' && (
            <div className="space-y-3">
              <div className="space-y-2">
                {(selectedTask.attachments || []).length === 0 ? (
                  <div className="p-6 text-center rounded-none bg-bg dark:bg-ink/40 text-xs text-ink-muted">
                    No files attached to this task.
                  </div>
                ) : (
                  selectedTask.attachments?.map(att => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink-850 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-ink dark:text-bg" />
                        <div>
                          <span className="font-semibold text-ink dark:text-bg block">
                            {att.name}
                          </span>
                          <span className="text-[10px] text-ink-muted">
                            {(att.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>

                      <a
                        href={att.url}
                        download={att.name}
                        className="p-1.5 rounded-none text-ink-muted hover:text-ink dark:text-bg hover:bg-ink-faint dark:hover:bg-ink"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Comments */}
          {activeTab === 'comments' && (
            <div className="space-y-3">
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {(selectedTask.comments || []).length === 0 ? (
                  <div className="p-4 text-center rounded-none bg-bg dark:bg-ink/40 text-xs text-ink-muted">
                    No discussion comments yet.
                  </div>
                ) : (
                  selectedTask.comments?.map(c => (
                    <div
                      key={c.id}
                      className="p-3 rounded-none bg-bg dark:bg-ink/60 border-[1.5px] border-ink-faint dark:border-ink-faint text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-ink-muted">
                        <span className="font-bold text-ink-muted dark:text-ink-muted">
                          {c.userName}
                        </span>
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-ink-muted dark:text-bg leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Write a message or study tip for the class..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="flex-1 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2 text-xs text-ink dark:text-bg focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-4 py-2 rounded-none bg-ink dark:bg-ink-faint text-bg dark:text-ink hover:bg-ink dark:hover:bg-ink-faint text-xs font-bold text-white shadow-none disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
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
