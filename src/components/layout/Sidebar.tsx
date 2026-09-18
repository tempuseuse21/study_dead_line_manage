import React from 'react';
import { useTasks } from '../../context/TaskContext';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const { tasks, subjects, analytics } = useTasks();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', label: `All Tasks [${tasks.length}]` },
    { id: 'announcements', label: 'Notice Board' },
    { id: 'upcoming', label: 'Deadlines' },
    { id: 'calendar', label: 'Calendar' }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[320px] border-r-[1.5px] border-ink bg-bg dark:bg-ink p-8 h-[calc(100vh-89px)] sticky top-[89px] overflow-y-auto">
      
      <div className="mb-10">
        <span className="mono mb-2 block text-ink dark:text-bg">Academic Index</span>
        <nav className="flex flex-col gap-1">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-left py-2 font-semibold text-[0.9rem] flex justify-between items-center cursor-pointer border-b-[1.5px] border-transparent transition-colors ${
                  isActive ? 'text-accent border-ink dark:border-bg' : 'text-ink dark:text-bg hover:border-ink dark:hover:border-bg'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mb-10">
        <span className="mono mb-2 block text-ink dark:text-bg">Core Subjects</span>
        <nav className="flex flex-col gap-1">
          {subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => onNavigate('tasks')}
              className="text-left py-2 font-semibold text-[0.9rem] flex items-center cursor-pointer border-b-[1.5px] border-transparent text-ink dark:text-bg hover:border-ink dark:hover:border-bg transition-colors"
            >
              <span 
                className="w-2.5 h-2.5 inline-block border-[1.5px] border-ink mr-2" 
                style={{ backgroundColor: subject.color }}
              />
              {subject.code}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <span className="mono mb-1 block text-ink dark:text-bg">Session Progress</span>
        <div className="font-mono text-3xl font-normal text-ink dark:text-bg">{analytics.completionRate}%</div>
        <div className="w-full h-2 border-[1.5px] border-ink mt-2 bg-transparent">
          <div 
            className="h-full bg-ink dark:bg-bg"
            style={{ width: `${analytics.completionRate}%` }}
          />
        </div>
      </div>

    </aside>
  );
};
