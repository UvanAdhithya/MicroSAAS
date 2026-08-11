import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

// Users table representation (Clerk & Supabase migration compatible)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Unconstrained text ID: supports Supabase UUIDs or Clerk 'user_...' string IDs
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Saved Reports table (Clerk & Supabase migration compatible)
export const savedReports = pgTable('saved_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // Plain text user_id without FK constraints for zero-friction Clerk migration
  toolName: text('tool_name').notNull(),
  reportTitle: text('report_title'),
  reportData: jsonb('report_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
