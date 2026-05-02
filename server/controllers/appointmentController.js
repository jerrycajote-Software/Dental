const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendWalkinVerificationEmail, sendDoctorAppointmentNotification } = require('../utils/email');
const { sendStatusUpdateNotification, sendAppointmentReminder, createWebNotification } = require('./notificationController');

const getAppointments = async (req, res) => {
  try {
    // COALESCE: if junction table has entries for this appointment, show all service names;
    // otherwise fall back to the single service_id join (backward compat with old records).
    let query = `
      SELECT a.*,
        COALESCE(
          (SELECT STRING_AGG(sv.name, ', ' ORDER BY sv.name)
           FROM appointment_services aps
           JOIN services sv ON sv.id = aps.service_id
           WHERE aps.appointment_id = a.id),
          s.name
        ) AS service_name,
        u.name AS dentist_name,
        c.name AS client_name
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

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const appointments = await db.query(query, params);
    res.json(appointments.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Returns booked time slots and doctor's schedule for a given doctor + date
const getBookedSlots = async (req, res) => {
  const { dentist_id, date } = req.query;
  if (!dentist_id || !date) {
    return res.status(400).json({ message: 'dentist_id and date are required' });
  }
  try {
    const dayOfWeek = new Date(date).getDay();

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
      schedule: scheduleRes.rows[0]
        ? {
            start: (scheduleRes.rows[0].start_time || '').toString().slice(0, 5),
            end: (scheduleRes.rows[0].end_time || '').toString().slice(0, 5),
          }
        : null,
      booked: appointmentsRes.rows.map(r => ({
        time: (r.appointment_time || '').toString().slice(0, 5),
        duration: r.duration_minutes,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAppointment = async (req, res) => {
  const { dentist_id, service_id, appointment_date, appointment_time, notes } = req.body;
  const client_id = req.user.id;

  try {
    // Past date/time validation
    const apptDateTime = new Date(`${appointment_date}T${appointment_time}`);
    if (apptDateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past. Please select a future date and time.' });
    }

    // Conflict check
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

    // Fetch details for notifications
    let doctor_name = 'Doctor';
    try {
      // Fetch doctor, patient, and service details for the email
      const detailsQuery = `
        SELECT 
          d.name as doctor_name, d.email as doctor_email,
          p.name as patient_name,
          s.name as service_name
        FROM users d
        JOIN users p ON p.id = $2
        JOIN services s ON s.id = $3
        WHERE d.id = $1
      `;
      const details = await db.query(detailsQuery, [dentist_id, client_id, service_id]);
      
      if (details.rows.length > 0) {
        const { doctor_email, patient_name, service_name } = details.rows[0];
        doctor_name = details.rows[0].doctor_name;
        
        await sendDoctorAppointmentNotification(doctor_email, doctor_name, {
          patientName: patient_name,
          date: appointment_date,
          time: appointment_time,
          services: service_name,
          notes: notes
        });
      }
    } catch (emailErr) {
      console.error('Failed to send doctor notification email:', emailErr.message);
    }

    // Add Web Notification for Patient
    try {
      const aptDate = new Date(appointment_date).toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
      });
      await createWebNotification(
        client_id,
        newAppointment.rows[0].id,
        'Appointment Booked 📅',
        `You have successfully booked an appointment for ${aptDate} at ${appointment_time} with Dr. ${doctor_name}.`
      );
    } catch (webNotifErr) {
      console.error('Failed to create web notification:', webNotifErr.message);
    }

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

    if (['confirmed', 'cancelled', 'completed'].includes(status)) {
      sendStatusUpdateNotification(id, status).catch(err => 
        console.error('[Notification] Error sending status update:', err.message)
      );

      // Add Web Notification
      const title = {
        confirmed: 'Appointment Confirmed ✅',
        cancelled: 'Appointment Cancelled ❌',
        completed: 'Appointment Completed ✅',
      };
      const msg = {
        confirmed: 'Your appointment has been confirmed by the clinic.',
        cancelled: 'Your appointment has been cancelled.',
        completed: 'Your appointment is now marked as complete.',
      };
      
      if (title[status]) {
        createWebNotification(updated.rows[0].client_id, id, title[status], msg[status]);
      }
    }

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { dentist_id, service_id, appointment_date, appointment_time, notes } = req.body;

  try {
    // Past date/time validation
    const apptDateTime = new Date(`${appointment_date}T${appointment_time}`);
    if (apptDateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot reschedule to a past date/time.' });
    }

    // Conflict check (exclude self)
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

    // Send email notification to doctor for rescheduling
    try {
      const detailsQuery = `
        SELECT 
          d.name as doctor_name, d.email as doctor_email,
          p.name as patient_name,
          s.name as service_name
        FROM users d
        JOIN appointments a ON a.dentist_id = d.id
        JOIN users p ON p.id = a.client_id
        JOIN services s ON s.id = $2
        WHERE a.id = $1
      `;
      const details = await db.query(detailsQuery, [id, service_id]);
      
      if (details.rows.length > 0) {
        const { doctor_name, doctor_email, patient_name, service_name } = details.rows[0];
        
        await sendDoctorAppointmentNotification(doctor_email, doctor_name, {
          patientName: patient_name,
          date: appointment_date,
          time: appointment_time,
          services: service_name,
          notes: notes + ' (RESCHEDULED)'
        });
      }
    } catch (emailErr) {
      console.error('Failed to send doctor notification email for update:', emailErr.message);
    }

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
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
    blood_type, civil_status,
    service_ids,   // array of service IDs (new multi-service)
    dentist_id, appointment_date, appointment_time, notes,
  } = req.body;

  try {
    // ── Validation ──────────────────────────────────────────────────────────
    const missingFields = [];
    if (!first_name) missingFields.push('First Name');
    if (!last_name)  missingFields.push('Last Name');
    if (!email)      missingFields.push('Email');
    if (!dentist_id) missingFields.push('Dentist');
    if (!appointment_date) missingFields.push('Appointment Date');
    if (!appointment_time) missingFields.push('Appointment Time');

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Normalize dentist_id to number
    const dentistIdNum = Number(dentist_id);
    if (!dentistIdNum) {
      return res.status(400).json({ message: 'Invalid dentist selected.' });
    }

    const ids = Array.isArray(service_ids) ? service_ids : [];
    if (ids.length === 0) {
      return res.status(400).json({ message: 'At least one service must be selected.' });
    }

    // Past date/time guard
    const apptDateTime = new Date(`${appointment_date}T${appointment_time}`);
    if (apptDateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past.' });
    }

    // Use first selected service as primary (backward compat with appointments.service_id FK)
    const primaryServiceId = ids[0];

    // Conflict check
    const conflict = await db.query(
      `SELECT id FROM appointments
       WHERE dentist_id = $1 AND appointment_date = $2 AND appointment_time = $3
         AND status IN ('pending', 'confirmed')`,
      [dentistIdNum, appointment_date, appointment_time]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ message: 'This time slot is already booked for this doctor.' });
    }

    // ── Upsert patient user ──────────────────────────────────────────────────
    let user_id;
    const trimmedEmail = email.trim().toLowerCase();
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);

    let tempPassword = null;
    if (userResult.rows.length > 0) {
      user_id = userResult.rows[0].id;
      // Update existing user with latest info from the form
      await db.query(
        `UPDATE users SET 
          age = COALESCE($1, age), 
          date_of_birth = COALESCE($2, date_of_birth), 
          contact_number = COALESCE($3, contact_number), 
          home_address = COALESCE($4, home_address), 
          allergies = $5, 
          previous_dental_history = $6, 
          blood_type = COALESCE($7, blood_type), 
          civil_status = COALESCE($8, civil_status)
         WHERE id = $9`,
        [
          age || null, 
          date_of_birth || null,
          contact_number?.trim() || null,
          home_address?.trim() || null,
          allergies?.trim() || null,
          previous_dental_history?.trim() || null,
          blood_type || null,
          civil_status || null,
          user_id
        ]
      );
    } else {
      // ── Generate deterministic temp password ──────────────────────────────
      // Format: first 2 letters of first name + first 2 letters of last name + birth year
      // e.g. "Cedric Torres" born 2003 → "CeTo2003"
      const fn = first_name.trim();
      const ln = last_name.trim();
      const birthYear = date_of_birth ? String(date_of_birth).slice(0, 4) : '0000';
      tempPassword =
        (fn.slice(0, 1).toUpperCase() + fn.slice(1, 2).toLowerCase()) +
        (ln.slice(0, 1).toUpperCase() + ln.slice(1, 2).toLowerCase()) +
        birthYear;

      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const fullName = `${fn} ${ln}`;


      const newUser = await db.query(
        `INSERT INTO users (
          first_name, last_name, middle_name, name, email, password, role,
          age, date_of_birth, contact_number, home_address, allergies, previous_dental_history,
          blood_type, civil_status,
          email_verified, verification_token, verification_token_expires
        ) VALUES ($1, $2, $3, $4, $5, $6, 'user', $7, $8, $9, $10, $11, $12, $13, $14, FALSE, $15, $16)
        RETURNING id`,
        [
          first_name.trim(), last_name.trim(), middle_name?.trim() || null,
          fullName, trimmedEmail, hashedPassword,
          age || null, date_of_birth || null,
          contact_number?.trim() || null, home_address?.trim() || null,
          allergies?.trim() || null, previous_dental_history?.trim() || null,
          blood_type || null, civil_status || null,
          verificationToken, tokenExpires,
        ]
      );

      user_id = newUser.rows[0].id;

      try {
        await sendWalkinVerificationEmail(trimmedEmail, fullName, verificationToken, tempPassword);
      } catch (emailErr) {
        console.error('Failed to send walkin verification email:', emailErr.message);
      }
    }

    // ── Create appointment (status = confirmed since doctor is booking) ──────
    const newAppointment = await db.query(
      `INSERT INTO appointments
         (client_id, dentist_id, service_id, appointment_date, appointment_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
       RETURNING *`,
      [user_id, dentistIdNum, primaryServiceId, appointment_date, appointment_time, notes]
    );

    const appointmentId = newAppointment.rows[0].id;

    // ── Insert all selected services into the junction table ─────────────────
    for (const svcId of ids) {
      await db.query(
        'INSERT INTO appointment_services (appointment_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [appointmentId, svcId]
      );
    }

    res.status(201).json({
      message: 'Walk-in appointment created successfully.',
      appointment: newAppointment.rows[0],
      tempPassword: tempPassword, // Return the password so the staff can tell the patient
      email: trimmedEmail
    });

    // Fetch details for notifications
    let doctor_name = 'Doctor';
    try {
      // Fetch doctor, patient, and services details for the email
      const detailsQuery = `
        SELECT 
          d.name as doctor_name, d.email as doctor_email,
          p.name as patient_name,
          (SELECT STRING_AGG(s.name, ', ') 
           FROM services s 
           WHERE s.id = ANY($3::int[])) as service_names
        FROM users d
        JOIN users p ON p.id = $2
        WHERE d.id = $1
      `;
      const details = await db.query(detailsQuery, [dentistIdNum, user_id, ids]);
      
      if (details.rows.length > 0) {
        const { doctor_email, patient_name, service_names } = details.rows[0];
        doctor_name = details.rows[0].doctor_name;
        
        await sendDoctorAppointmentNotification(doctor_email, doctor_name, {
          patientName: patient_name,
          date: appointment_date,
          time: appointment_time,
          services: service_names,
          notes: notes
        });
      }
    } catch (emailErr) {
      console.error('Failed to send doctor notification email for walk-in:', emailErr.message);
    }

    // Add Web Notification for Patient
    try {
      const aptDate = new Date(appointment_date).toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
      });
      await createWebNotification(
        user_id,
        newAppointment.rows[0].id,
        'New Appointment Scheduled 📅',
        `A new appointment has been scheduled for you on ${aptDate} at ${appointment_time} with Dr. ${doctor_name}.`
      );
    } catch (webNotifErr) {
      console.error('Failed to create web notification:', webNotifErr.message);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAppointments,
  getBookedSlots,
  createAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  createWalkinAppointment,
};
