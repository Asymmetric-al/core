import { describe, expect, it } from "vitest";

import {
  correctionRequiresApproval,
  resolveCorrectionApprovalPolicy,
} from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";
import {
  assertContributionActionPermission,
  resolveContributionCapabilities,
} from "../../../../../packages/api/src/admin/contribution-operations/permissions";
import { viewerCanUseContributionOperation } from "../../../../../packages/api/src/admin/contribution-operations/viewer-action-availability";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { CrmGiftInlineActionType } from "@asym/database/types";

const TENANT_ID = "00000000-0000-4000-8000-000000000003";

function persona(input: { name: string; role: string; staffRole?: string }): {
  name: string;
  auth: AuthenticatedContext;
} {
  const memberships =
    input.staffRole === undefined
      ? []
      : [
          {
            isActive: true,
            tenantId: TENANT_ID,
            role: "staff",
            staffRole: input.staffRole,
          },
        ];

  return {
    name: input.name,
    auth: {
      userId: "user_1",
      email: "person@example.com",
      tenantId: TENANT_ID,
      role: input.role,
      profileRole: input.role,
      memberships,
      profileId: "00000000-0000-4000-8000-000000000002",
      isAuthenticated: true,
    } as AuthenticatedContext,
  };
}

const PERSONAS = [
  persona({ name: "super admin", role: "super_admin" }),
  persona({ name: "finance approver (admin)", role: "admin" }),
  persona({ name: "finance staff", role: "staff", staffRole: "finance" }),
  persona({ name: "donor care staff", role: "staff", staffRole: "care" }),
  persona({ name: "no access", role: "donor" }),
];

const PARITY_ACTION_TYPES: CrmGiftInlineActionType[] = [
  "refund",
  "stripe_replay",
  "amount_correction",
];

const POLICIES = [
  {
    name: "separation of duties",
    policy: resolveCorrectionApprovalPolicy(null),
  },
  {
    name: "no approval required",
    policy: resolveCorrectionApprovalPolicy({
      ownership_mode: "no_approval_required",
    }),
  },
];

/**
 * The route gate (assertContributionActionPermission) and the viewer
 * availability projection (viewerCanUseContributionOperation) must agree for
 * every role-derived capability set, or the UI advertises actions the route
 * then rejects (issue #270). This pins the agreement across personas,
 * provider and correction actions, and both approval-policy shapes.
 */
describe("contribution action authorization parity", () => {
  for (const { name: policyName, policy } of POLICIES) {
    for (const actionType of PARITY_ACTION_TYPES) {
      for (const { name: personaName, auth } of PERSONAS) {
        it(`${actionType} under ${policyName}: viewer availability matches the route gate for ${personaName}`, () => {
          const mode = correctionRequiresApproval({ actionType, policy })
            ? "request"
            : "direct";

          let routeAllows = true;
          try {
            assertContributionActionPermission(auth, actionType, { mode });
          } catch {
            routeAllows = false;
          }

          const viewerAllows = viewerCanUseContributionOperation({
            actionType,
            approvalPolicy: policy,
            viewerCapabilities: resolveContributionCapabilities(auth),
          });

          expect(viewerAllows).toBe(routeAllows);
        });
      }
    }
  }
});
