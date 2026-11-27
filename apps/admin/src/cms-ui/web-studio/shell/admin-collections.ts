import type { SanitizedPermissions } from "payload";

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

export function canUpdateCollection(
  permissions: Pick<SanitizedPermissions, "collections"> | null | undefined,
  slug: string,
): boolean {
  const update: unknown = permissions?.collections?.[slug]?.update;
  if (update === true) return true;
  return Boolean(
    update &&
    typeof update === "object" &&
    (update as { permission?: unknown }).permission === true,
  );
}
