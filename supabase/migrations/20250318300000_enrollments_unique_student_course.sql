-- Prevent duplicate enrollments: same student cannot enroll in same course more than once
-- First remove duplicates (keep the most recent one per student+course by created_at)
DELETE FROM enrollments a
USING enrollments b
WHERE a.student_id = b.student_id
  AND a.course_id = b.course_id
  AND a.created_at < b.created_at;

-- Add unique constraint
ALTER TABLE enrollments
ADD CONSTRAINT enrollments_student_course_unique UNIQUE (student_id, course_id);
