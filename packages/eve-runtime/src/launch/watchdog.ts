import { expireEveLaunchCanaries } from "@asym/api/eve/launch-readiness";

export async function runEveLaunchCanaryWatchdog() {
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) throw new Error("Eve launch watchdog is unavailable.");
  return {
    expired: await expireEveLaunchCanaries({
      supabaseAdmin: admin.client,
    }),
  };
}
