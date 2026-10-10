import {
  ActivityLog,
  AppNotification,
  ClassAnnouncement,
  Exam,
  Goal,
  NotificationPreferences,
  Subject,
  StudyPreferences,
  Task
} from '../types';
import { getTodayStr } from './utils';

// ============================================================
// Subjects (5 MSc IT subjects — user can edit/add/delete)
// ============================================================

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub_it615',
    name: 'Database Management System',
    code: 'IT615',
    teacherName: 'Prof. Minal Bhise',
    professor: 'Prof. Minal Bhise',
    description:
      'Relational model, SQL DDL/DML, ER-to-Relational mapping, Normalization (1NF–BCNF), Indexing (B+ Trees), and ACID Transaction management.',
    color: '#3b82f6',
    icon: 'Database',
    credits: 4,
    semester: 2,
    importance: 'high',
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'sub_sc612',
    name: 'Discrete Mathematics',
    code: 'SC612',
    teacherName: 'Prof. Gopinath Panda',
    professor: 'Prof. Gopinath Panda',
    description:
      'Set theory, Propositional and Predicate logic, Graph theory (Euler/Hamiltonian paths, Trees, Planarity), Combinatorics, and Recurrence relations.',
    color: '#8b5cf6',
    icon: 'Binary',
    credits: 4,
    semester: 2,
    importance: 'medium',
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'sub_pc613',
    name: 'Communication Skills',
    code: 'PC613',
    teacherName: 'Prof. Nandini Banerjee',
    professor: 'Prof. Nandini Banerjee',
    description:
      'Technical writing, IEEE/ACM research paper structure, executive summary synthesis, academic presentations, and professional speaking.',
    color: '#f59e0b',
    icon: 'MessageSquare',
    credits: 2,
    semester: 2,
    importance: 'medium',
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'sub_it603',
    name: 'Introduction to Programming',
    code: 'IT603',
    teacherName: 'Prof. Sandeep Modha',
    professor: 'Prof. Sandeep Modha',
    description:
      'Core programming constructs, pointers, memory allocation, object-oriented concepts, exception handling, and modular software design in C++/Python.',
    color: '#10b981',
    icon: 'Code',
    credits: 4,
    semester: 2,
    importance: 'high',
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'sub_it639',
    name: 'Data Structures & Algorithms',
    code: 'IT639',
    teacherName: 'Prof. Supantha Pandit',
    professor: 'Prof. Supantha Pandit',
    description:
      'Arrays, Linked Lists, Stacks, Queues, Balanced Search Trees (AVL, Red-Black), Graph Algorithms (BFS/DFS, Dijkstra, Kruskal), Dynamic Programming, and asymptotic analysis.',
    color: '#ec4899',
    icon: 'GitFork',
    credits: 4,
    semester: 2,
    importance: 'high',
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z'
  }
];

// ============================================================
// Tasks (start empty — user will add their own)
// ============================================================

export const INITIAL_TASKS: Task[] = [];

// ============================================================
// Announcements (CR Board)
// ============================================================

export const INITIAL_ANNOUNCEMENTS: ClassAnnouncement[] = [];

// ============================================================
// Notifications
// ============================================================

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

// ============================================================
// Activity Log
// ============================================================

export const INITIAL_ACTIVITY: ActivityLog[] = [];

// ============================================================
// Sample Exams (shown on first run to demonstrate the feature)
// ============================================================

export function getInitialExams(): Exam[] {
  return [];
}

// ============================================================
// Sample Goals
// ============================================================

export function getInitialGoals(): Goal[] {
  return [];
}

// ============================================================
// Notification Preferences
// ============================================================

export const INITIAL_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  deadline7Days: true,
  deadline3Days: true,
  deadline1Day: true,
  deadline12Hours: true,
  deadline6Hours: true,
  deadline1Hour: true,
  deadline30Minutes: true,
  groupNewTask: true,
  groupTaskCompleted: true,
  groupTaskReassigned: false,
  groupComment: true,
  groupDeadlineChanged: true,
  examReminders: true,
  revisionReminders: true,
  deliveryInApp: true,
  deliveryBrowser: true,
  deliveryEmail: false,
  quietHoursEnabled: false,
  quietHoursStart: '23:00',
  quietHoursEnd: '07:00'
};

