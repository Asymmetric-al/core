// @vitest-environment jsdom

import "./ui-sdk-strict";

import { execFileSync } from "node:child_process";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { act, useState } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SortableList,
  SortableListHandle,
  SortableListItem,
  type SortableListProps,
} from "../../../../../../packages/ui/components/primitives/sortable-list";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../../../../packages/ui/components/shadcn/dialog";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let hydrated: Root | undefined;
afterEach(async () => {
  cleanup();
  await act(async () => hydrated?.unmount());
  hydrated = undefined;
  vi.restoreAllMocks();
});

const FRUIT: Record<string, string> = {
  apple: "Apple",
  pear: "Pear",
  plum: "Plum",
};

type FruitProps = Pick<
  SortableListProps,
  "defaultValue" | "onValueChange" | "value"
> & {
  labelled?: boolean;
  sendTo?: number;
  onRefused?: (error: unknown) => void;
};

function Fruit({
  labelled = true,
  sendTo = 0,
  onRefused,
  ...props
}: FruitProps) {
  return (
    <SortableList aria-label="Fruit" {...props}>
      {({ order, move }) =>
        order.map((id) => (
          <SortableListItem
            key={id}
            value={id}
            label={labelled ? FRUIT[id] : undefined}
          >
            <SortableListHandle aria-label={`Reorder ${FRUIT[id]}`} />
            <span>{FRUIT[id]}</span>
            <input aria-label={`${FRUIT[id]} note`} />
            <button
              type="button"
              onClick={() => {
                try {
                  move(id, sendTo);
                } catch (error) {
                  onRefused?.(error);
                }
              }}
            >
              {`Send ${FRUIT[id]} first`}
            </button>
          </SortableListItem>
        ))
      }
    </SortableList>
  );
}

const handle = (fruit: string) =>
  screen.getByRole("button", { name: `Reorder ${fruit}` });
const row = (fruit: string) => handle(fruit).closest("li")!;
const order = () =>
  screen
    .getAllByRole("listitem")
    .map((item) => item.querySelector(":scope > span")?.textContent);
const press = (fruit: string, ...keys: string[]) => {
  for (const key of keys) fireEvent.keyDown(handle(fruit), { key });
};
const announced = () =>
  document.querySelector('[aria-live="assertive"]')?.textContent ?? "";

