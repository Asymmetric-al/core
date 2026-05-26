import { describe, expect, it } from "vitest";

import {
  decodeContributionCursor,
  encodeContributionCursor,
  parseAdminContributionsParams,
} from "../../../../../packages/api/src/admin/contributions/query";

describe("api/admin/contributions/query", () => {
  it("uses stable defaults for the initial admin grid request", () => {
    const params = parseAdminContributionsParams(new URLSearchParams());

    expect(params.limit).toBe(50);
    expect(params.search).toBeNull();
    expect(params.sort.field).toBe("giftDate");
    expect(params.sort.direction).toBe("desc");
    expect(params.cursor).toBeNull();
    expect(params.filters).toEqual({
      statuses: [],
      contributionTypes: [],
      paymentMethods: [],
      sources: [],
      fundIds: [],
      missionaryIds: [],
      receiptStatuses: [],
      anonymousOnly: false,
      dateFrom: null,
      dateTo: null,
      amountMin: null,
      amountMax: null,
      batchIds: [],
      projectIds: [],
      refundStatuses: [],
      paymentLast4: null,
    });
  });

  it("clamps and normalizes query params into a safe server contract", () => {
    const searchParams = new URLSearchParams([
      ["limit", "500"],
      ["q", "  alice  "],
      ["sort", "amount"],
      ["dir", "asc"],
      ["status", "completed"],
      ["status", "failed"],
      ["type", "one_time,recurring"],
      ["paymentMethod", "Credit Card"],
      ["source", "Online"],
      ["fundId", "fund-1"],
      ["missionaryId", "missionary-1"],
      ["receiptStatus", "sent"],
      ["anonymousOnly", "true"],
      ["dateFrom", "2026-01-01"],
      ["dateTo", "2026-01-31"],
      ["amountMin", "50"],
      ["amountMax", "1000"],
      ["refundStatus", "refunded,partial"],
      ["batchId", "batch-1"],
      ["projectId", "project-1"],
      ["last4", " 4242 "],
    ]);

    const params = parseAdminContributionsParams(searchParams);

    expect(params.limit).toBe(100);
    expect(params.search).toBe("alice");
    expect(params.sort).toEqual({
      field: "amount",
      direction: "asc",
    });
    expect(params.filters).toEqual({
      statuses: ["completed", "failed"],
      contributionTypes: ["one_time", "recurring"],
      paymentMethods: ["Credit Card"],
      sources: ["Online"],
      fundIds: ["fund-1"],
      missionaryIds: ["missionary-1"],
      receiptStatuses: ["sent"],
      anonymousOnly: true,
      dateFrom: "2026-01-01",
      dateTo: "2026-01-31",
      amountMin: 50,
      amountMax: 1000,
      batchIds: ["batch-1"],
      projectIds: ["project-1"],
      refundStatuses: ["refunded", "partial"],
      paymentLast4: "4242",
    });
  });

  it("falls back to the default sort when an unsupported field is requested", () => {
    const params = parseAdminContributionsParams(
      new URLSearchParams([
        ["sort", "donorDisplayName"],
        ["dir", "asc"],
      ]),
    );

    expect(params.sort).toEqual({
      field: "giftDate",
      direction: "desc",
    });
  });

  it("round-trips a contribution cursor safely", () => {
    const encoded = encodeContributionCursor({
      id: "donation-123",
      direction: "desc",
      field: "giftDate",
      value: "2026-04-08",
    });

    expect(decodeContributionCursor(encoded)).toEqual({
      id: "donation-123",
      direction: "desc",
      field: "giftDate",
      value: "2026-04-08",
    });
  });

  it("rejects malformed cursors instead of throwing", () => {
    expect(decodeContributionCursor("not-a-real-cursor")).toBeNull();
  });
});
