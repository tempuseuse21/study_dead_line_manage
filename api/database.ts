import fs from 'fs';
import path from 'path';
import {
  INITIAL_ACTIVITY,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_PREFERENCES,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_TIMETABLE_SLOTS,
  getInitialExams,
  getInitialGoals
} from '../src/lib/initialData.js';
import {
  ActivityLog,
  AppNotification,
  Subject,
  Task,
  FocusSession,
  ClassAnnouncement,
  TimetableSlot,
  Exam,
  Goal,
  Note,
  Resource,
  RevisionTopic,
  DailyPlan,
  NotificationPreferences
} from '../src/types.js';

export interface DatabaseSchema {
  subjects: Subject[];
  tasks: Task[];
  notifications: AppNotification[];
  activities: ActivityLog[];
  announcements: ClassAnnouncement[];
  timetableSlots: TimetableSlot[];
  exams: Exam[];
  goals: Goal[];
  notes: Note[];
  resources: Resource[];
  revisionTopics: RevisionTopic[];
  dailyPlans: DailyPlan[];
  focusSessions: FocusSession[];
  notificationPreferences: NotificationPreferences;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

export function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        subjects: parsed.subjects || JSON.parse(JSON.stringify(INITIAL_SUBJECTS)),
        tasks: parsed.tasks || JSON.parse(JSON.stringify(INITIAL_TASKS)),
        notifications: parsed.notifications || JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
        activities: parsed.activities || JSON.parse(JSON.stringify(INITIAL_ACTIVITY)),
        announcements: parsed.announcements || JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS)),
        timetableSlots: parsed.timetableSlots || JSON.parse(JSON.stringify(INITIAL_TIMETABLE_SLOTS)),
        exams: parsed.exams || JSON.parse(JSON.stringify(getInitialExams())),
        goals: parsed.goals || JSON.parse(JSON.stringify(getInitialGoals())),
        notes: parsed.notes || [],
        resources: parsed.resources || [],
        revisionTopics: parsed.revisionTopics || [],
        dailyPlans: parsed.dailyPlans || [],
        focusSessions: parsed.focusSessions || [],
        notificationPreferences: parsed.notificationPreferences || { ...INITIAL_NOTIFICATION_PREFERENCES }
      };
    }
  } catch (err) {
    console.error('Error loading database from disk, creating default schema:', err);
  }

  const initialData: DatabaseSchema = {
    subjects: JSON.parse(JSON.stringify(INITIAL_SUBJECTS)),
    tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
    notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
    activities: JSON.parse(JSON.stringify(INITIAL_ACTIVITY)),
    announcements: JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS)),
    timetableSlots: JSON.parse(JSON.stringify(INITIAL_TIMETABLE_SLOTS)),
    exams: JSON.parse(JSON.stringify(getInitialExams())),
    goals: JSON.parse(JSON.stringify(getInitialGoals())),
    notes: [],
    resources: [],
    revisionTopics: [],
    dailyPlans: [],
    focusSessions: [],
    notificationPreferences: { ...INITIAL_NOTIFICATION_PREFERENCES }
  };

  saveDatabase(initialData);
  return initialData;
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file to disk:', err);
  }
}
