import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { loadDatabase, saveDatabase } from './database.js';
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

// Load persistent local database from disk
const db = loadDatabase();
const persist = () => saveDatabase(db);

export const app = express();

app.use(express.json({ limit: '10mb' }));

// --- Health API ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), persistence: 'disk_json' });
});

// --- Subjects API ---
app.get('/api/subjects', (req, res) => {
  res.json(db.subjects);
});

app.post('/api/subjects', (req, res) => {
  const subjectData: Subject = req.body;
  const idx = db.subjects.findIndex(s => s.id === subjectData.id);
  if (idx !== -1) {
    db.subjects[idx] = { ...db.subjects[idx], ...subjectData, updatedAt: new Date().toISOString() };
  } else {
    db.subjects.push(subjectData);
  }
  persist();
  res.json({ success: true, subject: subjectData });
});

app.put('/api/subjects/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.subjects.findIndex(s => s.id === id);
  if (idx !== -1) {
    db.subjects[idx] = { ...db.subjects[idx], ...req.body, updatedAt: new Date().toISOString() };
    persist();
    res.json({ success: true, subject: db.subjects[idx] });
  } else {
    res.status(404).json({ error: 'Subject not found' });
  }
});

app.delete('/api/subjects/:id', (req, res) => {
  const { id } = req.params;
  db.subjects = db.subjects.filter(s => s.id !== id);
  persist();
  res.json({ success: true });
});

// --- Tasks API ---
app.get('/api/tasks', (req, res) => {
  const populatedTasks = db.tasks.map(t => ({
    ...t,
    subject: db.subjects.find(s => s.id === t.subjectId)
  }));
  res.json(populatedTasks);
});

app.post('/api/tasks', (req, res) => {
  const taskData = req.body;
  const taskId = taskData.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newTask: Task = {
    ...taskData,
    id: taskId,
    createdById: taskData.createdById || 'student',
    createdByName: taskData.createdByName || 'Student',
    assignedToIds: taskData.assignedToIds || ['all'],
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
    createdAt: taskData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const existingIdx = db.tasks.findIndex(t => t.id === taskId);
  if (existingIdx !== -1) {
    db.tasks[existingIdx] = newTask;
  } else {
    db.tasks.unshift(newTask);
  }

  const newActivity: ActivityLog = {
    id: `act_${Date.now()}`,
    userId: newTask.createdById || 'student',
    userName: newTask.createdByName || 'Student',
    action: 'created task',
    targetType: 'task',
    targetId: newTask.id,
    targetTitle: newTask.title,
    timestamp: new Date().toISOString()
  };
  db.activities.unshift(newActivity);
  persist();

  res.json({ success: true, task: { ...newTask, subject: db.subjects.find(s => s.id === newTask.subjectId) } });
});

app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = db.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const prevTask = db.tasks[taskIndex];
  const updated: Task = {
    ...prevTask,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  if (updated.status === 'completed' && prevTask.status !== 'completed') {
    updated.completedAt = new Date().toISOString();
    updated.progress = 100;
  }

  db.tasks[taskIndex] = updated;
  persist();
  res.json({ success: true, task: { ...updated, subject: db.subjects.find(s => s.id === updated.subjectId) } });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.tasks = db.tasks.filter(t => t.id !== taskId);
  persist();
  res.json({ success: true });
});

// Toggle Subtask
app.post('/api/tasks/:id/subtasks/:subtaskId/toggle', (req, res) => {
  const { id, subtaskId } = req.params;
  const task = db.tasks.find(t => t.id === id);
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
  persist();
  res.json({ success: true, task: { ...task, subject: db.subjects.find(s => s.id === task.subjectId) } });
});

// Add Comment
app.post('/api/tasks/:id/comments', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const task = db.tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const newComment = {
    id: `com_${Date.now()}`,
    taskId: id,
    userId: 'student',
    userName: 'Classmate',
    content: (content || '').trim(),
    createdAt: new Date().toISOString()
  };

  task.comments = task.comments || [];
  task.comments.push(newComment);
  task.updatedAt = new Date().toISOString();
  persist();

  res.json({ success: true, comment: newComment, task });
});

// --- Announcements API ---
app.get('/api/announcements', (req, res) => {
  res.json(db.announcements);
});

