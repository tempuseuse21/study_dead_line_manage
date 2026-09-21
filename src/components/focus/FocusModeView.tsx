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
  Zap
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { playChimeSound } from '../../lib/utils';

export const FocusModeView: React.FC = () => {
  const { tasks, updateTask, analytics, logActivity, addFocusSession, studyPreferences } = useTasks();
  const pomoDuration = studyPreferences.defaultSessionDurationMinutes * 60;
  const shortBreakDuration = studyPreferences.defaultBreakDurationMinutes * 60;
  const longBreakDuration = studyPreferences.longBreakDurationMinutes * 60;

  const [mode, setMode] = useState<'pomodoro' | 'short_break' | 'long_break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(pomoDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    tasks.find(t => t.status !== 'completed')?.id || ''
  );
  const [sessionsCompleted, setSessionsCompleted] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const durationMap = {
    pomodoro: pomoDuration,
    short_break: shortBreakDuration,
    long_break: longBreakDuration
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleModeChange = (newMode: 'pomodoro' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durationMap[newMode]);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (soundEnabled) playChimeSound();

            if (mode === 'pomodoro') {
              const completedCount = sessionsCompleted + 1;
              setSessionsCompleted(completedCount);
              if (selectedTask) {
                logActivity('completed a focus session on', selectedTask.title, 'task', selectedTask.id);
              }
              addFocusSession({
                taskId: selectedTask?.id,
                taskTitle: selectedTask?.title || 'Free study',
                durationMinutes: Math.round(pomoDuration / 60),
                subjectId: selectedTask?.subjectId
              });
              const isLongBreak = completedCount % studyPreferences.sessionsBeforeLongBreak === 0;
              handleModeChange(isLongBreak ? 'long_break' : 'short_break');
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

  // SVG Circular Ring calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deep Work & Focus Timer</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-main)]">
          Pomodoro Focus Studio
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto">
          Eliminate distractions, focus on a single task, and build deep study momentum.
        </p>
      </div>

      {/* Main Timer Glass Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Chime Sound' : 'Enable Chime Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] mb-6 sm:mb-8">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'gradient-brand-bg text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Study Block ({Math.round(pomoDuration / 60)}m)
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Short Break ({Math.round(shortBreakDuration / 60)}m)
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Long Break ({Math.round(longBreakDuration / 60)}m)
          </button>
        </div>

        {/* SVG Circular Ring Timer */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r={radius}
              className="stroke-[var(--bg-card-subtle)] fill-none"
              strokeWidth="12"
            />
            <circle
              cx="128"
              cy="128"
              r={radius}
              className="fill-none transition-all duration-1000 ease-linear"
              stroke={mode === 'pomodoro' ? '#6366f1' : mode === 'short_break' ? '#10b981' : '#06b6d4'}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-main)]">
              {formattedTime}
            </span>
            <span className="text-[0.7rem] font-bold font-mono uppercase tracking-widest text-[var(--text-muted)] mt-1">
              {mode === 'pomodoro' ? '🔥 Focus Time' : '☕ Recharge Break'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-white text-base shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'gradient-brand-bg'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleModeChange(mode === 'pomodoro' ? 'short_break' : 'pomodoro')}
            className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Skip Interval"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Focusing Task Selector */}
        <div className="w-full max-w-lg mt-8 pt-6 border-t border-[var(--border-subtle)] space-y-2">
          <label className="block text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider text-center">
            Currently Focusing On
          </label>
          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--text-main)] focus:outline-none"
          >
            <option value="">-- Free Study (No Task) --</option>
            {tasks
              .filter(t => t.status !== 'completed')
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.progress}% completed)
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Focus Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-1">
          <span className="text-xs font-semibold text-[var(--text-muted)] font-display">Completed Sessions</span>
          <p className="font-mono text-3xl font-extrabold text-[var(--text-main)]">
            {sessionsCompleted} 🍅
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-1">
          <span className="text-xs font-semibold text-[var(--text-muted)] font-display">Total Focus Time Today</span>
          <p className="font-mono text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {sessionsCompleted * Math.round(pomoDuration / 60)} mins
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-1">
          <span className="text-xs font-semibold text-[var(--text-muted)] font-display">Daily Target Progress</span>
          <p className="font-mono text-3xl font-extrabold text-emerald-500">
            {Math.round(((sessionsCompleted * Math.round(pomoDuration / 60)) / (studyPreferences.dailyStudyTargetHours * 60)) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
};
