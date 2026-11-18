// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useStudioSaveShortcut } from "../../../../apps/admin/features/studios/studio-save-shortcut";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from "../../../../packages/ui/components/shadcn/alert-dialog";

type StudioProps = {
  saveDialogOpen?: boolean;
  otherDialogOpen?: boolean;
  openSaveDialog: () => void;
  onSubmit?: () => void;
};

// A stand-in studio whose own Save dialog is plain markup, as when a test
// stubs the shared Dialog.
function Studio({
  saveDialogOpen = false,
  otherDialogOpen = false,
  openSaveDialog,
  onSubmit,
}: StudioProps) {
  useStudioSaveShortcut("mod+s", {
    saveDialogOpen,
    otherDialogOpen,
    openSaveDialog,
  });
  return (
    <>
      <input aria-label="Email name" />
      {saveDialogOpen ? (
        <div role="dialog" aria-label="Save template" data-open="">
          <button type="button">Close</button>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit?.();
            }}
          >
            <input aria-label="Template name" />
            <button type="submit">Save template</button>
          </form>
        </div>
      ) : null}
    </>
  );
}

function pressSave() {
  return !fireEvent.keyDown(document.activeElement ?? document.body, {
    key: "s",
    ctrlKey: true,
  });
}

beforeEach(() => {
  setPlatform("other");
});

afterEach(() => {
  cleanup();
  setPlatform("other");
});

describe("studio Save shortcut", () => {
  it("opens the Save dialog from the page and while typing in a field", () => {
    const openSaveDialog = vi.fn();
    render(<Studio openSaveDialog={openSaveDialog} />);

    expect(pressSave()).toBe(true);
    expect(openSaveDialog).toHaveBeenCalledOnce();

    screen.getByRole("textbox", { name: "Email name" }).focus();
    expect(pressSave()).toBe(true);
    expect(openSaveDialog).toHaveBeenCalledTimes(2);
  });

  it("takes the key from the browser but opens nothing over another dialog", async () => {
    const openSaveDialog = vi.fn();
    const studio = render(
      <Studio openSaveDialog={openSaveDialog} otherDialogOpen />,
    );
    expect(pressSave()).toBe(true);
    expect(openSaveDialog).not.toHaveBeenCalled();

    // The shell's leave-page alert is a Base UI dialog the studio does not track.
    studio.rerender(<Studio openSaveDialog={openSaveDialog} />);
    const shellAlert = render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Leave this page?</AlertDialogTitle>
          <AlertDialogCancel>Stay on page</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );
    (await screen.findByRole("button", { name: "Stay on page" })).focus();
    expect(pressSave()).toBe(true);
    expect(openSaveDialog).not.toHaveBeenCalled();

    shellAlert.unmount();
    (document.activeElement as HTMLElement | null)?.blur();
    expect(pressSave()).toBe(true);
    expect(openSaveDialog).toHaveBeenCalledOnce();
  });

  it("submits the open Save dialog's form instead of opening another", () => {
    const openSaveDialog = vi.fn();
    const onSubmit = vi.fn();
    render(
      <Studio
        openSaveDialog={openSaveDialog}
        onSubmit={onSubmit}
        saveDialogOpen
      />,
    );

    screen.getByRole("textbox", { name: "Template name" }).focus();
    expect(pressSave()).toBe(true);
    expect(onSubmit).toHaveBeenCalledOnce();

    // Focus elsewhere in the dialog still submits that dialog's form.
    screen.getByRole("button", { name: "Close" }).focus();
    expect(pressSave()).toBe(true);
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(openSaveDialog).not.toHaveBeenCalled();
  });
});
