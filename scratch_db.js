const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function dumpSchema() {
  try {
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    let schema = {};
    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      const cols = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [tableName]);
      
      schema[tableName] = cols.rows;
    }
    fs.writeFileSync('schema.json', JSON.stringify(schema, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
dumpSchema();
