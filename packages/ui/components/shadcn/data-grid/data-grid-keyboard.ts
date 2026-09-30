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
