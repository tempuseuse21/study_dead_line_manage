import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';

interface NavbarProps {
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const {
    setIsCreateTaskModalOpen,
  } = useTasks();

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b-[1.5px] border-ink bg-bg dark:bg-ink px-6 py-6 transition-colors">
      <div 
        onClick={() => onNavigate('dashboard')}
        className="cursor-pointer"
      >
        <span className="mono mb-1 block text-[0.6rem] text-ink dark:text-bg">StudySync Project</span>
        <h1 className="font-serif text-3xl sm:text-4xl italic font-semibold leading-none text-ink dark:text-bg">
          Academic OS
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="mono hidden sm:block bg-ink dark:bg-bg text-bg dark:text-ink px-4 py-2 text-[0.7rem] hover:bg-accent dark:hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? 'Light Mode' : 'Night Mode'}
        </button>
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="mono bg-accent text-bg px-4 py-2 text-[0.7rem] hover:bg-ink dark:hover:bg-bg transition-colors"
        >
          Add Task
        </button>
      </div>
    </header>
  );
};
