/**
 * Payload's secret (`PAYLOAD_SECRET`, declared in `packages/env`): required
 * outside local development and tests, where a fixed local value stands in.
 * Payload signs its own tokens with it, and the Web Studio tenant cookie
 * derives its signing key from it (`web-studio-tenant-cookie.ts`), so the two
 * always agree on one secret.
 */
export const LOCAL_PAYLOAD_SECRET = "payload-local-dev-secret";

export function resolvePayloadSecret(
  env: Readonly<Record<string, string | undefined>> = process.env,
): string {
  if (env.PAYLOAD_SECRET) {
    return env.PAYLOAD_SECRET;
  }

  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    return LOCAL_PAYLOAD_SECRET;
  }

  throw new Error(
    "PAYLOAD_SECRET must be configured outside local development.",
  );
}
