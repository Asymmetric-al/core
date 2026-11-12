import {
  getEnabledWebStudioCollections,
  getGroupedWebStudioCollections,
} from "../collections/config";
import { readableAdminCollections } from "../shell/admin-collections";

import type { WebStudioCollectionSlug } from "../collections/config";
import type { Payload, PayloadRequest, SanitizedPermissions } from "payload";

export type WebStudioDashboardCollection = {
  slug: WebStudioCollectionSlug;
  title: string;
  description: string;
  href: string;
  /** Documents the signed-in user can read; null when the count failed. */
  total: number | null;
  /** Unpublished documents; null when the collection has no drafts. */
  drafts: number | null;
};

export type WebStudioDocumentStatus = "changed" | "draft" | "published";

export type WebStudioDashboardRecent = {
  id: string;
  title: string;
  href: string;
  collectionSlug: WebStudioCollectionSlug;
  collectionLabel: string;
  /** Payload's list status: "changed" is live with a newer draft. */
  status: WebStudioDocumentStatus | null;
  updatedAt: string;
};

export type WebStudioDashboardAdminLink = {
  slug: string;
  title: string;
  description: string;
  href: string;
  /** Records the signed-in user can read; null when the count failed. */
  total: number | null;
};

export type WebStudioDashboardData = {
  groups: Array<{
    id: string;
    label: string;
    collections: WebStudioDashboardCollection[];
  }>;
  recent: WebStudioDashboardRecent[];
  recentFailedCollections: number;
  admin: WebStudioDashboardAdminLink[];
};

const RECENT_LIMIT = 6;

type LoadArgs = {
  payload: Pick<Payload, "collections" | "count" | "find" | "findVersions">;
  req: PayloadRequest;
  permissions: SanitizedPermissions | undefined;
};

function hasDrafts(
  payload: LoadArgs["payload"],
  slug: WebStudioCollectionSlug,
): boolean {
  const versions = payload.collections[slug]?.config?.versions;
  return Boolean(versions && typeof versions === "object" && versions.drafts);
}

async function countOrNull(
  run: () => Promise<{ totalDocs: number }>,
): Promise<number | null> {
  try {
    return (await run()).totalDocs;
  } catch {
    return null;
  }
}

/**
 * Ids of draft documents that also have a published version, which Payload's
 * list view shows as "Changed" (`enrichDocsWithVersionStatus`). Read as the
 * signed-in user; on failure publication status is unknown.
 */
async function publishedParentIds({
  payload,
  req,
  slug,
  draftIds,
}: Pick<LoadArgs, "payload" | "req"> & {
  slug: WebStudioCollectionSlug;
  draftIds: Array<string | number>;
}): Promise<Set<string> | null> {
  if (draftIds.length === 0) return new Set();
  try {
    const versions = await payload.findVersions({
      collection: slug,
      depth: 0,
      limit: 0,
      overrideAccess: false,
      pagination: false,
      req,
      select: { parent: true },
      where: {
        and: [
          { parent: { in: draftIds } },
          { "version._status": { equals: "published" } },
        ],
      },
    });
    return new Set(
      versions.docs.flatMap((version) => {
        const parent = (version as { parent?: unknown }).parent;
        if (typeof parent === "string" || typeof parent === "number") {
          return [String(parent)];
        }
        if (parent && typeof parent === "object" && "id" in parent) {
          return [String((parent as { id: unknown }).id)];
        }
        return [];
      }),
    );
  } catch {
    return null;
  }
}

function documentStatus(
  doc: Record<string, unknown>,
  changedIds: Set<string> | null,
): WebStudioDocumentStatus | null {
  if (doc._status === "draft") {
    if (changedIds === null) return null;
    return changedIds.has(String(doc.id)) ? "changed" : "draft";
  }
  return doc._status === "published" ? "published" : null;
}

function documentTitle(doc: Record<string, unknown>, field: string): string {
  const value = doc[field];
  if (typeof value === "string" && value.trim().length > 0) return value;
  return `Untitled (${String(doc.id)})`;
}

async function loadRecent({
  payload,
  req,
}: Pick<LoadArgs, "payload" | "req">): Promise<{
  items: WebStudioDashboardRecent[];
  failedCollections: number;
}> {
  const perCollection = await Promise.all(
    getEnabledWebStudioCollections().map(async (collection) => {
      const titleField = String(
        payload.collections[collection.slug]?.config?.admin?.useAsTitle ?? "id",
      );
      try {
        const drafted = hasDrafts(payload, collection.slug);
        const result = await payload.find({
          collection: collection.slug,
          depth: 0,
          draft: drafted,
          limit: RECENT_LIMIT,
          overrideAccess: false,
          pagination: false,
          req,
          sort: "-updatedAt",
        });
        const docs = result.docs as unknown as Array<Record<string, unknown>>;
        const changedIds = drafted
          ? await publishedParentIds({
              payload,
              req,
              slug: collection.slug,
              draftIds: docs
                .filter((doc) => doc._status === "draft")
                .map((doc) => doc.id as string | number),
            })
          : new Set<string>();
        return docs.flatMap((doc) => {
          if (typeof doc.updatedAt !== "string") return [];
          const id = String(doc.id);
          return [
            {
              id,
              title: documentTitle(doc, titleField),
              href: `${collection.listPath}/${encodeURIComponent(id)}`,
              collectionSlug: collection.slug,
              collectionLabel: collection.titlePlural,
              status: documentStatus(doc, changedIds),
              updatedAt: doc.updatedAt,
            } satisfies WebStudioDashboardRecent,
          ];
        });
      } catch {
        return null;
      }
    }),
  );

  return {
    items: perCollection
      .flatMap((items) => items ?? [])
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
      .slice(0, RECENT_LIMIT),
    failedCollections: perCollection.filter((items) => items === null).length,
  };
}

/**
 * Data for the Web Studio home. Every read goes through the Local API as the
 * signed-in user (`overrideAccess: false` with the request), so counts and
 * recent documents follow the same tenant and role rules as the lists.
 */
export async function loadWebStudioDashboardData({
  payload,
  req,
  permissions,
}: LoadArgs): Promise<WebStudioDashboardData> {
  const [groups, recent, admin] = await Promise.all([
    Promise.all(
      getGroupedWebStudioCollections().map(async (group) => ({
        id: group.id,
        label: group.label,
        collections: await Promise.all(
          group.collections.map(async (collection) => {
            const drafted = hasDrafts(payload, collection.slug);
            const [total, drafts] = await Promise.all([
              countOrNull(() =>
                payload.count({
                  collection: collection.slug,
                  overrideAccess: false,
                  req,
                }),
              ),
              drafted
                ? countOrNull(() =>
                    payload.count({
                      collection: collection.slug,
                      overrideAccess: false,
                      req,
                      where: { _status: { equals: "draft" } },
                    }),
                  )
                : Promise.resolve(null),
            ]);
            return {
              slug: collection.slug,
              title: collection.titlePlural,
              description: collection.description,
              href: collection.listPath,
              total,
              drafts: total === null ? null : drafts,
            } satisfies WebStudioDashboardCollection;
          }),
        ),
      })),
    ),
    loadRecent({ payload, req }),
    Promise.all(
      readableAdminCollections(permissions).map(
        async ({ slug, title, description, href }) => ({
          slug,
          title,
          description,
          href,
          total: await countOrNull(() =>
            payload.count({ collection: slug, overrideAccess: false, req }),
          ),
        }),
      ),
    ),
  ]);

  return {
    groups,
    recent: recent.items,
    recentFailedCollections: recent.failedCollections,
    admin,
  };
}
