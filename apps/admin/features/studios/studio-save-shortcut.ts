"use client";

import { useShortcut } from "@asym/ui/components/primitives/shortcut";

// The shell's leave-page alert, page search, Eve sheet and PDF setup badge are
// not studio state, and no open Base UI dialog may have Save open beside it.
function modalDialogOpen() {
  return (
    document.querySelector(
      '[role="dialog"][data-open], [role="alertdialog"][data-open]',
    ) !== null
  );
}

// Submit the Save dialog's form the way its submit button would, so its own
// validation and pending guard decide.
function submitFormAround(target: EventTarget | null) {
  if (!(target instanceof Element)) return;
  const form =
    target.closest("form") ??
    target.closest('[role="dialog"]')?.querySelector("form");
  form?.requestSubmit();
}

// Save keeps the key everywhere, so the browser's "Save page" never opens,
// but never opens a second dialog: it submits an open Save dialog instead.
export function useStudioSaveShortcut(
  keys: string,
  {
    saveDialogOpen,
    otherDialogOpen,
    openSaveDialog,
  }: {
    saveDialogOpen: boolean;
    otherDialogOpen: boolean;
    openSaveDialog: () => void;
  },
) {
  useShortcut(
    keys,
    (event) => {
      if (saveDialogOpen) {
        submitFormAround(event.target);
        return;
      }
      if (otherDialogOpen || modalDialogOpen()) return;
      openSaveDialog();
    },
    { allowInInput: true, allowInOverlay: true, description: "Save template" },
  );
}
