import React from 'react';
import {
  Clock,
  MessageSquare,
  Paperclip,
  AlertCircle,
  Repeat,
  Pin,
  ShieldCheck,
  Calendar,
  BookOpen,
  Database,
  Binary,
  Code,
  GitFork
} from 'lucide-react';
import { formatLiveCountdown, getPriorityBadge, formatDateDisplay } from '../../lib/utils';
import { Task } from '../../types';
import { useTasks } from '../../context/TaskContext';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false }) => {
  const { setSelectedTask, subjects } = useTasks();

  const subject = subjects.find(s => s.id === task.subjectId);
  const priorityInfo = getPriorityBadge(task.priority);
  const countdown = formatLiveCountdown(task.dueDate, task.dueTime, false);
  const hasIncompleteDependencies = task.dependencies?.some(d => !d.isCompleted);

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

  return (
    <div
      id={`task-card-${task.id}`}
      onClick={() => setSelectedTask(task)}
      className={`group relative flex flex-col rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs ${
        task.isPinned
          ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
          : countdown.isOverdue
          ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50'
          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-indigo-500/40 hover:shadow-md hover:-translate-y-0.5'
      } ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}
    >
      {/* Header Meta: Subject, Pinned/Official Badges, Priority, Countdown */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {task.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[0.65rem] font-bold font-mono text-amber-600 dark:text-amber-400">
              <Pin className="w-3 h-3 fill-amber-500" />
              <span>PINNED</span>
            </span>
          )}

          {task.isVerifiedOfficial && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-bold font-mono text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>OFFICIAL</span>
            </span>
          )}

          {subject && (
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[0.65rem] font-mono font-bold truncate"
              style={{
                backgroundColor: `${subject.color}15`,
                color: subject.color
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
              <span className="truncate">{subject.code}</span>
            </span>
          )}
        </div>

        {/* Priority Badge */}
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.65rem] font-mono font-bold flex-shrink-0 ${priorityInfo.className}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotColor}`} />
          <span>{priorityInfo.label}</span>
        </span>
      </div>

      {/* Main Content */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="mt-0.5 w-9 h-9 rounded-xl flex flex-shrink-0 items-center justify-center text-white shadow-xs"
          style={{ backgroundColor: subject ? subject.color : '#6366f1' }}
        >
          <SubIcon className="w-4.5 h-4.5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-sm sm:text-base text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
            {task.title}
          </h3>
          {task.description && !compact && (
            <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Dependency Warning */}
      {hasIncompleteDependencies && (
        <div className="mb-3 flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Prerequisite tasks incomplete</span>
        </div>
      )}



      {/* Card Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)] text-xs">
        <div
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.65rem] font-mono font-bold border transition-colors ${countdown.badgeClass}`}
        >
          <Clock className="w-3 h-3" />
          <span>{countdown.text}</span>
        </div>

        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs" title="Attachments">
              <Paperclip className="w-3.5 h-3.5" />
              <span className="font-mono text-[0.65rem]">{task.attachments.length}</span>
            </span>
          )}

          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs" title="Comments">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-mono text-[0.65rem]">{task.comments.length}</span>
            </span>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 text-[0.7rem] font-medium">
            <Calendar className="w-3 h-3 text-[var(--text-faint)]" />
            {formatDateDisplay(task.dueDate, task.dueTime)}
          </span>
        </div>
      </div>
    </div>
  );
};
