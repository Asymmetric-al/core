/**
 * Extracts a normalized (trimmed, lowercased) email address from a raw
 * header-style value like `"Display Name" <user@example.org>` or a bare
 * address. Returns null unless the candidate has exactly one `@` with a
 * non-empty local part and domain — malformed addresses must not silently
 * route email.
 */
export function extractEmailAddress(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) {
    return null;
  }

  const bracketMatch = trimmed.match(/<([^>]+)>/);
  const candidate = bracketMatch?.[1] ?? trimmed;
  const parts = candidate.split("@");

  if (parts.length !== 2) {
    return null;
  }

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) {
    return null;
  }

  return `${localPart}@${domainPart}`;
}
