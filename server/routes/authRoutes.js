const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification, createDoctor, getDoctors, deleteDoctor, getPatients, deletePatient, deleteSelf, forgotPassword, resetPassword, updatePassword, resetToTempPassword, updateAvailability, getUnavailableDates, addUnavailableDate, deleteUnavailableDate, getMe, manualVerifyUser, getPatientDetails } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/update-password', authMiddleware, updatePassword);

// Own profile (any authenticated user)
router.get('/me', authMiddleware, getMe);

// Admin-only user verification/management
router.patch('/verify-user/:id', authMiddleware, adminMiddleware, manualVerifyUser);
router.patch('/reset-temp-password/:id', authMiddleware, adminMiddleware, resetToTempPassword);

// Admin-only doctor management routes
router.post('/doctors', authMiddleware, adminMiddleware, createDoctor);
router.get('/doctors', authMiddleware, adminMiddleware, getDoctors);
router.delete('/doctors/:id', authMiddleware, adminMiddleware, deleteDoctor);

// Patient management routes
router.get('/patients', authMiddleware, getPatients);
router.get('/patients/:id', authMiddleware, getPatientDetails);
router.delete('/patients/:id', authMiddleware, adminMiddleware, deletePatient);

// Account management
router.post('/delete-account', authMiddleware, deleteSelf);

// Doctor availability management (doctor-only)
router.patch('/availability', authMiddleware, updateAvailability);
router.get('/unavailable-dates', authMiddleware, getUnavailableDates);
router.post('/unavailable-dates', authMiddleware, addUnavailableDate);
router.delete('/unavailable-dates/:id', authMiddleware, deleteUnavailableDate);

// Temporary production sync route (to be deleted after use)
router.get('/sync-db-prod', (req, res) => {
  const db = require('../config/db');
  const queries = [
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
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;`,
    `CREATE TABLE IF NOT EXISTS appointment_services (
      id SERIAL PRIMARY KEY,
      appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id),
      UNIQUE(appointment_id, service_id)
    );`,
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

  async function runQueries() {
    let results = [];
    for (const q of queries) {
      try {
        await db.query(q);
        results.push({ query: q.slice(0, 50) + '...', status: 'OK' });
      } catch (err) {
        results.push({ query: q.slice(0, 50) + '...', status: 'Error', error: err.message });
      }
    }
    res.json(results);
  }

  runQueries();
});

module.exports = router;


