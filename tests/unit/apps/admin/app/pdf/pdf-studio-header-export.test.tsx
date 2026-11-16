/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
  process.env.SKIP_ENV_VALIDATION ??= "1";
});

// The legacy Unlayer editor loads a remote script; the header never needs it.
vi.mock("@asym/ui/components/studio/legacy/UnlayerDocumentEditor", () => ({
  LegacyUnlayerDocumentEditor: () => null,
}));

type HeaderModule =
  typeof import("../../../../../../apps/admin/app/(app)/pdf/page-client");
let PDFStudioHeaderSection: HeaderModule["PDFStudioHeaderSection"];

beforeAll(async () => {
  ({ PDFStudioHeaderSection } =
    await import("../../../../../../apps/admin/app/(app)/pdf/page-client"));
}, 60_000);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const noop = () => {};
const actions = {
  onUndo: noop,
  onRedo: noop,
  onPreview: noop,
  onExportPDF: vi.fn(),
  onExportHtml: vi.fn(),
  onSaveClick: noop,
  onNewTemplate: noop,
  onNewNativeTemplate: noop,
  onLoadTemplate: vi.fn(),
  onToggleFullscreen: noop,
  onOpenDeleteDialog: noop,
};

function renderHeader(
  pdfExportBlocked: boolean,
  engine: "unlayer" | "asym_pdf_document_builder" = "unlayer",
  openMenu = true,
) {
  render(
    <PDFStudioHeaderSection
      metadata={{
        id: null,
        name: "Untitled document",
        description: "",
        category: "custom",
        pageSize: "Letter",
        orientation: "portrait",
        engine,
      }}
      status={{
        hasUnsavedChanges: false,
        isEditorReady: true,
        isSaving: false,
        isExporting: false,
        previewDevice: "desktop",
        isFullscreen: false,
        engine,
        nativeBuilderEnabled: false,
        pdfExportBlocked,
      }}
      actions={actions}
    />,
  );
  if (pdfExportBlocked) {
    expect(
      screen
        .getByText(/Free mode can't make PDFs/)
        .closest('[data-slot="alert"]'),
    ).toBeTruthy();
  }
  if (openMenu) fireEvent.click(screen.getByRole("button", { name: "Export" }));
}

describe("PDF Studio export menu", () => {
  it("forwards history action names through the tooltip triggers", () => {
    renderHeader(false, "unlayer", false);
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Redo" })).toBeTruthy();
  });

  it("names native actions as a sample test render and JSON export, not a download", async () => {
    renderHeader(false, "asym_pdf_document_builder");
    expect(
      await screen.findByRole("menuitem", {
        name: /Test render with sample data/,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("menuitem", { name: /Export as JSON/ }),
    ).toBeTruthy();
    expect(screen.queryByText("⌘P")).toBeNull();
    expect(
      screen.queryByText(/Scroll left or right within the editor below/),
    ).toBeNull();
  });
  it("warns before export in free mode that no PDF can be made", async () => {
    renderHeader(true);
    const pdfItem = await screen.findByRole("menuitem", {
      name: /Export as PDF/,
    });
    expect(pdfItem.getAttribute("aria-disabled")).toBe("true");
    const note = screen.getByText(
      "Free mode can't make PDFs: Unlayer only exports PDFs on a paid plan. Export as HTML still works.",
    );
    // The reason is tied to the dimmed item, so a screen reader hears it
    // when arrow keys land on "Export as PDF".
    const describedBy = pdfItem.getAttribute("aria-describedby") ?? "";
    expect(describedBy.split(/\s+/)).toContain(note.id);
    expect(note.id).not.toBe("");
    // The persistent banner is also the disabled item's explanation.
    const menu = screen.getByRole("menu");
    expect(menu.contains(note)).toBe(false);
    expect(screen.getAllByText(/Free mode can't make PDFs/)).toHaveLength(1);
    const htmlItem = screen.getByRole("menuitem", { name: /Export as HTML/ });
    expect(htmlItem.getAttribute("aria-disabled")).not.toBe("true");
    fireEvent.click(pdfItem);
    expect(actions.onExportPDF).not.toHaveBeenCalled();
    fireEvent.click(htmlItem);
    expect(actions.onExportHtml).toHaveBeenCalledOnce();
  });

  it("opens saved templates directly from the toolbar", () => {
    renderHeader(false, "unlayer", false);
    const open = screen.getByRole("button", { name: "Open template" });
    fireEvent.click(open);
    expect(actions.onLoadTemplate).toHaveBeenCalledOnce();
  });

  it("offers PDF export with no warning once Unlayer is set up", async () => {
    renderHeader(false);
    const pdfItem = await screen.findByRole("menuitem", {
      name: /Export as PDF/,
    });
    expect(pdfItem.getAttribute("aria-disabled")).not.toBe("true");
    expect(pdfItem.hasAttribute("aria-describedby")).toBe(false);
    expect(screen.queryByText(/Free mode can't make PDFs/)).toBeNull();
  });
});
