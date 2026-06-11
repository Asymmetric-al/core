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

  constructor(private readonly rows: RawEvent[]) {}

  select() {
    return this;
  }

  update() {
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

  then<T>(onfulfilled: (value: { data: unknown; error: null }) => T) {
    return Promise.resolve(onfulfilled({ data: this.match(), error: null }));
  }
}

function createStub(rows: RawEvent[]): AdminSupabaseClient {
  return {
    from(table: string) {
      if (table === "stripe_raw_events") {
        return new RawEventsBuilder(rows);
      }
      throw new Error(`unexpected table ${table}`);
    },
  } as unknown as AdminSupabaseClient;
}

describe("contribution replayStripeEvent dependency", () => {
  it("derives the latest stored provider event id when the inline action sends no event id", async () => {
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
    });

    expect(outcome).toMatchObject({
      provider: "stripe",
      status: "queued_for_replay",
      referenceId: "evt_new",
    });
  });

  it("returns a clear error (not the generic stripeEventId-required) when no stored event exists", async () => {
    const deps = createContributionActionDependencies(createStub([]));

    await expect(
      deps.replayStripeEvent!({
        tenantId: TENANT_ID,
        contributionId: DONATION_ID,
        payload: {},
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: expect.stringMatching(/no stored provider event/i),
    });
  });

  it("still honors an explicitly supplied event id (batch replay path)", async () => {
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
      payload: { stripeEventId: "evt_old" },
    });

    // Uses the explicit id, not the resolver's latest.
    expect(outcome.referenceId).toBe("evt_old");
  });
});
