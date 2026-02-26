import { APP_ROLES, type AppRole } from "@asym/auth/roles";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

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
  const password = process.env.DEMO_PASSWORD;
  const emails: Record<AppRole, string | undefined> = {
    admin: process.env.DEMO_ADMIN_EMAIL,
    missionary: process.env.DEMO_MISSIONARY_EMAIL,
    donor: process.env.DEMO_DONOR_EMAIL,
    delivery: process.env.DEMO_DELIVERY_EMAIL,
    ticketing: process.env.DEMO_TICKETING_EMAIL,
    machinery: process.env.DEMO_MACHINERY_EMAIL,
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
