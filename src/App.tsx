import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { CompletedTasksView } from './components/tasks/CompletedTasksView';
import { UpcomingDeadlinesView } from './components/deadlines/UpcomingDeadlinesView';
import { ThisWeekView } from './components/deadlines/ThisWeekView';
import { OverdueView } from './components/deadlines/OverdueView';
import { CalendarView } from './components/calendar/CalendarView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { SubjectFormModal } from './components/subjects/SubjectFormModal';
import { FocusModeView } from './components/focus/FocusModeView';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { NotificationToastContainer } from './components/notifications/NotificationToastContainer';
import { ExamsView } from './components/exams/ExamsView';
import { TimetableView } from './components/timetable/TimetableView';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveView} />;
      case 'tasks':
        return <TasksView />;
      case 'completed':
        return <CompletedTasksView />;
      case 'upcoming':
        return <UpcomingDeadlinesView />;
      case 'this_week':
        return <ThisWeekView />;
      case 'overdue':
        return <OverdueView />;
      case 'calendar':
        return <CalendarView />;
      case 'timetable':
        return <TimetableView onNavigate={setActiveView} />;
      case 'subjects':
        return <SubjectsView />;
      case 'announcements':
        return <AnnouncementsView onNavigate={setActiveView} />;
      case 'focus':
        return <FocusModeView />;
      case 'exams':
        return <ExamsView />;
      default:
        return <DashboardView onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-ink text-ink dark:text-bg flex flex-col font-sans transition-colors">
      <Navbar onNavigate={setActiveView} activeView={activeView} />
      
      <div className="flex-1 grid lg:grid-cols-[280px_1fr] w-full items-stretch">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        
        <main className="p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8 flex flex-col gap-8 min-w-0">
          {renderActiveView()}
        </main>
      </div>

      <MobileNav activeView={activeView} onNavigate={setActiveView} />
      
      <TaskDetailModal />
      <TaskFormModal />
      <SubjectFormModal />
      <NotificationDrawer onNavigate={setActiveView} />
      <NotificationToastContainer onNavigate={setActiveView} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ThemeProvider>
  );
}
