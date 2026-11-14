import { describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App module regression test at its public boundary.
import { isContributionGiftParam } from "../../../../../apps/admin/app/(app)/contributions/contribution-detail-query";

vi.mock("@asym/database/hooks", () => ({
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ["admin", "crm", "records", "detail"],
  ADMIN_CRM_RECORDS_QUERY_KEY: ["admin", "crm", "records"],
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY: [
    "admin",
    "mission-control",
    "needs-attention",
  ],
}));

describe("isContributionGiftParam", () => {
  it("accepts any GUID-shaped id, including seeded ids outside the RFC version range", () => {
    for (const value of [
      "00000000-0000-4000-8000-000000000001",
      "80000000-0000-0000-0000-000000000001",
      "80000000-0000-0000-0000-00000000ABCD",
    ]) {
      expect(isContributionGiftParam(value)).toBe(true);
    }
  });

  it("rejects values that are not GUID-shaped", () => {
    for (const value of [
      null,
      "",
      "not-a-uuid",
      "invalid-contribution-id",
      "80000000-0000-0000-0000-0000000000",
      "80000000000000000000000000000001",
      "g0000000-0000-0000-0000-000000000001",
    ]) {
      expect(isContributionGiftParam(value)).toBe(false);
    }
  });
});
