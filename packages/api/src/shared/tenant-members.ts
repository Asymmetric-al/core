import type { MembershipRole, StaffSubrole } from "@asym/database/types";

/**
 * The people of one tenant, read from membership (AL-2675, the WP2a sweep;
 * plan 12 WP2, the WP2a paragraph; audit NR-68). A profile holds one tenant
 * at most and a person may now hold memberships in two, so no server query
 * filters `profiles` on `tenant_id` or `role`: it asks
 * `public.tenant_member_profiles` (service key only) which memberships the
 * tenant holds, then reads profiles by id.
 */
export interface TenantMember {
  membershipId: string;
  userId: string;
  profileId: string;
  role: MembershipRole;
  staffRole: StaffSubrole | null;
  isTenantAdmin: boolean;
  /** Live: active and not revoked. Only `includeRevoked` returns others. */
  isLive: boolean;
}

export interface TenantMemberQuery {
  profileIds?: readonly string[];
  userIds?: readonly string[];
  /** Also return revoked memberships, for history a record keeps (an author). */
  includeRevoked?: boolean;
}

/** The service-key client's RPC; the generated database types do not list it. */
interface TenantMemberRpc {
  rpc(
    fn: "tenant_member_profiles",
    args: {
      p_tenant_id: string;
      p_profile_ids: string[] | null;
      p_user_ids: string[] | null;
      p_include_revoked: boolean;
    },
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

type MemberRow = {
  membership_id: string;
  user_id: string;
  profile_id: string;
  role: MembershipRole;
  staff_role: StaffSubrole | null;
  is_tenant_admin: boolean;
  is_live: boolean;
};

/** Any service-key client: only its `rpc` is used. */
export type TenantMemberClient = { rpc: unknown };

export async function listTenantMembers(
  client: TenantMemberClient,
  tenantId: string,
  query: TenantMemberQuery = {},
): Promise<TenantMember[]> {
  if (query.profileIds?.length === 0 || query.userIds?.length === 0) {
    return [];
  }

  const { data, error } = await (client as TenantMemberRpc).rpc(
    "tenant_member_profiles",
    {
      p_tenant_id: tenantId,
      p_profile_ids: query.profileIds ? [...new Set(query.profileIds)] : null,
      p_user_ids: query.userIds ? [...new Set(query.userIds)] : null,
      p_include_revoked: query.includeRevoked ?? false,
    },
  );
  if (error) {
    throw new Error(`tenant_member_profiles failed: ${error.message}`);
  }
  if (!Array.isArray(data)) {
    throw new Error("tenant_member_profiles returned a non-array result");
  }

  return (data as MemberRow[]).map((row) => ({
    membershipId: row.membership_id,
    userId: row.user_id,
    profileId: row.profile_id,
    role: row.role,
    staffRole: row.staff_role,
    isTenantAdmin: row.is_tenant_admin,
    isLive: row.is_live,
  }));
}

/** Those of `profileIds` whose login holds a membership in the tenant. */
export async function tenantMemberProfileIds(
  client: TenantMemberClient,
  tenantId: string,
  profileIds: readonly (string | null | undefined)[],
  options: { includeRevoked?: boolean } = {},
): Promise<string[]> {
  const ids = [
    ...new Set(profileIds.filter((id): id is string => Boolean(id))),
  ];
  if (ids.length === 0) return [];
  const members = await listTenantMembers(client, tenantId, {
    profileIds: ids,
    includeRevoked: options.includeRevoked,
  });
  return [...new Set(members.map((member) => member.profileId))];
}

/** Whether the profile's login holds a live membership in the tenant. */
export async function isTenantMemberProfile(
  client: TenantMemberClient,
  tenantId: string,
  profileId: string,
): Promise<boolean> {
  return (
    (await tenantMemberProfileIds(client, tenantId, [profileId])).length > 0
  );
}
