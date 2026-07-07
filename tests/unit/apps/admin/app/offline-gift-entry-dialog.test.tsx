/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OfflineGiftEntryDialog } from "../../../../../apps/admin/app/contributions/offline-gift/offline-gift-entry-dialog";

/**
 * TDD — offline gift entry dialog (Contributions Hub UI). Verifies the form
 * shell wires the pure model: the live receipt-status tile reacts to the donor
 * mode, and the anonymous-gift guidance appears in unknown mode. No network.
 */

afterEach(cleanup);

function renderDialog() {
  return render(<OfflineGiftEntryDialog open onOpenChange={() => undefined} />);
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
      screen.getByRole("radio", { name: /Unknown \/ anonymous/i }),
    );
    expect(screen.getByText(/no donor identity is stored/i)).toBeTruthy();
    expect(screen.getByText("Not receiptable")).toBeTruthy();
  });
});
