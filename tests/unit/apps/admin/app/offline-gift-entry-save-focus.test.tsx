/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: App component regression test at its public UI boundary.
import { OfflineGiftEntryDialog } from "../../../../../apps/admin/app/(app)/contributions/offline-gift/offline-gift-entry-dialog";

/**
 * Record gift keeps keyboard focus through a save: a natively disabled submit
 * button drops focus to the page, so focus waits on the form and then moves
 * to the next sensible place.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function deferredFetch() {
  let settle: (response: Partial<Response>) => void = () => undefined;
  vi.spyOn(globalThis, "fetch").mockImplementation(
    () =>
      new Promise<Response>((resolve) => {
        settle = (response) => resolve(response as Response);
      }),
  );
  return {
    settle: async (response: Partial<Response>) => {
      await act(async () => {
        settle(response);
      });
    },
  };
}

function fillValidKnownGift() {
  fireEvent.change(screen.getByPlaceholderText("Ada"), {
    target: { value: "Ada" },
  });
  fireEvent.change(screen.getByPlaceholderText("Lovelace"), {
    target: { value: "Lovelace" },
  });
  fireEvent.change(screen.getByPlaceholderText("0.00"), {
    target: { value: "100" },
  });
  const receivedDate = document.querySelector('input[type="date"]');
  if (!(receivedDate instanceof HTMLInputElement)) {
    throw new Error("received date input not found");
  }
  fireEvent.change(receivedDate, { target: { value: "2026-07-01" } });
  fireEvent.change(screen.getByPlaceholderText("fund ID"), {
    target: { value: "fund-1" },
  });
}

function expectFocusKept() {
  const active = document.activeElement;
  expect(active).not.toBe(document.body);
  expect(active?.matches(":disabled")).toBe(false);
}

async function startSave() {
  render(<OfflineGiftEntryDialog open onOpenChange={() => undefined} />);
  const dialog = screen.getByRole("dialog", { name: "Enter offline gift" });
  // Let the dialog place its initial focus before the press.
  await waitFor(() =>
    expect(dialog.contains(document.activeElement)).toBe(true),
  );
  fillValidKnownGift();
  const save = screen.getByRole("button", { name: "Record gift" });
  const form = save.closest("form");
  if (!form) throw new Error("gift form not found");
  // A real press focuses the button before it submits.
  save.focus();
  fireEvent.click(save);
  await waitFor(() => expect(save.hasAttribute("disabled")).toBe(true));
  return { form, save };
}

describe("Record gift focus", () => {
  it("parks focus on the busy form while the gift records", async () => {
    deferredFetch();
    const { form } = await startSave();

    expect(document.activeElement).toBe(form);
    expect(form.getAttribute("aria-busy")).toBe("true");
    expectFocusKept();
  });

  it("returns focus to Record gift when recording fails", async () => {
    const request = deferredFetch();
    const { form, save } = await startSave();
    expect(document.activeElement).toBe(form);

    await request.settle({
      ok: false,
      json: async () => ({ error: "Persistence is not enabled." }),
    });

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Persistence is not enabled.",
    );
    await waitFor(() => expect(document.activeElement).toBe(save));
    expect(save.hasAttribute("disabled")).toBe(false);
    expect(form.getAttribute("aria-busy")).not.toBe("true");
  });

  it("moves focus to the confirmation's Close button when the gift is recorded", async () => {
    const request = deferredFetch();
    await startSave();

    await request.settle({
      ok: true,
      json: async () => ({
        result: {
          contributionId: "contrib-1",
          donorIdentityStatus: "known",
          receiptStatus: "pending",
        },
      }),
    });

    expect(
      await screen.findByRole("dialog", { name: "Gift recorded" }),
    ).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Close gift confirmation" }),
    );
  });

  it("moves focus to the new entry form after Enter another", async () => {
    const request = deferredFetch();
    await startSave();
    await request.settle({
      ok: true,
      json: async () => ({
        result: {
          contributionId: "contrib-1",
          donorIdentityStatus: "known",
          receiptStatus: "pending",
        },
      }),
    });

    const another = await screen.findByRole("button", {
      name: "Enter another",
    });
    another.focus();
    fireEvent.click(another);

    const form = (await screen.findByPlaceholderText("Ada")).closest("form");
    expect(document.activeElement).toBe(form);
  });

  it("moves focus to the first invalid field when Record gift fails validation", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    render(<OfflineGiftEntryDialog open onOpenChange={() => undefined} />);
    const dialog = screen.getByRole("dialog", { name: "Enter offline gift" });
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    const save = screen.getByRole("button", { name: "Record gift" });
    expect(save.hasAttribute("disabled")).toBe(false);
    save.focus();
    fireEvent.click(save);

    await waitFor(() =>
      expect(document.activeElement?.getAttribute("aria-invalid")).toBe("true"),
    );
    const firstInvalid = dialog.querySelector('[aria-invalid="true"]');
    expect(document.activeElement).toBe(firstInvalid);
    expect(fetch).not.toHaveBeenCalled();
    expectFocusKept();
  });
});
