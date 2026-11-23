const KNOWN_ADDRESS_CODES: ReadonlySet<string> = new Set([
  "over_email_send_rate_limit",
  "email_address_not_authorized",
  "user_already_exists",
  "email_exists",
]);

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
