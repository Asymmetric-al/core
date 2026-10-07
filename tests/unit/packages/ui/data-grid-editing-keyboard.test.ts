/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleDataGridKeyboardCommand } from "../../../../packages/ui/components/shadcn/data-grid/data-grid-keyboard";
afterEach(() => document.body.replaceChildren());
function commands() {
  return {
    enableCopy: true,
    handleCopy: vi.fn(),
    enablePaste: true,
    handlePaste: vi.fn().mockResolvedValue(undefined),
    enableUndo: true,
    handleRedo: vi.fn(),
    handleUndo: vi.fn(),
    enableRowDelete: true,
    selectedRows: new Set([0]),
    handleDeleteRows: vi.fn(),
  };
}
function dispatch(
  target: HTMLElement,
  key: string,
  options: KeyboardEventInit = {},
  prevented = false,
) {
  const state = commands();
  const grid = document.createElement("div");
  grid.append(target);
  document.body.append(grid);
  if (prevented)
    target.addEventListener("keydown", (event) => event.preventDefault());
  grid.addEventListener("keydown", (event) =>
    handleDataGridKeyboardCommand(event, state),
  );
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key,
    ...options,
  });
  target.dispatchEvent(event);
  return { state, event };
}
describe("DataGrid editing command ownership", () => {
  for (const tag of ["input", "textarea", "select"])
    for (const [key, options] of [
      ["Delete", {}],
      ["c", { ctrlKey: true }],
      ["v", { metaKey: true }],
      ["z", { ctrlKey: true }],
    ] as const) {
      it(`keeps ${key} in the native ${tag} control`, () => {
        const { state, event } = dispatch(
          document.createElement(tag),
          key,
          options,
        );
        expect(state.handleDeleteRows).not.toHaveBeenCalled();
        expect(state.handleCopy).not.toHaveBeenCalled();
        expect(state.handlePaste).not.toHaveBeenCalled();
        expect(state.handleUndo).not.toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(false);
      });
    }
  it("keeps Delete in a descendant of contenteditable", () => {
    const editor = document.createElement("div");
    editor.setAttribute("contenteditable", "true");
    const span = document.createElement("span");
    editor.append(span);
    const grid = document.createElement("div");
    grid.append(editor);
    document.body.append(grid);
    const state = commands();
    grid.addEventListener("keydown", (e) =>
      handleDataGridKeyboardCommand(e, state),
    );
    span.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Delete",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(state.handleDeleteRows).not.toHaveBeenCalled();
  });
  it("respects a child handler that already claimed the event", () => {
    const { state } = dispatch(
      document.createElement("div"),
      "Delete",
      {},
      true,
    );
    expect(state.handleDeleteRows).not.toHaveBeenCalled();
  });
  it("continues deleting selected rows from grid display cells", () => {
    const { state, event } = dispatch(document.createElement("div"), "Delete");
    expect(state.handleDeleteRows).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });
  it("continues copying grid selections outside editors", () => {
    const { state, event } = dispatch(document.createElement("div"), "c", {
      ctrlKey: true,
    });
    expect(state.handleCopy).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });
});
