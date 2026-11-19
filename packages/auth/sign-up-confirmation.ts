/**
 * Sign-up email confirmation through Supabase Auth, shared by every screen
 * that registers a login.
 *
 * Confirmation is required (`enable_confirmations`), so registering creates
 * no session. The confirmation email returns to the shared auth callback on
 * the host the person registered on; the callback exchanges the link's code
 * and signs them in there. Session cookies are set per host, so the host the
 * link returns to is the host the person is signed in on. Client-safe.
 */

/** Where the confirmation email lands: the shared sign-in callback. */
export const SIGN_UP_CONFIRMATION_CALLBACK_PATH = "/auth/callback";

/**
 * The address the confirmation email returns to, on the given origin. The
 * host must be admitted by the Supabase project's redirect allowlist.
 */
export function signUpConfirmationRedirectUrl(origin: string): string {
  return new URL(SIGN_UP_CONFIRMATION_CALLBACK_PATH, origin).toString();
}
