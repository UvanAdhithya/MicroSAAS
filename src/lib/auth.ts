import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface UserSession {
  id: string;
  email: string | null;
}

/**
 * Creates a server-side Supabase client using cookie storage
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore if called from Server Component context
        }
      },
    },
  });
}

/**
 * Central Abstraction Helper: Returns current logged-in user ID (string).
 * Migration Ready: When migrating to Clerk, only this single utility function needs to be updated!
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ? user.id : null;
  } catch (error) {
    console.error('Error fetching current user ID:', error);
    return null;
  }
}

/**
 * Central Abstraction Helper: Returns current user session details.
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || null,
    };
  } catch (error) {
    console.error('Error fetching current user session:', error);
    return null;
  }
}
