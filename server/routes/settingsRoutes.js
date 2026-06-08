const express = require('express');
const router = express.Router();
const { getSettings, updateSetting } = require('../controllers/settingsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Get all settings (admin only)
router.get('/', authMiddleware, adminMiddleware, getSettings);

// Update a setting (admin only)
router.patch('/', authMiddleware, adminMiddleware, updateSetting);

module.exports = router;
