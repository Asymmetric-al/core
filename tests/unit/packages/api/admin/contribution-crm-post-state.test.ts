import { describe, expect, it } from "vitest";

import {
  buildContributionCrmPostState,
  mergeCrmPostLinksByAuthority,
} from "../../../../../packages/api/src/admin/contribution-operations/crm-post-state";

describe("admin/contribution-operations/crm-post-state", () => {
  it("prefers the current staged-gift parent over a legacy donation parent", () => {
    const legacyParent = {
      id: "legacy-parent",
      scope: "parent" as const,
      allocationId: null,
      linkStatus: "active",
      twentyRecordId: "twenty-legacy",
      lastError: null,
    };
    const stagedGiftParent = {
      id: "staged-gift-parent",
      scope: "parent" as const,
      allocationId: null,
      linkStatus: "failed",
      twentyRecordId: "twenty-current",
      lastError: "Current staged-gift post failed.",
    };

    const links = mergeCrmPostLinksByAuthority({
      stagedGiftParentLinks: [stagedGiftParent],
      donationLinks: [legacyParent],
      designationLinks: [],
    });
    const state = buildContributionCrmPostState({
      stagedGiftCrmPostStatus: "posted",
      stagedGiftTwentyRecordId: "twenty-aggregate",
      links,
      designationLineCount: 1,
    });

    expect(links.map((link) => link.id)).toEqual([
      "staged-gift-parent",
      "legacy-parent",
    ]);
    expect(state.parent).toEqual({
      status: "failed",
      twentyRecordId: "twenty-current",
      lastError: "Current staged-gift post failed.",
    });
    expect(state.failedScopes).toEqual([{ scope: "parent" }]);
  });

  it("reports a successful parent and child posting state", () => {
    const state = buildContributionCrmPostState({
      stagedGiftCrmPostStatus: "posted",
      stagedGiftTwentyRecordId: "twenty-parent",
      links: [
        {
          id: "link-parent",
          scope: "parent",
          allocationId: null,
          linkStatus: "active",
          twentyRecordId: "twenty-parent",
          lastError: null,
        },
        {
          id: "link-child-1",
          scope: "designation",
          allocationId: "alloc-1",
          linkStatus: "active",
          twentyRecordId: "twenty-child-1",
          lastError: null,
        },
        {
          id: "link-child-2",
          scope: "designation",
          allocationId: "alloc-2",
          linkStatus: "active",
          twentyRecordId: "twenty-child-2",
          lastError: null,
        },
      ],
      designationLineCount: 2,
    });

    expect(state.parent.status).toBe("posted");
    expect(state.parent.twentyRecordId).toBe("twenty-parent");
    expect(state.designationRecords).toHaveLength(2);
    expect(state.designationRecords[0]).toMatchObject({
      allocationId: "alloc-1",
      status: "posted",
    });
    expect(state.failedScopes).toEqual([]);
    expect(state.adapterLimitation).toBeNull();
  });

  it("surfaces a parent-level failure as a parent retry scope", () => {
    const state = buildContributionCrmPostState({
      stagedGiftCrmPostStatus: "failed",
      stagedGiftTwentyRecordId: null,
      links: [],
      designationLineCount: 1,
    });

    expect(state.parent.status).toBe("failed");
    expect(state.failedScopes).toEqual([{ scope: "parent" }]);
  });

  it("uses parent link failures when the staged gift aggregate is unset or stale", () => {
    const state = buildContributionCrmPostState({
      stagedGiftCrmPostStatus: null,
      stagedGiftTwentyRecordId: null,
      links: [
        {
          id: "link-parent",
          scope: "parent",
          allocationId: null,
          linkStatus: "failed",
          twentyRecordId: null,
          lastError: "Twenty rejected the parent record.",
        },
      ],
      designationLineCount: 1,
    });

    expect(state.parent).toMatchObject({
      status: "failed",
      lastError: "Twenty rejected the parent record.",
    });
    expect(state.failedScopes).toEqual([{ scope: "parent" }]);

    const staleAggregate = buildContributionCrmPostState({
      stagedGiftCrmPostStatus: "posted",
      stagedGiftTwentyRecordId: "twenty-stale-parent",
      links: [
        {
          id: "link-parent",
          scope: "parent",
          allocationId: null,
          linkStatus: "failed",
          twentyRecordId: "twenty-current-parent",
          lastError: "Twenty rejected the parent record.",
        },
      ],
      designationLineCount: 1,
    });

    expect(staleAggregate.parent.status).toBe("failed");
    expect(staleAggregate.parent.twentyRecordId).toBe("twenty-current-parent");
    expect(staleAggregate.failedScopes).toEqual([{ scope: "parent" }]);
  });

  it("surfaces line-specific child failures so retries target only that line", () => {
    const state = buildContributionCrmPostState({
      stagedGiftCrmPostStatus: "posted",
      stagedGiftTwentyRecordId: "twenty-parent",
      links: [
        {
          id: "link-child-1",
          scope: "designation",
          allocationId: "alloc-1",
          linkStatus: "active",
          twentyRecordId: "twenty-child-1",
          lastError: null,
        },
        {
          id: "link-child-2",
          scope: "designation",
          allocationId: "alloc-2",
          linkStatus: "failed",
          twentyRecordId: null,
          lastError: "Twenty rejected the designation record.",
        },
      ],
      designationLineCount: 2,
    });

    expect(state.parent.status).toBe("posted");
    expect(state.failedScopes).toEqual([
      { scope: "designation", allocationId: "alloc-2" },
    ]);
    expect(
      state.designationRecords.find((r) => r.allocationId === "alloc-2")
        ?.lastError,
    ).toMatch(/rejected/);
  });

  it("surfaces the adapter limitation for split gifts without child records", () => {
    const state = buildContributionCrmPostState({
      stagedGiftCrmPostStatus: "posted",
      stagedGiftTwentyRecordId: "twenty-parent",
      links: [],
      designationLineCount: 3,
    });

    expect(state.adapterLimitation).toMatch(
      /historical CRM posting record.*single parent record/i,
    );
    expect(state.adapterLimitation).not.toMatch(/connected CRM adapter/i);
    expect(state.designationRecords).toEqual([]);
  });
});
