-- ============================================================
-- StudySync / Study Deadline Manage — Supabase Database Schema
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ============================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    teacher_name TEXT,
    color TEXT DEFAULT '#6366f1',
    description TEXT,
    credits INT DEFAULT 3,
    semester INT DEFAULT 1,
    importance TEXT DEFAULT 'medium',
    target_grade TEXT DEFAULT 'A',
    group_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'assignment',
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    group_id TEXT,
    group_name TEXT,
    created_by_id TEXT DEFAULT 'usr_student',
    created_by_name TEXT DEFAULT 'Student',
    assigned_to_ids JSONB DEFAULT '[]'::jsonb,
    due_date TEXT NOT NULL,
    due_time TEXT DEFAULT '23:59',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'not_started',
    progress INT DEFAULT 0,
    difficulty TEXT DEFAULT 'moderate',
    estimated_duration_minutes INT DEFAULT 60,
    actual_duration_minutes INT DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    subtasks JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    reminders JSONB DEFAULT '[]'::jsonb,
    recurring TEXT DEFAULT 'none',
    notify_target TEXT DEFAULT 'everyone',
    is_verified_official BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    official_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 3. Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    exam_date TEXT NOT NULL,
    exam_time TEXT,
    venue TEXT,
    difficulty TEXT DEFAULT 'moderate',
    preparation_percent INT DEFAULT 0,
    target_score NUMERIC,
    topics JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    target_value NUMERIC,
    current_value NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'hours',
    deadline TEXT,
    status TEXT DEFAULT 'active',
    linked_task_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    exam_id TEXT,
    task_id TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT,
    type TEXT NOT NULL,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Revision Topics Table
CREATE TABLE IF NOT EXISTS public.revision_topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    exam_id TEXT,
    status TEXT DEFAULT 'not_started',
    difficulty TEXT DEFAULT 'moderate',
    learned_at TEXT,
    revision1_at TEXT,
    revision2_at TEXT,
    revision3_at TEXT,
    mastered_at TEXT,
    next_revision_due TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Focus Sessions Table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'usr_student',
    task_id TEXT,
    task_title TEXT,
    subject_id TEXT,
    duration_minutes INT DEFAULT 25,
    session_type TEXT DEFAULT 'pomodoro',
    completed BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT DEFAULT 'Class Representative',
    author_role TEXT DEFAULT 'CR',
    subject_id TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TEXT,
    is_read BOOLEAN DEFAULT FALSE
);

-- 10. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    group_id TEXT,
    user_id TEXT DEFAULT 'usr_student',
    user_name TEXT DEFAULT 'Student',
    user_avatar TEXT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_title TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Daily Plans Table
CREATE TABLE IF NOT EXISTS public.daily_plans (
    date TEXT PRIMARY KEY,
    sessions JSONB DEFAULT '[]'::jsonb,
    total_study_minutes INT DEFAULT 0,
    is_reviewed BOOLEAN DEFAULT FALSE,
    reviewed_at TEXT
);

-- 12. Timetable Slots Table
CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_code TEXT,
    subject_name TEXT NOT NULL,
    room TEXT,
    professor TEXT,
    type TEXT DEFAULT 'lecture',
    color TEXT DEFAULT '#3b82f6',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Grant Public Access for quick multi-device sharing
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for seamless sync
CREATE POLICY "Public full access on subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on exams" ON public.exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on revision_topics" ON public.revision_topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on focus_sessions" ON public.focus_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on daily_plans" ON public.daily_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on timetable_slots" ON public.timetable_slots FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime publication for tables so cross-device sync happens instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.revision_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.focus_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable_slots;
