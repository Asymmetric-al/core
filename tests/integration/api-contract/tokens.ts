/**
 * #2708: HS256 tokens minted for one run of the API contract check. The
 * secret is random per run (scripts/api-contract/stack.mjs) and never
 * printed; these tokens only ever reach the run's own PostgREST.
 */
import { createHmac } from "node:crypto";

export type JwtClaims = Record<string, unknown>;

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

/** PostgREST refuses HS256 secrets shorter than 32 characters. */
export function mintToken(
  claims: JwtClaims,
  secret: string,
  options: { now?: number; ttlSeconds?: number } = {},
): string {
  if (secret.length < 32)
    throw new Error("JWT secret must be at least 32 characters");
  const now = options.now ?? Math.floor(Date.now() / 1000);
  const body = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    ...claims,
    iat: now,
    exp: now + (options.ttlSeconds ?? 3600),
  })}`;
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}

export type AuthUserRow = {
  id: string;
  email: string | null;
  raw_app_meta_data: Record<string, unknown> | null;
  raw_user_meta_data: Record<string, unknown> | null;
};

/**
 * The access-token claims GoTrue issues for an `auth.users` row: `app_metadata`
 * and `user_metadata` come from the row's raw metadata, which is where
 * `authz.current_tenant_id()` reads `app_metadata.tenant_id`.
 */
export function claimsForAuthUser(user: AuthUserRow): JwtClaims {
  return {
    sub: user.id,
    role: "authenticated",
    aud: "authenticated",
    email: user.email ?? "",
    app_metadata: user.raw_app_meta_data ?? {},
    user_metadata: user.raw_user_meta_data ?? {},
    aal: "aal1",
    is_anonymous: false,
  };
}
