import React, { useState } from 'react';
import { Calendar, RefreshCw, CheckCircle2, X, Clock, Sparkles, Coffee } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { DailyPlan, PlannerSession } from '../../types';
import { cn, getTodayStr, generateId, formatDuration } from '../../lib/utils';
import { getRecommendedTasks } from '../../services/priorityEngine';

function generateDailyPlan(
  tasks: ReturnType<typeof useTasks>['tasks'],
  exams: ReturnType<typeof useTasks>['exams'],
  studyPrefs: ReturnType<typeof useTasks>['studyPreferences'],
  date: string
): DailyPlan {
  const recommended = getRecommendedTasks(tasks, exams, 6);
  const sessions: PlannerSession[] = [];

  let currentHour = studyPrefs.preferredStudyStartHour;
  let sessionIdx = 0;
  let pomodoroCount = 0;

  while (currentHour < studyPrefs.preferredStudyEndHour && sessionIdx < recommended.length) {
    const task = recommended[sessionIdx];
    const sessionDur = studyPrefs.defaultSessionDurationMinutes;
    const breakDur = pomodoroCount > 0 && pomodoroCount % studyPrefs.sessionsBeforeLongBreak === 0
      ? studyPrefs.longBreakDurationMinutes
      : studyPrefs.defaultBreakDurationMinutes;

    const startMinutes = currentHour * 60;
    const endMinutes = startMinutes + sessionDur;

    sessions.push({
      id: generateId('ps'),
      taskId: task.id,
      taskTitle: task.title,
      subjectId: task.subjectId,
      startTime: `${String(Math.floor(startMinutes / 60)).padStart(2, '0')}:${String(startMinutes % 60).padStart(2, '0')}`,
      endTime: `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`,
      durationMinutes: sessionDur,
      isBreak: false,
      isCompleted: false,
      skipped: false,
      date
    });

    pomodoroCount++;
    currentHour = endMinutes / 60;

    if (currentHour < studyPrefs.preferredStudyEndHour) {
      const bStart = currentHour * 60;
      const bEnd = bStart + breakDur;
      sessions.push({
        id: generateId('br'),
        taskId: undefined,
        taskTitle: pomodoroCount % studyPrefs.sessionsBeforeLongBreak === 0 ? 'Long Break' : 'Short Break',
        startTime: `${String(Math.floor(bStart / 60)).padStart(2, '0')}:${String(bStart % 60).padStart(2, '0')}`,
        endTime: `${String(Math.floor(bEnd / 60)).padStart(2, '0')}:${String(bEnd % 60).padStart(2, '0')}`,
        durationMinutes: breakDur,
        isBreak: true,
        isCompleted: false,
        skipped: false,
        date
      });
      currentHour = bEnd / 60;
    }

    sessionIdx++;
  }

  const totalStudyMinutes = sessions.filter(s => !s.isBreak).reduce((a, s) => a + s.durationMinutes, 0);

  return {
    date,
    sessions,
    totalStudyMinutes,
    isReviewed: false
  };
}

