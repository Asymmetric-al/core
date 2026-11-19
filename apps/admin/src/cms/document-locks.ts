import { getTenantContext } from "./access/tenant-context";

import type {
  Access,
  Collection,
  CollectionBeforeChangeHook,
  PayloadRequest,
  SanitizedConfig,
  Where,
} from "payload";

/**
 * Document locks inside one organization (AL-2675, WP2b slice C; council C3
 * and round 2 CR2).
 *
 * Payload's lock is the only thing that stops two editors overwriting each
 * other: a REST save passes `overrideLock: false`, and a live lock held by
 * someone else refuses it (`payload/dist/utilities/checkDocumentLockStatus.js`,
 * which reads the lock table directly). Collections that autosave never run
 * the stale-data check, and navigation and missionary profiles keep no
 * versions, so without locks the last writer would win silently.
 *
 * In Payload 4.0.0-beta.9 two paths let a staff member of one organization
 * lock another organization's document, and C3 closed both:
 *
 * - the `form-state` server function checks only admin access, then, asked
 *   for a document's lock status, reads the live lock as the person and
 *   writes one with `req.payload.db.create` for any document id
 *   (`@payloadcms/ui/dist/utilities/handleFormStateLocking.js`);
 * - the lock collection grants create, read, update and delete to every
 *   signed-in user (`payload/dist/locked-documents/config.js`), over REST and
 *   GraphQL alike.
 *
 * Round 2 keeps them closed and gives locks back inside the organization:
 *
 * - Web Studio's `form-state` asks for lock status only for a document the
 *   person can read, under their own access, in the organization they
 *   selected (`withOrganizationLocks`);
 * - the lock collection admits no create (Payload writes its locks through
 *   `req.payload.db`), and reads, takes over or releases only lock rows whose
 *   document the person can read in that organization
 *   (`lockAccessInOrganization`). A take-over hands the lock to the person
 *   taking over and never moves it to another document (`lockHeldByCaller`).
 *
 * Every read of a lock goes through that access: Payload's edit view and
 * take-over (REST), `getIsLocked`, `form-state`'s own read and the lock
 * status of a list (`find` with `includeLockStatus`) all read with
 * `overrideAccess: false`. "The organization" is the selected tenant
 * itself, not only what read access admits, so even a super administrator,
 * whom read access lets see every tenant, locks only in the one selected.
 * `cms-users` carry a `tenantId`, but it is the person's current selection,
 * rewritten when they switch, so a lock is placed by its document, never by
 * its holder.
 */
export const LOCKED_DOCUMENTS_SLUG = "payload-locked-documents";

type Id = number | string;
type Relation = { relationTo?: string; value?: unknown } | null | undefined;

const idOf = (value: unknown): string | null => {
  if (value && typeof value === "object" && "id" in value) {
    return String((value as { id: Id }).id);
  }
  return value === null || value === undefined ? null : String(value);
};

/** The field that names a document's organization, or `null` for a collection with none. */
function organizationField(
  req: PayloadRequest,
  collectionSlug: string,
): string | null {
  if (collectionSlug === "tenants") return "id";
  const collections = req.payload.collections as Record<
    string,
    Collection | undefined
  >;
  const collection = collections[collectionSlug];
  if (!collection) return null;
  const names = new Set(
    collection.config.flattenedFields.map((field) => field.name),
  );
  if (names.has("tenant")) return "tenant";
  if (names.has("tenantId")) return "tenantId";
  return null;
}

/**
 * Of `ids`, the documents of `collectionSlug` the person can read, under
 * their own access, in the organization they selected.
 */
async function documentsInOrganization(
  req: PayloadRequest,
  collectionSlug: string,
  ids: Id[],
): Promise<Set<string>> {
  const tenantId = getTenantContext(req).tenantId;
  const field = organizationField(req, collectionSlug);
  if (!req.user || !tenantId || !field || ids.length === 0) return new Set();
  const where: Where = {
    and: [{ id: { in: ids } }, { [field]: { equals: tenantId } }],
  };
  const { docs } = (await req.payload.find({
    collection: collectionSlug as never,
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: false,
    req,
    where,
  })) as { docs: Array<{ id: Id }> };
  return new Set(docs.map((doc) => String(doc.id)));
}

/** Whether the person may hold a lock on this document. */
export async function canLockDocument(
  req: PayloadRequest,
  collectionSlug: string,
  id: Id,
): Promise<boolean> {
  return (await documentsInOrganization(req, collectionSlug, [id])).has(
    String(id),
  );
}

