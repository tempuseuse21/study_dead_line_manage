import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  INITIAL_ACTIVITY,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_PREFERENCES,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_STUDY_PREFERENCES,
  getInitialExams,
  getInitialGoals
} from '../lib/initialData';
import { playNotificationChime, triggerCompletionConfetti, formatDateDisplay, generateId, getTodayStr, getWeekDates } from '../lib/utils';
import {
  triggerWebsiteNotification,
  subscribeToBroadcastEvents,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission
} from '../lib/webNotifications';
import { storage, StorageKeys } from '../services/storageService';
import {
  ActivityLog,
  AppNotification,
  ClassAnnouncement,
  DailyPlan,
  Exam,
  ExportData,
  FocusSession,
  Goal,
  Note,
  NotificationPreferences,
  Priority,
  Resource,
  RevisionTopic,
  Subject,
  StudyPreferences,
  Task,
  TaskStatus,
  UserAnalytics,
  WeeklyActivityEntry
} from '../types';

// ============================================================
// Filter Options
// ============================================================

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

// ============================================================
// Context Type
// ============================================================

interface TaskContextType {
  // Data
  tasks: Task[];
  subjects: Subject[];
  notifications: AppNotification[];
  activities: ActivityLog[];
  focusSessions: FocusSession[];
  announcements: ClassAnnouncement[];
  exams: Exam[];
  goals: Goal[];
  notes: Note[];
  resources: Resource[];
  revisionTopics: RevisionTopic[];
  dailyPlans: DailyPlan[];
  preferences: NotificationPreferences;
  studyPreferences: StudyPreferences;

  // Filters
  filters: TaskFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterOptions>>;
  resetFilters: () => void;
  filteredTasks: Task[];

  // Modal state
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  isCreateSubjectModalOpen: boolean;
  setIsCreateSubjectModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;

