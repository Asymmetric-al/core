"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { useOwnApiDownload } from "@asym/ui/hooks";

import { receiptSnapshotPdfUrl } from "./receipt-delivery-model";

/**
 * Downloads a generated updated-receipt PDF. It was a link that opened the
 * route in a new tab; a page load carries no tenant header, so a person in
 * two organizations was refused. It is now an own-API download with the
 * document's tenant and assignment (plan 5.2; WP2b, AL-2675).
 */
export function ReceiptSnapshotDownload({
  snapshotId,
}: {
  snapshotId: string;
}) {
  const { download, buttonProps } = useOwnApiDownload();
  return (
    <Button
      variant="link"
      size="xs"
      {...buttonProps}
      onClick={() => void download(receiptSnapshotPdfUrl(snapshotId))}
    >
      Download updated receipt PDF
    </Button>
  );
}
