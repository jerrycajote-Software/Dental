const { Pool, types } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Return DATE columns as plain strings (e.g. "2026-04-08") instead of JS Date
// objects set to UTC midnight, which shifts the date in non-UTC timezones.
types.setTypeParser(1082, (val) => val);          // DATE
types.setTypeParser(1114, (val) => val);          // TIMESTAMP WITHOUT TIME ZONE
types.setTypeParser(1184, (val) => val);          // TIMESTAMP WITH TIME ZONE

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

