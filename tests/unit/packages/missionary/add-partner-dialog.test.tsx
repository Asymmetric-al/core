/** @vitest-environment jsdom */

import { Button } from "@asym/ui/components/shadcn/button";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React, { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AddPartnerDialog } from "../../../../packages/missionary/components/add-partner-dialog";

const boundary = vi.hoisted(() => ({
  fetch: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@asym/database/own-api", () => ({
  ownApiFetch: boundary.fetch,
}));
vi.mock("sonner", () => ({
  toast: { success: boundary.success, error: boundary.error },
}));

const KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOT_ADDED = [
  "The partner wasn't added.",
  {
    description:
      "Something went wrong on our side, so nothing was saved. Your details are still in the form.",
  },
] as const;
const UNCONFIRMED = [
  "We couldn't confirm the partner was added.",
  {
    description:
      "Check your connection, then press Add Partner again with the same details. The partner won't be added twice.",
  },
] as const;

function answer(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const ADDED = { donorId: "d-1", partyId: "p-1", duplicate: false };

function sent(call: number) {
  const [path, init] = boundary.fetch.mock.calls[call] as [string, RequestInit];
  const headers = new Headers(init.headers);
  return {
    path,
    method: init.method,
    key: headers.get("Idempotency-Key"),
    body: JSON.parse(String(init.body)) as Record<string, unknown>,
  };
}

function ControlledDialog({ onChange }: { onChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <AddPartnerDialog
      open={open}
      onOpenChange={(next) => {
        onChange(next);
        setOpen(next);
      }}
      trigger={<Button>Open partner</Button>}
    />
  );
}

async function openDialog(trigger = "Open partner") {
  fireEvent.click(screen.getByRole("button", { name: trigger, exact: true }));
  return screen.findByRole("dialog", { name: "Add partner" });
}

function fillValidFields(name = "Fixture partner") {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Location"), {
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
    boundary.fetch.mockReset().mockResolvedValue(answer(201, ADDED));
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
      render(<AddPartnerDialog trigger={<Button>Open partner</Button>} />);
      const dialog = await openDialog();
      fireEvent.change(screen.getByLabelText("Name"), {
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
      expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
        "",
      );
      expect(boundary.fetch).not.toHaveBeenCalled();
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

  it("keeps invalid fields out of the command and exposes associated errors", async () => {
    render(<AddPartnerDialog trigger={<Button>Open partner</Button>} />);
    await openDialog();
    const name = screen.getByLabelText("Name");
    const location = screen.getByLabelText("Location");
    fireEvent.change(name, { target: { value: "X" } });
    fireEvent.blur(name);
    fireEvent.change(location, { target: { value: "L" } });
    fireEvent.blur(location);
    await screen.findByText("Name must be at least 2 characters");
    await screen.findByText("Location is required");
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(
      document.getElementById(name.getAttribute("aria-errormessage")!),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Add Partner", exact: true })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(boundary.fetch).not.toHaveBeenCalled();
  });

  it("asks for no e-mail and promises no staff action (fix round F1 rules 2 and 8; red: an Email field)", async () => {
    render(<AddPartnerDialog trigger={<Button>Open partner</Button>} />);
    const dialog = await openDialog();
    expect(within(dialog).queryByLabelText(/e-?mail/i)).toBeNull();
    expect(dialog.textContent ?? "").not.toMatch(/e-?mail|staff|admin/i);
  });

  it("sends the partner to the workspace's Add Partner command through the own-API wrapper, with a submission key and no e-mail, owner, tenant, status or score; never the browser's table client (AL-2678 WP5 rest; fix round F1)", async () => {
    render(<AddPartnerDialog trigger={<Button>Open partner</Button>} />);
    await openDialog();
    fillValidFields("Command partner");
    await submit();
    await waitFor(() => expect(boundary.fetch).toHaveBeenCalledTimes(1));
    const call = sent(0);
    expect(call.path).toBe("/api/missionary/donors");
    expect(call.method).toBe("POST");
    expect(call.key).toMatch(KEY);
    expect(call.body).toEqual({
      name: "Command partner",
      phone: null,
      type: "Individual",
      frequency: "Monthly",
      location: "Fixture location",
    });
    await waitFor(() =>
      expect(boundary.success).toHaveBeenCalledWith(
        "Partner added successfully",
      ),
    );
  });

  it("preserves entered values and reports a refused command without success, in plain words", async () => {
    boundary.fetch.mockResolvedValueOnce(
      answer(403, { error: "tenant_guard: only a missionary assignment" }),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onSuccess = vi.fn();
    render(
      <AddPartnerDialog
        onSuccess={onSuccess}
        trigger={<Button>Open partner</Button>}
      />,
    );
    await openDialog();
    fillValidFields("Refused partner");
    await submit();
    await waitFor(() =>
      expect(boundary.error).toHaveBeenCalledWith(...NOT_ADDED),
    );
    expect(JSON.stringify(boundary.error.mock.calls)).not.toMatch(
      /tenant_guard|missionary assignment/,
    );
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "Refused partner",
    );
    expect(onSuccess).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it("a true key conflict says the form was already used for a different partner and to press Add Partner again; the next press is a new submission (fix round F1 rules 5 and 6; red: the generic words, the same key)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    boundary.fetch
      .mockResolvedValueOnce(
        answer(409, {
          error:
            "This form was already used for a different partner. Press Add Partner again.",
        }),
      )
      .mockResolvedValueOnce(answer(201, ADDED));
    render(<AddPartnerDialog trigger={<Button>Open partner</Button>} />);
    await openDialog();
    fillValidFields("Conflict partner");
    await submit();
    await waitFor(() =>
      expect(boundary.error).toHaveBeenCalledWith(
        "This form was already used for a different partner.",
        { description: "Press Add Partner again." },
      ),
    );
    await submit();
    await waitFor(() => expect(boundary.fetch).toHaveBeenCalledTimes(2));
    expect(sent(1).key).not.toBe(sent(0).key);
  });

  it("after a lost answer the other button, given the same partner, sends the same submission key, so the server answers the partner it stored; a later new partner gets a new key (AL-2678 WP5 rest, brief section 4)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    boundary.fetch
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(answer(200, { ...ADDED, duplicate: true }))
      .mockResolvedValueOnce(answer(201, ADDED));
    const onSuccess = vi.fn();
    render(
      <>
        <AddPartnerDialog
          onSuccess={onSuccess}
          trigger={<Button>Header add</Button>}
        />
        <AddPartnerDialog
          onSuccess={onSuccess}
          trigger={<Button>Empty state add</Button>}
        />
      </>,
    );
    await openDialog("Header add");
    fillValidFields("Lost answer partner");
    await submit();
    await waitFor(() =>
      expect(boundary.error).toHaveBeenCalledWith(...UNCONFIRMED),
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    const dialog = await openDialog("Empty state add");
    fillValidFields("Lost answer  partner ");
    await submit();
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(sent(1).key).toBe(sent(0).key);
    expect(within(dialog).queryByRole("alert")).toBeNull();

    await openDialog("Header add");
    fillValidFields("Lost answer partner");
    await submit();
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(2));
    expect(sent(2).key).toMatch(KEY);
    expect(sent(2).key).not.toBe(sent(0).key);
  });

  it("exposes the pending action, prevents duplicate submission, and resets after one success", async () => {
    let resolveSend!: (value: Response) => void;
    boundary.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );
    const onSuccess = vi.fn();
    render(
      <AddPartnerDialog
        onSuccess={onSuccess}
        trigger={<Button>Open partner</Button>}
      />,
    );
    await openDialog();
    fillValidFields("Pending partner");
    await submit();
    const pending = await screen.findByRole("button", {
      name: "Adding partner",
      exact: true,
    });
    expect(pending.getAttribute("aria-busy")).toBe("true");
    expect(pending.hasAttribute("disabled")).toBe(true);
    fireEvent.click(pending);
    expect(boundary.fetch).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveSend(answer(201, ADDED));
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(boundary.success).toHaveBeenCalledWith("Partner added successfully");
    await openDialog();
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("");
  });

  it("parks focus on the form while adding, then returns it to Add Partner on failure", async () => {
    let resolveSend!: (value: Response) => void;
    boundary.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AddPartnerDialog trigger={<Button>Open partner</Button>} />);
    const dialog = await openDialog();
    fillValidFields("Focus partner");
    const save = screen.getByRole("button", {
      name: "Add Partner",
      exact: true,
    });
    await waitFor(() => expect(save.hasAttribute("disabled")).toBe(false));
    save.focus();
    fireEvent.click(save);
    await screen.findByRole("button", { name: "Adding partner" });
    const form = dialog.querySelector("form");
    expect(document.activeElement).toBe(form);
    expect(form?.tabIndex).toBe(-1);
    await act(async () => {
      resolveSend(answer(500, { error: "Failed to add partner" }));
    });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Add Partner", exact: true }),
      ),
    );
  });

  it("moves focus to the first invalid field when validation stops the save", async () => {
    render(<AddPartnerDialog trigger={<Button>Open partner</Button>} />);
    await openDialog();
    const save = screen.getByRole("button", {
      name: "Add Partner",
      exact: true,
    });
    save.focus();
    fireEvent.click(save);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("Name")),
    );
    expect(boundary.fetch).not.toHaveBeenCalled();
  });
});
