// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../../../../packages/ui/components/shadcn/toggle-group";

afterEach(() => {
  cleanup();
});

describe("ToggleGroup", () => {
  it("routes item presses through the group value callback", () => {
    const onValueChange = vi.fn();

    render(
      <ToggleGroup value={["desktop"]} onValueChange={onValueChange}>
        <ToggleGroupItem value="desktop">Desktop</ToggleGroupItem>
        <ToggleGroupItem value="mobile">Mobile</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(
      screen
        .getByRole("button", { name: "Desktop" })
        .getAttribute("data-pressed"),
    ).toBe("");
    expect(
      screen
        .getByRole("button", { name: "Mobile" })
        .getAttribute("data-pressed"),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));

    expect(onValueChange).toHaveBeenCalledWith(["mobile"], expect.any(Object));
  });

  describe("roving tab stop", () => {
    // Models a real Tab press: the next element in document order that is in the tab sequence.
    function tabFrom(element: HTMLElement) {
      const sequence = Array.from(
        document.querySelectorAll<HTMLElement>("button, [tabindex]"),
      ).filter(
        (candidate) =>
          candidate.tabIndex >= 0 && !(candidate as HTMLButtonElement).disabled,
      );
      const next = sequence[sequence.indexOf(element) + 1];
      next?.focus();
      return next;
    }

    function tabIndexes(names: string[]) {
      return names.map((name) => screen.getByRole("button", { name }).tabIndex);
    }

    it("starts a single-select group's tab stop on the pressed item", async () => {
      render(
        <>
          <button type="button">Before</button>
          <ToggleGroup aria-label="Type of update" value={["photo"]}>
            <ToggleGroupItem value="text">Text</ToggleGroupItem>
            <ToggleGroupItem value="photo">Photo</ToggleGroupItem>
            <ToggleGroupItem value="video">Video</ToggleGroupItem>
          </ToggleGroup>
        </>,
      );

      expect(tabIndexes(["Text", "Photo", "Video"])).toEqual([-1, 0, -1]);
      expect(tabFrom(screen.getByRole("button", { name: "Before" }))).toBe(
        screen.getByRole("button", { name: "Photo" }),
      );

      fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("button", { name: "Video" }),
        ),
      );
      fireEvent.keyDown(document.activeElement!, { key: "Home" });
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("button", { name: "Text" }),
        ),
      );
    });

    it("starts on the default pressed item and keeps render composition", () => {
      render(
        <ToggleGroup aria-label="Question category" defaultValue={["giving"]}>
          <ToggleGroupItem
            value="all"
            render={(props) => <button {...props} />}
          >
            All
          </ToggleGroupItem>
          <ToggleGroupItem
            value="giving"
            render={(props) => <button {...props} />}
          >
            Giving
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(tabIndexes(["All", "Giving"])).toEqual([-1, 0]);
    });

    it("skips a pressed item that is disabled", () => {
      render(
        <ToggleGroup aria-label="Task view" value={["board"]}>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="board" disabled>
            Board
          </ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(tabIndexes(["List", "Board"])).toEqual([0, -1]);
    });

    it("starts a multi-select group on the first enabled item", () => {
      render(
        <ToggleGroup aria-label="Channels" multiple defaultValue={[]}>
          <ToggleGroupItem value="email" disabled>
            Email
          </ToggleGroupItem>
          <ToggleGroupItem value="sms">SMS</ToggleGroupItem>
          <ToggleGroupItem value="push">Push</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(tabIndexes(["SMS", "Push"])).toEqual([0, -1]);
      cleanup();

      render(
        <ToggleGroup aria-label="Channels" multiple defaultValue={["push"]}>
          <ToggleGroupItem value="sms">SMS</ToggleGroupItem>
          <ToggleGroupItem value="push">Push</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(tabIndexes(["SMS", "Push"])).toEqual([0, -1]);
    });

    it("moves the tab stop to a value chosen after mount while focus is elsewhere", async () => {
      // The missionary Tasks view picks List for phones only after hydration.
      const group = (view: string) => (
        <>
          <button type="button">Before</button>
          <ToggleGroup aria-label="Task view" value={[view]}>
            <ToggleGroupItem value="board">Board</ToggleGroupItem>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
          </ToggleGroup>
        </>
      );
      const { rerender } = render(group("board"));
      expect(tabIndexes(["Board", "List"])).toEqual([0, -1]);

      screen.getByRole("button", { name: "Before" }).focus();
      rerender(group("list"));

      await waitFor(() =>
        expect(tabIndexes(["Board", "List"])).toEqual([-1, 0]),
      );
    });

    it("keeps focus on the pressed item when the user changes the value from inside", () => {
      function Controlled() {
        const [view, setView] = React.useState(["board"]);
        return (
          <ToggleGroup
            aria-label="Task view"
            value={view}
            onValueChange={setView}
          >
            <ToggleGroupItem value="board">Board</ToggleGroupItem>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
          </ToggleGroup>
        );
      }
      render(<Controlled />);
      const list = screen.getByRole("button", { name: "List" });

      list.focus();
      fireEvent.click(list);

      expect(screen.getByRole("button", { name: "List" })).toBe(list);
      expect(document.activeElement).toBe(list);
      expect(tabIndexes(["Board", "List"])).toEqual([-1, 0]);
    });

    it("keeps the element that code focuses for the same change", async () => {
      function ShowInList() {
        const [view, setView] = React.useState(["board"]);
        const listRef = React.useRef<HTMLButtonElement>(null);
        React.useEffect(() => {
          if (view[0] === "list") listRef.current?.focus();
        }, [view]);
        return (
          <>
            {view[0] === "board" ? (
              <button type="button" onClick={() => setView(["list"])}>
                Show in list
              </button>
            ) : null}
            <ToggleGroup
              aria-label="Task view"
              value={view}
              onValueChange={setView}
            >
              <ToggleGroupItem value="board">Board</ToggleGroupItem>
              <ToggleGroupItem ref={listRef} value="list">
                List
              </ToggleGroupItem>
            </ToggleGroup>
          </>
        );
      }
      render(<ShowInList />);
      const show = screen.getByRole("button", { name: "Show in list" });
      show.focus();
      fireEvent.click(show);

      const list = screen.getByRole("button", { name: "List" });
      await waitFor(() => expect(document.activeElement).toBe(list));
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(screen.getByRole("button", { name: "List" })).toBe(list);
      expect(document.activeElement).toBe(list);
      expect(tabIndexes(["Board", "List"])).toEqual([-1, 0]);
    });

    it("keeps its buttons when a press does not move focus (Safari, touch)", () => {
      function Controlled() {
        const [view, setView] = React.useState(["board"]);
        return (
          <ToggleGroup
            aria-label="Task view"
            value={view}
            onValueChange={setView}
          >
            <ToggleGroupItem value="board">Board</ToggleGroupItem>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
          </ToggleGroup>
        );
      }
      render(<Controlled />);
      const board = screen.getByRole("button", { name: "Board" });
      const list = screen.getByRole("button", { name: "List" });

      fireEvent.click(list);
      expect(list.getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: "Board" })).toBe(board);
      expect(screen.getByRole("button", { name: "List" })).toBe(list);

      fireEvent.click(board);
      expect(board.getAttribute("aria-pressed")).toBe("true");
    });

    it("falls back to the item the user pressed when the focused item is removed", async () => {
      const items = (values: string[]) =>
        values.map((value) => (
          <ToggleGroupItem key={value} value={value}>
            {value}
          </ToggleGroupItem>
        ));
      const { rerender } = render(
        <ToggleGroup aria-label="View" defaultValue={["a"]}>
          {items(["a", "b", "c"])}
        </ToggleGroup>,
      );

      const b = screen.getByRole("button", { name: "b" });
      b.focus();
      fireEvent.click(b);
      fireEvent.keyDown(b, { key: "ArrowRight" });
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("button", { name: "c" }),
        ),
      );

      rerender(
        <ToggleGroup aria-label="View" defaultValue={["a"]}>
          {items(["a", "b"])}
        </ToggleGroup>,
      );

      expect(tabIndexes(["a", "b"])).toEqual([-1, 0]);
    });
  });
});
