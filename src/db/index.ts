import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Auto-load DATABASE_URL from .env.local if not already in process.env
if (!process.env.DATABASE_URL) {
  try {
    const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    const match = envFile.match(/DATABASE_URL="?([^"\n]+)"?/);
    if (match) process.env.DATABASE_URL = match[1];
  } catch {
    // ignore
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __db_instance: any;
  // eslint-disable-next-line no-var
  var __db_table_created: boolean | undefined;
}

function getDatabase() {
  if (global.__db_instance) {
    return global.__db_instance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    const client = postgres(databaseUrl, {
      ssl: 'require',
      max: 10,
    });
    const db = drizzlePostgres(client, { schema });
    global.__db_instance = { db, client, isPglite: false };
    return global.__db_instance;
  }

  // Local embedded PostgreSQL (PGlite) - zero-config fallback
  const dir = path.join(process.cwd(), '.data', 'pglite');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const client = new PGlite(dir);
  const db = drizzlePglite({ client, schema });
  global.__db_instance = { db, client, isPglite: true };
  return global.__db_instance;
}

export const { db, client, isPglite } = getDatabase();

export async function initDb() {
  if (global.__db_table_created) return;

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
    if (isPglite) {
      await client.exec(sql);
    } else {
      await client.unsafe(sql);
    }
    global.__db_table_created = true;
  } catch (e) {
    console.error('Error creating candidates table:', e);
  }
}
