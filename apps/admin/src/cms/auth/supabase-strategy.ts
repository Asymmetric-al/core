import {
  assertSupabaseDatasourceAllowedForE2EBypass,
  E2E_AUTH_COOKIE_NAME,
  getE2EAuthCookieNameForProxyHost,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "@asym/auth/e2e-auth";
import {
  createRpcAssignmentReader,
  listE2EAuthAssignments,
  resolveActiveAssignment,
  type ActiveAssignment,
  type AssignmentRpcClient,
} from "@asym/auth/principal";
import { ASSIGNMENT_HEADER, TENANT_HEADER } from "@asym/auth/request-headers";
import {
  decideWebStudioAccess,
  WEB_STUDIO_TENANT_COOKIE,
  webStudioResolveInput,
  type WebStudioCookieState,
} from "@asym/auth/web-studio";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

import { CMS_USERS_SLUG } from "../constants";
import { readWebStudioTenantCookie } from "../web-studio-tenant-cookie";
import {
  markWebStudioRefusal,
  type WebStudioRefusal,
} from "./web-studio-refusal";

import type { AuthStrategy, BasePayload, PayloadRequest } from "payload";

const STRATEGY_NAME = "supabase-session";
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
  createSupabaseDataClient?: () => Pick<
    ReturnType<typeof createServerClient>,
    "from"
  > | null;
  /** Reads the Web Studio cookie; the admin app's key by default. */
  readWebStudioCookie?: (value: string | null) => Promise<WebStudioCookieState>;
};

function createTrustedSupabaseDataClient(): Pick<
  ReturnType<typeof createServerClient>,
  "from"
> | null {
  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseURL || !serviceRoleKey) {
    return null;
  }

  return createSupabaseJsClient(supabaseURL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

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

/** The methods that change data. */
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Whether a REST call comes from a Web Studio document rendered for the
 * assignment this request resolved (plan 5.2). Each document sends the tenant
 * and row it was rendered for (`x-asym-tenant`, `x-asym-assignment`); once
 * the person has switched organization in another tab, they differ from the
 * cookie's and the call is refused, so an open form is never retargeted. A
 * write must name its document. A read need not, as an image or a link does
 * not, but one that names a document must name this one.
 *
 * Only a REST or GraphQL call has a request here; Payload's page renders
 * authenticate without one and act in the cookie's organization. Its server
 * functions do too, but the Payload layout checks their claims the same way
 * before Payload runs them (`web-studio-server-function.ts`; council on the
 * joined release, JC2). Nothing in Core calls Payload's GraphQL route, which
 * WP6 removes; until then every GraphQL call counts as a write, so a
 * mutation that names no document is refused.
 */
function isFromCurrentDocument(
  {
    headers,
    req,
    isGraphQL,
  }: { headers: Headers; req?: PayloadRequest; isGraphQL?: boolean },
  assignment: ActiveAssignment,
): boolean {
  if (!req) return true;
  const tenantId = headers.get(TENANT_HEADER)?.trim() || null;
  const assignmentId = headers.get(ASSIGNMENT_HEADER)?.trim() || null;
  if (tenantId === null && assignmentId === null) {
    return (
      !isGraphQL && !WRITE_METHODS.has((req.method ?? "GET").toUpperCase())
    );
  }
  return (
    tenantId === assignment.tenantId && assignmentId === assignment.assignmentId
  );
}

type AuthenticationOutcome =
  { user: CmsAuthUser } | { user: null; refusal: WebStudioRefusal | null };

const refused = (refusal: WebStudioRefusal | null): AuthenticationOutcome => ({
  user: null,
  refusal,
});

/**
 * The E2E bypass identity, when the bypass is enabled and the request carries
 * its signed cookie: judged by the Web Studio rule over the memberships the
 * signed cookie names, exactly as a real session is over its live rows. Its
 * organization comes from the Web Studio cookie, never from the identity's
 * own default tenant. `null` when there is no bypass identity at all.
 */
async function authenticateE2EBypass({
  headers,
  payload,
  requestCookies,
  cookie,
  req,
  isGraphQL,
}: {
  headers: Headers;
  payload: PayloadAuthStore;
  requestCookies: Array<{ name: string; value: string }>;
  cookie: WebStudioCookieState;
  req?: PayloadRequest;
  isGraphQL?: boolean;
}): Promise<AuthenticationOutcome | null> {
  if (!isE2EAuthBypassEnabled()) {
    return null;
  }

  // Bind the bypass to datasource identity, not NODE_ENV: refuse to grant a
  // bypass identity unless the configured Supabase project is allowlisted.
  assertSupabaseDatasourceAllowedForE2EBypass(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );

  const host = headers.get("host");
  const surfaceCookieName = getE2EAuthCookieNameForProxyHost(host);
  const e2eSession =
    (await parseE2EAuthCookieValue(
      readCookieValue(requestCookies, surfaceCookieName),
    )) ??
    (await parseE2EAuthCookieValue(
      readCookieValue(requestCookies, E2E_AUTH_COOKIE_NAME),
    ));
  if (!e2eSession) {
    return null;
  }

  if (!readE2ECmsRole(e2eSession.role)) {
    return refused(null);
  }

  const decision = decideWebStudioAccess({
    assignments: listE2EAuthAssignments(e2eSession),
    cookie,
  });
  if (decision.kind !== "allow") {
    return refused("no_selection");
  }
  const { assignment } = decision;
  if (!isFromCurrentDocument({ headers, req, isGraphQL }, assignment)) {
    return refused("scope_mismatch");
  }

  const role: CmsStaffRole =
    e2eSession.role === "super_admin"
      ? "super_admin"
      : assignment.isTenantAdmin
        ? "admin"
        : "staff";
  const publicTenantId = assignment.tenantId;
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
    user: {
      ...userRecord,
      publicTenantId,
      _strategy: `${CMS_USERS_SLUG}-${STRATEGY_NAME}-e2e`,
      collection: CMS_USERS_SLUG,
    },
  };
}

