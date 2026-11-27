import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { proxy as adminProxy } from "../../../../apps/admin/proxy";
import { createStripeClient } from "../../../../packages/api/src/stripe/client";
import { createStripeConnectWebhookHandler } from "../../../../packages/api/src/stripe/connect-webhook";

const REPO_ROOT = path.resolve(
  new URL("../../../../", import.meta.url).pathname,
);
const WEBHOOK_SECRET = "whsec_wp8a_connect_test_secret";
const TENANT_A = "00000000-0000-0000-0000-00000000000a";
const INTENT_A = "44444444-4444-4444-4444-444444444444";
const stripeHelper = createStripeClient("sk_test_dummy");

function thinEvent(
  overrides: Partial<{
    id: string;
    type: string;
    livemode: boolean;
    account: string | null;
  }> = {},
) {
  const account =
    overrides.account === undefined ? "acct_alpha1" : overrides.account;
  return {
    id: overrides.id ?? "evt_thin_001",
    object: "v2.core.event",
    type:
      overrides.type ??
      "v2.core.account[configuration.merchant].capability_status_updated",
    created: "2026-11-23T10:00:00.000Z",
    livemode: overrides.livemode ?? false,
    related_object: account
      ? {
          id: account,
          type: "v2.core.account",
          url: `/v2/core/accounts/${account}`,
        }
      : null,
  };
}

function signed(payload: Record<string, unknown>, secret = WEBHOOK_SECRET) {
  const rawBody = JSON.stringify(payload);
  return {
    rawBody,
    signature: stripeHelper.webhooks.generateTestHeaderString({
      payload: rawBody,
      secret,
    }),
  };
}

function request(rawBody: string, signature?: string) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (signature !== undefined) headers["stripe-signature"] = signature;
  return new NextRequest(
    "https://admin.asymmetric.al/api/webhooks/stripe-connect",
    { method: "POST", headers, body: rawBody },
  );
}

type Snapshot = {
  id: string;
  livemode: boolean;
  closed?: boolean;
  dashboard?: string;
  metadata?: Record<string, string>;
  configuration?: {
    merchant: { capabilities: { card_payments: { status: string } } };
  };
};

function fakeProvider(
  accounts: Record<string, Snapshot>,
  options: { fail?: boolean } = {},
) {
  const retrieved: string[] = [];
  const order: string[] = [];
  const client = {
    v2: {
      core: {
        accounts: {
          create: vi.fn(),
          retrieve: vi.fn(
            async (id: string, params?: { include?: string[] }) => {
              retrieved.push(id);
              order.push(`fetch:${id}:${(params?.include ?? []).join("+")}`);
              if (options.fail) throw new Error("Stripe unavailable");
              const account = accounts[id];
              if (!account) throw new Error("No such account");
              return account;
            },
          ),
        },
        accountLinks: { create: vi.fn() },
      },
    },
  };
  return { client, retrieved, order };
}

function fakeDatabase(
  options: {
    mappings?: Array<{
      tenant_id: string;
      provider_account_id: string;
      livemode: boolean;
    }>;
    claim?: Record<string, unknown>;
    applyError?: { code?: string; message: string };
    confirmOutcome?: string;
  } = {},
) {
  const mappings = [...(options.mappings ?? [])];
  const stored: Array<Record<string, unknown>> = [];
  const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  const order: string[] = [];
  const tablesTouched: string[] = [];
  let seq = 0;

  const client = {
    from: (table: string) => {
      tablesTouched.push(table);
      if (table === "payment_provider_accounts") {
        let rows = [...mappings];
        const q = {
          select: () => q,
          eq: (column: string, value: unknown) => {
            rows = rows.filter(
              (row) => (row as Record<string, unknown>)[column] === value,
            );
            return q;
          },
          maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
        };
        return q;
      }
      if (table === "stripe_connect_events") {
        return {
          insert: (row: Record<string, unknown>) => ({
            select: () => ({
              single: async () => {
                order.push(`store:${String(row.tenant_id)}`);
                if (
                  stored.some((e) => e.stripe_event_id === row.stripe_event_id)
                )
                  return {
                    data: null,
                    error: { code: "23505", message: "duplicate" },
                  };
                seq += 1;
                const saved = {
                  id: `00000000-0000-0000-0000-0000000001${String(seq).padStart(2, "0")}`,
                  ...row,
                };
                stored.push(saved);
                return { data: saved, error: null };
              },
            }),
          }),
          select: () => {
            let rows = [...stored];
            const q = {
              eq: (column: string, value: unknown) => {
                rows = rows.filter((row) => row[column] === value);
                return q;
              },
              maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
            };
            return q;
          },
        };
      }
      throw new Error(`The connected-accounts webhook must not touch ${table}`);
    },
    rpc: vi.fn(async (fn: string, args: Record<string, unknown>) => {
      rpcCalls.push({ fn, args });
      order.push(fn);
      if (fn === "confirm_payment_account_onboarding") {
        const outcome = options.confirmOutcome ?? "confirmed";
        const snapshot = args.p_snapshot as { id: string; livemode: boolean };
        if (outcome === "confirmed")
          mappings.push({
            tenant_id: TENANT_A,
            provider_account_id: snapshot.id,
            livemode: snapshot.livemode,
          });
        return { data: { outcome }, error: null };
      }
      if (fn === "claim_provider_event")
        return {
          data: options.claim ?? {
            claimed: true,
            terminal: false,
            outcome: "claimed",
            attempt: 1,
          },
          error: null,
        };
      if (fn === "apply_account_event") {
        if (options.applyError)
          return { data: null, error: options.applyError };
        return { data: { outcome: "applied", status: "active" }, error: null };
      }
      if (fn === "record_provider_event_failure")
        return { data: { outcome: "failed" }, error: null };
      return { data: null, error: { message: `unexpected ${fn}` } };
    }),
  };
  return { client, stored, rpcCalls, order, tablesTouched, mappings };
}

