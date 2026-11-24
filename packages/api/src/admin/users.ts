import { NextResponse } from "next/server";

import { adminUsersListQuerySchema } from "../schemas/admin";
import { withOperation } from "../shared/with-operation";

/** One row of `public.tenant_member_directory`. */
type DirectoryRow = {
  membership_id: string;
  user_id: string;
  profile_id: string | null;
  display_name: string | null;
  email: string | null;
  role: "donor" | "missionary" | "staff";
  staff_role: string | null;
  is_tenant_admin: boolean;
  updated_at: string;
};

type DirectoryResult = {
  data: DirectoryRow[] | null;
  error: { code?: string; message: string } | null;
};

/** The caller-token client's RPC; the generated database types do not list it. */
interface DirectoryQuery extends PromiseLike<DirectoryResult> {
  eq(column: string, value: string | boolean): DirectoryQuery;
  order(
    column: string,
    options: { ascending: boolean; nullsFirst?: boolean },
  ): DirectoryQuery;
  range(from: number, to: number): DirectoryQuery;
}
interface DirectoryClient {
  rpc(
    fn: "tenant_member_directory",
    args: { p_tenant_id: string },
  ): DirectoryQuery;
}

/**
 * The tenant's people, for Mission Control's staff screens (council round 1
 * on WP2a, F8; plan 5.1). They come from `public.tenant_member_directory` on
 * the caller's own token, under the row the resolver selected: the database
 * checks that row, and returns only the directory's named columns, each one
 * the field-policy manifest lets Mission Control see. The label filter and
 * the page are applied in SQL. The service-key client is not used.
 */
export const GET = withOperation(
  async ({ auth: ctx, request, sessionClient }) => {
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

    const filters = roleLabelFilters(role);
    if (!filters) return NextResponse.json({ users: [] });

    // Every request of the session client carries the resolved tenant and
    // assignment (WP2b, AL-2675), so the directory reads the row the
    // resolver selected.
    const session = sessionClient as unknown as DirectoryClient;
    let query = session.rpc("tenant_member_directory", {
      p_tenant_id: ctx.tenantId,
    });
    for (const [column, value] of filters) query = query.eq(column, value);
    const { data, error } = await query
      .order("display_name", { ascending: true, nullsFirst: false })
      .order("membership_id", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "42501" ? 403 : 500 },
      );
    }
    return NextResponse.json({
      users: (data ?? []).map((row) => ({
        // A login with no profile is listed under its login id.
        id: row.profile_id ?? row.user_id,
        user_id: row.user_id,
        membership_id: row.membership_id,
        display_name: row.display_name,
        email: row.email,
        tenant_id: ctx.tenantId,
        role: row.is_tenant_admin ? "admin" : row.role,
        staff_role: row.staff_role,
        is_tenant_admin: row.is_tenant_admin,
        updated_at: row.updated_at,
      })),
    });
  },
  { roleClasses: ["staff"] },
);

const STAFF_SUBROLE_LABELS: Record<string, string> = {
  finance: "finance",
  mobilizer: "mobilizer",
  mobilizers: "mobilizer",
  development: "development",
  fundraising: "development",
  hr: "hr",
  member_care: "member_care",
};

/**
 * The directory filters for the list's `role` label (none: everyone). A label
 * names a class, a staff sub-role or `admin` (the flagged staff row); `staff`
 * lists the unflagged staff rows, so the two labels do not overlap.
 * `super_admin` and an unknown label list nobody (`null`): platform operators
 * are WP2c's operator list, not a membership.
 */
function roleLabelFilters(
  label: string | undefined,
): [string, string | boolean][] | null {
  if (!label) return [];
  if (label === "admin")
    return [
      ["role", "staff"],
      ["is_tenant_admin", true],
    ];
  if (label === "staff")
    return [
      ["role", "staff"],
      ["is_tenant_admin", false],
    ];
  if (label === "donor" || label === "missionary") return [["role", label]];
  const staffRole = STAFF_SUBROLE_LABELS[label];
  return staffRole
    ? [
        ["role", "staff"],
        ["staff_role", staffRole],
      ]
    : null;
}
