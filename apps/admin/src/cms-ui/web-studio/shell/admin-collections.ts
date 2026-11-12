import type { SanitizedPermissions } from "payload";

export const WEB_STUDIO_ADMIN_COLLECTIONS = [
  {
    slug: "cms-users",
    title: "Users",
    description: "Web Studio sign-ins and roles.",
  },
  {
    slug: "tenants",
    title: "Organizations",
    description: "Organizations that publish with Web Studio.",
  },
] as const;

export type WebStudioAdminCollectionSlug =
  (typeof WEB_STUDIO_ADMIN_COLLECTIONS)[number]["slug"];

export const WEB_STUDIO_ADMIN_ROUTE = "/web-studio/collections";

/**
 * Payload's own nav rule: a collection is listed when the user may read any
 * of it. Payload keeps a tenant-scoped read as `{ permission: true, where }`
 * (only an unrestricted read collapses to `true`), so a strict `=== true`
 * would hide these lists from every tenant admin.
 */
export function canReadCollection(
  permissions: Pick<SanitizedPermissions, "collections"> | null | undefined,
  slug: string,
): boolean {
  const read: unknown = permissions?.collections?.[slug]?.read;
  if (read === true) return true;
  return Boolean(
    read &&
    typeof read === "object" &&
    (read as { permission?: unknown }).permission === true,
  );
}

/**
 * Whether the user may create documents in a collection: Payload's sanitized
 * `create` permission, `true` or `{ permission: true }`.
 */
export function canCreateCollection(
  permissions: Pick<SanitizedPermissions, "collections"> | null | undefined,
  slug: string,
): boolean {
  const create: unknown = permissions?.collections?.[slug]?.create;
  if (create === true) return true;
  return Boolean(
    create &&
    typeof create === "object" &&
    (create as { permission?: unknown }).permission === true,
  );
}

/** The administration lists this user may open, in rail order. */
export function readableAdminCollections(
  permissions: Pick<SanitizedPermissions, "collections"> | null | undefined,
) {
  return WEB_STUDIO_ADMIN_COLLECTIONS.filter((collection) =>
    canReadCollection(permissions, collection.slug),
  ).map((collection) => ({
    ...collection,
    href: `${WEB_STUDIO_ADMIN_ROUTE}/${collection.slug}`,
  }));
}