function handler(
  db: ReturnType<typeof fakeDatabase> | null,
  provider: ReturnType<typeof fakeProvider> | null,
  options: { secret?: string; secretKey?: string } = {},
) {
  const adminClientFactory = vi.fn(() => ({
    client: db?.client,
    error: null,
  }));
  const createProviderStripe = vi.fn(() => provider?.client);
  const POST = createStripeConnectWebhookHandler({
    getWebhookSecret: () => options.secret ?? WEBHOOK_SECRET,
    getSecretKey: () => options.secretKey ?? "sk_test_platform",
    adminClientFactory: adminClientFactory as never,
    createProviderStripe: createProviderStripe as never,
  });
  return { POST, adminClientFactory, createProviderStripe };
}

const accountSnapshot = (
  id: string,
  card: string,
  metadata: Record<string, string> = {},
): Snapshot => ({
  id,
  livemode: false,
  closed: false,
  dashboard: "full",
  metadata,
  configuration: {
    merchant: { capabilities: { card_payments: { status: card } } },
  },
});

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

describe("Connected-accounts webhook: thin v2 account events (W8-R3, W8-R10, R31, R33, R38)", () => {
  it("answers 503 without touching the database while STRIPE_CONNECT_WEBHOOK_SECRET is unset", async () => {
    const { POST, adminClientFactory } = handler(fakeDatabase(), null, {
      secret: "",
    });
    const { rawBody, signature } = signed(thinEvent());
    const res = await POST(request(rawBody, signature));
    expect(res.status).toBe(503);
    expect(adminClientFactory).not.toHaveBeenCalled();
  });

  it("refuses a missing or wrong signature, and a v1 snapshot payload, before any database access", async () => {
    const { POST, adminClientFactory } = handler(fakeDatabase(), null);
    const good = signed(thinEvent());
    expect((await POST(request(good.rawBody))).status).toBe(400);
    const forged = signed(thinEvent(), "whsec_someone_else");
    expect((await POST(request(forged.rawBody, forged.signature))).status).toBe(
      400,
    );
    const snapshot = signed({
      id: "evt_v1",
      object: "event",
      type: "account.updated",
      account: "acct_alpha1",
      data: { object: { id: "acct_alpha1" } },
    });
    expect(
      (await POST(request(snapshot.rawBody, snapshot.signature))).status,
    ).toBe(400);
    expect(adminClientFactory).not.toHaveBeenCalled();
  });

  it("stores an event for an unknown account without a tenant and claims nothing", async () => {
    const db = fakeDatabase();
    const provider = fakeProvider({
      acct_stranger: accountSnapshot("acct_stranger", "active"),
    });
    const { POST } = handler(db, provider);
    const { rawBody, signature } = signed(
      thinEvent({ account: "acct_stranger" }),
    );
    const res = await POST(request(rawBody, signature));
    expect(res.status).toBe(200);
    expect(db.stored).toEqual([
      expect.objectContaining({
        tenant_id: null,
        provider_account_id: "acct_stranger",
        processing_status: "ignored",
        event_type:
          "v2.core.account[configuration.merchant].capability_status_updated",
      }),
    ]);
    expect(db.rpcCalls).toEqual([]);
    expect(db.tablesTouched).not.toContain("stripe_raw_events");
  });

  it("confirms the mapping from a signed event when Stripe says the account carries an open intent, then stores, claims, re-reads Stripe and applies", async () => {
    const db = fakeDatabase();
    const provider = fakeProvider({
      acct_alpha1: accountSnapshot("acct_alpha1", "active", {
        asym_onboarding_intent: INTENT_A,
        tenant_id: "00000000-0000-0000-0000-00000000000b",
      }),
    });
    const { POST } = handler(db, provider);
    const { rawBody, signature } = signed(
      thinEvent({ type: "v2.core.account.created" }),
    );
    const res = await POST(request(rawBody, signature));
    expect(res.status).toBe(200);
    expect(db.rpcCalls[0]).toEqual({
      fn: "confirm_payment_account_onboarding",
      args: {
        p_stripe_event_id: "evt_thin_001",
        p_livemode: false,
        p_snapshot: {
          id: "acct_alpha1",
          livemode: false,
          closed: false,
          dashboard: "full",
          card_payments_status: "active",
          metadata: { asym_onboarding_intent: INTENT_A },
        },
      },
    });
    expect(db.order).toEqual([
      "confirm_payment_account_onboarding",
      `store:${TENANT_A}`,
      "claim_provider_event",
      "apply_account_event",
    ]);
    expect(provider.order).toEqual([
      "fetch:acct_alpha1:configuration.merchant+requirements",
      "fetch:acct_alpha1:configuration.merchant+requirements",
    ]);
    expect(db.stored[0]).toMatchObject({
      tenant_id: TENANT_A,
      processing_status: "received",
    });
  });

  it("an unknown account whose Stripe record carries no intent, or whose confirmation is refused, stays tenantless", async () => {
    for (const [metadata, outcome] of [
      [{}, "confirmed"],
      [{ asym_onboarding_intent: INTENT_A }, "account_already_mapped"],
    ] as const) {
      const db = fakeDatabase({ confirmOutcome: outcome });
      const provider = fakeProvider({
        acct_alpha1: accountSnapshot("acct_alpha1", "active", metadata),
      });
      const res = await handler(db, provider).POST(
        request(...(Object.values(signed(thinEvent())) as [string, string])),
      );
      expect(res.status).toBe(200);
      expect(db.stored[0]).toMatchObject({
        tenant_id: null,
        processing_status: "ignored",
      });
      expect(db.rpcCalls.map((c) => c.fn)).not.toContain(
        "claim_provider_event",
      );
    }
  });

  it("asks Stripe to retry, storing nothing, when Stripe cannot be read for an unmapped account", async () => {
    const db = fakeDatabase();
    const provider = fakeProvider({}, { fail: true });
    const { rawBody, signature } = signed(thinEvent());
    const res = await handler(db, provider).POST(request(rawBody, signature));
    expect(res.status).toBe(503);
    expect(db.stored).toEqual([]);
  });

  it.each(["lease_active", "account_busy", "not_due"])(
    "answers a non-terminal claim (%s) so that Stripe retries (R33)",
    async (outcome) => {
      const db = fakeDatabase({
        mappings: [
          {
            tenant_id: TENANT_A,
            provider_account_id: "acct_alpha1",
            livemode: false,
          },
        ],
        claim: { claimed: false, terminal: false, outcome },
      });
      const provider = fakeProvider({});
      const { rawBody, signature } = signed(thinEvent());
      const res = await handler(db, provider).POST(request(rawBody, signature));
      expect(res.status).toBe(503);
      expect(await res.json()).toMatchObject({ outcome, retry: true });
      expect(provider.retrieved).toEqual([]);
    },
  );

  it("acknowledges a terminal claim without applying", async () => {
    const db = fakeDatabase({
      mappings: [
        {
          tenant_id: TENANT_A,
          provider_account_id: "acct_alpha1",
          livemode: false,
        },
      ],
      claim: { claimed: false, terminal: true, outcome: "processed" },
    });
    const { rawBody, signature } = signed(thinEvent());
    const res = await handler(db, fakeProvider({})).POST(
      request(rawBody, signature),
    );
    expect(res.status).toBe(200);
    expect(db.rpcCalls.map((c) => c.fn)).toEqual(["claim_provider_event"]);
  });

  it("records a retryable failure and asks Stripe to retry when the account cannot be re-read after the claim", async () => {
    const db = fakeDatabase({
      mappings: [
        {
          tenant_id: TENANT_A,
          provider_account_id: "acct_alpha1",
          livemode: false,
        },
      ],
    });
    const { rawBody, signature } = signed(thinEvent());
    const res = await handler(db, fakeProvider({}, { fail: true })).POST(
      request(rawBody, signature),
    );
    expect(res.status).toBe(503);
    expect(db.rpcCalls.map((c) => c.fn)).toEqual([
      "claim_provider_event",
      "record_provider_event_failure",
    ]);
  });

  it("applies a closed event even when the closed account cannot be read", async () => {
    const db = fakeDatabase({
      mappings: [
        {
          tenant_id: TENANT_A,
          provider_account_id: "acct_alpha1",
          livemode: false,
        },
      ],
    });
    const { rawBody, signature } = signed(
      thinEvent({ type: "v2.core.account.closed" }),
    );
    const res = await handler(db, fakeProvider({}, { fail: true })).POST(
      request(rawBody, signature),
    );
    expect(res.status).toBe(200);
    expect(db.rpcCalls.at(-1)).toEqual({
      fn: "apply_account_event",
      args: { p_event_id: expect.any(String), p_attempt: 1, p_snapshot: null },
    });
  });

  it("a stale attempt is not reported as a failure; another apply error is, and both ask Stripe to retry", async () => {
    for (const [code, expected] of [
      ["55000", ["claim_provider_event", "apply_account_event"]],
      [
        "XX000",
        [
          "claim_provider_event",
          "apply_account_event",
          "record_provider_event_failure",
        ],
      ],
    ] as const) {
      const db = fakeDatabase({
        mappings: [
          {
            tenant_id: TENANT_A,
            provider_account_id: "acct_alpha1",
            livemode: false,
          },
        ],
        applyError: { code, message: "apply refused" },
      });
      const provider = fakeProvider({
        acct_alpha1: accountSnapshot("acct_alpha1", "active"),
      });
      const { rawBody, signature } = signed(thinEvent());
      const res = await handler(db, provider).POST(request(rawBody, signature));
      expect(res.status).toBe(503);
      expect(db.rpcCalls.map((c) => c.fn)).toEqual(expected);
    }
  });

  it("de-duplicates within its own lane only and resolves the tenant from the stored mapping, never from the payload", async () => {
    const db = fakeDatabase({
      mappings: [
        {
          tenant_id: TENANT_A,
          provider_account_id: "acct_alpha1",
          livemode: false,
        },
      ],
    });
    const provider = fakeProvider({
      acct_alpha1: accountSnapshot("acct_alpha1", "active", {
        tenant_id: "00000000-0000-0000-0000-00000000000b",
      }),
    });
    const { POST } = handler(db, provider);
    const { rawBody, signature } = signed(thinEvent());
    expect((await POST(request(rawBody, signature))).status).toBe(200);
    expect((await POST(request(rawBody, signature))).status).toBe(200);
    expect(db.stored).toHaveLength(1);
    expect(db.stored[0]).toMatchObject({ tenant_id: TENANT_A });
    expect(db.tablesTouched).not.toContain("stripe_raw_events");
    expect(
      db.rpcCalls
        .filter((c) => c.fn === "claim_provider_event")
        .map((c) => c.args.p_event_id),
    ).toEqual([db.stored[0]!.id, db.stored[0]!.id]);
  });

  it("a live-mode event for an account mapped only in test mode is not attributed to the tenant", async () => {
    const db = fakeDatabase({
      mappings: [
        {
          tenant_id: TENANT_A,
          provider_account_id: "acct_alpha1",
          livemode: false,
        },
      ],
      confirmOutcome: "mode_mismatch",
    });
    const provider = fakeProvider({
      acct_alpha1: {
        ...accountSnapshot("acct_alpha1", "active", {
          asym_onboarding_intent: INTENT_A,
        }),
        livemode: true,
      },
    });
    const { rawBody, signature } = signed(thinEvent({ livemode: true }));
    const res = await handler(db, provider).POST(request(rawBody, signature));
    expect(res.status).toBe(200);
    expect(db.stored[0]).toMatchObject({ tenant_id: null, livemode: true });
    expect(db.rpcCalls.map((c) => c.fn)).toEqual([
      "confirm_payment_account_onboarding",
    ]);
  });

  it("admits originless signed POST to /api/webhooks/stripe-connect through the admin proxy", async () => {
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

  it("route surface (F7 / W8-R3; D-18, AL-2681: and the payment-event destination of W8-R39 beside it): exactly one connected-accounts webhook route exists in apps/admin and the legacy mounts remain", () => {
    const routes = collectStripeWebhookRoutes(path.join(REPO_ROOT, "apps"));
    expect(routes).toEqual([
      "apps/admin/app/api/webhooks/stripe-connect/route.ts",
      "apps/admin/app/api/webhooks/stripe-payment-events/route.ts",
      "apps/admin/app/api/webhooks/stripe/route.ts",
      "apps/donor/app/api/webhooks/stripe/route.ts",
      "apps/missionary/app/api/webhooks/stripe/route.ts",
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
    expect(connectModule).toContain("parseEventNotification");
    expect(connectModule).not.toContain("stripe_raw_events");
    expect(connectModule).not.toMatch(/metadata\??\.tenant_id/);
    for (const legacy of [
      "apps/admin/app/api/webhooks/stripe/route.ts",
      "apps/donor/app/api/webhooks/stripe/route.ts",
    ])
      expect(existsSync(path.join(REPO_ROOT, legacy))).toBe(true);
  });
});
