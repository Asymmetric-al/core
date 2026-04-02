import type { Role, Tenant, User } from "./types";

export interface MCBootstrapState {
  user: User | null;
  tenant: Tenant | null;
  role: Role;
}

interface CreateMCBootstrapStateInput {
  avatarUrl?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileRole?: string | null;
  tenant?: Tenant | null;
  tenantId?: string | null;
  userId?: string | null;
}

export function mapProfileRoleToMCRole(
  profileRole: string | null | undefined,
): Role {
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
  return roleMap[profileRole ?? ""] || "staff";
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
  const role = mapProfileRoleToMCRole(input.profileRole);
  const tenant =
    input.tenant ??
    (input.tenantId
      ? {
          id: input.tenantId,
          name: "Give Hope",
          slug: "give-hope",
        }
      : null);

  return {
    role,
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