  // Task actions
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string, passcode?: string) => Promise<{ success: boolean; error?: string }>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
  addAttachment: (taskId: string, file: { name: string; size: number; type: string; url: string }) => Promise<void>;

  // Subject actions
  addSubject: (data: Partial<Subject>) => Subject;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Exam actions
  createExam: (data: Partial<Exam>) => Exam;
  updateExam: (id: string, data: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Goal actions
  createGoal: (data: Partial<Goal>) => Goal;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Note actions
  createNote: (data: Partial<Note>) => Note;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Resource actions
  createResource: (data: Partial<Resource>) => Resource;
  updateResource: (id: string, data: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  // Revision actions
  createRevisionTopic: (data: Partial<RevisionTopic>) => RevisionTopic;
  updateRevisionTopic: (id: string, data: Partial<RevisionTopic>) => void;
  deleteRevisionTopic: (id: string) => void;

  // Daily plan actions
  saveDailyPlan: (plan: DailyPlan) => void;
  getTodayPlan: () => DailyPlan | null;

  // Notification actions
  markNotificationRead: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Focus sessions
  addFocusSession: (session: { taskId?: string; taskTitle?: string; durationMinutes: number; subjectId?: string }) => Promise<void>;

  // Preferences
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  updateStudyPreferences: (prefs: Partial<StudyPreferences>) => void;

  // Announcements (CR)
  createAnnouncement: (annData: Partial<ClassAnnouncement>, passcode: string) => Promise<{ success: boolean; data?: ClassAnnouncement; error?: string }>;
  deleteAnnouncement: (annId: string, passcode?: string) => Promise<{ success: boolean; error?: string } | void>;
  markAnnouncementRead: (annId: string) => Promise<void>;
  markAllAnnouncementsRead: () => Promise<void>;
  toggleAnnouncementRead: (annId: string) => Promise<void>;
  unreadAnnouncementsCount: number;

  // Activity log
  logActivity: (action: string, targetTitle: string, targetType?: ActivityLog['targetType'], targetId?: string) => void;

  // Browser notifications
  browserNotificationPermission: NotificationPermission | 'unsupported';
  enableBrowserNotifications: () => Promise<NotificationPermission | 'unsupported'>;
  sendTestWebsiteNotification: () => void;

  // Data management
  clearAllData: () => void;
  exportData: () => ExportData;
  importData: (data: ExportData) => { success: boolean; error?: string; summary?: string };

  // Analytics
  analytics: UserAnalytics;

  // Live ticker (incremented every 10s)
  ticker: number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Run migration on first mount
  useEffect(() => { storage.migrateLegacy(); }, []);

  // ---- State ----
  const [tasks, setTasks] = useState<Task[]>(() => storage.get(StorageKeys.TASKS, INITIAL_TASKS));
  const [subjects, setSubjects] = useState<Subject[]>(() => storage.get(StorageKeys.SUBJECTS, INITIAL_SUBJECTS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => storage.get(StorageKeys.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
  const [activities, setActivities] = useState<ActivityLog[]>(() => storage.get(StorageKeys.ACTIVITIES, INITIAL_ACTIVITY));
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => storage.get(StorageKeys.FOCUS_SESSIONS, []));
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>(() => storage.get(StorageKeys.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS));
  const [exams, setExams] = useState<Exam[]>(() => storage.get(StorageKeys.EXAMS, getInitialExams()));
  const [goals, setGoals] = useState<Goal[]>(() => storage.get(StorageKeys.GOALS, getInitialGoals()));
  const [notes, setNotes] = useState<Note[]>(() => storage.get(StorageKeys.NOTES, []));
  const [resources, setResources] = useState<Resource[]>(() => storage.get(StorageKeys.RESOURCES, []));
  const [revisionTopics, setRevisionTopics] = useState<RevisionTopic[]>(() => storage.get(StorageKeys.REVISION_TOPICS, []));
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>(() => storage.get(StorageKeys.DAILY_PLANS, []));
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => storage.get(StorageKeys.PREFERENCES, INITIAL_NOTIFICATION_PREFERENCES));
  const [studyPreferences, setStudyPreferences] = useState<StudyPreferences>(() => storage.get(StorageKeys.STUDY_PREFS, INITIAL_STUDY_PREFERENCES));

  // Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilterOptions>(defaultFilters);
  const [ticker, setTicker] = useState(0);
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => getBrowserNotificationPermission());

  // ---- Persistence ----
  useEffect(() => { storage.set(StorageKeys.TASKS, tasks); }, [tasks]);
  useEffect(() => { storage.set(StorageKeys.SUBJECTS, subjects); }, [subjects]);
  useEffect(() => { storage.set(StorageKeys.NOTIFICATIONS, notifications); }, [notifications]);
  useEffect(() => { storage.set(StorageKeys.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { storage.set(StorageKeys.FOCUS_SESSIONS, focusSessions); }, [focusSessions]);
  useEffect(() => { storage.set(StorageKeys.ANNOUNCEMENTS, announcements); }, [announcements]);
  useEffect(() => { storage.set(StorageKeys.EXAMS, exams); }, [exams]);
  useEffect(() => { storage.set(StorageKeys.GOALS, goals); }, [goals]);
  useEffect(() => { storage.set(StorageKeys.NOTES, notes); }, [notes]);
  useEffect(() => { storage.set(StorageKeys.RESOURCES, resources); }, [resources]);
  useEffect(() => { storage.set(StorageKeys.REVISION_TOPICS, revisionTopics); }, [revisionTopics]);
  useEffect(() => { storage.set(StorageKeys.DAILY_PLANS, dailyPlans); }, [dailyPlans]);
  useEffect(() => { storage.set(StorageKeys.PREFERENCES, preferences); }, [preferences]);
  useEffect(() => { storage.set(StorageKeys.STUDY_PREFS, studyPreferences); }, [studyPreferences]);

  // Live ticker every 10s
  useEffect(() => {
    const interval = setInterval(() => setTicker(prev => prev + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  // Broadcast events (multi-tab)
  useEffect(() => {
    const unsubscribe = subscribeToBroadcastEvents((event: any) => {
      if (!event?.payload) return;
      if (event.type === 'NEW_TASK') {
        triggerWebsiteNotification({
          type: 'task',
          title: event.payload.title,
          message: event.payload.message || 'New assignment posted',
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

  // ---- Browser Notifications ----
  const enableBrowserNotifications = async (): Promise<NotificationPermission | 'unsupported'> => {
    const res = await requestBrowserNotificationPermission();
    setBrowserNotificationPermission(res);
    if (res === 'granted') {
      triggerWebsiteNotification({
        type: 'system',
        title: '🔔 Notifications Enabled',
        message: 'You will now receive desktop alerts for deadlines and announcements!',
        chimeType: 'success',
        broadcast: false
      });
    }
    return res;
  };

  const sendTestWebsiteNotification = () => {
    triggerWebsiteNotification({
      type: 'announcement',
      title: '📢 Test Notification',
      message: 'Notification system is active and working correctly.',
      authorName: 'Study Planner',
      priority: 'urgent',
      chimeType: 'alert',
      broadcast: false
    });
  };

  // ---- Activity Logger ----
  const logActivity = useCallback((
    action: string,
    targetTitle: string,
    targetType: ActivityLog['targetType'] = 'task',
    targetId: string = generateId('ref')
  ) => {
    const entry: ActivityLog = {
      id: generateId('act'),
      userId: 'student',
      userName: 'Student',
      action,
      targetType,
      targetId,
      targetTitle,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [entry, ...prev.slice(0, 49)]);
  }, []);

  // ---- Filtered Tasks ----
  const filteredTasks = useMemo(() => {
    const todayStr = getTodayStr();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

    return tasks
      .filter(task => {
        if (filters.subjectId !== 'all' && task.subjectId !== filters.subjectId) return false;
        if (filters.status !== 'all' && task.status !== filters.status) return false;
        if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
        if (filters.tag !== 'all' && (!task.tags || !task.tags.includes(filters.tag))) return false;

        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchSubject = subjects.find(s => s.id === task.subjectId)?.name.toLowerCase().includes(q);
          const matchTags = task.tags?.some(tag => tag.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchSubject && !matchTags) return false;
        }

        if (filters.quickFilter === 'all' && task.status === 'completed') return false;
        if (filters.quickFilter === 'today' && (task.dueDate !== todayStr || task.status === 'completed')) return false;
        if (filters.quickFilter === 'tomorrow' && (task.dueDate !== tomorrowStr || task.status === 'completed')) return false;
        if (filters.quickFilter === 'this_week' && (task.dueDate < todayStr || task.dueDate > endOfWeekStr || task.status === 'completed')) return false;
        if (filters.quickFilter === 'overdue' && !(task.status === 'overdue' || (task.dueDate < todayStr && task.status !== 'completed'))) return false;
        if (filters.quickFilter === 'high_priority' && (task.priority !== 'high' && task.priority !== 'urgent' || task.status === 'completed')) return false;
        if (filters.quickFilter === 'completed' && task.status !== 'completed') return false;

        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (filters.sortBy === 'urgency') {
          const aDateTime = `${a.dueDate}T${a.dueTime || '23:59'}`;
          const bDateTime = `${b.dueDate}T${b.dueTime || '23:59'}`;
          return aDateTime.localeCompare(bDateTime);
        }
        if (filters.sortBy === 'deadline') return a.dueDate.localeCompare(b.dueDate);
        if (filters.sortBy === 'priority') {
          const w = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (w[b.priority] || 0) - (w[a.priority] || 0);
        }
        if (filters.sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
        if (filters.sortBy === 'created') return (b.createdAt || '').localeCompare(a.createdAt || '');
        return 0;
      });
  }, [tasks, filters, subjects]);

  // ---- Analytics ----
  const analytics: UserAnalytics = useMemo(() => {
    const todayStr = getTodayStr();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
    const overdueTasks = tasks.filter(t =>
      t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate < todayStr
    ).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueRate = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;
    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    // Today's focus minutes
    const focusMinutesToday = focusSessions
      .filter(s => s.startedAt?.startsWith(todayStr))
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    // This week's completed tasks
    const weekDates = getWeekDates();
    const completedThisWeek = tasks.filter(t =>
      t.status === 'completed' && t.completedAt && weekDates.some(d => t.completedAt!.startsWith(d))
    ).length;

    // Calculate real streak from completed tasks
    let currentStreak = 0;
    let bestStreak = 0;
    let streak = 0;
    const completedDates = new Set(
      tasks.filter(t => t.completedAt).map(t => t.completedAt!.split('T')[0])
    );
    // Count consecutive days backwards from today
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (completedDates.has(ds)) {
        streak++;
        if (i === 0 || currentStreak === i) currentStreak = streak;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        if (i > 0) streak = 0;
      }
    }

    // Weekly activity (last 7 days)
    const weeklyActivity: WeeklyActivityEntry[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const completedCount = tasks.filter(t => t.completedAt?.startsWith(dateStr)).length;
      const dueCount = tasks.filter(t => t.dueDate === dateStr).length;
      const dayFocusMinutes = focusSessions
        .filter(s => s.startedAt?.startsWith(dateStr))
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
      return { day: dayName, date: dateStr, completedCount, dueCount, focusMinutes: dayFocusMinutes };
    });

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
      completedThisWeek,
      currentStreak,
      bestStreak,
      totalFocusMinutes,
      focusMinutesToday,
      tasksBySubject,
      tasksByPriority,
      weeklyActivity
    };
  }, [tasks, subjects, focusSessions]);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  // ============================================================
  // Task Actions
  // ============================================================

  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    const subjectId = taskData.subjectId || subjects[0]?.id;
    const newTask: Task = {
      id: generateId('task'),
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      type: taskData.type || 'assignment',
      subjectId,
      createdById: 'student',
      createdByName: 'Student',
      assignedToIds: ['all'],
      dueDate: taskData.dueDate || getTodayStr(),
      dueTime: taskData.dueTime || '23:59',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'not_started',
      progress: taskData.progress || 0,
      difficulty: taskData.difficulty,
      estimatedDurationMinutes: taskData.estimatedDurationMinutes,
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
    logActivity('created task', newTask.title, 'task', newTask.id);

    const subjectObj = subjects.find(s => s.id === newTask.subjectId);
    const newNotif: AppNotification = {
      id: generateId('notif'),
      userId: 'student',
      taskId: newTask.id,
      type: 'TASK_CREATED',
      title: `New Task: ${newTask.title}`,
      message: `${subjectObj?.name || 'Task'} • Due ${formatDateDisplay(newTask.dueDate, newTask.dueTime)} • Priority: ${newTask.priority.toUpperCase()}`,
      scheduledAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      isRead: false,
      severity: newTask.priority === 'urgent' ? 'danger' : newTask.priority === 'high' ? 'warning' : 'info'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Try to post to server (non-blocking)
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
    } catch {}

    triggerWebsiteNotification({
      type: 'task',
      title: newTask.title,
      message: `${subjectObj?.name || 'Task'} • Due ${formatDateDisplay(newTask.dueDate, newTask.dueTime)}`,
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
    if (selectedTask?.id === taskId) {
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
    if (selectedTask?.id === taskId) setSelectedTask(null);
    try { await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' }); } catch {}
    return { success: true };
  };

  const toggleTaskComplete = async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const isNowCompleted = task.status !== 'completed';
    const newStatus: TaskStatus = isNowCompleted ? 'completed' : 'not_started';
    const updatedSubtasks = task.subtasks.map(st => ({
      ...st,
      completed: isNowCompleted,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined
    }));
    await updateTask(taskId, {
      status: newStatus,
      progress: isNowCompleted ? 100 : 0,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      subtasks: updatedSubtasks
    });
    if (isNowCompleted) {
      triggerCompletionConfetti();
      playNotificationChime();
      logActivity('completed task', task.title, 'task', task.id);
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = task.subtasks.map(st => {
      if (st.id === subtaskId) {
        const nextCompleted = !st.completed;
        return { ...st, completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : undefined };
      }
      return st;
    });
    const total = updatedSubtasks.length;
    const completedSub = updatedSubtasks.filter(s => s.completed).length;
    const progress = total > 0 ? Math.round((completedSub / total) * 100) : task.progress;
    const status: TaskStatus =
      total > 0 && completedSub === total ? 'completed'
      : completedSub > 0 ? 'in_progress'
      : task.status === 'completed' ? 'in_progress'
      : task.status;
    await updateTask(taskId, { subtasks: updatedSubtasks, progress, status });
  };

  const addComment = async (taskId: string, content: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !content.trim()) return;
    const newComment = {
      id: generateId('com'),
      taskId,
      userId: 'student',
      userName: 'Student',
      content: content.trim(),
      createdAt: new Date().toISOString()
    };
    await updateTask(taskId, { comments: [...(task.comments || []), newComment] });
  };

  const addAttachment = async (
    taskId: string,
    file: { name: string; size: number; type: string; url: string }
  ): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newAtt = {
      id: generateId('att'),
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.url,
      uploaderId: 'student',
      uploaderName: 'Student',
      uploadedAt: new Date().toISOString()
    };
    await updateTask(taskId, { attachments: [...(task.attachments || []), newAtt] });
  };

  // ============================================================
  // Subject Actions
  // ============================================================

  const addSubject = (data: Partial<Subject>): Subject => {
    const newSubject: Subject = {
      id: generateId('sub'),
      name: data.name || 'New Subject',
      code: data.code || 'NEW',
      teacherName: data.teacherName || data.professor || 'Faculty',
      professor: data.professor || data.teacherName || 'Faculty',
      description: data.description || '',
      color: data.color || '#6366f1',
      icon: data.icon || 'BookOpen',
      credits: data.credits || 4,
      semester: data.semester || 1,
      importance: data.importance || 'medium',
      targetGrade: data.targetGrade,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSubjects(prev => [...prev, newSubject]);
    logActivity('added subject', newSubject.name, 'subject', newSubject.id);
    return newSubject;
  };

  const updateSubject = (id: string, data: Partial<Subject>): void => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
  };

  const deleteSubject = (id: string): void => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  // ============================================================
  // Exam Actions
  // ============================================================

  const createExam = (data: Partial<Exam>): Exam => {
    const newExam: Exam = {
      id: generateId('exam'),
      subjectId: data.subjectId,
      title: data.title || 'New Exam',
      examDate: data.examDate || getTodayStr(),
      examTime: data.examTime || '10:00',
      venue: data.venue,
      difficulty: data.difficulty || 'moderate',
      preparationPercent: data.preparationPercent || 0,
      targetScore: data.targetScore,
      topics: data.topics || [],
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setExams(prev => [newExam, ...prev]);
    logActivity('added exam', newExam.title, 'exam', newExam.id);
    return newExam;
  };

  const updateExam = (id: string, data: Partial<Exam>): void => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e));
  };

  const deleteExam = (id: string): void => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  // ============================================================
  // Goal Actions
  // ============================================================

  const createGoal = (data: Partial<Goal>): Goal => {
    const newGoal: Goal = {
      id: generateId('goal'),
      title: data.title || 'New Goal',
      description: data.description,
      subjectId: data.subjectId,
      targetValue: data.targetValue,
      currentValue: data.currentValue || 0,
      unit: data.unit || '',
      deadline: data.deadline,
      status: data.status || 'active',
      linkedTaskIds: data.linkedTaskIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setGoals(prev => [newGoal, ...prev]);
    logActivity('created goal', newGoal.title, 'goal', newGoal.id);
    return newGoal;
  };

  const updateGoal = (id: string, data: Partial<Goal>): void => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g));
  };

  const deleteGoal = (id: string): void => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // ============================================================
  // Note Actions
  // ============================================================

  const createNote = (data: Partial<Note>): Note => {
    const newNote: Note = {
      id: generateId('note'),
      title: data.title || 'Untitled Note',
      content: data.content || '',
      subjectId: data.subjectId,
      examId: data.examId,
      taskId: data.taskId,
      tags: data.tags || [],
      isPinned: data.isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    logActivity('created note', newNote.title, 'note', newNote.id);
    return newNote;
  };

  const updateNote = (id: string, data: Partial<Note>): void => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id: string): void => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // ============================================================
  // Resource Actions
  // ============================================================

  const createResource = (data: Partial<Resource>): Resource => {
    const newResource: Resource = {
      id: generateId('res'),
      title: data.title || 'New Resource',
      url: data.url,
      type: data.type || 'website',
      subjectId: data.subjectId,
      topic: data.topic,
      tags: data.tags || [],
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setResources(prev => [newResource, ...prev]);
    return newResource;
  };

  const updateResource = (id: string, data: Partial<Resource>): void => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r));
  };

  const deleteResource = (id: string): void => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  // ============================================================
  // Revision Topic Actions
  // ============================================================

  const createRevisionTopic = (data: Partial<RevisionTopic>): RevisionTopic => {
    const newTopic: RevisionTopic = {
      id: generateId('rev'),
      title: data.title || 'New Topic',
      subjectId: data.subjectId,
      examId: data.examId,
      status: data.status || 'not_started',
      difficulty: data.difficulty || 'moderate',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRevisionTopics(prev => [newTopic, ...prev]);
    return newTopic;
  };

  const updateRevisionTopic = (id: string, data: Partial<RevisionTopic>): void => {
    setRevisionTopics(prev => prev.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r));
  };

  const deleteRevisionTopic = (id: string): void => {
    setRevisionTopics(prev => prev.filter(r => r.id !== id));
  };

  // ============================================================
  // Daily Plan Actions
  // ============================================================

  const saveDailyPlan = (plan: DailyPlan): void => {
    setDailyPlans(prev => {
      const existing = prev.findIndex(p => p.date === plan.date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = plan;
        return updated;
      }
      return [plan, ...prev];
    });
  };

  const getTodayPlan = (): DailyPlan | null => {
    return dailyPlans.find(p => p.date === getTodayStr()) || null;
  };

  // ============================================================
  // Notification Actions
  // ============================================================

  const markNotificationRead = async (id: string): Promise<void> => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
  };

  const markAllNotificationsRead = async (): Promise<void> => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
  };

  const deleteNotification = async (id: string): Promise<void> => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = async (): Promise<void> => {
    setNotifications([]);
  };

  // ============================================================
  // Focus Sessions
  // ============================================================

  const addFocusSession = async (session: {
    taskId?: string;
    taskTitle?: string;
    durationMinutes: number;
    subjectId?: string;
  }): Promise<void> => {
    const newSession: FocusSession = {
      id: generateId('foc'),
      userId: 'student',
      taskId: session.taskId,
      taskTitle: session.taskTitle,
      subjectId: session.subjectId,
      durationMinutes: session.durationMinutes,
      sessionType: 'pomodoro',
      completed: true,
      startedAt: new Date(Date.now() - session.durationMinutes * 60000).toISOString(),
      completedAt: new Date().toISOString()
    };
    setFocusSessions(prev => [newSession, ...prev]);
    triggerCompletionConfetti();
    logActivity(`completed ${session.durationMinutes}m focus session`, session.taskTitle || 'Free study', 'task', session.taskId || 'free');
  };

  // ============================================================
  // Preferences
  // ============================================================

  const updateNotificationPreferences = async (prefs: Partial<NotificationPreferences>): Promise<void> => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const updateStudyPreferences = (prefs: Partial<StudyPreferences>): void => {
    setStudyPreferences(prev => ({ ...prev, ...prefs }));
  };

  // ============================================================
  // Announcements (CR Board — preserved with passcode)
  // ============================================================

  const createAnnouncement = async (
    annData: Partial<ClassAnnouncement>,
    passcode: string
  ): Promise<{ success: boolean; data?: ClassAnnouncement; error?: string }> => {
    if ((passcode || '').trim() !== 'iamcr') {
      return { success: false, error: 'Incorrect authorization passcode. Announcement denied.' };
    }
    const newAnn: ClassAnnouncement = {
      id: generateId('ann'),
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
    const subjectObj = subjects.find(s => s.id === newAnn.subjectId);
    const newNotif: AppNotification = {
      id: generateId('notif'),
      userId: 'student',
      type: 'TASK_CREATED',
      title: `📢 CR: ${newAnn.title}`,
      message: `By ${newAnn.authorName}${subjectObj ? ` (${subjectObj.code})` : ''}: ${newAnn.content}`,
      scheduledAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      isRead: false,
      severity: newAnn.priority === 'urgent' ? 'danger' : 'info'
    };
    setNotifications(prev => [newNotif, ...prev]);
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

  const deleteAnnouncement = async (annId: string, passcode?: string): Promise<{ success: boolean; error?: string } | void> => {
    if (passcode !== undefined && (passcode || '').trim() !== '2026') {
      return { success: false, error: 'Incorrect authorization passcode. Deletion denied.' };
    }
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
    return { success: true };
  };

  const markAnnouncementRead = async (annId: string): Promise<void> => {
    setAnnouncements(prev => prev.map(a => a.id === annId ? { ...a, isRead: true } : a));
  };

  const markAllAnnouncementsRead = async (): Promise<void> => {
    setAnnouncements(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const toggleAnnouncementRead = async (annId: string): Promise<void> => {
    setAnnouncements(prev => prev.map(a => a.id === annId ? { ...a, isRead: !a.isRead } : a));
  };

  const unreadAnnouncementsCount = useMemo(() => announcements.filter(a => !a.isRead).length, [announcements]);

  // ============================================================
  // Data Management
  // ============================================================

  const clearAllData = (): void => {
    setTasks([]);
    setAnnouncements([]);
    setNotifications([]);
    setActivities([]);
    setFocusSessions([]);
    setExams([]);
    setGoals([]);
    setNotes([]);
    setResources([]);
    setRevisionTopics([]);
    setDailyPlans([]);
    storage.clearAll();
  };

  const exportData = (): ExportData => ({
    version: '2.0',
    exportedAt: new Date().toISOString(),
    tasks,
    subjects,
    exams,
    goals,
    notes,
    resources,
    revisionTopics,
    dailyPlans,
    focusSessions,
    preferences,
    studyPreferences
  });

  const importData = (data: ExportData): { success: boolean; error?: string; summary?: string } => {
    try {
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid data format' };
      }
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
      if (Array.isArray(data.subjects)) setSubjects(data.subjects);
      if (Array.isArray(data.exams)) setExams(data.exams);
      if (Array.isArray(data.goals)) setGoals(data.goals);
      if (Array.isArray(data.notes)) setNotes(data.notes);
      if (Array.isArray(data.resources)) setResources(data.resources);
      if (Array.isArray(data.revisionTopics)) setRevisionTopics(data.revisionTopics);
      if (Array.isArray(data.dailyPlans)) setDailyPlans(data.dailyPlans);
      if (Array.isArray(data.focusSessions)) setFocusSessions(data.focusSessions);
      if (data.preferences) setPreferences(p => ({ ...p, ...data.preferences }));
      if (data.studyPreferences) setStudyPreferences(p => ({ ...p, ...data.studyPreferences }));

      const summary = [
        data.tasks?.length ? `${data.tasks.length} tasks` : '',
        data.subjects?.length ? `${data.subjects.length} subjects` : '',
        data.exams?.length ? `${data.exams.length} exams` : '',
        data.goals?.length ? `${data.goals.length} goals` : '',
        data.notes?.length ? `${data.notes.length} notes` : '',
        data.resources?.length ? `${data.resources.length} resources` : ''
      ].filter(Boolean).join(', ');

      return { success: true, summary };
    } catch (err) {
      return { success: false, error: `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
    }
  };

  // ============================================================
  // Context Value
  // ============================================================

  return (
    <TaskContext.Provider
      value={{
        tasks,
        subjects,
        notifications,
        activities,
        focusSessions,
        announcements,
        exams,
        goals,
        notes,
        resources,
        revisionTopics,
        dailyPlans,
        preferences,
        studyPreferences,
        filters,
        setFilters,
        resetFilters,
        filteredTasks,
        selectedTask,
        setSelectedTask,
        isCreateTaskModalOpen,
        setIsCreateTaskModalOpen,
        isCreateSubjectModalOpen,
        setIsCreateSubjectModalOpen,
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
        addSubject,
        updateSubject,
        deleteSubject,
        createExam,
        updateExam,
        deleteExam,
        createGoal,
        updateGoal,
        deleteGoal,
        createNote,
        updateNote,
        deleteNote,
        createResource,
        updateResource,
        deleteResource,
        createRevisionTopic,
        updateRevisionTopic,
        deleteRevisionTopic,
        saveDailyPlan,
        getTodayPlan,
        markNotificationRead,
        markNotificationAsRead: markNotificationRead,
        markAllNotificationsRead,
        markAllNotificationsAsRead: markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        addFocusSession,
        updateNotificationPreferences,
        updateStudyPreferences,
        createAnnouncement,
        deleteAnnouncement,
        markAnnouncementRead,
        markAllAnnouncementsRead,
        toggleAnnouncementRead,
        unreadAnnouncementsCount,
        logActivity,
        browserNotificationPermission,
        enableBrowserNotifications,
        sendTestWebsiteNotification,
        clearAllData,
        exportData,
        importData,
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