export function createSupabaseAuthStrategy(
  dependencies: SupabaseStrategyDependencies = {},
): AuthStrategy {
  const createSupabaseClient =
    dependencies.createSupabaseClient ?? createServerClient;
  const createSupabaseDataClient =
    dependencies.createSupabaseDataClient ?? createTrustedSupabaseDataClient;
  const readCookie =
    dependencies.readWebStudioCookie ?? readWebStudioTenantCookie;

  async function authenticateRequest({
    headers,
    payload,
    req,
    isGraphQL,
  }: {
    headers: Headers;
    payload: PayloadAuthStore;
    req?: PayloadRequest;
    isGraphQL?: boolean;
  }): Promise<AuthenticationOutcome> {
    const requestCookies = parseCookieHeader(headers.get("cookie"));
    // The organization Web Studio works in: the signed cookie scoped to
    // `/web-studio` (plan 5.2), a proposal the resolver checks below.
    const cookie = await readCookie(
      readCookieValue(requestCookies, WEB_STUDIO_TENANT_COOKIE),
    );
    const e2e = () =>
      authenticateE2EBypass({
        headers,
        payload,
        requestCookies,
        cookie,
        req,
        isGraphQL,
      });

    const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseURL || !supabaseAnonKey) {
      return (await e2e()) ?? refused("no_session");
    }

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
          // This strategy only reads the session. The admin proxy refreshes
          // it on every Web Studio request, REST routes included.
        },
      },
    });

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser?.id) {
      return (await e2e()) ?? refused("no_session");
    }

    // Web Studio acts on staff rows (plan 5.1): the row the Web Studio cookie
    // names, proposed to the same resolver every other handler uses, over the
    // caller's live memberships read on their own session through
    // `public.current_user_assignments()` (A08: `authz` is not exposed by the
    // Data API). Without a cookie, the one staff row of a person who needs no
    // choice. A forged, foreign or revoked selection, or several rows and no
    // choice, resolve nothing: there is no fallback to a first membership or
    // a profile. Its flag makes the CMS user an admin.
    const resolveInput = webStudioResolveInput(cookie);
    if (!resolveInput.ok) {
      return refused("no_selection");
    }
    const { ok: _ok, ...narrowing } = resolveInput;
    const resolution = await resolveActiveAssignment(
      { ...narrowing, userId: supabaseUser.id },
      createRpcAssignmentReader(supabase as unknown as AssignmentRpcClient),
    );
    if (!resolution.ok) {
      // Rows that could not be read are an ordinary failure, unmarked, which
      // the person can retry; only the resolver's own refusal of the row is
      // "choose an organization" (JR2's rule; last read of the first
      // release, L3).
      return refused(
        resolution.reason === "reader_error" ? null : "no_selection",
      );
    }
    const { assignment } = resolution;
    if (!isFromCurrentDocument({ headers, req, isGraphQL }, assignment)) {
      return refused("scope_mismatch");
    }
    const publicTenantId = assignment.tenantId;
    const role: CmsStaffRole = assignment.isTenantAdmin ? "admin" : "staff";

    const supabaseDataClient = createSupabaseDataClient() ?? supabase;

    const { data: publicTenantData } = await supabaseDataClient
      .from("tenants")
      .select("id, name, slug")
      .eq("id", publicTenantId)
      .maybeSingle();
    const publicTenant = readPublicTenant(publicTenantData);

    if (!publicTenant) {
      return refused(null);
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
  }

  return {
    name: STRATEGY_NAME,
    authenticate: async ({ headers, payload, req, isGraphQL }) => {
      const outcome = await authenticateRequest({
        headers,
        payload,
        req,
        isGraphQL,
      });
      if (outcome.user === null && outcome.refusal) {
        // Payload then refuses the anonymous operation; the afterError hook
        // turns that into the refusal's JSON answer (web-studio-refusal.ts).
        markWebStudioRefusal(req, outcome.refusal);
      }
      return { user: outcome.user };
    },
  };
}
