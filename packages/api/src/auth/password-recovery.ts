import { markSharedOriginSessionChange } from "@asym/auth/clipboard-reset";
import { PASSWORD_RECOVERY_PATHS } from "@asym/auth/password-recovery";
import { createClient } from "@asym/database/supabase/server";

import { callbackRedirect } from "./callback";

/**
 * Where a password recovery email lands (`/forgot-password/callback` in each
 * app). Exchanges the link's code for a session server-side, then always
 * sends the person to the reset screen on the same host.
 *
 * It never redirects to a role home, unlike the sign-in callback: the reset
 * screen comes first. That is a rule of these screens, not a protection: the
 * session the exchange creates is an ordinary signed-in session, and because
 * `secure_password_change` is off (`supabase/config.toml`) any session can
 * change its password by calling Supabase Auth directly. The reset screen
 * offers its form only within the recovery window
 * (`PASSWORD_RECOVERY_WINDOW_SECONDS`).
 *
 * Nor does it decide what the reset screen shows. A link that was used,
 * expired or opened in another browser leaves no recovery session, and the
 * reset screen then says so and offers a new link. Supabase reports an
 * expired link with error parameters and no code, so there is nothing to
 * exchange.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const response = callbackRedirect(PASSWORD_RECOVERY_PATHS.reset);
  if (code) {
    const supabase = await createClient(null); // Auth only: reads no tenant table.
    // A refused exchange issues no session; the reset screen reports it.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) markSharedOriginSessionChange(response);
  }

  return response;
}
