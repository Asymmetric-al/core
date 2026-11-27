import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { createStripeClient } from "../../../../packages/api/src/stripe/client";
import {
  DEFERRED_EVENT_TYPES,
  createStripePaymentEventsWebhookHandler,
} from "../../../../packages/api/src/stripe/payment-events-webhook";

const SECRET = "whsec_wp8a_payment_events_test_secret";
const TENANT_A = "00000000-0000-0000-0000-00000000000a";
const stripeHelper = createStripeClient("sk_test_dummy");

function snapshotEvent(
  over: Partial<{
    id: string;
    type: string;
    livemode: boolean;
    account: string | null;
    object: Record<string, unknown>;
  }> = {},
) {
  const event: Record<string, unknown> = {
    id: over.id ?? "evt_pay_001",
    object: "event",
    api_version: "2026-10-28.acacia",
    created: 1790000000,
    livemode: over.livemode ?? false,
    type: over.type ?? "payment_intent.succeeded",
    data: {
      object: over.object ?? {
        id: "pi_alpha1",
        object: "payment_intent",
        amount: 10330,
        amount_received: 10330,
        currency: "usd",
        livemode: over.livemode ?? false,
        metadata: { asym_intake: "forged-tenant-b-intake" },
      },
    },
  };
  const account = over.account === undefined ? "acct_alpha1" : over.account;
  if (account !== null) event.account = account;
  return event;
}

function signed(rawBody: string, secret = SECRET) {
  return stripeHelper.webhooks.generateTestHeaderString({
    payload: rawBody,
    secret,
  });
}

function request(rawBody: string, signature?: string) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (signature !== undefined) headers["stripe-signature"] = signature;
  return new NextRequest(
    "https://admin.asymmetric.al/api/webhooks/stripe-payment-events",
    {
      method: "POST",
      headers,
      body: rawBody,
    },
  );
}

