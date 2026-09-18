import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  INITIAL_ACTIVITY,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_PREFERENCES,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS
} from '../lib/initialData';
import { playNotificationChime, triggerCompletionConfetti, formatDateDisplay } from '../lib/utils';
import {
  triggerWebsiteNotification,
  subscribeToBroadcastEvents,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission
} from '../lib/webNotifications';
import {
  ActivityLog,
  AppNotification,
  FocusSession,
  NotificationPreferences,
  Priority,
  Subject,
  Task,
  TaskStatus,
  UserAnalytics,
  ClassAnnouncement
} from '../types';

interface TaskFilterOptions {
  searchQuery: string;
  status: TaskStatus | 'all';
  priority: Priority | 'all';
  subjectId: string | 'all';
  tag: string | 'all';
  quickFilter: 'all' | 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'high_priority' | 'completed';
  sortBy: 'urgency' | 'deadline' | 'priority' | 'progress' | 'created';
  sortOrder: 'asc' | 'desc';
}

interface TaskContextType {
  tasks: Task[];
  subjects: Subject[];
  notifications: AppNotification[];
  activities: ActivityLog[];
  focusSessions: FocusSession[];
  announcements: ClassAnnouncement[];
  preferences: NotificationPreferences;
  filters: TaskFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterOptions>>;
  resetFilters: () => void;
  filteredTasks: Task[];
  
  // Modals & Selected Task
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;

  // Actions
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string, passcode?: string) => Promise<{ success: boolean; error?: string }>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
  addAttachment: (taskId: string, file: { name: string; size: number; type: string; url: string }) => Promise<void>;
  
  markNotificationRead: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  addFocusSession: (session: { taskId?: string; taskTitle?: string; durationMinutes: number }) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;

  // Announcements (CR)
  createAnnouncement: (annData: Partial<ClassAnnouncement>, passcode: string) => Promise<{ success: boolean; data?: ClassAnnouncement; error?: string }>;
  deleteAnnouncement: (annId: string) => Promise<void>;
  markAnnouncementRead: (annId: string) => Promise<void>;
  markAllAnnouncementsRead: () => Promise<void>;
  toggleAnnouncementRead: (annId: string) => Promise<void>;
  unreadAnnouncementsCount: number;

  // Website Web Notification Utilities
  browserNotificationPermission: NotificationPermission | 'unsupported';
  enableBrowserNotifications: () => Promise<NotificationPermission | 'unsupported'>;
  sendTestWebsiteNotification: () => void;

  // Clear / Reset All Data
  clearAllData: () => void;

  // Analytics
  analytics: UserAnalytics;

  // Live Timer Ticker value (incremented every 10s to force re-render of countdowns)
  ticker: number;
}

