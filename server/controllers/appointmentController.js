const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendWalkinVerificationEmail } = require('../utils/email');

const getAppointments = async (req, res) => {
  try {
    let query = `
      SELECT a.*, s.name as service_name, u.name as dentist_name, c.name as client_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users u ON a.dentist_id = u.id
      JOIN users c ON a.client_id = c.id
    `;
    let params = [];

    if (req.user.role === 'user') {
      query += ' WHERE a.client_id = $1';
      params.push(req.user.id);
    } else if (req.user.role === 'doctor') {
      query += ' WHERE a.dentist_id = $1';
      params.push(req.user.id);
    }

    const appointments = await db.query(query, params);
    res.json(appointments.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Returns booked time slots and their durations for a given doctor + date
// Returns booked time slots and doctor's schedule for a given doctor + date
const getBookedSlots = async (req, res) => {
  const { dentist_id, date } = req.query;
  if (!dentist_id || !date) {
    return res.status(400).json({ message: 'dentist_id and date are required' });
  }
  try {
    const dayOfWeek = new Date(date).getDay();

    // Fetch schedule for the specific doctor and day
    const scheduleRes = await db.query(
      'SELECT start_time, end_time FROM schedules WHERE dentist_id = $1 AND day_of_week = $2',
      [dentist_id, dayOfWeek]
    );

    const appointmentsRes = await db.query(
      `SELECT a.appointment_time, s.duration_minutes 
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.dentist_id = $1 AND a.appointment_date = $2
         AND a.status IN ('pending', 'confirmed', 'completed')`,
      [dentist_id, date]
    );

    res.json({
      schedule: scheduleRes.rows[0] ? {
        start: (scheduleRes.rows[0].start_time || "").toString().slice(0, 5),
        end: (scheduleRes.rows[0].end_time || "").toString().slice(0, 5)
      } : null,
      booked: appointmentsRes.rows.map(r => ({
        time: (r.appointment_time || "").toString().slice(0, 5),
        duration: r.duration_minutes
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAppointment = async (req, res) => {
  const { dentist_id, service_id, appointment_date, appointment_time, notes } = req.body;
  const client_id = req.user.id;

  try {
    // Conflict check: same doctor, same date, same time, not cancelled/completed
    const conflict = await db.query(
      `SELECT id FROM appointments
       WHERE dentist_id = $1 AND appointment_date = $2 AND appointment_time = $3
         AND status IN ('pending', 'confirmed')`,
      [dentist_id, appointment_date, appointment_time]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ message: 'This time slot is already booked for this doctor. Please choose a different time.' });
    }

    const newAppointment = await db.query(
      'INSERT INTO appointments (client_id, dentist_id, service_id, appointment_date, appointment_time, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [client_id, dentist_id, service_id, appointment_date, appointment_time, notes]
    );
    res.status(201).json(newAppointment.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await db.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { dentist_id, service_id, appointment_date, appointment_time, notes } = req.body;

  try {
    // Conflict check: exclude the current appointment itself
    const conflict = await db.query(
      `SELECT id FROM appointments
       WHERE dentist_id = $1 AND appointment_date = $2 AND appointment_time = $3
         AND status IN ('pending', 'confirmed') AND id != $4`,
      [dentist_id, appointment_date, appointment_time, id]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ message: 'This time slot is already booked for this doctor. Please choose a different time.' });
    }

    const updated = await db.query(
      'UPDATE appointments SET dentist_id = $1, service_id = $2, appointment_date = $3, appointment_time = $4, notes = $5 WHERE id = $6 RETURNING *',
      [dentist_id, service_id, appointment_date, appointment_time, notes, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.query(
      'DELETE FROM appointments WHERE id = $1 RETURNING *',
      [id]
    );
    if (deleted.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully', appointment: deleted.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const createWalkinAppointment = async (req, res) => {
  const {
    first_name, last_name, middle_name, age, date_of_birth,
    contact_number, email, home_address, allergies, previous_dental_history,
    service_id, dentist_id, appointment_date, appointment_time, notes
  } = req.body;

  try {
    // Basic validation
    if (!first_name || !last_name || !email || !service_id || !dentist_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Conflict check for appointment
    const conflict = await db.query(
      `SELECT id FROM appointments
       WHERE dentist_id = $1 AND appointment_date = $2 AND appointment_time = $3
         AND status IN ('pending', 'confirmed')`,
      [dentist_id, appointment_date, appointment_time]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ message: 'This time slot is already booked for this doctor.' });
    }

    let user_id;
    const trimmedEmail = email.trim().toLowerCase();
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);

    if (userResult.rows.length > 0) {
      // User exists
      user_id = userResult.rows[0].id;
    } else {
      // Create new user
      const tempPassword = crypto.randomBytes(6).toString('hex'); // 12 characters
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const fullName = `${first_name.trim()} ${last_name.trim()}`;

      const newUser = await db.query(
        `INSERT INTO users (
          first_name, last_name, middle_name, name, email, password, role, 
          age, date_of_birth, contact_number, home_address, allergies, previous_dental_history,
          email_verified, verification_token, verification_token_expires
        ) VALUES ($1, $2, $3, $4, $5, $6, 'user', $7, $8, $9, $10, $11, $12, FALSE, $13, $14)
        RETURNING id`,
        [
          first_name.trim(), last_name.trim(), middle_name?.trim() || null, fullName, trimmedEmail, hashedPassword,
          age || null, date_of_birth || null, contact_number?.trim() || null, home_address?.trim() || null, 
          allergies?.trim() || null, previous_dental_history?.trim() || null,
          verificationToken, tokenExpires
        ]
      );
      
      user_id = newUser.rows[0].id;

      // Send walk-in verification email with temporary password
      try {
        await sendWalkinVerificationEmail(trimmedEmail, fullName, verificationToken, tempPassword);
      } catch (emailErr) {
        console.error('Failed to send walkin verification email:', emailErr.message);
      }
    }

    // Create appointment with status 'confirmed' since the doctor made it
    const newAppointment = await db.query(
      'INSERT INTO appointments (client_id, dentist_id, service_id, appointment_date, appointment_time, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, dentist_id, service_id, appointment_date, appointment_time, notes, 'confirmed']
    );

    res.status(201).json({
      message: 'Walk-in appointment created successfully.',
      appointment: newAppointment.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAppointments, getBookedSlots, createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment, createWalkinAppointment };
