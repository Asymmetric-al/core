"use client";

import { ownApiDownload } from "@asym/database/own-api";
import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Downloads a file an own-API route serves (a receipt PDF, a statement, a CSV
 * export) through `ownApiDownload`, which sends the document's tenant and
 * assignment (plan 5.2; WP2b, AL-2675). A link to the route would be a page
 * load, which carries no header, so a person in two organizations would be
 * refused. A failure is shown as a toast with the route's message.
 */
export function useOwnApiDownload() {
  const [pending, setPending] = useState(false);
  const download = useCallback(
    async (path: string, options: { fileName?: string } = {}) => {
      setPending(true);
      try {
        await ownApiDownload(path, options);
      } catch (error) {
        toast.error("The file didn't download.", {
          description:
            error instanceof Error && error.message
              ? error.message
              : "Try again.",
        });
      } finally {
        setPending(false);
      }
    },
    [],
  );
  return { download, pending };
}
