import { isSupabaseConfigured, supabase } from './supabase';

export async function ensureAnonymousSession(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (session) return;

  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error('Kirish amalga oshmadi. Qayta urinib ko\'ring.');
  }
}

export async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
