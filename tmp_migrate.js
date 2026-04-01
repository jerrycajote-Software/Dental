
const db = require('./server/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'database', 'migration_walkin.sql'), 'utf8');
    await db.query(sql);
    console.log('Migration executed successfully');
    process.exit(0);

  }
  catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
runMigration();