"use client";

import { ownApiFetch } from "@asym/database/own-api";

/**
 * The funds the Project Page flow offers, from Mission Control's own fund
 * list. The Web Studio cookie never reaches Mission Control's API, so the
 * call goes through the own-API wrapper, which sends the tenant and
 * assignment of the document's scope (plan 5.2; WP2b, AL-2675).
 */
export type StudioFundRow = {
  id: string;
  name?: string | null;
};

export async function fetchStudioFunds(
  signal?: AbortSignal,
): Promise<StudioFundRow[]> {
  const res = await ownApiFetch("/api/admin/funds?limit=200", {
    credentials: "include",
    signal,
  });
  if (!res.ok) {
    throw new Error("Failed to load funds");
  }
  const json = (await res.json()) as { funds?: StudioFundRow[] };
  return json.funds ?? [];
}
