import type { Payload } from "payload";

/**
 * Document locks stay out of Web Studio (AL-2675, WP2b slice C, council C3).
 *
 * In Payload 4.0.0-beta.9 two paths let a staff member of one organization
 * lock another organization's document, which then refuses that
 * organization's saves for the lock's five minutes:
 *
 * - the `form-state` server function checks only admin access, then, asked
 *   for a document's lock status, writes a lock row with `db.create` for any
 *   document id (`@payloadcms/ui/dist/utilities/handleFormStateLocking.js`);
 * - the lock collection grants create, read, update and delete to every
 *   signed-in user (`payload/dist/locked-documents/config.js`), over REST and
 *   GraphQL alike.
 *
 * Turning `lockDocuments` off would drop the lock collection from Payload's
 * schema, which needs a Payload migration (and a development server's push
 * would stop at a data-loss prompt). So the schema stays, and both paths
 * close: Web Studio's `form-state` never asks for lock status
 * (`withoutLockStatus`), and the lock collection admits no write and shows no
 * row through the API (`closeLockedDocumentsApi`). Payload's own lock checks
 * read the table directly and still honour a lock written before this. An
 * editor loses the "being edited by" notice and its take-over; every save
 * still passes the document's access rules.
 */
export const LOCKED_DOCUMENTS_SLUG = "payload-locked-documents";

const nobody = () => false;
/** Matches no row, so a read returns nothing instead of failing. */
const noRow = () => ({ id: { exists: false } });

/** Payload `onInit`: the lock collection admits no write and shows no row through the API. */
export function closeLockedDocumentsApi(payload: Pick<Payload, "collections">) {
  const collection = payload.collections[LOCKED_DOCUMENTS_SLUG];
  if (!collection) return;
  collection.config.access = {
    ...collection.config.access,
    create: nobody,
    read: noRow,
    update: nobody,
    delete: nobody,
  };
}

/** Wraps Payload's `form-state` server function so that it never reads or writes a lock. */
export function withoutLockStatus<Args extends object, Result>(
  handler: (args: Args) => Result,
): (args: Args) => Result {
  return (args) =>
    handler({ ...args, returnLockStatus: false, updateLastEdited: false });
}
