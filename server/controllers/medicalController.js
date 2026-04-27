const db = require('../config/db');

const getMedicalRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'user') {
      query = `
        SELECT mr.*, 
               a.appointment_date, a.appointment_time, a.status AS appointment_status,
               d.name AS dentist_name, s.name AS service_name
        FROM medical_records mr
        JOIN appointments a ON mr.appointment_id = a.id
        JOIN users d ON mr.dentist_id = d.id
        JOIN services s ON a.service_id = s.id
        WHERE mr.patient_id = $1
        ORDER BY mr.created_at DESC
      `;
      params = [userId];
    } else if (userRole === 'doctor') {
      query = `
        SELECT mr.*, 
               a.appointment_date, a.appointment_time, a.status AS appointment_status,
               u.name AS patient_name, s.name AS service_name
        FROM medical_records mr
        JOIN appointments a ON mr.appointment_id = a.id
        JOIN users u ON mr.patient_id = u.id
        JOIN services s ON a.service_id = s.id
        WHERE mr.dentist_id = $1
        ORDER BY mr.created_at DESC
      `;
      params = [userId];
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'user') {
      query = `
        SELECT mr.*, 
               a.appointment_date, a.appointment_time, a.status AS appointment_status,
               d.name AS dentist_name, s.name AS service_name
        FROM medical_records mr
        JOIN appointments a ON mr.appointment_id = a.id
        JOIN users d ON mr.dentist_id = d.id
        JOIN services s ON a.service_id = s.id
        WHERE mr.id = $1 AND mr.patient_id = $2
      `;
      params = [id, userId];
    } else if (userRole === 'doctor') {
      query = `
        SELECT mr.*, 
               a.appointment_date, a.appointment_time, a.status AS appointment_status,
               u.name AS patient_name, s.name AS service_name
        FROM medical_records mr
        JOIN appointments a ON mr.appointment_id = a.id
        JOIN users u ON mr.patient_id = u.id
        JOIN services s ON a.service_id = s.id
        WHERE mr.id = $1 AND mr.dentist_id = $2
      `;
      params = [id, userId];
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createMedicalRecord = async (req, res) => {
  try {
    const { appointment_id, diagnosis, treatment_done, notes, prescriptions, follow_up_required, follow_up_date } = req.body;
    const dentistId = req.user.id;

    if (!appointment_id) {
      return res.status(400).json({ message: 'appointment_id is required' });
    }

    const appointmentResult = await db.query(
      'SELECT client_id, dentist_id, has_medical_record FROM appointments WHERE id = $1',
      [appointment_id]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const apt = appointmentResult.rows[0];

    if (apt.dentist_id !== dentistId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only create records for your own appointments' });
    }

    if (apt.has_medical_record) {
      return res.status(400).json({ message: 'Medical record already exists for this appointment' });
    }

    const result = await db.query(
      `INSERT INTO medical_records 
        (appointment_id, patient_id, dentist_id, diagnosis, treatment_done, notes, prescriptions, follow_up_required, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        appointment_id,
        apt.client_id,
        dentistId,
        diagnosis || null,
        treatment_done || null,
        notes || null,
        prescriptions || null,
        follow_up_required || false,
        follow_up_date || null,
      ]
    );

    await db.query(
      'UPDATE appointments SET has_medical_record = TRUE WHERE id = $1',
      [appointment_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, treatment_done, notes, prescriptions, follow_up_required, follow_up_date } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'doctor') {
      query = `
        UPDATE medical_records 
        SET diagnosis = COALESCE($1, diagnosis),
            treatment_done = COALESCE($2, treatment_done),
            notes = COALESCE($3, notes),
            prescriptions = COALESCE($4, prescriptions),
            follow_up_required = COALESCE($5, follow_up_required),
            follow_up_date = COALESCE($6, follow_up_date),
            updated_at = NOW()
        WHERE id = $7 AND dentist_id = $8
        RETURNING *
      `;
      params = [diagnosis, treatment_done, notes, prescriptions, follow_up_required, follow_up_date, id, userId];
    } else {
      return res.status(403).json({ message: 'Only doctors can update medical records' });
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found or access denied' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
};