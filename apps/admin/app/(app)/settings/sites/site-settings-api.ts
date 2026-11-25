import { ownApiFetch } from "@asym/database/own-api";

export const SITE_SETTINGS_QUERY_KEY = ["admin", "site-settings"] as const;

export type SiteStatus = "active" | "inactive";

export interface SiteSummary {
  id: string;
  name: string;
  is_default: boolean;
  status: SiteStatus;
  primary_domain: string | null;
}

export interface SiteSettings {
  sites: SiteSummary[];
  brand: { display_name: string } | null;
}

export const UNAVAILABLE_TEXT =
  "Sites can't be loaded or changed right now. Try again.";

export class SiteSettingsError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    message: string,
  ) {
    super(message);
    this.name = "SiteSettingsError";
  }
}

export function isNoAccessError(error: unknown): boolean {
  return error instanceof SiteSettingsError && error.status === 403;
}

export function isInvalidNameError(error: unknown): boolean {
  return error instanceof SiteSettingsError && error.code === "INVALID_NAME";
}

export function errorText(error: unknown): string {
  return error instanceof SiteSettingsError ? error.message : UNAVAILABLE_TEXT;
}

const NAME_EDGES = /^[\p{White_Space}\p{Cf}]+|[\p{White_Space}\p{Cf}]+$/gu;

export function stripNameEdges(value: string): string {
  return value.replace(NAME_EDGES, "");
}

async function send<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; signal?: AbortSignal },
): Promise<T> {
  const response = await ownApiFetch(path, {
    method: init.method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(init.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: init.signal,
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
    code?: unknown;
  } | null;
  if (!response.ok) {
    const code = typeof payload?.code === "string" ? payload.code : null;
    const text =
      code !== null && typeof payload?.error === "string"
        ? payload.error
        : UNAVAILABLE_TEXT;
    throw new SiteSettingsError(response.status, code, text);
  }
  return payload as T;
}

export function loadSiteSettings(signal?: AbortSignal): Promise<SiteSettings> {
  return send<SiteSettings>("/api/admin/sites", { method: "GET", signal });
}

export async function createSite(name: string): Promise<SiteSummary> {
  const { site } = await send<{ site: SiteSummary }>("/api/admin/sites", {
    method: "POST",
    body: { name },
  });
  return site;
}

export async function setSiteStatus(
  siteId: string,
  status: SiteStatus,
): Promise<SiteSummary> {
  const { site } = await send<{ site: SiteSummary }>(
    "/api/admin/sites/status",
    { method: "POST", body: { siteId, status } },
  );
  return site;
}

export async function setDonorAccountName(
  displayName: string,
): Promise<{ display_name: string }> {
  const { brand } = await send<{ brand: { display_name: string } }>(
    "/api/admin/sites/brand",
    { method: "POST", body: { displayName } },
  );
  return brand;
}
