const db = require('../config/db');
const bcrypt = require('bcryptjs');

const bootstrapAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  try {
    // Check if ANY admin account exists
    const adminResult = await db.query("SELECT * FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1");
    
    if (adminResult.rows.length > 0) {
      const existingAdmin = adminResult.rows[0];
      
      // If the existing admin's email or password doesn't match the current .env values, update it
      const passwordMatch = await bcrypt.compare(adminPassword, existingAdmin.password).catch(() => false);
      
      if (existingAdmin.email !== adminEmail || !passwordMatch) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await db.query(
          'UPDATE users SET email = $1, password = $2, email_verified = TRUE WHERE id = $3',
          [adminEmail, hashedPassword, existingAdmin.id]
        );
        console.log(`✅ Admin account updated to: ${adminEmail}`);
      }
      return;
    }

    // No admin exists — create one
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await db.query(
      'INSERT INTO users (name, email, password, role, email_verified) VALUES ($1, $2, $3, $4, TRUE)',
      ['Admin User', adminEmail, hashedPassword, 'admin']
    );
    console.log(`✅ Admin account created: ${adminEmail}`);
  } catch (err) {
    console.error('❌ Error during Admin bootstrap:', err.message);
  }
};

module.exports = bootstrapAdmin;
