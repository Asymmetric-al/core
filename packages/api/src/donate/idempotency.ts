import { ApiHttpError } from "../shared/http-errors";

export function parseRequiredIdempotencyKey(headers: Headers): string | null {
  const headerValue =
    headers.get("idempotency-key") ?? headers.get("x-idempotency-key");
  const idempotencyKey = headerValue?.trim() ?? "";
  return idempotencyKey.length > 0 ? idempotencyKey : null;
}

export function resolveRequiredIdempotencyKey(headers: Headers): string {
  const idempotencyKey = parseRequiredIdempotencyKey(headers);
  if (idempotencyKey) {
    return idempotencyKey;
  }

  throw new ApiHttpError(400, "Missing required idempotency-key header");
}
