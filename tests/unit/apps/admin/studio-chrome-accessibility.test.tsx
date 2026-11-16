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

it("keeps the document name visible at every width without an inert Templates crumb", () => {
  render(
    <StudioTemplateBreadcrumb
      name="Quarterly newsletter"
      hasUnsavedChanges={false}
    />,
  );
  expect(screen.queryByText("Templates")).toBeNull();
  expect(screen.getByText("Quarterly newsletter").className).not.toMatch(
    /sr-only|hidden/,
  );
});

it("opens the template picker only when a working callback is supplied", () => {
  const onOpenTemplates = vi.fn();
  render(
    <StudioTemplateBreadcrumb
      name="Quarterly newsletter"
      hasUnsavedChanges={false}
      onOpenTemplates={onOpenTemplates}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Templates" }));
  expect(onOpenTemplates).toHaveBeenCalledOnce();
});

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
