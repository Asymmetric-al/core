import { describe, expect, it } from "vitest";

import { membershipHasCapability } from "../../../../../packages/auth/context";
import { listEligibleApprovers } from "../../../../../packages/api/src/admin/contribution-operations/approval-notifications";
import { listEveNotificationRecipients } from "../../../../../packages/api/src/eve/notifications/store";
import {
  listTenantMembers,
  TENANT_MEMBER_PAGE_SIZE,
} from "../../../../../packages/api/src/shared/tenant-members";
import {
  DATA_API_MAX_ROWS,
  type FakeMembership,
  fakeServiceClient,
} from "../../../../fixtures/fake-service-client";

/**
 * Council round 1 on WP2a, F7: a tenant's people are read in bounded pages,
 * by what the caller needs. Every sign-up is a member, so a real tenant holds
 * more members than the Data API returns in one response (`max_rows`, 1,000),
 * and the API cuts the rest without an error. The test double cuts the same
 * way. The tenant here has 1,200 donors and one administrator whose
 * membership id sorts after all of them.
 */
const TENANT = "11111111-1111-4111-8111-111111111111";
const DONORS = 1200;
const uuid = (prefix: string, n: number) =>
  `${prefix}-0000-4000-8000-${String(n).padStart(12, "0")}`;
const ADMIN = {
  membership: "ffffffff-ffff-4fff-8fff-ffffffffffff",
  user: uuid("aaaaaaaa", 9999),
  profile: uuid("bbbbbbbb", 9999),
};

function largeTenant(
  options: {
    maxRows?: number;
    capFromReads?: boolean;
    preferences?: boolean;
  } = {},
) {
  const memberships: FakeMembership[] = [];
  const profiles: Record<string, unknown>[] = [];
  for (let n = 1; n <= DONORS; n += 1) {
    memberships.push({
      id: uuid("cccccccc", n),
      user_id: uuid("aaaaaaaa", n),
      tenant_id: TENANT,
      role: "donor",
      staff_role: null,
      is_tenant_admin: false,
      is_active: true,
    });
    profiles.push({
      id: uuid("bbbbbbbb", n),
      user_id: uuid("aaaaaaaa", n),
      email: `donor${n}@example.org`,
      display_name: `Donor ${n}`,
      full_name: null,
    });
  }
  memberships.push({
    id: ADMIN.membership,
    user_id: ADMIN.user,
    tenant_id: TENANT,
    role: "staff",
    staff_role: "development",
    is_tenant_admin: true,
    is_active: true,
  });
  profiles.push({
    id: ADMIN.profile,
    user_id: ADMIN.user,
    email: "admin@example.org",
    display_name: "Administrator",
    full_name: null,
  });
  return fakeServiceClient(
    {
      memberships,
      tables: {
        profiles,
        // One preference row per member when asked; the administrator's
        // row comes last, after a full Data API response.
        contribution_approval_notification_preferences: options.preferences
          ? profiles.map((profile) => ({
              tenant_id: TENANT,
              profile_id: profile.id,
              in_app_enabled: true,
              email_enabled: profile.id === ADMIN.profile,
            }))
          : [],
        eve_notification_recipient_configs: [],
      },
    },
    { maxRows: options.maxRows, capFromReads: options.capFromReads },
  );
}

describe("the tenant's people in bounded pages (council round 1 on WP2a, F7)", () => {
  it("has more members than one Data API response", () => {
    expect(DONORS + 1).toBeGreaterThan(DATA_API_MAX_ROWS);
    expect(TENANT_MEMBER_PAGE_SIZE).toBeLessThan(DATA_API_MAX_ROWS);
  });

  it("reads every member, page by page", async () => {
    const client = largeTenant();
    const members = await listTenantMembers(client, TENANT);
    expect(members).toHaveLength(DONORS + 1);
    expect(new Set(members.map((m) => m.membershipId)).size).toBe(DONORS + 1);
    expect(members.at(-1)?.profileId).toBe(ADMIN.profile);
    // Three full pages, then the empty page that ends the read.
    expect(client.calls).toEqual(
      Array(Math.ceil((DONORS + 1) / TENANT_MEMBER_PAGE_SIZE) + 1).fill(
        "rpc:tenant_member_profiles",
      ),
    );
  });

  // Council round 2 on WP2a, R2: `max_rows` is a dashboard setting on hosted
  // Supabase. A server that returns fewer rows than a page asks for must not
  // end the read.
  it("reads every member when the server's cap is below the page size", async () => {
    const cap = 300;
    expect(cap).toBeLessThan(TENANT_MEMBER_PAGE_SIZE);
    const client = largeTenant({ maxRows: cap });
    const members = await listTenantMembers(client, TENANT);
    expect(members).toHaveLength(DONORS + 1);
    expect(new Set(members.map((m) => m.membershipId)).size).toBe(DONORS + 1);
    expect(members.at(-1)?.profileId).toBe(ADMIN.profile);
    expect(client.calls).toHaveLength(Math.ceil((DONORS + 1) / cap) + 1);
  });

  it("asks the database for a class and the administrator flag", async () => {
    const client = largeTenant();
    const admins = await listTenantMembers(client, TENANT, {
      role: "staff",
      tenantAdmin: true,
    });
    expect(admins.map((m) => m.profileId)).toEqual([ADMIN.profile]);
    // One page of one row, then the empty page.
    expect(client.calls).toEqual([
      "rpc:tenant_member_profiles",
      "rpc:tenant_member_profiles",
    ]);
  });

  it("lists the administrator as an approver", async () => {
    // Only staff rows hold the approver capability: the read asks for them.
    for (const role of ["donor", "missionary"] as const)
      expect(
        membershipHasCapability(
          {
            tenantId: TENANT,
            role,
            staffRole: null,
            isActive: true,
            isTenantAdmin: false,
          },
          "contributions.approve_corrections",
        ),
      ).toBe(false);

    const approvers = await listEligibleApprovers(
      largeTenant() as never,
      TENANT,
    );
    expect(approvers.map((a) => a.profileId)).toEqual([ADMIN.profile]);
  });

  // Council round 2 on WP2a, R2: the approvers' notification preferences
  // are read to the end as well; nothing bounds that table's rows.
  it("reads the administrator's approval preference past the Data API's cap", async () => {
    const approvers = await listEligibleApprovers(
      largeTenant({ capFromReads: true, preferences: true }) as never,
      TENANT,
    );
    expect(approvers).toEqual([
      {
        profileId: ADMIN.profile,
        preference: { inAppEnabled: true, emailEnabled: true },
      },
    ]);
  });

  it("lists the administrator as an Eve notification recipient", async () => {
    const recipients = await listEveNotificationRecipients({
      supabaseAdmin: largeTenant() as never,
      tenantId: TENANT,
    });
    expect(recipients.map((r) => r.profileId)).toEqual([ADMIN.profile]);
  });
});
