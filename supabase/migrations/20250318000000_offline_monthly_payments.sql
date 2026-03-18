-- offline_monthly_payments table (run if not exists)
CREATE TABLE IF NOT EXISTS offline_monthly_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  month_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'due' CHECK (status IN ('due', 'pending', 'paid')),
  receipt_number TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add monthly_fee to courses if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'monthly_fee'
  ) THEN
    ALTER TABLE courses ADD COLUMN monthly_fee INTEGER;
  END IF;
END $$;

-- RLS policies for offline_monthly_payments
ALTER TABLE offline_monthly_payments ENABLE ROW LEVEL SECURITY;

-- Students can read/update their own rows (for submitting receipt)
CREATE POLICY "Students can read own payments" ON offline_monthly_payments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update own payments when status is due" ON offline_monthly_payments
  FOR UPDATE USING (auth.uid() = student_id AND status = 'due')
  WITH CHECK (auth.uid() = student_id);

-- Admins can do everything (via service role or admin check)
CREATE POLICY "Admins full access" ON offline_monthly_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_offline_monthly_payments_student ON offline_monthly_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_offline_monthly_payments_status ON offline_monthly_payments(status);
CREATE INDEX IF NOT EXISTS idx_offline_monthly_payments_course ON offline_monthly_payments(course_id);