/**
 * The lock collection's read, update and delete access: only lock rows whose
 * document the person can read in the organization they selected. Live
 * locks last five minutes, so the rows are few; they are read directly, as
 * Payload's own lock check reads them.
 *
 * Payload evaluates this access once per operation on the lock collection,
 * so a request that makes several (the edit view's `form-state`, a list with
 * `includeLockStatus`) reads the rows and their documents each time. That is
 * left as it is. If it ever matters, the memo goes here, at the top of this
 * function: keyed on the request (`req.context`, or a `WeakMap` keyed on
 * `req`), holding the resolved constraint for that request only, never across
 * requests or people. It must be dropped when the same request writes a lock
 * row, because `form-state` reads the lock and then creates one with
 * `req.payload.db.create`.
 */
export const lockAccessInOrganization: Access = async ({ req }) => {
  if (!req.user) return false;
  const { docs } = await req.payload.db.find({
    collection: LOCKED_DOCUMENTS_SLUG,
    limit: 0,
    pagination: false,
    req,
    where: {},
  });
  const byCollection = new Map<string, Array<{ lock: string; doc: string }>>();
  for (const row of docs as Array<{ id: Id; document?: Relation }>) {
    const slug = row.document?.relationTo;
    const doc = idOf(row.document?.value);
    if (!slug || !doc) continue;
    const entries = byCollection.get(slug) ?? [];
    entries.push({ lock: String(row.id), doc });
    byCollection.set(slug, entries);
  }
  const allowed: string[] = [];
  for (const [slug, entries] of byCollection) {
    const readable = await documentsInOrganization(
      req,
      slug,
      entries.map((entry) => entry.doc),
    );
    for (const entry of entries) {
      if (readable.has(entry.doc)) allowed.push(entry.lock);
    }
  }
  return allowed.length > 0
    ? { id: { in: allowed } }
    : { id: { exists: false } };
};

/** No lock is created through the API: Payload writes its locks itself. */
export const noLockCreate: Access = () => false;

/**
 * A lock written through the API (Payload's take-over) is held by the person
 * writing it, and stays on its own document: the body can neither hand it to
 * someone else nor move it to another document.
 */
export const lockHeldByCaller: CollectionBeforeChangeHook = ({
  data,
  operation,
  req,
}) => {
  if (!req.user) return data;
  const next: Record<string, unknown> = {
    ...data,
    user: { relationTo: req.user.collection, value: req.user.id },
  };
  if (operation === "update") {
    // Payload keeps the stored value of a field the update leaves out.
    delete next.document;
    delete next.globalSlug;
  }
  return next;
};

type FormStateLockArgs = {
  req?: PayloadRequest;
  collectionSlug?: string;
  globalSlug?: string;
  id?: Id;
  returnLockStatus?: boolean;
  updateLastEdited?: boolean;
};

/**
 * Wraps Payload's `form-state` server function: it reads, writes or renews
 * a lock only for a document the person can read in the organization they
 * selected. For anything else it runs without lock status, as C3 did.
 */
export function withOrganizationLocks<Args extends object, Result>(
  handler: (args: Args) => Promise<Result>,
): (args: Args) => Promise<Result> {
  return async (args) => {
    const lock = args as FormStateLockArgs;
    if (!lock.returnLockStatus && !lock.updateLastEdited) return handler(args);
    const inOrganization =
      !lock.globalSlug &&
      Boolean(lock.req && lock.collectionSlug) &&
      lock.id !== undefined &&
      lock.id !== null &&
      (await canLockDocument(lock.req!, lock.collectionSlug!, lock.id));
    return handler(
      inOrganization
        ? args
        : { ...args, returnLockStatus: false, updateLastEdited: false },
    );
  };
}

/**
 * Sets the lock collection's access and hook on the configuration Payload
 * is built from, so every Payload instance has them, a development server's
 * hot reload included: it rebuilds the collections from a fresh configuration
 * and does not run `onInit` again (round 2, lens 1 I2).
 */
export function keepDocumentLocksInOrganization(
  config: SanitizedConfig,
): SanitizedConfig {
  const locks = config.collections.find(
    (collection) => collection.slug === LOCKED_DOCUMENTS_SLUG,
  );
  if (!locks) return config;
  locks.access = {
    ...locks.access,
    create: noLockCreate,
    read: lockAccessInOrganization,
    update: lockAccessInOrganization,
    delete: lockAccessInOrganization,
  };
  locks.hooks = {
    ...locks.hooks,
    beforeChange: [...(locks.hooks?.beforeChange ?? []), lockHeldByCaller],
  };
  return config;
}
