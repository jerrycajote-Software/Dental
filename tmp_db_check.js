const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/Jerry Cajote/Documents/Vcode/Dental/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDB() {
  try {
    const schedules = await pool.query('SELECT * FROM schedules');
    console.log('--- SCHEDULES ---');
    console.log(JSON.stringify(schedules.rows, null, 2));

    const appointments = await pool.query('SELECT id, dentist_id, appointment_date, appointment_time, status FROM appointments');
    console.log('\n--- APPOINTMENTS ---');
    console.log(JSON.stringify(appointments.rows, null, 2));

    const users = await pool.query("SELECT id, name, role FROM users WHERE role = 'doctor'");
    console.log('\n--- DOCTORS ---');
    console.log(JSON.stringify(users.rows, null, 2));

    pool.end();
  } catch (err) {
    console.error('Error checking DB:', err.message);
    process.exit(1);
  }
}

checkDB();
