import { ownApiFetch } from "@asym/database/own-api";
export interface StaffAccount {
  id: string;
  /** The member directory's display name (council round 1 on WP2a, F8). */
  display_name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  /**
   * The membership class, or `admin` for a staff row with the
   * tenant-administrator flag (`packages/api/src/admin/users.ts`).
   */
  role: string;
  /** The staff row's sub-role (`StaffSubrole`), which the member directory returns beside the class. */
  staff_role?: string | null;
}

/**
 * The labels the users list is asked for, one request each. They are the
 * list's filter vocabulary, not what a row's `role` holds: a row answers
 * `staff` or `admin`, with its sub-role in `staff_role`.
 */
export const STAFF_ROLE_LABELS: Record<string, string> = {
  super_admin: "Platform administrator",
  admin: "Administrator",
  staff: "Staff",
  finance: "Finance",
  fundraising: "Fundraising",
  member_care: "Member care",
  mobilizers: "Mobilizers",
  events: "Events",
};

/** What the Role column shows for each staff sub-role the directory can return. */
const STAFF_SUBROLE_DISPLAY: Record<string, string> = {
  finance: "Finance",
  development: "Fundraising",
  member_care: "Member care",
  mobilizer: "Mobilizers",
  hr: "HR",
};

/**
 * The role a person is shown with. An administrator is named as one whatever
 * their sub-role; any other staff member by their sub-role; a staff member
 * with none as Staff.
 */
export function staffRoleLabel(account: StaffAccount) {
  if (account.role !== "staff") {
    return STAFF_ROLE_LABELS[account.role] ?? account.role;
  }
  return (
    (account.staff_role && STAFF_SUBROLE_DISPLAY[account.staff_role]) ||
    STAFF_ROLE_LABELS.staff
  );
}

export function staffName(account: StaffAccount) {
  return (
    account.display_name?.trim() ||
    account.full_name?.trim() ||
    [account.first_name, account.last_name].filter(Boolean).join(" ").trim() ||
    account.email ||
    `Staff account ${account.id}`
  );
}

/** Use the authorized users endpoint; team membership has no backing service. */
export async function loadStaffAccounts(
  signal: AbortSignal,
): Promise<StaffAccount[]> {
  const pages = await Promise.all(
    Object.keys(STAFF_ROLE_LABELS).map(async (role) => {
      const accounts: StaffAccount[] = [];
      for (let offset = 0; ; offset += 100) {
        const params = new URLSearchParams({
          role,
          limit: "100",
          offset: String(offset),
        });
        const response = await ownApiFetch(`/api/admin/users?${params}`, {
          signal,
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Could not load staff.");
        const payload: { users: StaffAccount[] } = await response.json();
        if (!Array.isArray(payload.users))
          throw new Error("Could not load staff.");
        accounts.push(
          ...payload.users.filter((account) =>
            Object.hasOwn(STAFF_ROLE_LABELS, account.role),
          ),
        );
        if (payload.users.length < 100) return accounts;
      }
    }),
  );
  return [
    ...new Map(pages.flat().map((account) => [account.id, account])).values(),
  ];
}
