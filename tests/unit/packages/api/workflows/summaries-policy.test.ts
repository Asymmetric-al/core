import { describe, expect, it, vi } from "vitest";

import {
  countWorkflowNotifications,
  evaluateWorkflowNotification,
} from "../../../../../packages/api/src/workflows/notification-policy";
import { summarizeWorkflowRuns } from "../../../../../packages/api/src/workflows/summaries";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";

function ledgerRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "req-1",
    tenant_id: TENANT_ID,
    product_area: "donations",
    workflow_name: "donations/saga.recovery.requested",
    subject_type: "donation_saga_outbox",
    subject_id: "outbox-1",
    idempotency_key: "k-1",
    schema_version: 1,
    status: "dispatched",
    dispatch_attempts: 1,
    next_attempt_at: "2026-06-11T00:00:00.000Z",
    last_error_code: null,
    // Deliberately hostile content: must never surface in summaries.
    last_error_message: "secret sk_live_123 https://signed.example/url",
    event_ids: ["evt-1"],
    context: {},
    dispatched_at: "2026-06-11T00:00:01.000Z",
    dead_letter_at: null,
    created_at: "2026-06-11T00:00:00.000Z",
    updated_at: "2026-06-11T00:00:01.000Z",
    ...overrides,
  };
}

function chain(result: { data: unknown; error: unknown }) {
  const target: Record<string, unknown> = {};
  const proxy: Record<string, unknown> = new Proxy(target, {
    get(_t, prop) {
      if (prop === "then") {
        return (resolve: (value: unknown) => unknown) => resolve(result);
      }
      return () => proxy;
    },
  });
  return proxy;
}

function createSummariesClientMock(options: {
  ledgerRows: unknown[];
  sagaRows?: unknown[];
}) {
  const tenantFilters: Array<{ table: string; tenantId: unknown }> = [];

  const from = vi.fn((table: string) => ({
    select: () => {
      const builder = {
        eq: (column: string, value: unknown) => {
          if (column === "tenant_id") {
            tenantFilters.push({ table, tenantId: value });
          }
          return builder;
        },
        in: () => builder,
        order: () => builder,
        limit: () =>
          Promise.resolve({
            data:
              table === "workflow_dispatch_requests" ? options.ledgerRows : [],
            error: null,
          }),
        then: (resolve: (value: unknown) => unknown) =>
          resolve({
            data:
              table === "donation_saga_outbox" ? (options.sagaRows ?? []) : [],
            error: null,
          }),
      };
      return builder;
    },
  }));

  return { client: { from } as never, tenantFilters, from };
}

describe("workflow run summaries (#298)", () => {
  it("projects ledger and product state into staff-facing summary states", async () => {
    const mock = createSummariesClientMock({
      ledgerRows: [
        ledgerRow(),
        ledgerRow({ id: "req-2", status: "failed", subject_id: "outbox-2" }),
        ledgerRow({ id: "req-3", status: "pending", subject_id: "outbox-3" }),
        ledgerRow({
          id: "req-4",
          status: "dead_letter",
          subject_id: "outbox-4",
        }),
      ],
      sagaRows: [{ id: "outbox-1", status: "completed" }],
    });

    const summaries = await summarizeWorkflowRuns(mock.client, TENANT_ID);

    expect(summaries.map((summary) => summary.state)).toEqual([
      "completed",
      "retrying",
      "dispatching",
      "dead_letter",
    ]);
    expect(summaries[0]).toMatchObject({
      dispatchRequestId: "req-1",
      subjectType: "donation_saga_outbox",
      subjectId: "outbox-1",
    });
  });

  it("excludes secrets, raw payloads, step logs, and provider internals", async () => {
    const mock = createSummariesClientMock({
      ledgerRows: [
        ledgerRow({
          status: "failed",
          last_error_code: "workflow_dispatch_failed",
        }),
      ],
    });

    const summaries = await summarizeWorkflowRuns(mock.client, TENANT_ID);
    const serialized = JSON.stringify(summaries);

    expect(serialized).not.toMatch(
      /sk_live|signed\.example|last_error_message/,
    );
    expect(serialized).not.toMatch(/raw_payload|parsed_text|step|stack/i);
    expect(Object.keys(summaries[0]!).sort()).toEqual(
      [
        "attempts",
        "createdAt",
        "dispatchRequestId",
        "dispatchedAt",
        "lastErrorCode",
        "productArea",
        "state",
        "subjectId",
        "subjectType",
        "workflowName",
      ].sort(),
    );
  });

  it("scopes every query to the tenant", async () => {
    const mock = createSummariesClientMock({
      ledgerRows: [ledgerRow()],
      sagaRows: [{ id: "outbox-1", status: "completed" }],
    });

    await summarizeWorkflowRuns(mock.client, TENANT_ID);

    expect(mock.tenantFilters.length).toBeGreaterThanOrEqual(2);
    for (const filter of mock.tenantFilters) {
      expect(filter.tenantId).toBe(TENANT_ID);
    }
  });
});

describe("workflow notification policy (#298)", () => {
  it("treats dead-letter work as urgent everywhere (stuck infrastructure)", () => {
    const decision = evaluateWorkflowNotification({
      productArea: "email",
      state: "dead_letter",
      attempts: 10,
    });

    expect(decision.level).toBe("urgent");
  });

  it("treats failed money workflows as urgent (donor trust, money integrity)", () => {
    expect(
      evaluateWorkflowNotification({
        productArea: "donations",
        state: "failed",
        attempts: 1,
      }).level,
    ).toBe("urgent");
    expect(
      evaluateWorkflowNotification({
        productArea: "giving",
        state: "failed",
        attempts: 1,
      }).level,
    ).toBe("urgent");
  });

  it("keeps routine retryable failures visible, not urgent", () => {
    const decision = evaluateWorkflowNotification({
      productArea: "donations",
      state: "retrying",
      attempts: 2,
    });

    expect(decision.level).toBe("visible");
  });

  it("lets tenant overrides adjust behavior without making defaults noisy", () => {
    const escalated = evaluateWorkflowNotification(
      { productArea: "email", state: "retrying", attempts: 2 },
      { urgentOnRetry: ["email"] },
    );
    expect(escalated.level).toBe("urgent");

    const muted = evaluateWorkflowNotification(
      { productArea: "donations", state: "failed", attempts: 2 },
      { muteFailed: ["donations"] },
    );
    expect(muted.level).toBe("visible");

    // Untouched areas keep the quiet defaults.
    const untouched = evaluateWorkflowNotification(
      { productArea: "email", state: "retrying", attempts: 2 },
      { muteFailed: ["donations"] },
    );
    expect(untouched.level).toBe("visible");
  });

  it("counts urgent and visible items for the Mission Control header", () => {
    const counts = countWorkflowNotifications([
      { productArea: "donations", state: "failed", attempts: 1 },
      { productArea: "email", state: "retrying", attempts: 1 },
      { productArea: "email", state: "completed", attempts: 1 },
    ]);

    expect(counts).toEqual({ urgent: 1, visible: 2 });
  });
});
