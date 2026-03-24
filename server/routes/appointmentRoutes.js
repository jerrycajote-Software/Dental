const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointmentStatus, deleteAppointment } = require('../controllers/appointmentController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAppointments);
router.post('/', authMiddleware, createAppointment);
router.patch('/:id/status', authMiddleware, updateAppointmentStatus);
router.delete('/:id', authMiddleware, deleteAppointment);

module.exports = router;
