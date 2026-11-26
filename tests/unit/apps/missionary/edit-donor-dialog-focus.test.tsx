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

it("moves focus to the first invalid field when validation stops the save (fix round F17: the e-mail is no longer a field, so an empty name is the invalid one)", async () => {
  await openDialog(donor);
  const name = screen.getByLabelText("Full name");
  fireEvent.change(name, { target: { value: "" } });
  pressSave();
  await waitFor(() => expect(document.activeElement).toBe(name));
  expect(name.getAttribute("aria-invalid")).toBe("true");
  expect(boundary.update).not.toHaveBeenCalled();
});

it("saves a change of name alone for a partner with no e-mail, with no e-mail field and no e-mail in what it sends (fix round F17 case 4; red: the required e-mail stops the save)", async () => {
  boundary.update.mockResolvedValueOnce({ ok: true });
  await openDialog({ ...donor, email: "" });
  expect(screen.queryByLabelText("Email")).toBeNull();
  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "Avery Stone Jr" },
  });
  pressSave();
  await waitFor(() => expect(boundary.update).toHaveBeenCalledTimes(1));
  const [{ value }] = boundary.update.mock.calls[0] as [
    { value: Record<string, unknown> },
  ];
  expect(value.name).toBe("Avery Stone Jr");
  expect(value).not.toHaveProperty("email");
});
