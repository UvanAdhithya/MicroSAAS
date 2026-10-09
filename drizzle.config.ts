import { defineConfig } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

// drizzle-kit runs outside Next.js, so load .env / .env.local the same way Next does
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
