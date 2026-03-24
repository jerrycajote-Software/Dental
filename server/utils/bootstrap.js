const db = require('../config/db');
const bcrypt = require('bcryptjs');

const bootstrapAdmin = async () => {
  const adminEmail = 'admin@dental.com';
  const defaultPassword = 'admin123';

  try {
    // Check if the admin already exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    if (result.rows.length === 0) {
      // Create admin if not exists
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      console.log('✅ Default Admin account created: admin@dental.com / admin123');
    } else {
      // Verify the stored password works; if not, update it
      const user = result.rows[0];
      const isValid = await bcrypt.compare(defaultPassword, user.password).catch(() => false);
      if (!isValid) {
        await db.query(
          'UPDATE users SET password = $1 WHERE email = $2',
          [hashedPassword, adminEmail]
        );
        console.log('✅ Default Admin password updated to: admin123');
      }
    }
  } catch (err) {
    console.error('❌ Error during Admin bootstrap:', err.message);
  }
};

module.exports = bootstrapAdmin;
