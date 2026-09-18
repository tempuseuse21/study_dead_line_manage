import React, { useState } from 'react';
import { BookOpen, Plus, User, Hash, CheckCircle2, Clock, Trash2, ArrowRight } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from '../tasks/TaskCard';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    tasks,
    deleteSubject,
    setIsCreateSubjectModalOpen,
    setIsCreateTaskModalOpen
  } = useTasks();

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  const selectedSubject = subjects.find(s => s.id === activeSubjectId);
  const subjectTasks = tasks.filter(t => t.subjectId === activeSubjectId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span>MSc IT Course Subjects & Curriculum</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted mt-1">
            Organize academic workloads by subject, track completion progress, and faculty details.
          </p>
        </div>

        <button
          onClick={() => setIsCreateSubjectModalOpen(true)}
          className="flex items-center gap-2 rounded-none bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-none hover:bg-indigo-700 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(subject => {
          const allTasksForSubject = tasks.filter(t => t.subjectId === subject.id);
          const completedTasks = allTasksForSubject.filter(t => t.status === 'completed');
          const total = allTasksForSubject.length;
          const pct = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;
          const isSelected = activeSubjectId === subject.id;

          return (
            <div
              key={subject.id}
              onClick={() => setActiveSubjectId(isSelected ? null : subject.id)}
              className={`group relative rounded-3xl border-[1.5px] p-5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-none'
                  : 'bg-bg dark:bg-ink border-ink-faint dark:border-ink-faint shadow-none hover:shadow-none hover:border-ink-faint dark:hover:border-ink-faint'
              }`}
            >
              {/* Top Accent & Code */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-2.5 py-1 rounded-none text-xs font-bold border"
                  style={{
                    backgroundColor: `${subject.color}15`,
                    color: subject.color,
                    borderColor: `${subject.color}30`
                  }}
                >
                  {subject.code}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span>{subject.credits || 4} Credits</span>
                  <span>•</span>
                  <span>Sem {subject.semester || 2}</span>
                </div>
              </div>

              {/* Subject Title & Professor */}
              <h3 className="text-base font-bold text-ink dark:text-white line-clamp-1 mb-1">
                {subject.name}
              </h3>
              <p className="text-xs text-ink-muted dark:text-ink-muted flex items-center gap-1 mb-4">
                <User className="h-3.5 w-3.5" />
                <span>{subject.professor || 'Department Faculty'}</span>
              </p>

              {/* Progress Tracker */}
              <div className="space-y-1.5 pt-3 border-t-[1.5px] border-ink-faint dark:border-ink-faint">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-muted dark:text-ink-muted">
                    {completedTasks.length}/{total} tasks complete
                  </span>
                  <span className="font-bold text-ink dark:text-white">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-ink-faint dark:bg-ink overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: subject.color
                    }}
                  />
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                  <span>{isSelected ? 'Hide Tasks' : 'View Tasks'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (confirm(`Delete subject "${subject.name}"?`)) {
                      deleteSubject(subject.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-rose-500 transition-opacity"
                  title="Delete Subject"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Subject Tasks Drawer */}
      {selectedSubject && (
        <div className="rounded-3xl border-[1.5px] border-ink-faint dark:border-ink-faint bg-bg/70 dark:bg-ink/60 p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: selectedSubject.color }}
              />
              <h2 className="text-lg font-bold text-ink dark:text-white">
                Assignments & Tasks for {selectedSubject.name} ({subjectTasks.length})
              </h2>
            </div>

            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="flex items-center gap-1.5 rounded-none bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-none hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task for {selectedSubject.code}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjectTasks.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-bg dark:bg-ink rounded-none border-[1.5px] border-ink-faint dark:border-ink-faint text-ink-muted">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-ink-muted dark:text-ink-muted" />
                <p className="text-xs">No tasks recorded for this subject yet.</p>
              </div>
            ) : (
              subjectTasks.map(task => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
};
