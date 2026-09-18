import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Clock,
  Layers
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { playChimeSound } from '../../lib/utils';
import { Task } from '../../types';

export const FocusModeView: React.FC = () => {
  const { tasks, updateTask, analytics, logActivity } = useTasks();

  const [mode, setMode] = useState<'pomodoro' | 'short_break' | 'long_break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    tasks.find(t => t.status !== 'completed')?.id || ''
  );
  const [sessionsCompleted, setSessionsCompleted] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const durationMap = {
    pomodoro: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Switch modes
  const handleModeChange = (newMode: 'pomodoro' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durationMap[newMode]);
  };

  // Timer Tick effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (soundEnabled) playChimeSound();

            if (mode === 'pomodoro') {
              setSessionsCompleted(s => s + 1);
              if (selectedTask) {
                // Update progress slightly or log activity
                logActivity('completed a focus session on', selectedTask.title);
              }
              handleModeChange('short_break');
            } else {
              handleModeChange('pomodoro');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedTask, soundEnabled]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durationMap[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = durationMap[mode];
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border-[1.5px] border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Deep Work & Pomodoro Timer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink dark:text-white tracking-tight">
          Focus Mode
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted mt-1 max-w-lg mx-auto">
          Eliminate distractions, focus on a single academic mileink, and build deep study streaks.
        </p>
      </div>

      {/* Main Focus Card */}
      <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 sm:p-10 shadow-none flex flex-col items-center">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 rounded-none bg-ink-faint dark:bg-ink p-1 mb-8">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`rounded-none px-4 py-2 text-xs font-bold transition-all ${
              mode === 'pomodoro'
                ? 'bg-bg dark:bg-ink text-indigo-600 dark:text-indigo-400 shadow-none'
                : 'text-ink-muted hover:text-ink dark:hover:text-white'
            }`}
          >
            Study Block (25m)
          </button>

          <button
            onClick={() => handleModeChange('short_break')}
            className={`rounded-none px-4 py-2 text-xs font-bold transition-all ${
              mode === 'short_break'
                ? 'bg-bg dark:bg-ink text-emerald-600 dark:text-emerald-400 shadow-none'
                : 'text-ink-muted hover:text-ink dark:hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>

          <button
            onClick={() => handleModeChange('long_break')}
            className={`rounded-none px-4 py-2 text-xs font-bold transition-all ${
              mode === 'long_break'
                ? 'bg-bg dark:bg-ink text-cyan-600 dark:text-cyan-400 shadow-none'
                : 'text-ink-muted hover:text-ink dark:hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Digital Timer Display */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <div className="font-mono text-7xl sm:text-8xl font-black tracking-tighter text-ink dark:text-white">
            {formattedTime}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-ink-muted mt-2">
            {mode === 'pomodoro' ? '🔥 Focus Time' : '☕ Recharge Break'}
          </span>
        </div>

        {/* Circular Progress Bar */}
        <div className="w-full max-w-md h-2 rounded-full bg-ink-faint dark:bg-ink overflow-hidden my-6">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={resetTimer}
            className="p-3 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-bg shadow-none"
            title="Reset Timer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center h-16 w-36 rounded-none font-bold text-white shadow-none active:scale-95 transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <div className="flex items-center gap-2 text-base">
                <Pause className="h-5 w-5 fill-current" />
                <span>Pause</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-base">
                <Play className="h-5 w-5 fill-current" />
                <span>Start</span>
              </div>
            )}
          </button>

          <button
            onClick={() => handleModeChange(mode === 'pomodoro' ? 'short_break' : 'pomodoro')}
            className="p-3 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink text-ink-muted dark:text-ink-muted hover:bg-bg shadow-none"
            title="Skip Interval"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Focus Target Task Selector */}
        <div className="w-full max-w-lg mt-8 pt-6 border-t-[1.5px] border-ink-faint dark:border-ink-faint">
          <label className="block text-xs font-bold text-ink-muted dark:text-ink-muted uppercase tracking-wider mb-2 text-center">
            Currently Focusing On
          </label>
          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink dark:text-white focus:outline-hidden"
          >
            <option value="">-- Select a Task to Focus --</option>
            {tasks
              .filter(t => t.status !== 'completed')
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.progress}% done)
                </option>
              ))}
          </select>

          {selectedTask && (
            <div className="mt-3 p-3 rounded-none bg-indigo-50/60 dark:bg-indigo-950/40 border-[1.5px] border-indigo-200/60 dark:border-indigo-800/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span className="font-semibold text-ink dark:text-white truncate">
                  {selectedTask.title}
                </span>
              </div>
              <button
                onClick={() =>
                  updateTask(selectedTask.id, {
                    status: 'completed',
                    progress: 100,
                    completedAt: new Date().toISOString()
                  })
                }
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex-shrink-0"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Done</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Focus Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-4 text-center">
          <span className="text-xs font-semibold text-ink-muted">Completed Sessions</span>
          <p className="text-2xl font-black text-ink dark:text-white mt-1">
            {sessionsCompleted} 🍅
          </p>
        </div>

        <div className="rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-4 text-center">
          <span className="text-xs font-semibold text-ink-muted">Total Focus Time Today</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {sessionsCompleted * 25} mins
          </p>
        </div>

        <div className="rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-4 text-center">
          <span className="text-xs font-semibold text-ink-muted">Daily Study Goal</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {Math.round(((sessionsCompleted * 25) / 120) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
};
