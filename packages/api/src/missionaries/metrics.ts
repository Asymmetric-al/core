import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { serverEnv } from "@asym/env";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  commonMoneyCurrency,
  knownCurrency,
} from "../missionary-portal/currency";
import { isAnonymousToRecipient } from "../missionary-portal/redaction";
import { SETTLED_DONATION_STATUS_SET } from "../reads/settled-donation-statuses";

export function projectMetricsMoney<
  T extends {
    amount: number;
    refund_amount?: number | null;
    currency?: string | null;
    status?: string | null;
  },
>(gifts: T[]) {
  // Charts count only "completed"; legacy writers also stored the other
  // settled spellings (`succeeded`, `success`, any case), so report them as
  // one. A refund leaves a gift settled, so settled giving counts net of it,
  // as the CRM report does: a fully refunded gift reports as refunded and
  // drops out of totals, counts, averages and the giving mix.
  const donations = gifts.map((gift) => {
    const currency = knownCurrency(gift.currency);
    const settled = SETTLED_DONATION_STATUS_SET.has(
      (gift.status ?? "").trim().toLowerCase(),
    );
    if (!settled) return { ...gift, currency };
    const net = Math.max(0, gift.amount - Math.max(0, gift.refund_amount ?? 0));
    return {
      ...gift,
      amount: net,
      status: net > 0 ? "completed" : "refunded",
      currency,
    };
  });
  return {
    donations,
    currency: commonMoneyCurrency(
      donations.filter((gift) => gift.status === "completed"),
    ),
  };
}

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

const ALLOWED_ROLES = new Set(["staff", "admin", "missionary", "super_admin"]);
const PERMISSION_STATUS_CODES = new Set([401, 403]);
const PERMISSION_ERROR_CODES = new Set([
  "42501",
  "PGRST301",
  "PGRST302",
  "PGRST303",
]);

type PermissionErrorLike = {
  code?: string;
  message?: string;
  status?: number;
  response?: {
    status?: number;
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

const DEFAULT_HISTORY_MONTHS = 13;
const MAX_HISTORY_MONTHS = 25;

/**
 * Spec §7.2, as in the missionary portal: a gift keeps its donor id only when
 * that donor chose to be named to the missionary. Unknown donors fail closed.
 */
export function redactAnonymousGiftDonors<
  T extends { donor_id: string | null },
>(gifts: T[], donors: { id: string; giving_preferences: unknown }[]): T[] {
  const preferences = new Map(
    donors.map((donor) => [donor.id, donor.giving_preferences]),
  );
  return gifts.map((gift) => {
    if (!gift.donor_id) return gift;
    const named =
      preferences.has(gift.donor_id) &&
      !isAnonymousToRecipient({
        givingPreferences: preferences.get(gift.donor_id),
      });
    return named ? gift : { ...gift, donor_id: null };
  });
}

export function historyMonthsParam(request: { url: string }): number {
  const raw = new URL(request.url).searchParams.get("months");
  const months = raw === null ? Number.NaN : Number(raw);
  return Number.isInteger(months) && months >= 1 && months <= MAX_HISTORY_MONTHS
    ? months
    : DEFAULT_HISTORY_MONTHS;
}

function isPermissionError(error: PermissionErrorLike | null) {
  if (!error) return false;
  if (
    typeof error.status === "number" &&
    PERMISSION_STATUS_CODES.has(error.status)
  ) {
    return true;
  }
  if (
    typeof error.response?.status === "number" &&
    PERMISSION_STATUS_CODES.has(error.response.status)
  ) {
    return true;
  }
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
  const pendingHeaders = new Headers();
  const supabaseUrl = serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabase: null, pendingCookies, pendingHeaders };
  }

  const requestCookies = parseCookieHeader(request.headers.get("cookie"));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return requestCookies;
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: unknown }>,
        cacheHeaders: Record<string, string> = {},
      ) {
        Object.entries(cacheHeaders).forEach(([name, value]) => {
          pendingHeaders.set(name, value);
        });
        cookiesToSet.forEach(
          (cookie: { name: string; value: string; options?: unknown }) => {
            pendingCookies.push({
              name: cookie.name,
              value: cookie.value,
              options: cookie.options as PendingCookie["options"],
            });
          },
        );
      },
    },
  });

  return { supabase, pendingCookies, pendingHeaders };
}

function jsonWithCookies(
  payload: Record<string, unknown>,
  init: { status?: number } | undefined,
  pendingCookies: PendingCookie[],
  pendingHeaders: Headers,
) {
  const response = NextResponse.json(payload, {
    ...init,
    headers: pendingHeaders,
  });
  pendingCookies.forEach((cookie) => {
    response.cookies.set(
      cookie.name,
      cookie.value,
      normalizeCookieOptions(cookie.options),
    );
  });
  return response;
}

type MetricsReader =
  | NonNullable<ReturnType<typeof getAdminClient>["client"]>
  | NonNullable<ReturnType<typeof createAuthClient>["supabase"]>;

/**
 * PostgREST answers at most `max_rows` (1,000, supabase/config.toml) rows per
 * request, and the analytics window can hold more gifts than that.
 */
