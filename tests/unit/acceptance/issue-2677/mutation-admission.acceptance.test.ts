import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy as admin } from "../../../../apps/admin/proxy";
import { proxy as donor } from "../../../../apps/donor/proxy";
import { proxy as missionary } from "../../../../apps/missionary/proxy";

const origin = "https://orchard-portal.example.test";
const request = (
  path: string,
  headers: Record<string, string>,
  body?: string,
) => new NextRequest(`${origin}${path}`, { method: "POST", headers, body });

it.each([
  "http://orchard.localhost:3030",
  "http://orchard-portal.localhost:3030",
])("honors the specific tenant host and port: %s", async (host) => {
  const write = (source: string) =>
    new NextRequest(`${host}/api/profile`, {
      method: "PATCH",
      headers: { origin: source, "content-type": "application/json" },
      body: "{}",
    });
  expect((await donor(write(host))).headers.get("x-middleware-next")).toBe("1");
  expect((await donor(write("http://another.localhost:3030"))).status).toBe(
    403,
  );
});

describe.each([admin, donor, missionary])(
  "mutation admission through each product proxy",
  (proxy) => {
    it("admits a zero-length POST stream but not an untyped payload", async () => {
      const write = (length: string, body: Uint8Array) =>
        new NextRequest(`${origin}/api/upload/image`, {
          method: "POST",
          headers: { origin, "content-length": length },
          body: new Blob([new Uint8Array(body)]),
        });
      const empty = write("0", new Uint8Array());
      expect(empty.body).not.toBeNull();
      expect((await proxy(empty)).headers.get("x-middleware-next")).toBe("1");
      expect((await proxy(write("1", Uint8Array.of(1)))).status).toBe(415);
    });

    it("uses the browser's request authority rather than Next's bind address", async () => {
      const target = "http://127.0.0.1:3030";
      const write = (source: string) =>
        new NextRequest(`${target}/api/profile`, {
          method: "POST",
          headers: {
            host: "127.0.0.1:3030",
            origin: source,
            "x-forwarded-host": "another.example.test",
            "content-type": "application/json",
          },
          body: "{}",
        });
      expect(
        (await proxy(write(target))).headers.get("x-middleware-next"),
      ).toBe("1");
      for (const other of [
        "http://localhost:3030",
        "http://another.example.test",
        "http://127.0.0.1:3031",
      ])
        expect((await proxy(write(other))).status).toBe(403);
    });

    it.each([
      [
        {
          origin: "https://other.example.test",
          "content-type": "application/json",
        },
        403,
      ],
      [{ origin: "null", "content-type": "application/json" }, 403],
      [{ cookie: "test=1", "content-type": "application/json" }, 403],
      [{ origin, "content-type": "text/plain" }, 415],
    ] as const)(
      "refuses the write before forwarding: %j",
      async (headers, status) => {
        const response = await proxy(
          request("/api/profile", { ...headers }, "{}"),
        );
        expect(response.status).toBe(status);
        expect(response.headers.has("x-middleware-next")).toBe(false);
      },
    );

    it.each([
      [
        "/api/profile",
        { origin, "content-type": "application/json; charset=utf-8" },
        "{}",
      ],
      [
        "/api/profile",
        { authorization: "Bearer caller", "content-type": "application/json" },
        "{}",
      ],
      ["/api/auth/signout", { "sec-fetch-site": "same-origin" }, undefined],
      [
        "/api/upload/image",
        { origin, "content-type": "multipart/form-data; boundary=piece" },
        "--piece--",
      ],
      ["/api/webhooks/stripe", { "content-type": "application/json" }, "{}"],
    ] as const)(
      "passes the supported transport to its handler: %s",
      async (path, headers, body) => {
        const response = await proxy(request(path, { ...headers }, body));
        expect(response.headers.get("x-middleware-next")).toBe("1");
      },
    );
  },
);
