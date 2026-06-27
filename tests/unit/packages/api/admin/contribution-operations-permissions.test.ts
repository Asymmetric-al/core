import { describe, expect, it } from "vitest";

import {
  assertContributionActionPermission,
  hasContributionPermission,
  resolveContributionCapabilities,
} from "../../../../../packages/api/src/admin/contribution-operations/permissions";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { ContributionActionType } from "../../../../../packages/api/src/admin/contribution-operations/types";

const APPROVAL_REQUEST_ACTION_TYPES = [
  "refund",
  "stripe_replay",
  "donor_relink",
  "amount_correction",
  "designation_correction",
  "fund_correction",
  "allocation_correction",
  "receipt_correction",
  "statement_correction",
  "payment_state_correction",
] satisfies ContributionActionType[];

function authContext(
  overrides: Partial<AuthenticatedContext>,
): AuthenticatedContext {
  return {
    userId: "user_1",
    email: "finance@example.com",
    tenantId: "tenant_1",
    role: "staff",
    profileRole: "staff",
    memberships: [],
    profileId: "profile_1",
    isAuthenticated: true,
    ...overrides,
  };
}

describe("contribution operations permissions", () => {
  it("allows finance staff to perform direct correction actions", () => {
    const auth = authContext({
      memberships: [
        {
          tenantId: "tenant_1",
          role: "staff",
          staffRole: "finance",
          isActive: true,
        },
      ],
    });

    expect(
      hasContributionPermission(auth, "finance:manage_contributions"),
    ).toBe(true);
    expect(() =>
      assertContributionActionPermission(auth, "amount_correction"),
    ).not.toThrow();
  });

  it("allows admins to perform high-risk contribution actions", () => {
    const auth = authContext({ role: "admin", profileRole: "admin" });

    expect(() =>
      assertContributionActionPermission(auth, "donor_relink"),
    ).not.toThrow();
  });

  it("blocks non-finance staff from high-risk contribution actions", () => {
    const auth = authContext({
      memberships: [
        {
          tenantId: "tenant_1",
          role: "staff",
          staffRole: "development",
          isActive: true,
        },
      ],
    });

    expect(
      hasContributionPermission(auth, "finance:manage_contributions"),
    ).toBe(false);
    expect(() => assertContributionActionPermission(auth, "refund")).toThrow(
      "contributions.run_refunds",
    );
  });

  it("requires granular capability for low-risk contribution actions", () => {
    const nonMember = authContext({ role: "staff", profileRole: "staff" });
    const financeStaff = authContext({
      memberships: [
        {
          tenantId: "tenant_1",
          role: "staff",
          staffRole: "finance",
          isActive: true,
        },
      ],
    });

    expect(() =>
      assertContributionActionPermission(nonMember, "resend_receipt"),
    ).toThrow("contributions.manage_receipts");

    expect(() =>
      assertContributionActionPermission(financeStaff, "resend_receipt"),
    ).not.toThrow();
  });

  it("allows donor-care staff to request approval-gated actions only in request mode", () => {
    const donorCare = authContext({
      memberships: [
        {
          tenantId: "tenant_1",
          role: "staff",
          staffRole: "development",
          isActive: true,
        },
      ],
    });

    for (const actionType of APPROVAL_REQUEST_ACTION_TYPES) {
      expect(() =>
        assertContributionActionPermission(donorCare, actionType),
      ).toThrow();
      expect(() =>
        assertContributionActionPermission(donorCare, actionType, {
          mode: "request",
        }),
      ).not.toThrow();
    }

    expect(() =>
      assertContributionActionPermission(donorCare, "resend_receipt"),
    ).toThrow("contributions.manage_receipts");
    expect(() =>
      assertContributionActionPermission(donorCare, "resend_receipt", {
        mode: "request",
      }),
    ).toThrow("contributions.manage_receipts");
  });

  it("still blocks correction request actions without tenant staff membership", () => {
    const nonMember = authContext({ role: "staff", profileRole: "staff" });

    expect(() =>
      assertContributionActionPermission(nonMember, "amount_correction", {
        mode: "request",
      }),
    ).toThrow(
      "contributions.apply_corrections or contributions.request_corrections",
    );
  });

  it("resolves granular capabilities backing staff-friendly roles", () => {
    const donorCare = resolveContributionCapabilities(
      authContext({
        role: "staff",
        profileRole: "staff",
        memberships: [
          {
            tenantId: "tenant_1",
            role: "staff",
            staffRole: "development",
            isActive: true,
          },
        ],
      }),
    );
    expect(donorCare).toContain("contributions.view_detail");
    expect(donorCare).toContain("contributions.request_corrections");
    expect(donorCare).not.toContain("contributions.apply_corrections");
    expect(donorCare).not.toContain("contributions.approve_corrections");

    const financeStaff = resolveContributionCapabilities(
      authContext({
        memberships: [
          {
            tenantId: "tenant_1",
            role: "staff",
            staffRole: "finance",
            isActive: true,
          },
        ],
      }),
    );
    expect(financeStaff).toContain("contributions.apply_corrections");
    expect(financeStaff).toContain("contributions.manage_receipts");
    expect(financeStaff).not.toContain("contributions.approve_corrections");

    const approver = resolveContributionCapabilities(
      authContext({ role: "admin", profileRole: "admin" }),
    );
    expect(approver).toContain("contributions.approve_corrections");
    expect(approver).toContain("contributions.run_refunds");
    expect(approver).not.toContain("contributions.manage_settings");

    const superAdmin = resolveContributionCapabilities(
      authContext({ role: "super_admin", profileRole: "super_admin" }),
    );
    expect(superAdmin).toContain("contributions.manage_settings");
    expect(superAdmin).toContain("crm.gift_history.manage_view_defaults");
  });

  it("does not grant contribution capabilities without tenant membership", () => {
    const capabilities = resolveContributionCapabilities(
      authContext({ role: "staff", profileRole: "staff", memberships: [] }),
    );

    expect(capabilities).toEqual([]);
  });

  it("does not grant contribution capabilities to non-staff memberships", () => {
    const donorCapabilities = resolveContributionCapabilities(
      authContext({
        role: "donor",
        profileRole: "donor",
        memberships: [
          {
            tenantId: "tenant_1",
            role: "donor",
            staffRole: null,
            isActive: true,
          },
        ],
      }),
    );
    const missionaryCapabilities = resolveContributionCapabilities(
      authContext({
        role: "missionary",
        profileRole: "missionary",
        memberships: [
          {
            tenantId: "tenant_1",
            role: "missionary",
            staffRole: null,
            isActive: true,
          },
        ],
      }),
    );

    expect(donorCapabilities).toEqual([]);
    expect(missionaryCapabilities).toEqual([]);
  });
});
