import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// Singleton connection client
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Recommended for serverless environments (Supabase Pooler / Neon)
});

export const db = drizzle(client, { schema });
