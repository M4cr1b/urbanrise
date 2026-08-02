import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Session refresh.
 *
 * Next 16 renamed the `middleware` convention to `proxy` — the file is
 * `proxy.ts` and the export is `proxy`. The runtime is nodejs and cannot be
 * configured to edge.
 *
 * This only refreshes the auth cookie; it deliberately does not gate routes.
 * Listings, professionals and materials are public by design — the platform
 * exists to remove information asymmetry, so browsing must not require an
 * account. Only the valuation working papers are private, and row level
 * security enforces that at the database.
 */
export async function proxy(request: NextRequest) {
  // Without credentials the app runs on seeded data and has no session to
  // refresh, so there is nothing useful to do here.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not insert code between createServerClient and getUser(): it is what
  // refreshes an expiring token, and anything in between can log users out at
  // random in ways that are miserable to debug.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
