import { describe, expect, it } from "vitest";

import { authorize, configuration } from "../src/server/security";

const environment = {
  CONSOLE_ORIGIN: "http://127.0.0.1:3092",
  CONSOLE_OWNER: "owner",
  CONSOLE_PASSWORD: "fixture-password-not-a-real-secret",
  ARCHON_URL: "http://127.0.0.1:39192",
  ARCHON_CODEBASE_ID: "core-project",
  ARCHON_STORE_ID: "fixture-store",
};
const credentials = `Basic ${Buffer.from(`owner:${environment.CONSOLE_PASSWORD}`).toString("base64")}`;

describe("owner boundary", () => {
  it("accepts Next loopback normalization only with an exact original Host", () => {
    const config = configuration(environment);
    const request = (host: string, url = "http://localhost:3092") =>
      new Request(url, {
        headers: {
          authorization: credentials,
          host,
          "x-forwarded-host": "127.0.0.1:3092",
        },
      });
    expect(authorize(request("127.0.0.1:3092"), config)).toBeNull();
    expect(authorize(request("attacker.invalid:3092"), config)?.status).toBe(
      403,
    );
    expect(authorize(request("127.0.0.1:3093"), config)?.status).toBe(403);
    expect(
      authorize(request("127.0.0.1:3092", "http://localhost:3093"), config)
        ?.status,
    ).toBe(403);
    expect(
      authorize(
        request("127.0.0.1:3092", "http://attacker.invalid:3092"),
        config,
      )?.status,
    ).toBe(403);
  });
  it("fails closed without complete instance configuration", () => {
    expect(() => configuration({})).toThrow();
    expect(() =>
      configuration({ ...environment, ARCHON_URL: "https://example.com" }),
    ).toThrow();
  });
  it("authenticates every read and rejects cross-origin writes", () => {
    const config = configuration(environment);
    expect(
      authorize(new Request(environment.CONSOLE_ORIGIN), config)?.status,
    ).toBe(401);
    expect(
      authorize(
        new Request(environment.CONSOLE_ORIGIN, {
          headers: { authorization: credentials },
        }),
        config,
      ),
    ).toBeNull();
    expect(
      authorize(
        new Request(environment.CONSOLE_ORIGIN, {
          method: "POST",
          headers: {
            authorization: credentials,
            origin: "https://attacker.invalid",
          },
        }),
        config,
      )?.status,
    ).toBe(403);
  });
});
