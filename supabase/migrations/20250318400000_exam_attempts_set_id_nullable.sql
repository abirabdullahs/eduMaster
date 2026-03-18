-- Allow set_id to be NULL for exams using client-side auto-shuffle (no exam_sets)
ALTER TABLE exam_attempts
ALTER COLUMN set_id DROP NOT NULL;
