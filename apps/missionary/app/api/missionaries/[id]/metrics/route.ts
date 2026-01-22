import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

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

const ALLOWED_ROLES = new Set(["admin", "missionary", "super_admin"]);
const PERMISSION_ERROR_CODES = new Set([
  "42501",
  "PGRST301",
  "PGRST302",
  "PGRST401",
  "PGRST403",
]);

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

function isPermissionError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code && PERMISSION_ERROR_CODES.has(error.code)) return true;
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("permission") ||
    message.includes("not authorized") ||
    message.includes("not allowed")
  );
}

function createAuthClient(request: NextRequest) {
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
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: any }>,
      ) {
        cookiesToSet.forEach(
          (cookie: { name: string; value: string; options?: any }) => {
            pendingCookies.push({
              name: cookie.name,
              value: cookie.value,
              options: cookie.options,
            });
          },
        );
      },
    },
  });

  return { supabase, pendingCookies };
}

function jsonWithCookies(
  payload: Record<string, unknown>,
  init: { status?: number } | undefined,
  pendingCookies: PendingCookie[],
) {
  const response = NextResponse.json(payload, init);
  pendingCookies.forEach((cookie) => {
    response.cookies.set(
      cookie.name,
      cookie.value,
      normalizeCookieOptions(cookie.options),
    );
  });
  return response;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase, pendingCookies } = createAuthClient(request);
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client unavailable." },
        { status: 503 },
      );
    }

    const { id: missionaryId } = await params;

    if (!missionaryId) {
      return jsonWithCookies(
        { error: "Missing missionary ID" },
        { status: 400 },
        pendingCookies,
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonWithCookies(
        { error: "Unauthorized" },
        { status: 401 },
        pendingCookies,
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, tenant_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      return jsonWithCookies(
        { error: "Unable to load profile." },
        { status: 500 },
        pendingCookies,
      );
    }

    if (
      !profile?.tenant_id ||
      !profile?.role ||
      !ALLOWED_ROLES.has(profile.role)
    ) {
      return jsonWithCookies(
        { error: "Forbidden" },
        { status: 403 },
        pendingCookies,
      );
    }

    const { data: missionary, error: missionaryError } = await supabase
      .from("missionaries")
      .select("id, tenant_id")
      .eq("id", missionaryId)
      .maybeSingle();

    if (missionaryError) {
      const status = isPermissionError(missionaryError) ? 403 : 500;
      return jsonWithCookies(
        { error: status === 403 ? "Forbidden" : "Internal server error" },
        { status },
        pendingCookies,
      );
    }

    if (!missionary) {
      return jsonWithCookies(
        { error: "Missionary not found" },
        { status: 404 },
        pendingCookies,
      );
    }

    if (missionary.tenant_id && missionary.tenant_id !== profile.tenant_id) {
      return jsonWithCookies(
        { error: "Missionary not found" },
        { status: 404 },
        pendingCookies,
      );
    }

    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    const { data, error } = await supabase
      .from("donations")
      .select("id, amount, donation_type, created_at, status")
      .eq("missionary_id", missionaryId)
      .gte("created_at", thirteenMonthsAgo.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      if (isPermissionError(error)) {
        return jsonWithCookies(
          { donations: [], limited: true },
          { status: 200 },
          pendingCookies,
        );
      }
      console.error("Supabase error:", error);
      return jsonWithCookies(
        { error: "Internal server error" },
        { status: 500 },
        pendingCookies,
      );
    }

    return jsonWithCookies(
      { donations: data || [] },
      undefined,
      pendingCookies,
    );
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
