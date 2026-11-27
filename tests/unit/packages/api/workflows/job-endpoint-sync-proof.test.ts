import { createHmac } from "node:crypto";

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const SIGNING_KEY = `signkey-test-${"0f".repeat(32)}`;
const RELEASE_PROOF = "made-up-release-proof-value";
const PRODUCTION = "https://admin.asymmetric.al";

type Sent = { url: string; body: unknown };

function jobService() {
  const sent: Sent[] = [];
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    sent.push({
      url,
      body: init?.body ? JSON.parse(String(init.body)) : null,
    });
    return Response.json({ ok: true, modified: true });
  });
  return { fetch, sent };
}

async function endpoint(env: Record<string, string | undefined> = {}) {
  vi.resetModules();
  const values: Record<string, string | undefined> = {
    INNGEST_SIGNING_KEY: SIGNING_KEY,
    INNGEST_SIGNING_KEY_FALLBACK: undefined,
    INNGEST_EVENT_KEY: "made-up-event-key",
    INNGEST_DEV: undefined,
    INNGEST_BASE_URL: undefined,
    INNGEST_API_BASE_URL: undefined,
    INNGEST_SERVE_ORIGIN: undefined,
    INNGEST_SERVE_PATH: undefined,
    INNGEST_ENABLE_UNAUTHED_SYNC: undefined,
    INNGEST_ALLOW_IN_BAND_SYNC: undefined,
    VERCEL_ENV: "production",
    VERCEL_TARGET_ENV: undefined,
    VERCEL_AUTOMATION_BYPASS_SECRET: RELEASE_PROOF,
    CORE_SERVE_UNDER_PATHS: undefined,
    CORE_APP_BASE_PATH: undefined,
    ...env,
  };
  for (const [name, value] of Object.entries(values)) vi.stubEnv(name, value);
  const service = jobService();
  vi.stubGlobal("fetch", service.fetch);
  const handlers =
    await import("../../../../../packages/api/src/workflows/serve");
  return { ...handlers, sent: service.sent };
}

function request(
  method: string,
  url: string,
  headers: Record<string, string> = {},
  body?: string,
) {
  return new NextRequest(url, { method, headers, body });
}

function sign(body: string) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const key = SIGNING_KEY.replace(/^signkey-\w+-/, "");
  const s = createHmac("sha256", key).update(body).update(ts).digest("hex");
  return `t=${ts}&s=${s}`;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const ON = { CORE_SERVE_UNDER_PATHS: "1", CORE_APP_BASE_PATH: "/admin" };

