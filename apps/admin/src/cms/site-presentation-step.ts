import { createSitePresentation, serviceFind } from "./ports/service-port";

import type { BasePayload } from "payload";

type PayloadStore = Pick<
  BasePayload,
  "create" | "delete" | "find" | "findByID" | "update"
>;

export type CoreSite = { id: string; tenantId: string };

export type CoreSiteReader = (siteId: string) => Promise<CoreSite | null>;

export type SitePresentationRefusalReason =
  "not-a-site" | "other-organization" | "presentation-elsewhere";

const REFUSALS: Record<SitePresentationRefusalReason, string> = {
  "not-a-site": "is not a Site in Core",
  "other-organization":
    "belongs to another organization than the one this step acts for",
  "presentation-elsewhere":
    "already has a presentation under another organization",
};

export class SitePresentationRefusal extends Error {
  readonly reason: SitePresentationRefusalReason;

  constructor(siteId: string | null, reason: SitePresentationRefusalReason) {
    super(
      `${siteId ? `Site ${siteId}` : "The given ID"} ${REFUSALS[reason]}; no presentation was written.`,
    );
    this.name = "SitePresentationRefusal";
    this.reason = reason;
  }
}

const UUID_TEXT =
  /^(\{)?([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})(\})?$/i;

export function uuidKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = UUID_TEXT.exec(value);
  if (!match || Boolean(match[1]) !== Boolean(match[7])) return null;
  return match.slice(2, 7).join("-").toLowerCase();
}

export async function ensureSitePresentation(
  payload: PayloadStore,
  {
    siteId,
    readSite,
    actingTenantId,
  }: {
    siteId: string;
    readSite: CoreSiteReader;
    actingTenantId?: string;
  },
): Promise<Record<string, unknown> & { id: string }> {
  const id = uuidKey(siteId);
  if (id === null) throw new SitePresentationRefusal(null, "not-a-site");
  const site = await readSite(id);
  const tenant =
    site && uuidKey(site.id) === id ? uuidKey(site.tenantId) : null;
  if (tenant === null) throw new SitePresentationRefusal(id, "not-a-site");
  if (actingTenantId !== undefined && uuidKey(actingTenantId) !== tenant) {
    throw new SitePresentationRefusal(id, "other-organization");
  }
  const [existing] = await serviceFind(payload, {
    collection: "site-presentations",
    where: { id: { equals: id } },
  });
  if (existing) {
    if (uuidKey(existing.tenant) !== tenant) {
      throw new SitePresentationRefusal(id, "presentation-elsewhere");
    }
    return existing;
  }
  return createSitePresentation(payload, { siteId: id, tenantId: tenant });
}
