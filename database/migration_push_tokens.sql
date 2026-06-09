

ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;


CREATE TABLE IF NOT EXISTS notification_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  appointment_id INTEGER REFERENCES appointments(id),
  notification_type TEXT NOT NULL, 
  sent_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, appointment_id, notification_type)
);

COMMENT ON COLUMN users.expo_push_token IS 'Expo Push Token for mobile push notifications';
COMMENT ON TABLE notification_log IS 'Log of sent notifications to prevent duplicate sends';