describe("the job endpoint starts a sync only on proof (AL-2671)", () => {
  it.each([
    ["off, on the project's own name", {}, `${PRODUCTION}/api/inngest`, {}],
    [
      "off, with a query",
      {},
      `${PRODUCTION}/api/inngest?caller=query&deployId=made-up`,
      {},
    ],
    [
      "on, on the project's own name",
      ON,
      `${PRODUCTION}/admin/api/inngest`,
      {},
    ],
    [
      "on, on an operations name",
      ON,
      "https://ops.example.test/admin/api/inngest?caller=query",
      { host: "ops.example.test" },
    ],
    [
      "on, stamped on an organization's name",
      ON,
      "https://org.example.test/admin/api/inngest",
      {
        host: "org.example.test",
        "x-asym-name-tenant": "00000000-0000-0000-0000-000000000001",
        "x-asym-role-class": "staff",
      },
    ],
    [
      "asking for an in-band sync without a signature",
      {},
      `${PRODUCTION}/api/inngest`,
      { "x-inngest-sync-kind": "in_band" },
    ],
    [
      "with a wrong release proof",
      {},
      `${PRODUCTION}/api/inngest`,
      { "x-vercel-protection-bypass": "not-the-release-proof" },
    ],
  ])(
    "refuses a PUT without proof (%s), and calls out to no one",
    async (_label, env, url, headers) => {
      const { PUT, sent } = await endpoint(env);
      const response = await PUT(request("PUT", url, headers));
      expect([401, 403]).toContain(response.status);
      expect(sent).toEqual([]);
    },
  );

  it.each([
    ["off", {}, `${PRODUCTION}/api/inngest`],
    ["on", ON, `${PRODUCTION}/admin/api/inngest`],
  ])(
    "syncs the release's proven PUT (%s) at the configured origin and path, never the request's host or query",
    async (_label, env, registered) => {
      const { PUT, sent } = await endpoint(env);
      const response = await PUT(
        request(
          "PUT",
          "https://elsewhere.example.test/api/inngest?caller=query&deployId=made-up",
          {
            host: "elsewhere.example.test",
            "x-vercel-protection-bypass": RELEASE_PROOF,
          },
        ),
      );
      expect(response.status).toBe(200);
      expect(sent).toHaveLength(1);
      const [{ url, body }] = sent;
      expect(new URL(url).pathname).toBe("/fn/register");
      const sync = body as {
        url: string;
        deployId?: string;
        functions: Array<{
          steps: Record<string, { runtime: { url: string } }>;
        }>;
      };
      expect(sync.url).toBe(registered);
      expect(sync.deployId).toBeUndefined();
      for (const fn of sync.functions)
        for (const step of Object.values(fn.steps)) {
          const stepUrl = new URL(step.runtime.url);
          expect(`${stepUrl.origin}${stepUrl.pathname}`).toBe(registered);
          expect([...stepUrl.searchParams.keys()].sort()).toEqual([
            "fnId",
            "stepId",
          ]);
        }
    },
  );

  it.each([
    ["a preview deployment", { VERCEL_ENV: "preview" }],
    [
      "the development site (a custom environment)",
      { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "core-development" },
    ],
    ["local development", { VERCEL_ENV: "development" }],
    ["a deployment that names no environment", { VERCEL_ENV: undefined }],
  ])(
    "refuses the release's proven PUT on %s with no origin configured, and never falls back to the request's host",
    async (_label, env) => {
      const { PUT, sent } = await endpoint(env);
      const response = await PUT(
        request("PUT", `${PRODUCTION}/api/inngest`, {
          host: "admin.asymmetric.al",
          "x-vercel-protection-bypass": RELEASE_PROOF,
        }),
      );
      expect(response.status).toBe(503);
      expect(sent).toEqual([]);
    },
  );

  it("never registers production's origin from a deployment that is not production, even when configured with it", async () => {
    const { PUT, sent } = await endpoint({
      VERCEL_ENV: "preview",
      VERCEL_TARGET_ENV: "core-development",
      INNGEST_SERVE_ORIGIN: PRODUCTION,
    });
    const response = await PUT(
      request("PUT", `${PRODUCTION}/api/inngest`, {
        "x-vercel-protection-bypass": RELEASE_PROOF,
      }),
    );
    expect(response.status).toBe(503);
    expect(sent).toEqual([]);
  });

  it.each([
    "http://elsewhere.example.test",
    "https://admin.example.test/x",
    "not an origin",
  ])(
    "refuses a configured origin that is not a canonical origin (%s)",
    async (origin) => {
      const { PUT, sent } = await endpoint({
        VERCEL_ENV: "preview",
        INNGEST_SERVE_ORIGIN: origin,
      });
      const response = await PUT(
        request("PUT", `${PRODUCTION}/api/inngest`, {
          "x-vercel-protection-bypass": RELEASE_PROOF,
        }),
      );
      expect(response.status).toBe(503);
      expect(sent).toEqual([]);
    },
  );

  it("takes production's origin from the release's own admin host, so the two cannot drift", async () => {
    const { PRODUCTION_ADMIN_ORIGIN } =
      await import("../../../../../packages/api/src/workflows/sync-proof");
    const { PRODUCTION_HOSTS } =
      await import("../../../../../scripts/release/vercel-release.mjs");
    expect(PRODUCTION_ADMIN_ORIGIN).toBe(`https://${PRODUCTION_HOSTS.admin}`);
  });

  it("registers the origin a deployment is configured with", async () => {
    const { PUT, sent } = await endpoint({
      VERCEL_ENV: "preview",
      INNGEST_SERVE_ORIGIN: "https://admin-preview.example.test",
    });
    const response = await PUT(
      request("PUT", `${PRODUCTION}/api/inngest`, {
        "x-vercel-protection-bypass": RELEASE_PROOF,
      }),
    );
    expect(response.status).toBe(200);
    expect((sent[0]!.body as { url: string }).url).toBe(
      "https://admin-preview.example.test/api/inngest",
    );
  });

  it("answers the job service's signed in-band sync, as today (guard)", async () => {
    const { PUT, sent } = await endpoint();
    const body = JSON.stringify({ url: `${PRODUCTION}/api/inngest` });
    const response = await PUT(
      request(
        "PUT",
        `${PRODUCTION}/api/inngest`,
        {
          "content-type": "application/json",
          "x-inngest-sync-kind": "in_band",
          "x-inngest-signature": sign(body),
        },
        body,
      ),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("x-inngest-sync-kind")).toBe("in_band");
    expect(sent).toEqual([]);
  });

  it("runs a signed execution POST, as today (guard)", async () => {
    const { POST, sent } = await endpoint();
    const envelope = {
      dispatchRequestId: "22222222-2222-4222-8222-222222222222",
      schemaVersion: 1,
      subject: { id: "smoke-1", type: "workflow_smoke" },
      tenantId: "11111111-1111-4111-8111-111111111111",
      workflowName: "workflows/smoke.requested",
    };
    const event = { data: envelope, name: "workflows/smoke.requested" };
    const body = JSON.stringify({
      ctx: {
        attempt: 0,
        disable_immediate_execution: false,
        run_id: "01JRUNFIXTURE000000000000",
        stack: { current: 0, stack: [] },
        use_api: false,
      },
      event,
      events: [event],
      steps: {},
      version: 1,
    });
    const response = await POST(
      request(
        "POST",
        `${PRODUCTION}/api/inngest?fnId=asym-core-workflows-workflow-smoke&stepId=step`,
        {
          "content-type": "application/json",
          "x-inngest-signature": sign(body),
        },
        body,
      ),
    );
    expect([200, 206]).toContain(response.status);
    expect(await response.text()).toContain(envelope.dispatchRequestId);
    expect(sent).toEqual([]);
  });

  it("refuses an unsigned POST and an unsigned GET in cloud mode, as today (guard)", async () => {
    const { POST, GET, sent } = await endpoint();
    const post = await POST(
      request(
        "POST",
        `${PRODUCTION}/api/inngest?fnId=asym-core-workflows-workflow-smoke&stepId=step`,
        { "content-type": "application/json" },
        JSON.stringify({ event: {}, events: [], steps: {}, ctx: {} }),
      ),
    );
    expect(post.status).toBe(401);
    const get = await GET(request("GET", `${PRODUCTION}/api/inngest`));
    expect(get.status).toBe(401);
    expect(sent).toEqual([]);
  });

  it("still syncs in local development, where the dev server asks without a signature (guard)", async () => {
    const { PUT, sent } = await endpoint({
      INNGEST_DEV: "1",
      VERCEL_ENV: undefined,
      VERCEL_AUTOMATION_BYPASS_SECRET: undefined,
    });
    const response = await PUT(
      request("PUT", "http://127.0.0.1:3030/api/inngest", {
        host: "127.0.0.1:3030",
      }),
    );
    expect(response.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(new URL(sent[0]!.url).pathname).toBe("/fn/register");
  });
});
