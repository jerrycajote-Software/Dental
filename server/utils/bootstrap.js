const db = require('../config/db');
const bcrypt = require('bcryptjs');

const bootstrapAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  try {
    // 1. Database Migrations (ensure columns exist)
    console.log('Running database migrations...');
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    `);
    console.log('✅ Users table columns verified.');

    // 2. Seed Default Services
    console.log('Checking dental services...');
    const services = [
      ['Oral Prophylaxis', 'Professional teeth cleaning and scaling to remove plaque and tartar.', 1500.00, 45],
      ['Tooth Extraction', 'Safe and painless removal of damaged or decayed teeth.', 1200.00, 30],
      ['Dental Filling (Pasta)', 'Restoration of decayed teeth using high-quality composite materials.', 1000.00, 45],
      ['Teeth Whitening', 'Professional bleaching treatment for a brighter and whiter smile.', 5000.00, 60],
      ['Dental Braces', 'Orthodontic treatment to correct misaligned teeth and bite issues.', 35000.00, 60],
      ['Root Canal Treatment', 'Specialized procedure to save a severely infected or damaged tooth.', 8000.00, 90],
      ['Dentures', 'Custom-made removable replacements for missing teeth and surrounding tissues.', 15000.00, 60],
      ['Dental Crowns', 'Protective caps placed over damaged teeth to restore shape and function.', 12000.00, 60],
      ['Dental Veneers', 'Thin shells of porcelain or composite resin bonded to the front of teeth.', 15000.00, 60],
      ['Check-up & Consultation', 'Comprehensive dental examination and professional advice.', 500.00, 30]
    ];

    for (const [name, desc, price, duration] of services) {
      const exists = await db.query('SELECT id FROM services WHERE name = $1', [name]);
      if (exists.rowCount === 0) {
        await db.query(
          'INSERT INTO services (name, description, price, duration_minutes) VALUES ($1, $2, $3, $4)',
          [name, desc, price, duration]
        );
      }
    }
    console.log('✅ Dental services verified/seeded.');

    // 3. Admin User Bootstrap
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
