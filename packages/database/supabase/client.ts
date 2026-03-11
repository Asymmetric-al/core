import { clientEnv } from "@asym/env";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // In browser runtimes, @supabase/ssr reuses a singleton client by default.
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
