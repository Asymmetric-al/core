import { createHmac } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import {
  JWT_AUTH_VERSION,
  JWTAuthentication,
  jwtSign,
} from "../../../apps/admin/node_modules/payload/dist/index.js";

import type { Payload } from "payload";

const secret = "public-v4-compatibility-test-secret";
const userFields = {
  id: 1,
  collection: "cms-users",
  email: "compatibility@example.invalid",
};

function previousFormatToken(authVersion?: number) {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT",
    ...(authVersion === undefined ? {} : { authVersion }),
  };
  const signingInput = `${encode(header)}.${encode({
    ...userFields,
    iat: now,
    exp: now + 60,
  })}`;
  const signature = createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

function authenticationFixture(disableLocalStrategy = false) {
  const findByID = vi.fn(async () => ({ ...userFields }));
  // The successful-token case also validates this deliberately partial storage fixture.
  const payload = {
    config: {
      admin: {},
      auth: { jwtOrder: ["Bearer"] },
      cookiePrefix: "payload",
      csrf: [],
    },
    encryptionKeyring: { all: [{ legacyKey: secret }] },
    collections: {
      "cms-users": {
        config: {
          slug: "cms-users",
          auth: {
            depth: 0,
            disableLocalStrategy,
            useSessions: false,
            verify: false,
          },
        },
      },
    },
    findByID,
  } as unknown as Payload;
  const authenticate = (token: string) =>
    JWTAuthentication({
      payload,
      headers: new Headers({
        Authorization: `Bearer ${token}`,
        DisableAutologin: "true",
      }),
    });
  return { authenticate, findByID };
}

describe("public Payload JWT compatibility", () => {
  it("rejects a correctly signed legacy token before reading an identity", async () => {
    const fixture = authenticationFixture();
    expect(await fixture.authenticate(previousFormatToken())).toEqual({
      user: null,
    });
    expect(fixture.findByID).not.toHaveBeenCalled();
  });

  it("rejects an unsupported protected authentication version", async () => {
    const fixture = authenticationFixture();
    expect(
      await fixture.authenticate(previousFormatToken(JWT_AUTH_VERSION + 1)),
    ).toEqual({ user: null });
    expect(fixture.findByID).not.toHaveBeenCalled();
  });

  it("authenticates the public SDK token when a local strategy is enabled", async () => {
    const fixture = authenticationFixture();
    const { token } = await jwtSign({
      fieldsToSign: userFields,
      secret,
      tokenExpiration: 60,
    });
    const encodedHeader = token.split(".")[0];
    if (!encodedHeader) throw new Error("The SDK returned an empty JWT header");
    const header: unknown = JSON.parse(
      Buffer.from(encodedHeader, "base64url").toString("utf8"),
    );
    expect(header).toEqual(
      expect.objectContaining({ authVersion: JWT_AUTH_VERSION }),
    );
    expect(await fixture.authenticate(token)).toEqual({
      user: { ...userFields, _strategy: "local-jwt" },
    });
    expect(fixture.findByID).toHaveBeenCalledOnce();
    expect(fixture.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, collection: "cms-users" }),
    );
  });

  it("keeps even a current JWT from bypassing Core's disabled local strategy", async () => {
    const fixture = authenticationFixture(true);
    const { token } = await jwtSign({
      fieldsToSign: userFields,
      secret,
      tokenExpiration: 60,
    });
    expect(await fixture.authenticate(token)).toEqual({ user: null });
    expect(fixture.findByID).not.toHaveBeenCalled();
  });
});
