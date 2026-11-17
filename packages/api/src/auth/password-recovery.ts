import { PASSWORD_RECOVERY_PATHS } from "@asym/auth/password-recovery";
import { createClient } from "@asym/database/supabase/server";

import { callbackRedirect } from "./callback";

/**
 * Where a password recovery email lands (`/forgot-password/callback` in each
 * app). Exchanges the link's code for a session server-side, then always
 * sends the person to the reset screen on the same host.
 *
 * It never redirects to a role home, unlike the sign-in callback: the person
 * has to choose a password first. Nor does it decide what the reset screen
 * shows. A link that was used, expired or opened in another browser leaves
 * no recovery session, and the reset screen then says so and offers a new
 * link. Supabase reports an expired link with error parameters and no code,
 * so there is nothing to exchange.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    // A refused exchange issues no session; the reset screen reports it.
    await supabase.auth.exchangeCodeForSession(code);
  }

  return callbackRedirect(`${origin}${PASSWORD_RECOVERY_PATHS.reset}`);
}
