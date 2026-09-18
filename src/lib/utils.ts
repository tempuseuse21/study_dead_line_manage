import confetti from 'canvas-confetti';
import { DeadlineUrgency, Priority, Task } from '../types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Returns a combined Date object from dueDate (YYYY-MM-DD) and dueTime (HH:mm)
 */
export function getTaskDueDateTime(dueDate: string, dueTime?: string): Date {
  const time = dueTime && dueTime.trim() ? dueTime : '23:59';
  const [hours, minutes] = time.split(':').map(Number);
  const [year, month, day] = dueDate.split('-').map(Number);
  return new Date(year, month - 1, day, hours || 23, minutes || 59, 0, 0);
}

/**
 * Calculates deadline urgency based on due date and time
 */
export function calculateDeadlineUrgency(dueDate: string, dueTime?: string, isCompleted?: boolean): DeadlineUrgency {
  if (isCompleted) return 'normal';
  
  const due = getTaskDueDateTime(dueDate, dueTime).getTime();
  const now = Date.now();
  const diffMs = due - now;

  if (diffMs < 0) return 'overdue';
  
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 1) return 'very_critical';
  if (diffHours < 24) return 'critical';
  if (diffHours <= 72) return 'warning'; // 1-3 days
  if (diffHours <= 168) return 'attention'; // 3-7 days
  return 'normal';
}

/**
 * Formats live human-readable countdown string (e.g., "2d 5h 32m remaining", "45m remaining", "Overdue by 2h 15m")
 */
export function formatLiveCountdown(dueDate: string, dueTime?: string, isCompleted?: boolean): {
  text: string;
  isOverdue: boolean;
  urgency: DeadlineUrgency;
  badgeClass: string;
} {
  if (isCompleted) {
    return {
      text: 'Completed',
      isOverdue: false,
      urgency: 'normal',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    };
  }

  const due = getTaskDueDateTime(dueDate, dueTime).getTime();
  const now = Date.now();
  const diffMs = due - now;
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const seconds = Math.floor((absDiff / 1000) % 60);
  const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
  const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  let timeString = '';
  if (days > 0) {
    timeString = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    timeString = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    timeString = `${minutes}m ${seconds}s`;
  } else {
    timeString = `${seconds}s`;
  }

  const urgency = calculateDeadlineUrgency(dueDate, dueTime, isCompleted);

  if (isOverdue) {
    return {
      text: `Overdue by ${timeString}`,
      isOverdue: true,
      urgency: 'overdue',
      badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse font-semibold'
    };
  }

  let badgeClass = '';
  switch (urgency) {
    case 'very_critical':
      badgeClass = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse font-medium';
      break;
    case 'critical':
      badgeClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium';
      break;
    case 'warning':
      badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      break;
    case 'attention':
      badgeClass = 'bg-ink-faint dark:bg-ink0/10 text-ink dark:text-bg dark:text-blue-400 border-blue-500/20';
      break;
    default:
      badgeClass = 'bg-ink-muted/10 text-ink-muted dark:text-ink-muted border-ink-muted/20';
  }

  return {
    text: `${timeString} remaining`,
    isOverdue: false,
    urgency,
    badgeClass
  };
}

/**
 * Calculates a composite smart urgency score (higher = needs more focus today)
 */
export function calculateSmartUrgencyScore(task: Task): number {
  if (task.status === 'completed') return -100;

  let score = 0;
  const due = getTaskDueDateTime(task.dueDate, task.dueTime).getTime();
  const now = Date.now();
  const diffHours = (due - now) / (1000 * 60 * 60);

  // Time component
  if (diffHours < 0) {
    score += 150 + Math.min(Math.abs(diffHours), 50); // Overdue is highest priority
  } else if (diffHours < 6) {
    score += 100;
  } else if (diffHours < 24) {
    score += 75;
  } else if (diffHours < 48) {
    score += 50;
  } else if (diffHours < 168) {
    score += 25;
  }

  // Priority component
  switch (task.priority) {
    case 'urgent':
      score += 40;
      break;
    case 'high':
      score += 25;
      break;
    case 'medium':
      score += 10;
      break;
    case 'low':
      score += 0;
      break;
  }

  // Remaining work component (lower progress = higher urgency if deadline is near)
  const remainingWork = (100 - (task.progress || 0)) / 100;
  score += remainingWork * 20;

  // Subtask workload
  if (task.subtasks && task.subtasks.length > 0) {
    const uncompletedSubtasks = task.subtasks.filter(s => !s.completed).length;
    score += uncompletedSubtasks * 2;
  }

  return score;
}

export function getUrgencyLabel(urgency: DeadlineUrgency): string {
  switch (urgency) {
    case 'overdue':
      return 'Overdue';
    case 'very_critical':
      return 'Critical (< 1 hr)';
    case 'critical':
      return 'Due Today';
    case 'warning':
      return 'Due Soon (1-3 days)';
    case 'attention':
      return 'Upcoming (3-7 days)';
    default:
      return 'On Track (> 7 days)';
  }
}

export function getPriorityBadge(priority: Priority): {
  label: string;
  className: string;
  dotColor: string;
} {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Urgent',
        className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        dotColor: 'bg-rose-500'
      };
    case 'high':
      return {
        label: 'High',
        className: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
        dotColor: 'bg-orange-500'
      };
    case 'medium':
      return {
        label: 'Medium',
        className: 'bg-ink-faint dark:bg-ink0/15 text-ink dark:text-bg dark:text-blue-400 border-blue-500/30',
        dotColor: 'bg-ink-faint dark:bg-ink0'
      };
    case 'low':
      return {
        label: 'Low',
        className: 'bg-ink-muted/15 text-ink-muted dark:text-ink-muted border-ink-muted/30',
        dotColor: 'bg-ink-400'
      };
  }
}

export function formatDateDisplay(dateStr: string, timeStr?: string): string {
  if (!dateStr) return '';
  const date = getTaskDueDateTime(dateStr, timeStr);
  const now = new Date();
  
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const timeFormatted = timeStr
    ? new Date(`2000-01-01T${timeStr}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '11:59 PM';

  if (isToday) return `Today at ${timeFormatted}`;
  if (isTomorrow) return `Tomorrow at ${timeFormatted}`;

  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${timeFormatted}`;
}

export function triggerCompletionConfetti() {
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
  });
}

/**
 * Play subtle audio chime using Web Audio API for timer or reminders
 */
export function playNotificationChime(type: 'success' | 'warning' | 'alert' = 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'warning') {
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(392, now + 0.15); // G4
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(660, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // Ignore audio permission or context errors silently
  }
}

export const playChimeSound = () => playNotificationChime('success');

