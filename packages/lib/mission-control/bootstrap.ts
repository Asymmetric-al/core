import type { Role, Tenant, User } from "./types";

export interface MCBootstrapState {
  user: User | null;
  tenant: Tenant | null;
  role: Role;
  capabilities: readonly string[];
  canManageMembers?: boolean;
  currentMembershipId?: string | null;
}

interface CreateMCBootstrapStateInput {
  avatarUrl?: string | null;
  capabilities?: readonly string[] | null;
  canManageMembers?: boolean;
  currentMembershipId?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  tenant?: Tenant | null;
  tenantId?: string | null;
  userId?: string | null;
}

/** Maps a primary role name (`AuthContext.role`) to the Mission Control role. */
export function mapRoleToMCRole(role: string | null | undefined): Role {
  const roleMap: Record<string, Role> = {
    admin: "admin",
    staff: "staff",
    super_admin: "admin",
    missionary: "fundraising",
    donor: "staff",
    finance: "finance",
    fundraising: "fundraising",
    mobilizers: "mobilizers",
    member_care: "member_care",
    events: "events",
  };
  return roleMap[role ?? ""] || "staff";
}

export function toDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

export function createMCBootstrapState(
  input: CreateMCBootstrapStateInput,
): MCBootstrapState {
  const role = mapRoleToMCRole(input.role);
  const tenant =
    input.tenant ??
    (input.tenantId
      ? {
          // Known id, unknown name: never invent an organization.
          id: input.tenantId,
          name: "",
          slug: "",
        }
      : null);

  return {
    role,
    capabilities: input.capabilities ? [...input.capabilities] : [],
    canManageMembers: input.canManageMembers ?? role === "admin",
    currentMembershipId: input.currentMembershipId ?? null,
    tenant,
    user:
      input.userId && input.tenantId
        ? {
            id: input.userId,
            email: input.email ?? "",
            name: toDisplayName(input.firstName, input.lastName),
            role,
            tenantId: input.tenantId,
            avatarUrl: input.avatarUrl ?? undefined,
          }
        : null,
  };
}
