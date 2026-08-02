/**
 * Supabase configuration.
 *
 * The app runs fully against seeded data until these are set, so the UI is
 * never blocked on credentials. `isSupabaseConfigured()` is the single switch
 * the data layer reads to decide which source to use.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * The publishable (anon) key. Safe in the browser — row level security is what
 * protects the data, not the secrecy of this value. The service-role key must
 * never appear in a `NEXT_PUBLIC_` variable.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
