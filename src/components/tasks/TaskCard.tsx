import React from 'react';
import {
  Clock,
  MessageSquare,
  Paperclip,
  AlertCircle,
  Repeat,
  Layers,
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
  const totalSubtasks = task.subtasks?.length || 0;
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
      className={`group relative flex flex-col rounded-[22px] border-[1.5px] transition-all duration-150 cursor-pointer ${
        task.isPinned
          ? 'ring-2 ring-amber-500/30 border-amber-300 dark:border-amber-700/60 bg-amber-500/5 dark:bg-amber-950/15 shadow-none'
          : countdown.isOverdue
          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 shadow-none hover:shadow-none hover:border-rose-300'
          : 'bg-bg dark:bg-ink border-ink-faint dark:border-ink-faint shadow-none hover:shadow-none hover:border-blue-400 dark:hover:border-blue-700'
      } ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}
    >
      {/* Top Meta: Subject, Pinned/Verified, Priority, Countdown */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5 truncate">
          {task.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-none bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300 border-[1.5px] border-amber-300 dark:border-amber-800">
              <Pin className="h-3 w-3 fill-amber-500" />
              <span>PINNED</span>
            </span>
          )}

          {task.isVerifiedOfficial && (
            <span className="inline-flex items-center gap-1 rounded-none bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300 border-[1.5px] border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="h-3 w-3" />
              <span>OFFICIAL</span>
            </span>
          )}

          {subject && (
            <span
              className="inline-flex items-center gap-1.5 rounded-none px-2.5 py-0.5 text-[11px] font-bold border-[1.5px] truncate"
              style={{
                backgroundColor: `${subject.color}15`,
                color: subject.color,
                borderColor: `${subject.color}30`
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">{subject.code} • {subject.name}</span>
            </span>
          )}

          {task.recurring && task.recurring !== 'none' && (
            <span className="inline-flex items-center gap-1 rounded-none bg-ink-faint dark:bg-ink dark:bg-blue-950/50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-400 border-[1.5px] border-ink-faint dark:border-ink-faint/40">
              <Repeat className="h-3 w-3" />
              <span className="capitalize">{task.recurring}</span>
            </span>
          )}
        </div>

        {/* Priority Badge */}
        <span
          className={`inline-flex items-center gap-1 rounded-none px-2.5 py-0.5 text-[11px] font-bold border-[1.5px] flex-shrink-0 ${priorityInfo.className}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dotColor}`} />
          <span>{priorityInfo.label}</span>
        </span>
      </div>

      {/* Title & Description with Academic Subject Icon */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-none text-white shadow-none"
          style={{ backgroundColor: subject ? subject.color : '#3b82f6' }}
        >
          <SubIcon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold leading-snug truncate text-ink dark:text-bg group-hover:text-ink dark:text-bg dark:group-hover:text-blue-400 transition-colors">
            {task.title}
          </h3>
          {task.description && !compact && (
            <p className="mt-1 text-xs text-ink-muted dark:text-ink-muted line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Dependency Warning */}
      {hasIncompleteDependencies && (
        <div className="mb-2.5 flex items-center gap-1.5 rounded-none bg-amber-500/10 border-[1.5px] border-amber-500/20 px-2.5 py-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">Prerequisite tasks specified</span>
        </div>
      )}

      {/* Mileinks & Subject Info Banner */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-ink-muted dark:text-ink-muted mb-1">
          <div className="flex items-center gap-2">
            {totalSubtasks > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-ink-muted dark:text-ink-muted">
                <Layers className="h-3 w-3 text-ink dark:text-bg" />
                {totalSubtasks} Mileink Step{totalSubtasks === 1 ? '' : 's'}
              </span>
            ) : (
              <span className="text-[11px] text-ink-muted">Class Assignment</span>
            )}
          </div>
          <span className="text-[10px] text-ink-muted font-medium">
            Shared Class Board
          </span>
        </div>
      </div>

      {/* Bottom Footer: Live Countdown Pill & Meta */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 border-t-[1.5px] border-ink-faint dark:border-ink-faint/80 text-xs">
        {/* Countdown Badge */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 text-[11px] font-bold border-[1.5px] transition-colors ${countdown.badgeClass}`}
        >
          <Clock className="h-3 w-3" />
          <span>{countdown.text}</span>
        </div>

        {/* Right Meta */}
        <div className="flex items-center gap-2 text-ink-muted">
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-ink-muted dark:text-ink-muted" title="Attachments">
              <Paperclip className="h-3.5 w-3.5" />
              <span>{task.attachments.length}</span>
            </span>
          )}

          {task.comments?.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-ink-muted dark:text-ink-muted" title="Comments">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{task.comments.length}</span>
            </span>
          )}

          {/* Due date formatted */}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-ink-muted dark:text-ink-muted font-medium">
            <Calendar className="h-3 w-3 text-ink-muted" />
            {formatDateDisplay(task.dueDate, task.dueTime)}
          </span>
        </div>
      </div>
    </div>
  );
};
