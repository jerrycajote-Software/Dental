const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/email');

// Email format validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const role = 'user'; // Only regular users can register via this endpoint

  try {
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Email format validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check for existing user (including soft-deleted ones)
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    
    if (userResult.rows.length > 0) {
      const existingUser = userResult.rows[0];
      
      if (!existingUser.is_deleted) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // If soft-deleted, check 24-hour restriction
      const deletedAt = new Date(existingUser.deleted_at);
      const now = new Date();
      const hoursDifference = (now - deletedAt) / (1000 * 60 * 60);

      if (hoursDifference < 24) {
        return res.status(403).json({ 
          message: `This account was recently deleted. You must wait ${Math.ceil(24 - hoursDifference)} more hours before re-registering with this email.` 
        });
      }

      // If more than 24 hours, we'll permanently delete the old record and create a new one
      // or just update it. For simplicity and to keep it clean, let's delete the old one.
      await db.query('DELETE FROM users WHERE id = $1', [existingUser.id]);
    }

    // Prevent anyone from registering as admin via API
    // (admin is bootstrapped on server start only)
    const adminCount = await db.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if (role === 'admin' && parseInt(adminCount.rows[0].count) >= 1) {
      return res.status(403).json({ message: 'Admin account already exists' });
    }

    // Hash password and generate verification token
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await db.query(
      `INSERT INTO users (name, email, password, role, email_verified, verification_token, verification_token_expires) 
       VALUES ($1, $2, $3, $4, FALSE, $5, $6) 
       RETURNING id, name, email, role`,
      [name.trim(), trimmedEmail, hashedPassword, role, verificationToken, tokenExpires]
    );

    // Send verification email
    try {
      await sendVerificationEmail(trimmedEmail, name.trim(), verificationToken);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
      // Don't fail registration if email fails — user can request a resend later
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: newUser.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Mark email as verified and clear the token
    await db.query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
      [result.rows[0].id]
    );

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await db.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'No account found with that email' });
    }

    if (user.rows[0].email_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [verificationToken, tokenExpires, user.rows[0].id]
    );

    await sendVerificationEmail(trimmedEmail, user.rows[0].name, verificationToken);

    res.json({ message: 'Verification email has been resent. Please check your inbox.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const trimmedEmail = email?.trim().toLowerCase();
    const user = await db.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    if (user.rows.length === 0 || user.rows[0].is_deleted) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.rows[0].email_verified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true,
        email: trimmedEmail
      });
    }

    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createDoctor = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!trimmedEmail.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Doctor account must use a valid Gmail address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check for existing user
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newDoctor = await db.query(
      `INSERT INTO users (name, email, password, role, email_verified, verification_token, verification_token_expires) 
       VALUES ($1, $2, $3, 'doctor', FALSE, $4, $5) 
       RETURNING id, name, email, role, email_verified, created_at`,
      [name.trim(), trimmedEmail, hashedPassword, verificationToken, tokenExpires]
    );

    // Send verification email
    try {
      await sendVerificationEmail(trimmedEmail, name.trim(), verificationToken);
    } catch (emailErr) {
      console.error('Failed to send verification email to doctor:', emailErr.message);
    }

    res.status(201).json({
      message: 'Doctor account created successfully! A verification email has been sent to their Gmail.',
      doctor: newDoctor.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await db.query(
      "SELECT id, name, email, role, email_verified, created_at FROM users WHERE role = 'doctor' ORDER BY created_at DESC"
    );
    res.json(doctors.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    // Verify it's actually a doctor
    const doctor = await db.query("SELECT * FROM users WHERE id = $1 AND role = 'doctor'", [id]);
    if (doctor.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Delete related schedules first
    await db.query('DELETE FROM schedules WHERE dentist_id = $1', [id]);
    // Delete the doctor
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'Doctor account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const user = await db.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    
    if (user.rows.length === 0) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE email = $3',
      [resetToken, resetExpires, trimmedEmail]
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendVerificationEmail(trimmedEmail, resetUrl, 'Reset Your Password', 'Please click the link below to reset your password. This link will expire in 1 hour.');

    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await db.query(
      'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'UPDATE users SET password = $1, verification_token = NULL, verification_token_expires = NULL WHERE id = $2',
      [hashedPassword, user.rows[0].id]
    );

    res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await db.query(
      "SELECT id, name, email, role, email_verified, is_deleted, deleted_at, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC"
    );
    res.json(patients.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if user exists and is a patient
    const user = await db.query("SELECT * FROM users WHERE id = $1 AND role = 'user'", [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Soft delete the patient
    await db.query(
      'UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Patient account marked as deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSelf = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Soft delete own account
    await db.query(
      'UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Your account has been deleted successfully. You will be logged out.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  register, 
  login, 
  verifyEmail, 
  resendVerification, 
  createDoctor, 
  getDoctors, 
  deleteDoctor, 
  getPatients,
  deletePatient,
  deleteSelf,
  forgotPassword, 
  resetPassword 
};
