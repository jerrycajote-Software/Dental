const db = require('../config/db');

const registerPushToken = async (req, res) => {
  try {
    const { expo_push_token } = req.body;
    const userId = req.user.id;

    if (!expo_push_token) {
      return res.status(400).json({ message: 'Expo push token is required' });
    }

    await db.query(
      'UPDATE users SET expo_push_token = $1 WHERE id = $2',
      [expo_push_token, userId]
    );

    res.json({ message: 'Push token registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sendTestNotification = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    const userResult = await db.query(
      'SELECT expo_push_token, name FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    if (!user.expo_push_token) {
      return res.status(400).json({ message: 'User has not registered push token' });
    }

    const result = await sendPushNotification(
      user.expo_push_token,
      'Test Notification',
      `Hi ${user.name}! Your push notifications are working.`,
      { type: 'test' }
    );

    res.json({ message: 'Test notification sent', result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sendPushNotification = async (token, title, body, data = {}) => {
  const message = {
    to: token,
    title,
    body,
    data,
    sound: 'default',
    priority: 'high',
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  return await response.json();
};

const sendAppointmentReminder = async (appointmentId) => {
  try {
    const appointmentResult = await db.query(
      `SELECT a.*, 
              c.name AS client_name, c.expo_push_token AS client_token,
              d.name AS dentist_name
       FROM appointments a
       JOIN users c ON a.client_id = c.id
       JOIN users d ON a.dentist_id = d.id
       WHERE a.id = $1 AND a.status = 'confirmed'`,
      [appointmentId]
    );

    if (appointmentResult.rows.length === 0) {
      console.log(`[Reminder] Appointment ${appointmentId} not found or not confirmed`);
      return;
    }

    const apt = appointmentResult.rows[0];

    if (!apt.client_token) {
      console.log(`[Reminder] Patient has no push token for appointment ${appointmentId}`);
      return;
    }

    const alreadySent = await db.query(
      'SELECT id FROM notification_log WHERE appointment_id = $1 AND notification_type = $2',
      [appointmentId, 'reminder']
    );

    if (alreadySent.rows.length > 0) {
      console.log(`[Reminder] Already sent for appointment ${appointmentId}`);
      return;
    }

    const dateStr = new Date(apt.appointment_date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = apt.appointment_time.substring(0, 5);
    const period = parseInt(timeStr.substring(0, 2)) >= 12 ? 'PM' : 'AM';

    await sendPushNotification(
      apt.client_token,
      'Appointment Reminder ⏰',
      `Your appointment with Dr. ${apt.dentist_name} is in 1 hour (${dateStr} at ${timeStr} ${period})`,
      { type: 'reminder', appointment_id: appointmentId }
    );

    await db.query(
      'INSERT INTO notification_log (user_id, appointment_id, notification_type) VALUES ($1, $2, $3)',
      [apt.client_id, appointmentId, 'reminder']
    );

    console.log(`[Reminder] Sent for appointment ${appointmentId}`);
  } catch (err) {
    console.error(`[Reminder] Error for appointment ${appointmentId}:`, err.message);
  }
};

const sendStatusUpdateNotification = async (appointmentId, newStatus) => {
  try {
    const appointmentResult = await db.query(
      `SELECT a.*, 
              c.name AS client_name, c.expo_push_token AS client_token,
              d.name AS dentist_name
       FROM appointments a
       JOIN users c ON a.client_id = c.id
       JOIN users d ON a.dentist_id = d.id
       WHERE a.id = $1`,
      [appointmentId]
    );

    if (appointmentResult.rows.length === 0) return;

    const apt = appointmentResult.rows[0];
    if (!apt.client_token) return;

    const statusMessages = {
      confirmed: `Your appointment with Dr. ${apt.dentist_name} has been confirmed!`,
      cancelled: `Your appointment with Dr. ${apt.dentist_name} has been cancelled.`,
      completed: `Your appointment with Dr. ${apt.dentist_name} is complete.`,
    };

    const title = {
      confirmed: 'Appointment Confirmed ✅',
      cancelled: 'Appointment Cancelled ❌',
      completed: 'Appointment Completed ✅',
    };

    if (!statusMessages[newStatus]) return;

    await sendPushNotification(
      apt.client_token,
      title[newStatus],
      statusMessages[newStatus],
      { type: 'status_update', appointment_id: appointmentId, status: newStatus }
    );

    await db.query(
      'INSERT INTO notification_log (user_id, appointment_id, notification_type) VALUES ($1, $2, $3)',
      [apt.client_id, appointmentId, newStatus]
    );
  } catch (err) {
    console.error(`[Status Update] Error:`, err.message);
  }
};

module.exports = {
  registerPushToken,
  sendTestNotification,
  sendPushNotification,
  sendAppointmentReminder,
  sendStatusUpdateNotification,
};