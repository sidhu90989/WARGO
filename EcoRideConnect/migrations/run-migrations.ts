import { config } from 'dotenv';
config();

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../server/db';

async function main() {
  if (process.env.SIMPLE_AUTH === 'true') {
    console.error('[migrate] SIMPLE_AUTH=true, skipping database migrations. Set SIMPLE_AUTH=false and provide a valid DATABASE_URL.');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('[migrate] Missing DATABASE_URL. Please set it in .env');
    process.exit(1);
  }

  console.log('[migrate] starting migrations from ./migrations');
  try {
    await migrate(db as any, { migrationsFolder: './migrations' });
    console.log('[migrate] migrations completed successfully');
  } catch (e) {
    console.error('[migrate] migration failed:', e);
    process.exitCode = 1;
  } finally {
    try { await pool?.end(); } catch {}
  }
}

main();
