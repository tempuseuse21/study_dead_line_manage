// ============================================================
// Core Enums / Union Types
// ============================================================

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'not_started' | 'in_progress' | 'waiting' | 'completed' | 'overdue' | 'cancelled';

export type TaskType =
  | 'assignment'
  | 'homework'
  | 'exam'
  | 'project'
  | 'revision'
  | 'reading'
  | 'practice'
  | 'personal'
  | 'other';

export type DeadlineUrgency = 'normal' | 'attention' | 'warning' | 'critical' | 'very_critical' | 'overdue';

export type RecurringFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type MemberRole = 'owner' | 'admin' | 'member';

export type ResourceType = 'pdf' | 'youtube' | 'website' | 'notes' | 'drive' | 'other';

export type RevisionStatus = 'not_started' | 'learned' | 'revision_1' | 'revision_2' | 'revision_3' | 'mastered';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export type ExamDifficulty = 'easy' | 'moderate' | 'hard' | 'very_hard';

// ============================================================
// User & Auth
// ============================================================

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

export interface StudyPreferences {
  dailyStudyTargetHours: number;        // e.g., 4
  preferredStudyStartHour: number;      // e.g., 9 (9 AM)
  preferredStudyEndHour: number;        // e.g., 21 (9 PM)
  defaultSessionDurationMinutes: number; // e.g., 25
  defaultBreakDurationMinutes: number;  // e.g., 5
  longBreakDurationMinutes: number;     // e.g., 15
  sessionsBeforeLongBreak: number;      // e.g., 4
}

// ============================================================
// Subject
// ============================================================

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherName: string;
  professor?: string; // alias for teacherName
  description?: string;
  color: string;
  icon?: string;
  credits?: number;
  semester?: number;
  importance?: 'low' | 'medium' | 'high';
  targetGrade?: string;
  groupId?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// Task & Sub-entities
// ============================================================

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

export interface Task {
  id: string;
  title: string;
  description: string;
  type?: TaskType;
  subjectId?: string;
  subject?: Subject;
  groupId?: string;
  groupName?: string;
  createdById: string;
  createdByName: string;
  assignedToIds: string[];
  dueDate: string;   // ISO date string "2026-08-25"
  dueTime: string;   // "23:59"
  priority: Priority;
  status: TaskStatus;
  progress: number;  // 0–100
  difficulty?: 'easy' | 'moderate' | 'hard' | 'very_hard';
  estimatedDurationMinutes?: number;
  actualDurationMinutes?: number;
  tags: string[];
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  dependencies: TaskDependency[];
  reminders: TaskReminder[];
  recurring: RecurringFrequency;
  notifyTarget: 'everyone' | 'assigned' | 'creator';
  isVerifiedOfficial?: boolean;
  isPinned?: boolean;
  officialNote?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ============================================================
// Exam
// ============================================================

export interface ExamTopic {
  id: string;
  title: string;
  isLearned: boolean;
}

export interface Exam {
  id: string;
  subjectId?: string;
  title: string;
  examDate: string;    // "2026-09-25"
  examTime?: string;   // "10:00"
  venue?: string;
  difficulty?: ExamDifficulty;
  preparationPercent: number;  // 0–100
  targetScore?: number;        // e.g., 85
  topics: ExamTopic[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Goal
// ============================================================

export interface Goal {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  targetValue?: number;    // e.g., 20 (hours)
  currentValue: number;    // e.g., 11
  unit?: string;           // e.g., "hours", "tasks", "%"
  deadline?: string;       // ISO date
  status: GoalStatus;
  linkedTaskIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Note
// ============================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  examId?: string;
  taskId?: string;
  tags: string[];
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Resource
// ============================================================

export interface Resource {
  id: string;
  title: string;
  url?: string;
  type: ResourceType;
  subjectId?: string;
  topic?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Revision (Spaced Repetition)
// ============================================================

export interface RevisionTopic {
  id: string;
  title: string;
  subjectId?: string;
  examId?: string;
  status: RevisionStatus;
  difficulty?: 'easy' | 'moderate' | 'hard';
  learnedAt?: string;
  revision1At?: string;
  revision2At?: string;
  revision3At?: string;
  masteredAt?: string;
  nextRevisionDue?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Study Planner
// ============================================================

export interface PlannerSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  subjectId?: string;
  startTime: string;    // "09:00"
  endTime: string;      // "10:00"
  durationMinutes: number;
  isBreak: boolean;
  isCompleted: boolean;
  skipped: boolean;
  date: string;         // "2026-09-18"
}

export interface DailyPlan {
  date: string;
  sessions: PlannerSession[];
  totalStudyMinutes: number;
  isReviewed: boolean;
  reviewedAt?: string;
}

// ============================================================
// Group (preserved)
// ============================================================

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

// ============================================================
// Announcements (CR Board — preserved)
// ============================================================

export interface ClassAnnouncement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  subjectId?: string;
  isPinned?: boolean;
  priority: 'normal' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  isRead?: boolean;
}

// ============================================================
// Notifications
// ============================================================

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
  | 'STREAK_ACHIEVED'
  | 'EXAM_REMINDER'
  | 'REVISION_DUE'
  | 'GOAL_COMPLETED';

export interface AppNotification {
  id: string;
  userId: string;
  taskId?: string;
  groupId?: string;
  examId?: string;
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

// ============================================================
// Activity Log
// ============================================================

export interface ActivityLog {
  id: string;
  groupId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  targetType: 'task' | 'subject' | 'group' | 'comment' | 'attachment' | 'exam' | 'goal' | 'note';
  targetId: string;
  targetTitle: string;
  timestamp: string;
}

// ============================================================
// Focus Session
// ============================================================

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  subjectId?: string;
  durationMinutes: number;
  sessionType?: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

// ============================================================
// Notification Preferences
// ============================================================

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
  examReminders: boolean;
  revisionReminders: boolean;
  deliveryInApp: boolean;
  deliveryBrowser: boolean;
  deliveryEmail: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "23:00"
  quietHoursEnd: string;   // "07:00"
}

// ============================================================
// Analytics
// ============================================================

export interface WeeklyActivityEntry {
  day: string;
  date: string;
  completedCount: number;
  dueCount: number;
  focusMinutes: number;
}

export interface UserAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  onTimeCompletionRate: number;
  overdueRate: number;
  completedThisWeek: number;
  currentStreak: number;
  bestStreak: number;
  totalFocusMinutes: number;
  focusMinutesToday: number;
  tasksBySubject: { subjectName: string; color: string; count: number; completed: number }[];
  tasksByPriority: { priority: Priority; count: number }[];
  weeklyActivity: WeeklyActivityEntry[];
}

// ============================================================
// Priority Engine Result
// ============================================================

export interface PriorityResult {
  score: number;
  reasons: string[];
  urgencyLabel: string;
}

// ============================================================
// Data Export/Import
// ============================================================

export interface ExportData {
  version: string;
  exportedAt: string;
  tasks: Task[];
  subjects: Subject[];
  exams: Exam[];
  goals: Goal[];
  notes: Note[];
  resources: Resource[];
  revisionTopics: RevisionTopic[];
  dailyPlans: DailyPlan[];
  focusSessions: FocusSession[];
  preferences: NotificationPreferences;
  studyPreferences: StudyPreferences;
}

// ============================================================
// Auth State
// ============================================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}
