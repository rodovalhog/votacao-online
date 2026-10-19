import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_KYDhtJ4zB0Od@ep-flat-feather-b5kfvj8r-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Connection with SSL for Neon PostgreSQL on Vercel and local
export const client = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

let initialized = false;

export async function initDb() {
  if (initialized) return;

  const sql = `
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      number INTEGER NOT NULL,
      votes INTEGER NOT NULL DEFAULT 0
    );

    INSERT INTO candidates (id, name, number, votes)
    VALUES
      ('lula', 'Luiz Inácio Lula da Silva', 13, 0),
      ('flavio', 'Flávio Bolsonaro', 22, 0)
    ON CONFLICT (id) DO NOTHING;

    DROP TABLE IF EXISTS votes;
  `;

  try {
    await client.unsafe(sql);
    initialized = true;
  } catch (e) {
    console.error('Error in initDb:', e);
  }
}
