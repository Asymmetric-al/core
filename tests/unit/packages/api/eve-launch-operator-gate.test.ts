import { describe, expect, it, vi } from "vitest";

import {
  grantEveLaunchPermission,
  reviewEveLaunchManifest,
} from "../../../../packages/api/src/eve/launch-readiness/control";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * AL-2675 (WP2c, part 1; plan 12 WP2c): Eve's launch steps that belong to the
 * platform (launch permissions, reviews, activation, canary close) were gated
 * on the `super_admin` role name, which no membership holds since WP2a. They
 * act as the platform operator only when the shared operator check passed
 * (`withOperation`'s `isPlatformOperator()`), and then send Eve's SQL the
 * platform actor role, which it judges by the operator list and a live row in
 * the tenant (20261119135600_wp2c_eve_actor_checks_operator_list.sql).
 */
const TENANT = "43700000-0000-4000-8000-000000000001";
const PROFILE = "43700000-0000-4000-8000-000000000002";

function auth(role: string): AuthenticatedContext {
  return {
    userId: "verified-user-1",
    email: "operator@example.test",
    tenantId: TENANT,
    role,
    memberships: [],
    profileId: PROFILE,
    isAuthenticated: true,
  } as AuthenticatedContext;
}

const grant = (role: string, platformOperator?: boolean) => {
  const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
  return {
    rpc,
    run: grantEveLaunchPermission({
      auth: auth(role),
      enabled: true,
      permission: "release.review",
      platformOperator,
      profileId: "43700000-0000-4000-8000-000000000009",
      reason: "Release reviewer for the canary",
      supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
    }),
  };
};

describe("Eve launch steps of the platform (WP2c)", () => {
  it.each([
    ["a tenant administrator", "admin", undefined],
    [
      "a super_admin role name the check did not confirm",
      "super_admin",
      undefined,
    ],
    ["anyone the check refused", "admin", false],
  ] as const)(
    "refuses launch permissions to %s, before any database call",
    async (_who, role, platformOperator) => {
      const { rpc, run } = grant(role, platformOperator);
      await expect(run).rejects.toMatchObject({ status: 403 });
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  it("grants launch permissions for a confirmed operator, as the platform actor in the operator's tenant", async () => {
    const { rpc, run } = grant("admin", true);
    await expect(run).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith(
      "grant_eve_launch_permission",
      expect.objectContaining({
        p_actor_role: "super_admin",
        p_actor_profile_id: PROFILE,
        p_tenant_id: TENANT,
      }),
    );
  });

  it("sends a review as the platform actor only for a confirmed operator", async () => {
    for (const [platformOperator, actorRole] of [
      [true, "super_admin"],
      [false, "admin"],
    ] as const) {
      const rpc = vi.fn().mockResolvedValue({
        data: {
          createdAt: "2026-11-19T00:00:00.000Z",
          decision: "approved",
          manifestId: "43700000-0000-4000-8000-000000000006",
          reviewerProfileId: PROFILE,
          reviewerRole: "release",
          summary: "Looks ready.",
        },
        error: null,
      });
      await reviewEveLaunchManifest({
        auth: auth("admin"),
        decision: "approved",
        manifestId: "43700000-0000-4000-8000-000000000006",
        platformOperator,
        reviewerRole: "release",
        summary: "Looks ready.",
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      });
      expect(rpc).toHaveBeenCalledWith(
        "review_eve_launch_manifest",
        expect.objectContaining({
          p_actor_role: actorRole,
          p_tenant_id: TENANT,
        }),
      );
    }
  });
});
