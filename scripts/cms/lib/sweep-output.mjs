import { redact } from "../../release/lib/postgres.mjs";

function spellings(secret) {
  const forms = [secret, encodeURIComponent(secret)];
  try {
    forms.push(
      new URL(`postgresql://u:${encodeURIComponent(secret)}@h/d`).password,
    );
  } catch {
    forms.push(secret);
  }
  return [...new Set(forms)].sort((a, b) => b.length - a.length);
}

export function scrubbed(text, secrets = []) {
  let out = String(text ?? "");
  for (const secret of secrets) {
    if (!secret) continue;
    for (const form of spellings(secret)) {
      out = out.split(form).join("[redacted]");
    }
  }
  return redact(out);
}

export function sweepOutput(result, secrets = []) {
  return [result.stdout, result.stderr]
    .flatMap((stream) => String(stream ?? "").split("\n"))
    .map((line) => scrubbed(line, secrets).trimEnd())
    .filter(Boolean);
}
