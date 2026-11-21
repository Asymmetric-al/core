import { createServer } from "node:http";
import { connect, type AddressInfo } from "node:net";

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

it("admits only Web Studio's same-origin POST-as-GET form transport", async () => {
  const path = "/web-studio/api/media";
  const form = { origin, "content-type": "application/x-www-form-urlencoded" };
  const override = { "X-Payload-HTTP-Method-Override": "GET" };
  expect(
    (
      await admin(request(path, { ...form, ...override }, "depth=0"))
    ).headers.get("x-middleware-next"),
  ).toBe("1");
  expect((await admin(request(path, form, "depth=0"))).status).toBe(415);
  expect(
    (await admin(request("/api/profile", { ...form, ...override }, "depth=0")))
      .status,
  ).toBe(415);
  expect(
    (
      await admin(
        request(
          path,
          { ...form, ...override, origin: "https://other.example.test" },
          "depth=0",
        ),
      )
    ).status,
  ).toBe(403);
});

it("gives a write with neither length nor transfer encoding no body on Node's HTTP/1.1 server", async () => {
  // Next serves through Node's HTTP/1.1 server. A request with neither
  // header has no body (RFC 9112, section 6.3): what follows its headers is
  // parsed as the next request and refused, so no route ever reads an untyped
  // body the header rule above admitted.
  let bodyBytes: Promise<number> | undefined;
  const server = createServer((incoming, response) => {
    bodyBytes = (async () => {
      let total = 0;
      for await (const chunk of incoming) total += (chunk as Buffer).length;
      return total;
    })();
    void bodyBytes.then(() => response.end());
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    const reply = await new Promise<string>((resolve, reject) => {
      const socket = connect(port, "127.0.0.1");
      let text = "";
      socket.on("data", (chunk) => (text += chunk.toString("latin1")));
      socket.on("close", () => resolve(text));
      socket.on("error", reject);
      socket.end(
        `DELETE /api/profile HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\n` +
          `Origin: http://127.0.0.1:${port}\r\n\r\n{"smuggled":true}`,
      );
    });
    expect(bodyBytes).toBeDefined();
    expect(await bodyBytes).toBe(0);
    expect(reply).toContain("HTTP/1.1 400 Bad Request");
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

it("returns the Payload error envelope on Studio admission refusals", async () => {
  for (const [source, status, message] of [
    [
      "https://other.example.test",
      403,
      "Web Studio only accepts changes made from Web Studio itself.",
    ],
    [origin, 415, "Unsupported mutation content type."],
  ] as const) {
    const refusal = await admin(
      request("/web-studio/api/pages", {
        origin: source,
        "content-type": "text/plain",
      }),
    );
    expect(refusal.status).toBe(status);
    expect(await refusal.json()).toEqual({ errors: [{ message }] });
  }
});

describe.each([admin, donor, missionary])(
  "mutation admission through each product proxy",
  (proxy) => {
    it.each(["POST", "PUT", "PATCH", "DELETE"])(
      "admits an empty %s stream with omitted or zero length",
      async (method) => {
        for (const framing of [
          new Headers(),
          new Headers({ "content-length": "0" }),
        ]) {
          framing.set("origin", origin);
          const empty = new NextRequest(`${origin}/api/profile`, {
            method,
            headers: framing,
            body: new Blob([]),
          });
          expect(empty.body).not.toBeNull();
          expect((await proxy(empty)).headers.get("x-middleware-next")).toBe(
            "1",
          );
        }
      },
    );

    // The ruling on F13 (21 November 2026): an untyped write is empty by its
    // framing headers alone, whatever body stream Next hands the proxy (it
    // hands one to every write). With neither header, HTTP/1.1 gives the
    // request no body: the Node server case below.
    it.each(["POST", "PUT", "PATCH", "DELETE"])(
      "judges an untyped %s empty by its framing headers alone",
      async (method) => {
        const write = (headers: Record<string, string>) =>
          new NextRequest(`${origin}/api/profile`, {
            method,
            headers: { origin, ...headers },
            body: new Blob(["value"]),
          });
        expect((await proxy(write({}))).headers.get("x-middleware-next")).toBe(
          "1",
        );
        for (const framing of [
          { "transfer-encoding": "chunked" },
          { "content-length": "5" },
          { "content-length": "0", "transfer-encoding": "chunked" },
        ])
          expect((await proxy(write(framing))).status).toBe(415);
      },
    );

    it("refuses a foreign write addressed by an encoded API segment", async () => {
      const response = await proxy(
        request(
          "/%61pi/profile",
          {
            origin: "https://other.example.test",
            "content-type": "text/plain",
          },
          "test",
        ),
      );
      expect(response.status).toBe(403);
      expect(response.headers.has("x-middleware-next")).toBe(false);
    });

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
