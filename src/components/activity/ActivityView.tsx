import React from 'react';
import { Activity, Clock, CheckCircle2, User, Sparkles } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const ActivityView: React.FC = () => {
  const { activities } = useTasks();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-emerald-500" />
          <span>Classmate & Group Activity Feed</span>
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted mt-1">
          Real-time timeline of assignment completions, task additions, and study sessions across your groups.
        </p>
      </div>

      <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink p-6 shadow-none">
        <div className="space-y-6">
          {activities.map((act, index) => (
            <div key={act.id} className="relative flex items-start gap-4">
              {/* Vertical line connecting entries */}
              {index !== activities.length - 1 && (
                <span className="absolute left-4 top-9 -bottom-6 w-0.5 bg-ink-faint dark:bg-ink" />
              )}

              <img
                src={act.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={act.userName}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-ink-900 z-10"
              />

              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted leading-snug">
                  <strong className="text-ink dark:text-white font-bold">{act.userName}</strong>{' '}
                  <span className="text-ink-muted dark:text-ink-muted">{act.action}</span>{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">"{act.targetTitle}"</strong>
                </p>
                <span className="text-[11px] text-ink-muted mt-1 block">
                  {new Date(act.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
