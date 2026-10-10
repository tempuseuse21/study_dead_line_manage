import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider } from './context/AuthContext';
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
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { NotificationToastContainer } from './components/notifications/NotificationToastContainer';
import { TimetableView } from './components/timetable/TimetableView';
import { SettingsView } from './components/settings/SettingsView';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { AdminPortalModal } from './components/admin/AdminPortalModal';
import { AuthModal } from './components/auth/AuthModal';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (!isAuthenticated || !user) {
    return <AuthModal forceFullPage={true} />;
  }

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
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-ink text-ink dark:text-bg flex flex-col font-sans transition-colors w-full max-w-full overflow-x-hidden">
      <Navbar onNavigate={setActiveView} activeView={activeView} />
      
      <div className="flex-1 grid lg:grid-cols-[280px_1fr] w-full max-w-full items-stretch min-w-0">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        
        <main className="p-3 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8 flex flex-col gap-8 min-w-0 w-full max-w-full">
          {renderActiveView()}
        </main>
      </div>

      <MobileNav activeView={activeView} onNavigate={setActiveView} />
      
      <TaskDetailModal />
      <TaskFormModal />
      <SubjectFormModal />
      <NotificationDrawer onNavigate={setActiveView} />
      <NotificationToastContainer onNavigate={setActiveView} />
      <GlobalSearchModal onNavigate={setActiveView} />
      <AdminPortalModal />
      <AuthModal />
      <PWAInstallPrompt />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
