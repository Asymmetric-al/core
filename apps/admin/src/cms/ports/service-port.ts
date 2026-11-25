import { PRINCIPAL_LINKS_SLUG } from "../access/tenant-context";

import type {
  BasePayload,
  CollectionSlug,
  PayloadRequest,
  RequestContext,
  Where,
} from "payload";

const SERVICE_PORT = Symbol("asym.cms.service-port");

export const SERVICE_PORT_ID_COLLECTIONS: readonly string[] = Object.freeze([
  "site-presentations",
  "media",
  PRINCIPAL_LINKS_SLUG,
]);

type PayloadStore = Pick<
  BasePayload,
  "create" | "delete" | "find" | "findByID" | "update"
>;

type Doc = Record<string, unknown> & { id: string };

export type PrincipalLinkRow = {
  id: string;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
};

function serviceContext(): RequestContext {
  return { [SERVICE_PORT]: true } as unknown as RequestContext;
}

export function isServicePortRequest(
  req: Pick<PayloadRequest, "context"> | null | undefined,
): boolean {
  const context = req?.context as Record<PropertyKey, unknown> | undefined;
  return context?.[SERVICE_PORT] === true;
}

function errorText(error: unknown): string {
  if (!error || typeof error !== "object") return String(error ?? "");
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    const value = current as {
      code?: unknown;
      message?: unknown;
      data?: unknown;
      cause?: unknown;
    };
    if (typeof value.code === "string") parts.push(`code:${value.code}`);
    if (typeof value.message === "string") parts.push(value.message);
    if (value.data) parts.push(JSON.stringify(value.data));
    current = value.cause;
  }
  return parts.join(" ");
}

export function isUniqueViolation(error: unknown): boolean {
  const text = errorText(error);
  return text.includes("code:23505") || /must be unique/i.test(text);
}

async function findOne(
  payload: PayloadStore,
  collection: CollectionSlug,
  where: Where,
): Promise<Doc | null> {
  const { docs } = await payload.find({
    collection,
    context: serviceContext(),
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where,
  });
  return (docs[0] as Doc | undefined) ?? null;
}

export async function ensurePrincipalLink(
  payload: PayloadStore,
  login: { userId: string; email: string | null },
): Promise<PrincipalLinkRow> {
  const where: Where = { id: { equals: login.userId } };
  const email = login.email ?? null;
  let row = (await findOne(
    payload,
    PRINCIPAL_LINKS_SLUG,
    where,
  )) as PrincipalLinkRow | null;
  if (!row) {
    try {
      row = (await payload.create({
        collection: PRINCIPAL_LINKS_SLUG,
        context: serviceContext(),
        data: { id: login.userId, email },
        depth: 0,
        overrideAccess: true,
      })) as unknown as PrincipalLinkRow;
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      row = (await findOne(
        payload,
        PRINCIPAL_LINKS_SLUG,
        where,
      )) as PrincipalLinkRow | null;
      if (!row) throw error;
    }
  }
  if ((row.email ?? null) !== email) {
    row = (await payload.update({
      id: row.id,
      collection: PRINCIPAL_LINKS_SLUG,
      context: serviceContext(),
      data: { email },
      depth: 0,
      overrideAccess: true,
    })) as unknown as PrincipalLinkRow;
  }
  return row;
}

export async function createSitePresentation(
  payload: PayloadStore,
  site: { siteId: string; tenantId: string },
): Promise<Doc> {
  const existing = await findOne(payload, "site-presentations", {
    id: { equals: site.siteId },
  });
  if (existing) return existing;
  return (await payload.create({
    collection: "site-presentations",
    context: serviceContext(),
    data: { id: site.siteId, tenant: site.tenantId },
    depth: 0,
    overrideAccess: true,
  })) as unknown as Doc;
}

export type MediaRecordInput = {
  id: string;
  tenantId: string;
  alt: string;
  credit?: string | null;
  folder?: string | null;
};

export async function registerMediaRecord(
  payload: PayloadStore,
  media: MediaRecordInput,
): Promise<Doc> {
  const existing = await findOne(payload, "media", {
    id: { equals: media.id },
  });
  if (existing) return existing;
  return (await payload.create({
    collection: "media",
    context: serviceContext(),
    data: {
      id: media.id,
      tenant: media.tenantId,
      alt: media.alt,
      credit: media.credit ?? null,
      folder: media.folder ?? null,
    },
    depth: 0,
    overrideAccess: true,
  })) as unknown as Doc;
}

export async function deleteMediaRecord(
  payload: PayloadStore,
  id: string,
): Promise<void> {
  await payload.delete({
    id,
    collection: "media",
    context: serviceContext(),
    overrideAccess: true,
  });
}

export type ServiceWrite = {
  collection: CollectionSlug;
  data: Record<string, unknown>;
  draft?: boolean;
};

export async function serviceCreate(
  payload: PayloadStore,
  { collection, data, draft }: ServiceWrite,
): Promise<Doc> {
  return (await payload.create({
    collection,
    context: serviceContext(),
    data,
    depth: 0,
    draft,
    overrideAccess: true,
  })) as unknown as Doc;
}

export async function serviceUpdate(
  payload: PayloadStore,
  { collection, data, draft, id }: ServiceWrite & { id: string },
): Promise<Doc> {
  return (await payload.update({
    id,
    collection,
    context: serviceContext(),
    data,
    depth: 0,
    draft,
    overrideAccess: true,
  })) as unknown as Doc;
}

export async function serviceFind(
  payload: PayloadStore,
  {
    collection,
    where,
    depth = 0,
    draft,
  }: {
    collection: CollectionSlug;
    where?: Where;
    depth?: number;
    draft?: boolean;
  },
): Promise<Doc[]> {
  const { docs } = await payload.find({
    collection,
    context: serviceContext(),
    depth,
    draft,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    where,
  });
  return docs as unknown as Doc[];
}

export async function serviceDelete(
  payload: PayloadStore,
  { collection, id }: { collection: CollectionSlug; id: string },
): Promise<void> {
  await payload.delete({
    id,
    collection,
    context: serviceContext(),
    overrideAccess: true,
  });
}
