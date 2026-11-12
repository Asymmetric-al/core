// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../../../../packages/ui/components/shadcn/dialog";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "../../../../../../packages/ui/components/shadcn/sheet";

afterEach(cleanup);

function scrim() {
  return document.querySelector<HTMLElement>(
    '[data-slot="sheet-nested-dialog-scrim"]',
  );
}

describe("SheetContent nestedDialogScrim", () => {
  it("is off by default, so existing sheets are unchanged", async () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Record</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    await screen.findByText("Record");
    expect(scrim()).toBeNull();
  });

  it("dims the whole sheet, border included, while a nested dialog is open", async () => {
    render(
      <Sheet open>
        <SheetContent nestedDialogScrim>
          <SheetTitle>Record</SheetTitle>
          <Dialog open>
            <DialogContent>
              <DialogTitle>Resend receipt</DialogTitle>
            </DialogContent>
          </Dialog>
        </SheetContent>
      </Sheet>,
    );
    await screen.findByText("Resend receipt");
    const layer = scrim();
    expect(layer).not.toBeNull();
    expect(layer!.getAttribute("aria-hidden")).toBe("true");
    const classes = layer!.className.split(" ");
    // Hidden until Base UI marks the sheet as the parent of an open dialog.
    expect(classes).toEqual(
      expect.arrayContaining([
        "hidden",
        "in-data-nested-dialog-open:block",
        "-inset-px",
      ]),
    );
    const sheet = layer!.closest('[data-slot="sheet-content"]');
    await waitFor(() =>
      expect(sheet?.hasAttribute("data-nested-dialog-open")).toBe(true),
    );
  });
});
