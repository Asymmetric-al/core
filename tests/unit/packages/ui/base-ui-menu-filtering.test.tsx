// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuClear,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuFilterProvider,
  DropdownMenuGroup,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuList,
  DropdownMenuTrigger,
} from "../../../../packages/ui/components/shadcn/dropdown-menu";
import {
  InputGroup,
  InputGroupInput,
} from "../../../../packages/ui/components/shadcn/input-group";

afterEach(cleanup);

describe("shared Base UI menu filtering", () => {
  it("filters menu actions, announces an empty result, and clears the query", async () => {
    render(
      <DropdownMenuFilterProvider>
        <DropdownMenu defaultOpen>
          <DropdownMenuContent>
            <DropdownMenuInput aria-label="Filter actions" />
            <DropdownMenuClear aria-label="Clear filter">
              Clear
            </DropdownMenuClear>
            <DropdownMenuEmpty>No actions found.</DropdownMenuEmpty>
            <DropdownMenuList>
              <DropdownMenuGroup>
                <DropdownMenuItem>Bogotá team</DropdownMenuItem>
                <DropdownMenuItem>Paris team</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuList>
          </DropdownMenuContent>
        </DropdownMenu>
      </DropdownMenuFilterProvider>,
    );

    const input = await screen.findByRole("searchbox", {
      name: "Filter actions",
    });
    expect(screen.queryByText("Clear")).toBeNull();
    expect(screen.queryByText("No actions found.")).toBeNull();

    fireEvent.change(input, { target: { value: "bogota" } });
    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: "Bogotá team" }),
      ).toBeTruthy();
      expect(screen.queryByRole("menuitem", { name: "Paris team" })).toBeNull();
    });

    fireEvent.change(input, { target: { value: "missing" } });
    await waitFor(() => {
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
      expect(screen.getByRole("status").textContent).toBe("No actions found.");
    });

    fireEvent.click(screen.getByText("Clear"));
    await waitFor(() => {
      expect(input).toHaveProperty("value", "");
      expect(screen.getAllByRole("menuitem")).toHaveLength(2);
      expect(screen.queryByText("No actions found.")).toBeNull();
      expect(document.activeElement).toBe(input);
    });
  });

  it("keeps grouped input composition and state callbacks while keyboard navigation uses virtual focus", async () => {
    const inputRef = createRef<HTMLInputElement>();
    const renderedInputRef = createRef<HTMLInputElement>();
    const listRef = createRef<HTMLDivElement>();
    const renderedListRef = createRef<HTMLDivElement>();
    const selected = vi.fn();
    render(
      <DropdownMenuFilterProvider>
        <DropdownMenu defaultOpen>
          <DropdownMenuContent>
            <InputGroup>
              <DropdownMenuInput
                aria-label="Filter actions"
                ref={inputRef}
                className={(state) =>
                  state.highlighted ? "input-highlighted" : "input-idle"
                }
                style={(state) => ({ opacity: state.highlighted ? 0.75 : 0.5 })}
                render={<InputGroupInput ref={renderedInputRef} />}
              />
            </InputGroup>
            <DropdownMenuList
              ref={listRef}
              className={() => "caller-list"}
              style={() => ({ paddingTop: 2 })}
              render={<div ref={renderedListRef} data-composed="list" />}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={selected}
                  className={(state) =>
                    state.highlighted ? "action-highlighted" : "action-idle"
                  }
                >
                  Export report
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Delete report</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuList>
          </DropdownMenuContent>
        </DropdownMenu>
      </DropdownMenuFilterProvider>,
    );

    const input = await screen.findByRole("searchbox", {
      name: "Filter actions",
    });
    const list = screen.getByRole("menu");
    const action = screen.getByRole("menuitem", { name: "Export report" });
    expect(inputRef.current).toBe(input);
    expect(renderedInputRef.current).toBe(input);
    expect(input.getAttribute("data-slot")).toBe("input-group-control");
    expect(input.classList.contains("border-0")).toBe(true);
    expect(input.classList.contains("focus-visible:ring-0")).toBe(true);
    expect(listRef.current).toBe(list);
    expect(renderedListRef.current).toBe(list);
    expect(list.classList.contains("caller-list")).toBe(true);
    expect(list.style.paddingTop).toBe("2px");
    expect(list.getAttribute("data-composed")).toBe("list");
    expect(input.getAttribute("aria-controls")).toBe(list.id);
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
      expect(input.classList.contains("input-highlighted")).toBe(true);
      expect(input.style.opacity).toBe("0.75");
    });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      expect(action.hasAttribute("data-highlighted")).toBe(true);
      expect(action.classList.contains("action-highlighted")).toBe(true);
      expect(input.getAttribute("aria-activedescendant")).toBe(action.id);
      expect(input.classList.contains("input-idle")).toBe(true);
      expect(input.style.opacity).toBe("0.5");
      expect(document.activeElement).toBe(input);
    });

    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(selected).toHaveBeenCalledOnce());
  });

  it("preserves clear and empty render targets, refs, styles, and disabled state", async () => {
    const clearRef = createRef<HTMLButtonElement>();
    const renderedClearRef = createRef<HTMLButtonElement>();
    const emptyRef = createRef<HTMLDivElement>();
    const renderedEmptyRef = createRef<HTMLDivElement>();
    render(
      <DropdownMenuFilterProvider defaultValue="missing">
        <DropdownMenu defaultOpen>
          <DropdownMenuContent>
            <DropdownMenuInput aria-label="Filter actions" />
            <DropdownMenuClear
              disabled
              ref={clearRef}
              className={(state) =>
                state.disabled ? "clear-disabled" : "clear-enabled"
              }
              style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}
              render={<button ref={renderedClearRef} data-composed="clear" />}
            >
              Clear
            </DropdownMenuClear>
            <DropdownMenuEmpty
              ref={emptyRef}
              className={() => "caller-empty"}
              style={() => ({ paddingTop: 2 })}
              render={<section ref={renderedEmptyRef} data-composed="empty" />}
            >
              No actions found.
            </DropdownMenuEmpty>
            <DropdownMenuList>
              <DropdownMenuGroup>
                <DropdownMenuItem>Export report</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuList>
          </DropdownMenuContent>
        </DropdownMenu>
      </DropdownMenuFilterProvider>,
    );

    const input = await screen.findByRole("searchbox", {
      name: "Filter actions",
    });
    const clear = screen.getByText("Clear") as HTMLButtonElement;
    const empty = await screen.findByRole("status");
    expect(clearRef.current).toBe(clear);
    expect(renderedClearRef.current).toBe(clear);
    expect(clear.disabled).toBe(true);
    expect(clear.classList.contains("clear-disabled")).toBe(true);
    expect(clear.classList.contains("press-feedback")).toBe(true);
    expect(clear.style.opacity).toBe("0.5");
    expect(clear.getAttribute("data-composed")).toBe("clear");
    expect(emptyRef.current).toBe(empty);
    expect(renderedEmptyRef.current).toBe(empty);
    expect(empty.classList.contains("caller-empty")).toBe(true);
    expect(empty.classList.contains("text-muted-foreground")).toBe(true);
    expect(empty.style.paddingTop).toBe("2px");
    expect(empty.getAttribute("data-composed")).toBe("empty");
    fireEvent.click(clear);
    expect(input).toHaveProperty("value", "missing");
  });

  it.each([false, true])(
    "supports controlled external filtering and canceling a close reset: %s",
    async (preserveQuery) => {
      const changed = vi.fn();
      function ControlledMenu() {
        const [query, setQuery] = useState("");
        return (
          <DropdownMenuFilterProvider
            filter={null}
            value={query}
            onValueChange={(value, details) => {
              changed(value, details);
              if (preserveQuery && details.reason === "popup-close") {
                details.cancel();
                return;
              }
              setQuery(value);
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuInput aria-label="Filter actions" />
                <DropdownMenuList>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Export report</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuList>
              </DropdownMenuContent>
            </DropdownMenu>
          </DropdownMenuFilterProvider>
        );
      }
      render(<ControlledMenu />);
      const trigger = screen.getByRole("button", { name: "Actions" });
      fireEvent.click(trigger);
      const input = await screen.findByRole("searchbox", {
        name: "Filter actions",
      });
      fireEvent.change(input, { target: { value: "unmatched query" } });
      expect(input).toHaveProperty("value", "unmatched query");
      expect(
        screen.getByRole("menuitem", { name: "Export report" }),
      ).toBeTruthy();
      expect(changed).toHaveBeenCalledWith(
        "unmatched query",
        expect.objectContaining({ reason: "input-change" }),
      );

      fireEvent.keyDown(input, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("searchbox")).toBeNull());
      expect(changed).toHaveBeenCalledWith(
        "",
        expect.objectContaining({
          reason: "popup-close",
          isCanceled: preserveQuery,
        }),
      );
      fireEvent.click(trigger);
      expect(
        await screen.findByRole("searchbox", { name: "Filter actions" }),
      ).toHaveProperty("value", preserveQuery ? "unmatched query" : "");
    },
  );
});
