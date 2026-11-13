// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the actual header with the real shared Button behavior.
import { EmailStudioHeader } from "../../../../../apps/admin/app/(app)/email/email-studio-header";
import { TooltipProvider } from "../../../../../packages/ui/components/shadcn/tooltip";

import type { ComponentProps } from "react";

afterEach(cleanup);

function headerProps(): ComponentProps<typeof EmailStudioHeader> {
  return {
    metadata: { id: null, name: "Newsletter", subject: "News", preheader: "" },
    onMetadataChange: vi.fn(),
    isEditorReady: true,
    canUndo: true,
    canRedo: true,
    canPreview: true,
    isSaving: false,
    isSendingTest: false,
    hasUnsavedChanges: true,
    isFullscreen: false,
    previewDevice: "desktop",
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onPreview: vi.fn(),
    onExportHtml: vi.fn(),
    onTestSend: vi.fn(),
    onInsertMergeTag: vi.fn(),
    onSaveClick: vi.fn(),
    onNewTemplate: vi.fn(),
    onLoadTemplate: vi.fn(),
    onToggleFullscreen: vi.fn(),
  };
}

function Header(props: ComponentProps<typeof EmailStudioHeader>) {
  return (
    <TooltipProvider>
      <EmailStudioHeader {...props} />
    </TooltipProvider>
  );
}

describe("Email Studio header pending focus", () => {
  it("offers open, preview and test send without opening a menu", () => {
    const props = headerProps();
    render(<Header {...props} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Open template", exact: true }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Preview", exact: true }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Send test email", exact: true }),
    );
    expect(props.onLoadTemplate).toHaveBeenCalledOnce();
    expect(props.onPreview).toHaveBeenCalledWith("desktop");
    expect(props.onTestSend).toHaveBeenCalledOnce();
  });

  it("does not change template metadata in read-only mode", () => {
    const props = headerProps();
    render(<Header {...props} isEditorReady={false} />);
    expect(
      screen
        .getByRole("textbox", { name: "Template name" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Preview", exact: true })
        .hasAttribute("disabled"),
    ).toBe(false);
    expect(
      screen
        .getByRole("button", { name: "Send test email", exact: true })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("disables unavailable history independently of editor readiness", () => {
    const props = headerProps();
    render(<Header {...props} canUndo={false} canRedo={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Undo", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Redo", exact: true }));
    expect(props.onUndo).not.toHaveBeenCalled();
    expect(props.onRedo).not.toHaveBeenCalled();
  });
  it("names the document template metadata without treating it as personal email", () => {
    render(<Header {...headerProps()} />);
    const title = screen.getByRole("textbox", { name: "Template name" });
    expect(title).toHaveProperty("value", "Newsletter");
    expect(title.getAttribute("type")).not.toBe("email");
    expect(title.getAttribute("autocomplete")).not.toBe("email");
  });

  it("enables Save when the editor is ready and idle", () => {
    const props = headerProps();
    render(<Header {...props} />);
    const save = screen.getByRole("button", { name: "Save", exact: true });
    expect(save.hasAttribute("disabled")).toBe(false);
    expect(save.getAttribute("aria-disabled")).not.toBe("true");
    fireEvent.click(save);
    expect(props.onSaveClick).toHaveBeenCalledOnce();
  });

  it("preserves Save focus during its own pending operation and restores activation afterward", () => {
    const props = headerProps();
    const view = render(<Header {...props} />);
    const save = screen.getByRole("button", { name: "Save", exact: true });
    save.focus();
    view.rerender(<Header {...props} isSaving />);
    expect(document.activeElement).toBe(save);
    expect(save.hasAttribute("disabled")).toBe(false);
    expect(save.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(save);
    expect(props.onSaveClick).not.toHaveBeenCalled();
    view.rerender(<Header {...props} />);
    expect(save.getAttribute("aria-disabled")).not.toBe("true");
    fireEvent.click(save);
    expect(props.onSaveClick).toHaveBeenCalledOnce();
  });

  it("keeps Save natively disabled while a separate test send is pending", () => {
    const props = headerProps();
    render(<Header {...props} isSendingTest />);
    const save = screen.getByRole("button", { name: "Save", exact: true });
    expect(save.hasAttribute("disabled")).toBe(true);
    fireEvent.click(save);
    expect(props.onSaveClick).not.toHaveBeenCalled();
  });
});