const GIFT_HISTORY_PAGE_SIZE = 1000;

/**
 * Every gift to the missionary created since `windowStartIso`, read page by
 * page in a stable order. Only an empty page ends the read, so a server cap
 * below the page size can't pass for the end, and any failed page fails the
 * whole read rather than returning a partial history as complete.
 */
export async function readMissionaryGiftHistory(
  reader: MetricsReader,
  missionaryId: string,
  windowStartIso: string,
) {
  const gifts = [];
  for (let from = 0; ;) {
    const { data, error } = await reader
      .from("donations")
      .select(
        "id, amount, refund_amount, currency, donation_type, created_at, gift_date, status, donor_id",
      )
      .eq("missionary_id", missionaryId)
      .gte("created_at", windowStartIso)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + GIFT_HISTORY_PAGE_SIZE - 1);
    if (error) return { data: null, error };
    const page = data ?? [];
    if (page.length === 0) return { data: gifts, error: null };
    gifts.push(...page);
    from += page.length;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, pendingCookies, pendingHeaders } =
    createAuthClient(request);
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase client unavailable." },
      { status: 503 },
    );
  }

  try {
    const { id: missionaryId } = await params;

    if (!missionaryId) {
      return jsonWithCookies(
        { error: "Missing missionary ID" },
        { status: 400 },
        pendingCookies,
        pendingHeaders,
      );
    }

    const auth = await getAuthContext(request);

    if (!auth.isAuthenticated || !auth.userId) {
      return jsonWithCookies(
        { error: "Unauthorized" },
        { status: 401 },
        pendingCookies,
        pendingHeaders,
      );
    }

    if (
      !auth.tenantId ||
      !auth.role ||
      !ALLOWED_ROLES.has(auth.role) ||
      !hasAnyContextRole(auth, ["staff", "admin", "missionary", "super_admin"])
    ) {
      return jsonWithCookies(
        { error: "Forbidden" },
        { status: 403 },
        pendingCookies,
        pendingHeaders,
      );
    }

    const dataReader = getAdminClient().client ?? supabase;

    const { data: missionary, error: missionaryError } = await dataReader
      .from("missionaries")
      .select("id, tenant_id, profile_id")
      .or(`id.eq.${missionaryId},profile_id.eq.${missionaryId}`)
      .maybeSingle();

    if (missionaryError) {
      const status = isPermissionError(missionaryError) ? 403 : 500;
      return jsonWithCookies(
        { error: status === 403 ? "Forbidden" : "Internal server error" },
        { status },
        pendingCookies,
        pendingHeaders,
      );
    }

    if (!missionary) {
      return jsonWithCookies(
        { error: "Missionary not found" },
        { status: 404 },
        pendingCookies,
        pendingHeaders,
      );
    }

    if (missionary.tenant_id && missionary.tenant_id !== auth.tenantId) {
      return jsonWithCookies(
        { error: "Missionary not found" },
        { status: 404 },
        pendingCookies,
        pendingHeaders,
      );
    }

    if (
      hasAnyContextRole(auth, ["missionary"]) &&
      !hasAnyContextRole(auth, ["staff", "admin", "super_admin"]) &&
      missionary.profile_id !== auth.profileId
    ) {
      return jsonWithCookies(
        { error: "Missionary not found" },
        { status: 404 },
        pendingCookies,
        pendingHeaders,
      );
    }

    // 13 months feeds the dashboard; analytics asks for 25 so it can
    // compare a full year with the one before. Bounded so the window can't
    // be used to pull an unbounded history.
    const months = historyMonthsParam(request);
    const windowStart = new Date();
    windowStart.setMonth(windowStart.getMonth() - months);

    const { data, error } = await readMissionaryGiftHistory(
      dataReader,
      missionary.id,
      windowStart.toISOString(),
    );

    if (error) {
      if (isPermissionError(error)) {
        return jsonWithCookies(
          { donations: [], limited: true },
          { status: 200 },
          pendingCookies,
          pendingHeaders,
        );
      }
      console.error("Supabase error:", error);
      return jsonWithCookies(
        { error: "Internal server error" },
        { status: 500 },
        pendingCookies,
        pendingHeaders,
      );
    }

    const gifts = data ?? [];
    const donorIds = [
      ...new Set(
        gifts.flatMap((gift) => (gift.donor_id ? [gift.donor_id] : [])),
      ),
    ];
    let donors: { id: string; giving_preferences: unknown }[] = [];
    if (donorIds.length > 0) {
      const donorRead = await dataReader
        .from("donors")
        .select("id, giving_preferences")
        .in("id", donorIds);
      // Without preferences every gift stays anonymous (fail closed).
      donors = donorRead.data ?? [];
    }

    return jsonWithCookies(
      projectMetricsMoney(redactAnonymousGiftDonors(gifts, donors)),
      undefined,
      pendingCookies,
      pendingHeaders,
    );
  } catch (e) {
    console.error("API error:", e);
    return jsonWithCookies(
      { error: "Internal server error" },
      { status: 500 },
      pendingCookies,
      pendingHeaders,
    );
  }
}
