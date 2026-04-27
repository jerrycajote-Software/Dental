-- =====================================================
-- Dental Care Plus - Phase 3 Feature Migrations
-- Run this file to add all new features
-- =====================================================

-- 1. Push Notifications: Add expo_push_token to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- 2. Notification Log Table (prevent duplicate sends)
CREATE TABLE IF NOT EXISTS notification_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  appointment_id INTEGER REFERENCES appointments(id),
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, appointment_id, notification_type)
);

-- 3. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  dentist_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  diagnosis TEXT,
  treatment_done TEXT,
  notes TEXT,
  prescriptions TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Add has_medical_record to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS has_medical_record BOOLEAN DEFAULT FALSE;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment ON medical_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_appointment ON notification_log(appointment_id);

-- =====================================================
-- Features Added:
-- 1. Push Notifications (expo_push_token, notification_log)
-- 2. Medical Records (medical_records table)
-- 3. has_medical_record flag on appointments
-- =====================================================