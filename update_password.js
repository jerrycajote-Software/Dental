const bcrypt = require('bcryptjs');
const db = require('./server/config/db'); // Your database connection pool

async function updateUserPassword(email, newPassword) {
  try {
    // 1. Hash the new password 
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 2. Update the user account in the database
    const result = await db.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, name',
      [hashedPassword, email.trim().toLowerCase()]
    );

    if (result.rowCount === 0) {
      console.log('❌ User not found with that email.');
    } else {
      console.log(`✅ Password successfully updated for: ${result.rows[0].name} (${result.rows[0].email})`);
    }

  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    process.exit(0);
  }
}

// REPLACE WITH THE TARGET EMAIL AND DESIRED NEW PASSWORD
const TARGET_EMAIL = 'patient@example.com';
const NEW_PASSWORD = 'MyNewPassword123!';

updateUserPassword(TARGET_EMAIL, NEW_PASSWORD);
