import { describe, expect, it } from "vitest";

import { createContributionActionDependencies } from "../../../../../packages/api/src/admin/contribution-operations/dependencies";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const TENANT_ID = "tenant-1";
const DONATION_ID = "donation-1";

type Row = Record<string, unknown>;

class TableBuilder {
  private filters: Record<string, unknown> = {};

  constructor(private readonly rows: Row[]) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters[column] = value;
    return this;
  }

  private match(): Row[] {
    return this.rows.filter((row) =>
      Object.entries(this.filters).every(([key, value]) => row[key] === value),
    );
  }

  maybeSingle() {
    return Promise.resolve({ data: this.match()[0] ?? null, error: null });
  }

  single() {
    const data = this.match()[0] ?? null;
    return Promise.resolve({
      data,
      error: data ? null : { message: "not found" },
    });
  }
}

function createStub(): AdminSupabaseClient {
  return {
    from(table: string) {
      if (table === "staged_gifts") {
        return new TableBuilder([
          {
            id: "staged-1",
            tenant_id: TENANT_ID,
            donation_id: DONATION_ID,
            status: "posted",
            crm_post_status: "failed",
            receipt_status: "sent",
          },
        ]);
      }
      if (table === "staged_gift_allocations") {
        return new TableBuilder([
          {
            id: "allocation-1",
            tenant_id: TENANT_ID,
            staged_gift_id: "staged-1",
          },
        ]);
      }
      throw new Error(`unexpected table ${table}`);
    },
  } as unknown as AdminSupabaseClient;
}

describe("contribution action dependency factory", () => {
  it("wires designation-scoped CRM retry to the production adapter boundary", async () => {
    const deps = createContributionActionDependencies(createStub());

    await expect(
      deps.retryDesignationPost!({
        tenantId: TENANT_ID,
        contributionId: DONATION_ID,
        stagedGiftId: "staged-1",
        allocationId: "allocation-1",
        actorProfileId: "profile-1",
        note: "Retry failed designation line",
      }),
    ).rejects.toMatchObject({
      status: 501,
      message: expect.stringMatching(/does not support posting designation/i),
    });
  });
});
