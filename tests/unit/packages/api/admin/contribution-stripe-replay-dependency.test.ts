import { describe, expect, it } from "vitest";

import { createContributionActionDependencies } from "../../../../../packages/api/src/admin/contribution-operations/dependencies";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const TENANT_ID = "tenant-1";
const DONATION_ID = "donation-1";

interface RawEvent {
  id: string;
  stripe_event_id: string;
  tenant_id: string;
  donation_id: string;
  created_at: string;
  correlation_id: string;
  event_type: string;
  processing_status: string;
  raw_payload: Record<string, unknown>;
}

function rawEvent(overrides: Partial<RawEvent>): RawEvent {
  return {
    id: "raw-1",
    stripe_event_id: "evt_1",
    tenant_id: TENANT_ID,
    donation_id: DONATION_ID,
    created_at: "2026-05-01T00:00:00.000Z",
    correlation_id: "corr-1",
    event_type: "payment_intent.succeeded",
    processing_status: "processed",
    raw_payload: {},
    ...overrides,
  };
}

class RawEventsBuilder {
  private filters: Record<string, unknown> = {};
  private ordered = false;
  private limited = false;

  constructor(
    private readonly rows: RawEvent[],
    private readonly updates: Record<string, unknown>[],
  ) {}

  select() {
    return this;
  }

  update(patch: Record<string, unknown>) {
    this.updates.push(patch);
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters[column] = value;
    return this;
  }

  order() {
    this.ordered = true;
    return this;
  }

  limit() {
    this.limited = true;
    return this;
  }

  private match(): RawEvent[] {
    let result = this.rows.filter((row) =>
      Object.entries(this.filters).every(
        ([key, value]) => (row as Record<string, unknown>)[key] === value,
      ),
    );
    if (this.ordered) {
      result = [...result].sort((left, right) =>
        left.created_at < right.created_at ? 1 : -1,
      );
    }
    if (this.limited) {
      result = result.slice(0, 1);
    }
    return result;
  }

  maybeSingle() {
    return Promise.resolve({ data: this.match()[0] ?? null, error: null });
  }

  then<TResult>(
    onfulfilled: (value: { data: unknown; error: null }) => TResult,
  ) {
    return Promise.resolve(onfulfilled({ data: this.match(), error: null }));
  }
}

function createStub(
  rows: RawEvent[],
  updates: Record<string, unknown>[] = [],
): AdminSupabaseClient {
  return {
    from(table: string) {
      if (table === "stripe_raw_events") {
        return new RawEventsBuilder(rows, updates);
      }
      throw new Error(`unexpected table ${table}`);
    },
  } as unknown as AdminSupabaseClient;
}

describe("contribution replayStripeEvent dependency", () => {
  it("derives the latest stored provider event id when no event id is supplied", async () => {
    const deps = createContributionActionDependencies(
      createStub([
        rawEvent({
          id: "raw-old",
          stripe_event_id: "evt_old",
          created_at: "2026-05-01T00:00:00.000Z",
        }),
        rawEvent({
          id: "raw-new",
          stripe_event_id: "evt_new",
          created_at: "2026-05-09T00:00:00.000Z",
        }),
      ]),
    );

    const outcome = await deps.replayStripeEvent!({
      tenantId: TENANT_ID,
      contributionId: DONATION_ID,
      payload: {},
      expectedRevision: null,
      idempotencyKey: "replay-key",
    });

    expect(outcome).toMatchObject({
      provider: "stripe",
      status: "queued_for_replay",
      referenceId: "evt_new",
    });
  });

  it("resets retry and dead-letter metadata when queueing a replay", async () => {
    const updates: Record<string, unknown>[] = [];
    const deps = createContributionActionDependencies(
      createStub(
        [
          rawEvent({
            id: "raw-dead",
            stripe_event_id: "evt_dead",
            created_at: "2026-05-09T00:00:00.000Z",
            processing_status: "dead_letter",
          }),
        ],
        updates,
      ),
    );

    await deps.replayStripeEvent!({
      tenantId: TENANT_ID,
      contributionId: DONATION_ID,
      payload: {},
      expectedRevision: null,
      idempotencyKey: "replay-key",
    });

    expect(updates[0]).toMatchObject({
      processing_status: "received",
      process_attempts: 0,
      failed_at: null,
      dead_letter_at: null,
      last_error_code: null,
      last_error_message: null,
      retryable: null,
      processing_outcome: {},
    });
  });

  it("skips newer non-payment events when deriving a replay event id", async () => {
    const deps = createContributionActionDependencies(
      createStub([
        rawEvent({
          id: "raw-payment",
          stripe_event_id: "evt_payment",
          created_at: "2026-05-01T00:00:00.000Z",
          event_type: "payment_intent.succeeded",
        }),
        rawEvent({
          id: "raw-refund",
          stripe_event_id: "evt_refund",
          created_at: "2026-05-09T00:00:00.000Z",
          event_type: "charge.refunded",
        }),
      ]),
    );

    const outcome = await deps.replayStripeEvent!({
      tenantId: TENANT_ID,
      contributionId: DONATION_ID,
      payload: {},
      expectedRevision: null,
      idempotencyKey: "replay-key",
    });

    expect(outcome.referenceId).toBe("evt_payment");
  });

  it("returns a clear error when no stored event exists", async () => {
    const deps = createContributionActionDependencies(createStub([]));

    await expect(
      deps.replayStripeEvent!({
        tenantId: TENANT_ID,
        contributionId: DONATION_ID,
        payload: {},
        expectedRevision: null,
        idempotencyKey: "replay-key",
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: expect.stringMatching(/no stored provider event/i),
    });
  });

  it("honors an explicitly supplied event id for batch replay callers", async () => {
    const deps = createContributionActionDependencies(
      createStub([
        rawEvent({
          id: "raw-old",
          stripe_event_id: "evt_old",
          created_at: "2026-05-01T00:00:00.000Z",
        }),
        rawEvent({
          id: "raw-new",
          stripe_event_id: "evt_new",
          created_at: "2026-05-09T00:00:00.000Z",
        }),
      ]),
    );

    const outcome = await deps.replayStripeEvent!({
      tenantId: TENANT_ID,
      contributionId: DONATION_ID,
      payload: { stripeEventId: " evt_old " },
      expectedRevision: null,
      idempotencyKey: "replay-key",
    });

    expect(outcome.referenceId).toBe("evt_old");
  });

  it("rejects an explicitly supplied event id from another contribution", async () => {
    const deps = createContributionActionDependencies(
      createStub([
        rawEvent({
          id: "raw-other",
          stripe_event_id: "evt_other",
          donation_id: "donation-2",
        }),
      ]),
    );

    await expect(
      deps.replayStripeEvent!({
        tenantId: TENANT_ID,
        contributionId: DONATION_ID,
        payload: { stripeEventId: "evt_other" },
        expectedRevision: null,
        idempotencyKey: "replay-key",
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: expect.stringMatching(/stripe raw event not found/i),
    });
  });

  it("rejects explicitly supplied non-payment events for the same contribution", async () => {
    const deps = createContributionActionDependencies(
      createStub([
        rawEvent({
          id: "raw-refund",
          stripe_event_id: "evt_refund",
          event_type: "charge.refunded",
        }),
      ]),
    );

    await expect(
      deps.replayStripeEvent!({
        tenantId: TENANT_ID,
        contributionId: DONATION_ID,
        payload: { stripeEventId: "evt_refund" },
        expectedRevision: null,
        idempotencyKey: "replay-key",
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: expect.stringMatching(/stripe raw event not found/i),
    });
  });
});