const defaultFilters: TaskFilterOptions = {
  searchQuery: '',
  status: 'all',
  priority: 'all',
  subjectId: 'all',
  tag: 'all',
  quickFilter: 'all',
  sortBy: 'urgency',
  sortOrder: 'asc'
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean up legacy cached data keys on first run
  useEffect(() => {
    try {
      if (!localStorage.getItem('studysync_v3_initialized')) {
        localStorage.removeItem('studysync_tasks');
        localStorage.removeItem('studysync_tasks_v2');
        localStorage.removeItem('studysync_announcements');
        localStorage.removeItem('studysync_announcements_v2');
        localStorage.removeItem('studysync_notifications');
        localStorage.removeItem('studysync_notifications_v2');
        localStorage.removeItem('studysync_activities');
        localStorage.removeItem('studysync_activities_v2');
        localStorage.removeItem('studysync_focus');
        localStorage.removeItem('studysync_focus_v2');
        localStorage.setItem('studysync_v3_initialized', 'true');
      }
    } catch {}
  }, []);

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('studysync_tasks_v3');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('studysync_notifications_v3');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('studysync_activities_v3');
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY;
    } catch {
      return INITIAL_ACTIVITY;
    }
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    try {
      const saved = localStorage.getItem('studysync_focus_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('studysync_announcements_v3');
      return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('studysync_preferences_v3');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATION_PREFERENCES;
    } catch {
      return INITIAL_NOTIFICATION_PREFERENCES;
    }
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilterOptions>(defaultFilters);
  const [ticker, setTicker] = useState(0);
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => getBrowserNotificationPermission());

  // Listen for broadcast events from other tabs
  useEffect(() => {
    const unsubscribe = subscribeToBroadcastEvents((event: any) => {
      if (!event || !event.payload) return;
      if (event.type === 'NEW_TASK') {
        triggerWebsiteNotification({
          type: 'task',
          title: event.payload.title,
          message: event.payload.message || `New assignment posted`,
          subjectName: event.payload.subjectName,
          subjectCode: event.payload.subjectCode,
          subjectColor: event.payload.subjectColor,
          priority: event.payload.priority,
          dueDate: event.payload.dueDate,
          taskId: event.payload.taskId,
          broadcast: false,
          chimeType: event.payload.priority === 'urgent' ? 'alert' : 'success'
        });
      } else if (event.type === 'NEW_ANNOUNCEMENT') {
        triggerWebsiteNotification({
          type: 'announcement',
          title: event.payload.title,
          message: event.payload.message,
          authorName: event.payload.authorName,
          subjectName: event.payload.subjectName,
          subjectCode: event.payload.subjectCode,
          priority: event.payload.priority,
          announcementId: event.payload.announcementId,
          broadcast: false,
          chimeType: event.payload.priority === 'urgent' ? 'alert' : 'warning'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const enableBrowserNotifications = async (): Promise<NotificationPermission | 'unsupported'> => {
    const res = await requestBrowserNotificationPermission();
    setBrowserNotificationPermission(res);
    if (res === 'granted') {
      triggerWebsiteNotification({
        type: 'system',
        title: '🔔 Website Notifications Enabled',
        message: 'You will now receive instant desktop alerts for all class assignments and CR announcements!',
        chimeType: 'success',
        broadcast: false
      });
    }
    return res;
  };

  const sendTestWebsiteNotification = () => {
    triggerWebsiteNotification({
      type: 'announcement',
      title: '📢 Test Website Notification',
      message: 'Website notification system is active! Everyone in class receives live alerts for new tasks and notices.',
      authorName: 'Class Representative (CR)',
      priority: 'urgent',
      chimeType: 'alert',
      broadcast: false
    });
  };

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('studysync_tasks_v3', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('studysync_announcements_v3', JSON.stringify(announcements));
    } catch {}
  }, [announcements]);

  useEffect(() => {
    try {
      localStorage.setItem('studysync_notifications_v3', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('studysync_activities_v3', JSON.stringify(activities));
    } catch {}
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem('studysync_focus_v3', JSON.stringify(focusSessions));
    } catch {}
  }, [focusSessions]);

  useEffect(() => {
    try {
      localStorage.setItem('studysync_preferences_v3', JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  // Live timer interval (every 10s)
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // (Removed fetch from server on mount to prevent overriding localStorage with in-memory server state)

  // Filter and Sort Tasks
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

    return tasks
      .filter(task => {
        if (filters.subjectId !== 'all' && task.subjectId !== filters.subjectId) return false;
        if (filters.status !== 'all' && task.status !== filters.status) return false;
        if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
        if (filters.tag !== 'all' && (!task.tags || !task.tags.includes(filters.tag))) return false;

        // Search Query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchSubject = subjects.find(s => s.id === task.subjectId)?.name.toLowerCase().includes(q);
          const matchTags = task.tags?.some(tag => tag.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchSubject && !matchTags) return false;
        }

        // Quick Filters
        if (filters.quickFilter === 'today' && task.dueDate !== todayStr) return false;
        if (filters.quickFilter === 'tomorrow' && task.dueDate !== tomorrowStr) return false;
        if (
          filters.quickFilter === 'this_week' &&
          (task.dueDate < todayStr || task.dueDate > endOfWeekStr)
        )
          return false;
        if (filters.quickFilter === 'overdue' && (task.status !== 'overdue' && !(task.dueDate < todayStr && task.status !== 'completed')))
          return false;
        if (filters.quickFilter === 'high_priority' && task.priority !== 'high' && task.priority !== 'urgent')
          return false;
        if (filters.quickFilter === 'completed' && task.status !== 'completed') return false;

        return true;
      })
      .sort((a, b) => {
        // Pinned tasks always on top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (filters.sortBy === 'urgency') {
          const aDateTime = `${a.dueDate}T${a.dueTime || '23:59'}`;
          const bDateTime = `${b.dueDate}T${b.dueTime || '23:59'}`;
          return aDateTime.localeCompare(bDateTime);
        }

        if (filters.sortBy === 'deadline') {
          return a.dueDate.localeCompare(b.dueDate);
        }

        if (filters.sortBy === 'priority') {
          const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        }

        if (filters.sortBy === 'progress') {
          return (b.progress || 0) - (a.progress || 0);
        }

        if (filters.sortBy === 'created') {
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        }

        return 0;
      });
  }, [tasks, filters, subjects]);

  // Analytics Computation
  const analytics: UserAnalytics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const overdueTasks = tasks.filter(
      t => t.status === 'overdue' || (t.dueDate < todayStr && t.status !== 'completed')
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueRate = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;

    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    const tasksBySubject = subjects.map(s => {
      const subjectTasks = tasks.filter(t => t.subjectId === s.id);
      return {
        subjectName: s.code || s.name,
        color: s.color,
        count: subjectTasks.length,
        completed: subjectTasks.filter(t => t.status === 'completed').length
      };
    });

    const tasksByPriority = (['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => ({
      priority: p,
      count: tasks.filter(t => t.priority === p).length
    }));

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      onTimeCompletionRate: Math.max(0, 100 - overdueRate),
      overdueRate,
      completedThisWeek: completedTasks,
      currentStreak: 5,
      bestStreak: 12,
      totalFocusMinutes,
      tasksBySubject,
      tasksByPriority,
      weeklyActivity: [
        { day: 'Mon', date: '2026-08-24', completedCount: 3, dueCount: 2 },
        { day: 'Tue', date: '2026-08-25', completedCount: 1, dueCount: 2 },
        { day: 'Wed', date: '2026-08-26', completedCount: 0, dueCount: 1 },
        { day: 'Thu', date: '2026-08-27', completedCount: 0, dueCount: 0 },
        { day: 'Fri', date: '2026-08-28', completedCount: 0, dueCount: 1 },
        { day: 'Sat', date: '2026-08-29', completedCount: 0, dueCount: 1 },
        { day: 'Sun', date: '2026-08-30', completedCount: 0, dueCount: 0 }
      ]
    };
  }, [tasks, subjects, focusSessions]);

  const resetFilters = () => setFilters(defaultFilters);

  // Actions
  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      subjectId: taskData.subjectId || subjects[0]?.id,
      createdById: 'student',
      createdByName: 'Student',
      assignedToIds: ['all'],
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      dueTime: taskData.dueTime || '23:59',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'not_started',
      progress: taskData.progress || 0,
      tags: taskData.tags || ['Assignment'],
      subtasks: taskData.subtasks || [],
      attachments: taskData.attachments || [],
      comments: taskData.comments || [],
      dependencies: taskData.dependencies || [],
      reminders: taskData.reminders || [
        { id: 'rem_def', type: '1_day', minutesBefore: 1440, label: '1 day before', enabled: true }
      ],
      recurring: taskData.recurring || 'none',
      notifyTarget: 'everyone',
      isPinned: false,
      isVerifiedOfficial: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    // Add activity
    const newAct: ActivityLog = {
      id: `act_${Date.now()}`,
      userId: 'student',
      userName: 'Student',
      action: 'created assignment',
      targetType: 'task',
      targetId: newTask.id,
      targetTitle: newTask.title,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev.slice(0, 40)]);

    // Add to notifications
    const subjectObj = subjects.find(s => s.id === newTask.subjectId);
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: 'student',
      taskId: newTask.id,
      type: 'TASK_CREATED',
      title: `New Assignment: ${newTask.title}`,
      message: `${subjectObj?.name || 'Class Task'} (${subjectObj?.code || ''}) • Due ${formatDateDisplay(newTask.dueDate, newTask.dueTime)} • Priority: ${newTask.priority.toUpperCase()}`,
      scheduledAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      isRead: false,
      severity: newTask.priority === 'urgent' ? 'danger' : newTask.priority === 'high' ? 'warning' : 'info'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Post to server
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
    } catch {}

    // Trigger website notification (browser desktop alert + in-app live toast + audio chime + broadcast)
    triggerWebsiteNotification({
      type: 'task',
      title: newTask.title,
      message: `${subjectObj?.name || 'Assignment'} • Due ${formatDateDisplay(newTask.dueDate, newTask.dueTime)}`,
      subjectName: subjectObj?.name,
      subjectCode: subjectObj?.code,
      subjectColor: subjectObj?.color,
      priority: newTask.priority,
      dueDate: formatDateDisplay(newTask.dueDate, newTask.dueTime),
      taskId: newTask.id,
      chimeType: newTask.priority === 'urgent' ? 'alert' : newTask.priority === 'high' ? 'warning' : 'success',
      broadcast: true
    });

    return newTask;
  };

  const updateTask = async (taskId: string, data: Partial<Task>): Promise<Task> => {
    let updatedTask: Task | null = null;
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          updatedTask = { ...t, ...data, updatedAt: new Date().toISOString() };
          return updatedTask;
        }
        return t;
      })
    );

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : null));
    }

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {}

    return updatedTask || (data as Task);
  };

  const deleteTask = async (taskId: string, passcode?: string): Promise<{ success: boolean; error?: string }> => {
    if (passcode !== '2026') {
      return { success: false, error: 'Incorrect authorization passcode. Deletion denied.' };
    }

    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch {}

    return { success: true };
  };

  const toggleTaskComplete = async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isNowCompleted = task.status !== 'completed';
    const newStatus: TaskStatus = isNowCompleted ? 'completed' : 'not_started';
    const newProgress = isNowCompleted ? 100 : 0;
    const completedAt = isNowCompleted ? new Date().toISOString() : undefined;

    const updatedSubtasks = task.subtasks.map(st => ({
      ...st,
      completed: isNowCompleted,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined
    }));

    await updateTask(taskId, {
      status: newStatus,
      progress: newProgress,
      completedAt,
      subtasks: updatedSubtasks
    });

    if (isNowCompleted) {
      triggerCompletionConfetti();
      playNotificationChime();
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st => {
      if (st.id === subtaskId) {
        const nextCompleted = !st.completed;
        return {
          ...st,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined
        };
      }
      return st;
    });

    const totalSub = updatedSubtasks.length;
    const completedSub = updatedSubtasks.filter(s => s.completed).length;
    const calculatedProgress = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : task.progress;
    const calculatedStatus: TaskStatus =
      totalSub > 0 && completedSub === totalSub
        ? 'completed'
        : completedSub > 0
        ? 'in_progress'
        : task.status === 'completed'
        ? 'in_progress'
        : task.status;

    await updateTask(taskId, {
      subtasks: updatedSubtasks,
      progress: calculatedProgress,
      status: calculatedStatus
    });
  };

  const addComment = async (taskId: string, content: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !content.trim()) return;

    const newComment = {
      id: `com_${Date.now()}`,
      taskId,
      userId: 'student',
      userName: 'Classmate',
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    await updateTask(taskId, {
      comments: [...(task.comments || []), newComment]
    });
  };

  const addAttachment = async (
    taskId: string,
    file: { name: string; size: number; type: string; url: string }
  ): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newAtt = {
      id: `att_${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.url,
      uploaderId: 'student',
      uploaderName: 'Student',
      uploadedAt: new Date().toISOString()
    };

    await updateTask(taskId, {
      attachments: [...(task.attachments || []), newAtt]
    });
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = async (): Promise<void> => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string): Promise<void> => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addFocusSession = async (session: { taskId?: string; taskTitle?: string; durationMinutes: number }): Promise<void> => {
    const newSession: FocusSession = {
      id: `foc_${Date.now()}`,
      userId: 'student',
      taskId: session.taskId,
      taskTitle: session.taskTitle,
      durationMinutes: session.durationMinutes,
      completed: true,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
    setFocusSessions(prev => [newSession, ...prev]);
    triggerCompletionConfetti();
  };

  const updateNotificationPreferences = async (prefs: Partial<NotificationPreferences>): Promise<void> => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const createAnnouncement = async (annData: Partial<ClassAnnouncement>, passcode: string): Promise<{ success: boolean; data?: ClassAnnouncement; error?: string }> => {
    if ((passcode || '').trim() !== 'iamcr') {
      return { success: false, error: 'Incorrect authorization passcode. Announcement denied.' };
    }

    const newAnn: ClassAnnouncement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: annData.title || 'Class Announcement',
      content: annData.content || '',
      authorName: annData.authorName || 'Class Representative (CR)',
      authorRole: 'Class Representative (CR)',
      subjectId: annData.subjectId,
      isPinned: annData.isPinned || false,
      priority: annData.priority || 'normal',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setAnnouncements(prev => [newAnn, ...prev]);

    // Also add to notifications
    const subjectObj = subjects.find(s => s.id === newAnn.subjectId);
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: 'student',
      type: 'TASK_CREATED',
      title: `📢 CR Announcement: ${newAnn.title}`,
      message: `Posted by ${newAnn.authorName}${subjectObj ? ` (${subjectObj.code})` : ''}: ${newAnn.content}`,
      scheduledAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      isRead: false,
      severity: newAnn.priority === 'urgent' ? 'danger' : 'info'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Trigger website notification (desktop browser alert + in-app toast + high urgency chime + multi-tab broadcast)
    triggerWebsiteNotification({
      type: 'announcement',
      title: newAnn.title,
      message: newAnn.content,
      authorName: newAnn.authorName,
      subjectName: subjectObj?.name,
      subjectCode: subjectObj?.code,
      subjectColor: subjectObj?.color,
      priority: newAnn.priority,
      announcementId: newAnn.id,
      chimeType: newAnn.priority === 'urgent' ? 'alert' : 'warning',
      broadcast: true
    });

    return { success: true, data: newAnn };
  };

  const deleteAnnouncement = async (annId: string, passcode: string): Promise<{ success: boolean; error?: string }> => {
    if ((passcode || '').trim() !== '2026') {
      return { success: false, error: 'Incorrect authorization passcode. Deletion denied.' };
    }

    setAnnouncements(prev => prev.filter(a => a.id !== annId));
    return { success: true };
  };

  const markAnnouncementRead = async (annId: string): Promise<void> => {
    setAnnouncements(prev => prev.map(a => (a.id === annId ? { ...a, isRead: true } : a)));
  };

  const markAllAnnouncementsRead = async (): Promise<void> => {
    setAnnouncements(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const toggleAnnouncementRead = async (annId: string): Promise<void> => {
    setAnnouncements(prev => prev.map(a => (a.id === annId ? { ...a, isRead: !a.isRead } : a)));
  };

  const clearAllNotifications = async (): Promise<void> => {
    setNotifications([]);
  };

  const clearAllData = () => {
    setTasks([]);
    setAnnouncements([]);
    setNotifications([]);
    setActivities([]);
    setFocusSessions([]);
    try {
      localStorage.removeItem('studysync_tasks');
      localStorage.removeItem('studysync_tasks_v2');
      localStorage.removeItem('studysync_tasks_v3');
      localStorage.removeItem('studysync_announcements');
      localStorage.removeItem('studysync_announcements_v2');
      localStorage.removeItem('studysync_announcements_v3');
      localStorage.removeItem('studysync_notifications');
      localStorage.removeItem('studysync_notifications_v2');
      localStorage.removeItem('studysync_notifications_v3');
      localStorage.removeItem('studysync_activities');
      localStorage.removeItem('studysync_activities_v2');
      localStorage.removeItem('studysync_activities_v3');
      localStorage.removeItem('studysync_focus');
      localStorage.removeItem('studysync_focus_v2');
      localStorage.removeItem('studysync_focus_v3');

      localStorage.setItem('studysync_tasks_v3', JSON.stringify([]));
      localStorage.setItem('studysync_announcements_v3', JSON.stringify([]));
      localStorage.setItem('studysync_notifications_v3', JSON.stringify([]));
      localStorage.setItem('studysync_activities_v3', JSON.stringify([]));
      localStorage.setItem('studysync_focus_v3', JSON.stringify([]));
      localStorage.setItem('studysync_v3_initialized', 'true');
    } catch {}
  };

  const unreadAnnouncementsCount = useMemo(() => {
    return announcements.filter(a => !a.isRead).length;
  }, [announcements]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        subjects,
        notifications,
        activities,
        focusSessions,
        announcements,
        preferences,
        filters,
        setFilters,
        resetFilters,
        filteredTasks,
        selectedTask,
        setSelectedTask,
        isCreateTaskModalOpen,
        setIsCreateTaskModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleSubtask,
        addComment,
        addAttachment,
        markNotificationRead,
        markNotificationAsRead: markNotificationRead,
        markAllNotificationsRead,
        markAllNotificationsAsRead: markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        addFocusSession,
        updateNotificationPreferences,
        createAnnouncement,
        deleteAnnouncement,
        markAnnouncementRead,
        markAllAnnouncementsRead,
        toggleAnnouncementRead,
        unreadAnnouncementsCount,
        browserNotificationPermission,
        enableBrowserNotifications,
        sendTestWebsiteNotification,
        clearAllData,
        analytics,
        ticker
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
