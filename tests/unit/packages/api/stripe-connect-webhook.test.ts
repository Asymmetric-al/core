import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { createStripeClient } from "../../../../packages/api/src/stripe/client";
import { createStripeConnectWebhookHandler } from "../../../../packages/api/src/stripe/connect-webhook";
import { proxy as adminProxy } from "../../../../apps/admin/proxy";

const REPO_ROOT = path.resolve(
  new URL("../../../../", import.meta.url).pathname,
);
const WEBHOOK_SECRET = "whsec_wp8a_connect_test_secret";
const stripeHelper = createStripeClient("sk_test_dummy");

function signPayload(
  payload: Record<string, unknown>,
  secret = WEBHOOK_SECRET,
) {
  const rawBody = JSON.stringify(payload);
  const signature = stripeHelper.webhooks.generateTestHeaderString({
    payload: rawBody,
    secret,
  });
  return { rawBody, signature };
}

function makeWebhookRequest(
  rawBody: string,
  signature?: string,
  url = "https://admin.asymmetric.al/api/webhooks/stripe-connect",
) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (signature !== undefined) {
    headers["stripe-signature"] = signature;
  }
  return new NextRequest(url, {
    method: "POST",
    headers,
    body: rawBody,
  });
}

function createFakeAdminClient(options: {
  accounts: Array<{
    tenant_id: string;
    provider_account_id: string;
    livemode: boolean;
  }>;
  rpcResults?: Record<string, unknown>;
  failApply?: boolean;
}) {
  const storedEvents: Array<Record<string, unknown>> = [];
  const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  let idSeq = 0;

  const client = {
    from: (table: string) => {
      if (table === "payment_provider_accounts") {
        let filtered = [...options.accounts];
        const query = {
          select: () => query,
          eq: (col: string, val: unknown) => {
            filtered = filtered.filter(
              (row) => (row as Record<string, unknown>)[col] === val,
            );
            return query;
          },
          maybeSingle: async () => ({ data: filtered[0] ?? null, error: null }),
        };
        return query;
      }
      if (table === "stripe_raw_events") {
        return {
          insert: (row: Record<string, unknown>) => ({
            select: () => ({
              single: async () => {
                const duplicate = storedEvents.find(
                  (e) => e.stripe_event_id === row.stripe_event_id,
                );
                if (duplicate) {
                  return {
                    data: null,
                    error: {
                      code: "23505",
                      message: "duplicate key value violates unique constraint",
                    },
                  };
                }
                idSeq += 1;
                const saved = {
                  id: `00000000-0000-0000-0000-00000000010${idSeq}`,
                  ...row,
                };
                storedEvents.push(saved);
                return { data: saved, error: null };
              },
            }),
          }),
          select: () => {
            let filtered = [...storedEvents];
            const query = {
              eq: (col: string, val: unknown) => {
                filtered = filtered.filter((row) => row[col] === val);
                return query;
              },
              maybeSingle: async () => ({
                data: filtered[0] ?? null,
                error: null,
              }),
            };
            return query;
          },
        };
      }
      throw new Error(`Unexpected table ${table}`);
    },
    rpc: vi.fn(async (fn: string, args: Record<string, unknown>) => {
      rpcCalls.push({ fn, args });
      if (fn === "apply_account_event" && options.failApply) {
        return { data: null, error: { message: "worker apply failed" } };
      }
      if (fn === "claim_provider_event") {
        return {
          data: options.rpcResults?.claim_provider_event ?? {
            claimed: true,
            outcome: "claimed",
            attempt: 1,
          },
          error: null,
        };
      }
      if (fn === "apply_account_event") {
        return {
          data: options.rpcResults?.apply_account_event ?? {
            outcome: "applied",
            status: "active",
          },
          error: null,
        };
      }
      if (fn === "record_provider_event_failure") {
        return {
          data: { outcome: "failed", attempt: args.p_attempt },
          error: null,
        };
      }
      return { data: null, error: null };
    }),
  };

  return { client, storedEvents, rpcCalls };
}

function collectStripeWebhookRoutes(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectStripeWebhookRoutes(full, acc);
    } else if (
      entry.name === "route.ts" &&
      /[/\\]webhooks[/\\]stripe[^/\\]*[/\\]route\.ts$/.test(full)
    ) {
      acc.push(path.relative(REPO_ROOT, full).replaceAll("\\", "/"));
    }
  }
  return acc.sort();
}

