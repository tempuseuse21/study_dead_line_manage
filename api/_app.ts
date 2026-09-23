import express from 'express';
import { GoogleGenAI } from '@google/genai';
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
  DailyPlan
} from '../src/types.js';

// In-Memory Database Store
let subjects: Subject[] = JSON.parse(JSON.stringify(INITIAL_SUBJECTS));
let tasks: Task[] = JSON.parse(JSON.stringify(INITIAL_TASKS));
let notifications: AppNotification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
let activities: ActivityLog[] = JSON.parse(JSON.stringify(INITIAL_ACTIVITY));
let announcements: ClassAnnouncement[] = JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS));
let timetableSlots: TimetableSlot[] = JSON.parse(JSON.stringify(INITIAL_TIMETABLE_SLOTS));
let exams: Exam[] = JSON.parse(JSON.stringify(getInitialExams()));
let goals: Goal[] = JSON.parse(JSON.stringify(getInitialGoals()));
let notes: Note[] = [];
let resources: Resource[] = [];
let revisionTopics: RevisionTopic[] = [];
let dailyPlans: DailyPlan[] = [];
let focusSessions: FocusSession[] = [];
let notificationPreferences = { ...INITIAL_NOTIFICATION_PREFERENCES };

export const app = express();

app.use(express.json({ limit: '10mb' }));

// --- API Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Subjects API (5 Subjects only)
app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

// Tasks API
app.get('/api/tasks', (req, res) => {
  const populatedTasks = tasks.map(t => ({
    ...t,
    subject: subjects.find(s => s.id === t.subjectId)
  }));
  res.json(populatedTasks);
});

app.post('/api/tasks', (req, res) => {
  const taskData = req.body;
  const newTask: Task = {
    ...taskData,
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdById: 'student',
    createdByName: 'Student',
    assignedToIds: ['all'],
    progress: taskData.progress ?? 0,
    status: taskData.status || 'not_started',
    subtasks: taskData.subtasks || [],
    attachments: taskData.attachments || [],
    comments: taskData.comments || [],
    dependencies: taskData.dependencies || [],
    reminders: taskData.reminders || [
      { id: `rem_${Date.now()}_1`, type: '1_day', minutesBefore: 1440, label: '1 day before', enabled: true }
    ],
    tags: taskData.tags || ['Assignment'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.unshift(newTask);

  const newActivity: ActivityLog = {
    id: `act_${Date.now()}`,
    userId: 'student',
    userName: 'Student',
    action: 'created task',
    targetType: 'task',
    targetId: newTask.id,
    targetTitle: newTask.title,
    timestamp: new Date().toISOString()
  };
  activities.unshift(newActivity);

  res.json({ success: true, task: { ...newTask, subject: subjects.find(s => s.id === newTask.subjectId) } });
});

app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const prevTask = tasks[taskIndex];
  const updated = {
    ...prevTask,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  if (updated.status === 'completed' && prevTask.status !== 'completed') {
    updated.completedAt = new Date().toISOString();
    updated.progress = 100;
  }

  tasks[taskIndex] = updated;
  res.json({ success: true, task: { ...updated, subject: subjects.find(s => s.id === updated.subjectId) } });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  tasks = tasks.filter(t => t.id !== taskId);
  res.json({ success: true });
});

// Toggle Subtask
app.post('/api/tasks/:id/subtasks/:subtaskId/toggle', (req, res) => {
  const { id, subtaskId } = req.params;
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const subtask = task.subtasks.find(st => st.id === subtaskId);
  if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

  subtask.completed = !subtask.completed;
  subtask.completedAt = subtask.completed ? new Date().toISOString() : undefined;

  const total = task.subtasks.length;
  const completed = task.subtasks.filter(s => s.completed).length;
  task.progress = total > 0 ? Math.round((completed / total) * 100) : task.progress;
  if (task.progress === 100) {
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
  } else if (task.status === 'completed' && task.progress < 100) {
    task.status = 'in_progress';
    task.completedAt = undefined;
  }

  task.updatedAt = new Date().toISOString();
  res.json({ success: true, task: { ...task, subject: subjects.find(s => s.id === task.subjectId) } });
});

// Add Comment
app.post('/api/tasks/:id/comments', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const newComment = {
    id: `com_${Date.now()}`,
    taskId: id,
    userId: 'student',
    userName: 'Classmate',
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  task.comments = task.comments || [];
  task.comments.push(newComment);
  task.updatedAt = new Date().toISOString();

  res.json({ success: true, comment: newComment, task });
});

// Announcements API
app.get('/api/announcements', (req, res) => {
  res.json(announcements);
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    notif.readAt = new Date().toISOString();
  }
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  notifications.forEach(n => {
    n.isRead = true;
    n.readAt = new Date().toISOString();
  });
  res.json({ success: true });
});

