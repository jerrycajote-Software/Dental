const express = require('express');
const router = express.Router();
const { getSettings, updateSetting } = require('../controllers/settingsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');


router.get('/', authMiddleware, adminMiddleware, getSettings);


router.patch('/', authMiddleware, adminMiddleware, updateSetting);

module.exports = router;
