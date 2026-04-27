-- Migration: Create medical_records table for patient dental history tracking

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

-- Index for faster patient record lookups
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment ON medical_records(appointment_id);

-- Add has_medical_record to appointments for UI indicator
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS has_medical_record BOOLEAN DEFAULT FALSE;

COMMENT ON TABLE medical_records IS 'Patient dental medical records linked to appointments';
COMMENT ON COLUMN medical_records.diagnosis IS 'Diagnosis notes from the dentist';
COMMENT ON COLUMN medical_records.treatment_done IS 'Treatments performed during the appointment';
COMMENT ON COLUMN medical_records.notes IS 'General notes about the visit';
COMMENT ON COLUMN medical_records.prescriptions IS 'Prescribed medications (if any)';
COMMENT ON COLUMN medical_records.follow_up_required IS 'Whether patient needs to come back';
COMMENT ON COLUMN medical_records.follow_up_date IS 'Suggested follow-up appointment date';