import { gunzipSync } from "node:zlib";

import { afterEach, describe, expect, it, vi } from "vitest";

import { RUN } from "./fixtures/factory-fixture";
import { ENVIRONMENT, harness } from "./fixtures/harness";
import { GET, POST } from "../src/app/api/console/[...path]/route";
import { dispatch } from "../src/server/api";

const origin = ENVIRONMENT.CONSOLE_ORIGIN;
const auth = `Basic ${Buffer.from(`${ENVIRONMENT.CONSOLE_OWNER}:${ENVIRONMENT.CONSOLE_PASSWORD}`).toString("base64")}`;

function configure() {
  for (const [key, value] of Object.entries({
    ...ENVIRONMENT,
    // A nonexistent CLI proves no process is needed for these paths.
    FACTORY_ARCHON_CLI: "/nonexistent/archon",
    FACTORY_CONTROL_SCRIPT: "/nonexistent/control.mjs",
  }))
    vi.stubEnv(key, value);
}

function post(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return new Request(`${origin}/api/console/${path}`, {
    method: "POST",
    headers: {
      authorization: auth,
      origin,
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("closed BFF boundary", () => {
  it("rejects unauthenticated reads and cross-origin writes before touching any backend", async () => {
    configure();
    const transport = vi.fn();
    vi.stubGlobal("fetch", transport);
    expect(
      (await GET(new Request(`${origin}/api/console/snapshot`))).status,
    ).toBe(401);
    expect(
      (
        await POST(
          post("request-ids", {}, { origin: "https://attacker.invalid" }),
        )
      ).status,
    ).toBe(403);
    expect(transport).not.toHaveBeenCalled();
  });

  it("mints a signed request id for an authenticated same-origin click", async () => {
    configure();
    const response = await POST(post("request-ids", {}));
    expect(response.status).toBe(200);
    expect((await response.json()).requestId).toMatch(/^cr-/);
  });

  it("rejects unknown operations, forged ids and oversized bodies", async () => {
    configure();
    expect(
      (await POST(post("runs/run-1/hold", { requestId: "x" }))).status,
    ).toBe(404);
    const forged = await POST(
      post("controls", {
        requestId: "cr-forged0-0000000000000000-0000000000000000",
        action: { kind: "factory", action: "pause-intake" },
      }),
    );
    expect(forged.status).toBe(400);
    expect((await forged.json()).error).toContain("not issued");
    const invalid = await POST(
      post("controls", {
        requestId: "cr-x",
        action: { kind: "factory", action: "explode" },
      }),
    );
    expect(invalid.status).toBe(400);
    const large = await POST(
      post("chat/ask", {
        requestId: "x",
        conversation: null,
        question: "a".repeat(50_000),
      }),
    );
    expect(large.status).toBe(413);
  });

  it("reports an unreachable factory CLI as unavailable instead of failing the page", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("down", { status: 503 })),
    );
    const response = await GET(
      new Request(`${origin}/api/console/snapshot`, {
        headers: { authorization: auth },
      }),
    );
    expect(response.status).toBe(200);
    const snapshot = await response.json();
    expect(snapshot.factory).toMatchObject({
      state: "unavailable",
      reason: "The Archon CLI could not be started",
    });
    expect(snapshot.engine.state).toBe("unavailable");
    expect(JSON.stringify(snapshot)).not.toContain("/nonexistent");
  });
});

// Observed through the operator's tunnel on 12 November 2026 (about 13 KB/s):
// Next compresses pages and static files but not route handlers, so every
// snapshot poll sent 44.7 KB and took 7.6 seconds; gzipped it is 8.5 KB.
describe("API answers are compressed for a client that accepts gzip", () => {
  const read = (headers: Record<string, string> = {}) => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("down", { status: 503 })),
    );
    return GET(
      new Request(`${origin}/api/console/snapshot`, {
        headers: { authorization: auth, ...headers },
      }),
    );
  };

  it("gzips the snapshot and keeps it uncacheable", async () => {
    const response = await read({ "accept-encoding": "gzip, deflate, br" });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-encoding")).toBe("gzip");
    expect(response.headers.get("vary")).toMatch(/accept-encoding/i);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-type")).toMatch(/application\/json/);
    expect(response.headers.has("content-length")).toBe(false);
    const bytes = Buffer.from(await response.arrayBuffer());
    const snapshot = JSON.parse(gunzipSync(bytes).toString("utf8"));
    expect(snapshot.factory).toMatchObject({ state: "unavailable" });
    const plain = Buffer.from(await (await read()).arrayBuffer());
    expect(bytes.length).toBeLessThan(plain.length);
  });

  it.each([
    [undefined],
    ["identity"],
    ["gzip;q=0"],
    ["br, deflate"],
    ["gzipped"],
  ])("sends plain JSON when Accept-Encoding is %j", async (accept) => {
    const response = await read(accept ? { "accept-encoding": accept } : {});
    expect(response.headers.get("content-encoding")).toBeNull();
    expect((await response.json()).factory).toMatchObject({
      state: "unavailable",
    });
  });

  it("leaves a refused request as it is", async () => {
    configure();
    const response = await GET(
      new Request(`${origin}/api/console/snapshot`, {
        headers: { "accept-encoding": "gzip" },
      }),
    );
    expect(response.status).toBe(401);
    expect(response.headers.get("content-encoding")).toBeNull();
  });
});

describe("dispatch over the factory seams", () => {
  it("mints, applies and reads back an issue control end to end", async () => {
    const { factory } = harness();
    const minted = await (
      await dispatch(post("request-ids", {}), factory)
    ).json();
    const response = await dispatch(
      post("controls", {
        requestId: minted.requestId,
        action: {
          kind: "issue",
          issue: 102,
          action: "hold",
          reason: "Check design",
        },
      }),
      factory,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      outcome: "applied",
      observed: { recorded: true },
    });
    const issue = await (
      await dispatch(new Request(`${origin}/api/console/issues/102`), factory)
    ).json();
    expect(issue.item.control).toBe("hold");
    const missing = await dispatch(
      new Request(`${origin}/api/console/issues/abc`),
      factory,
    );
    expect(missing.status).toBe(400);
  });

  it("requires confirmation for a cancel and serves run detail and chat", async () => {
    const { factory } = harness();
    const minted = await (
      await dispatch(post("request-ids", {}), factory)
    ).json();
    const unconfirmed = await dispatch(
      post("controls", {
        requestId: minted.requestId,
        action: { kind: "cancel-run", runId: RUN.review },
      }),
      factory,
    );
    expect(unconfirmed.status).toBe(400);
    const confirmed = await dispatch(
      post("controls", {
        requestId: minted.requestId,
        action: { kind: "cancel-run", runId: RUN.review },
        confirmed: true,
      }),
      factory,
    );
    expect((await confirmed.json()).outcome).toBe("applied");
    const detail = await (
      await dispatch(
        new Request(`${origin}/api/console/runs/${RUN.review}`),
        factory,
      )
    ).json();
    expect(detail.run.status).toBe("cancelled");
    const chat = await (
      await dispatch(new Request(`${origin}/api/console/chat`), factory)
    ).json();
    expect(chat.conversations).toHaveLength(1);
    const report = await dispatch(
      new Request(`${origin}/api/console/analysis/${RUN.analysis}`),
      factory,
    );
    expect((await report.json()).result.findings[0].material).toBe(true);
  });
});
