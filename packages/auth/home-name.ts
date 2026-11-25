import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createClient } from "@supabase/supabase-js";

import type { SiteFunctions } from "@asym/database/types";

type HomeHostRow = SiteFunctions["resolve_home_host"]["Returns"][number];

export const HOME_HOST_FIELDS = [
  "primary_domain",
] as const satisfies readonly (keyof HomeHostRow)[];

export const HOME_NAME_TIMEOUT_MS = 3000;

export const STORED_HOST_MAX_BYTES = 253;

const STORED_HOST =
  /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]([a-z0-9-]{0,61}[a-z0-9])?$/;

export type HomeNameLookup =
  | { readonly kind: "unavailable" }
  | { readonly kind: "none" }
  | { readonly kind: "home"; readonly host: string };

type HomeAnswer = { data: unknown; error: unknown };

export interface HomeNameClient {
  rpc(
    fn: "resolve_home_host",
    args: SiteFunctions["resolve_home_host"]["Args"],
  ): { abortSignal(signal: AbortSignal): PromiseLike<HomeAnswer> };
}

const UNAVAILABLE = { kind: "unavailable" } as const;
const NONE = { kind: "none" } as const;

export function isStoredHost(value: unknown): value is string {
  return (
    typeof value === "string" &&
    new TextEncoder().encode(value).length <= STORED_HOST_MAX_BYTES &&
    STORED_HOST.test(value)
  );
}

export function createHomeNameClient(): HomeNameClient | null {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) return null;
  const client: HomeNameClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

async function askWithin(
  client: HomeNameClient,
  host: string,
): Promise<HomeAnswer | null> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(null);
    }, HOME_NAME_TIMEOUT_MS);
  });
  try {
    const call = Promise.resolve(
      client
        .rpc("resolve_home_host", { p_host: host })
        .abortSignal(controller.signal),
    );
    return await Promise.race([call, timedOut]);
  } finally {
    clearTimeout(timer);
  }
}

export async function lookUpHomeName(
  host: string,
  client?: HomeNameClient,
): Promise<HomeNameLookup> {
  let answer: HomeAnswer | null;
  try {
    const homeClient = client ?? createHomeNameClient();
    if (!homeClient) return UNAVAILABLE;
    answer = await askWithin(homeClient, host);
  } catch {
    return UNAVAILABLE;
  }
  if (!answer || answer.error || !Array.isArray(answer.data)) {
    return UNAVAILABLE;
  }
  if (answer.data.length === 0) return NONE;
  if (answer.data.length > 1) return UNAVAILABLE;
  const row: unknown = answer.data[0];
  if (row === null || typeof row !== "object") return UNAVAILABLE;
  const stored = (row as Record<string, unknown>).primary_domain;
  if (!isStoredHost(stored)) return UNAVAILABLE;
  return { kind: "home", host: stored };
}
