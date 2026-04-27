const express = require('express');
const router = express.Router();
const { registerPushToken, sendTestNotification } = require('../controllers/notificationController');

router.post('/register', registerPushToken);
router.post('/send', sendTestNotification);

module.exports = router;