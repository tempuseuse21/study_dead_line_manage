export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'not_started' | 'in_progress' | 'waiting' | 'completed' | 'overdue';

export type DeadlineUrgency = 'normal' | 'attention' | 'warning' | 'critical' | 'very_critical' | 'overdue';

export type RecurringFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type MemberRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  college?: string;
  course?: string;
  semester?: string | number;
  timezone?: string;
  joinedAt: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: MemberRole;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: string;
  color: string;
  icon?: string;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherName: string;
  description?: string;
  color: string;
  icon?: string;
  groupId?: string; // If belongs to group, or empty for personal
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaderId: string;
  uploaderName: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskReminder {
  id: string;
  type: '7_days' | '3_days' | '1_day' | '12_hours' | '6_hours' | '1_hour' | '30_minutes' | 'custom';
  minutesBefore: number;
  label: string;
  enabled: boolean;
}

export interface TaskDependency {
  dependsOnTaskId: string;
  dependsOnTaskTitle?: string;
  isCompleted?: boolean;
}

export interface ClassAnnouncement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string; // 'Class Representative', 'Professor', 'Class Admin'
  subjectId?: string;
  isPinned?: boolean;
  priority: 'normal' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  isRead?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subjectId?: string;
  subject?: Subject;
  groupId?: string; // empty if personal task
  groupName?: string;
  createdById: string;
  createdByName: string;
  assignedToIds: string[]; // User IDs (or 'all' for entire group)
  dueDate: string; // ISO date string e.g. "2026-08-25"
  dueTime: string; // e.g. "23:59"
  priority: Priority;
  status: TaskStatus;
  progress: number; // 0 - 100
  tags: string[];
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  dependencies: TaskDependency[];
  reminders: TaskReminder[];
  recurring: RecurringFrequency;
  notifyTarget: 'everyone' | 'assigned' | 'creator';
  isVerifiedOfficial?: boolean; // Verified / Approved by Class Representative or Admin
  isPinned?: boolean; // Pinned to top of dashboard by Admin
  officialNote?: string; // Optional official remark from Admin/CR
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'DEADLINE_7_DAYS'
  | 'DEADLINE_3_DAYS'
  | 'DEADLINE_1_DAY'
  | 'DEADLINE_6_HOURS'
  | 'DEADLINE_1_HOUR'
  | 'TASK_OVERDUE'
  | 'TASK_COMPLETED'
  | 'COMMENT_ADDED'
  | 'GROUP_INVITATION'
  | 'STREAK_ACHIEVED';

export interface AppNotification {
  id: string;
  userId: string;
  taskId?: string;
  groupId?: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledAt: string;
  sentAt: string;
  readAt?: string;
  isRead: boolean;
  actionUrl?: string;
  severity?: 'info' | 'warning' | 'danger' | 'success';
}

export interface ActivityLog {
  id: string;
  groupId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  targetType: 'task' | 'subject' | 'group' | 'comment' | 'attachment';
  targetId: string;
  targetTitle: string;
  timestamp: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface NotificationPreferences {
  deadline7Days: boolean;
  deadline3Days: boolean;
  deadline1Day: boolean;
  deadline12Hours: boolean;
  deadline6Hours: boolean;
  deadline1Hour: boolean;
  deadline30Minutes: boolean;
  groupNewTask: boolean;
  groupTaskCompleted: boolean;
  groupTaskReassigned: boolean;
  groupComment: boolean;
  groupDeadlineChanged: boolean;
  deliveryInApp: boolean;
  deliveryBrowser: boolean;
  deliveryEmail: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "23:00"
  quietHoursEnd: string; // "07:00"
}

export interface UserAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number; // percentage
  onTimeCompletionRate: number; // percentage
  overdueRate: number; // percentage
  completedThisWeek: number;
  currentStreak: number;
  bestStreak: number;
  totalFocusMinutes: number;
  tasksBySubject: { subjectName: string; color: string; count: number; completed: number }[];
  tasksByPriority: { priority: Priority; count: number }[];
  weeklyActivity: { day: string; date: string; completedCount: number; dueCount: number }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}