describe("Connected-accounts Stripe webhook intake (Items 4 & W8-R3 / W8-R10)", () => {
  it("returns 503 without touching the database when STRIPE_CONNECT_WEBHOOK_SECRET is unset", async () => {
    const getClient = vi.fn(() => {
      throw new Error("DB must not be touched when secret is unset");
    });
    const POST = createStripeConnectWebhookHandler({
      getWebhookSecret: () => undefined,
      adminClientFactory: getClient,
    });
    const res = await POST(makeWebhookRequest("{}", "t=1,v1=abc"));
    expect(res.status).toBe(503);
    expect(getClient).not.toHaveBeenCalled();
  });

  it("rejects missing or invalid Stripe signatures with 400", async () => {
    const fake = createFakeAdminClient({ accounts: [] });
    const POST = createStripeConnectWebhookHandler({
      getWebhookSecret: () => WEBHOOK_SECRET,
      adminClientFactory: () => ({ client: fake.client as never, error: null }),
    });

    const missing = await POST(makeWebhookRequest("{}"));
    expect(missing.status).toBe(400);

    const invalid = await POST(
      makeWebhookRequest('{"id":"evt_bad"}', "t=1700000000,v1=deadbeef"),
    );
    expect(invalid.status).toBe(400);
    expect(fake.storedEvents).toHaveLength(0);
  });

  it("resolves tenant solely from payment_provider_accounts (ignoring metadata.tenant_id), stores idempotently with endpoint_kind='connect', and hands off to tenant_guard RPCs", async () => {
    const tenantA = "00000000-0000-0000-0000-000000000001";
    const tenantB = "00000000-0000-0000-0000-000000000002";
    const fake = createFakeAdminClient({
      accounts: [
        {
          tenant_id: tenantB,
          provider_account_id: "acct_beta123",
          livemode: false,
        },
      ],
    });
    const POST = createStripeConnectWebhookHandler({
      getWebhookSecret: () => WEBHOOK_SECRET,
      adminClientFactory: () => ({ client: fake.client as never, error: null }),
    });

    const payload = {
      id: "evt_connect_001",
      object: "event",
      api_version: "2026-05-27.dahlia",
      created: 1700000500,
      livemode: false,
      account: "acct_beta123",
      type: "account.updated",
      data: {
        object: {
          id: "acct_beta123",
          object: "account",
          charges_enabled: true,
          details_submitted: true,
          metadata: { tenant_id: tenantA },
        },
      },
    };
    const { rawBody, signature } = signPayload(payload);

    const first = await POST(makeWebhookRequest(rawBody, signature));
    expect(first.status).toBe(200);
    expect(fake.storedEvents).toHaveLength(1);
    expect(fake.storedEvents[0]).toMatchObject({
      tenant_id: tenantB,
      stripe_event_id: "evt_connect_001",
      stripe_account: "acct_beta123",
      livemode: false,
      endpoint_kind: "connect",
      processing_status: "received",
    });
    expect(fake.rpcCalls.map((c) => c.fn)).toEqual([
      "claim_provider_event",
      "apply_account_event",
    ]);

    const duplicate = await POST(makeWebhookRequest(rawBody, signature));
    expect(duplicate.status).toBe(200);
    expect(fake.storedEvents).toHaveLength(1);
  });

  it("stores unknown-account and livemode-mismatch events with tenant_id=null and processing_status='ignored' without calling worker RPCs", async () => {
    const tenantA = "00000000-0000-0000-0000-000000000001";
    const fake = createFakeAdminClient({
      accounts: [
        {
          tenant_id: tenantA,
          provider_account_id: "acct_alpha_test",
          livemode: false,
        },
      ],
    });
    const POST = createStripeConnectWebhookHandler({
      getWebhookSecret: () => WEBHOOK_SECRET,
      adminClientFactory: () => ({ client: fake.client as never, error: null }),
    });

    const modeMismatch = signPayload({
      id: "evt_mode_mismatch",
      object: "event",
      created: 1700000600,
      livemode: true,
      account: "acct_alpha_test",
      type: "account.updated",
      data: {
        object: { id: "acct_alpha_test", metadata: { tenant_id: tenantA } },
      },
    });
    const res1 = await POST(
      makeWebhookRequest(modeMismatch.rawBody, modeMismatch.signature),
    );
    expect(res1.status).toBe(200);
    expect(fake.storedEvents[0]).toMatchObject({
      tenant_id: null,
      stripe_account: "acct_alpha_test",
      livemode: true,
      endpoint_kind: "connect",
      processing_status: "ignored",
    });
    expect(fake.rpcCalls).toHaveLength(0);

    const unknownAcct = signPayload({
      id: "evt_unknown_acct",
      object: "event",
      created: 1700000601,
      livemode: false,
      account: "acct_unregistered",
      type: "account.updated",
      data: { object: { id: "acct_unregistered" } },
    });
    const res2 = await POST(
      makeWebhookRequest(unknownAcct.rawBody, unknownAcct.signature),
    );
    expect(res2.status).toBe(200);
    expect(fake.storedEvents[1]).toMatchObject({
      tenant_id: null,
      stripe_account: "acct_unregistered",
      endpoint_kind: "connect",
      processing_status: "ignored",
    });
    expect(fake.rpcCalls).toHaveLength(0);
  });

  it("records worker failure and returns 500 when apply_account_event fails so Stripe retries", async () => {
    const fake = createFakeAdminClient({
      accounts: [
        {
          tenant_id: "00000000-0000-0000-0000-000000000001",
          provider_account_id: "acct_retry1",
          livemode: false,
        },
      ],
      failApply: true,
    });
    const POST = createStripeConnectWebhookHandler({
      getWebhookSecret: () => WEBHOOK_SECRET,
      adminClientFactory: () => ({ client: fake.client as never, error: null }),
    });
    const { rawBody, signature } = signPayload({
      id: "evt_fail_001",
      object: "event",
      created: 1700000700,
      livemode: false,
      account: "acct_retry1",
      type: "account.updated",
      data: { object: { id: "acct_retry1" } },
    });

    const res = await POST(makeWebhookRequest(rawBody, signature));
    expect(res.status).toBe(500);
    expect(fake.rpcCalls.map((c) => c.fn)).toEqual([
      "claim_provider_event",
      "apply_account_event",
      "record_provider_event_failure",
    ]);
  });

  it("admits originless signed POST to /api/webhooks/stripe-connect through admin proxy", async () => {
    const res = await adminProxy(
      new NextRequest(
        "https://admin.asymmetric.al/api/webhooks/stripe-connect",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        },
      ),
    );
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("route surface (F7 / W8-R3): exactly one connected-accounts webhook route exists in apps/admin and all legacy mounts remain untouched", () => {
    const routes = collectStripeWebhookRoutes(path.join(REPO_ROOT, "apps"));
    expect(routes).toEqual([
      "apps/admin/app/api/webhooks/stripe-connect/route.ts",
      "apps/admin/app/api/webhooks/stripe/route.ts",
      "apps/donor/app/api/webhooks/stripe/route.ts",
      "apps/missionary/app/api/webhooks/stripe/route.ts",
    ]);

    const connectRoutes = routes.filter((route) =>
      route.includes("stripe-connect"),
    );
    expect(connectRoutes).toEqual([
      "apps/admin/app/api/webhooks/stripe-connect/route.ts",
    ]);

    const connectRoute = readFileSync(
      path.join(
        REPO_ROOT,
        "apps/admin/app/api/webhooks/stripe-connect/route.ts",
      ),
      "utf8",
    );
    expect(connectRoute).toContain("@asym/api/stripe/connect-webhook");

    const connectModule = readFileSync(
      path.join(REPO_ROOT, "packages/api/src/stripe/connect-webhook.ts"),
      "utf8",
    );
    expect(connectModule).toContain("STRIPE_CONNECT_WEBHOOK_SECRET");

    expect(
      existsSync(
        path.join(REPO_ROOT, "apps/admin/app/api/webhooks/stripe/route.ts"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        path.join(REPO_ROOT, "apps/donor/app/api/webhooks/stripe/route.ts"),
      ),
    ).toBe(true);
  });
});
