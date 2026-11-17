import { type NextRequest, NextResponse } from "next/server";

import { adminUsersListQuerySchema } from "../schemas/admin";
import { listTenantMembers, type TenantMember } from "../shared/tenant-members";
import { withOperation } from "../shared/with-operation";

export const GET = withOperation(
  async ({ supabaseAdmin, auth: ctx, request }) => {
    const { searchParams } = new URL(request.url);
    const parsed = adminUsersListQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? "50",
      offset: searchParams.get("offset") ?? "0",
      role: searchParams.get("role")?.trim() || undefined,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first?.message ?? "Invalid query parameters" },
        { status: 400 },
      );
    }
    const { limit, offset, role } = parsed.data;

    // AL-2675 (NR-68): the tenant's people are its memberships; profiles are
    // read by id. A label names a class, a staff sub-role or `admin` (the
    // flagged staff row); `staff` lists the unflagged staff rows, so the two
    // labels do not overlap. `super_admin` lists nobody: platform operators
    // are WP2c's operator list, not a membership.
    let members;
    try {
      members = (await listTenantMembers(supabaseAdmin, ctx.tenantId)).filter(
        (member) => matchesRoleLabel(member, role),
      );
    } catch (memberError) {
      return NextResponse.json(
        { error: (memberError as Error).message },
        { status: 500 },
      );
    }
    const byProfile = new Map(members.map((m) => [m.profileId, m]));
    const ids = [...byProfile.keys()];

    const { data: profiles, error } =
      ids.length > 0
        ? await supabaseAdmin
            .from("profiles")
            .select("*")
            .in("id", ids)
            .order("created_at", { ascending: false })
        : { data: [], error: null };

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    const data = (profiles ?? [])
      .slice(offset, offset + limit)
      .map((profile) => {
        const member = byProfile.get(profile.id)!;
        return {
          ...profile,
          tenant_id: ctx.tenantId,
          role: member.isTenantAdmin ? "admin" : member.role,
          staff_role: member.staffRole,
          membership_id: member.membershipId,
          is_tenant_admin: member.isTenantAdmin,
        };
      });
    return NextResponse.json({ users: data });
  },
  // Plan 5.4: managing members is the tenant administrator's.
  { capability: "people.manage_members" },
);

/** Read-only demo: user updates disabled. */
export async function PATCH(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}

const STAFF_SUBROLE_LABELS: Record<string, string> = {
  finance: "finance",
  mobilizer: "mobilizer",
  mobilizers: "mobilizer",
  development: "development",
  fundraising: "development",
  hr: "hr",
  member_care: "member_care",
};

/** Whether a membership answers the list's `role` label (none: everyone). */
function matchesRoleLabel(member: TenantMember, label: string | undefined) {
  if (!label) return true;
  if (label === "admin") return member.role === "staff" && member.isTenantAdmin;
  if (label === "staff")
    return member.role === "staff" && !member.isTenantAdmin;
  if (label === "donor" || label === "missionary") return member.role === label;
  const staffRole = STAFF_SUBROLE_LABELS[label];
  return (
    Boolean(staffRole) &&
    member.role === "staff" &&
    member.staffRole === staffRole
  );
}
