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
import {
  ASSIGNMENT_HEADER,
  isNameGenerationRefused,
  isNameTenantRefused,
  nameTenantIdOf,
  readNameGeneration,
  readNameTenantState,
  SCOPE_GENERATION_HEADER,
  TENANT_HEADER,
  type NameGenerationState,
} from "@asym/auth/request-headers";
import {
  decideWebStudioAccess,
  WEB_STUDIO_TENANT_COOKIE,
  webStudioResolveInput,
  type WebStudioCookieState,
} from "@asym/auth/web-studio";
import { createServerClient } from "@supabase/ssr";

import { PRINCIPAL_LINKS_SLUG } from "../access/tenant-context";
import {
  ensurePrincipalLink,
  type PrincipalLinkRow,
} from "../ports/service-port";
import { CANONICAL_UUID } from "../tenancy/reference-guard";
import { readWebStudioTenantCookie } from "../web-studio-tenant-cookie";
import {
  markWebStudioRefusal,
  type WebStudioRefusal,
} from "./web-studio-refusal";

import type { StaffSubrole } from "@asym/database/types";
import type { AuthStrategy, BasePayload } from "payload";

const STRATEGY_NAME = "supabase-session";
type PayloadAuthStore = Pick<
  BasePayload,
  "create" | "delete" | "find" | "findByID" | "update"
>;
type CmsAuthUser = PrincipalLinkRow & {
  _strategy: string;
  collection: typeof PRINCIPAL_LINKS_SLUG;
  tenantId: string;
  assignmentId: string;
  staffRole: StaffSubrole | null;
  isTenantAdmin: boolean;
};

