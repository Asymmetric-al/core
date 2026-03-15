import { ApiHttpError } from "../shared/http-errors";

export function resolveRequiredIdempotencyKey(headers: Headers): string {
  const headerValue =
    headers.get("idempotency-key") ?? headers.get("x-idempotency-key");
  const idempotencyKey = headerValue?.trim() ?? "";
  if (idempotencyKey.length > 0) {
    return idempotencyKey;
  }

  throw new ApiHttpError(400, "Missing required idempotency-key header");
}
