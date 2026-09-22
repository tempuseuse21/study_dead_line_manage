import confetti from 'canvas-confetti';
import { DeadlineUrgency, Priority, Task } from '../types';

// ============================================================
// Class Name Helper
// ============================================================

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Normalizes course code/subject name/id to official assigned faculty
 */
export function getNormalizedProf(code?: string, name?: string, id?: string): string {
  const c = (code || '').toUpperCase();
  const n = (name || '').toLowerCase();
  const i = (id || '').toLowerCase();

  if (c.includes('IT615') || n.includes('dbms') || n.includes('database') || i.includes('it615')) {
    return 'Prof. Minal Bhise';
  }
  if (c.includes('IT603') || n.includes('intro') || n.includes('programming') || i.includes('it603')) {
    return 'Prof. Sandeep Modha';
  }
  if (c.includes('IT639') || n.includes('data structur') || n.includes('dsa') || i.includes('it639')) {
    return 'Prof. Supantha Pandit';
  }
  if (c.includes('PC613') || n.includes('communication') || i.includes('pc613')) {
    return 'Prof. Nandini Banerjee';
  }
  if (c.includes('SC612') || n.includes('discrete') || i.includes('sc612')) {
    return 'Prof. Gopinath Panda';
  }
  return '';
}

// ============================================================
// Date / Time Utilities
// ============================================================

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
 * Returns today's date as YYYY-MM-DD string
 */
export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns tomorrow's date as YYYY-MM-DD string
 */
export function getTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/**
 * Returns the dates for the current week (Mon–Sun) as YYYY-MM-DD strings
 */
export function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

/**
 * Returns the number of days between two YYYY-MM-DD date strings (positive = dateB is after dateA)
 */
export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * Returns true if a YYYY-MM-DD date is within the current week
 */
export function isThisWeek(dateStr: string): boolean {
  const dates = getWeekDates();
  return dates.includes(dateStr);
}

/**
 * Returns true if the date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayStr();
}

/**
 * Returns true if the date string is tomorrow
 */
export function isTomorrow(dateStr: string): boolean {
  return dateStr === getTomorrowStr();
}

/**
 * Formats minutes as "Xh Ym" or just "Ym"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Returns a short label like "Today", "Tomorrow", "Mon Sep 20", etc.
 */
export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  if (isToday(dateStr)) return 'Today';
  if (isTomorrow(dateStr)) return 'Tomorrow';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// ============================================================
// Deadline Urgency Calculations
// ============================================================

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
  if (diffHours <= 72) return 'warning';   // 1–3 days
  if (diffHours <= 168) return 'attention'; // 3–7 days
  return 'normal';
}

/**
 * Formats live human-readable countdown string
 */
export function formatLiveCountdown(
  dueDate: string,
  dueTime?: string,
  isCompleted?: boolean
): {
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
      badgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
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
  if (task.status === 'completed' || task.status === 'cancelled') return -100;

  let score = 0;
  const due = getTaskDueDateTime(task.dueDate, task.dueTime).getTime();
  const now = Date.now();
  const diffHours = (due - now) / (1000 * 60 * 60);

  if (diffHours < 0) {
    score += 150 + Math.min(Math.abs(diffHours), 50);
  } else if (diffHours < 6) {
    score += 100;
  } else if (diffHours < 24) {
    score += 75;
  } else if (diffHours < 48) {
    score += 50;
  } else if (diffHours < 168) {
    score += 25;
  }

  switch (task.priority) {
    case 'urgent': score += 40; break;
    case 'high':   score += 25; break;
    case 'medium': score += 10; break;
    case 'low':    score += 0;  break;
  }

  const remainingWork = (100 - (task.progress || 0)) / 100;
  score += remainingWork * 20;

  if (task.subtasks?.length > 0) {
    const uncompletedSubtasks = task.subtasks.filter(s => !s.completed).length;
    score += uncompletedSubtasks * 2;
  }

  return score;
}

export function getUrgencyLabel(urgency: DeadlineUrgency): string {
  switch (urgency) {
    case 'overdue':      return 'Overdue';
    case 'very_critical': return 'Critical (< 1 hr)';
    case 'critical':     return 'Due Today';
    case 'warning':      return 'Due Soon (1–3 days)';
    case 'attention':    return 'Upcoming (3–7 days)';
    default:             return 'On Track (> 7 days)';
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
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        dotColor: 'bg-blue-500'
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

  return `${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })} at ${timeFormatted}`;
}

// ============================================================
// Celebrations & Audio
// ============================================================

export function triggerCompletionConfetti() {
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
  });
}

/**
 * Play subtle audio chime using Web Audio API
 */
export function playNotificationChime(type: 'success' | 'warning' | 'alert' = 'success') {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'warning') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(392, now + 0.15);
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
    // Ignore audio errors silently
  }
}

export const playChimeSound = () => playNotificationChime('success');

// ============================================================
// ID Generation
// ============================================================

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}