app.post('/api/announcements', (req, res) => {
  const annData = req.body;
  const newAnn: ClassAnnouncement = {
    ...annData,
    id: annData.id || `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: annData.createdAt || new Date().toISOString()
  };
  const existingIdx = db.announcements.findIndex(a => a.id === newAnn.id);
  if (existingIdx !== -1) {
    db.announcements[existingIdx] = newAnn;
  } else {
    db.announcements.unshift(newAnn);
  }
  persist();
  res.json({ success: true, announcement: newAnn });
});

app.delete('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  db.announcements = db.announcements.filter(a => a.id !== id);
  persist();
  res.json({ success: true });
});

// --- Notifications API ---
app.get('/api/notifications', (req, res) => {
  res.json(db.notifications);
});

app.post('/api/notifications', (req, res) => {
  const notif: AppNotification = req.body;
  const newNotif = {
    ...notif,
    id: notif.id || `notif_${Date.now()}`,
    scheduledAt: notif.scheduledAt || new Date().toISOString(),
    sentAt: notif.sentAt || new Date().toISOString(),
    isRead: false
  };
  db.notifications.unshift(newNotif);
  persist();
  res.json({ success: true, notification: newNotif });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    notif.readAt = new Date().toISOString();
    persist();
  }
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  db.notifications.forEach(n => {
    n.isRead = true;
    n.readAt = new Date().toISOString();
  });
  persist();
  res.json({ success: true });
});

app.delete('/api/notifications/:id', (req, res) => {
  const { id } = req.params;
  db.notifications = db.notifications.filter(n => n.id !== id);
  persist();
  res.json({ success: true });
});

// --- Activity API ---
app.get('/api/activity', (req, res) => {
  res.json(db.activities.slice(0, 30));
});

// --- Focus Sessions API ---
app.get('/api/focus-sessions', (req, res) => {
  res.json(db.focusSessions);
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
  db.focusSessions.unshift(session);
  persist();
  res.json({ success: true, session });
});

// --- Timetable API ---
app.get('/api/timetable', (req, res) => {
  res.json(db.timetableSlots);
});

app.post('/api/timetable', (req, res) => {
  const slotData = req.body;
  let prof = slotData.professor;
  if (!prof && slotData.subjectId) {
    const sub = db.subjects.find(s => s.id === slotData.subjectId);
    if (sub) prof = sub.professor || sub.teacherName;
  }
  const slotId = slotData.id || `tt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newSlot: TimetableSlot = {
    ...slotData,
    id: slotId,
    professor: prof || ''
  };

  const existingIdx = db.timetableSlots.findIndex(s => s.id === slotId);
  if (existingIdx !== -1) {
    db.timetableSlots[existingIdx] = newSlot;
  } else {
    db.timetableSlots.push(newSlot);
  }
  persist();

  res.json({ success: true, slot: newSlot, slots: db.timetableSlots });
});

app.put('/api/timetable/:id', (req, res) => {
  const { id } = req.params;
  const index = db.timetableSlots.findIndex(s => s.id === id);
  if (index === -1) {
    const slotData = req.body;
    const newSlot = { ...slotData, id };
    db.timetableSlots.push(newSlot);
    persist();
    return res.json({ success: true, slot: newSlot, slots: db.timetableSlots });
  }
  const updatedSlot = { ...db.timetableSlots[index], ...req.body };
  db.timetableSlots[index] = updatedSlot;
  persist();
  res.json({ success: true, slot: updatedSlot, slots: db.timetableSlots });
});

app.delete('/api/timetable/:id', (req, res) => {
  const { id } = req.params;
  db.timetableSlots = db.timetableSlots.filter(s => s.id !== id);
  persist();
  res.json({ success: true, slots: db.timetableSlots });
});

// Bulk timetable update
app.put('/api/timetable', (req, res) => {
  if (Array.isArray(req.body)) {
    db.timetableSlots = req.body;
    persist();
  }
  res.json({ success: true, slots: db.timetableSlots });
});

// --- Exams API ---
app.get('/api/exams', (req, res) => res.json(db.exams));

app.post('/api/exams', (req, res) => {
  const exam = req.body;
  const id = exam.id || `exam_${Date.now()}`;
  const newExam: Exam = { ...exam, id, createdAt: exam.createdAt || new Date().toISOString() };
  const idx = db.exams.findIndex(e => e.id === id);
  if (idx !== -1) db.exams[idx] = newExam;
  else db.exams.push(newExam);
  persist();
  res.json({ success: true, exam: newExam });
});

app.put('/api/exams/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.exams.findIndex(e => e.id === id);
  if (idx !== -1) {
    db.exams[idx] = { ...db.exams[idx], ...req.body, updatedAt: new Date().toISOString() };
    persist();
    res.json({ success: true, exam: db.exams[idx] });
  } else {
    res.status(404).json({ error: 'Exam not found' });
  }
});

app.delete('/api/exams/:id', (req, res) => {
  db.exams = db.exams.filter(e => e.id !== req.params.id);
  persist();
  res.json({ success: true });
});

// --- Goals API ---
app.get('/api/goals', (req, res) => res.json(db.goals));

