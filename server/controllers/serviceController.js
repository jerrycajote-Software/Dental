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
  try {
    const dentists = await db.query('SELECT id, name FROM users WHERE role = $1', ['dentist']);
    res.json(dentists.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getServices, getDentists };
