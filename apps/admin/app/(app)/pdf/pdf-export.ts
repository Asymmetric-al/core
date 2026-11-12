/**
 * Unlayer PDF export, as it really behaves. Unlayer makes PDFs on its own
 * servers and only on a paid plan: in free mode (no project ID) its export
 * call is refused ("Your plan does not include export") and the editor never
 * calls back, so no PDF, watermarked or not, is produced. HTML export runs
 * in the browser and works in free mode, without the canvas watermark.
 */

/** Shown before export in free mode, on the menu item and if it is tried. */
export const FREE_MODE_PDF_EXPORT_NOTE =
  "Free mode can't make PDFs: Unlayer only exports PDFs on a paid plan. Export as HTML still works.";

/** How long to wait for Unlayer before freeing the export button. */
export const UNLAYER_PDF_EXPORT_TIMEOUT_MS = 60_000;

export function isUnlayerPdfExportBlocked(input: {
  engine: string;
  config: { account: { isConfigured: boolean } } | null;
}): boolean {
  if (input.engine !== "unlayer" || !input.config) return false;
  return !input.config.account.isConfigured;
}

export type UnlayerPdfExportOutcome =
  | { status: "ready"; url: string }
  | { status: "no_file" }
  | { status: "no_answer" }
  | { status: "failed"; error: unknown };

export async function runUnlayerPdfExport(
  exportPdf: () => Promise<{ url?: string | null } | null | undefined>,
  timeoutMs: number = UNLAYER_PDF_EXPORT_TIMEOUT_MS,
): Promise<UnlayerPdfExportOutcome> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const noAnswer = new Promise<UnlayerPdfExportOutcome>((resolve) => {
    timer = setTimeout(() => resolve({ status: "no_answer" }), timeoutMs);
  });
  const attempt = exportPdf().then(
    (result): UnlayerPdfExportOutcome =>
      result?.url
        ? { status: "ready", url: result.url }
        : { status: "no_file" },
    (error: unknown): UnlayerPdfExportOutcome => ({ status: "failed", error }),
  );
  try {
    return await Promise.race([attempt, noAnswer]);
  } finally {
    clearTimeout(timer);
  }
}
