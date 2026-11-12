/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  NativePdfDocumentBuilderSection,
  type NativePreviewState,
} from "../../../../../../apps/admin/app/(app)/pdf/native-pdf-document-builder-section";

afterEach(cleanup);
describe("native authoring preview", () => {
  it.each([
    ["idle", "Not previewed yet"],
    ["loading", "Previewing…"],
    ["success", "Previewed with sample data"],
    ["error", "Preview failed"],
  ] as const)("announces the %s state honestly", (status, label) => {
    const onPreview = vi.fn();
    const preview: NativePreviewState = {
      status,
      html: "",
      diagnostics: [],
      error: status === "error" ? "Invalid document" : null,
    };
    render(
      <NativePdfDocumentBuilderSection
        templateText="{}"
        preview={preview}
        onTemplateTextChange={vi.fn()}
        onPreview={onPreview}
      />,
    );
    expect(screen.getByRole("status").textContent).toContain(label);
    expect(screen.queryByText("Preview ready")).toBeNull();
    if (status === "loading") {
      fireEvent.click(screen.getByRole("button", { name: /Preview/ }));
      expect(onPreview).not.toHaveBeenCalled();
    }
    if (status === "error")
      expect(screen.getByRole("alert").textContent).toContain(
        "Invalid document",
      );
  });
});
