/**
 * Priority Engine — calculates smart priority scores for tasks.
 * Returns a numeric score + human-readable explanation reasons.
 * Higher score = needs more attention now.
 */

import { Exam, PriorityResult, Task } from '../types';
import { getTaskDueDateTime } from '../lib/utils';

const PRIORITY_WEIGHTS = { urgent: 40, high: 25, medium: 10, low: 0 };
const DIFFICULTY_WEIGHTS = { very_hard: 15, hard: 10, moderate: 5, easy: 0 };

/**
 * Calculate a priority score for a task, taking exams into account.
 */
export function calculatePriorityScore(task: Task, exams: Exam[] = []): PriorityResult {
  if (task.status === 'completed' || task.status === 'cancelled') {
    return { score: -100, reasons: ['Task is completed'], urgencyLabel: 'Done' };
  }

  const reasons: string[] = [];
  let score = 0;

  const now = Date.now();
  const due = getTaskDueDateTime(task.dueDate, task.dueTime).getTime();
  const diffHours = (due - now) / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  // 1. Deadline proximity
  if (diffHours < 0) {
    const overdueHours = Math.abs(diffHours);
    score += 150 + Math.min(overdueHours * 2, 100);
    reasons.push(`Overdue by ${overdueHours < 24 ? `${Math.round(overdueHours)}h` : `${Math.round(overdueHours / 24)}d`}`);
  } else if (diffHours < 6) {
    score += 100;
    reasons.push(`Due in less than 6 hours`);
  } else if (diffHours < 24) {
    score += 80;
    reasons.push(`Due today`);
  } else if (diffDays < 2) {
    score += 60;
    reasons.push(`Due tomorrow`);
  } else if (diffDays < 4) {
    score += 40;
    reasons.push(`Due in ${Math.round(diffDays)} days`);
  } else if (diffDays < 7) {
    score += 20;
    reasons.push(`Due this week`);
  }

  // 2. Priority level
  const priorityBonus = PRIORITY_WEIGHTS[task.priority] ?? 0;
  if (priorityBonus > 0) {
    score += priorityBonus;
    if (task.priority === 'urgent') reasons.push('Marked as urgent');
    else if (task.priority === 'high') reasons.push('High priority task');
  }

  // 3. Difficulty
  if (task.difficulty) {
    const diffBonus = DIFFICULTY_WEIGHTS[task.difficulty] ?? 0;
    score += diffBonus;
    if (diffBonus >= 10) reasons.push(`${task.difficulty.replace('_', ' ')} difficulty`);
  }

  // 4. Remaining work
  const remaining = (100 - (task.progress || 0)) / 100;
  const workBonus = Math.round(remaining * 20);
  score += workBonus;
  if (task.progress > 0 && task.progress < 100) {
    reasons.push(`${100 - task.progress}% remaining`);
  } else if (task.progress === 0) {
    reasons.push('Not yet started');
  }

  // 5. Incomplete subtasks
  if (task.subtasks?.length > 0) {
    const incomplete = task.subtasks.filter(s => !s.completed).length;
    if (incomplete > 0) {
      score += incomplete * 2;
      reasons.push(`${incomplete} subtask${incomplete > 1 ? 's' : ''} pending`);
    }
  }

  // 6. Estimated workload vs time available
  if (task.estimatedDurationMinutes && diffHours > 0) {
    const hoursNeeded = task.estimatedDurationMinutes / 60;
    const remainingWork = hoursNeeded * (remaining);
    if (remainingWork > diffHours * 0.8) {
      score += 30;
      reasons.push(`High workload relative to deadline`);
    }
  }

  // 7. Exam proximity boost — if subject has upcoming exam
  if (task.subjectId && exams.length > 0) {
    const upcomingExam = exams.find(e => {
      if (e.subjectId !== task.subjectId) return false;
      const examTime = new Date(`${e.examDate}T${e.examTime || '09:00'}`).getTime();
      const daysToExam = (examTime - now) / (1000 * 60 * 60 * 24);
      return daysToExam >= 0 && daysToExam <= 7;
    });
    if (upcomingExam) {
      const examDays = Math.round(
        (new Date(`${upcomingExam.examDate}`).getTime() - now) / (1000 * 60 * 60 * 24)
      );
      score += 25;
      reasons.push(`Exam in ${examDays} day${examDays !== 1 ? 's' : ''}`);
    }
  }

  // Determine urgency label
  let urgencyLabel: string;
  if (score >= 200) urgencyLabel = 'Critical';
  else if (score >= 120) urgencyLabel = 'Very High';
  else if (score >= 80) urgencyLabel = 'High';
  else if (score >= 40) urgencyLabel = 'Medium';
  else urgencyLabel = 'Low';

  return { score, reasons: reasons.slice(0, 3), urgencyLabel };
}

/**
 * Get top N recommended tasks to work on right now.
 */
export function getRecommendedTasks(
  tasks: Task[],
  exams: Exam[],
  limit = 5
): Array<Task & { priorityResult: PriorityResult }> {
  return tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .map(t => ({ ...t, priorityResult: calculatePriorityScore(t, exams) }))
    .sort((a, b) => b.priorityResult.score - a.priorityResult.score)
    .slice(0, limit);
}

/**
 * Get tasks at deadline risk (estimated work > available time).
 */
export interface DeadlineRisk {
  task: Task;
  hoursNeeded: number;
  hoursAvailable: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
}

export function detectDeadlineRisks(tasks: Task[], dailyStudyHours = 4): DeadlineRisk[] {
  const now = Date.now();
  const risks: DeadlineRisk[] = [];

  for (const task of tasks) {
    if (task.status === 'completed' || task.status === 'cancelled') continue;
    if (!task.estimatedDurationMinutes) continue;

    const due = getTaskDueDateTime(task.dueDate, task.dueTime).getTime();
    const diffHours = (due - now) / (1000 * 60 * 60);
    if (diffHours < 0 || diffHours > 168) continue; // only next 7 days

    const remainingWork = task.estimatedDurationMinutes * (1 - (task.progress || 0) / 100);
    const hoursNeeded = remainingWork / 60;
    const hoursAvailable = Math.min(diffHours, diffHours / 24 * dailyStudyHours);

    if (hoursNeeded <= hoursAvailable * 0.7) continue; // plenty of time

    let riskLevel: DeadlineRisk['riskLevel'];
    let suggestion: string;
    const ratio = hoursNeeded / Math.max(hoursAvailable, 0.1);

    if (ratio >= 2) {
      riskLevel = 'critical';
      suggestion = 'Start immediately — deadline likely to be missed';
    } else if (ratio >= 1.5) {
      riskLevel = 'high';
      suggestion = 'Increase available study time or reduce other tasks';
    } else if (ratio >= 1) {
      riskLevel = 'medium';
      suggestion = 'At risk — consider starting today';
    } else {
      riskLevel = 'low';
      suggestion = 'Manageable but watch carefully';
    }

    risks.push({ task, hoursNeeded, hoursAvailable, riskLevel, suggestion });
  }

  return risks.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.riskLevel] - order[b.riskLevel];
  });
}
