// @vitest-environment jsdom

import { TooltipProvider } from "@asym/ui/components/shadcn/tooltip";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  StudioPreviewDeviceToggle,
  StudioSaveButton,
  StudioTemplateBreadcrumb,
} from "../../../../apps/admin/components/studio/studio-chrome";

afterEach(cleanup);

it("keeps preview and save actions explicitly named when visible labels collapse", () => {
  const onChange = vi.fn();
  const onSave = vi.fn();
  const view = render(
    <TooltipProvider>
      <StudioPreviewDeviceToggle value="desktop" onChange={onChange} />
      <StudioSaveButton onClick={onSave} disabled={false} isSaving={false} />
    </TooltipProvider>,
  );
  const desktop = screen.getByRole("button", { name: "Desktop preview" });
  const mobile = screen.getByRole("button", { name: "Mobile preview" });
  expect(desktop.getAttribute("aria-label")).toBe("Desktop preview");
  expect(mobile.getAttribute("aria-label")).toBe("Mobile preview");
  fireEvent.click(mobile);
  expect(onChange).toHaveBeenCalledExactlyOnceWith("mobile");
  const save = screen.getByRole("button", { name: "Save", exact: true });
  expect(save.getAttribute("aria-label")).toBe("Save");
  save.focus();
  view.rerender(
    <TooltipProvider>
      <StudioPreviewDeviceToggle value="mobile" onChange={onChange} />
      <StudioSaveButton onClick={onSave} disabled isSaving />
    </TooltipProvider>,
  );
  expect(screen.getByRole("button", { name: "Saving…" })).toBe(save);
  expect(save.getAttribute("aria-busy")).toBe("true");
  expect(document.activeElement).toBe(save);
  fireEvent.click(save);
  expect(onSave).not.toHaveBeenCalled();
});

it("announces unsaved document state without requiring hover", () => {
  render(
    <TooltipProvider>
      <StudioTemplateBreadcrumb name="Quarterly newsletter" hasUnsavedChanges />
    </TooltipProvider>,
  );
  expect(screen.getByRole("status").textContent).toContain("Unsaved changes");
  expect(screen.getByText("Quarterly newsletter")).toBeTruthy();
});
