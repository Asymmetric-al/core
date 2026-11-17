import { hasTenantAdministratorMembership } from "@asym/auth/permissions";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
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

/**
 * Eve admin sessions belong to Mission Control, which acts on staff rows
 * (AL-2675). The Eve runtime has no proxy in front of it to name the surface's
 * role class, so it names it here.
 */
const EVE_ADMIN_AUTH_OPTIONS = { roleClass: "staff" } as const;

/** Snapshot attribute that keeps the selected staff row's flag (AL-2675). */
const TENANT_ADMIN_ATTRIBUTE = "tenantAdmin";

function createUnauthenticatedContext(): AuthContext {
  return {
    email: null,
    isAuthenticated: false,
    memberships: [],
    profileId: null,
    role: null,
    tenantId: null,
    userId: null,
  };
}

function getBearerToken(request: Request): string | null {
  const authorizationHeader = request.headers.get("authorization")?.trim();
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, ...tokenParts] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer") {
    return null;
  }

  const token = tokenParts.join(" ").trim();
  return token || null;
}

function parseCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((pair) => {
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex === -1) {
        return { name: pair, value: "" };
      }

      const value = pair.slice(separatorIndex + 1);
      try {
        return {
          name: pair.slice(0, separatorIndex),
          value: decodeURIComponent(value),
        };
      } catch {
        return { name: pair.slice(0, separatorIndex), value };
      }
    });
}

async function resolveRequestAuthContext(request: Request) {
  const { getAuthContext } = await import("@asym/auth/context");
  if (getBearerToken(request)) {
    return getAuthContext(request, EVE_ADMIN_AUTH_OPTIONS);
  }

  const cookieHeader = request.headers.get("cookie");
  const { url, key } = getSupabasePublicConfig();
  if (!cookieHeader || !url || !key) {
    return createUnauthenticatedContext();
  }

  const requestCookies = parseCookieHeader(cookieHeader);
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return requestCookies;
      },
      setAll() {
        // Eve owns this Request boundary but has no HTTP response cookie store.
      },
    },
  });

  let accessToken: string | undefined;
  try {
    const { data, error } = await supabase.auth.getSession();
    accessToken = error ? undefined : data.session?.access_token;
  } catch {
    return createUnauthenticatedContext();
  }

  if (!accessToken) {
    return createUnauthenticatedContext();
  }

  // The cookie session only supplies a candidate token. getAuthContext calls
  // Supabase getUser(token) before deriving any application identity from it.
  const authHeaders = new Headers(request.headers);
  authHeaders.set("authorization", `Bearer ${accessToken}`);
  return getAuthContext(
    new Request(request.url, { headers: authHeaders }),
    EVE_ADMIN_AUTH_OPTIONS,
  );
}

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

  // AL-2675: an admin session is the tenant administrator's.
  if (!hasTenantAdministratorMembership(auth.memberships, auth.tenantId)) {
    return { ok: false, reason: "forbidden" };
  }

  return {
    ok: true,
    identity: {
      actorId: auth.userId,
      actorIsTenantAdmin: true,
      actorMembershipRoles: auth.memberships
        .filter((membership) => membership.isActive)
        .map((membership) => membership.role),
      actorProfileId: auth.profileId,
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
    ((candidate: Request) => resolveRequestAuthContext(candidate));
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
      ...(identity.actorIsTenantAdmin
        ? { [TENANT_ADMIN_ATTRIBUTE]: "true" }
        : {}),
      profileId: identity.actorProfileId,
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
  // A snapshot written before AL-2675 has no flag and is refused (fails closed).
  const isTenantAdmin = attributes[TENANT_ADMIN_ATTRIBUTE] === "true";
  const result = createAdminEveSessionIdentity({
    email: null,
    isAuthenticated: true,
    memberships: membershipRolesResult.success
      ? membershipRolesResult.data.map((role) => ({
          isActive: true,
          isTenantAdmin: role === "staff" && isTenantAdmin,
          role,
          staffRole: null,
          tenantId: tenantId ?? "",
        }))
      : [],
    profileId:
      typeof attributes.profileId === "string" ? attributes.profileId : null,
    role:
      typeof attributes.role === "string"
        ? (attributes.role as AuthenticatedContext["role"])
        : null,
    tenantId,
    userId: snapshot.principalId,
  });

  return result.ok ? result.identity : null;
}
