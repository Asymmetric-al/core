/**
 * How a screen that asks Supabase Auth to email an address (password
 * recovery, registration) reads Auth's answer, so that the answer never shows
 * whether the address has an account (plan 5.4). Client-safe.
 *
 * Auth answers some requests differently for an address with an account:
 * - Recovery for an unknown address succeeds and sends nothing, while a known
 *   address asked again within the email frequency (one minute on the hosted
 *   projects) gets a rate-limit error.
 * - Registration of an address whose account is confirmed succeeds and sends
 *   nothing, while an unconfirmed one is sent its link again, and so can hit
 *   the same rate limit.
 * - On a project still using the built-in mailer, a send to an address outside
 *   the project's team is refused, and Auth sends only for known addresses.
 * Shown as they are, those answers would tell anyone who has an account in
 * two requests. So every one of them reads as sent, and the screen's message
 * says how to ask again if nothing arrives.
 *
 * Auth's own endpoint still answers differently to a caller who uses the
 * public key directly; only Supabase can change that.
 */

/** Refusals that only an address with an account can produce. */
const KNOWN_ADDRESS_CODES: ReadonlySet<string> = new Set([
  "over_email_send_rate_limit",
  "email_address_not_authorized",
  "user_already_exists",
  "email_exists",
]);

/**
 * True when the screen must answer "sent": no error, any rate limit, or a
 * refusal that only an address with an account can produce.
 */
export function answerReadsAsSent(error: unknown): boolean {
  if (error === null || error === undefined) {
    return true;
  }
  if (typeof error !== "object") {
    return false;
  }

  const { status, code } = error as { status?: unknown; code?: unknown };
  return (
    status === 429 ||
    (typeof code === "string" && KNOWN_ADDRESS_CODES.has(code))
  );
}
