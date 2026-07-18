const REDACTION_VERSION = "eve-audit-v1" as const;
const REDACTED = "[redacted]";
const MAX_DEPTH = 6;
const MAX_ARRAY_ITEMS = 50;
const MAX_OBJECT_KEYS = 100;
const MAX_STRING_LENGTH = 2_000;

const SENSITIVE_KEY_PATTERN =
  /(?:authorization|bearer|cookie|credential|password|secret|token|api.?key|private.?key|service.?role|otp|one.?time|passcode|verification.?code|cvv|cvc|card|routing|bank|account.?number|payment|email|phone|address|donor|customer|first.?name|last.?name|full.?name|raw.?reason|chain.?of.?thought|hidden.?reason|transcript|prompt|response|request.?body)/i;
const AUTHORITATIVE_KEY_PATTERN =
  /^(?:actor|actorId|actor_id|identityMode|identity_mode|initiator|initiatorId|initiator_id|policy|result)$/i;

const SECRET_VALUE_PATTERNS: Array<[RegExp, string]> = [
  [
    /\b(password|secret|token|api.?key|private.?key|cookie|authorization)\s*[:=]\s*[^\s,;]+/gi,
    "$1: [redacted]",
  ],
  [/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]"],
  [/\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9_-]+\b/g, "[redacted-key]"],
  [/\bgh[oprsu]_[A-Za-z0-9_]{20,}\b/g, "[redacted-token]"],
  [/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted-jwt]"],
  [
    /\b(?:otp|one[- ]?time(?: password| code)?|passcode|verification code)\s*[:=#-]?\s*\d{4,8}\b/gi,
    "[redacted-one-time-code]",
  ],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]"],
  [/\+?\d(?:[(). -]*\d){9,14}\b/g, "[redacted-phone]"],
  [/\b(?:\d[ -]*?){13,19}\b/g, "[redacted-payment-number]"],
];

function replaceSensitiveStringValues(value: string): string {
  let sanitized = value;
  for (const [pattern, replacement] of SECRET_VALUE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

function sanitizeString(value: string): string {
  const sanitized = replaceSensitiveStringValues(value);

  if (sanitized.length > MAX_STRING_LENGTH) {
    return `${sanitized.slice(0, MAX_STRING_LENGTH)}…[truncated]`;
  }

  return sanitized;
}

/** Redact a bounded artifact body without applying audit-summary truncation. */
export function redactEveArtifactText(value: string): string {
  return replaceSensitiveStringValues(value);
}

export function redactEveAuditValue(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) {
    return "[depth-limited]";
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (
    value === null ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => redactEveAuditValue(item, depth + 1));
  }

  if (typeof value !== "object") {
    return String(value);
  }

  const entries = Object.entries(value as Record<string, unknown>).slice(
    0,
    MAX_OBJECT_KEYS,
  );

  return Object.fromEntries(
    entries.map(([key, childValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) || AUTHORITATIVE_KEY_PATTERN.test(key)
        ? REDACTED
        : redactEveAuditValue(childValue, depth + 1),
    ]),
  );
}

export function summarizeEveAuditValue(value: unknown): string {
  const redacted = redactEveAuditValue(value);
  if (typeof redacted === "string") {
    return redacted;
  }

  return JSON.stringify(redacted);
}

export function getEveAuditRedactionVersion(): typeof REDACTION_VERSION {
  return REDACTION_VERSION;
}
