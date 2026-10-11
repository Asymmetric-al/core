import { afterEach, describe, expect, it, vi } from "vitest";

import { recordCorrectionApprovalOutcome } from "../../../../../../packages/api/src/admin/contribution-operations/approval-notifications";

// Calls existing Core source with a synthetic storage boundary. No database,
// network or D7 implementation is exercised.
describe("D7 existing completion-helper reuse counterexample", () => {
  afterEach(() => vi.useRealTimers());

  it("replaying the same decided outcome rewrites the task completion time", async () => {
    vi.useFakeTimers();
    const task: Record<string, unknown> = { status: "open" };
    const client = {
      from(table: string) {
        expect(table).toBe("mission_control_tasks");
        return {
          update(payload: Record<string, unknown>) {
            const query = {
              eq() {
                return query;
              },
              then(resolve: (value: { error: null }) => unknown) {
                Object.assign(task, payload);
                return Promise.resolve(resolve({ error: null }));
              },
            };
            return query;
          },
        };
      },
    };
    const input: Parameters<typeof recordCorrectionApprovalOutcome>[0] = {
      supabaseAdmin: client as unknown as Parameters<
        typeof recordCorrectionApprovalOutcome
      >[0]["supabaseAdmin"],
      tenantId: "synthetic-tenant",
      decision: "approved",
      decisionReason: null,
      request: {
        id: "synthetic-request",
        tenantId: "synthetic-tenant",
        donationId: "synthetic-donation",
        actionType: "amount_correction",
        payload: {},
        reason: "synthetic fixture",
        requestedByProfileId: null,
        sourceSurface: "api",
        status: "approved",
        expectedRevision: null,
        receiptDeliveryProposal: {},
        decidedByProfileId: "synthetic-actor",
        decidedAt: "2026-10-10T01:00:00.000Z",
        decisionReason: null,
        appliedAdjustmentId: null,
        approvalTaskId: "synthetic-task",
        followUpTaskId: null,
        lastReminderAt: null,
        escalatedAt: null,
        createdAt: "2026-10-09T01:00:00.000Z",
      },
    };
    vi.setSystemTime(new Date("2026-10-10T01:00:00.000Z"));
    await recordCorrectionApprovalOutcome(input);
    expect(task.completed_at).toBe("2026-10-10T01:00:00.000Z");
    vi.setSystemTime(new Date("2026-10-11T01:00:00.000Z"));
    await recordCorrectionApprovalOutcome(input);
    expect(task.completed_at).toBe("2026-10-11T01:00:00.000Z");
    expect(task.status).toBe("completed");
  });
});
