const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const pool = new Pool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function dumpData() {
  const tables = ['plants', 'record_types', 'nature_types', 'building_categories', 'absence_reasons'];
  for(let table of tables) {
    console.log('-- Data for ' + table);
    const res = await pool.query('SELECT * FROM ' + table);
    for(let row of res.rows) {
      if (row.name) {
        console.log(`INSERT INTO [${table}] (name) VALUES ('${row.name.replace(/'/g, "''")}');`);
      }
    }
    console.log('GO\n');
  }
  pool.end();
}
dumpData();
