import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Public-read client using the anon key — safe for server components that
 * fetch a shared ride to display, since RLS only allows SELECT anyway.
 * Lazy-instantiated to avoid crashing the build when env vars aren't set
 * at build time (e.g. a Vercel preview build before env vars are configured).
 */
export function createPublicServerClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Service-role client — bypasses RLS entirely. ONLY use this inside
 * server-side API routes (e.g. app/api/rides/route.ts), never in a
 * component that could run client-side, and never send this key to the
 * browser. This is a plain client (no cookie/session management), per the
 * standard "service role client must not be an SSR cookie client" rule.
 */
export function createServiceRoleClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
