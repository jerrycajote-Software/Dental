const express = require('express');
const router = express.Router();
const { getAppointments, getBookedSlots, createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment, createWalkinAppointment } = require('../controllers/appointmentController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAppointments);
router.get('/booked-slots', authMiddleware, getBookedSlots); // must be before /:id routes
router.post('/', authMiddleware, createAppointment);
router.post('/walkin', authMiddleware, createWalkinAppointment);
router.patch('/:id/status', authMiddleware, updateAppointmentStatus);
router.patch('/:id', authMiddleware, updateAppointment);
router.delete('/:id', authMiddleware, deleteAppointment);

module.exports = router;

