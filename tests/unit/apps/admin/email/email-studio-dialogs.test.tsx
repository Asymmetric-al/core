/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EmailStudioTemplatePickerDialog } from "../../../../../apps/admin/app/(app)/email/email-studio-template-picker-dialog";
import { EmailStudioExportDialog } from "../../../../../apps/admin/app/(app)/email/email-studio-export-dialog";
import { EmailStudioSaveDialog } from "../../../../../apps/admin/app/(app)/email/email-studio-save-dialog";

afterEach(cleanup);

describe("Email Studio dialogs", () => {
  it("saves from the metadata form and never submits a blank or busy draft", () => {
    const onSave = vi.fn();
    const metadata = {
      id: null,
      name: "Newsletter",
      subject: "Field notes",
      preheader: "This month",
    };
    const view = render(
      <EmailStudioSaveDialog
        open
        isSaving={false}
        onOpenChange={vi.fn()}
        metadata={metadata}
        onConfirmSave={onSave}
      />,
    );
    const name = screen.getByRole("textbox", { name: /Template name/ });
    const form = name.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    expect(onSave).toHaveBeenCalledExactlyOnceWith(metadata);
    onSave.mockClear();
    fireEvent.change(name, { target: { value: "   " } });
    fireEvent.submit(form!);
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(name, { target: { value: "Newsletter" } });
    view.rerender(
      <EmailStudioSaveDialog
        open
        isSaving
        onOpenChange={vi.fn()}
        metadata={metadata}
        onConfirmSave={onSave}
      />,
    );
    fireEvent.submit(form!);
    expect(onSave).not.toHaveBeenCalled();
  });
  it("shows a retry instead of successful emptiness on a failed template read", () => {
    const retry = vi.fn();
    render(
      <EmailStudioTemplatePickerDialog
        open
        onOpenChange={vi.fn()}
        templates={[]}
        isLoading={false}
        isError
        onRetry={retry}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByText("No saved templates yet")).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain(
      "Templates couldn’t be loaded.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("labels and focuses the truncated HTML preview without changing the full export", () => {
    render(
      <EmailStudioExportDialog
        open
        onOpenChange={vi.fn()}
        studioConfig={null}
        exportedHtml={"x".repeat(3100)}
        copiedHtml={false}
        onCopyHtml={vi.fn()}
        onDownloadHtml={vi.fn()}
      />,
    );
    const preview = screen.getByRole("region", { name: "HTML preview" });
    expect(preview.tabIndex).toBe(0);
    expect(preview.textContent).toHaveLength(3000);
    expect(screen.getByText(/Copy or download for the full HTML/)).toBeTruthy();
  });
});
