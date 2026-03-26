const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification, createDoctor, getDoctors, deleteDoctor, getPatients, deletePatient, deleteSelf, forgotPassword, resetPassword } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin-only doctor management routes
router.post('/doctors', authMiddleware, adminMiddleware, createDoctor);
router.get('/doctors', authMiddleware, adminMiddleware, getDoctors);
router.delete('/doctors/:id', authMiddleware, adminMiddleware, deleteDoctor);

// Admin-only patient management routes
router.get('/patients', authMiddleware, adminMiddleware, getPatients);
router.delete('/patients/:id', authMiddleware, adminMiddleware, deletePatient);

// Account management
router.post('/delete-account', authMiddleware, deleteSelf);

module.exports = router;
