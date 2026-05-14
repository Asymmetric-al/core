import {
  E2E_AUTH_COOKIE_NAME,
  getE2EAuthCookieNameForProxyHost,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "@asym/auth/e2e-auth";
import { createServerClient } from "@supabase/ssr";

import { CMS_USERS_SLUG } from "../constants";

import type { AuthStrategy, BasePayload } from "payload";

const STRATEGY_NAME = "supabase-session";
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const STAFF_SUBROLES = new Set([
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
]);
type CmsStaffRole = "staff" | "admin" | "super_admin";
type CmsUserDoc = {
  id: number;
  email: string;
  role?: CmsStaffRole | null;
  supabaseUserId?: string | null;
  tenantId?: string | null;
  updatedAt: string;
  createdAt: string;
};
type CmsUserSyncData = Pick<
  CmsUserDoc,
  "email" | "role" | "supabaseUserId" | "tenantId"
>;
type PublicTenantRow = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
};
type CmsTenantDoc = {
  id: string | number;
  name?: string | null;
  slug?: string | null;
};
type PayloadAuthStore = Pick<BasePayload, "create" | "find" | "update">;
type CmsAuthUser = CmsUserDoc & {
  publicTenantId: string;
  _strategy: string;
  collection: typeof CMS_USERS_SLUG;
};

type SupabaseStrategyDependencies = {
  createSupabaseClient?: typeof createServerClient;
};

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return [] as Array<{ name: string; value: string }>;
  }

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const [name, ...valueParts] = cookie.split("=");
      return {
        name,
        value: valueParts.join("="),
      };
    })
    .filter(
      (cookie): cookie is { name: string; value: string } =>
        typeof cookie.name === "string" && cookie.name.length > 0,
    );
}

function readProfileRole(value: unknown): CmsStaffRole | null {
  if (value === "super_admin" || value === "admin" || value === "staff") {
    return value;
  }

  return null;
}

function readMembershipStaffRole(value: unknown): "staff" | null {
  return typeof value === "string" && STAFF_SUBROLES.has(value)
    ? "staff"
    : null;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readPublicTenant(
  value: PublicTenantRow | null | undefined,
): { id: string; name: string; slug: string } | null {
  if (!value || typeof value.id !== "string" || value.id.length === 0) {
    return null;
  }

  const rawSlug = typeof value.slug === "string" ? value.slug : "";
  const slug = normalizeSlug(rawSlug) || normalizeSlug(value.id);
  if (!slug) {
    return null;
  }

  const rawName = typeof value.name === "string" ? value.name.trim() : "";

  return {
    id: value.id,
    name: rawName || slug,
    slug,
  };
}

function readCookieValue(
  cookies: Array<{ name: string; value: string }>,
  name: string | null,
) {
  if (!name) {
    return null;
  }

  return cookies.find((cookie) => cookie.name === name)?.value ?? null;
}

function readE2ECmsRole(role: string): CmsStaffRole | null {
  if (role === "super_admin" || role === "admin" || role === "staff") {
    return role;
  }

  return null;
}

async function findOrCreateCmsTenant({
  payload,
  publicTenant,
}: {
  payload: PayloadAuthStore;
  publicTenant: { name: string; slug: string };
}) {
  const existingTenants = await payload.find({
    collection: "tenants",
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: publicTenant.slug,
      },
    },
  });

  const existingTenant = existingTenants.docs?.[0] as CmsTenantDoc | undefined;
  if (existingTenant?.id !== undefined && existingTenant.id !== null) {
    const existingName =
      typeof existingTenant.name === "string" ? existingTenant.name : null;
    if (existingName !== publicTenant.name) {
      const syncedTenant = await payload.update({
        id: existingTenant.id,
        collection: "tenants",
        data: {
          name: publicTenant.name,
          slug: publicTenant.slug,
          isActive: true,
        },
        overrideAccess: true,
      });
      return String((syncedTenant as CmsTenantDoc).id);
    }

    return String(existingTenant.id);
  }

  const createdTenant = await payload.create({
    collection: "tenants",
    data: {
      name: publicTenant.name,
      slug: publicTenant.slug,
      isActive: true,
    },
    overrideAccess: true,
  });

  return String((createdTenant as CmsTenantDoc).id);
}

async function findOrSyncCmsUser({
  payload,
  desiredData,
}: {
  payload: PayloadAuthStore;
  desiredData: CmsUserSyncData;
}) {
  const existingUsers = await payload.find({
    collection: CMS_USERS_SLUG,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      supabaseUserId: {
        equals: desiredData.supabaseUserId,
      },
    },
  });

  const existingUser = existingUsers.docs[0] as CmsUserDoc | undefined;
  const userNeedsSync =
    !existingUser ||
    existingUser.email !== desiredData.email ||
    existingUser.role !== desiredData.role ||
    existingUser.supabaseUserId !== desiredData.supabaseUserId ||
    existingUser.tenantId !== desiredData.tenantId;

  const syncedUser = existingUser
    ? userNeedsSync
      ? await payload.update({
          id: existingUser.id,
          collection: CMS_USERS_SLUG,
          data: desiredData,
          overrideAccess: true,
        })
      : existingUser
    : await payload.create({
        collection: CMS_USERS_SLUG,
        data: desiredData,
        overrideAccess: true,
      });

  return syncedUser as CmsUserDoc;
}

