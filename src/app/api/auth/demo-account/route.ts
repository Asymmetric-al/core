import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const DEMO_ROLES = ["admin", "missionary", "donor"] as const;
type DemoRole = (typeof DEMO_ROLES)[number];

type DemoAvailability = Record<DemoRole, boolean>;

const defaultAvailability: DemoAvailability = {
  admin: false,
  missionary: false,
  donor: false,
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
  const emails: Record<DemoRole, string | undefined> = {
    admin: process.env.DEMO_ADMIN_EMAIL,
    missionary: process.env.DEMO_MISSIONARY_EMAIL,
    donor: process.env.DEMO_DONOR_EMAIL,
  };

  const availability: DemoAvailability = {
    admin: Boolean(password && emails.admin),
    missionary: Boolean(password && emails.missionary),
    donor: Boolean(password && emails.donor),
  };

  return { password, emails, availability };
}

function createAuthClient(request: Request) {
  const pendingCookies: PendingCookie[] = [];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabase: null, pendingCookies };
  }

  const requestCookies = parseCookieHeader(request.headers.get("cookie"));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return requestCookies;
      },
      setAll(cookiesToSet) {
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

export async function GET() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEMO_ACCOUNTS !== "true"
  ) {
    return NextResponse.json({ availableRoles: defaultAvailability });
  }

  const { availability } = getDemoConfig();
  return NextResponse.json({ availableRoles: availability });
}

export async function POST(request: Request) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEMO_ACCOUNTS !== "true"
  ) {
    return NextResponse.json(
      { ok: false, error: "Demo login unavailable" },
      { status: 403 },
    );
  }

  try {
    const { role } = (await request.json()) as { role?: DemoRole };

    if (!role || !DEMO_ROLES.includes(role)) {
      return NextResponse.json(
        { ok: false, error: "Demo login unavailable" },
        { status: 400 },
      );
    }

    const { emails, password, availability } = getDemoConfig();
    const email = emails[role];

    if (!availability[role] || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Demo login unavailable" },
        { status: 400 },
      );
    }

    const { supabase, pendingCookies } = createAuthClient(request);
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Demo login unavailable" },
        { status: 503 },
      );
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      return NextResponse.json(
        { ok: false, error: "Invalid demo credentials" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true, role });
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
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
