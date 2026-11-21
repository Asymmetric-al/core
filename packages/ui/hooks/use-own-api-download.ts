"use client";

import { OwnApiDownloadError, ownApiDownload } from "@asym/database/own-api";
import { useCallback, useState } from "react";
import { toast } from "sonner";

/** Plain words for a download that did not happen; never the route's text. */
function downloadFailureDescription(error: unknown): string {
  if (error instanceof OwnApiDownloadError) {
    if (error.status === 401) {
      return "Your session has ended. Sign in again, then try once more.";
    }
    if (error.status === 403) {
      return "This file isn't available to your account.";
    }
    if (error.status === 404) return "This file couldn't be found.";
    return "Something went wrong on our side. Try again in a moment.";
  }
  return "Check your connection and try again.";
}

/**
 * Downloads a file an own-API route serves (a receipt PDF, a statement, a CSV
 * export) through `ownApiDownload`, which sends the document's tenant and
 * assignment (plan 5.2; WP2b, AL-2675). A link to the route would be a page
 * load, which carries no header, so a person in two organizations would be
 * refused.
 *
 * Spread `buttonProps` on the button that starts the download: while the file
 * loads the button refuses a second press but keeps keyboard focus (Base UI's
 * `focusableWhenDisabled`; a native `disabled` would drop focus to the page)
 * and reports `aria-busy`. A failure is shown as a toast in plain words.
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
          description: downloadFailureDescription(error),
        });
      } finally {
        setPending(false);
      }
    },
    [],
  );
  const buttonProps = {
    disabled: pending,
    focusableWhenDisabled: true,
    "aria-busy": pending || undefined,
  } as const;
  return { download, pending, buttonProps };
}
