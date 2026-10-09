'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase-client';

/**
 * Client-side Auth Abstraction.
 * Pages/components must use these helpers instead of calling Supabase directly,
 * so a future migration (e.g. to Clerk) only requires changes here and in auth.ts.
 */

export interface ClientUser {
  id: string;
  email: string | null;
}

type AuthResult = { error: string | null };

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult & { needsConfirmation: boolean }> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/dashboard` },
  });
  return { error: error?.message ?? null, needsConfirmation: !!data?.user && !data.session };
}

export async function signOutUser(): Promise<AuthResult> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

/** Subscribes to auth state; returns an unsubscribe function. */
export function onAuthChange(cb: (user: ClientUser | null) => void): () => void {
  const supabase = createSupabaseBrowserClient();
  supabase.auth.getUser().then(({ data }) =>
    cb(data.user ? { id: data.user.id, email: data.user.email ?? null } : null)
  );
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user;
    cb(u ? { id: u.id, email: u.email ?? null } : null);
  });
  return () => data.subscription.unsubscribe();
}
