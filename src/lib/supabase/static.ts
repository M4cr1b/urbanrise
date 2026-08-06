import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * A cookie-free Supabase client for build-time reads.
 *
 * `generateStaticParams` and other build-time code run without an HTTP request,
 * so the `@supabase/ssr` server client cannot be used there — it calls
 * `cookies()`, which throws outside a request scope. This client carries no
 * session at all and reads as `anon`, which is exactly right: the data it
 * fetches is the publicly readable reference data.
 */
export function createStaticClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
