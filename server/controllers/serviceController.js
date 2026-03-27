const db = require('../config/db');

const getServices = async (req, res) => {
  try {
    const services = await db.query('SELECT * FROM services');
    res.json(services.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDentists = async (req, res) => {
  const { date } = req.query; // optional YYYY-MM-DD
  try {
    let query = `
      SELECT id, name FROM users
      WHERE role = 'doctor'
        AND is_available = TRUE
        AND is_deleted IS NOT TRUE
    `;
    const params = [];

    if (date) {
      params.push(date);
      query += `
        AND id NOT IN (
          SELECT doctor_id FROM doctor_unavailable_dates
          WHERE unavailable_date = $1
        )
      `;
    }

    const dentists = await db.query(query, params);
    res.json(dentists.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getServices, getDentists };

