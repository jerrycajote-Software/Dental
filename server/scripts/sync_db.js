const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const queries = [
  // 1. Core user columns for Walk-in workflow
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255);`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_number VARCHAR(255);`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS home_address TEXT;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies TEXT;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS previous_dental_history TEXT;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10);`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS civil_status VARCHAR(50);`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);`,

  // 2. Authentication & Verification
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;`,

  // 3. Mobile specific (Push tokens)
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;`,

  // 4. Multi-service appointments junction table
  `CREATE TABLE IF NOT EXISTS appointment_services (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id),
    UNIQUE(appointment_id, service_id)
  );`,

  // 5. Medical Records system
  `CREATE TABLE IF NOT EXISTS medical_records (
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
  );`,
  
  `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS has_medical_record BOOLEAN DEFAULT FALSE;`,

  // 6. Web Notifications
  `CREATE TABLE IF NOT EXISTS web_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );`
];

async function sync() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully.');

    for (let i = 0; i < queries.length; i++) {
      console.log(`Executing query ${i + 1}/${queries.length}...`);
      await client.query(queries[i]);
    }

    console.log('Database synchronization complete!');
  } catch (err) {
    console.error('Error during synchronization:', err.message);
  } finally {
    await client.end();
  }
}

sync();
