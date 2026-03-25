const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification, createDoctor, getDoctors, deleteDoctor, forgotPassword, resetPassword } = require('../controllers/authController');
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

module.exports = router;
