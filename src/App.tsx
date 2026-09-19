import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightPanel } from './components/layout/RightPanel';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
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
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { SettingsView } from './components/settings/SettingsView';
import { ExamsView } from './components/exams/ExamsView';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveView} />;
      case 'tasks':
        return <TasksView initialFilter="all" />;
      case 'completed':
        return <TasksView initialFilter="completed" />;
      case 'upcoming':
        return <UpcomingDeadlinesView />;
      case 'this_week':
        return <ThisWeekView />;
      case 'overdue':
        return <OverdueView />;
      case 'calendar':
        return <CalendarView />;
      case 'subjects':
        return <SubjectsView />;
      case 'announcements':
        return <AnnouncementsView onNavigate={setActiveView} />;
      case 'focus':
        return <FocusModeView />;
      case 'exams':
        return <ExamsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-ink text-ink dark:text-bg flex flex-col font-sans transition-colors">
      <Navbar onNavigate={setActiveView} activeView={activeView} />
      
      <div className="flex-1 grid lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr_320px] w-full items-stretch">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        
        <main className="p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8 flex flex-col gap-8 min-w-0">
          {renderActiveView()}
        </main>

        <RightPanel onNavigate={setActiveView} />
      </div>

      <MobileNav activeView={activeView} onNavigate={setActiveView} />
      
      <TaskDetailModal />
      <TaskFormModal />
      <SubjectFormModal />
      <NotificationDrawer onNavigate={setActiveView} />
      <NotificationToastContainer onNavigate={setActiveView} />
      <GlobalSearchModal onNavigate={setActiveView} />
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
