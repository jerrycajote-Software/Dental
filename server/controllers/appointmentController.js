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

    if (req.user.role === 'client') {
      query += ' WHERE a.client_id = $1';
      params.push(req.user.id);
    } else if (req.user.role === 'dentist') {
      query += ' WHERE a.dentist_id = $1';
      params.push(req.user.id);
    }

    const appointments = await db.query(query, params);
    res.json(appointments.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAppointment = async (req, res) => {
  const { dentist_id, service_id, appointment_date, appointment_time, notes } = req.body;
  const client_id = req.user.id;

  try {
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

module.exports = { getAppointments, createAppointment, updateAppointmentStatus, deleteAppointment };
