"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { useDocumentInfo } from "@payloadcms/ui";
import { Undo2 } from "lucide-react";

export function NativeRevertToPublished() {
  const {
    id,
    collectionSlug,
    docPermissions,
    hasPublishedDoc,
    isTrashed,
    unpublishedVersionCount,
  } = useDocumentInfo();

  const changed =
    Boolean(hasPublishedDoc) && (unpublishedVersionCount ?? 0) > 0;
  if (
    !changed ||
    isTrashed ||
    !docPermissions?.update ||
    !collectionSlug ||
    id === undefined ||
    id === null
  ) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled
      title="Revert is unavailable until it can safely reject newer saves from another editing session."
    >
      <Undo2 aria-hidden="true" />
      Revert unavailable
    </Button>
  );
}
