import { ownApiFetch } from "@asym/database/own-api";

export type StaffSubroleValue =
  "development" | "finance" | "hr" | "member_care" | "mobilizer";

export interface StaffAccount {
  id: string;
  user_id?: string;
  membership_id?: string;
  display_name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role: string;
  staff_role?: string | null;
  is_tenant_admin?: boolean;
  updated_at?: string;
}

export interface PendingInvitation {
  id: string;
  tenant_id: string;
  email: string;
  role: "staff" | "missionary";
  staff_role: string | null;
  is_tenant_admin: boolean;
  purpose: string;
  delivery_mode: string;
  status: "issued" | "accepted" | "expired" | "revoked";
  expires_at: string;
  created_at: string;
}

export const STAFF_SUBROLE_OPTIONS: ReadonlyArray<{
  value: StaffSubroleValue;
  label: string;
}> = [
  { value: "development", label: "Fundraising" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "HR" },
  { value: "member_care", label: "Member care" },
  { value: "mobilizer", label: "Mobilizers" },
];

export const STAFF_ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  staff: "Staff",
  missionary: "Missionary",
  finance: "Finance",
  fundraising: "Fundraising",
  member_care: "Member care",
  mobilizers: "Mobilizers",
  hr: "HR",
};

const STAFF_SUBROLE_DISPLAY: Record<string, string> = {
  finance: "Finance",
  development: "Fundraising",
  member_care: "Member care",
  mobilizer: "Mobilizers",
  hr: "HR",
};

const DISPLAYED_MEMBER_ROLES = new Set(["admin", "staff", "missionary"]);

export function memberRowKey(account: StaffAccount): string {
  return account.membership_id ?? account.id;
}

export function staffSubroleLabel(subrole: string | null | undefined): string {
  if (!subrole) return "Staff";
  return STAFF_SUBROLE_DISPLAY[subrole] ?? subrole;
}

export function staffRoleLabel(account: StaffAccount): string {
  if (account.is_tenant_admin || account.role === "admin") {
    return "Administrator";
  }
  if (account.role === "missionary") {
    return "Missionary";
  }
  if (account.role !== "staff") {
    return STAFF_ROLE_LABELS[account.role] ?? account.role;
  }
  return (
    (account.staff_role && STAFF_SUBROLE_DISPLAY[account.staff_role]) ||
    STAFF_ROLE_LABELS.staff!
  );
}

export function staffName(account: StaffAccount): string {
  return (
    account.display_name?.trim() ||
    account.full_name?.trim() ||
    [account.first_name, account.last_name].filter(Boolean).join(" ").trim() ||
    account.email ||
    `Member ${memberRowKey(account)}`
  );
}

export async function loadStaffAccounts(
  signal: AbortSignal,
): Promise<StaffAccount[]> {
  const accounts: StaffAccount[] = [];
  for (let offset = 0; ; offset += 100) {
    const params = new URLSearchParams({
      limit: "100",
      offset: String(offset),
    });
    const response = await ownApiFetch(`/api/admin/users?${params}`, {
      signal,
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Could not load members.");
    const payload = (await response.json()) as { users?: StaffAccount[] };
    if (!Array.isArray(payload.users)) {
      throw new Error("Could not load members.");
    }
    accounts.push(
      ...payload.users.filter((account) =>
        DISPLAYED_MEMBER_ROLES.has(account.role),
      ),
    );
    if (payload.users.length < 100) break;
  }
  return [
    ...new Map(
      accounts.map((account) => [memberRowKey(account), account]),
    ).values(),
  ];
}

export async function loadPendingInvitations(
  signal: AbortSignal,
): Promise<PendingInvitation[]> {
  const response = await ownApiFetch("/api/admin/members/invitations", {
    signal,
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Could not load invitations.");
  const payload = (await response.json()) as {
    invitations?: PendingInvitation[];
  };
  if (!Array.isArray(payload.invitations)) {
    throw new Error("Could not load invitations.");
  }
  return payload.invitations;
}
