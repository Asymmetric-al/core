import { describe, expect, it } from "vitest";

import { createContributionActionDependencies } from "../../../../../packages/api/src/admin/contribution-operations/dependencies";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

describe("contribution action dependency factory", () => {
  it("does not wire retired CRM posting operations", () => {
    const deps = createContributionActionDependencies(
      {} as AdminSupabaseClient,
    );

    expect(deps.approveStagedGift).toBeUndefined();
    expect(deps.retryStagedGift).toBeUndefined();
    expect(deps.retryDesignationPost).toBeUndefined();
  });
});
