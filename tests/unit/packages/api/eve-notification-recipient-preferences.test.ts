import { describe, expect, it } from "vitest";

import { listEveNotificationRecipients } from "../../../../packages/api/src/eve/notifications/store";
import {
  DATA_API_MAX_ROWS,
  type FakeMembership,
  fakeServiceClient,
} from "../../../fixtures/fake-service-client";

/**
 * AL-2675 (WP2c, part 1): the Eve notification recipient PATCH opens to
 * platform operators and its trigger admits every live administrator of the
 * tenant, so the recipient preferences are no longer "a handful" (council
 * round 2 on WP2a, R2, asked for this when WP2c opened them). The read pages
 * to the end: here an administrator's preference row sorts after more rows
 * than one Data API response holds, and the double cuts every read at that
 * size, as the Data API does.
 */
const TENANT = "11111111-1111-4111-8111-111111111111";
const STALE = DATA_API_MAX_ROWS + 150;
const uuid = (prefix: string, n: number) =>
  `${prefix}-0000-4000-8000-${String(n).padStart(12, "0")}`;
const ADMIN = {
  membership: uuid("cccccccc", 1),
  user: uuid("aaaaaaaa", 1),
  profile: "ffffffff-ffff-4fff-8fff-ffffffffffff",
};

function tenantWithManyPreferenceRows() {
  const memberships: FakeMembership[] = [
    {
      id: ADMIN.membership,
      user_id: ADMIN.user,
      tenant_id: TENANT,
      role: "staff",
      staff_role: "development",
      is_tenant_admin: true,
      is_active: true,
    },
  ];
  const preferences: Record<string, unknown>[] = [];
  // Rows left by people who are administrators no longer; their profile ids
  // sort before the administrator's.
  for (let n = 1; n <= STALE; n += 1)
    preferences.push({
      tenant_id: TENANT,
      profile_id: uuid("bbbbbbbb", n),
      enabled: false,
      opted_out: true,
    });
  preferences.push({
    tenant_id: TENANT,
    profile_id: ADMIN.profile,
    enabled: true,
    opted_out: false,
  });
  return fakeServiceClient(
    {
      memberships,
      tables: {
        profiles: [
          {
            id: ADMIN.profile,
            user_id: ADMIN.user,
            email: "admin@example.org",
            display_name: "Administrator",
            full_name: null,
          },
        ],
        eve_notification_recipient_configs: preferences,
      },
    },
    { maxRows: DATA_API_MAX_ROWS, capFromReads: true },
  );
}

describe("Eve notification recipients read every preference row (WP2c)", () => {
  it("finds an administrator's preference after more rows than one response holds", async () => {
    const client = tenantWithManyPreferenceRows();
    const recipients = await listEveNotificationRecipients({
      supabaseAdmin: client as never,
      tenantId: TENANT,
    });
    expect(recipients).toEqual([
      {
        tenantId: TENANT,
        profileId: ADMIN.profile,
        email: "admin@example.org",
        displayName: "Administrator",
        role: "tenant_admin",
        enabled: true,
        optedOut: false,
      },
    ]);
    // Two pages of preference rows, then the empty page that ends the read.
    expect(
      client.calls.filter(
        (c) => c === "from:eve_notification_recipient_configs",
      ),
    ).toHaveLength(Math.ceil((STALE + 1) / 500) + 1);
  });
});
