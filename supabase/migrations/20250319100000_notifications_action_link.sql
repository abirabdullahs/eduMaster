-- Add action_link for notification targeting (notice vs notification)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_link TEXT;
