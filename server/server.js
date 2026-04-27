const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Dental System API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const bootstrapAdmin = require('./utils/bootstrap');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await bootstrapAdmin();

  // Auto-cancellation job: cancel pending appointments not approved within 1 hour
  const db = require('./config/db');
  const { sendAppointmentReminder } = require('./controllers/notificationController');

  const runAutoCancellation = async () => {
    try {
      const result = await db.query(
        `UPDATE appointments SET status = 'cancelled'
         WHERE status = 'pending'
           AND created_at < NOW() - INTERVAL '1 hour'
         RETURNING id`
      );
      if (result.rowCount > 0) {
        console.log(`[Auto-Cancel] Cancelled ${result.rowCount} appointment(s) not approved within 1 hour.`);
      }
    } catch (err) {
      console.error('[Auto-Cancel] Error running auto-cancellation:', err.message);
    }
  };

  // Appointment reminder job: send push notifications 1 hour before
  const runReminderJob = async () => {
    try {
      const result = await db.query(
        `SELECT id FROM appointments
         WHERE status = 'confirmed'
           AND appointment_date = CURRENT_DATE
           AND appointment_time > NOW() + INTERVAL '45 minutes'
           AND appointment_time < NOW() + INTERVAL '65 minutes'`
      );

      for (const row of result.rows) {
        await sendAppointmentReminder(row.id);
      }

      if (result.rowCount > 0) {
        console.log(`[Reminder] Checked ${result.rowCount} appointment(s) for reminders.`);
      }
    } catch (err) {
      console.error('[Reminder] Error running reminder job:', err.message);
    }
  };

  // Run immediately on startup, then every 5 minutes
  runAutoCancellation();
  setInterval(runAutoCancellation, 5 * 60 * 1000);

  // Run reminder check every 15 minutes
  runReminderJob();
  setInterval(runReminderJob, 15 * 60 * 1000);
});

