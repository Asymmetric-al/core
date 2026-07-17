// Client-side only exports (safe for browser)
export { createClient as createBrowserClient } from "./client";

// Re-exported so client surfaces can type realtime channels without
// importing @supabase/* directly (blocked by no-restricted-imports).
export type { RealtimeChannel } from "@supabase/supabase-js";

// Server-side exports - import these directly from their files to avoid bundling issues
// e.g., import { createServerClient } from "@asym/database/supabase/server"
// e.g., import { createAdminClient } from "@asym/database/supabase/admin"
// e.g., import { updateSession } from "@asym/database/supabase/proxy"
// Note: for auth guards/redirects, use @asym/auth/middleware (single source of truth).
