-- Teacher profile extensions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_subject TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_university TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expertise_json JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_time TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Course marketing / landing content (separate from subject/chapter curriculum tree)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS details_markdown TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS curriculum_topics JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS faq_json JSONB NOT NULL DEFAULT '[]'::jsonb;
