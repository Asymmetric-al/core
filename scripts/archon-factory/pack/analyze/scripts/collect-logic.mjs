// Pure helpers for the analysis collector: redaction and the packet budget.

const SECRETS = [
  /(ghp_|gho_|ghs_|ghu_|ghr_|github_pat_|sk-ant-)[A-Za-z0-9_-]+/g,
  /whsec_[A-Za-z0-9+/=_-]+/g,
  /(authorization["']?\s*[:=]\s*["']?)(bearer|token|basic)?\s*[^\s"',}]+/gi,
  /\bbearer\s+[A-Za-z0-9._~+/=-]+/gi,
];

export function redact(text) {
  return SECRETS.reduce(
    (value, pattern) =>
      value.replace(pattern, (match, prefix) =>
        typeof prefix === "string" && /authorization/i.test(prefix)
          ? `${prefix}[REDACTED]`
          : "[REDACTED]",
      ),
    text,
  );
}

// Keep whole excerpts, in order, while the serialized packet fits; the rest
// are dropped and reported, never cut mid-token.
export function boundPacket(evidence, limit) {
  const kept = [];
  for (const item of evidence) {
    if (JSON.stringify([...kept, item], null, 2).length > limit) break;
    kept.push(item);
  }
  return {
    packet: JSON.stringify(kept, null, 2),
    kept,
    dropped: evidence.slice(kept.length).map((item) => item.id),
  };
}
