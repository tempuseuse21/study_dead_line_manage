import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';

interface DashboardViewProps {
  onNavigate?: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { tasks, subjects, announcements, setIsCreateTaskModalOpen } = useTasks();
  
  const activeTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <>
      <div className="border-b-[1.5px] border-ink-faint pb-8">
        <span className="mono text-accent block mb-4">[ 01 ] Global Dashboard</span>
        <h2 className="font-serif text-5xl font-semibold leading-[0.9] tracking-tight mb-6 text-ink dark:text-bg">
          Assignment <br />& Class Manager
        </h2>
        <p className="max-w-md text-[0.95rem] text-ink dark:text-bg">
          Shared curriculum schedules, assignments, and official notices from the Class Representative.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-[1.5px] border-ink p-6 flex flex-col gap-4 bg-transparent">
          <span className="mono text-ink dark:text-bg">Open Tasks</span>
          <div className="font-mono text-5xl leading-none text-ink dark:text-bg">
            {activeTasks.length.toString().padStart(2, '0')}
          </div>
        </div>
        <div className="border-[1.5px] border-ink p-6 flex flex-col gap-4 bg-transparent">
          <span className="mono text-ink dark:text-bg">CR Notices</span>
          <div className="font-mono text-5xl leading-none text-accent">
            {announcements.length.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="border-[1.5px] border-ink p-8 bg-bg dark:bg-ink">
        <span className="mono block mb-8 text-ink dark:text-bg">Post Assignment Quick Action</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-2">
            <label className="mono block mb-2 text-ink dark:text-bg">Task Title</label>
            <input 
              type="text" 
              placeholder="e.g. Lab 4: SQL Query Optimization"
              className="w-full bg-transparent border-b-[1.5px] border-ink p-2 text-[0.9rem] focus:outline-none focus:border-accent text-ink dark:text-bg"
            />
          </div>
          <div>
            <label className="mono block mb-2 text-ink dark:text-bg">Due Date</label>
            <input 
              type="date" 
              className="w-full bg-transparent border-b-[1.5px] border-ink p-2 text-[0.9rem] focus:outline-none focus:border-accent text-ink dark:text-bg"
            />
          </div>
          <div>
            <label className="mono block mb-2 text-ink dark:text-bg">Subject</label>
            <select className="w-full bg-transparent border-b-[1.5px] border-ink p-2 text-[0.9rem] focus:outline-none focus:border-accent text-ink dark:text-bg">
              {subjects.map(s => (
                <option key={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <span className="mono cursor-pointer underline text-ink dark:text-bg">
            + Advanced Options
          </span>
          <button 
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="mono bg-ink dark:bg-bg text-bg dark:text-ink px-8 py-4 font-bold uppercase hover:bg-accent dark:hover:bg-accent transition-colors"
          >
            Open Full Post
          </button>
        </div>
      </div>

      <div>
        <span className="mono text-ink dark:text-bg">Task Queue</span>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="border-[1.5px] border-ink bg-ink dark:bg-bg text-bg dark:text-ink px-3 py-1 text-[0.7rem] mono cursor-pointer">
            Show All
          </div>
          <div className="border-[1.5px] border-ink text-ink dark:text-bg px-3 py-1 text-[0.7rem] mono cursor-pointer">
            Due Today
          </div>
          <div className="border-[1.5px] border-ink text-ink dark:text-bg px-3 py-1 text-[0.7rem] mono cursor-pointer">
            Urgent
          </div>
        </div>

        {activeTasks.length > 0 ? (
           <div className="mt-8 flex flex-col gap-4">
            {activeTasks.slice(0, 3).map(task => (
              <div key={task.id} className="border-[1.5px] border-ink p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-lg text-ink dark:text-bg">{task.title}</h4>
                  <div className="mono text-[0.65rem] text-ink-muted mt-1">Due {task.dueDate}</div>
                </div>
                <div className="mono text-[0.7rem] px-2 py-1 border-[1.5px] border-ink text-ink dark:text-bg bg-transparent">
                  View
                </div>
              </div>
            ))}
           </div>
        ) : (
          <div className="mt-8 h-[200px] border-[1.5px] border-ink-faint flex items-center justify-center italic text-ink-muted bg-transparent">
            <span className="mono">No Active Tasks In Queue</span>
          </div>
        )}
      </div>
    </>
  );
};
