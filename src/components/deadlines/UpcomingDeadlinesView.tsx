import React from 'react';
import { Clock, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from '../tasks/TaskCard';
import { Task } from '../../types';

export const UpcomingDeadlinesView: React.FC = () => {
  const { tasks } = useTasks();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

  const endOfNextWeek = new Date(endOfWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

  // Group active tasks
  const activeTasks = tasks.filter(t => t.status !== 'completed');

  const todayTasks: Task[] = [];
  const tomorrowTasks: Task[] = [];
  const thisWeekTasks: Task[] = [];
  const nextWeekTasks: Task[] = [];
  const laterTasks: Task[] = [];

  activeTasks.forEach(task => {
    const [h, m] = (task.dueTime || '23:59').split(':').map(Number);
    const [y, mon, d] = task.dueDate.split('-').map(Number);
    const taskDate = new Date(y, mon - 1, d, h, m);

    if (task.dueDate === todayStr) {
      todayTasks.push(task);
    } else if (task.dueDate === tomorrowStr) {
      tomorrowTasks.push(task);
    } else if (taskDate <= endOfWeek) {
      thisWeekTasks.push(task);
    } else if (taskDate <= endOfNextWeek) {
      nextWeekTasks.push(task);
    } else {
      laterTasks.push(task);
    }
  });

  const sections = [
    { title: 'Due Today', tasks: todayTasks, color: 'text-amber-500', badge: 'Critical Attention', bg: 'bg-amber-500/10' },
    { title: 'Due Tomorrow', tasks: tomorrowTasks, color: 'text-indigo-500', badge: 'High Priority', bg: 'bg-indigo-500/10' },
    { title: 'This Week', tasks: thisWeekTasks, color: 'text-ink dark:text-bg', badge: 'Upcoming', bg: 'bg-ink-faint dark:bg-ink0/10' },
    { title: 'Next Week', tasks: nextWeekTasks, color: 'text-purple-500', badge: 'On Horizon', bg: 'bg-purple-500/10' },
    { title: 'Later & Future Submissions', tasks: laterTasks, color: 'text-ink-muted', badge: 'Planned', bg: 'bg-ink-muted/10' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tracking-tight flex items-center gap-2">
          <Clock className="h-6 w-6 text-indigo-600" />
          <span>Upcoming Academic Deadlines</span>
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted mt-1">
          Chronological breakdown of assignments, project deliverables, and lab submission windows.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map(sec => {
          if (sec.tasks.length === 0) return null;
          return (
            <div key={sec.title} className="space-y-3">
              <div className="flex items-center justify-between border-b-[1.5px] border-ink-faint dark:border-ink-faint pb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-base font-bold ${sec.color}`}>{sec.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sec.bg} ${sec.color}`}>
                    {sec.tasks.length} {sec.tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-ink-muted">{sec.badge}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sec.tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}

        {activeTasks.length === 0 && (
          <div className="p-12 text-center rounded-3xl border-[1.5px] border-dashed border-ink-faint dark:border-ink-faint bg-bg dark:bg-ink">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-ink dark:text-white">Nothing Due Soon!</h3>
            <p className="text-xs text-ink-muted dark:text-ink-muted mt-1">
              You have no active pending deadlines. Great job staying ahead of your academic commitments!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
