const { Pool, types } = require('pg');
const dotenv = require('dotenv');

dotenv.config();


types.setTypeParser(1082, (val) => val);          
types.setTypeParser(1114, (val) => val);          
types.setTypeParser(1184, (val) => val);          

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

