import { describe, expect, it } from "vitest";

import {
  actionRequestSchema,
  assertContributionRouteActionSupported,
  decisionRequestSchema,
  isContributionRouteActionSupported,
} from "../../../../../packages/api/src/admin/contribution-operations/route";

import type { ContributionActionType } from "../../../../../packages/api/src/admin/contribution-operations/types";

const VALID_ACTION_REQUEST = {
  contributionId: "00000000-0000-4000-8000-000000000001",
  actionType: "amount_correction",
  reason: "Correct donor-entered amount",
  payload: { amount: 20_000 },
};

describe("admin/contribution-operations route contract", () => {
  it("accepts the routed action source surfaces used by UI and jobs", () => {
    for (const sourceSurface of [
      "contribution_hub",
      "donor_crm_record",
      "automation",
      "bulk_action",
      "api",
    ]) {
      expect(
        actionRequestSchema.parse({
          ...VALID_ACTION_REQUEST,
          sourceSurface,
        }).sourceSurface,
      ).toBe(sourceSurface);
    }
  });

  it("defaults action requests to the api source surface", () => {
    expect(actionRequestSchema.parse(VALID_ACTION_REQUEST).sourceSurface).toBe(
      "api",
    );
  });

  it("accepts refund now that provider refund dependencies are wired", () => {
    expect(isContributionRouteActionSupported("refund")).toBe(true);
    expect(() =>
      assertContributionRouteActionSupported("refund"),
    ).not.toThrow();

    const parsed = actionRequestSchema.safeParse({
      ...VALID_ACTION_REQUEST,
      actionType: "refund",
      reason: "Donor requested a refund",
      confirmationToken: "confirm-refund",
      payload: { amount: 5_000 },
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.actionType).toBe("refund");
  });

  it("rejects action types this route dependency set cannot execute", () => {
    const unsupportedActions: ContributionActionType[] = [
      "metadata_update",
      "donor_relink",
    ];

    for (const actionType of unsupportedActions) {
      const parsed = actionRequestSchema.safeParse({
        ...VALID_ACTION_REQUEST,
        actionType,
      });

      expect(isContributionRouteActionSupported(actionType)).toBe(false);
      expect(parsed.success).toBe(false);
      expect(parsed.error?.issues[0]?.message).toContain(
        "not supported by this route",
      );
      expect(() => assertContributionRouteActionSupported(actionType)).toThrow(
        /not supported by this route|dependencies are wired/,
      );
    }
  });

  it("accepts correction decision payloads", () => {
    expect(
      decisionRequestSchema.parse({
        decision: "approve",
        reason: "Finance reviewed the request",
        receiptDelivery: { choice: "defer", deferReason: "Batch later" },
      }),
    ).toEqual({
      decision: "approve",
      reason: "Finance reviewed the request",
      receiptDelivery: { choice: "defer", deferReason: "Batch later" },
    });
  });
});
