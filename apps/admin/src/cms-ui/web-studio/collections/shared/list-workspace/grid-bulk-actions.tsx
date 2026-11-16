"use client";

import { cn } from "@asym/ui/lib/utils";
import {
  DeleteMany,
  EditMany,
  PublishMany,
  UnpublishMany,
  useListQuery,
  useSelection,
} from "@payloadcms/ui";

import styles from "./grid-bulk-actions.module.css";

import type { ClientCollectionConfig, Where } from "payload";

/**
 * What Payload's list view allows for bulk work on this collection (from its
 * list view props): edit, publish and unpublish many unless bulk edit is off;
 * delete many with the viewer's delete or trash permission unless bulk delete
 * is off.
 */
export type GridBulkOptions = {
  collection: ClientCollectionConfig;
  disableBulkEdit?: boolean;
  disableBulkDelete?: boolean;
  hasDeletePermission?: boolean;
  hasTrashPermission?: boolean;
};

/**
 * Payload's own bulk actions for the selected documents, inside Core's
 * selection bar. Payload keeps each action's permission checks, confirmation
 * dialog and request; the selection is Payload's `SelectionProvider`, which
 * the grid's row checkboxes drive.
 */
export function GridBulkActions({
  bulk,
  onDeleted,
}: {
  bulk: GridBulkOptions;
  onDeleted: () => void;
}) {
  const { count, selectAll, selectedIDs, toggleAll } = useSelection();
  const { query } = useListQuery();
  const where = (query?.where ?? undefined) as Where | undefined;
  const search = typeof query?.search === "string" ? query.search : undefined;
  const allAvailable = selectAll === "allAvailable";
  const clearSelection = () => toggleAll();
  const canDelete = Boolean(
    bulk.hasDeletePermission || bulk.hasTrashPermission,
  );
  const shared = {
    collection: bulk.collection,
    count,
    ids: selectedIDs,
    onSuccess: clearSelection,
    selectAll: allAvailable,
    where,
  };

  return (
    // Phones: tighter gaps (and, in the stylesheet, tighter buttons) keep
    // the four actions and the bar's Clear on one row under the count.
    <div
      data-web-studio-bulk-actions=""
      className={cn(
        styles.actions,
        "flex flex-wrap items-center gap-0.5 sm:gap-2",
      )}
    >
      {bulk.disableBulkEdit ? null : (
        <>
          <EditMany {...shared} />
          <PublishMany {...shared} />
          <UnpublishMany {...shared} />
        </>
      )}
      {!bulk.disableBulkDelete && canDelete ? (
        // Delete reads as the shared Button's destructive variant (the
        // stylesheet restyles only Payload's toggle, not its dialog buttons).
        <span
          data-web-studio-bulk-delete=""
          className={cn(styles.delete, "contents")}
        >
          <DeleteMany
            afterDelete={() => {
              clearSelection();
              onDeleted();
            }}
            hasDeletePermission={bulk.hasDeletePermission}
            hasTrashPermission={bulk.hasTrashPermission}
            search={search}
            selections={{
              [bulk.collection.slug]: {
                all: allAvailable,
                ids: allAvailable ? [] : selectedIDs,
                totalCount: allAvailable ? count : selectedIDs.length,
              },
            }}
            trash={Boolean(bulk.collection.trash)}
            viewType="list"
            where={where}
          />
        </span>
      ) : null}
    </div>
  );
}
