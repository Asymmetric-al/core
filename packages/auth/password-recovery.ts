/**
 * Password recovery through Supabase Auth, shared by all three apps.
 *
 * Flow: the request screen asks Supabase to email a link that returns to the
 * callback on the host the screen was opened on. The callback exchanges the
 * link's code for a session and sends the person to the reset screen, which
 * accepts a new password only from a session that recovery created.
 *
 * Every step sits under `/forgot-password`, which each app's proxy and the
 * missionary role gate already treat as public, so recovery adds no new
 * public route. Client-safe: no server imports here.
 */

export const PASSWORD_RECOVERY_PATHS = {
  /** Where a person asks for the email. */
  request: "/forgot-password",
  /** Where the email link lands; exchanges its code for a session. */
  callback: "/forgot-password/callback",
  /** Where the person chooses the new password. */
  reset: "/forgot-password/reset",
} as const;

/**
 * How long after following the email link the new password may be set. The
 * recovery session lasts as long as any other session, so without this limit
 * a recovered session left open could change the password later without the
 * current one, which the ordinary change-password form refuses.
 */
export const PASSWORD_RECOVERY_WINDOW_SECONDS = 60 * 60;

/** Clock skew tolerated for a recovery timestamp issued by Supabase. */
const CLOCK_SKEW_SECONDS = 60;

/**
 * The address the recovery email returns to: the callback on the given
 * origin, so the person lands on the host they asked from. The host must be
 * admitted by the Supabase project's redirect allowlist.
 */
export function passwordRecoveryRedirectUrl(origin: string): string {
  return new URL(PASSWORD_RECOVERY_PATHS.callback, origin).toString();
}

/**
 * True when the session's `amr` claim records a recovery within the window.
 * Takes the claim as verified by `auth.getClaims()`. Fails closed on any
 * other shape, including the timestamp-less string form a custom access
 * token hook can emit.
 */
export function isRecentPasswordRecovery(
  amr: unknown,
  nowSeconds: number,
): boolean {
  if (!Array.isArray(amr)) {
    return false;
  }

  return amr.some((entry: unknown) => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    const { method, timestamp } = entry as {
      method?: unknown;
      timestamp?: unknown;
    };
    return (
      method === "recovery" &&
      typeof timestamp === "number" &&
      timestamp <= nowSeconds + CLOCK_SKEW_SECONDS &&
      nowSeconds - timestamp <= PASSWORD_RECOVERY_WINDOW_SECONDS
    );
  });
}
