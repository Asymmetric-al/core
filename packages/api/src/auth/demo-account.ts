import {
  createE2EAuthCookieValue,
  getE2EAuthCookieNameForRequest,
  isE2EAuthBypassEnabled,
} from "@asym/auth";
import { APP_ROLES, type AppRole } from "@asym/auth/roles";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { serverEnv } from "@asym/env";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import type { UserRole } from "@asym/database/types";

type DemoAvailability = Record<AppRole, boolean>;

const defaultAvailability: DemoAvailability = {
  admin: false,
  missionary: false,
  donor: false,
  delivery: false,
  ticketing: false,
  machinery: false,
};

type PendingCookie = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "lax" | "strict" | "none" | boolean;
    secure?: boolean;
  };
};

function normalizeCookieOptions(options?: PendingCookie["options"]) {
  if (!options) return undefined;
  const { sameSite, ...rest } = options;
  if (typeof sameSite === "boolean") {
    return rest;
  }
  return sameSite ? { ...rest, sameSite } : rest;
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return [];
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf("=");
      if (idx === -1) return { name: pair, value: "" };
      return {
        name: pair.slice(0, idx),
        value: decodeURIComponent(pair.slice(idx + 1)),
      };
    });
}

function getDemoConfig() {
  const password = serverEnv.DEMO_PASSWORD;
  const emails: Record<AppRole, string | undefined> = {
    admin: serverEnv.DEMO_ADMIN_EMAIL,
    missionary: serverEnv.DEMO_MISSIONARY_EMAIL,
    donor: serverEnv.DEMO_DONOR_EMAIL,
    delivery: serverEnv.DEMO_DELIVERY_EMAIL,
    ticketing: serverEnv.DEMO_TICKETING_EMAIL,
    machinery: serverEnv.DEMO_MACHINERY_EMAIL,
  };

  const availability: DemoAvailability = {
    admin: Boolean(password && emails.admin),
    missionary: Boolean(password && emails.missionary),
    donor: Boolean(password && emails.donor),
    delivery: Boolean(password && emails.delivery),
    ticketing: Boolean(password && emails.ticketing),
    machinery: Boolean(password && emails.machinery),
  };

  return { password, emails, availability };
}

/** Map AppRole to UserRole for E2E cookie (UserRole is a subset). */
function appRoleToUserRole(role: AppRole): UserRole {
  if (role === "admin" || role === "missionary" || role === "donor") {
    return role;
  }
  return "admin";
}

function createAuthClient(request: Request) {
  const pendingCookies: PendingCookie[] = [];
  const { url, key } = getSupabasePublicConfig();

  if (!url || !key) {
    return { supabase: null, pendingCookies };
  }

  const requestCookies = parseCookieHeader(request.headers.get("cookie"));

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return requestCookies;
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: PendingCookie["options"];
        }[],
      ) {
        cookiesToSet.forEach((cookie) => {
          pendingCookies.push({
            name: cookie.name,
            value: cookie.value,
            options: cookie.options,
          });
        });
      },
    },
  });

  return { supabase, pendingCookies };
}

function isDemoEndpointEnabled() {
  // Use `process.env.NODE_ENV` here (not `runtimeEnvFlags.NODE_ENV` from `@asym/env`).
  // `runtimeEnvFlags` snapshots NODE_ENV when the env module first loads; under Vitest
  // that is typically `"test"`, which would incorrectly keep demo routes enabled when
  // tests simulate `NODE_ENV=production`.
  // Read `ALLOW_DEMO_ACCOUNTS` from `process.env`, not `serverEnv`: `@asym/env` parses
  // once at module load; Vitest mutates `process.env` per test after imports.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEMO_ACCOUNTS !== "true"
  ) {
    return false;
  }
  return true;
}

function buildAvailabilityResponse(
  availability: DemoAvailability,
  reason?: string,
) {
  return {
    enabled: Object.values(availability).some(Boolean),
    roles: availability,
    ...(reason ? { reason } : {}),
    // Backward compatibility for existing consumers.
    availableRoles: availability,
  };
}

function toSafeDemoError(rawMessage: string | undefined) {
  const message = rawMessage?.toLowerCase() ?? "";
  if (message.includes("invalid login credentials")) {
    return "Invalid login credentials";
  }
  return "Demo login is not configured.";
}

export async function GET() {
  if (isE2EAuthBypassEnabled()) {
    return NextResponse.json({
      availableRoles: { admin: true, missionary: true, donor: true },
    });
  }
  if (!isDemoEndpointEnabled()) {
    return NextResponse.json(
      buildAvailabilityResponse(
        defaultAvailability,
        "Demo accounts are disabled in production.",
      ),
    );
  }

  const { availability } = getDemoConfig();
  return NextResponse.json(buildAvailabilityResponse(availability));
}

export async function POST(request: Request) {
  if (!isDemoEndpointEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Demo login unavailable",
        code: "DEMO_DISABLED",
      },
      { status: 403 },
    );
  }

  try {
    const { role } = (await request.json()) as { role?: AppRole };

    if (!role || !APP_ROLES.includes(role)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Demo login unavailable",
          code: "DEMO_INVALID_ROLE",
        },
        { status: 400 },
      );
    }

    if (isE2EAuthBypassEnabled()) {
      const e2eRole = appRoleToUserRole(role);
      const response = NextResponse.json({ ok: true, role, bypass: true });
      const secure = new URL(request.url).protocol === "https:";

      const cookieName = getE2EAuthCookieNameForRequest(request);
      if (cookieName) {
        response.cookies.set(
          cookieName,
          createE2EAuthCookieValue({
            userId: `e2e-${role}-user`,
            role: e2eRole,
            tenantId: null,
          }),
          {
            httpOnly: true,
            maxAge: 60 * 60,
            path: "/",
            sameSite: "lax",
            secure,
          },
        );
      }

      return response;
    }

    const { emails, password, availability } = getDemoConfig();
    const email = emails[role];

    if (!availability[role] || !email || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: "Demo login is not configured.",
          code: "DEMO_ROLE_UNAVAILABLE",
        },
        { status: 400 },
      );
    }

    const { supabase, pendingCookies } = createAuthClient(request);
    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          error: "Demo login is not configured.",
          code: "DEMO_SUPABASE_MISSING",
        },
        { status: 503 },
      );
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      return NextResponse.json(
        {
          ok: false,
          error: toSafeDemoError(signInError.message),
          code: "DEMO_SIGNIN_FAILED",
        },
        { status: 401 },
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.info(`[demo-auth] demo login success role=${role}`);
    }

    const response = NextResponse.json({ ok: true });
    pendingCookies.forEach((cookie) => {
      response.cookies.set(
        cookie.name,
        cookie.value,
        normalizeCookieOptions(cookie.options),
      );
    });
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error", code: "DEMO_SERVER_ERROR" },
      { status: 500 },
    );
  }
}
