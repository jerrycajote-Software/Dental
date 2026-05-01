-- Migration: Create web_notifications table for in-app web notifications
CREATE TABLE IF NOT EXISTS web_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups per user
CREATE INDEX IF NOT EXISTS idx_web_notifications_user ON web_notifications(user_id);
