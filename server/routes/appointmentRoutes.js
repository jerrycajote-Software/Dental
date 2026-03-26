const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAppointments);
router.post('/', authMiddleware, createAppointment);
router.patch('/:id/status', authMiddleware, updateAppointmentStatus);
router.patch('/:id', authMiddleware, updateAppointment);
router.delete('/:id', authMiddleware, deleteAppointment);

module.exports = router;
