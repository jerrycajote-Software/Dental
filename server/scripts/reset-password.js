/**
 * Admin Password Reset Script
 * Usage: node scripts/reset-password.js <email> <newPassword>
 * Example: node scripts/reset-password.js patient@gmail.com NewPass123
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const [,, email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error('❌  Usage: node scripts/reset-password.js <email> <newPassword>');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    // Check if user exists
    const check = await pool.query('SELECT id, name, email_verified FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (check.rowCount === 0) {
      console.error(`❌  No user found with email: ${email}`);
      process.exit(1);
    }

    const user = check.rows[0];
    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = $1, email_verified = TRUE WHERE email = $2',
      [hash, email.toLowerCase().trim()]
    );

    console.log('✅  Password updated successfully!');
    console.log(`   User    : ${user.name}`);
    console.log(`   Email   : ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Verified: ${user.email_verified ? 'was already verified' : 'now set to verified'}`);
  } catch (err) {
    console.error('❌  Error:', err.message);
  } finally {
    await pool.end();
  }
})();
