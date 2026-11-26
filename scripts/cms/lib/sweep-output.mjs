import { redact } from "../../release/lib/postgres.mjs";

export function scrubbed(text, secrets = []) {
  let out = String(text ?? "");
  for (const secret of secrets) {
    if (secret) out = out.split(secret).join("[redacted]");
  }
  return redact(out);
}

export function sweepOutput(result, secrets = []) {
  return [result.stdout, result.stderr]
    .flatMap((stream) => String(stream ?? "").split("\n"))
    .map((line) => scrubbed(line, secrets).trimEnd())
    .filter(Boolean);
}
