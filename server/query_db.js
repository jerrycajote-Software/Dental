const db = require('./config/db');

async function run() {
  try {
    const res = await db.query("SELECT id, name, email, email_verified FROM users");
    console.log('All Users:');
    console.log(res.rows);

    const appts = await db.query("SELECT * FROM appointments ORDER BY id DESC LIMIT 5");
    console.log('\nRecent Appointments:');
    console.log(appts.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
