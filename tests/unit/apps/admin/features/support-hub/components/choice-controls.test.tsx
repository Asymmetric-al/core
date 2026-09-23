// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: App component regression test at its public UI boundary.
import { LabelForm } from "../../../../../../../apps/admin/features/support-hub/components/labels/LabelForm";
// eslint-disable-next-line no-restricted-imports -- AL-1894: App component regression test at its public UI boundary.
import { LayoutToggle } from "../../../../../../../apps/admin/features/support-hub/components/toolbar/LayoutToggle";

const save = vi.hoisted(() => vi.fn().mockResolvedValue({}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportLabel: () => ({ mutateAsync: save, isPending: false }),
  }),
);
afterEach(cleanup);

describe("Support Hub choice controls", () => {
  it("uses one tab stop and arrow navigation for the selected inbox layout", async () => {
    function Layout() {
      const [value, setValue] = useState<"board" | "table">("board");
      return <LayoutToggle value={value} onValueChange={setValue} />;
    }
    render(<Layout />);
    const board = screen.getByRole("button", { name: "Board" });
    const table = screen.getByRole("button", { name: "Table" });
    expect(board.tabIndex).toBe(0);
    expect(table.tabIndex).toBe(-1);
    board.focus();
    fireEvent.keyDown(board, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(table));
    fireEvent.click(table);
    expect(table.getAttribute("aria-pressed")).toBe("true");
    expect(board.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(table);
    expect(table.getAttribute("aria-pressed")).toBe("true");
  });

  it("navigates label tones by keyboard and saves the selected value", async () => {
    render(<LabelForm onSaved={() => undefined} onCancel={() => undefined} />);
    const zinc = screen.getByRole("button", { name: "Use zinc tone" });
    const blue = screen.getByRole("button", { name: "Use blue tone" });
    expect(blue.tabIndex).toBe(-1);
    zinc.focus();
    fireEvent.keyDown(zinc, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(blue));
    fireEvent.click(blue);
    expect(blue.getAttribute("aria-pressed")).toBe("true");
    expect(zinc.getAttribute("aria-pressed")).toBe("false");
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Finance" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create label" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Finance", tone: "blue" }),
    );
  });
});
