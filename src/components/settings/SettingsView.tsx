import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Volume2,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  Sparkles,
  Save,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { playChimeSound } from '../../lib/utils';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, theme, setTheme } = useAuth();
  const { clearAllData, tasks, announcements, notifications } = useTasks();

  const [name, setName] = useState(user?.name || '');
  const [course, setCourse] = useState(user?.course || 'MSc Information Technology');
  const [semester, setSemester] = useState(user?.semester || 2);
  const [college, setCollege] = useState(user?.college || 'National Institute of Technology');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      course,
      semester: String(semester),
      college
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearAllData = () => {
    clearAllData();
    setShowConfirmClear(false);
    setClearedSuccess(true);
    setTimeout(() => setClearedSuccess(false), 3000);
  };

  const testAudio = () => {
    playChimeSound();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600" />
          <span>Account & System Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted mt-1">
          Customize your student profile, deadline escalation alerts, and application appearance.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 shadow-none">
          <h2 className="text-base font-bold text-ink dark:text-white mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-500" />
            <span>Student Profile</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-ink-muted dark:text-ink-muted mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2.5 font-medium text-ink dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-muted dark:text-ink-muted mb-1">
                  Email (read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink/60 px-3.5 py-2.5 text-ink-muted opacity-70"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-ink-muted dark:text-ink-muted mb-1">
                  Degree / Program
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2 text-ink dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-muted dark:text-ink-muted mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={e => setSemester(Number(e.target.value))}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3 py-2 text-ink dark:text-white"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                  <option value={3}>Semester 3</option>
                  <option value={4}>Semester 4</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink-muted dark:text-ink-muted mb-1">
                  College / Institute
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  className="w-full rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink px-3.5 py-2 text-ink dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedSuccess && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Profile changes updated!</span>
                </span>
              )}
              <button
                type="submit"
                className="ml-auto flex items-center gap-1.5 rounded-none bg-indigo-600 px-4 py-2 font-bold text-white shadow-none hover:bg-indigo-700"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Theme Settings */}
        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 shadow-none">
          <h2 className="text-base font-bold text-ink dark:text-white mb-3">
            Appearance & Theme
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-none border-[1.5px] text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950'
                  : 'border-ink-faint dark:border-ink-faint text-ink-muted dark:text-ink-muted'
              }`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-none border-[1.5px] text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-950 text-indigo-400'
                  : 'border-ink-faint dark:border-ink-faint text-ink-muted dark:text-ink-muted'
              }`}
            >
              <Moon className="h-4 w-4 text-indigo-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Sounds & Notifications */}
        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 shadow-none space-y-4">
          <h2 className="text-base font-bold text-ink dark:text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-500" />
            <span>Audio & Automatic Reminders</span>
          </h2>

          <div className="flex items-center justify-between p-3 rounded-none bg-bg dark:bg-ink/40 border-[1.5px] border-ink-faint dark:border-ink-faint text-xs">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="font-bold text-ink dark:text-white">Deadline Chime Audio</p>
                <p className="text-ink-muted dark:text-ink-muted text-[11px]">
                  Play sound when completing tasks or when a timer ends.
                </p>
              </div>
            </div>

            <button
              onClick={testAudio}
              className="px-3 py-1.5 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink text-ink-muted dark:text-bg font-semibold hover:bg-ink-faint"
            >
              Test Chime 🔔
            </button>
          </div>
        </div>

        {/* Data Management & Reset */}
        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink dark:text-white flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-rose-500" />
                <span>Data Management & Clean State</span>
              </h2>
              <p className="text-xs text-ink-muted dark:text-ink-muted mt-0.5">
                Current storage: {tasks.length} tasks, {announcements.length} notices, {notifications.length} notifications
              </p>
            </div>

            {clearedSuccess && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-none border-[1.5px] border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>All data cleared successfully!</span>
              </span>
            )}
          </div>

          <div className="p-4 rounded-none bg-rose-50/50 dark:bg-rose-950/20 border-[1.5px] border-rose-200/80 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-200">
                Clear All Custom Data
              </p>
              <p className="text-rose-700/80 dark:text-rose-400 text-[11px] mt-0.5">
                Resets all assignments, notifications, and announcements while keeping your 5 subjects.
              </p>
            </div>

            {showConfirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1.5 rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink text-ink-muted dark:text-ink-muted font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllData}
                  className="px-3 py-1.5 rounded-none bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1 shadow-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Confirm Clear</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-3.5 py-2 rounded-none bg-bg dark:bg-ink border-[1.5px] border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear All Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
