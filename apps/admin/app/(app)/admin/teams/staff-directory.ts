export interface StaffAccount {
  id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role: string;
}

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

export function staffName(account: StaffAccount) {
  return (
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
        const response = await fetch(`/api/admin/users?${params}`, {
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