function fakeDatabase(
  options: {
    claim?: Record<string, unknown>;
    applyError?: { code?: string; message: string };
  } = {},
) {
  const mappings = [
    {
      tenant_id: TENANT_A,
      provider_account_id: "acct_alpha1",
      livemode: false,
    },
  ];
  const stored: Array<Record<string, unknown>> = [];
  const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  const lookups: Array<Record<string, unknown>> = [];
  let seq = 0;
  const client = {
    from: (table: string) => {
      if (table === "payment_provider_accounts") {
        let rows = [...mappings];
        const filter: Record<string, unknown> = {};
        const q = {
          select: () => q,
          eq: (column: string, value: unknown) => {
            filter[column] = value;
            rows = rows.filter(
              (row) => (row as Record<string, unknown>)[column] === value,
            );
            return q;
          },
          maybeSingle: async () => {
            lookups.push({ ...filter });
            return { data: rows[0] ?? null, error: null };
          },
        };
        return q;
      }
      if (table === "stripe_connect_events") {
        return {
          insert: (row: Record<string, unknown>) => ({
            select: () => ({
              single: async () => {
                if (
                  stored.some((e) => e.stripe_event_id === row.stripe_event_id)
                )
                  return {
                    data: null,
                    error: { code: "23505", message: "duplicate" },
                  };
                seq += 1;
                const saved = {
                  id: `00000000-0000-0000-0000-0000000002${String(seq).padStart(2, "0")}`,
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
      throw new Error(`The payment-event destination must not touch ${table}`);
    },
    rpc: vi.fn(async (fn: string, args: Record<string, unknown>) => {
      rpcCalls.push({ fn, args });
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
      if (fn === "apply_payment_outcome") {
        if (options.applyError)
          return { data: null, error: options.applyError };
        return { data: { outcome: "staged" }, error: null };
      }
      if (fn === "defer_payment_event")
        return { data: { outcome: "deferred" }, error: null };
      if (fn === "record_provider_event_failure")
        return { data: { outcome: "failed" }, error: null };
      return { data: null, error: { message: `unexpected ${fn}` } };
    }),
  };
  return { client, stored, rpcCalls, lookups };
}

function handlerWith(
  db: ReturnType<typeof fakeDatabase>,
  secret: string | null = SECRET,
) {
  return createStripePaymentEventsWebhookHandler({
    getWebhookSecret: () => secret ?? undefined,
    adminClientFactory: () => ({ client: db.client, error: null }) as never,
  });
}

describe("AL-2681 PR 2a: the payment-event destination (mounted; refuses without its secret)", () => {
  it("refuses without its secret, a signature, or a valid one, and stores nothing", async () => {
    const db = fakeDatabase();
    const raw = JSON.stringify(snapshotEvent());
    expect(
      (await handlerWith(db, null)(request(raw, signed(raw)))).status,
    ).toBe(503);
    expect(
      (await handlerWith(db, "  ")(request(raw, signed(raw)))).status,
    ).toBe(503);
    expect((await handlerWith(db)(request(raw))).status).toBe(400);
    expect(
      (await handlerWith(db)(request(raw, signed(raw, "whsec_other")))).status,
    ).toBe(400);
    expect(db.stored).toEqual([]);
    expect(db.rpcCalls).toEqual([]);
  });

  it("refuses a live-mode event before it is stored", async () => {
    const db = fakeDatabase();
    const raw = JSON.stringify(snapshotEvent({ livemode: true }));
    const res = await handlerWith(db)(request(raw, signed(raw)));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "live_mode_refused" });
    expect(db.stored).toEqual([]);
  });

  it("refuses an amount written as an exponent, which jsonb would read as an integer (ADR 0009 decision 17)", async () => {
    const db = fakeDatabase();
    const raw = JSON.stringify(snapshotEvent()).replace(
      '"amount":10330',
      '"amount":1.033e4',
    );
    expect(raw).toContain("1.033e4");
    const res = await handlerWith(db)(request(raw, signed(raw)));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: "payment_event_malformed",
    });
    expect(db.stored).toEqual([]);
    const fractional = JSON.stringify(snapshotEvent()).replace(
      '"amount_received":10330',
      '"amount_received":10330.0',
    );
    const res2 = await handlerWith(db)(request(fractional, signed(fractional)));
    expect(res2.status).toBe(400);
  });

  it("takes the organization from the event's account in test mode only, whatever the metadata names, then claims and applies in its own request", async () => {
    const db = fakeDatabase();
    const raw = JSON.stringify(snapshotEvent());
    const res = await handlerWith(db)(request(raw, signed(raw)));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      received: true,
      eventId: "evt_pay_001",
      outcome: "staged",
    });
    expect(db.lookups).toEqual([
      { provider_account_id: "acct_alpha1", livemode: false },
    ]);
    expect(db.stored).toHaveLength(1);
    expect(db.stored[0]).toMatchObject({
      tenant_id: TENANT_A,
      stripe_event_id: "evt_pay_001",
      event_type: "payment_intent.succeeded",
      livemode: false,
      provider_account_id: "acct_alpha1",
      processing_status: "received",
    });
    expect(db.stored[0]!.payload_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(db.rpcCalls.map((c) => c.fn)).toEqual([
      "claim_provider_event",
      "apply_payment_outcome",
    ]);
    expect(db.rpcCalls[1]!.args).toEqual({
      p_event_id: db.stored[0]!.id,
      p_attempt: 1,
    });
  });

  it("stores an unknown account's or a platform event as ignored and applies nothing", async () => {
    for (const account of ["acct_unknown9", null]) {
      const db = fakeDatabase();
      const raw = JSON.stringify(snapshotEvent({ account }));
      const res = await handlerWith(db)(request(raw, signed(raw)));
      expect(res.status).toBe(200);
      expect(db.stored[0]).toMatchObject({
        tenant_id: null,
        processing_status: "ignored",
      });
      expect(db.rpcCalls).toEqual([]);
    }
  });

  it("defers a connected refund or dispute to WP8c instead of applying it", async () => {
    expect([...DEFERRED_EVENT_TYPES].sort()).toEqual(
      [
        "charge.dispute.closed",
        "charge.dispute.created",
        "charge.dispute.funds_reinstated",
        "charge.dispute.funds_withdrawn",
        "charge.dispute.updated",
        "charge.refund.updated",
        "charge.refunded",
        "refund.created",
        "refund.failed",
        "refund.updated",
      ].sort(),
    );
    for (const type of ["charge.refunded", "charge.dispute.created"]) {
      const db = fakeDatabase();
      const raw = JSON.stringify(
        snapshotEvent({
          type,
          object: {
            id: "ch_1",
            object: "charge",
            payment_intent: "pi_alpha1",
            amount: 10330,
          },
        }),
      );
      const res = await handlerWith(db)(request(raw, signed(raw)));
      expect(res.status).toBe(200);
      expect(db.rpcCalls.map((c) => c.fn)).toEqual([
        "claim_provider_event",
        "defer_payment_event",
      ]);
    }
  });

  it("a second delivery finds the stored event; a terminal claim answers received", async () => {
    const db = fakeDatabase({
      claim: { claimed: false, terminal: true, outcome: "processed" },
    });
    const raw = JSON.stringify(snapshotEvent());
    await handlerWith(db)(request(raw, signed(raw)));
    const res = await handlerWith(db)(request(raw, signed(raw)));
    expect(res.status).toBe(200);
    expect(db.stored).toHaveLength(1);
  });

  it("a failed apply records the failure and asks the provider to deliver again", async () => {
    const db = fakeDatabase({ applyError: { code: "XX000", message: "boom" } });
    const raw = JSON.stringify(snapshotEvent());
    const res = await handlerWith(db)(request(raw, signed(raw)));
    expect(res.status).toBe(503);
    expect(db.rpcCalls.map((c) => c.fn)).toEqual([
      "claim_provider_event",
      "apply_payment_outcome",
      "record_provider_event_failure",
    ]);
  });

  it("a tenant named in the metadata is never believed: the organization is the account's (W8-R39)", async () => {
    const db = fakeDatabase();
    const event = snapshotEvent();
    const object = (event.data as { object: Record<string, unknown> }).object;
    object.metadata = {
      tenant_id: "00000000-0000-0000-0000-00000000000b",
      asym_intake: "x",
    };
    const raw = JSON.stringify(event);
    const res = await handlerWith(db)(request(raw, signed(raw)));
    expect(res.status).toBe(200);
    expect(db.stored[0]).toMatchObject({ tenant_id: TENANT_A });
    expect(db.lookups).toEqual([
      { provider_account_id: "acct_alpha1", livemode: false },
    ]);
  });
});
