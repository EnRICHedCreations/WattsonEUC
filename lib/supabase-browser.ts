import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-instantiated — module-level instantiation crashes Vercel builds
// when env vars aren't yet available at build time.
export function createBrowserSupabaseClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
