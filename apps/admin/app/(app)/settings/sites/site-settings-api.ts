import { ownApiFetch } from "@asym/database/own-api";
import { z } from "zod";

export const SITE_SETTINGS_QUERY_KEY = ["admin", "site-settings"] as const;

const siteSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  is_default: z.boolean(),
  status: z.enum(["active", "inactive"]),
  primary_domain: z.string().nullable(),
});

const donorAccountBrandSchema = z.object({ display_name: z.string() });

const siteSettingsSchema = z.object({
  sites: z.array(siteSummarySchema),
  brand: donorAccountBrandSchema.nullable(),
});

const siteAnswerSchema = z.object({ site: siteSummarySchema });

const brandAnswerSchema = z.object({ brand: donorAccountBrandSchema });

export type SiteSummary = z.infer<typeof siteSummarySchema>;

export type SiteStatus = SiteSummary["status"];

export type DonorAccountBrand = z.infer<typeof donorAccountBrandSchema>;

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

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
  answer: z.ZodType<T>,
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
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const refusal = z
      .object({ error: z.string(), code: z.string() })
      .safeParse(payload);
    throw refusal.success
      ? new SiteSettingsError(
          response.status,
          refusal.data.code,
          refusal.data.error,
        )
      : new SiteSettingsError(response.status, null, UNAVAILABLE_TEXT);
  }
  const parsed = answer.safeParse(payload);
  if (!parsed.success) {
    throw new SiteSettingsError(response.status, null, UNAVAILABLE_TEXT);
  }
  return parsed.data;
}

export function loadSiteSettings(signal?: AbortSignal): Promise<SiteSettings> {
  return send("/api/admin/sites", siteSettingsSchema, {
    method: "GET",
    signal,
  });
}

export async function createSite(name: string): Promise<SiteSummary> {
  const { site } = await send("/api/admin/sites", siteAnswerSchema, {
    method: "POST",
    body: { name },
  });
  return site;
}

export async function setSiteStatus(
  siteId: string,
  status: SiteStatus,
): Promise<SiteSummary> {
  const { site } = await send("/api/admin/sites/status", siteAnswerSchema, {
    method: "POST",
    body: { siteId, status },
  });
  return site;
}

export async function setDonorAccountName(
  displayName: string,
): Promise<DonorAccountBrand> {
  const { brand } = await send("/api/admin/sites/brand", brandAnswerSchema, {
    method: "POST",
    body: { displayName },
  });
  return brand;
}
