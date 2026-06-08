const db = require('../config/db');

// Get all settings
const getSettings = async (req, res) => {
  try {
    const result = await db.query('SELECT key, value, updated_at FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    console.error('[Settings Controller Error]:', err.message);
    res.status(500).json({ message: 'Failed to fetch settings.' });
  }
};

// Update a setting
const updateSetting = async (req, res) => {
  const { key, value } = req.body;

  if (!key) {
    return res.status(400).json({ message: 'Setting key is required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING key, value, updated_at`,
      [key, value]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Settings Controller Error]:', err.message);
    res.status(500).json({ message: 'Failed to update setting.' });
  }
};

module.exports = { getSettings, updateSetting };
