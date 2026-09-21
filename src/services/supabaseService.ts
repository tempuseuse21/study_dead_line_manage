import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ActivityLog,
  ClassAnnouncement,
  DailyPlan,
  Exam,
  FocusSession,
  Goal,
  Note,
  Resource,
  RevisionTopic,
  Subject,
  Task
} from '../types';

/**
 * Supabase Data Access Service
 * Synchronizes local state with cloud database tables and enables real-time updates.
 */

// Helper to convert snake_case object keys to camelCase for DB rows
const mapSubjectFromDb = (row: any): Subject => ({
  id: row.id,
  name: row.name,
  code: row.code,
  teacherName: row.teacher_name || '',
  professor: row.teacher_name || '',
  color: row.color || '#6366f1',
  description: row.description,
  credits: row.credits ?? 3,
  semester: row.semester ?? 1,
  importance: row.importance || 'medium',
  targetGrade: row.target_grade || 'A',
  groupId: row.group_id,
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at
});

const mapSubjectToDb = (s: Partial<Subject>): any => ({
  id: s.id,
  name: s.name,
  code: s.code,
  teacher_name: s.teacherName || s.professor || '',
  color: s.color,
  description: s.description,
  credits: s.credits,
  semester: s.semester,
  importance: s.importance,
  target_grade: s.targetGrade,
  group_id: s.groupId,
  updated_at: new Date().toISOString()
});

const mapTaskFromDb = (row: any): Task => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  type: row.type || 'assignment',
  subjectId: row.subject_id,
  groupId: row.group_id,
  groupName: row.group_name,
  createdById: row.created_by_id || 'usr_student',
  createdByName: row.created_by_name || 'Student',
  assignedToIds: Array.isArray(row.assigned_to_ids) ? row.assigned_to_ids : [],
  dueDate: row.due_date,
  dueTime: row.due_time || '23:59',
  priority: row.priority || 'medium',
  status: row.status || 'not_started',
  progress: row.progress ?? 0,
  difficulty: row.difficulty,
  estimatedDurationMinutes: row.estimated_duration_minutes,
  actualDurationMinutes: row.actual_duration_minutes,
  tags: Array.isArray(row.tags) ? row.tags : [],
  subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
  attachments: Array.isArray(row.attachments) ? row.attachments : [],
  comments: Array.isArray(row.comments) ? row.comments : [],
  dependencies: Array.isArray(row.dependencies) ? row.dependencies : [],
  reminders: Array.isArray(row.reminders) ? row.reminders : [],
  recurring: row.recurring || 'none',
  notifyTarget: row.notify_target || 'everyone',
  isVerifiedOfficial: Boolean(row.is_verified_official),
  isPinned: Boolean(row.is_pinned),
  officialNote: row.official_note,
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
  completedAt: row.completed_at
});

const mapTaskToDb = (t: Partial<Task>): any => ({
  id: t.id,
  title: t.title,
  description: t.description,
  type: t.type,
  subject_id: t.subjectId,
  group_id: t.groupId,
  group_name: t.groupName,
  created_by_id: t.createdById,
  created_by_name: t.createdByName,
  assigned_to_ids: t.assignedToIds || [],
  due_date: t.dueDate,
  due_time: t.dueTime,
  priority: t.priority,
  status: t.status,
  progress: t.progress,
  difficulty: t.difficulty,
  estimated_duration_minutes: t.estimatedDurationMinutes,
  actual_duration_minutes: t.actualDurationMinutes,
  tags: t.tags || [],
  subtasks: t.subtasks || [],
  attachments: t.attachments || [],
  comments: t.comments || [],
  dependencies: t.dependencies || [],
  reminders: t.reminders || [],
  recurring: t.recurring,
  notify_target: t.notifyTarget,
  is_verified_official: t.isVerifiedOfficial,
  is_pinned: t.isPinned,
  official_note: t.officialNote,
  updated_at: new Date().toISOString(),
  completed_at: t.completedAt
});

