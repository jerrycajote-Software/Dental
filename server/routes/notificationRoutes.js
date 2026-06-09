const express = require('express');
const router = express.Router();
const { registerPushToken, sendTestNotification, getWebNotifications, markWebNotificationAsRead, markAllWebNotificationsAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', registerPushToken);
router.post('/send', sendTestNotification);


router.get('/web', authMiddleware, getWebNotifications);
router.patch('/web/:id/read', authMiddleware, markWebNotificationAsRead);
router.patch('/web/read-all', authMiddleware, markAllWebNotificationsAsRead);

module.exports = router;