describe("SortableList (UI SDK reorder behavior, Maia styling)", () => {
  it("is a named list of rows in the given order, each with a named handle button", () => {
    render(<Fruit defaultValue={["apple", "pear", "plum"]} />);

    const list = screen.getByRole("list", { name: "Fruit" });
    expect(list.tagName).toBe("UL");
    expect(list.getAttribute("data-slot")).toBe("sortable-list");
    expect(list.getAttribute("aria-roledescription")).toBe("sortable list");
    expect(order()).toEqual(["Apple", "Pear", "Plum"]);
    for (const item of screen.getAllByRole("listitem")) {
      expect(item.tagName).toBe("LI");
      expect(item.getAttribute("data-slot")).toBe("sortable-list-row");
      expect(item.hasAttribute("data-grabbed")).toBe(false);
    }

    const handles = screen.getAllByRole("button", { name: /^Reorder / });
    expect(handles.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Reorder Apple",
      "Reorder Pear",
      "Reorder Plum",
    ]);
    for (const button of handles) {
      expect(button.getAttribute("data-slot")).toBe("sortable-list-handle");
      expect(button.getAttribute("type")).toBe("button");
      expect(button.getAttribute("aria-pressed")).toBe("false");
      expect(button.hasAttribute("tabindex")).toBe(false);
      expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
        "true",
      );
      const instructions = document.getElementById(
        button.getAttribute("aria-describedby")!,
      );
      expect(instructions?.hidden).toBe(true);
      expect(instructions?.textContent).toMatch(
        /Space or Enter.*arrow keys.*Escape/,
      );
    }
  });

  it("picks a row up with Space, moves it with an arrow and drops it with Space", () => {
    const onValueChange = vi.fn();
    render(
      <Fruit
        defaultValue={["apple", "pear", "plum"]}
        onValueChange={onValueChange}
      />,
    );

    handle("Apple").focus();
    press("Apple", " ");
    expect(handle("Apple").getAttribute("aria-pressed")).toBe("true");
    expect(row("Apple").hasAttribute("data-grabbed")).toBe(true);
    expect(row("Pear").hasAttribute("data-grabbed")).toBe(false);

    press("Apple", "ArrowDown");
    expect(order()).toEqual(["Pear", "Apple", "Plum"]);
    expect(onValueChange).not.toHaveBeenCalled();

    press("Apple", " ");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(
      ["pear", "apple", "plum"],
      expect.objectContaining({ reason: "move-key" }),
    );
    expect(order()).toEqual(["Pear", "Apple", "Plum"]);
    expect(handle("Apple").getAttribute("aria-pressed")).toBe("false");
    expect(row("Apple").hasAttribute("data-grabbed")).toBe(false);
  });

  it("also picks up and drops with Enter, and moves to either end with Home and End", () => {
    const onValueChange = vi.fn();
    render(
      <Fruit
        defaultValue={["apple", "pear", "plum"]}
        onValueChange={onValueChange}
      />,
    );

    handle("Pear").focus();
    press("Pear", "Enter", "End");
    expect(order()).toEqual(["Apple", "Plum", "Pear"]);
    press("Pear", "Home");
    expect(order()).toEqual(["Pear", "Apple", "Plum"]);
    press("Pear", "ArrowDown", "ArrowUp", "Enter");

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(
      ["pear", "apple", "plum"],
      expect.objectContaining({ reason: "move-key" }),
    );
  });

  it("puts the row back on Escape or Tab and reports nothing", () => {
    const onValueChange = vi.fn();
    render(
      <Fruit
        defaultValue={["apple", "pear", "plum"]}
        onValueChange={onValueChange}
      />,
    );

    handle("Apple").focus();
    press("Apple", " ", "End");
    expect(order()).toEqual(["Pear", "Plum", "Apple"]);
    press("Apple", "Escape");
    expect(order()).toEqual(["Apple", "Pear", "Plum"]);
    expect(handle("Apple").getAttribute("aria-pressed")).toBe("false");

    press("Apple", " ", "ArrowDown");
    // Tab is not prevented, so focus still moves on.
    expect(fireEvent.keyDown(handle("Apple"), { key: "Tab" })).toBe(true);
    expect(order()).toEqual(["Apple", "Pear", "Plum"]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("puts a row picked up with the keyboard back when the pointer or focus goes elsewhere", () => {
    const onValueChange = vi.fn();
    render(
      <Fruit
        defaultValue={["apple", "pear", "plum"]}
        onValueChange={onValueChange}
      />,
    );

    handle("Apple").focus();
    press("Apple", " ", "ArrowDown");
    fireEvent.pointerDown(handle("Apple"));
    expect(order()).toEqual(["Pear", "Apple", "Plum"]);
    expect(handle("Apple").getAttribute("aria-pressed")).toBe("true");

    fireEvent.pointerDown(
      screen.getByRole("button", { name: "Send Plum first" }),
    );
    expect(order()).toEqual(["Apple", "Pear", "Plum"]);
    expect(handle("Apple").getAttribute("aria-pressed")).toBe("false");
    expect(row("Apple").hasAttribute("data-grabbed")).toBe(false);

    handle("Apple").focus();
    press("Apple", " ", "ArrowDown");
    act(() => screen.getByRole("textbox", { name: "Apple note" }).focus());
    expect(order()).toEqual(["Apple", "Pear", "Plum"]);
    expect(handle("Apple").getAttribute("aria-pressed")).toBe("false");

    handle("Apple").focus();
    press("Apple", " ", "ArrowDown", " ");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange.mock.calls[0]![0]).toEqual(["pear", "apple", "plum"]);
  });

  it("leaves keys alone until a row is picked up, and never reads keys typed in a row's own controls", () => {
    render(<Fruit defaultValue={["apple", "pear", "plum"]} />);

    handle("Apple").focus();
    expect(fireEvent.keyDown(handle("Apple"), { key: "ArrowDown" })).toBe(true);
    expect(order()).toEqual(["Apple", "Pear", "Plum"]);

    const note = screen.getByRole("textbox", { name: "Apple note" });
    note.focus();
    expect(fireEvent.keyDown(note, { key: " " })).toBe(true);
    expect(fireEvent.keyDown(note, { key: "Enter" })).toBe(true);
    expect(row("Apple").hasAttribute("data-grabbed")).toBe(false);
    expect(handle("Apple").getAttribute("aria-pressed")).toBe("false");
  });

  it("keeps focus on the moved row's handle", () => {
    render(<Fruit defaultValue={["apple", "pear", "plum"]} />);

    handle("Apple").focus();
    press("Apple", " ", "ArrowDown", "ArrowDown");
    expect(order()).toEqual(["Pear", "Plum", "Apple"]);
    expect(document.activeElement).toBe(handle("Apple"));
    press("Apple", " ");
    expect(document.activeElement).toBe(handle("Apple"));
  });

  it("follows a controlling parent and shows nothing the parent did not accept", async () => {
    const onValueChange = vi.fn();
    function Controlled({ accept }: { accept: boolean }) {
      const [value, setValue] = useState(["apple", "pear", "plum"]);
      return (
        <Fruit
          value={value}
          onValueChange={(next, details) => {
            onValueChange(next, details);
            if (accept) setValue(next);
          }}
        />
      );
    }

    const view = render(<Controlled accept={false} />);
    handle("Apple").focus();
    press("Apple", " ", "ArrowDown", " ");
    expect(onValueChange).toHaveBeenLastCalledWith(
      ["pear", "apple", "plum"],
      expect.objectContaining({ reason: "move-key" }),
    );
    await waitFor(() => expect(order()).toEqual(["Apple", "Pear", "Plum"]));

    view.unmount();
    render(<Controlled accept />);
    handle("Apple").focus();
    press("Apple", " ", "ArrowDown", " ");
    await waitFor(() => expect(order()).toEqual(["Pear", "Apple", "Plum"]));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(order()).toEqual(["Pear", "Apple", "Plum"]);
  });

  it("lets onValueChange cancel a change", () => {
    render(
      <Fruit
        defaultValue={["apple", "pear", "plum"]}
        onValueChange={(_value, details) => details.cancel()}
      />,
    );

    handle("Apple").focus();
    press("Apple", " ", "ArrowDown", " ");
    expect(order()).toEqual(["Apple", "Pear", "Plum"]);
    expect(handle("Apple").getAttribute("aria-pressed")).toBe("false");
  });

  it("announces the pick-up, each move and the drop by the row's label", async () => {
    render(<Fruit defaultValue={["apple", "pear", "plum"]} />);

    handle("Apple").focus();
    press("Apple", " ");
    await waitFor(() =>
      expect(announced()).toBe("Picked up Apple, position 1 of 3."),
    );
    press("Apple", "ArrowDown");
    await waitFor(() => expect(announced()).toBe("Apple, position 2 of 3."));
    press("Apple", " ");
    await waitFor(() =>
      expect(announced()).toBe("Dropped Apple at position 2 of 3."),
    );
    press("Apple", " ", "ArrowDown", "Escape");
    await waitFor(() =>
      expect(announced()).toBe("Moved Apple back to position 2 of 3."),
    );
  });

  it("announces a row without a label by its visible text, not its hidden instructions", async () => {
    render(<Fruit labelled={false} defaultValue={["apple", "pear", "plum"]} />);

    handle("Pear").focus();
    press("Pear", " ");
    await waitFor(() => expect(announced()).toMatch(/^Picked up Pear/));
    expect(announced()).toMatch(/Send Pear first, position 2 of 3\.$/);
    expect(announced()).not.toMatch(/Space or Enter/);
  });

  it("moves a row from code through the same change, and announces it", async () => {
    const onValueChange = vi.fn();
    render(
      <Fruit
        defaultValue={["apple", "pear", "plum"]}
        onValueChange={onValueChange}
      />,
    );

    const sendFirst = screen.getByRole("button", { name: "Send Plum first" });
    sendFirst.focus();
    fireEvent.click(sendFirst);

    expect(order()).toEqual(["Plum", "Apple", "Pear"]);
    expect(onValueChange).toHaveBeenLastCalledWith(
      ["plum", "apple", "pear"],
      expect.objectContaining({ reason: "imperative" }),
    );
    expect(document.activeElement).toBe(sendFirst);
    await waitFor(() =>
      expect(announced()).toBe("Dropped Plum at position 1 of 3."),
    );
  });

  it("refuses a position that is not a whole number and leaves the order alone", () => {
    const onValueChange = vi.fn();
    const onRefused = vi.fn();
    render(
      <Fruit
        sendTo={Number.NaN}
        defaultValue={["apple", "pear", "plum"]}
        onValueChange={onValueChange}
        onRefused={onRefused}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Send Plum first" }));

    expect(onRefused).toHaveBeenCalledWith(
      new Error("Position must be a whole number from 0 to 2."),
    );
    expect(order()).toEqual(["Apple", "Pear", "Plum"]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("cancels a move on Escape without closing the Base UI dialog around it", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Edit fruit</DialogTitle>
          <Fruit defaultValue={["apple", "pear", "plum"]} />
        </DialogContent>
      </Dialog>,
    );

    handle("Apple").focus();
    press("Apple", " ", "ArrowDown", "Escape");
    expect(order()).toEqual(["Apple", "Pear", "Plum"]);
    expect(onOpenChange).not.toHaveBeenCalled();

    // With nothing picked up, Escape belongs to the dialog again.
    press("Apple", "Escape");
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it("hydrates its server HTML without a mismatch and stays interactive", async () => {
    const container = document.createElement("div");
    // Render in a DOM-free process: the same path Next.js takes for a Server
    // Component that renders a client component using this list.
    container.innerHTML = execFileSync(
      "bun",
      [
        "-e",
        `
        import React from "react";
        import { renderToString } from "react-dom/server";
        import { SortableList, SortableListHandle, SortableListItem } from "./packages/ui/components/primitives/sortable-list.tsx";
        const h = React.createElement;
        const names = { apple: "Apple", pear: "Pear", plum: "Plum" };
        console.log(renderToString(h(SortableList, { "aria-label": "Fruit", defaultValue: ["apple", "pear", "plum"] }, ({ order }) => order.map((id) => h(SortableListItem, { key: id, value: id, label: names[id] }, h(SortableListHandle, { "aria-label": "Reorder " + names[id] }), h("span", null, names[id]))))));
      `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ).trim();
    document.body.append(container);
    const serverHandle = container.querySelector<HTMLElement>(
      '[aria-label="Reorder Apple"]',
    );
    expect(serverHandle?.getAttribute("aria-pressed")).toBe("false");
    expect(
      Array.from(container.querySelectorAll("li > span")).map(
        (label) => label.textContent,
      ),
    ).toEqual(["Apple", "Pear", "Plum"]);

    const errors: unknown[] = [];
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    await act(async () => {
      hydrated = hydrateRoot(
        container,
        <SortableList
          aria-label="Fruit"
          defaultValue={["apple", "pear", "plum"]}
        >
          {({ order: ids }) =>
            ids.map((id) => (
              <SortableListItem key={id} value={id} label={FRUIT[id]}>
                <SortableListHandle aria-label={`Reorder ${FRUIT[id]}`} />
                <span>{FRUIT[id]}</span>
              </SortableListItem>
            ))
          }
        </SortableList>,
        { onRecoverableError: (error) => errors.push(error) },
      );
    });

    expect(errors).toEqual([]);
    expect(
      consoleError.mock.calls
        .map((args) => args.join(" "))
        .filter((message) =>
          /hydrated|hydration|server rendered|didn't match/i.test(message),
        ),
    ).toEqual([]);
    expect(container.querySelector('[aria-label="Reorder Apple"]')).toBe(
      serverHandle,
    );

    serverHandle!.focus();
    await act(async () => {
      fireEvent.keyDown(serverHandle!, { key: " " });
      fireEvent.keyDown(serverHandle!, { key: "End" });
      fireEvent.keyDown(serverHandle!, { key: " " });
    });
    expect(
      Array.from(container.querySelectorAll("li > span")).map(
        (label) => label.textContent,
      ),
    ).toEqual(["Pear", "Plum", "Apple"]);
    container.remove();
  });
});
