/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BoardColumn } from "../../../../apps/admin/features/support-hub/components/board/BoardColumn";
afterEach(cleanup);
const props = {
  status: "open" as const,
  label: "Open",
  description: "Open conversations",
  isHovered: false,
  dropProps: { "aria-dropeffect": "move" as const },
};
describe("support board authoritative empty count", () => {
  it("shows the empty state when a mapped empty array has a null overflow sibling", () => {
    const view = render(
      <BoardColumn {...props} count={0} isDragging={false}>
        {[]}
        {null}
      </BoardColumn>,
    );
    expect(view.getByText("No conversations")).toBeTruthy();
  });
  it("shows the drop hint for the same empty child shape while dragging", () => {
    const view = render(
      <BoardColumn {...props} count={0} isDragging>
        {[]}
        {null}
      </BoardColumn>,
    );
    expect(view.getByText("Drop to move here")).toBeTruthy();
  });
  it("keeps existing cards when the record count is nonzero", () => {
    const view = render(
      <BoardColumn {...props} count={1} isDragging={false}>
        <article>Conversation card</article>
        {null}
      </BoardColumn>,
    );
    expect(view.getByText("Conversation card")).toBeTruthy();
    expect(view.queryByText("No conversations")).toBeNull();
  });
});
