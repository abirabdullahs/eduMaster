-- Enrollments: Allow authenticated students to insert own enrollment; admin to read all
-- Login required for enrollment; admin sees all enrollment requests

-- INSERT: Authenticated users can insert their own enrollment (student_id must match)
CREATE POLICY "Authenticated can insert own enrollment" ON enrollments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

-- SELECT: Admin can read all enrollments (for admin dashboard and enrollments page)
CREATE POLICY "Admin can read all enrollments" ON enrollments
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
