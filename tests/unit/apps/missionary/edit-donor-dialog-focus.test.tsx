/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { EditDonorDialog } from "../../../../apps/missionary/app/donors/edit-donor-dialog";

const boundary = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock("../../../../apps/missionary/app/donors/donor-mutation-client", () => ({
  updateDonorDetails: boundary.update,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  boundary.update.mockReset();
});

const donor = {
  id: "donor-1",
  name: "Avery Stone",
  email: "avery@example.test",
};

/** Opens the dialog and waits for its first field to take focus. */
async function openDialog(source: typeof donor) {
  render(<EditDonorDialog donor={source} open onOpenChange={vi.fn()} />);
  const name = screen.getByLabelText("Full name");
  await waitFor(() => expect(document.activeElement).toBe(name));
}

function pressSave() {
  const save = screen.getByRole("button", { name: "Save Changes" });
  save.focus();
  fireEvent.click(save);
  return save;
}

it("parks focus on the form while saving, then returns it to Save on failure", async () => {
  let finish!: (value: { ok: false; error: string }) => void;
  boundary.update.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
  await openDialog(donor);
  pressSave();
  await screen.findByRole("button", { name: "Saving…" });
  const form = screen.getByRole("dialog").querySelector("form");
  expect(document.activeElement).toBe(form);
  expect(form?.tabIndex).toBe(-1);
  await act(async () => {
    finish({ ok: false, error: "Fixture rejected update" });
  });
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Save Changes" }),
    ),
  );
});

it("moves focus to the first invalid field when validation stops the save", async () => {
  await openDialog({ ...donor, email: "" });
  pressSave();
  const email = screen.getByLabelText("Email");
  await waitFor(() => expect(document.activeElement).toBe(email));
  expect(email.getAttribute("aria-invalid")).toBe("true");
  expect(boundary.update).not.toHaveBeenCalled();
});