export const supabaseService = {
  // Check availability
  isAvailable(): boolean {
    return isSupabaseConfigured() && supabase !== null;
  },

  // --- Subjects ---
  async fetchSubjects(): Promise<Subject[]> {
    if (!this.isAvailable()) return [];
    const { data, error } = await supabase!.from('subjects').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching subjects from Supabase:', error);
      return [];
    }
    return (data || []).map(mapSubjectFromDb);
  },

  async upsertSubject(subject: Subject): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const dbRow = mapSubjectToDb(subject);
    const { error } = await supabase!.from('subjects').upsert(dbRow);
    if (error) {
      console.error('Error upserting subject to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteSubject(id: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('subjects').delete().eq('id', id);
    if (error) {
      console.error('Error deleting subject from Supabase:', error);
      return false;
    }
    return true;
  },

  // --- Tasks ---
  async fetchTasks(): Promise<Task[]> {
    if (!this.isAvailable()) return [];
    const { data, error } = await supabase!.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching tasks from Supabase:', error);
      return [];
    }
    return (data || []).map(mapTaskFromDb);
  },

  async upsertTask(task: Task): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const dbRow = mapTaskToDb(task);
    const { error } = await supabase!.from('tasks').upsert(dbRow);
    if (error) {
      console.error('Error upserting task to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteTask(id: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task from Supabase:', error);
      return false;
    }
    return true;
  },

  // --- Exams ---
  async fetchExams(): Promise<Exam[]> {
    if (!this.isAvailable()) return [];
    const { data, error } = await supabase!.from('exams').select('*');
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      subjectId: row.subject_id,
      title: row.title,
      examDate: row.exam_date,
      examTime: row.exam_time,
      venue: row.venue,
      difficulty: row.difficulty,
      preparationPercent: row.preparation_percent ?? 0,
      targetScore: row.target_score,
      topics: row.topics || [],
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  async upsertExam(exam: Exam): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('exams').upsert({
      id: exam.id,
      subject_id: exam.subjectId,
      title: exam.title,
      exam_date: exam.examDate,
      exam_time: exam.examTime,
      venue: exam.venue,
      difficulty: exam.difficulty,
      preparation_percent: exam.preparationPercent,
      target_score: exam.targetScore,
      topics: exam.topics || [],
      notes: exam.notes,
      updated_at: new Date().toISOString()
    });
    return !error;
  },

  async deleteExam(id: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('exams').delete().eq('id', id);
    return !error;
  },

  // --- Goals ---
  async fetchGoals(): Promise<Goal[]> {
    if (!this.isAvailable()) return [];
    const { data, error } = await supabase!.from('goals').select('*');
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      subjectId: row.subject_id,
      targetValue: row.target_value,
      currentValue: row.current_value ?? 0,
      unit: row.unit,
      deadline: row.deadline,
      status: row.status || 'active',
      linkedTaskIds: row.linked_task_ids || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  async upsertGoal(goal: Goal): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('goals').upsert({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      subject_id: goal.subjectId,
      target_value: goal.targetValue,
      current_value: goal.currentValue,
      unit: goal.unit,
      deadline: goal.deadline,
      status: goal.status,
      linked_task_ids: goal.linkedTaskIds || [],
      updated_at: new Date().toISOString()
    });
    return !error;
  },

  async deleteGoal(id: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('goals').delete().eq('id', id);
    return !error;
  },

  // --- Notes ---
  async fetchNotes(): Promise<Note[]> {
    if (!this.isAvailable()) return [];
    const { data, error } = await supabase!.from('notes').select('*');
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      subjectId: row.subject_id,
      examId: row.exam_id,
      taskId: row.task_id,
      tags: row.tags || [],
      isPinned: Boolean(row.is_pinned),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  async upsertNote(note: Note): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('notes').upsert({
      id: note.id,
      title: note.title,
      content: note.content,
      subject_id: note.subjectId,
      exam_id: note.examId,
      task_id: note.taskId,
      tags: note.tags || [],
      is_pinned: note.isPinned,
      updated_at: new Date().toISOString()
    });
    return !error;
  },

  async deleteNote(id: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('notes').delete().eq('id', id);
    return !error;
  },

  // --- Resources ---
  async fetchResources(): Promise<Resource[]> {
    if (!this.isAvailable()) return [];
    const { data, error } = await supabase!.from('resources').select('*');
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      url: row.url,
      type: row.type,
      subjectId: row.subject_id,
      topic: row.topic,
      tags: row.tags || [],
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  async upsertResource(res: Resource): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('resources').upsert({
      id: res.id,
      title: res.title,
      url: res.url,
      type: res.type,
      subject_id: res.subjectId,
      topic: res.topic,
      tags: res.tags || [],
      notes: res.notes,
      updated_at: new Date().toISOString()
    });
    return !error;
  },

  async deleteResource(id: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase!.from('resources').delete().eq('id', id);
    return !error;
  },

  // --- Realtime Subscriptions ---
  subscribeToChanges(table: string, onChange: () => void) {
    if (!this.isAvailable()) return () => {};

    const channel = supabase!
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        onChange();
      })
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }
};
