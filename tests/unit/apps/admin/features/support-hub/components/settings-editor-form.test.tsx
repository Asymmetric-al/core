// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: the team editor is exercised at its public UI boundary.
import { TeamForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/collaborators/TeamForm";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: the shared settings editor body is exercised at its public UI boundary.
import { SettingsEditorForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/SettingsEditorSheet";

const hooks = vi.hoisted(() => ({ saveTeam: vi.fn() }));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportTeam: () => ({
      mutateAsync: hooks.saveTeam,
      isPending: false,
    }),
  }),
);
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

beforeEach(() => {
  hooks.saveTeam.mockReset().mockResolvedValue({});
});
afterEach(cleanup);

function Editor({
  canSave = true,
  isSaving = false,
  onSave,
}: {
  canSave?: boolean;
  isSaving?: boolean;
  onSave: () => void;
}) {
  return (
    <SettingsEditorForm
      draft={{}}
      canSave={canSave}
      isNew={false}
      isSaving={isSaving}
      noun="macro"
      onSave={onSave}
      onCancel={vi.fn()}
    >
      <label htmlFor="macro-name">Name</label>
      <input id="macro-name" />
    </SettingsEditorForm>
  );
}

describe("Settings editor form", () => {
  it("holds the fields and footer in one form, so Enter in a field saves once", () => {
    const onSave = vi.fn();
    render(<Editor onSave={onSave} />);
    const field = screen.getByLabelText<HTMLInputElement>("Name");
    const save = screen.getByRole("button", { name: "Save changes" });
    const cancel = screen.getByRole("button", { name: "Cancel" });

    expect(field.form).not.toBeNull();
    expect(save.closest("form")).toBe(field.form);
    expect(save.getAttribute("type")).toBe("submit");
    expect(cancel.getAttribute("type")).toBe("button");

    fireEvent.submit(field.form!);
    expect(onSave).toHaveBeenCalledOnce();

    fireEvent.click(save);
    expect(onSave).toHaveBeenCalledTimes(2);

    fireEvent.click(cancel);
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  it("does not save on Enter with nothing to save or while a save runs", () => {
    const onSave = vi.fn();
    const { rerender } = render(<Editor canSave={false} onSave={onSave} />);
    const form = screen.getByLabelText<HTMLInputElement>("Name").form!;
    fireEvent.submit(form);
    rerender(<Editor isSaving onSave={onSave} />);
    fireEvent.submit(form);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("keeps focus in the editor while Save is busy and gives it back to Save", () => {
    const onSave = vi.fn();
    const { rerender } = render(<Editor onSave={onSave} />);
    const save = screen.getByRole("button", { name: "Save changes" });
    save.focus();
    fireEvent.click(save);

    rerender(<Editor isSaving onSave={onSave} />);
    expect(save.hasAttribute("disabled")).toBe(true);
    expect(document.activeElement).toBe(save.closest("form"));

    rerender(<Editor onSave={onSave} />);
    expect(document.activeElement).toBe(save);
  });

  it("leaves focus on the form when an edit enables Save", () => {
    // Safari focuses the nearest focusable ancestor, the form, on a button click.
    const onSave = vi.fn();
    const { rerender } = render(<Editor canSave={false} onSave={onSave} />);
    const form = screen.getByLabelText<HTMLInputElement>("Name").form!;
    form.focus();

    rerender(<Editor onSave={onSave} />);
    expect(document.activeElement).toBe(form);
  });

  it("gives focus back to Save only if it stayed on the form during the save", () => {
    const onSave = vi.fn();
    const { rerender } = render(<Editor onSave={onSave} />);
    const save = screen.getByRole("button", { name: "Save changes" });
    const field = screen.getByLabelText<HTMLInputElement>("Name");
    save.focus();
    rerender(<Editor isSaving onSave={onSave} />);
    expect(document.activeElement).toBe(field.form);

    field.focus();
    field.form!.focus();
    rerender(<Editor onSave={onSave} />);
    expect(document.activeElement).toBe(field.form);
  });
});

describe("Team editor", () => {
  it("flags a missing name on Create instead of disabling Create", async () => {
    render(<TeamForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    const create = screen.getByRole("button", { name: "Create team" });
    expect(create.hasAttribute("disabled")).toBe(false);

    fireEvent.click(create);

    const name = screen.getByRole("textbox", { name: "Name" });
    expect(name.getAttribute("aria-invalid")).toBe("true");
    const describedBy = name.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe(
      "Enter a name.",
    );
    await waitFor(() => expect(document.activeElement).toBe(name));
    expect(hooks.saveTeam).not.toHaveBeenCalled();
  });

  it("creates the team when Enter is pressed in the name field", async () => {
    const onSaved = vi.fn();
    render(<TeamForm onSaved={onSaved} onCancel={vi.fn()} />);
    const name = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Name",
    });
    fireEvent.change(name, { target: { value: "Receipts" } });
    fireEvent.submit(name.form!);

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(hooks.saveTeam).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Receipts", slug: "receipts" }),
    );
    expect(name.getAttribute("aria-invalid")).not.toBe("true");
  });
});
