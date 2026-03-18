-- Add suggestion_pdf_url to chapters if missing (form was using pdf_url which doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chapters' AND column_name = 'suggestion_pdf_url'
  ) THEN
    ALTER TABLE chapters ADD COLUMN suggestion_pdf_url TEXT;
  END IF;
END $$;

-- Enable RLS on enrollments if not already
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- RLS: Allow teachers to read enrollments for their own courses
DROP POLICY IF EXISTS "Teachers can read enrollments for their courses" ON enrollments;
CREATE POLICY "Teachers can read enrollments for their courses"
ON enrollments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.teacher_id = auth.uid()
  )
);

-- RLS: Allow anyone to read enrollment count for published courses (for public course page)
DROP POLICY IF EXISTS "Public can read enrollments for published courses" ON enrollments;
CREATE POLICY "Public can read enrollments for published courses"
ON enrollments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.status = 'published'
  )
);
