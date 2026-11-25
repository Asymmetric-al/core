import { Forbidden } from "payload";

import { readEditingActor, type CmsActor } from "../access/tenant-context";

import type { CollectionSlug, PayloadRequest, Where } from "payload";

type Doc = Record<string, unknown> & { id: string };

export function requireEditingActor(req: PayloadRequest): CmsActor {
  const actor = readEditingActor(req);
  if (!actor) throw new Forbidden(req.t);
  return actor;
}

function withTenant(actor: CmsActor, where?: Where): Where {
  const tenant: Where = { tenant: { equals: actor.tenantId } };
  return where ? { and: [where, tenant] } : tenant;
}

export async function actorFind(
  req: PayloadRequest,
  {
    collection,
    where,
    limit = 0,
    depth = 0,
    draft,
  }: {
    collection: CollectionSlug;
    where?: Where;
    limit?: number;
    depth?: number;
    draft?: boolean;
  },
): Promise<Doc[]> {
  const actor = requireEditingActor(req);
  const { docs } = await req.payload.find({
    collection,
    depth,
    draft,
    limit,
    overrideAccess: false,
    pagination: false,
    req,
    user: req.user,
    where: withTenant(actor, where),
  });
  return docs as unknown as Doc[];
}

export async function actorFindOne(
  req: PayloadRequest,
  options: { collection: CollectionSlug; where: Where; draft?: boolean },
): Promise<Doc | null> {
  const [doc] = await actorFind(req, { ...options, limit: 1 });
  return doc ?? null;
}

export async function actorCreate(
  req: PayloadRequest,
  {
    collection,
    data,
    draft,
  }: {
    collection: CollectionSlug;
    data: Record<string, unknown>;
    draft?: boolean;
  },
): Promise<Doc> {
  requireEditingActor(req);
  return (await req.payload.create({
    collection,
    data,
    depth: 0,
    draft,
    overrideAccess: false,
    req,
    user: req.user,
  })) as unknown as Doc;
}

export async function actorUpdate(
  req: PayloadRequest,
  {
    collection,
    id,
    data,
    draft,
  }: {
    collection: CollectionSlug;
    id: string;
    data: Record<string, unknown>;
    draft?: boolean;
  },
): Promise<Doc> {
  const existing = await actorFindOne(req, {
    collection,
    draft,
    where: { id: { equals: id } },
  });
  if (!existing) throw new Forbidden(req.t);
  return (await req.payload.update({
    id,
    collection,
    data,
    depth: 0,
    draft,
    overrideAccess: false,
    req,
    user: req.user,
  })) as unknown as Doc;
}

export async function actorDelete(
  req: PayloadRequest,
  { collection, id }: { collection: CollectionSlug; id: string },
): Promise<void> {
  const existing = await actorFindOne(req, {
    collection,
    where: { id: { equals: id } },
  });
  if (!existing) throw new Forbidden(req.t);
  await req.payload.delete({
    id,
    collection,
    overrideAccess: false,
    req,
    user: req.user,
  });
}
