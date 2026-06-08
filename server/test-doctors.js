
const db = require('./config/db');

async function test() {
    try {
        console.log('Testing getDoctors query...');
        const result = await db.query("SELECT id, name, email, role, email_verified, created_at FROM users WHERE role = 'doctor' ORDER BY created_at DESC");
        console.log('Query result rows:', result.rows);
        console.log('Number of doctors:', result.rows.length);
    } catch (err) {
        console.error('Error in test:', err);
    } finally {
        process.exit(0);
    }
}

test();