// ============================================================
// Study Preferences
// ============================================================

export const INITIAL_STUDY_PREFERENCES: StudyPreferences = {
  dailyStudyTargetHours: 4,
  preferredStudyStartHour: 9,
  preferredStudyEndHour: 21,
  defaultSessionDurationMinutes: 25,
  defaultBreakDurationMinutes: 5,
  longBreakDurationMinutes: 15,
  sessionsBeforeLongBreak: 4
};

// ============================================================
// Initial Timetable Slots
// ============================================================

export const INITIAL_TIMETABLE_SLOTS = [
  {
    id: 'tt_1',
    day: 'Monday' as const,
    startTime: '09:00',
    endTime: '10:00',
    subjectId: 'sub_it615',
    subjectCode: 'IT615',
    subjectName: 'Database Management System',
    room: 'LH-101',
    professor: 'Prof. Minal Bhise',
    type: 'lecture' as const,
    color: '#3b82f6'
  },
  {
    id: 'tt_2',
    day: 'Monday' as const,
    startTime: '10:15',
    endTime: '11:15',
    subjectId: 'sub_sc612',
    subjectCode: 'SC612',
    subjectName: 'Discrete Mathematics',
    room: 'LH-102',
    professor: 'Prof. Gopinath Panda',
    type: 'lecture' as const,
    color: '#8b5cf6'
  },
  {
    id: 'tt_3',
    day: 'Monday' as const,
    startTime: '14:00',
    endTime: '16:00',
    subjectId: 'sub_it615',
    subjectCode: 'IT615',
    subjectName: 'DBMS Lab Session',
    room: 'Computer Lab 3',
    professor: 'Prof. Minal Bhise',
    type: 'lab' as const,
    color: '#3b82f6'
  },
  {
    id: 'tt_4',
    day: 'Tuesday' as const,
    startTime: '09:00',
    endTime: '10:00',
    subjectId: 'sub_it603',
    subjectCode: 'IT603',
    subjectName: 'Introduction to Programming',
    room: 'LH-103',
    professor: 'Prof. Sandeep Modha',
    type: 'lecture' as const,
    color: '#10b981'
  },
  {
    id: 'tt_5',
    day: 'Tuesday' as const,
    startTime: '10:15',
    endTime: '11:15',
    subjectId: 'sub_it639',
    subjectCode: 'IT639',
    subjectName: 'Data Structures & Algorithms',
    room: 'LH-101',
    professor: 'Prof. Supantha Pandit',
    type: 'lecture' as const,
    color: '#ec4899'
  },
  {
    id: 'tt_6',
    day: 'Wednesday' as const,
    startTime: '09:00',
    endTime: '10:00',
    subjectId: 'sub_pc613',
    subjectCode: 'PC613',
    subjectName: 'Communication Skills',
    room: 'Seminar Hall B',
    professor: 'Prof. Nandini Banerjee',
    type: 'lecture' as const,
    color: '#f59e0b'
  },
  {
    id: 'tt_7',
    day: 'Wednesday' as const,
    startTime: '14:00',
    endTime: '16:00',
    subjectId: 'sub_it639',
    subjectCode: 'IT639',
    subjectName: 'DSA Practical Lab',
    room: 'Advanced Software Lab 1',
    professor: 'Prof. Supantha Pandit',
    type: 'lab' as const,
    color: '#ec4899'
  },
  {
    id: 'tt_8',
    day: 'Thursday' as const,
    startTime: '09:00',
    endTime: '10:00',
    subjectId: 'sub_sc612',
    subjectCode: 'SC612',
    subjectName: 'Discrete Mathematics Tutorial',
    room: 'LH-102',
    professor: 'Prof. Gopinath Panda',
    type: 'tutorial' as const,
    color: '#8b5cf6'
  },
  {
    id: 'tt_9',
    day: 'Friday' as const,
    startTime: '09:00',
    endTime: '11:00',
    subjectId: 'sub_it603',
    subjectCode: 'IT603',
    subjectName: 'C++/Python Programming Lab',
    room: 'Lab 2',
    professor: 'Prof. Sandeep Modha',
    type: 'lab' as const,
    color: '#10b981'
  }
];
