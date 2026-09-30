/** @vitest-environment jsdom */

import React, { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";

function DialogExample({ scrollable }: { scrollable?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Open details</Button>} />
      <DialogContent scrollable={scrollable}>
        <DialogHeader>
          <DialogTitle>Details</DialogTitle>
          <DialogDescription>Scrollable dialog content</DialogDescription>
        </DialogHeader>
        <input aria-label="Name" />
      </DialogContent>
    </Dialog>
  );
}

describe("shared DialogContent scrolling API", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each([undefined, true])(
    "retains accessible labeling and Escape dismissal when scrollable=%s",
    async (scrollable) => {
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});
      render(<DialogExample scrollable={scrollable} />);
      const trigger = screen.getByRole("button", { name: "Open details" });
      fireEvent.click(trigger);
      const dialog = await screen.findByRole("dialog", { name: "Details" });
      expect(dialog.getAttribute("aria-describedby")).toBe(
        screen.getByText("Scrollable dialog content").id,
      );
      expect(dialog.hasAttribute("scrollable")).toBe(false);
      expect(errors.mock.calls.flat().map(String).join(" ")).not.toContain(
        "scrollable",
      );
      fireEvent.keyDown(dialog, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    },
  );
});
