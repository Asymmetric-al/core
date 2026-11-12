import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

type PdfExportModule =
  typeof import("../../../../../../apps/admin/app/(app)/pdf/pdf-export");
let FREE_MODE_PDF_EXPORT_NOTE: PdfExportModule["FREE_MODE_PDF_EXPORT_NOTE"];
let isUnlayerPdfExportBlocked: PdfExportModule["isUnlayerPdfExportBlocked"];
let runUnlayerPdfExport: PdfExportModule["runUnlayerPdfExport"];

beforeAll(async () => {
  ({
    FREE_MODE_PDF_EXPORT_NOTE,
    isUnlayerPdfExportBlocked,
    runUnlayerPdfExport,
  } = await import("../../../../../../apps/admin/app/(app)/pdf/pdf-export"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("isUnlayerPdfExportBlocked", () => {
  it("blocks Unlayer PDF export in free mode, where Unlayer refuses it", () => {
    expect(
      isUnlayerPdfExportBlocked({
        engine: "unlayer",
        config: { account: { isConfigured: false } },
      }),
    ).toBe(true);
  });

  it("allows it once an Unlayer project is configured", () => {
    expect(
      isUnlayerPdfExportBlocked({
        engine: "unlayer",
        config: { account: { isConfigured: true } },
      }),
    ).toBe(false);
  });

  it("never blocks the native builder, which renders on Core's server", () => {
    expect(
      isUnlayerPdfExportBlocked({
        engine: "asym_pdf_document_builder",
        config: { account: { isConfigured: false } },
      }),
    ).toBe(false);
  });

  it("does not guess before the editor has reported its setup", () => {
    expect(isUnlayerPdfExportBlocked({ engine: "unlayer", config: null })).toBe(
      false,
    );
  });

  it("says plainly why and what still works", () => {
    expect(FREE_MODE_PDF_EXPORT_NOTE).toBe(
      "Free mode can't make PDFs: Unlayer only exports PDFs on a paid plan. Export as HTML still works.",
    );
  });
});

describe("runUnlayerPdfExport", () => {
  it("returns the file link when Unlayer makes the PDF", async () => {
    await expect(
      runUnlayerPdfExport(() =>
        Promise.resolve({ url: "https://files.example/doc.pdf" }),
      ),
    ).resolves.toEqual({
      status: "ready",
      url: "https://files.example/doc.pdf",
    });
  });

  it("reports no file, rather than a download in progress, when no link comes back", async () => {
    await expect(
      runUnlayerPdfExport(() => Promise.resolve({ url: null })),
    ).resolves.toEqual({ status: "no_file" });
  });

  it("stops waiting when Unlayer never answers, so the export button frees up", async () => {
    vi.useFakeTimers();
    const pending = runUnlayerPdfExport(() => new Promise(() => {}), 1000);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).resolves.toEqual({ status: "no_answer" });
  });

  it("passes an export error through", async () => {
    const error = new Error("Editor not ready");
    await expect(
      runUnlayerPdfExport(() => Promise.reject(error)),
    ).resolves.toEqual({ status: "failed", error });
  });
});
