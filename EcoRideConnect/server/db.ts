import { config } from "dotenv";
config();
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Determine if we should initialize the database
const SIMPLE_AUTH = process.env.SIMPLE_AUTH === 'true';

// eslint-disable-next-line no-console
console.log(`[db] module init. SIMPLE_AUTH=${process.env.SIMPLE_AUTH} DATABASE_URL=${process.env.DATABASE_URL ? 'SET' : 'MISSING'}`);

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle> | undefined;

if (!SIMPLE_AUTH) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
  // Initialize a standard Postgres pool using the DATABASE_URL
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // eslint-disable-next-line no-console
  console.log('[db] SIMPLE_AUTH=true -> skipping database initialization');
}

export { pool, db };