export type SupabaseStrategyDependencies = {
  createSupabaseClient?: typeof createServerClient;
  readWebStudioCookie?: (value: string | null) => Promise<WebStudioCookieState>;
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

function readCookieValue(
  cookies: Array<{ name: string; value: string }>,
  name: string | null,
) {
  if (!name) {
    return null;
  }

  return cookies.find((cookie) => cookie.name === name)?.value ?? null;
}

function isE2EStaffRole(role: string) {
  return role === "super_admin" || role === "admin" || role === "staff";
}

async function signInPrincipal({
  payload,
  userId,
  email,
  assignment,
  strategy,
}: {
  payload: PayloadAuthStore;
  userId: string;
  email: string | null;
  assignment: ActiveAssignment;
  strategy: string;
}): Promise<AuthenticationOutcome> {
  if (!CANONICAL_UUID.test(userId)) return refused(null);
  const row = await ensurePrincipalLink(payload, { userId, email });
  return {
    user: {
      ...row,
      _strategy: strategy,
      collection: PRINCIPAL_LINKS_SLUG,
      tenantId: assignment.tenantId,
      assignmentId: assignment.assignmentId,
      staffRole: assignment.staffRole,
      isTenantAdmin: assignment.isTenantAdmin,
    },
  };
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
    request,
    isGraphQL,
  }: { headers: Headers; request: CallerRequest | null; isGraphQL?: boolean },
  assignment: ActiveAssignment,
  generation: NameGenerationState,
): boolean {
  if (!request) return true;
  const tenantId = headers.get(TENANT_HEADER)?.trim() || null;
  const assignmentId = headers.get(ASSIGNMENT_HEADER)?.trim() || null;
  if (generation.kind === "valid") {
    return (
      headers.get(SCOPE_GENERATION_HEADER) === String(generation.generation) &&
      tenantId === assignment.tenantId &&
      assignmentId === assignment.assignmentId
    );
  }
  if (tenantId === null && assignmentId === null) {
    return (
      !isGraphQL && !WRITE_METHODS.has((request.method ?? "GET").toUpperCase())
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

type CallerRequest = { method?: string };

export type WebStudioCaller =
  | {
      kind: "allow";
      userId: string;
      email: string | null;
      assignment: ActiveAssignment;
      strategy: string;
      generation: NameGenerationState;
    }
  | { kind: "refuse"; refusal: WebStudioRefusal | null }
  | { kind: "unavailable" };

export type WebStudioCallerInput = {
  headers: Headers;
  request: CallerRequest | null;
  isGraphQL?: boolean;
};

const refuse = (refusal: WebStudioRefusal | null): WebStudioCaller => ({
  kind: "refuse",
  refusal,
});

/**
 * The E2E bypass identity, when the bypass is enabled and the request carries
 * its signed cookie: judged by the Web Studio rule over the memberships the
 * signed cookie names, exactly as a real session is over its live rows. Its
 * organization comes from the Web Studio cookie, never from the identity's
 * own default tenant. `null` when there is no bypass identity at all.
 */
async function decideE2EBypass({
  headers,
  requestCookies,
  cookie,
  request,
  isGraphQL,
}: {
  headers: Headers;
  requestCookies: Array<{ name: string; value: string }>;
  cookie: WebStudioCookieState;
  request: CallerRequest | null;
  isGraphQL?: boolean;
}): Promise<WebStudioCaller | null> {
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

  if (!isE2EStaffRole(e2eSession.role)) {
    return refuse(null);
  }

  const name = readNameTenantState(headers);
  const generation = readNameGeneration(headers);
  if (isNameTenantRefused(name) || isNameGenerationRefused(name, generation)) {
    return refuse("no_selection");
  }
  const decision = decideWebStudioAccess({
    assignments: listE2EAuthAssignments(e2eSession),
    cookie,
    nameTenantId: nameTenantIdOf(name),
  });
  if (decision.kind !== "allow") {
    return refuse("no_selection");
  }
  const { assignment } = decision;
  if (
    !isFromCurrentDocument(
      { headers, request, isGraphQL },
      assignment,
      generation,
    )
  ) {
    return refuse("scope_mismatch");
  }

  return {
    kind: "allow",
    userId: e2eSession.userId,
    email: `${e2eSession.userId}@e2e.asym.local`,
    assignment,
    strategy: `${PRINCIPAL_LINKS_SLUG}-${STRATEGY_NAME}-e2e`,
    generation,
  };
}

export function createWebStudioCallerResolver(
  dependencies: SupabaseStrategyDependencies = {},
): (input: WebStudioCallerInput) => Promise<WebStudioCaller> {
  const createSupabaseClient =
    dependencies.createSupabaseClient ?? createServerClient;
  const readCookie =
    dependencies.readWebStudioCookie ?? readWebStudioTenantCookie;

  return async function resolveCaller({
    headers,
    request,
    isGraphQL,
  }: WebStudioCallerInput): Promise<WebStudioCaller> {
    const requestCookies = parseCookieHeader(headers.get("cookie"));
    // The organization Web Studio works in: the signed cookie scoped to
    // `/web-studio` (plan 5.2), a proposal the resolver checks below.
    const cookie = await readCookie(
      readCookieValue(requestCookies, WEB_STUDIO_TENANT_COOKIE),
    );
    const e2e = () =>
      decideE2EBypass({
        headers,
        requestCookies,
        cookie,
        request,
        isGraphQL,
      });

    const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseURL || !supabaseAnonKey) {
      return (await e2e()) ?? refuse("no_session");
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
      return (await e2e()) ?? refuse("no_session");
    }

    // Web Studio acts on staff rows (plan 5.1): the row the Web Studio cookie
    // names, proposed to the same resolver every other handler uses, over the
    // caller's live memberships read on their own session through
    // `public.current_user_assignments()` (A08: `authz` is not exposed by the
    // Data API). Without a cookie, the one staff row of a person who needs no
    // choice. A forged, foreign or revoked selection, or several rows and no
    // choice, resolve nothing: there is no fallback to a first membership or
    // a profile. Its flag makes the CMS user an admin.
    const name = readNameTenantState(headers);
    const generation = readNameGeneration(headers);
    if (
      isNameTenantRefused(name) ||
      isNameGenerationRefused(name, generation)
    ) {
      return refuse("no_selection");
    }
    const resolveInput = webStudioResolveInput(cookie, nameTenantIdOf(name));
    if (!resolveInput.ok) {
      return refuse("no_selection");
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
      return resolution.reason === "reader_error"
        ? { kind: "unavailable" }
        : refuse("no_selection");
    }
    const { assignment } = resolution;
    if (
      !isFromCurrentDocument(
        { headers, request, isGraphQL },
        assignment,
        generation,
      )
    ) {
      return refuse("scope_mismatch");
    }

    return {
      kind: "allow",
      userId: supabaseUser.id,
      email: supabaseUser.email ?? null,
      assignment,
      strategy: `${PRINCIPAL_LINKS_SLUG}-${STRATEGY_NAME}`,
      generation,
    };
  };
}

export function createSupabaseAuthStrategy(
  dependencies: SupabaseStrategyDependencies = {},
): AuthStrategy {
  const resolveCaller = createWebStudioCallerResolver(dependencies);

  return {
    name: STRATEGY_NAME,
    authenticate: async ({ headers, payload, req, isGraphQL }) => {
      const caller = await resolveCaller({
        headers,
        request: req ? { method: req.method } : null,
        isGraphQL,
      });
      const outcome =
        caller.kind === "allow"
          ? await signInPrincipal({
              payload,
              userId: caller.userId,
              email: caller.email,
              assignment: caller.assignment,
              strategy: caller.strategy,
            })
          : refused(caller.kind === "refuse" ? caller.refusal : null);
      if (outcome.user === null && outcome.refusal) {
        // Payload then refuses the anonymous operation; the afterError hook
        // turns that into the refusal's JSON answer (web-studio-refusal.ts).
        markWebStudioRefusal(req, outcome.refusal);
      }
      return { user: outcome.user };
    },
  };
}
