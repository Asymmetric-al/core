// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the actual application boundary from the central test tree.
import { SettingsToolbar } from "../../../../../../../apps/admin/features/support-hub/components/settings/SettingsToolbar";

afterEach(cleanup);

it("retains the initiating save action as focusable while blocking repeat activation", () => {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  const { rerender } = render(
    <SettingsToolbar
      isDirty
      isSaving={false}
      onSave={onSave}
      onCancel={onCancel}
    />,
  );
  const save = screen.getByRole("button", { name: "Save changes" });
  save.focus();
  fireEvent.click(save);
  expect(onSave).toHaveBeenCalledOnce();
  rerender(
    <SettingsToolbar isDirty isSaving onSave={onSave} onCancel={onCancel} />,
  );
  expect(save).toHaveProperty("disabled", false);
  expect(save.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(save);
  fireEvent.click(save);
  expect(onSave).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: "Discard" })).toHaveProperty(
    "disabled",
    true,
  );
});

it("announces the save status: saved, unsaved changes, then saving", () => {
  const props = { onSave: vi.fn(), onCancel: vi.fn() };
  const { rerender } = render(
    <SettingsToolbar isDirty={false} isSaving={false} {...props} />,
  );
  expect(screen.getByRole("status").textContent).toBe("Saved");
  rerender(<SettingsToolbar isDirty isSaving={false} {...props} />);
  expect(screen.getByRole("status").textContent).toBe(
    "You have unsaved changes.",
  );
  rerender(<SettingsToolbar isDirty isSaving {...props} />);
  // The spinner is hidden so the save bar announces one status, not two.
  expect(screen.getAllByRole("status")).toHaveLength(1);
  expect(screen.getByRole("status").textContent).toBe("Saving…");
  rerender(
    <SettingsToolbar
      isDirty={false}
      isSaving={false}
      savedLabel="Using default preferences"
      {...props}
    />,
  );
  expect(screen.getByRole("status").textContent).toBe(
    "Using default preferences",
  );
});
