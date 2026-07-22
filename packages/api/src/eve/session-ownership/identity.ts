import { hasAnyRole } from "@asym/auth/permissions";
import { z } from "zod";

import type {
  EveAdminIdentityResolution,
  EveAdminSessionIdentity,
  EveServiceSessionIdentity,
  EveSessionAuthSnapshot,
} from "./types";
import type { AuthContext, AuthenticatedContext } from "@asym/auth/context";

const serviceIdentitySchema = z.object({
  initiatorId: z.string().trim().min(1).max(200),
  initiatorType: z.enum(["admin", "schedule", "system"]),
  serviceId: z.string().trim().min(1).max(200),
  tenantId: z.string().uuid(),
});

const membershipRolesSchema = z.array(z.enum(["donor", "missionary", "staff"]));

function isCompleteAuthContext(
  auth: AuthContext,
): auth is AuthenticatedContext {
  return Boolean(
    auth.isAuthenticated &&
    auth.userId &&
    auth.tenantId &&
    auth.role &&
    auth.profileId,
  );
}

export function createAdminEveSessionIdentity(
  auth: AuthContext,
): EveAdminIdentityResolution {
  if (!isCompleteAuthContext(auth)) {
    return { ok: false, reason: "unauthenticated" };
  }

  if (
    !hasAnyRole(
      { profileRole: auth.profileRole, memberships: auth.memberships },
      ["admin", "super_admin"],
    )
  ) {
    return { ok: false, reason: "forbidden" };
  }

  return {
    ok: true,
    identity: {
      actorId: auth.userId,
      actorMembershipRoles: auth.memberships
        .filter((membership) => membership.isActive)
        .map((membership) => membership.role),
      actorProfileId: auth.profileId,
      actorProfileRole: auth.profileRole,
      actorRole: auth.role,
      identityMode: "admin",
      initiatorId: auth.userId,
      initiatorType: "authenticated_admin",
      tenantId: auth.tenantId,
    } as EveAdminSessionIdentity,
  };
}

export async function resolveAdminEveSessionIdentity(
  request: Request,
  dependencies: {
    getVerifiedAuthContext?: (request: Request) => Promise<AuthContext>;
  } = {},
): Promise<EveAdminIdentityResolution> {
  const resolveAuth =
    dependencies.getVerifiedAuthContext ??
    (async (candidate: Request) => {
      const { getAuthContext } = await import("@asym/auth/context");
      return getAuthContext(candidate);
    });
  const auth = await resolveAuth(request);
  return createAdminEveSessionIdentity(auth);
}

export function createServiceEveSessionIdentity(input: {
  initiatorId: string;
  initiatorType: "admin" | "schedule" | "system";
  serviceId: string;
  tenantId: string;
}): EveServiceSessionIdentity {
  const parsed = serviceIdentitySchema.parse(input);
  return {
    actorId: parsed.serviceId,
    identityMode: "service",
    initiatorId: parsed.initiatorId,
    initiatorType: parsed.initiatorType,
    tenantId: parsed.tenantId,
  } as EveServiceSessionIdentity;
}

export function toEveSessionAuthSnapshot(
  identity: EveAdminSessionIdentity,
): EveSessionAuthSnapshot {
  return {
    attributes: {
      identityMode: identity.identityMode,
      membershipRoles: identity.actorMembershipRoles,
      profileId: identity.actorProfileId,
      ...(identity.actorProfileRole
        ? { profileRole: identity.actorProfileRole }
        : {}),
      role: identity.actorRole,
      tenantId: identity.tenantId,
    },
    authenticator: "asym-supabase-admin",
    principalId: identity.actorId,
    principalType: "user",
  };
}

export function identityFromEveSessionAuthSnapshot(
  snapshot: EveSessionAuthSnapshot | null,
): EveAdminSessionIdentity | null {
  if (
    snapshot?.authenticator !== "asym-supabase-admin" ||
    snapshot.principalType !== "user"
  ) {
    return null;
  }

  const attributes = snapshot.attributes;
  const membershipRolesResult = membershipRolesSchema.safeParse(
    attributes.membershipRoles,
  );
  const tenantId =
    typeof attributes.tenantId === "string" ? attributes.tenantId : null;
  const result = createAdminEveSessionIdentity({
    email: null,
    isAuthenticated: true,
    memberships: membershipRolesResult.success
      ? membershipRolesResult.data.map((role) => ({
          isActive: true,
          role,
          staffRole: null,
          tenantId: tenantId ?? "",
        }))
      : [],
    profileId:
      typeof attributes.profileId === "string" ? attributes.profileId : null,
    profileRole:
      typeof attributes.profileRole === "string"
        ? (attributes.profileRole as AuthenticatedContext["profileRole"])
        : typeof attributes.role === "string"
          ? (attributes.role as AuthenticatedContext["profileRole"])
          : null,
    role:
      typeof attributes.role === "string"
        ? (attributes.role as AuthenticatedContext["role"])
        : null,
    tenantId,
    userId: snapshot.principalId,
  });

  return result.ok ? result.identity : null;
}
