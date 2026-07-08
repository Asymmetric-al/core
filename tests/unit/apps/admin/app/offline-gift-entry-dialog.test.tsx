/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OfflineGiftEntryDialog } from "../../../../../apps/admin/app/contributions/offline-gift/offline-gift-entry-dialog";

/**
 * TDD — offline gift entry dialog (Contributions Hub UI). Verifies the form
 * shell wires the pure model: the live receipt-status tile reacts to the donor
 * mode, and the anonymous-gift guidance appears in unknown mode. No network.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderDialog(
  props: Partial<Parameters<typeof OfflineGiftEntryDialog>[0]> = {},
) {
  return render(
    <OfflineGiftEntryDialog open onOpenChange={() => undefined} {...props} />,
  );
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
  fireEvent.change(receivedDate, {
    target: { value: "2026-07-01" },
  });
  fireEvent.change(screen.getByPlaceholderText("fund ID"), {
    target: { value: "fund-1" },
  });
}

describe("OfflineGiftEntryDialog", () => {
  it("renders the offline entry form with a live receipt-status preview", () => {
    renderDialog();
    expect(screen.getByText("Enter offline gift")).toBeTruthy();
    // Known donor + receipt requested (defaults) → pending.
    expect(screen.getByText("Receipt pending")).toBeTruthy();
  });

  it("switches to an anonymous gift: shows guidance and a not-receiptable tile", () => {
    renderDialog();
    fireEvent.click(
      screen.getByRole("button", { name: /Unknown \/ anonymous/i }),
    );
    expect(screen.getByText(/no donor identity is stored/i)).toBeTruthy();
    expect(screen.getByText("Not receiptable")).toBeTruthy();
  });

  it("uses toggle-button semantics for donor mode instead of incomplete radio semantics", () => {
    renderDialog();
    const knownButton = screen.getByRole("button", { name: /Known donor/i });
    const unknownButton = screen.getByRole("button", {
      name: /Unknown \/ anonymous/i,
    });

    expect(knownButton.getAttribute("aria-pressed")).toBe("true");
    expect(unknownButton.getAttribute("aria-pressed")).toBe("false");
  });

  it("submits a valid known gift and renders the success state", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: {
          contributionId: "contrib-1",
          donorIdentityStatus: "known",
          receiptStatus: "pending",
        },
      }),
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    renderDialog();
    fillValidKnownGift();
    fireEvent.click(screen.getByRole("button", { name: "Record gift" }));

    expect(await screen.findByText("Gift recorded")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/contributions/offline",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("shows an error banner when the route rejects the request", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Persistence is not enabled." }),
    } as Response);

    renderDialog();
    fillValidKnownGift();
    fireEvent.click(screen.getByRole("button", { name: "Record gift" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Persistence is not enabled.");
  });

  it("routes malformed success payloads through the error banner", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ result: { contributionId: "contrib-1" } }),
    } as Response);

    renderDialog();
    fillValidKnownGift();
    fireEvent.click(screen.getByRole("button", { name: "Record gift" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/review the details/i);
  });

  it("aborts an in-flight submit when the dialog closes", async () => {
    let capturedSignal: AbortSignal | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      capturedSignal = init?.signal;
      return new Promise<Response>(() => undefined);
    });

    const view = renderDialog();
    fillValidKnownGift();
    fireEvent.click(screen.getByRole("button", { name: "Record gift" }));

    await waitFor(() => {
      expect(capturedSignal).toBeDefined();
    });

    view.rerender(
      <OfflineGiftEntryDialog open={false} onOpenChange={() => undefined} />,
    );

    expect(capturedSignal?.aborted).toBe(true);
  });
});
