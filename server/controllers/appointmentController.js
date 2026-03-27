const db = require('../config/db');

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

// Returns booked time slots for a given doctor + date (for the slot picker UI)
const getBookedSlots = async (req, res) => {
  const { dentist_id, date } = req.query;
  if (!dentist_id || !date) {
    return res.status(400).json({ message: 'dentist_id and date are required' });
  }
  try {
    const result = await db.query(
      `SELECT appointment_time FROM appointments
       WHERE dentist_id = $1 AND appointment_date = $2
         AND status IN ('pending', 'confirmed')`,
      [dentist_id, date]
    );
    // Return as array of "HH:MM" strings
    res.json(result.rows.map(r => r.appointment_time.slice(0, 5)));
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

module.exports = { getAppointments, getBookedSlots, createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment };

