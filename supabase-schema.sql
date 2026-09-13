-- ==============================================================================
-- CRESCO CN / NETQUEST - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase Project > SQL Editor
-- (100% Idempotent: can be run repeatedly without errors)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Students & User Profiles Table
CREATE TABLE IF NOT EXISTS public.students (
    uid TEXT PRIMARY KEY,
    student_id TEXT,
    name TEXT,
    display_name TEXT,
    email TEXT,
    college TEXT DEFAULT 'KLU',
    course TEXT DEFAULT 'Computer Networks',
    academic_year TEXT DEFAULT '3rd Year',
    section TEXT DEFAULT 'CSE-A',
    role TEXT DEFAULT 'student',
    total_xp NUMERIC DEFAULT 0,
    xp NUMERIC DEFAULT 0,
    overall_progress NUMERIC DEFAULT 0,
    unit3_progress NUMERIC DEFAULT 0,
    unit4_progress NUMERIC DEFAULT 0,
    unit5_progress NUMERIC DEFAULT 0,
    lessons_completed INT DEFAULT 0,
    modules_completed INT DEFAULT 0,
    completed_units INT DEFAULT 0,
    quiz_attempts INT DEFAULT 0,
    quiz_average NUMERIC DEFAULT 0,
    practice_scores JSONB DEFAULT '{}'::jsonb,
    streak INT DEFAULT 0,
    current_unit INT DEFAULT 3,
    current_module TEXT DEFAULT 'u3_m01',
    last_lesson TEXT,
    completed_modules JSONB DEFAULT '[]'::jsonb,
    completed_steps JSONB DEFAULT '[]'::jsonb,
    unlocked_units JSONB DEFAULT '["unit_3", "unit-3"]'::jsonb,
    is_online BOOLEAN DEFAULT false,
    portal_password TEXT,
    reset_epoch TEXT DEFAULT '2026_09_RESET_SCRATCH_V1',
    course_completed_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ DEFAULT now(),
    last_logout TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for leaderboard queries and student lookup
CREATE INDEX IF NOT EXISTS idx_students_total_xp ON public.students (total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON public.students (student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students (email);

-- 3. Lesson Completions Table
CREATE TABLE IF NOT EXISTS public.lesson_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.students(uid) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    course_id TEXT DEFAULT 'cs455-comp-networks',
    completed BOOLEAN DEFAULT true,
    xp_earned INT DEFAULT 50,
    completed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_user ON public.lesson_completions(user_id);

-- 4. Live Classroom Polls Table
CREATE TABLE IF NOT EXISTS public.live_polls (
    id TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT true,
    connected_count INT DEFAULT 1,
    total_enrolled INT DEFAULT 66,
    current_question TEXT,
    explanation TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    is_answer_revealed BOOLEAN DEFAULT false,
    question_index INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial poll question if not present
INSERT INTO public.live_polls (id, is_active, connected_count, total_enrolled, current_question, explanation, options, is_answer_revealed, question_index)
VALUES (
    'current_poll',
    true,
    66,
    66,
    'Which layer of the OSI model is responsible for routing and logical addressing?',
    'Layer 3 (Network Layer) handles logical IP addressing and path determination across multi-hop router topologies.',
    '[{"id":"opt-a","label":"A","text":"Data Link Layer","votes":0,"percentage":0,"isCorrect":false},{"id":"opt-b","label":"B","text":"Transport Layer","votes":0,"percentage":0,"isCorrect":false},{"id":"opt-c","label":"C","text":"Network Layer","votes":0,"percentage":0,"isCorrect":true},{"id":"opt-d","label":"D","text":"Session Layer","votes":0,"percentage":0,"isCorrect":false}]'::jsonb,
    false,
    0
)
ON CONFLICT (id) DO NOTHING;

-- 5. Course Management & Section Settings Table
CREATE TABLE IF NOT EXISTS public.course_sections (
    id TEXT PRIMARY KEY,
    published_status JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.course_sections (id, published_status)
VALUES (
    'sections',
    '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true,"8":true,"9":true,"10":true,"11":true,"12":true,"13":true,"14":true,"15":true,"16":true,"17":true,"18":true,"19":true,"20":true,"21":true,"22":true,"23":true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;

-- 7. Permissive Policies for Educational Cohort Access
-- Drop existing policies first so re-running never throws "already exists" error
DROP POLICY IF EXISTS "Allow public read students" ON public.students;
CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow student write" ON public.students;
CREATE POLICY "Allow student write" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read lesson completions" ON public.lesson_completions;
CREATE POLICY "Allow public read lesson completions" ON public.lesson_completions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow student insert/update lesson completions" ON public.lesson_completions;
CREATE POLICY "Allow student insert/update lesson completions" ON public.lesson_completions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read live polls" ON public.live_polls;
CREATE POLICY "Allow public read live polls" ON public.live_polls FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update live polls" ON public.live_polls;
CREATE POLICY "Allow update live polls" ON public.live_polls FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read course sections" ON public.course_sections;
CREATE POLICY "Allow public read course sections" ON public.course_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update course sections" ON public.course_sections;
CREATE POLICY "Allow update course sections" ON public.course_sections FOR ALL USING (true) WITH CHECK (true);

-- 8. Enable Realtime Publications for Live Sync (safely handled if already added)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_completions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.live_polls;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.course_sections;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