export const PlannerView: React.FC = () => {
  const { tasks, exams, subjects, studyPreferences, getTodayPlan, saveDailyPlan, setSelectedTask } = useTasks();
  const todayStr = getTodayStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [plan, setPlan] = useState<DailyPlan | null>(() => getTodayPlan());

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');

  const generatePlan = () => {
    const newPlan = generateDailyPlan(activeTasks, exams, studyPreferences, selectedDate);
    setPlan(newPlan);
    saveDailyPlan(newPlan);
  };

  const toggleSession = (sessionId: string) => {
    if (!plan) return;
    const updated = {
      ...plan,
      sessions: plan.sessions.map(s =>
        s.id === sessionId ? { ...s, isCompleted: !s.isCompleted } : s
      )
    };
    setPlan(updated);
    saveDailyPlan(updated);
  };

  const skipSession = (sessionId: string) => {
    if (!plan) return;
    const updated = {
      ...plan,
      sessions: plan.sessions.map(s =>
        s.id === sessionId ? { ...s, skipped: true } : s
      )
    };
    setPlan(updated);
    saveDailyPlan(updated);
  };

  const completedSessions = plan?.sessions.filter(s => !s.isBreak && s.isCompleted).length ?? 0;
  const totalSessions = plan?.sessions.filter(s => !s.isBreak).length ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
              Daily Study Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Auto-generated time-blocked study schedule aligned with your priority tasks.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setPlan(null); }}
            className="px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-main)]"
          />
          <button
            onClick={generatePlan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand-bg text-white font-semibold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{plan ? 'Regenerate' : 'Generate Plan'}</span>
          </button>
        </div>
      </div>

      {/* Target Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <span className="text-[0.65rem] font-bold uppercase font-mono text-[var(--text-faint)] block mb-1">Daily Target</span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[var(--text-main)]">{studyPreferences.dailyStudyTargetHours} Hours</div>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <span className="text-[0.65rem] font-bold uppercase font-mono text-[var(--text-faint)] block mb-1">Session Duration</span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{studyPreferences.defaultSessionDurationMinutes} Mins</div>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <span className="text-[0.65rem] font-bold uppercase font-mono text-[var(--text-faint)] block mb-1">Window</span>
          <div className="font-mono text-lg sm:text-xl font-bold text-[var(--text-main)]">
            {String(studyPreferences.preferredStudyStartHour).padStart(2, '0')}:00–{String(studyPreferences.preferredStudyEndHour).padStart(2, '0')}:00
          </div>
        </div>
      </div>

      {!plan ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-3">
          <Calendar className="w-10 h-10 text-[var(--text-faint)] mx-auto" />
          <h3 className="font-display font-bold text-base text-[var(--text-main)]">No schedule generated for this date</h3>
          <p className="text-xs text-[var(--text-muted)]">Click 'Generate Plan' to create an optimized study timeline for today.</p>
          <button
            onClick={generatePlan}
            className="px-5 py-2.5 rounded-xl gradient-brand-bg text-white font-semibold text-xs shadow-md"
          >
            Generate Today's Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-muted)]">{completedSessions}/{totalSessions} sessions completed</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatDuration(plan.totalStudyMinutes)} planned study</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: totalSessions > 0 ? `${Math.round((completedSessions / totalSessions) * 100)}%` : '0%' }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {plan.sessions.map(session => {
              const subject = subjects.find(s => s.id === session.subjectId);
              const task = tasks.find(t => t.id === session.taskId);
              if (session.skipped) return null;

              return (
                <div
                  key={session.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border transition-all',
                    session.isBreak
                      ? 'bg-[var(--bg-card-subtle)]/60 border-[var(--border-subtle)]'
                      : session.isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-indigo-500/30 shadow-xs'
                  )}
                >
                  <div className="w-16 flex-shrink-0 text-center font-mono text-xs text-[var(--text-muted)]">
                    <div>{session.startTime}</div>
                    <div className="text-[0.6rem] text-[var(--text-faint)]">↓</div>
                    <div>{session.endTime}</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {session.isBreak ? (
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <Coffee className="w-4 h-4 text-amber-500" />
                        <span className="font-medium italic">{session.taskTitle} ({session.durationMinutes} mins)</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {subject && (
                            <span
                              className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                            >
                              {subject.code}
                            </span>
                          )}
                          <span className="text-[0.65rem] font-mono text-[var(--text-faint)]">{session.durationMinutes} mins</span>
                        </div>
                        <p
                          onClick={() => task && setSelectedTask(task)}
                          className={cn(
                            'font-display font-semibold text-sm cursor-pointer hover:text-indigo-600 transition-colors truncate',
                            session.isCompleted ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-main)]'
                          )}
                        >
                          {session.taskTitle}
                        </p>
                      </div>
                    )}
                  </div>

                  {!session.isBreak && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSession(session.id)}
                        className={cn('p-2 rounded-xl transition-colors', session.isCompleted ? 'text-emerald-500 bg-emerald-500/10' : 'text-[var(--text-faint)] hover:text-emerald-500')}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      {!session.isCompleted && (
                        <button
                          onClick={() => skipSession(session.id)}
                          className="p-2 rounded-xl text-[var(--text-faint)] hover:text-amber-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
