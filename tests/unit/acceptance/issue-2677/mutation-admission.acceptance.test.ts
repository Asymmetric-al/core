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
