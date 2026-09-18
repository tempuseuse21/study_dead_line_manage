import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_ACTIVITY,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_PREFERENCES,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS
} from './src/lib/initialData.ts';
import { ActivityLog, AppNotification, Subject, Task, FocusSession, ClassAnnouncement } from './src/types.ts';

// In-Memory Database Store with exact 5 subjects
let subjects: Subject[] = JSON.parse(JSON.stringify(INITIAL_SUBJECTS));
let tasks: Task[] = JSON.parse(JSON.stringify(INITIAL_TASKS));
let notifications: AppNotification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
let activities: ActivityLog[] = JSON.parse(JSON.stringify(INITIAL_ACTIVITY));
let announcements: ClassAnnouncement[] = JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS));
let focusSessions: FocusSession[] = [];
let notificationPreferences = { ...INITIAL_NOTIFICATION_PREFERENCES };

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // --- Vite Dev / Production Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudySync Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