app.delete('/api/notifications/:id', (req, res) => {
  const { id } = req.params;
  notifications = notifications.filter(n => n.id !== id);
  res.json({ success: true });
});

// Activity API
app.get('/api/activity', (req, res) => {
  res.json(activities.slice(0, 30));
});

// Focus Sessions API
app.get('/api/focus-sessions', (req, res) => {
  res.json(focusSessions);
});

app.post('/api/focus-sessions', (req, res) => {
  const { taskId, taskTitle, durationMinutes } = req.body;
  const session: FocusSession = {
    id: `foc_${Date.now()}`,
    userId: 'student',
    taskId,
    taskTitle,
    durationMinutes: durationMinutes || 25,
    completed: true,
    startedAt: new Date(Date.now() - (durationMinutes || 25) * 60000).toISOString(),
    completedAt: new Date().toISOString()
  };
  focusSessions.unshift(session);
  res.json({ success: true, session });
});
// Timetable API (Shared master timetable across all users)
app.get('/api/timetable', (req, res) => {
  res.json(timetableSlots);
});

app.post('/api/timetable', (req, res) => {
  const slotData = req.body;
  let prof = slotData.professor;
  if (!prof && slotData.subjectId) {
    const sub = subjects.find(s => s.id === slotData.subjectId);
    if (sub) prof = sub.professor || sub.teacherName;
  }
  const slotId = slotData.id || `tt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newSlot: TimetableSlot = {
    ...slotData,
    id: slotId,
    professor: prof || ''
  };

  const existingIdx = timetableSlots.findIndex(s => s.id === slotId);
  if (existingIdx !== -1) {
    timetableSlots[existingIdx] = newSlot;
  } else {
    timetableSlots.push(newSlot);
  }

  res.json({ success: true, slot: newSlot, slots: timetableSlots });
});

app.put('/api/timetable/:id', (req, res) => {
  const { id } = req.params;
  const index = timetableSlots.findIndex(s => s.id === id);
  if (index === -1) {
    const slotData = req.body;
    const newSlot = { ...slotData, id };
    timetableSlots.push(newSlot);
    return res.json({ success: true, slot: newSlot, slots: timetableSlots });
  }
  const updatedSlot = { ...timetableSlots[index], ...req.body };
  timetableSlots[index] = updatedSlot;
  res.json({ success: true, slot: updatedSlot, slots: timetableSlots });
});

app.delete('/api/timetable/:id', (req, res) => {
  const { id } = req.params;
  timetableSlots = timetableSlots.filter(s => s.id !== id);
  res.json({ success: true, slots: timetableSlots });
});

// Bulk timetable update
app.put('/api/timetable', (req, res) => {
  if (Array.isArray(req.body)) {
    timetableSlots = req.body;
  }
  res.json({ success: true, slots: timetableSlots });
});

// Exams API
app.get('/api/exams', (req, res) => res.json(exams));
app.post('/api/exams', (req, res) => {
  const newExam: Exam = { ...req.body, id: req.body.id || `exam_${Date.now()}` };
  exams.unshift(newExam);
  res.json({ success: true, exam: newExam });
});
app.put('/api/exams/:id', (req, res) => {
  const { id } = req.params;
  const idx = exams.findIndex(e => e.id === id);
  if (idx !== -1) exams[idx] = { ...exams[idx], ...req.body };
  res.json({ success: true, exam: exams[idx] });
});
app.delete('/api/exams/:id', (req, res) => {
  exams = exams.filter(e => e.id !== req.params.id);
  res.json({ success: true });
});

// Goals API
app.get('/api/goals', (req, res) => res.json(goals));
app.post('/api/goals', (req, res) => {
  const newGoal: Goal = { ...req.body, id: req.body.id || `goal_${Date.now()}` };
  goals.unshift(newGoal);
  res.json({ success: true, goal: newGoal });
});
app.put('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const idx = goals.findIndex(g => g.id === id);
  if (idx !== -1) goals[idx] = { ...goals[idx], ...req.body };
  res.json({ success: true, goal: goals[idx] });
});
app.delete('/api/goals/:id', (req, res) => {
  goals = goals.filter(g => g.id !== req.params.id);
  res.json({ success: true });
});

// Notes API
app.get('/api/notes', (req, res) => res.json(notes));
app.post('/api/notes', (req, res) => {
  const newNote: Note = { ...req.body, id: req.body.id || `note_${Date.now()}` };
  notes.unshift(newNote);
  res.json({ success: true, note: newNote });
});
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const idx = notes.findIndex(n => n.id === id);
  if (idx !== -1) notes[idx] = { ...notes[idx], ...req.body };
  res.json({ success: true, note: notes[idx] });
});
app.delete('/api/notes/:id', (req, res) => {
  notes = notes.filter(n => n.id !== req.params.id);
  res.json({ success: true });
});

// Resources API
app.get('/api/resources', (req, res) => res.json(resources));
app.post('/api/resources', (req, res) => {
  const newRes: Resource = { ...req.body, id: req.body.id || `res_${Date.now()}` };
  resources.unshift(newRes);
  res.json({ success: true, resource: newRes });
});
app.put('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  const idx = resources.findIndex(r => r.id === id);
  if (idx !== -1) resources[idx] = { ...resources[idx], ...req.body };
  res.json({ success: true, resource: resources[idx] });
});
app.delete('/api/resources/:id', (req, res) => {
  resources = resources.filter(r => r.id !== req.params.id);
  res.json({ success: true });
});

// Revision Topics API
app.get('/api/revision-topics', (req, res) => res.json(revisionTopics));
app.post('/api/revision-topics', (req, res) => {
  const newTopic: RevisionTopic = { ...req.body, id: req.body.id || `rev_${Date.now()}` };
  revisionTopics.unshift(newTopic);
  res.json({ success: true, topic: newTopic });
});
app.put('/api/revision-topics/:id', (req, res) => {
  const { id } = req.params;
  const idx = revisionTopics.findIndex(r => r.id === id);
  if (idx !== -1) revisionTopics[idx] = { ...revisionTopics[idx], ...req.body };
  res.json({ success: true, topic: revisionTopics[idx] });
});
app.delete('/api/revision-topics/:id', (req, res) => {
  revisionTopics = revisionTopics.filter(r => r.id !== req.params.id);
  res.json({ success: true });
});

// Daily Plans API
app.get('/api/daily-plans', (req, res) => res.json(dailyPlans));
app.post('/api/daily-plans', (req, res) => {
  const plan: DailyPlan = req.body;
  const idx = dailyPlans.findIndex(p => p.date === plan.date);
  if (idx !== -1) dailyPlans[idx] = plan;
  else dailyPlans.unshift(plan);
  res.json({ success: true, plan });
});

// AI Task Breakdown Helper
app.post('/api/ai/breakdown', async (req, res) => {
  const { title, description, subjectName } = req.body;
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        subtasks: [
          { id: `st_${Date.now()}_1`, title: 'Review lecture syllabus and problem requirements', completed: false },
          { id: `st_${Date.now()}_2`, title: 'Gather core references, textbook chapters, and sample codes', completed: false },
          { id: `st_${Date.now()}_3`, title: 'Draft preliminary solution and verify core edge cases', completed: false },
          { id: `st_${Date.now()}_4`, title: 'Format submission document and verify requirements', completed: false }
        ],
        tips: 'Break complex assignments into discrete 45-minute milestones to beat deadline stress.'
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an academic advisor for computer science students. Given the assignment title: "${title}", subject: "${subjectName || 'Academic Course'}", description: "${description || ''}", generate a realistic breakdown of 4-6 concise subtasks with actionable steps. Output ONLY valid JSON in the form: { "subtasks": ["step 1", "step 2", ...], "tips": "short 1-sentence tip" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    const formattedSubtasks = (parsed.subtasks || []).map((t: string, idx: number) => ({
      id: `st_ai_${Date.now()}_${idx}`,
      title: t,
      completed: false
    }));

    res.json({
      subtasks: formattedSubtasks.length > 0 ? formattedSubtasks : [
        { id: `st_${Date.now()}_1`, title: 'Analyze requirements and problem specification', completed: false },
        { id: `st_${Date.now()}_2`, title: 'Draft technical solution and schema', completed: false },
        { id: `st_${Date.now()}_3`, title: 'Implementation and verification', completed: false },
        { id: `st_${Date.now()}_4`, title: 'Compile documentation and submit', completed: false }
      ],
      tips: parsed.tips || 'Stay proactive and schedule your work ahead of the deadline.'
    });
  } catch {
    res.json({
      subtasks: [
        { id: `st_${Date.now()}_1`, title: 'Analyze requirements and problem specification', completed: false },
        { id: `st_${Date.now()}_2`, title: 'Draft technical solution and schema', completed: false },
        { id: `st_${Date.now()}_3`, title: 'Implementation and verification', completed: false },
        { id: `st_${Date.now()}_4`, title: 'Compile documentation and submit', completed: false }
      ],
      tips: 'Complete high-weightage subtasks first to build momentum.'
    });
  }
});
