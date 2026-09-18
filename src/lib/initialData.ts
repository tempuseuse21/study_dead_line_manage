import { ActivityLog, AppNotification, ClassAnnouncement, NotificationPreferences, Subject, Task } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub_it615',
    name: 'Database Management System',
    code: 'IT615',
    teacherName: 'Prof. Ramesh Kulkarni',
    description: 'Relational model, SQL DDL/DML, ER-to-Relational mapping, Normalization (1NF–BCNF), Indexing (B+ Trees), and ACID Transaction management.',
    color: '#3b82f6',
    icon: 'Database',
    createdAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'sub_sc612',
    name: 'Discrete Maths',
    code: 'SC612',
    teacherName: 'Dr. Sunita Deshmukh',
    description: 'Set theory, Propositional and Predicate logic, Graph theory (Euler/Hamiltonian paths, Trees, Planarity), Combinatorics, and Recurrence relations.',
    color: '#8b5cf6',
    icon: 'Binary',
    createdAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'sub_pc613',
    name: 'Communication Skills',
    code: 'PC613',
    teacherName: 'Dr. Ananya Roy',
    description: 'Technical writing, IEEE/ACM research paper structure, executive summary synthesis, academic presentations, and professional speaking.',
    color: '#f59e0b',
    icon: 'MessageSquare',
    createdAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'sub_it603',
    name: 'Introduction to Programming',
    code: 'IT603',
    teacherName: 'Prof. Amit Shah',
    description: 'Core programming constructs, pointers, memory allocation, object-oriented concepts, exception handling, and modular software design in C++/Python.',
    color: '#10b981',
    icon: 'Code',
    createdAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'sub_it639',
    name: 'Data Structures and Algorithms',
    code: 'IT639',
    teacherName: 'Prof. Hitesh Bhatt',
    description: 'Arrays, Linked Lists, Stacks, Queues, Balanced Search Trees (AVL, Red-Black), Graph Algorithms (BFS/DFS, Dijkstra, Kruskal), Dynamic Programming, and asymptotic analysis.',
    color: '#ec4899',
    icon: 'GitFork',
    createdAt: '2026-01-20T08:00:00.000Z'
  }
];

// Cleared sample data - starting fresh
export const INITIAL_TASKS: Task[] = [];

export const INITIAL_ANNOUNCEMENTS: ClassAnnouncement[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_ACTIVITY: ActivityLog[] = [];

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
  deliveryInApp: true,
  deliveryBrowser: true,
  deliveryEmail: false,
  quietHoursEnabled: false,
  quietHoursStart: '23:00',
  quietHoursEnd: '07:00'
};
