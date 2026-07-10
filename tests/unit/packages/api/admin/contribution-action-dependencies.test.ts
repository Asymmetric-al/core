import { describe, expect, it } from "vitest";

import { createContributionActionDependencies } from "../../../../../packages/api/src/admin/contribution-operations/dependencies";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

describe("contribution action dependency factory", () => {
  it("does not advertise designation retry while the production adapter rejects it", () => {
    const deps = createContributionActionDependencies(
      {} as AdminSupabaseClient,
    );

    expect(deps.retryDesignationPost).toBeUndefined();
  });
});
