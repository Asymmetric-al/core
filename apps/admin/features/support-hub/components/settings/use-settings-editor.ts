"use client";

import * as React from "react";

/** What the open editor reports, so closing it never drops work silently. */
export type SettingsEditorGuard = { hasChanges: boolean; isSaving: boolean };

type EditorTarget<T> = { record: T | null };

export type SettingsEditor<T> = ReturnType<typeof useSettingsEditor<T>>;

/**
 * Open state for a settings editor sheet. The target outlives closing so the
 * title holds steady while the sheet animates out; the form itself lives in
 * the sheet and unmounts once it has closed, so every opening starts from
 * the record's saved values.
 */
export function useSettingsEditor<T>() {
  const [target, setTarget] = React.useState<EditorTarget<T> | null>(null);
  const [open, setOpen] = React.useState(false);
  const [isConfirmingDiscard, setConfirmingDiscard] = React.useState(false);
  const guard = React.useRef<SettingsEditorGuard>({
    hasChanges: false,
    isSaving: false,
  });
  const updateGuard = React.useCallback((state: SettingsEditorGuard) => {
    guard.current = state;
  }, []);

  /**
   * Cancel, Escape, the close button and an outside click all land here.
   * A save in flight keeps the editor open; unsaved changes are confirmed
   * first.
   */
  const requestClose = React.useCallback(() => {
    if (guard.current.isSaving) return;
    if (guard.current.hasChanges) {
      setConfirmingDiscard(true);
      return;
    }
    setOpen(false);
  }, []);

  return {
    open,
    hasTarget: target !== null,
    record: target?.record ?? null,
    guard,
    updateGuard,
    isConfirmingDiscard,
    openNew: () => {
      setTarget({ record: null });
      setOpen(true);
    },
    openRecord: (record: T) => {
      setTarget({ record });
      setOpen(true);
    },
    /** Closes without asking, e.g. after a successful save. */
    close: () => setOpen(false),
    requestClose,
    discardChanges: () => {
      setConfirmingDiscard(false);
      setOpen(false);
    },
    keepEditing: () => setConfirmingDiscard(false),
  };
}
