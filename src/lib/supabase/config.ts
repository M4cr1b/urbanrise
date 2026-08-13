/**
 * Supabase configuration.
 *
 * The app runs fully against seeded data until these are set, so the UI is
 * never blocked on credentials. `isSupabaseConfigured()` is the single switch
 * the data layer reads to decide which source to use.
 */

/**
 * Reduces whatever was pasted into the environment to the bare project origin.
 *
 * The Supabase dashboard shows the REST endpoint (`https://ref.supabase.co/
 * rest/v1/`) next to the keys, and that is what people copy. supabase-js
 * appends its own `/rest/v1/`, so the suffix produces
 * `/rest/v1/rest/v1/properties` and every query fails with "Invalid path
 * specified in request URL" — a message that points nowhere near the cause.
 *
 * Normalising here rather than trusting the input costs one function and makes
 * the deployment work whichever form of the URL is configured. Trailing
 * slashes go too, for the same reason.
 */
function normaliseProjectUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    // Keep only scheme + host: no path, no query, no trailing slash.
    return new URL(trimmed).origin;
  } catch {
    // Not a parseable URL — strip a trailing path fragment and hand it on, so
    // a genuinely malformed value fails loudly at the call site instead of here.
    return trimmed.replace(/\/+(rest\/v\d+\/?)?$/, "");
  }
}

export const SUPABASE_URL = normaliseProjectUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
);

/**
 * The publishable (anon) key. Safe in the browser — row level security is what
 * protects the data, not the secrecy of this value. The service-role key must
 * never appear in a `NEXT_PUBLIC_` variable.
 */
export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ""
).trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
