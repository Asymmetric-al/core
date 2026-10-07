export function activateDataGridCellFromKeyboard(
  event: {
    key: string;
    preventDefault: () => void;
    target: EventTarget | null;
    currentTarget: EventTarget | null;
  },
  activate: () => void,
): boolean {
  // Nested editors (input, select, checkbox) must keep Space/Enter.
  if (event.target !== event.currentTarget) {
    return false;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return false;
  }

  event.preventDefault();
  activate();
  return true;
}

import type * as React from "react";
type GridKeyboardEvent = Pick<
  React.KeyboardEvent,
  | "key"
  | "ctrlKey"
  | "metaKey"
  | "shiftKey"
  | "defaultPrevented"
  | "preventDefault"
> & { target: EventTarget | null };
interface GridKeyboardCommands {
  enableCopy: boolean;
  handleCopy: () => void;
  enablePaste: boolean;
  handlePaste: () => Promise<void>;
  enableUndo: boolean;
  handleRedo: () => void;
  handleUndo: () => void;
  enableRowDelete: boolean;
  selectedRows: Set<number>;
  handleDeleteRows: () => void;
}
export function handleDataGridKeyboardCommand(
  e: GridKeyboardEvent,
  {
    enableCopy,
    handleCopy,
    enablePaste,
    handlePaste,
    enableUndo,
    handleRedo,
    handleUndo,
    enableRowDelete,
    selectedRows,
    handleDeleteRows,
  }: GridKeyboardCommands,
) {
  const target = e.target;
  if (
    e.defaultPrevented ||
    (target instanceof Element &&
      target.closest(
        'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"], [role="textbox"], [role="combobox"]',
      ))
  )
    return;

  if (e.ctrlKey || e.metaKey) {
    if (e.key === "c" && enableCopy) {
      e.preventDefault();
      handleCopy();
    }
    if (e.key === "v" && enablePaste) {
      e.preventDefault();
      handlePaste();
    }
    if (e.key === "z" && enableUndo) {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    }
    if (e.key === "y" && enableUndo) {
      e.preventDefault();
      handleRedo();
    }
  }
  if (e.key === "Delete" && enableRowDelete && selectedRows.size > 0) {
    e.preventDefault();
    handleDeleteRows();
  }
}
