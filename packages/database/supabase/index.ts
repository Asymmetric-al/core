// Client-side only exports (safe for browser)
export { createClient as createBrowserClient } from "./client";

// Server-side exports - import these directly from their files to avoid bundling issues
// e.g., import { createServerClient } from "@asym/database/supabase/server"
// e.g., import { createAdminClient } from "@asym/database/supabase/admin"
// e.g., import { updateSession } from "@asym/database/supabase/proxy"
