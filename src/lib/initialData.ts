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
  const today = new Date();

  const exam1Date = new Date(today);
  exam1Date.setDate(today.getDate() + 14);

  const exam2Date = new Date(today);
  exam2Date.setDate(today.getDate() + 21);

  return [
    {
      id: 'exam_dbms_01',
      subjectId: 'sub_it615',
      title: 'DBMS Mid-Semester Exam',
      examDate: exam1Date.toISOString().split('T')[0],
      examTime: '10:00',
      venue: 'Hall A, Block 2',
      difficulty: 'hard',
      preparationPercent: 35,
      targetScore: 80,
      topics: [
        { id: 't1', title: 'ER Diagrams & Relational Model', isLearned: true },
        { id: 't2', title: 'SQL DDL & DML', isLearned: true },
        { id: 't3', title: 'Normalization (1NF–BCNF)', isLearned: false },
        { id: 't4', title: 'Indexing & B+ Trees', isLearned: false },
        { id: 't5', title: 'Transactions & ACID', isLearned: false }
      ],
      notes: 'Focus on normalization and transactions. Review past papers.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'exam_dsa_01',
      subjectId: 'sub_it639',
      title: 'DSA End-Semester Exam',
      examDate: exam2Date.toISOString().split('T')[0],
      examTime: '14:00',
      venue: 'Computer Lab 3',
      difficulty: 'very_hard',
      preparationPercent: 20,
      targetScore: 75,
      topics: [
        { id: 't1', title: 'Arrays, Strings, Recursion', isLearned: true },
        { id: 't2', title: 'Linked Lists, Stacks, Queues', isLearned: false },
        { id: 't3', title: 'Trees (BST, AVL, Heap)', isLearned: false },
        { id: 't4', title: 'Graph Algorithms (BFS/DFS)', isLearned: false },
        { id: 't5', title: 'Dynamic Programming', isLearned: false },
        { id: 't6', title: 'Sorting & Searching', isLearned: false }
      ],
      notes: 'Practice coding problems daily. Focus on DP patterns.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// ============================================================
// Sample Goals
// ============================================================

export function getInitialGoals(): Goal[] {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  return [
    {
      id: 'goal_study_01',
      title: 'Study 20 hours this week',
      description: 'Maintain consistent study schedule across all subjects',
      targetValue: 20,
      currentValue: 0,
      unit: 'hours',
      deadline: nextWeek.toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'goal_dbms_01',
      title: 'Complete DBMS syllabus',
      description: 'Cover all DBMS topics before the exam',
      subjectId: 'sub_it615',
      targetValue: 100,
      currentValue: 35,
      unit: '%',
      deadline: nextMonth.toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
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
