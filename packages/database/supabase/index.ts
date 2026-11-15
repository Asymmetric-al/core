// Browser-safe exports only.
export { createClient as createBrowserClient } from "./client";

// Re-exported so client surfaces can type realtime channels without
// importing @supabase/* directly (blocked by no-restricted-imports).
export type { RealtimeChannel } from "@supabase/supabase-js";

// Server-only clients are imported from their own subpaths so they never enter
// a browser bundle:
// - `createClient` from "@asym/database/supabase/server"
// - `createAdminClient` from "@asym/database/supabase/admin"
// - `updateSession` from "@asym/database/supabase/proxy" (deprecated)
// Auth guards and redirects belong to @asym/auth/middleware.
