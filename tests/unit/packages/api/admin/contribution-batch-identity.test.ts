import { describe, expect, it } from "vitest";

import {
  contributionBatchIdFromToken,
  isUniqueViolation,
  replayContributionBatch,
} from "../../../../../packages/api/src/admin/contribution-batches/batch-identity";
import { ApiHttpError } from "../../../../../packages/api/src/shared/http-errors";

type Row = Record<string, unknown>;

const TENANT = "tenant-1";
const ACTOR = "profile-1";
const BATCH_ID = "0b6f4f2e-6a1d-4c35-9f0e-2a1b3c4d5e6f";
const SEEDED_GIFT = "80000000-0000-0000-0000-000000000001";

/** A batches table filtered by tenant and id, like the route's read. */
function batchesTable(rows: Row[]) {
  return {
    from(table: string) {
      expect(table).toBe("contribution_operation_batches");
      const filters: Record<string, unknown> = {};
      const query = {
        select: () => query,
        eq(column: string, value: unknown) {
          filters[column] = value;
          return query;
        },
        maybeSingle: async () => ({
          data:
            rows.find((row) =>
              Object.entries(filters).every(
                ([key, value]) => row[key] === value,
              ),
            ) ?? null,
          error: null,
        }),
      };
      return query;
    },
  } as never;
}

function storedBatch(overrides: Row = {}): Row {
  return {
    id: BATCH_ID,
    tenant_id: TENANT,
    operation: "resend_receipt",
    status: "running",
    execution_mode: "background",
    created_by_profile_id: ACTOR,
    selection_snapshot: { records: [{ id: SEEDED_GIFT }] },
    processed_count: 3,
    succeeded_count: 2,
    skipped_count: 1,
    failed_count: 0,
    follow_up_task_count: 0,
    ...overrides,
  };
}

const replay = (
  rows: Row[],
  overrides: Partial<{
    actorProfileId: string;
    actionType: string;
    recordIds: string[];
  }> = {},
) =>
  replayContributionBatch({
    supabaseAdmin: batchesTable(rows),
    tenantId: TENANT,
    batchId: BATCH_ID,
    actorProfileId: overrides.actorProfileId ?? ACTOR,
    actionType: (overrides.actionType ?? "resend_receipt") as never,
    recordIds: overrides.recordIds ?? [SEEDED_GIFT],
  });

describe("contribution batch identity", () => {
  it("uses a GUID confirmation token as the batch id, and nothing else", () => {
    expect(contributionBatchIdFromToken(BATCH_ID.toUpperCase())).toBe(BATCH_ID);
    expect(contributionBatchIdFromToken(SEEDED_GIFT)).toBe(SEEDED_GIFT);
    expect(contributionBatchIdFromToken("confirm")).toBeNull();
  });

  it("recognizes a duplicate batch id insert", () => {
    expect(isUniqueViolation({ code: "23505", message: "duplicate key" })).toBe(
      true,
    );
    expect(isUniqueViolation({ code: "23503", message: "fk" })).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });

  it("has nothing to replay for a new batch", async () => {
    await expect(replay([])).resolves.toBeNull();
  });

  it("returns a running background batch with its continuation instead of creating another", async () => {
    await expect(replay([storedBatch()])).resolves.toEqual({
      batch: {
        id: BATCH_ID,
        status: "running",
        executionMode: "background",
        summary: {
          processed: 3,
          succeeded: 2,
          skipped: 1,
          failed: 0,
          followUpTasksCreated: 0,
        },
      },
      nextAction: {
        method: "POST",
        href: `/api/admin/contribution-batches/${BATCH_ID}/process`,
      },
    });
  });

  it("returns a finished immediate batch's outcome without sending again", async () => {
    await expect(
      replay([
        storedBatch({
          execution_mode: "immediate",
          status: "complete",
          processed_count: 1,
          succeeded_count: 1,
          skipped_count: 0,
        }),
      ]),
    ).resolves.toEqual({
      batch: {
        id: BATCH_ID,
        status: "complete",
        executionMode: "immediate",
        results: [],
        summary: {
          processed: 1,
          succeeded: 1,
          skipped: 0,
          failed: 0,
          followUpTasksCreated: 0,
        },
      },
      nextAction: null,
    });
  });

  it("refuses to run an immediate batch again while the first request is still sending", async () => {
    await expect(
      replay([storedBatch({ execution_mode: "immediate" })]),
    ).rejects.toMatchObject({ status: 409 });
  });

  it.each([
    ["another action", { actionType: "refund" }],
    ["other gifts", { recordIds: ["80000000-0000-0000-0000-000000000002"] }],
    ["another person", { actorProfileId: "profile-2" }],
  ])("refuses a reused token for %s", async (_label, overrides) => {
    const attempt = replay([storedBatch()], overrides);
    await expect(attempt).rejects.toBeInstanceOf(ApiHttpError);
    await expect(attempt).rejects.toMatchObject({ status: 409 });
  });

  it("never replays another organization's batch", async () => {
    await expect(
      replay([storedBatch({ tenant_id: "tenant-2" })]),
    ).resolves.toBeNull();
  });
});
