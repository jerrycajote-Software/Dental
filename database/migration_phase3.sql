

ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;


CREATE TABLE IF NOT EXISTS notification_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  appointment_id INTEGER REFERENCES appointments(id),
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, appointment_id, notification_type)
);


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


ALTER TABLE appointments ADD COLUMN IF NOT EXISTS has_medical_record BOOLEAN DEFAULT FALSE;


CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment ON medical_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_appointment ON notification_log(appointment_id);

