-- Add language column to free_subjects for Bangla, Hindi, Siliguri support
ALTER TABLE free_subjects ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'bangla';
