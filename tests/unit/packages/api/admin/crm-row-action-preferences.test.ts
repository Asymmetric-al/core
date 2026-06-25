import { describe, expect, it } from "vitest";

import {
  CRM_GIFT_HISTORY_TABLE_ID,
  CRM_ROW_ACTION_SCHEMA_VERSION,
  migrateCrmRowActionId,
  resolveCrmRowAction,
} from "../../../../../packages/api/src/admin/crm/table-preferences/row-action";

import type { CrmGiftInlineActionEntry } from "../../../../../packages/database/types/crm-detail";

function entry(
  actionType: CrmGiftInlineActionEntry["actionType"],
  overrides: Partial<CrmGiftInlineActionEntry> = {},
): CrmGiftInlineActionEntry {
  return {
    actionType,
    available: true,
    blockedReason: null,
    nextStep: null,
    riskLevel: "low",
    ...overrides,
  };
}

const ENTRIES: CrmGiftInlineActionEntry[] = [
  entry("amount_correction", { riskLevel: "high" }),
  entry("fund_correction", { riskLevel: "high" }),
  entry("resend_receipt"),
  entry("retry_staged_gift", {
    available: false,
    blockedReason: "There is no failed or blocked posting to retry.",
    nextStep:
      "Retry becomes available when staged gift processing or CRM posting fails.",
  }),
  entry("refund", {
    riskLevel: "high",
    available: false,
    blockedReason: "This gift is already fully refunded.",
  }),
];

describe("admin/crm/table-preferences/row-action", () => {
  it("exposes a stable table id and schema version", () => {
    expect(CRM_GIFT_HISTORY_TABLE_ID).toBe("crm.giftHistory");
    expect(CRM_ROW_ACTION_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });

  it("uses a valid user pin first", () => {
    const resolved = resolveCrmRowAction({
      userPin: { actionId: "amount_correction" },
      tenantDefault: { actionId: "resend_receipt" },
      entries: ENTRIES,
    });

    expect(resolved).toEqual({
      actionType: "amount_correction",
      source: "user_pin",
      explanation: null,
    });
  });

  it("falls back from a blocked pin to a valid tenant default with explanation", () => {
    const resolved = resolveCrmRowAction({
      userPin: { actionId: "retry_staged_gift" },
      tenantDefault: { actionId: "fund_correction" },
      entries: ENTRIES,
    });

    expect(resolved.actionType).toBe("fund_correction");
    expect(resolved.source).toBe("tenant_default");
    expect(resolved.explanation).toMatch(/pinned action/i);
    expect(resolved.explanation).toMatch(
      /no failed or blocked posting to retry/i,
    );
  });

  it("falls back from a pin the viewer has no capability for", () => {
    // stripe_replay is not in the capability-filtered entries at all.
    const resolved = resolveCrmRowAction({
      userPin: { actionId: "stripe_replay" },
      tenantDefault: null,
      entries: ENTRIES,
    });

    expect(resolved.actionType).toBe("resend_receipt");
    expect(resolved.source).toBe("system");
    expect(resolved.explanation).toMatch(/isn't available to you/i);
  });

  it("falls back from an invalid tenant default to the system next-best", () => {
    const resolved = resolveCrmRowAction({
      userPin: null,
      tenantDefault: { actionId: "refund" },
      entries: ENTRIES,
    });

    expect(resolved.actionType).toBe("resend_receipt");
    expect(resolved.source).toBe("system");
    expect(resolved.explanation).toMatch(/tenant default/i);
    expect(resolved.explanation).toMatch(/already fully refunded/i);
  });

  it("resolves to the system next-best when no preference is set", () => {
    const resolved = resolveCrmRowAction({
      userPin: null,
      tenantDefault: null,
      entries: ENTRIES,
    });

    expect(resolved).toEqual({
      actionType: "resend_receipt",
      source: "system",
      explanation: null,
    });
  });

  it("migrates renamed operation ids stored by older schema versions", () => {
    expect(migrateCrmRowActionId("send_receipt")).toBe("resend_receipt");
    expect(migrateCrmRowActionId("retry_crm_posting")).toBe(
      "retry_staged_gift",
    );
    expect(migrateCrmRowActionId("resend_receipt")).toBe("resend_receipt");

    const resolved = resolveCrmRowAction({
      userPin: { actionId: "send_receipt", schemaVersion: 0 },
      tenantDefault: null,
      entries: ENTRIES,
    });
    expect(resolved.actionType).toBe("resend_receipt");
    expect(resolved.source).toBe("user_pin");
  });

  it("drops removed operation ids with a clear explanation", () => {
    expect(migrateCrmRowActionId("legacy_export_gift")).toBeNull();

    const resolved = resolveCrmRowAction({
      userPin: { actionId: "legacy_export_gift" },
      tenantDefault: null,
      entries: ENTRIES,
    });
    expect(resolved.actionType).toBe("resend_receipt");
    expect(resolved.source).toBe("system");
    expect(resolved.explanation).toMatch(/no longer exists/i);
  });

  it("returns null when nothing valid remains (never invents an action)", () => {
    const blockedOnly = [
      entry("retry_staged_gift", {
        available: false,
        blockedReason: "There is no failed or blocked posting to retry.",
      }),
    ];
    const resolved = resolveCrmRowAction({
      userPin: { actionId: "retry_staged_gift" },
      tenantDefault: null,
      entries: blockedOnly,
    });

    expect(resolved.actionType).toBeNull();
    expect(resolved.source).toBe("system");
    expect(resolved.explanation).toMatch(/blocked/i);
  });
});