async function authenticateE2EBypass({
  headers,
  payload,
  requestCookies,
}: {
  headers: Headers;
  payload: PayloadAuthStore;
  requestCookies: Array<{ name: string; value: string }>;
}): Promise<CmsAuthUser | null> {
  if (!isE2EAuthBypassEnabled()) {
    return null;
  }

  const host = headers.get("host");
  const surfaceCookieName = getE2EAuthCookieNameForProxyHost(host);
  const e2eSession =
    parseE2EAuthCookieValue(
      readCookieValue(requestCookies, surfaceCookieName),
    ) ??
    parseE2EAuthCookieValue(
      readCookieValue(requestCookies, E2E_AUTH_COOKIE_NAME),
    );
  if (!e2eSession) {
    return null;
  }

  const role = readE2ECmsRole(e2eSession.role);
  if (!role) {
    return null;
  }

  const publicTenantId = e2eSession.tenantId ?? DEFAULT_TENANT_ID;
  const publicTenant = {
    id: publicTenantId,
    name: "E2E Tenant",
    slug: normalizeSlug(publicTenantId) || "e2e-tenant",
  };
  const cmsTenantId = await findOrCreateCmsTenant({
    payload,
    publicTenant,
  });

  const desiredData: CmsUserSyncData = {
    email: `${e2eSession.userId}@e2e.asym.local`,
    role,
    supabaseUserId: e2eSession.userId,
    tenantId: cmsTenantId,
  };
  const userRecord = await findOrSyncCmsUser({ payload, desiredData });

  return {
    ...userRecord,
    publicTenantId,
    _strategy: `${CMS_USERS_SLUG}-${STRATEGY_NAME}-e2e`,
    collection: CMS_USERS_SLUG,
  };
}

export function createSupabaseAuthStrategy(
  dependencies: SupabaseStrategyDependencies = {},
): AuthStrategy {
  const createSupabaseClient =
    dependencies.createSupabaseClient ?? createServerClient;

  return {
    name: STRATEGY_NAME,
    authenticate: async ({ headers, payload }) => {
      const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseURL || !supabaseAnonKey) {
        return {
          user: await authenticateE2EBypass({
            headers,
            payload,
            requestCookies: parseCookieHeader(headers.get("cookie")),
          }),
        };
      }

      const requestCookies = parseCookieHeader(headers.get("cookie"));
      const supabase = createSupabaseClient(supabaseURL, supabaseAnonKey, {
        cookies: {
          getAll() {
            return requestCookies;
          },
          setAll(
            _cookiesToSet: Array<{
              name: string;
              value: string;
              options?: Record<string, unknown>;
            }>,
          ) {
            // This auth strategy only reads server-side sessions.
            // Session refresh is managed by our app middleware.
          },
        },
      });

      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (!supabaseUser?.id) {
        return {
          user: await authenticateE2EBypass({
            headers,
            payload,
            requestCookies,
          }),
        };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id, role")
        .eq("user_id", supabaseUser.id)
        .single();

      const profileRole =
        typeof profile?.role === "string" ? profile.role : null;
      const publicTenantId =
        typeof profile?.tenant_id === "string"
          ? profile.tenant_id
          : profileRole === "super_admin"
            ? DEFAULT_TENANT_ID
            : null;

      const { data: staffMembership } = publicTenantId
        ? await supabase
            .schema("authz")
            .from("memberships")
            .select("staff_role")
            .eq("user_id", supabaseUser.id)
            .eq("tenant_id", publicTenantId)
            .eq("role", "staff")
            .eq("is_active", true)
            .limit(1)
            .maybeSingle()
        : { data: null };

      const role =
        profileRole === "super_admin"
          ? "super_admin"
          : (readProfileRole(profileRole) ??
            readMembershipStaffRole(staffMembership?.staff_role));

      if (!publicTenantId || !role) {
        return { user: null };
      }

      const { data: publicTenantData } = await supabase
        .from("tenants")
        .select("id, name, slug")
        .eq("id", publicTenantId)
        .maybeSingle();
      const publicTenant = readPublicTenant(publicTenantData);

      if (!publicTenant) {
        return { user: null };
      }

      const cmsTenantId = await findOrCreateCmsTenant({
        payload,
        publicTenant,
      });

      const desiredData: CmsUserSyncData = {
        email: supabaseUser.email ?? `${supabaseUser.id}@asym.local`,
        role,
        supabaseUserId: supabaseUser.id,
        tenantId: cmsTenantId,
      };
      const userRecord = await findOrSyncCmsUser({ payload, desiredData });

      return {
        user: {
          ...userRecord,
          publicTenantId,
          _strategy: `${CMS_USERS_SLUG}-${STRATEGY_NAME}`,
          collection: CMS_USERS_SLUG,
        },
      };
    },
  };
}
