import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // In browser runtimes, @supabase/ssr reuses a singleton client by default.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
