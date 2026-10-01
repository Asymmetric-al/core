/** @vitest-environment jsdom */

import { Button } from "@asym/ui/components/shadcn/button";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React, { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AddPartnerDialog } from "../../../../packages/missionary/components/add-partner-dialog";

const boundary = vi.hoisted(() => ({
  insert: vi.fn(),
  from: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ from: boundary.from }),
}));
vi.mock("sonner", () => ({
  toast: { success: boundary.success, error: boundary.error },
}));

function ControlledDialog({ onChange }: { onChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <AddPartnerDialog
      missionaryId="missionary-fixture"
      open={open}
      onOpenChange={(next) => {
        onChange(next);
        setOpen(next);
      }}
      trigger={<Button>Open partner</Button>}
    />
  );
}

async function openDialog() {
  fireEvent.click(
    screen.getByRole("button", { name: "Open partner", exact: true }),
  );
  return screen.findByRole("dialog", { name: "Add New Partner" });
}

function fillValidFields() {
  fireEvent.change(screen.getByLabelText("Full Name / Org Name"), {
    target: { value: "Fixture partner" },
  });
  fireEvent.change(screen.getByLabelText("Email Address"), {
    target: { value: "fixture@example.invalid" },
  });
  fireEvent.change(screen.getByLabelText("Location (City, State)"), {
    target: { value: "Fixture location" },
  });
}

async function submit() {
  const button = screen.getByRole("button", {
    name: "Add Partner",
    exact: true,
  });
  await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
  fireEvent.click(button);
}

describe("AddPartnerDialog public form behavior", () => {
  beforeEach(() => {
    boundary.insert.mockReset().mockResolvedValue({ error: null });
    boundary.from.mockReset().mockReturnValue({ insert: boundary.insert });
    boundary.success.mockReset();
    boundary.error.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each(["cancel", "escape", "close"] as const)(
    "resets the uncontrolled form after %s and allows reopening",
    async (action) => {
      render(
        <AddPartnerDialog
          missionaryId="missionary-fixture"
          trigger={<Button>Open partner</Button>}
        />,
      );
      const dialog = await openDialog();
      fireEvent.change(screen.getByLabelText("Full Name / Org Name"), {
        target: { value: "Unsaved partner" },
      });
      if (action === "escape") fireEvent.keyDown(dialog, { key: "Escape" });
      else
        fireEvent.click(
          screen.getByRole("button", {
            name: action === "close" ? "Close" : "Cancel",
            exact: true,
          }),
        );
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      await openDialog();
      expect(
        (screen.getByLabelText("Full Name / Org Name") as HTMLInputElement)
          .value,
      ).toBe("");
      expect(boundary.insert).not.toHaveBeenCalled();
    },
  );

  it("honors controlled open changes through the existing trigger and cancel action", async () => {
    const changes = vi.fn();
    render(<ControlledDialog onChange={changes} />);
    await openDialog();
    expect(changes).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(changes).toHaveBeenLastCalledWith(false);
  });

  it("keeps invalid fields out of the insert boundary and exposes associated errors", async () => {
    render(
      <AddPartnerDialog
        missionaryId="missionary-fixture"
        trigger={<Button>Open partner</Button>}
      />,
    );
    await openDialog();
    const name = screen.getByLabelText("Full Name / Org Name");
    const email = screen.getByLabelText("Email Address");
    fireEvent.change(name, { target: { value: "X" } });
    fireEvent.blur(name);
    fireEvent.change(email, { target: { value: "invalid" } });
    fireEvent.blur(email);
    await screen.findByText("Name must be at least 2 characters");
    await screen.findByText("Invalid email address");
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(
      document.getElementById(name.getAttribute("aria-errormessage")!),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Add Partner", exact: true })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(boundary.insert).not.toHaveBeenCalled();
  });

  it("does not insert when missionary identity is missing", async () => {
    render(
      <AddPartnerDialog
        missionaryId=""
        trigger={<Button>Open partner</Button>}
      />,
    );
    await openDialog();
    fillValidFields();
    await submit();
    await waitFor(() =>
      expect(boundary.error).toHaveBeenCalledWith("Missionary ID is missing"),
    );
    expect(boundary.insert).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("preserves entered values and reports a rejected insert without success", async () => {
    boundary.insert.mockResolvedValueOnce({
      error: new Error("Fixture rejected insert"),
    });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onSuccess = vi.fn();
    render(
      <AddPartnerDialog
        missionaryId="missionary-fixture"
        onSuccess={onSuccess}
        trigger={<Button>Open partner</Button>}
      />,
    );
    await openDialog();
    fillValidFields();
    await submit();
    await waitFor(() =>
      expect(boundary.error).toHaveBeenCalledWith("Fixture rejected insert"),
    );
    expect(
      (screen.getByLabelText("Full Name / Org Name") as HTMLInputElement).value,
    ).toBe("Fixture partner");
    expect(onSuccess).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it("exposes the pending action, prevents duplicate submission, and resets after one success", async () => {
    let resolveInsert!: (value: { error: null }) => void;
    boundary.insert.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveInsert = resolve;
        }),
    );
    const onSuccess = vi.fn();
    render(
      <AddPartnerDialog
        missionaryId="missionary-fixture"
        onSuccess={onSuccess}
        trigger={<Button>Open partner</Button>}
      />,
    );
    await openDialog();
    fillValidFields();
    await submit();
    const pending = await screen.findByRole("button", {
      name: "Adding partner",
      exact: true,
    });
    expect(pending.getAttribute("aria-busy")).toBe("true");
    expect(pending.hasAttribute("disabled")).toBe(true);
    fireEvent.click(pending);
    expect(boundary.insert).toHaveBeenCalledTimes(1);
    expect(boundary.from).toHaveBeenCalledWith("donors");
    expect(boundary.insert).toHaveBeenCalledWith({
      missionary_id: "missionary-fixture",
      name: "Fixture partner",
      email: "fixture@example.invalid",
      phone: null,
      type: "Individual",
      frequency: "Monthly",
      location: "Fixture location",
      status: "Active",
      total_given: 0,
      last_gift_amount: 0,
      score: 70,
    });
    await act(async () => {
      resolveInsert({ error: null });
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(boundary.success).toHaveBeenCalledWith("Partner added successfully");
    await openDialog();
    expect(
      (screen.getByLabelText("Full Name / Org Name") as HTMLInputElement).value,
    ).toBe("");
  });
});
