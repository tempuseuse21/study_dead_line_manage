-- ============================================================
-- Dhirubhai Ambani University - MSc IT Shared Deadline Portal
-- Supabase Database Schema & Initial Data Seed Script
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Subjects Table
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

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
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
    difficulty TEXT,
    estimated_duration_minutes INT,
    actual_duration_minutes INT,
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

-- 4. Timetable Slots Table
CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL, -- Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    start_time TEXT NOT NULL, -- e.g. "09:00"
    end_time TEXT NOT NULL, -- e.g. "10:30"
    subject_id TEXT,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    room TEXT DEFAULT '',
    professor TEXT DEFAULT '',
    type TEXT DEFAULT 'lecture', -- lecture, lab, tutorial
    color TEXT DEFAULT '#3b82f6',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT DEFAULT 'Class Representative',
    author_role TEXT DEFAULT 'CR',
    subject_id TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal', -- normal, urgent, broadcast
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT FALSE
);

-- 6. Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY,
    subject_id TEXT,
    title TEXT NOT NULL,
    exam_date TEXT NOT NULL,
    exam_time TEXT,
    venue TEXT,
    difficulty TEXT DEFAULT 'medium',
    preparation_percent INT DEFAULT 0,
    target_score TEXT,
    topics JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject_id TEXT,
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    unit TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'active',
    linked_task_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    subject_id TEXT,
    exam_id TEXT,
    task_id TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'link',
    subject_id TEXT,
    topic TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Revision Topics Table
CREATE TABLE IF NOT EXISTS public.revision_topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_id TEXT,
    exam_id TEXT,
    status TEXT DEFAULT 'not_started',
    difficulty TEXT DEFAULT 'medium',
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

-- 11. Daily Plans Table
CREATE TABLE IF NOT EXISTS public.daily_plans (
    date TEXT PRIMARY KEY, -- YYYY-MM-DD
    sessions JSONB DEFAULT '[]'::jsonb,
    total_study_minutes INT DEFAULT 0,
    is_reviewed BOOLEAN DEFAULT FALSE,
    reviewed_at TEXT
);

-- 12. Focus Sessions Table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'usr_student',
    task_id TEXT,
    task_title TEXT,
    subject_id TEXT,
    duration_minutes INT NOT NULL,
    session_type TEXT DEFAULT 'pomodoro',
    completed BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Authorized Students Table (125 MSc IT Students Roster)
CREATE TABLE IF NOT EXISTS public.authorized_students (
    student_id TEXT PRIMARY KEY, -- e.g. "202612045" or "24MSCIT001"
    full_name TEXT NOT NULL,
    registration_code TEXT DEFAULT 'MSCIT2026',
    is_registered BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) or add permissive public policies for seamless access via Anon Key
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_students DISABLE ROW LEVEL SECURITY;

-- Realtime publication setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.revision_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.focus_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.authorized_students;

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================

-- Insert Core Subjects
INSERT INTO public.subjects (id, name, code, teacher_name, color, description, credits, semester) VALUES
('sub_adv_algo', 'Advanced Algorithms & Data Structures', 'IT601', 'Prof. Rajesh Kumar', '#6366f1', 'Complexity analysis, graph algorithms, dynamic programming', 4, 1),
('sub_cloud_devops', 'Cloud Computing & DevOps', 'IT602', 'Dr. Sunita Sharma', '#06b6d4', 'AWS, Docker, Kubernetes, CI/CD pipelines', 4, 1),
('sub_fullstack', 'Full Stack Web Engineering', 'IT603', 'Prof. Amit Patel', '#10b981', 'React, Next.js, Node.js, GraphQL, PostgreSQL', 4, 1),
('sub_ml_ai', 'Machine Learning & AI Applications', 'IT604', 'Dr. Meera Joshi', '#f59e0b', 'Supervised learning, neural networks, PyTorch', 4, 1),
('sub_info_sec', 'Information Security & Cryptography', 'IT605', 'Prof. Vikram Shah', '#ec4899', 'Encryption protocols, network security, ethical hacking', 3, 1),
('sub_seng_proj', 'Software Engineering & Project Management', 'IT606', 'Dr. Ananya Desai', '#8b5cf6', 'Agile methodologies, system design, software architecture', 3, 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Initial Timetable Slots
INSERT INTO public.timetable_slots (id, day, start_time, end_time, subject_id, subject_code, subject_name, room, professor, type, color) VALUES
('slot_mon_1', 'Monday', '09:00', '10:30', 'sub_adv_algo', 'IT601', 'Advanced Algorithms & Data Structures', 'Lab 301', 'Prof. Rajesh Kumar', 'lecture', '#6366f1'),
('slot_mon_2', 'Monday', '10:45', '12:15', 'sub_cloud_devops', 'IT602', 'Cloud Computing & DevOps', 'LH-02', 'Dr. Sunita Sharma', 'lecture', '#06b6d4'),
('slot_tue_1', 'Tuesday', '09:00', '10:30', 'sub_fullstack', 'IT603', 'Full Stack Web Engineering', 'Lab 304', 'Prof. Amit Patel', 'lab', '#10b981'),
('slot_tue_2', 'Tuesday', '11:00', '12:30', 'sub_ml_ai', 'IT604', 'Machine Learning & AI Applications', 'LH-01', 'Dr. Meera Joshi', 'lecture', '#f59e0b'),
('slot_wed_1', 'Wednesday', '09:00', '10:30', 'sub_info_sec', 'IT605', 'Information Security & Cryptography', 'LH-03', 'Prof. Vikram Shah', 'lecture', '#ec4899'),
('slot_wed_2', 'Wednesday', '11:00', '12:30', 'sub_seng_proj', 'IT606', 'Software Engineering & Project Management', 'LH-02', 'Dr. Ananya Desai', 'lecture', '#8b5cf6'),
('slot_thu_1', 'Thursday', '09:00', '10:30', 'sub_adv_algo', 'IT601', 'Advanced Algorithms & Data Structures', 'Lab 301', 'Prof. Rajesh Kumar', 'lab', '#6366f1'),
('slot_thu_2', 'Thursday', '11:00', '12:30', 'sub_cloud_devops', 'IT602', 'Cloud Computing & DevOps', 'LH-02', 'Dr. Sunita Sharma', 'lecture', '#06b6d4'),
('slot_fri_1', 'Friday', '09:00', '11:00', 'sub_fullstack', 'IT603', 'Full Stack Web Engineering', 'Lab 304', 'Prof. Amit Patel', 'lab', '#10b981'),
('slot_fri_2', 'Friday', '11:30', '13:00', 'sub_ml_ai', 'IT604', 'Machine Learning & AI Applications', 'LH-01', 'Dr. Meera Joshi', 'lecture', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- Core subjects and timetable slots are ready for MSc IT batch. Tasks and Announcements start clean from scratch.
