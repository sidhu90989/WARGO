import 'dotenv/config';
import { Pool } from 'pg';

async function checkData() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  const tables = ['users', 'driver_profiles', 'rides', 'payments', 'ratings', 'eco_badges'];
  
  console.log('📊 Sample Data Verification:');
  for (const table of tables) {
    const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
    console.log(`  ✓ ${table}: ${result.rows[0].count} records`);
  }

  client.release();
  await pool.end();
}

checkData().catch(console.error);
