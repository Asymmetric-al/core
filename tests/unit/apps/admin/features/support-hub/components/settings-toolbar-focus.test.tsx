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
