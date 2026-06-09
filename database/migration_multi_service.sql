
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS civil_status VARCHAR(50);


CREATE TABLE IF NOT EXISTS appointment_services (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id),
  UNIQUE(appointment_id, service_id)
);
