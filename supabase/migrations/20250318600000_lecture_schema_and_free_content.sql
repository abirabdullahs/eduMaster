-- PART A1: Lecture schema changes
-- Remove content_html, add content_markdown, tags, mcq_count
-- Add lecture_id to questions for lecture MCQs (if missing)

ALTER TABLE questions ADD COLUMN IF NOT EXISTS lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE;

-- Add new columns first
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS content_markdown TEXT;
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS mcq_count INTEGER DEFAULT 0;

-- Migrate existing content_html to content_markdown if column exists (store as-is, user can convert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lectures' AND column_name = 'content_html') THEN
    UPDATE lectures SET content_markdown = content_html WHERE content_markdown IS NULL AND content_html IS NOT NULL;
    ALTER TABLE lectures DROP COLUMN IF EXISTS content_html;
  END IF;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- Update mcq_count from questions table (trigger or manual refresh)
CREATE OR REPLACE FUNCTION update_lecture_mcq_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.lecture_id IS NOT NULL THEN
    UPDATE lectures SET mcq_count = (
      SELECT COUNT(*) FROM questions WHERE lecture_id = NEW.lecture_id
    ) WHERE id = NEW.lecture_id;
  ELSIF TG_OP = 'DELETE' AND OLD.lecture_id IS NOT NULL THEN
    UPDATE lectures SET mcq_count = (
      SELECT COUNT(*) FROM questions WHERE lecture_id = OLD.lecture_id
    ) WHERE id = OLD.lecture_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_lecture_mcq_count ON questions;
CREATE TRIGGER trg_update_lecture_mcq_count
AFTER INSERT OR DELETE ON questions
FOR EACH ROW EXECUTE FUNCTION update_lecture_mcq_count();

-- One-time sync existing counts
UPDATE lectures SET mcq_count = (SELECT COUNT(*) FROM questions WHERE questions.lecture_id = lectures.id);

-- PART A2: Lecture progress gate columns
ALTER TABLE lecture_progress ADD COLUMN IF NOT EXISTS mcq_score INTEGER;
ALTER TABLE lecture_progress ADD COLUMN IF NOT EXISTS mcq_total INTEGER;
ALTER TABLE lecture_progress ADD COLUMN IF NOT EXISTS mcq_passed BOOLEAN DEFAULT FALSE;
ALTER TABLE lecture_progress ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMPTZ;

-- Unique constraint for upsert (required for ON CONFLICT)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lecture_progress_student_lecture ON lecture_progress(student_id, lecture_id);

-- PART B1: Free content tables
CREATE TABLE IF NOT EXISTS free_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS free_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES free_classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  language TEXT DEFAULT 'bangla',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add language column if table already exists
ALTER TABLE free_subjects ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'bangla';

CREATE TABLE IF NOT EXISTS free_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES free_subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS free_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES free_chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE free_content_type AS ENUM (
  'markdown', 'mcq', 'short_answer', 'video', 'flashcard', 'true_false',
  'fill_blank', 'latex_formula', 'image_diagram', 'key_points',
  'match_following', 'code_snippet', 'mnemonic'
);

CREATE TABLE IF NOT EXISTS free_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES free_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type free_content_type NOT NULL,
  content_data JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE free_progress_status AS ENUM ('locked', 'unlocked', 'completed');

CREATE TABLE IF NOT EXISTS free_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES free_contents(id) ON DELETE CASCADE,
  status free_progress_status NOT NULL DEFAULT 'locked',
  answer_given TEXT,
  is_correct BOOLEAN,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_free_content_progress_user_content ON free_content_progress(user_id, content_id);

-- RLS for free content tables
ALTER TABLE free_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_content_progress ENABLE ROW LEVEL SECURITY;

-- free_contents: public read for is_free_preview, authenticated read all, admin/teacher write
CREATE POLICY "Public can read free preview contents" ON free_contents FOR SELECT
USING (is_free_preview = true);

CREATE POLICY "Authenticated can read all free contents" ON free_contents FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admin and teacher can manage free contents" ON free_contents
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- free_content_progress: user read/write own
CREATE POLICY "Users can read own free progress" ON free_content_progress FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own free progress" ON free_content_progress FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own free progress" ON free_content_progress FOR UPDATE
USING (user_id = auth.uid());

-- free_classes, free_subjects, free_chapters, free_topics: public read, admin/teacher write
CREATE POLICY "Public can read free classes" ON free_classes FOR SELECT USING (true);
CREATE POLICY "Admin teacher can manage free classes" ON free_classes FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

CREATE POLICY "Public can read free subjects" ON free_subjects FOR SELECT USING (true);
CREATE POLICY "Admin teacher can manage free subjects" ON free_subjects FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

CREATE POLICY "Public can read free chapters" ON free_chapters FOR SELECT USING (true);
CREATE POLICY "Admin teacher can manage free chapters" ON free_chapters FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

CREATE POLICY "Public can read free topics" ON free_topics FOR SELECT USING (true);
CREATE POLICY "Admin teacher can manage free topics" ON free_topics FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

-- Insert default free classes
INSERT INTO free_classes (name, order_index)
SELECT 'SSC', 0 WHERE NOT EXISTS (SELECT 1 FROM free_classes WHERE name = 'SSC');
INSERT INTO free_classes (name, order_index)
SELECT 'HSC', 1 WHERE NOT EXISTS (SELECT 1 FROM free_classes WHERE name = 'HSC');

-- Trigger: auto-set is_free_preview=true for first 3 contents per topic
CREATE OR REPLACE FUNCTION set_free_preview_for_first_contents()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_index < 3 THEN
    NEW.is_free_preview := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_set_free_preview ON free_contents;
CREATE TRIGGER trg_set_free_preview
BEFORE INSERT ON free_contents
FOR EACH ROW EXECUTE FUNCTION set_free_preview_for_first_contents();
