// @vitest-environment jsdom

import "./ui-sdk-strict";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import { useRef, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useShortcut } from "../../../../../../packages/ui/components/primitives/shortcut";
import {
  ShortcutHelp,
  ShortcutHelpMenuItem,
} from "../../../../../../packages/ui/components/primitives/shortcut-help";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "../../../../../../packages/ui/components/shadcn/dropdown-menu";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  setPlatform("other");
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  setPlatform("other");
  vi.unstubAllGlobals();
});

const plain = (text: string | null | undefined) =>
  (text ?? "").replace(/[⁦⁩]/g, "");

/** A real key press goes to the focused element, so focus first. */
function press(target: Element | null, init: KeyboardEventInit) {
  if (target instanceof HTMLElement) target.focus();
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => {
    (target ?? document.body).dispatchEvent(event);
  });
  return event;
}

const help = (target: Element | null = document.body) =>
  press(target, { key: "?", shiftKey: true });

function PageShortcut({
  keys,
  description,
}: {
  keys: string;
  description?: string;
}) {
  useShortcut(keys, () => {}, { description });
  return null;
}

function Region({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useShortcut("j", () => {}, { description: "Next conversation", within: ref });
  return (
    <div ref={ref} role="region" aria-label="Inbox">
      {children}
    </div>
  );
}

function Page({ children }: { children?: ReactNode }) {
  return (
    <>
      <PageShortcut keys="mod+k" description="Search" />
      <PageShortcut keys="mod+b" description="Toggle sidebar" />
      <PageShortcut keys="mod+shift+x" />
      <button type="button">Before</button>
      <input aria-label="Name" />
      {children}
      <ShortcutHelp />
    </>
  );
}

function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button type="button">Account</button>} />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <ShortcutHelpMenuItem />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const dialog = () => screen.getByRole("dialog", { name: "Keyboard shortcuts" });
const rows = () =>
  within(dialog())
    .getAllByRole("listitem")
    .map((item) => {
      const name = item.querySelector("span:not(.sr-only)");
      const keys = item.querySelector("kbd");
      const spoken = item.querySelector(".sr-only");
      return [name?.textContent, plain(keys?.textContent), spoken?.textContent];
    });

describe("ShortcutHelp", () => {
  it("lists the described shortcuts on Shift+? with the keys this platform shows and their spoken names", async () => {
    render(<Page />);

    const event = help(screen.getByRole("button", { name: "Before" }));

    expect(event.defaultPrevented).toBe(true);
    await waitFor(() => expect(dialog()).toBeTruthy());
    expect(rows()).toEqual([
      ["Search", "Ctrl+K", "Control+K"],
      ["Toggle sidebar", "Ctrl+B", "Control+B"],
      ["Show keyboard shortcuts", "Shift+?", "Shift+?"],
    ]);
    const keys = within(dialog()).getAllByText((_, element) =>
      Boolean(element?.matches("kbd")),
    );
    expect(
      keys.every((kbd) => kbd.getAttribute("aria-hidden") === "true"),
    ).toBe(true);
  });

  it("writes the keys the Apple way on Apple platforms", async () => {
    setPlatform("apple");
    render(<Page />);

    help(screen.getByRole("button", { name: "Before" }));

    await waitFor(() => expect(dialog()).toBeTruthy());
    expect(rows()[0]).toEqual(["Search", "⌘K", "Meta+K"]);
  });

  it("lists a region's shortcuts only when focus was inside that region", async () => {
    render(
      <Page>
        <Region>
          <button type="button">Conversation</button>
        </Region>
      </Page>,
    );

    help(screen.getByRole("button", { name: "Before" }));
    await waitFor(() => expect(dialog()).toBeTruthy());
    expect(rows().map(([name]) => name)).not.toContain("Next conversation");
    press(dialog(), { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).toBe(
        null,
      ),
    );

    help(screen.getByRole("button", { name: "Conversation" }));
    await waitFor(() => expect(dialog()).toBeTruthy());
    expect(rows().map(([name]) => name)).toContain("Next conversation");
  });

  it("leaves ? to a text field", () => {
    render(<Page />);

    const event = help(screen.getByRole("textbox", { name: "Name" }));

    expect(event.defaultPrevented).toBe(false);
    expect(screen.queryByRole("dialog")).toBe(null);
  });

  it("closes on Escape and on Shift+? again, returning focus to where it was", async () => {
    render(<Page />);
    const before = screen.getByRole("button", { name: "Before" });

    help(before);
    await waitFor(() => expect(dialog()).toBeTruthy());
    press(dialog(), { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).toBe(
        null,
      ),
    );
    await waitFor(() => expect(document.activeElement).toBe(before));

    help(before);
    await waitFor(() => expect(dialog()).toBeTruthy());
    const inside = within(dialog()).queryAllByRole("button")[0] ?? dialog();
    help(inside);
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).toBe(
        null,
      ),
    );
    await waitFor(() => expect(document.activeElement).toBe(before));
  });

  it("offers a Keyboard shortcuts menu item that shows Shift+? and opens the same list", async () => {
    render(
      <Page>
        <AccountMenu />
      </Page>,
    );
    const trigger = screen.getByRole("button", { name: "Account" });
    trigger.focus();
    fireEvent.click(trigger);

    const item = await screen.findByRole("menuitem", {
      name: "Keyboard shortcuts",
    });
    expect(item.getAttribute("aria-keyshortcuts")).toBe("Shift+?");
    const hint = item.querySelector("kbd");
    expect(plain(hint?.textContent)).toBe("Shift+?");
    expect(hint?.getAttribute("aria-hidden")).toBe("true");

    fireEvent.click(item);
    await waitFor(() => expect(dialog()).toBeTruthy());
    expect(screen.queryByRole("menu")).toBe(null);
    expect(rows().map(([name]) => name)).toEqual([
      "Search",
      "Toggle sidebar",
      "Show keyboard shortcuts",
    ]);

    press(dialog(), { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).toBe(
        null,
      ),
    );
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  // The menu takes no shortcuts, so the list waits for it to close and shows
  // what works where it gives focus back, as Shift+? there would.
  it("lists from the menu what works where the menu returns focus", async () => {
    render(
      <Page>
        <Region>
          <button type="button">Conversation</button>
        </Region>
        <AccountMenu />
      </Page>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Keyboard shortcuts" }),
    );
    await waitFor(() => expect(dialog()).toBeTruthy());
    expect(rows().map(([name]) => name)).not.toContain("Next conversation");
    press(dialog(), { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).toBe(
        null,
      ),
    );
    cleanup();

    render(
      <Page>
        <Region>
          <AccountMenu />
        </Region>
      </Page>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Keyboard shortcuts" }),
    );
    await waitFor(() => expect(dialog()).toBeTruthy());
    expect(rows().map(([name]) => name)).toContain("Next conversation");
  });
});
