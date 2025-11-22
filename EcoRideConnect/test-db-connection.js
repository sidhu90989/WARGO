const { Pool } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_qfn7yJbpAOk8@ep-proud-field-a12i5vvv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function testConnection() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    console.log('🔌 Testing database connection...');
    const client = await pool.connect();
    
    console.log('✅ Connected to database successfully!');
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Database tables:');
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found - database needs to be initialized');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    // Check database info
    const dbInfo = await client.query('SELECT version(), current_database(), current_user;');
    console.log('\n📌 Database info:');
    console.log(`  Database: ${dbInfo.rows[0].current_database}`);
    console.log(`  User: ${dbInfo.rows[0].current_user}`);
    console.log(`  Version: ${dbInfo.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    await pool.end();
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
