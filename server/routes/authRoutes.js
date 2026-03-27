const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification, createDoctor, getDoctors, deleteDoctor, getPatients, deletePatient, deleteSelf, forgotPassword, resetPassword, updateAvailability, getUnavailableDates, addUnavailableDate, deleteUnavailableDate, getMe } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Own profile (any authenticated user)
router.get('/me', authMiddleware, getMe);

// Admin-only doctor management routes
router.post('/doctors', authMiddleware, adminMiddleware, createDoctor);
router.get('/doctors', authMiddleware, adminMiddleware, getDoctors);
router.delete('/doctors/:id', authMiddleware, adminMiddleware, deleteDoctor);

// Admin-only patient management routes
router.get('/patients', authMiddleware, adminMiddleware, getPatients);
router.delete('/patients/:id', authMiddleware, adminMiddleware, deletePatient);

// Account management
router.post('/delete-account', authMiddleware, deleteSelf);

// Doctor availability management (doctor-only)
router.patch('/availability', authMiddleware, updateAvailability);
router.get('/unavailable-dates', authMiddleware, getUnavailableDates);
router.post('/unavailable-dates', authMiddleware, addUnavailableDate);
router.delete('/unavailable-dates/:id', authMiddleware, deleteUnavailableDate);

module.exports = router;