app.post('/api/goals', (req, res) => {
  const goal = req.body;
  const id = goal.id || `goal_${Date.now()}`;
  const newGoal: Goal = { ...goal, id, createdAt: goal.createdAt || new Date().toISOString() };
  const idx = db.goals.findIndex(g => g.id === id);
  if (idx !== -1) db.goals[idx] = newGoal;
  else db.goals.push(newGoal);
  persist();
  res.json({ success: true, goal: newGoal });
});

app.put('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.goals.findIndex(g => g.id === id);
  if (idx !== -1) {
    db.goals[idx] = { ...db.goals[idx], ...req.body, updatedAt: new Date().toISOString() };
    persist();
    res.json({ success: true, goal: db.goals[idx] });
  } else {
    res.status(404).json({ error: 'Goal not found' });
  }
});

app.delete('/api/goals/:id', (req, res) => {
  db.goals = db.goals.filter(g => g.id !== req.params.id);
  persist();
  res.json({ success: true });
});

// --- Notes API ---
app.get('/api/notes', (req, res) => res.json(db.notes));

app.post('/api/notes', (req, res) => {
  const note = req.body;
  const id = note.id || `note_${Date.now()}`;
  const newNote: Note = { ...note, id, createdAt: note.createdAt || new Date().toISOString() };
  const idx = db.notes.findIndex(n => n.id === id);
  if (idx !== -1) db.notes[idx] = newNote;
  else db.notes.unshift(newNote);
  persist();
  res.json({ success: true, note: newNote });
});

app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.notes.findIndex(n => n.id === id);
  if (idx !== -1) {
    db.notes[idx] = { ...db.notes[idx], ...req.body, updatedAt: new Date().toISOString() };
    persist();
    res.json({ success: true, note: db.notes[idx] });
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  db.notes = db.notes.filter(n => n.id !== req.params.id);
  persist();
  res.json({ success: true });
});

// --- Resources API ---
app.get('/api/resources', (req, res) => res.json(db.resources));

app.post('/api/resources', (req, res) => {
  const resItem = req.body;
  const id = resItem.id || `res_${Date.now()}`;
  const newRes: Resource = { ...resItem, id, createdAt: resItem.createdAt || new Date().toISOString() };
  const idx = db.resources.findIndex(r => r.id === id);
  if (idx !== -1) db.resources[idx] = newRes;
  else db.resources.unshift(newRes);
  persist();
  res.json({ success: true, resource: newRes });
});

app.put('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.resources.findIndex(r => r.id === id);
  if (idx !== -1) {
    db.resources[idx] = { ...db.resources[idx], ...req.body, updatedAt: new Date().toISOString() };
    persist();
    res.json({ success: true, resource: db.resources[idx] });
  } else {
    res.status(404).json({ error: 'Resource not found' });
  }
});

app.delete('/api/resources/:id', (req, res) => {
  db.resources = db.resources.filter(r => r.id !== req.params.id);
  persist();
  res.json({ success: true });
});

// --- Revision Topics API ---
app.get('/api/revision-topics', (req, res) => res.json(db.revisionTopics));

app.post('/api/revision-topics', (req, res) => {
  const topic = req.body;
  const id = topic.id || `rev_${Date.now()}`;
  const newTopic: RevisionTopic = { ...topic, id, createdAt: topic.createdAt || new Date().toISOString() };
  const idx = db.revisionTopics.findIndex(r => r.id === id);
  if (idx !== -1) db.revisionTopics[idx] = newTopic;
  else db.revisionTopics.unshift(newTopic);
  persist();
  res.json({ success: true, topic: newTopic });
});

app.put('/api/revision-topics/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.revisionTopics.findIndex(r => r.id === id);
  if (idx !== -1) {
    db.revisionTopics[idx] = { ...db.revisionTopics[idx], ...req.body, updatedAt: new Date().toISOString() };
    persist();
    res.json({ success: true, topic: db.revisionTopics[idx] });
  } else {
    res.status(404).json({ error: 'Topic not found' });
  }
});

app.delete('/api/revision-topics/:id', (req, res) => {
  db.revisionTopics = db.revisionTopics.filter(r => r.id !== req.params.id);
  persist();
  res.json({ success: true });
});

// --- Daily Plans API ---
app.get('/api/daily-plans', (req, res) => res.json(db.dailyPlans));

app.post('/api/daily-plans', (req, res) => {
  const plan: DailyPlan = req.body;
  const idx = db.dailyPlans.findIndex(p => p.date === plan.date);
  if (idx !== -1) db.dailyPlans[idx] = plan;
  else db.dailyPlans.unshift(plan);
  persist();
  res.json({ success: true, plan });
});

// --- AI Task Breakdown Helper ---
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
