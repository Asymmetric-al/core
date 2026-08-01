/**
 * Evidence minimization for operator output and durable proofs.
 *
 * The proof must establish reliance without copying donor PII, document
 * bodies, payment data, credentials, or full object keys. External URLs keep
 * only their origin; object keys keep only the bucket and first path segment;
 * free-text failure messages are stripped of query strings, emails, and
 * anything resembling a secret.
 */

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const BEARER_PATTERN = /(bearer|token|key|secret|password)[=:\s][^\s&"']+/gi;

export function redactExternalReference(reference: string): string {
  const trimmed = reference.trim();

  try {
    const url = new URL(trimmed);
    return `${url.origin}/…`;
  } catch {
    // Not a URL: treat as a storage object key, keep bucket + first segment.
    const segments = trimmed.split("/").filter(Boolean);
    if (segments.length <= 1) {
      return segments[0] ?? "(unnamed reference)";
    }
    return `${segments[0]}/${segments[1]}/…`;
  }
}

export function redactDiagnosticText(text: string): string {
  return text
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(BEARER_PATTERN, "[redacted-credential]")
    .replace(/\?[^\s"']*/g, "?[redacted-query]")
    .slice(0, 500);
}
