/**
 * #2708: tokens minted for the run. They must be HS256 JWTs PostgREST accepts
 * and carry the claims GoTrue issues for an auth.users row. Pure.
 */
import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { claimsForAuthUser, mintToken } from "./tokens";

const SECRET = "a-test-secret-that-is-at-least-32-chars";

function decode(token: string) {
  const [header, payload, signature] = token.split(".");
  return {
    header: JSON.parse(Buffer.from(header!, "base64url").toString()),
    payload: JSON.parse(Buffer.from(payload!, "base64url").toString()),
    signature,
    signed: `${header}.${payload}`,
  };
}

describe("mintToken", () => {
  it("signs an HS256 JWT over base64url header and payload", () => {
    const token = mintToken({ role: "service_role" }, SECRET, {
      now: 1_700_000_000,
    });
    const parts = decode(token);
    expect(parts.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(parts.payload).toEqual({
      role: "service_role",
      iat: 1_700_000_000,
      exp: 1_700_003_600,
    });
    expect(parts.signature).toBe(
      createHmac("sha256", SECRET).update(parts.signed).digest("base64url"),
    );
  });

  it("refuses a short secret", () => {
    expect(() => mintToken({ role: "anon" }, "short")).toThrow(/32/);
  });
});

describe("claimsForAuthUser", () => {
  it("copies what GoTrue puts in an access token for the row", () => {
    expect(
      claimsForAuthUser({
        id: "11111111-1111-1111-1111-111111111111",
        email: "demo@example.test",
        raw_app_meta_data: { provider: "email", tenant_id: "t-1" },
        raw_user_meta_data: { full_name: "Demo" },
      }),
    ).toEqual({
      sub: "11111111-1111-1111-1111-111111111111",
      role: "authenticated",
      aud: "authenticated",
      email: "demo@example.test",
      app_metadata: { provider: "email", tenant_id: "t-1" },
      user_metadata: { full_name: "Demo" },
      aal: "aal1",
      is_anonymous: false,
    });
  });

  it("uses empty metadata objects when the row has none", () => {
    expect(
      claimsForAuthUser({
        id: "u",
        email: null,
        raw_app_meta_data: null,
        raw_user_meta_data: null,
      }),
    ).toMatchObject({ app_metadata: {}, user_metadata: {}, email: "" });
  });
});
