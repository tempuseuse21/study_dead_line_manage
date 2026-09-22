import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  INITIAL_ACTIVITY,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_PREFERENCES,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_STUDY_PREFERENCES,
  INITIAL_TIMETABLE_SLOTS,
  getInitialExams,
  getInitialGoals
} from '../lib/initialData';
import { playNotificationChime, triggerCompletionConfetti, formatDateDisplay, generateId, getTodayStr, getWeekDates, getNormalizedProf } from '../lib/utils';
import {
  triggerWebsiteNotification,
  subscribeToBroadcastEvents,
  broadcastPostEvent,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission
} from '../lib/webNotifications';
import { storage, StorageKeys } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
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
  TimetableSlot,
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
  // Cloud Database Status
  isSupabaseConnected: boolean;

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
  timetableSlots: TimetableSlot[];
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

  // Timetable actions
  addTimetableSlot: (data: Partial<TimetableSlot>) => TimetableSlot;
  updateTimetableSlot: (id: string, data: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;

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

  // Run migration on first mount & update professor names to user specified values
  useEffect(() => {
    storage.migrateLegacy();
    setSubjects(prev =>
      prev.map(s => {
        const targetProf = getNormalizedProf(s.code, s.name, s.id);
        if (targetProf) {
          const updated = { ...s, teacherName: targetProf, professor: targetProf };
          if (supabaseService.isAvailable()) supabaseService.upsertSubject(updated);
          return updated;
        }
        return s;
      })
    );

    setTimetableSlots(prev =>
      prev.map(slot => {
        const targetProf = getNormalizedProf(slot.subjectCode, slot.subjectName, slot.subjectId);
        if (targetProf) {
          const updated = { ...slot, professor: targetProf };
          if (supabaseService.isAvailable()) supabaseService.upsertTimetableSlot(updated);
          return updated;
        }
        return slot;
      })
    );
  }, []);

  // ---- State ----
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => supabaseService.isAvailable());
  const [tasks, setTasks] = useState<Task[]>(() => storage.get(StorageKeys.TASKS, INITIAL_TASKS));
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const raw = storage.get(StorageKeys.SUBJECTS, INITIAL_SUBJECTS);
    return raw.map(s => {
      const p = getNormalizedProf(s.code, s.name, s.id) || s.professor || s.teacherName || '';
      return { ...s, teacherName: p, professor: p };
    });
  });
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
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    const raw = storage.get(StorageKeys.TIMETABLE, INITIAL_TIMETABLE_SLOTS);
    return raw.map(slot => {
      const p = getNormalizedProf(slot.subjectCode, slot.subjectName, slot.subjectId) || slot.professor || '';
      return { ...slot, professor: p };
    });
  });
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

  // ---- Persistence & Supabase Sync ----
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
  useEffect(() => { storage.set(StorageKeys.TIMETABLE, timetableSlots); }, [timetableSlots]);
  useEffect(() => { storage.set(StorageKeys.PREFERENCES, preferences); }, [preferences]);
  useEffect(() => { storage.set(StorageKeys.STUDY_PREFS, studyPreferences); }, [studyPreferences]);

  // Initial Supabase fetch, seed & realtime channel subscription (or central API fallback)
  useEffect(() => {
    if (!supabaseService.isAvailable()) {
      let isMounted = true;
      const fetchCentralData = async () => {
        try {
          const resTasks = await fetch('/api/tasks');
          if (resTasks.ok) {
            const apiTasks = await resTasks.json();
            if (Array.isArray(apiTasks) && apiTasks.length > 0 && isMounted) setTasks(apiTasks);
          }
        } catch {}
        try {
          const resSubjects = await fetch('/api/subjects');
          if (resSubjects.ok) {
            const apiSubjects = await resSubjects.json();
            if (Array.isArray(apiSubjects) && apiSubjects.length > 0 && isMounted) setSubjects(apiSubjects);
          }
        } catch {}
        try {
          const resTimetable = await fetch('/api/timetable');
          if (resTimetable.ok) {
            const apiTimetable = await resTimetable.json();
            if (Array.isArray(apiTimetable) && apiTimetable.length > 0 && isMounted) setTimetableSlots(apiTimetable);
          }
        } catch {}
        try {
          const resExams = await fetch('/api/exams');
          if (resExams.ok) {
            const apiExams = await resExams.json();
            if (Array.isArray(apiExams) && apiExams.length > 0 && isMounted) setExams(apiExams);
          }
        } catch {}
        try {
          const resGoals = await fetch('/api/goals');
          if (resGoals.ok) {
            const apiGoals = await resGoals.json();
            if (Array.isArray(apiGoals) && apiGoals.length > 0 && isMounted) setGoals(apiGoals);
          }
        } catch {}
        try {
          const resNotes = await fetch('/api/notes');
          if (resNotes.ok) {
            const apiNotes = await resNotes.json();
            if (Array.isArray(apiNotes) && apiNotes.length > 0 && isMounted) setNotes(apiNotes);
          }
        } catch {}
        try {
          const resResources = await fetch('/api/resources');
          if (resResources.ok) {
            const apiResources = await resResources.json();
            if (Array.isArray(apiResources) && apiResources.length > 0 && isMounted) setResources(apiResources);
          }
        } catch {}
        try {
          const resRevision = await fetch('/api/revision-topics');
          if (resRevision.ok) {
            const apiRev = await resRevision.json();
            if (Array.isArray(apiRev) && apiRev.length > 0 && isMounted) setRevisionTopics(apiRev);
          }
        } catch {}
        try {
          const resDaily = await fetch('/api/daily-plans');
          if (resDaily.ok) {
            const apiDaily = await resDaily.json();
            if (Array.isArray(apiDaily) && apiDaily.length > 0 && isMounted) setDailyPlans(apiDaily);
          }
        } catch {}
      };
      fetchCentralData();
      return () => { isMounted = false; };
    }

    let isMounted = true;

    const syncCloudData = async () => {
      try {
        // Fetch Subjects
        let cloudSubjects = await supabaseService.fetchSubjects();
        if (cloudSubjects.length === 0) {
          for (const s of INITIAL_SUBJECTS) await supabaseService.upsertSubject(s);
          cloudSubjects = INITIAL_SUBJECTS;
        }
        if (isMounted) setSubjects(cloudSubjects);

        // Fetch Tasks
        let cloudTasks = await supabaseService.fetchTasks();
        if (cloudTasks.length === 0) {
          for (const t of INITIAL_TASKS) await supabaseService.upsertTask(t);
          cloudTasks = INITIAL_TASKS;
        }
        if (isMounted) setTasks(cloudTasks);

        // Fetch Timetable Slots
        let cloudTimetable = await supabaseService.fetchTimetableSlots();
        if (cloudTimetable.length === 0) {
          for (const slot of INITIAL_TIMETABLE_SLOTS) await supabaseService.upsertTimetableSlot(slot);
          cloudTimetable = INITIAL_TIMETABLE_SLOTS;
        }
        if (isMounted) setTimetableSlots(cloudTimetable);

        // Fetch Exams
        const cloudExams = await supabaseService.fetchExams();
        if (cloudExams.length > 0 && isMounted) setExams(cloudExams);

        // Fetch Goals
        const cloudGoals = await supabaseService.fetchGoals();
        if (cloudGoals.length > 0 && isMounted) setGoals(cloudGoals);

        // Fetch Notes
        const cloudNotes = await supabaseService.fetchNotes();
        if (cloudNotes.length > 0 && isMounted) setNotes(cloudNotes);

        // Fetch Resources
        const cloudResources = await supabaseService.fetchResources();
        if (cloudResources.length > 0 && isMounted) setResources(cloudResources);

        // Fetch Revision Topics
        const cloudRevision = await supabaseService.fetchRevisionTopics();
        if (cloudRevision.length > 0 && isMounted) setRevisionTopics(cloudRevision);

        // Fetch Announcements
        const cloudAnnouncements = await supabaseService.fetchAnnouncements();
        if (cloudAnnouncements.length > 0 && isMounted) setAnnouncements(cloudAnnouncements);

        // Fetch Daily Plans
        const cloudDailyPlans = await supabaseService.fetchDailyPlans();
        if (cloudDailyPlans.length > 0 && isMounted) setDailyPlans(cloudDailyPlans);

        // Fetch Focus Sessions
        const cloudFocus = await supabaseService.fetchFocusSessions();
        if (cloudFocus.length > 0 && isMounted) setFocusSessions(cloudFocus);

        if (isMounted) setIsSupabaseConnected(true);
      } catch (err) {
        console.error('Supabase initial fetch error:', err);
      }
    };

    syncCloudData();

    // Subscribe to realtime postgres updates across all 11 tables
    const unsubTasks = supabaseService.subscribeToChanges('tasks', async () => {
      const updated = await supabaseService.fetchTasks();
      if (isMounted && updated.length > 0) setTasks(updated);
    });

    const unsubSubjects = supabaseService.subscribeToChanges('subjects', async () => {
      const updated = await supabaseService.fetchSubjects();
      if (isMounted && updated.length > 0) setSubjects(updated);
    });

    const unsubTimetable = supabaseService.subscribeToChanges('timetable_slots', async () => {
      const updated = await supabaseService.fetchTimetableSlots();
      if (isMounted && updated.length > 0) setTimetableSlots(updated);
    });

    const unsubExams = supabaseService.subscribeToChanges('exams', async () => {
      const updated = await supabaseService.fetchExams();
      if (isMounted && updated.length > 0) setExams(updated);
    });

    const unsubGoals = supabaseService.subscribeToChanges('goals', async () => {
      const updated = await supabaseService.fetchGoals();
      if (isMounted && updated.length > 0) setGoals(updated);
    });

    const unsubNotes = supabaseService.subscribeToChanges('notes', async () => {
      const updated = await supabaseService.fetchNotes();
      if (isMounted && updated.length > 0) setNotes(updated);
    });

    const unsubResources = supabaseService.subscribeToChanges('resources', async () => {
      const updated = await supabaseService.fetchResources();
      if (isMounted && updated.length > 0) setResources(updated);
    });

    const unsubRevision = supabaseService.subscribeToChanges('revision_topics', async () => {
      const updated = await supabaseService.fetchRevisionTopics();
      if (isMounted && updated.length > 0) setRevisionTopics(updated);
    });

    const unsubAnnouncements = supabaseService.subscribeToChanges('announcements', async () => {
      const updated = await supabaseService.fetchAnnouncements();
      if (isMounted && updated.length > 0) setAnnouncements(updated);
    });

    const unsubDailyPlans = supabaseService.subscribeToChanges('daily_plans', async () => {
      const updated = await supabaseService.fetchDailyPlans();
      if (isMounted && updated.length > 0) setDailyPlans(updated);
    });

    const unsubFocus = supabaseService.subscribeToChanges('focus_sessions', async () => {
      const updated = await supabaseService.fetchFocusSessions();
      if (isMounted && updated.length > 0) setFocusSessions(updated);
    });

    return () => {
      isMounted = false;
      unsubTasks();
      unsubSubjects();
      unsubTimetable();
      unsubExams();
      unsubGoals();
      unsubNotes();
      unsubResources();
      unsubRevision();
      unsubAnnouncements();
      unsubDailyPlans();
      unsubFocus();
    };
  }, []);

  // Live ticker every 10s & Auto-shift overdue tasks to Completed section
  useEffect(() => {
    const interval = setInterval(() => setTicker(prev => prev + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = Date.now();
    setTasks(prev => {
      let hasChanges = false;
      const updated = prev.map(t => {
        if (t.status !== 'completed') {
          const [h, m] = (t.dueTime || '23:59').split(':').map(Number);
          const [y, mon, d] = t.dueDate.split('-').map(Number);
          const taskTime = new Date(y, mon - 1, d, h || 23, m || 59).getTime();
          if (taskTime < now) {
            hasChanges = true;
            return {
              ...t,
              status: 'completed' as TaskStatus,
              progress: 100,
              completedAt: t.completedAt || new Date().toISOString()
            };
          }
        }
        return t;
      });
      return hasChanges ? updated : prev;
    });
  }, [ticker]);

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
      } else if (event.type === 'TIMETABLE_CHANGED') {
        if (event.payload?.slots) {
          setTimetableSlots(event.payload.slots);
        } else if (supabaseService.isAvailable()) {
          supabaseService.fetchTimetableSlots().then(slots => {
            if (slots.length > 0) setTimetableSlots(slots);
          });
        } else {
          fetch('/api/timetable')
            .then(r => r.ok ? r.json() : null)
            .then(apiSlots => {
              if (Array.isArray(apiSlots) && apiSlots.length > 0) setTimetableSlots(apiSlots);
            })
            .catch(() => {});
        }
        if (event.payload?.title) {
          triggerWebsiteNotification({
            type: 'system',
            title: '📅 Timetable Updated',
            message: event.payload.title || 'Class schedule was updated',
            broadcast: false,
            chimeType: 'success'
          });
        }
      } else if (event.type === 'EXAMS_CHANGED') {
        if (event.payload?.exams) setExams(event.payload.exams);
        else if (supabaseService.isAvailable()) supabaseService.fetchExams().then(e => e.length > 0 && setExams(e));
        else fetch('/api/exams').then(r => r.ok ? r.json() : null).then(e => Array.isArray(e) && setExams(e)).catch(() => {});
      } else if (event.type === 'GOALS_CHANGED') {
        if (event.payload?.goals) setGoals(event.payload.goals);
        else if (supabaseService.isAvailable()) supabaseService.fetchGoals().then(g => g.length > 0 && setGoals(g));
        else fetch('/api/goals').then(r => r.ok ? r.json() : null).then(g => Array.isArray(g) && setGoals(g)).catch(() => {});
      } else if (event.type === 'NOTES_CHANGED') {
        if (event.payload?.notes) setNotes(event.payload.notes);
        else if (supabaseService.isAvailable()) supabaseService.fetchNotes().then(n => n.length > 0 && setNotes(n));
        else fetch('/api/notes').then(r => r.ok ? r.json() : null).then(n => Array.isArray(n) && setNotes(n)).catch(() => {});
      } else if (event.type === 'RESOURCES_CHANGED') {
        if (event.payload?.resources) setResources(event.payload.resources);
        else if (supabaseService.isAvailable()) supabaseService.fetchResources().then(r => r.length > 0 && setResources(r));
        else fetch('/api/resources').then(r => r.ok ? r.json() : null).then(r => Array.isArray(r) && setResources(r)).catch(() => {});
      } else if (event.type === 'REVISION_CHANGED') {
        if (event.payload?.revisionTopics) setRevisionTopics(event.payload.revisionTopics);
        else if (supabaseService.isAvailable()) supabaseService.fetchRevisionTopics().then(rev => rev.length > 0 && setRevisionTopics(rev));
        else fetch('/api/revision-topics').then(r => r.ok ? r.json() : null).then(rev => Array.isArray(rev) && setRevisionTopics(rev)).catch(() => {});
      } else if (event.type === 'DAILY_PLANS_CHANGED') {
        if (event.payload?.dailyPlans) setDailyPlans(event.payload.dailyPlans);
        else if (supabaseService.isAvailable()) supabaseService.fetchDailyPlans().then(dp => dp.length > 0 && setDailyPlans(dp));
        else fetch('/api/daily-plans').then(r => r.ok ? r.json() : null).then(dp => Array.isArray(dp) && setDailyPlans(dp)).catch(() => {});
      } else if (event.type === 'FOCUS_CHANGED') {
        if (event.payload?.focusSessions) setFocusSessions(event.payload.focusSessions);
        else if (supabaseService.isAvailable()) supabaseService.fetchFocusSessions().then(fs => fs.length > 0 && setFocusSessions(fs));
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

    if (supabaseService.isAvailable()) {
      supabaseService.upsertTask(newTask);
    }

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
          const finalData = { ...data };
          // Completed tasks cannot be reopened or downgraded in status/progress
          if (t.status === 'completed') {
            finalData.status = 'completed';
            finalData.progress = 100;
          }
          updatedTask = { ...t, ...finalData, updatedAt: new Date().toISOString() };
          if (supabaseService.isAvailable()) {
            supabaseService.upsertTask(updatedTask);
          }
          return updatedTask;
        }
        return t;
      })
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => (prev ? { ...prev, ...data, status: prev.status === 'completed' ? 'completed' : (data.status || prev.status), progress: prev.status === 'completed' ? 100 : (data.progress ?? prev.progress), updatedAt: new Date().toISOString() } : null));
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
    if ((passcode || '').trim() !== 'iamcr') {
      return { success: false, error: 'Incorrect authorization passcode. Deletion denied.' };
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
    if (supabaseService.isAvailable()) {
      supabaseService.deleteTask(taskId);
    }
    try { await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' }); } catch {}
    return { success: true };
  };

  const toggleTaskComplete = async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Completed tasks cannot be reopened once moved into completed archive
    if (task.status === 'completed') return;

    const updatedSubtasks = task.subtasks.map(st => ({
      ...st,
      completed: true,
      completedAt: new Date().toISOString()
    }));

    await updateTask(taskId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString(),
      subtasks: updatedSubtasks
    });

    triggerCompletionConfetti();
    playNotificationChime();
    logActivity('completed task', task.title, 'task', task.id);
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
    const progress = task.status === 'completed' ? 100 : (total > 0 ? Math.round((completedSub / total) * 100) : task.progress);
    const status: TaskStatus =
      task.status === 'completed' ? 'completed'
      : total > 0 && completedSub === total ? 'completed'
      : completedSub > 0 ? 'in_progress'
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
    if (supabaseService.isAvailable()) {
      supabaseService.upsertSubject(newSubject);
    }
    return newSubject;
  };

  const updateSubject = (id: string, data: Partial<Subject>): void => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id === id) {
          const updated = { ...s, ...data, updatedAt: new Date().toISOString() };
          if (supabaseService.isAvailable()) {
            supabaseService.upsertSubject(updated);
          }
          return updated;
        }
        return s;
      })
    );

    // Cascade updated professor/teacherName to all timetable slots of this subject
    const newProf = data.professor || data.teacherName;
    if (newProf) {
      setTimetableSlots(prev =>
        prev.map(slot => {
          if (slot.subjectId === id) {
            const updatedSlot = { ...slot, professor: newProf };
            if (supabaseService.isAvailable()) {
              supabaseService.upsertTimetableSlot(updatedSlot);
            }
            return updatedSlot;
          }
          return slot;
        })
      );
    }
  };

  const deleteSubject = (id: string): void => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    if (supabaseService.isAvailable()) {
      supabaseService.deleteSubject(id);
    }
  };

  // ============================================================
  // Timetable Actions (Realtime Sync & Faculty Auto-Assignment)
  // ============================================================

  const addTimetableSlot = (data: Partial<TimetableSlot>): TimetableSlot => {
    // Auto-resolve professor from subjects if not explicitly given
    let prof = data.professor?.trim();
    if (!prof && data.subjectId) {
      const sub = subjects.find(s => s.id === data.subjectId);
      if (sub) prof = sub.professor || sub.teacherName;
    }
    if (!prof && data.subjectName) {
      const sub = subjects.find(s => s.name.toLowerCase() === data.subjectName?.toLowerCase());
      if (sub) prof = sub.professor || sub.teacherName;
    }

    const newSlot: TimetableSlot = {
      id: generateId('tt'),
      day: data.day || 'Monday',
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '10:00',
      subjectId: data.subjectId,
      subjectCode: data.subjectCode,
      subjectName: data.subjectName || 'Lecture / Class',
      room: data.room || '',
      professor: prof || '',
      type: data.type || 'lecture',
      color: data.color || '#3b82f6',
      notes: data.notes || ''
    };

    setTimetableSlots(prev => {
      const nextSlots = [...prev, newSlot];
      broadcastPostEvent({
        type: 'TIMETABLE_CHANGED',
        payload: { slots: nextSlots, title: `New class added: ${newSlot.subjectName}` }
      });
      return nextSlots;
    });

    logActivity('added timetable class slot', newSlot.subjectName, 'task', newSlot.id);

    // Sync to Supabase & Central Server
    if (supabaseService.isAvailable()) {
      supabaseService.upsertTimetableSlot(newSlot);
    }
    fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSlot)
    }).catch(() => {});

    return newSlot;
  };

  const updateTimetableSlot = (id: string, data: Partial<TimetableSlot>): void => {
    setTimetableSlots(prev => {
      const nextSlots = prev.map(s => {
        if (s.id === id) {
          let prof = data.professor !== undefined ? data.professor.trim() : s.professor;
          if (!prof && (data.subjectId || s.subjectId)) {
            const sub = subjects.find(subItem => subItem.id === (data.subjectId || s.subjectId));
            if (sub) prof = sub.professor || sub.teacherName;
          }
          const updatedSlot = { ...s, ...data, professor: prof };

          if (supabaseService.isAvailable()) {
            supabaseService.upsertTimetableSlot(updatedSlot);
          }
          fetch(`/api/timetable/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSlot)
          }).catch(() => {});

          return updatedSlot;
        }
        return s;
      });

      broadcastPostEvent({
        type: 'TIMETABLE_CHANGED',
        payload: { slots: nextSlots, title: 'Class timetable slot updated' }
      });

      return nextSlots;
    });
  };

  const deleteTimetableSlot = (id: string): void => {
    setTimetableSlots(prev => {
      const nextSlots = prev.filter(s => s.id !== id);
      broadcastPostEvent({
        type: 'TIMETABLE_CHANGED',
        payload: { slots: nextSlots, title: 'Class slot removed' }
      });
      return nextSlots;
    });

    if (supabaseService.isAvailable()) {
      supabaseService.deleteTimetableSlot(id);
    }
    fetch(`/api/timetable/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // ============================================================
  // Exam Actions
  // ============================================================

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

    setExams(prev => {
      const nextExams = [newExam, ...prev];
      broadcastPostEvent({ type: 'EXAMS_CHANGED', payload: { exams: nextExams } });
      return nextExams;
    });

    logActivity('added exam', newExam.title, 'exam', newExam.id);
    if (supabaseService.isAvailable()) supabaseService.upsertExam(newExam);
    fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newExam) }).catch(() => {});

    return newExam;
  };

  const updateExam = (id: string, data: Partial<Exam>): void => {
    setExams(prev => {
      const nextExams = prev.map(e => {
        if (e.id === id) {
          const updated = { ...e, ...data, updatedAt: new Date().toISOString() };
          if (supabaseService.isAvailable()) supabaseService.upsertExam(updated);
          fetch(`/api/exams/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {});
          return updated;
        }
        return e;
      });
      broadcastPostEvent({ type: 'EXAMS_CHANGED', payload: { exams: nextExams } });
      return nextExams;
    });
  };

  const deleteExam = (id: string): void => {
    setExams(prev => {
      const nextExams = prev.filter(e => e.id !== id);
      broadcastPostEvent({ type: 'EXAMS_CHANGED', payload: { exams: nextExams } });
      return nextExams;
    });
    if (supabaseService.isAvailable()) supabaseService.deleteExam(id);
    fetch(`/api/exams/${id}`, { method: 'DELETE' }).catch(() => {});
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

    setGoals(prev => {
      const nextGoals = [newGoal, ...prev];
      broadcastPostEvent({ type: 'GOALS_CHANGED', payload: { goals: nextGoals } });
      return nextGoals;
    });

    logActivity('created goal', newGoal.title, 'goal', newGoal.id);
    if (supabaseService.isAvailable()) supabaseService.upsertGoal(newGoal);
    fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newGoal) }).catch(() => {});

    return newGoal;
  };

  const updateGoal = (id: string, data: Partial<Goal>): void => {
    setGoals(prev => {
      const nextGoals = prev.map(g => {
        if (g.id === id) {
          const updated = { ...g, ...data, updatedAt: new Date().toISOString() };
          if (supabaseService.isAvailable()) supabaseService.upsertGoal(updated);
          fetch(`/api/goals/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {});
          return updated;
        }
        return g;
      });
      broadcastPostEvent({ type: 'GOALS_CHANGED', payload: { goals: nextGoals } });
      return nextGoals;
    });
  };

  const deleteGoal = (id: string): void => {
    setGoals(prev => {
      const nextGoals = prev.filter(g => g.id !== id);
      broadcastPostEvent({ type: 'GOALS_CHANGED', payload: { goals: nextGoals } });
      return nextGoals;
    });
    if (supabaseService.isAvailable()) supabaseService.deleteGoal(id);
    fetch(`/api/goals/${id}`, { method: 'DELETE' }).catch(() => {});
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

    setNotes(prev => {
      const nextNotes = [newNote, ...prev];
      broadcastPostEvent({ type: 'NOTES_CHANGED', payload: { notes: nextNotes } });
      return nextNotes;
    });

    logActivity('created note', newNote.title, 'note', newNote.id);
    if (supabaseService.isAvailable()) supabaseService.upsertNote(newNote);
    fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newNote) }).catch(() => {});

    return newNote;
  };

  const updateNote = (id: string, data: Partial<Note>): void => {
    setNotes(prev => {
      const nextNotes = prev.map(n => {
        if (n.id === id) {
          const updated = { ...n, ...data, updatedAt: new Date().toISOString() };
          if (supabaseService.isAvailable()) supabaseService.upsertNote(updated);
          fetch(`/api/notes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {});
          return updated;
        }
        return n;
      });
      broadcastPostEvent({ type: 'NOTES_CHANGED', payload: { notes: nextNotes } });
      return nextNotes;
    });
  };

  const deleteNote = (id: string): void => {
    setNotes(prev => {
      const nextNotes = prev.filter(n => n.id !== id);
      broadcastPostEvent({ type: 'NOTES_CHANGED', payload: { notes: nextNotes } });
      return nextNotes;
    });
    if (supabaseService.isAvailable()) supabaseService.deleteNote(id);
    fetch(`/api/notes/${id}`, { method: 'DELETE' }).catch(() => {});
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

    setResources(prev => {
      const nextRes = [newResource, ...prev];
      broadcastPostEvent({ type: 'RESOURCES_CHANGED', payload: { resources: nextRes } });
      return nextRes;
    });

    if (supabaseService.isAvailable()) supabaseService.upsertResource(newResource);
    fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newResource) }).catch(() => {});

    return newResource;
  };

  const updateResource = (id: string, data: Partial<Resource>): void => {
    setResources(prev => {
      const nextRes = prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, ...data, updatedAt: new Date().toISOString() };
          if (supabaseService.isAvailable()) supabaseService.upsertResource(updated);
          fetch(`/api/resources/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {});
          return updated;
        }
        return r;
      });
      broadcastPostEvent({ type: 'RESOURCES_CHANGED', payload: { resources: nextRes } });
      return nextRes;
    });
  };

  const deleteResource = (id: string): void => {
    setResources(prev => {
      const nextRes = prev.filter(r => r.id !== id);
      broadcastPostEvent({ type: 'RESOURCES_CHANGED', payload: { resources: nextRes } });
      return nextRes;
    });
    if (supabaseService.isAvailable()) supabaseService.deleteResource(id);
    fetch(`/api/resources/${id}`, { method: 'DELETE' }).catch(() => {});
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

    setRevisionTopics(prev => {
      const nextTopics = [newTopic, ...prev];
      broadcastPostEvent({ type: 'REVISION_CHANGED', payload: { revisionTopics: nextTopics } });
      return nextTopics;
    });

    if (supabaseService.isAvailable()) supabaseService.upsertRevisionTopic(newTopic);
    fetch('/api/revision-topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTopic) }).catch(() => {});

    return newTopic;
  };

  const updateRevisionTopic = (id: string, data: Partial<RevisionTopic>): void => {
    setRevisionTopics(prev => {
      const nextTopics = prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, ...data, updatedAt: new Date().toISOString() };
          if (supabaseService.isAvailable()) supabaseService.upsertRevisionTopic(updated);
          fetch(`/api/revision-topics/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {});
          return updated;
        }
        return r;
      });
      broadcastPostEvent({ type: 'REVISION_CHANGED', payload: { revisionTopics: nextTopics } });
      return nextTopics;
    });
  };

  const deleteRevisionTopic = (id: string): void => {
    setRevisionTopics(prev => {
      const nextTopics = prev.filter(r => r.id !== id);
      broadcastPostEvent({ type: 'REVISION_CHANGED', payload: { revisionTopics: nextTopics } });
      return nextTopics;
    });
    if (supabaseService.isAvailable()) supabaseService.deleteRevisionTopic(id);
    fetch(`/api/revision-topics/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // ============================================================
  // Daily Plan Actions
  // ============================================================

  const saveDailyPlan = (plan: DailyPlan): void => {
    setDailyPlans(prev => {
      const existing = prev.findIndex(p => p.date === plan.date);
      const updated = existing >= 0
        ? prev.map((p, idx) => idx === existing ? plan : p)
        : [plan, ...prev];

      broadcastPostEvent({ type: 'DAILY_PLANS_CHANGED', payload: { dailyPlans: updated } });
      return updated;
    });

    if (supabaseService.isAvailable()) supabaseService.upsertDailyPlan(plan);
    fetch('/api/daily-plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(plan) }).catch(() => {});
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
    setFocusSessions(prev => {
      const nextFocus = [newSession, ...prev];
      broadcastPostEvent({ type: 'FOCUS_CHANGED', payload: { focusSessions: nextFocus } });
      return nextFocus;
    });

    if (supabaseService.isAvailable()) supabaseService.upsertFocusSession(newSession);
    fetch('/api/focus-sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSession) }).catch(() => {});

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
      return { success: false, error: 'Incorrect CR authorization passcode. Announcement posting denied.' };
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

    if (supabaseService.isAvailable()) supabaseService.upsertAnnouncement(newAnn);
    fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAnn) }).catch(() => {});

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
    if (passcode !== undefined && (passcode || '').trim() !== 'iamcr') {
      return { success: false, error: 'Incorrect authorization passcode. Deletion denied.' };
    }
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
    if (supabaseService.isAvailable()) supabaseService.deleteAnnouncement(annId);
    fetch(`/api/announcements/${annId}`, { method: 'DELETE' }).catch(() => {});
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
        timetableSlots,
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
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
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
        ticker,
        isSupabaseConnected
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
