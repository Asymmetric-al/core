import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { SiteFunctions } from "@asym/database/types";

type VerifiedHostRow =
  SiteFunctions["resolve_verified_host"]["Returns"][number];

export const VERIFIED_HOST_FIELDS = [
  "tenant_id",
  "site_id",
  "generation",
  "surfaces",
  "state",
  "is_home",
] as const satisfies readonly (keyof VerifiedHostRow)[];

export type VerifiedNameSurface = "staff" | "missionary";

export const SURFACE_ADMISSION = {
  staff: { states: ["ready", "active"], home: true },
  missionary: { states: ["active"], home: true },
} as const satisfies Record<
  VerifiedNameSurface,
  { states: readonly VerifiedHostRow["state"][]; home: boolean }
>;

export const VERIFIED_NAME_TIMEOUT_MS = 3000;

export type VerifiedNameRefusal =
  "unknown" | "not_ready" | "not_home" | "not_for_surface";

export type VerifiedNameLookup =
  | {
      readonly kind: "admitted";
      readonly tenantId: string;
      readonly generation: number;
    }
  | { readonly kind: "refused"; readonly reason: VerifiedNameRefusal }
  | { readonly kind: "unavailable" };

type LookupAnswer = { data: unknown; error: unknown };

export interface VerifiedNameClient {
  rpc(
    fn: "resolve_verified_host",
    args: SiteFunctions["resolve_verified_host"]["Args"],
  ): { abortSignal(signal: AbortSignal): PromiseLike<LookupAnswer> };
}

const UNAVAILABLE: VerifiedNameLookup = { kind: "unavailable" };

const CANONICAL_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function createVerifiedNameClient(): VerifiedNameClient | null {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) return null;
  const client: VerifiedNameClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

interface WellFormedRow {
  tenantId: string;
  generation: number;
  surfaces: readonly string[];
  state: string;
  isHome: boolean;
}

function wellFormed(raw: unknown): WellFormedRow | null {
  if (raw === null || typeof raw !== "object") return null;
  const {
    tenant_id: tenantId,
    generation,
    surfaces,
    state,
    is_home: isHome,
  } = raw as Record<string, unknown>;
  if (typeof tenantId !== "string" || !CANONICAL_ID.test(tenantId)) return null;
  if (
    typeof generation !== "number" ||
    !Number.isSafeInteger(generation) ||
    generation <= 0
  ) {
    return null;
  }
  if (typeof isHome !== "boolean") return null;
  if (
    !Array.isArray(surfaces) ||
    !surfaces.every((surface) => typeof surface === "string")
  ) {
    return null;
  }
  if (typeof state !== "string") return null;
  return { tenantId, generation, surfaces, state, isHome };
}

function decide(
  row: WellFormedRow,
  surface: VerifiedNameSurface,
): VerifiedNameLookup {
  const rule = SURFACE_ADMISSION[surface];
  if (!(rule.states as readonly string[]).includes(row.state)) {
    return { kind: "refused", reason: "not_ready" };
  }
  if (rule.home && !row.isHome) return { kind: "refused", reason: "not_home" };
  if (!row.surfaces.includes(surface)) {
    return { kind: "refused", reason: "not_for_surface" };
  }
  return {
    kind: "admitted",
    tenantId: row.tenantId,
    generation: row.generation,
  };
}

async function askWithin(
  client: VerifiedNameClient,
  host: string,
): Promise<LookupAnswer | null> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(null);
    }, VERIFIED_NAME_TIMEOUT_MS);
  });
  try {
    const call = Promise.resolve(
      client
        .rpc("resolve_verified_host", { p_host: host })
        .abortSignal(controller.signal),
    );
    return await Promise.race([call, timedOut]);
  } finally {
    clearTimeout(timer);
  }
}

export async function lookUpVerifiedName(
  host: string,
  surface: VerifiedNameSurface,
  client?: VerifiedNameClient,
): Promise<VerifiedNameLookup> {
  let answer: LookupAnswer | null;
  try {
    const lookupClient = client ?? createVerifiedNameClient();
    if (!lookupClient) return UNAVAILABLE;
    answer = await askWithin(lookupClient, host);
  } catch {
    return UNAVAILABLE;
  }
  if (!answer || answer.error || !Array.isArray(answer.data)) {
    return UNAVAILABLE;
  }
  if (answer.data.length === 0) return { kind: "refused", reason: "unknown" };
  if (answer.data.length > 1) return UNAVAILABLE;
  const row = wellFormed(answer.data[0]);
  return row ? decide(row, surface) : UNAVAILABLE;
}

export function verifiedNameUnavailable(): NextResponse {
  return new NextResponse(null, {
    status: 503,
    headers: { "cache-control": "no-store" },
  });
}
