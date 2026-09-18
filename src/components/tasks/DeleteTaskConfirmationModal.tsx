import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { Task } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { formatDateDisplay } from '../../lib/utils';

interface DeleteTaskConfirmationModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteTaskConfirmationModal: React.FC<DeleteTaskConfirmationModalProps> = ({
  isOpen,
  task,
  onClose,
  onSuccess
}) => {
  const { deleteTask, subjects } = useTasks();
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError('');
      setShowPasscode(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const subject = subjects.find(s => s.id === task.subjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the authorization passcode.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await deleteTask(task.id, passcode.trim());
    setIsSubmitting(false);

    if (res.success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Incorrect authorization passcode. Deletion denied.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="delete-task-passcode-modal"
        className="w-full max-w-md rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-none text-ink-muted hover:text-ink-muted dark:hover:text-bg hover:bg-ink-faint dark:hover:bg-ink transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Security Shield Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-rose-500/10 text-rose-600 dark:text-rose-400 border-[1.5px] border-rose-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink dark:text-white">
              Authorize Task Deletion
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-muted">
              Security authorization required to delete this task
            </p>
          </div>
        </div>

        {/* Task Preview Card */}
        <div className="mb-5 rounded-none bg-bg dark:bg-ink/60 border-[1.5px] border-ink-faint dark:border-ink-faint p-3.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            {subject && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-md border"
                style={{
                  backgroundColor: `${subject.color}15`,
                  color: subject.color,
                  borderColor: `${subject.color}30`
                }}
              >
                {subject.code} • {subject.name}
              </span>
            )}
            <span className="text-[11px] text-ink-muted font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateDisplay(task.dueDate, task.dueTime)}
            </span>
          </div>
          <h4 className="text-sm font-bold text-ink dark:text-white truncate">
            {task.title}
          </h4>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted mb-1.5 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-ink-muted" />
              <span>Enter Security Passcode</span>
            </label>
            <div className="relative">
              <input
                id="task-delete-passcode-input"
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={e => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                placeholder="Enter passcode"
                className={`w-full rounded-none border-[1.5px] bg-bg dark:bg-ink px-3.5 py-2.5 pr-10 text-sm font-medium text-ink dark:text-white focus:outline-hidden transition-all ${
                  error
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-ink-faint dark:border-ink-faint focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-2.5 top-1/2 -tranink-y-1/2 p-1 text-ink-muted hover:text-ink-muted dark:hover:text-bg"
                tabIndex={-1}
              >
                {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in duration-150">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t-[1.5px] border-ink-faint dark:border-ink-faint">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink text-xs font-bold text-ink-muted dark:text-ink-muted hover:bg-bg dark:hover:bg-ink-750 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-task-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-bold text-white shadow-none shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Verifying...' : 'Delete Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
