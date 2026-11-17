// @vitest-environment jsdom

import "./ui-sdk-strict";

import { setPlatform } from "@ui-sdk/core/testing";
import { cleanup, render, screen } from "@testing-library/react";
import { useRef, type ReactNode, type RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  listShortcuts,
  useShortcut,
  type ShortcutOptions,
} from "../../../../../../packages/ui/components/primitives/shortcut";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../../../../packages/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

/** UI SDK wraps hints in left-to-right isolates so a right-to-left page never reorders them. */
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
  (target ?? document.body).dispatchEvent(event);
  return event;
}

function Shortcut({
  keys,
  onRun,
  options,
  children,
}: {
  keys: string | null;
  onRun: () => void;
  options?: ShortcutOptions;
  children?: ReactNode;
}) {
  useShortcut(keys, onRun, options);
  return <>{children}</>;
}

function ScopedShortcut({
  onRun,
  options,
  children,
}: {
  onRun: () => void;
  options?: Omit<ShortcutOptions, "within">;
  children: (ref: RefObject<HTMLDivElement | null>) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useShortcut("j", onRun, { ...options, within: ref });
  return <>{children(ref)}</>;
}

describe("useShortcut (UI SDK shortcuts with Core's guards)", () => {
  it("runs the platform's own modifier and marks the key press handled", () => {
    const onRun = vi.fn();
    render(
      <Shortcut keys="mod+k" onRun={onRun}>
        <button type="button">Page action</button>
      </Shortcut>,
    );
    const origin = screen.getByRole("button", { name: "Page action" });

    expect(press(origin, { key: "k", metaKey: true }).defaultPrevented).toBe(
      false,
    );
    expect(onRun).not.toHaveBeenCalled();
    expect(press(origin, { key: "k", ctrlKey: true }).defaultPrevented).toBe(
      true,
    );
    expect(onRun).toHaveBeenCalledTimes(1);

    setPlatform("apple");
    press(origin, { key: "k", ctrlKey: true });
    expect(onRun).toHaveBeenCalledTimes(1);
    press(origin, { key: "k", metaKey: true });
    expect(onRun).toHaveBeenCalledTimes(2);
  });

  it("leaves typing alone, even for modifier shortcuts, unless asked", () => {
    const onRun = vi.fn();
    const onTyping = vi.fn();
    render(
      <>
        <Shortcut keys="mod+k" onRun={onRun} />
        <Shortcut
          keys="mod+enter"
          onRun={onTyping}
          options={{ allowInInput: true }}
        />
        <input aria-label="Name" />
        <textarea aria-label="Details" />
        <select aria-label="Country">
          <option>One</option>
        </select>
        <div contentEditable aria-label="Editor" tabIndex={0} />
        <div role="textbox" aria-label="Custom editor" tabIndex={0} />
      </>,
    );
    for (const field of [
      screen.getByRole("textbox", { name: "Name" }),
      screen.getByRole("textbox", { name: "Details" }),
      screen.getByRole("combobox", { name: "Country" }),
      screen.getByLabelText("Editor"),
      screen.getByRole("textbox", { name: "Custom editor" }),
    ]) {
      expect(press(field, { key: "k", ctrlKey: true }).defaultPrevented).toBe(
        false,
      );
    }
    expect(onRun).not.toHaveBeenCalled();

    press(screen.getByRole("textbox", { name: "Details" }), {
      key: "Enter",
      ctrlKey: true,
    });
    expect(onTyping).toHaveBeenCalledTimes(1);
  });

  it("treats only text entry as typing: a slider, checkbox or button input does not block a shortcut", () => {
    const onRun = vi.fn();
    render(
      <>
        <Shortcut keys="mod+k" onRun={onRun} />
        <input type="range" aria-label="Zoom" />
        <input type="checkbox" aria-label="Show archived" />
        <input type="radio" aria-label="Weekly" />
        <input type="button" value="Apply" />
        <input type="search" aria-label="Filter" />
      </>,
    );
    for (const name of ["Zoom", "Show archived", "Weekly"]) {
      const target =
        screen.queryByRole("slider", { name }) ??
        screen.queryByRole("checkbox", { name }) ??
        screen.getByRole("radio", { name });
      expect(
        press(target, { key: "k", ctrlKey: true }).defaultPrevented,
        name,
      ).toBe(true);
    }
    press(screen.getByRole("button", { name: "Apply" }), {
      key: "k",
      ctrlKey: true,
    });
    expect(onRun).toHaveBeenCalledTimes(4);
    // A text field still wins.
    expect(
      press(screen.getByRole("searchbox", { name: "Filter" }), {
        key: "k",
        ctrlKey: true,
      }).defaultPrevented,
    ).toBe(false);
    expect(onRun).toHaveBeenCalledTimes(4);
  });

  it("yields to a local handler, key repeat, composition and extra modifiers", () => {
    const onRun = vi.fn();
    render(
      <Shortcut keys="mod+k" onRun={onRun}>
        <button type="button" onKeyDown={(event) => event.preventDefault()}>
          Local shortcut
        </button>
        <button type="button">Page action</button>
      </Shortcut>,
    );
    press(screen.getByRole("button", { name: "Local shortcut" }), {
      key: "k",
      ctrlKey: true,
    });
    const origin = screen.getByRole("button", { name: "Page action" });
    for (const extra of [
      { repeat: true },
      { isComposing: true },
      { altKey: true },
      { shiftKey: true },
      { ctrlKey: false },
      { key: "l" },
    ]) {
      press(origin, { key: "k", ctrlKey: true, ...extra });
    }
    expect(onRun).not.toHaveBeenCalled();
  });

  it("keeps a held shortcut from the browser without running it again", () => {
    const onRun = vi.fn();
    render(
      <>
        <Shortcut keys="mod+s" onRun={onRun} />
        <Shortcut keys="mod+k" onRun={onRun} options={{ when: () => false }} />
        <button type="button">Page action</button>
        <input aria-label="Name" />
      </>,
    );
    const origin = screen.getByRole("button", { name: "Page action" });
    expect(press(origin, { key: "s", ctrlKey: true }).defaultPrevented).toBe(
      true,
    );
    expect(
      press(origin, { key: "s", ctrlKey: true, repeat: true }).defaultPrevented,
    ).toBe(true);
    expect(onRun).toHaveBeenCalledTimes(1);

    // A held key the shortcut would not take stays the browser's.
    expect(
      press(origin, { key: "k", ctrlKey: true, repeat: true }).defaultPrevented,
    ).toBe(false);
    expect(
      press(screen.getByRole("textbox", { name: "Name" }), {
        key: "s",
        ctrlKey: true,
        repeat: true,
      }).defaultPrevented,
    ).toBe(false);
    expect(
      press(origin, { key: "s", metaKey: true, repeat: true }).defaultPrevented,
    ).toBe(false);
  });

  it("repeats the same shortcut UI SDK ran for the first press when two share keys", () => {
    const first = vi.fn();
    const last = vi.fn();
    render(
      <>
        <Shortcut keys="mod+j" onRun={first} options={{ repeat: true }} />
        <Shortcut keys="mod+j" onRun={last} options={{ repeat: true }} />
        <button type="button">Page action</button>
      </>,
    );
    const origin = screen.getByRole("button", { name: "Page action" });
    press(origin, { key: "j", ctrlKey: true });
    press(origin, { key: "j", ctrlKey: true, repeat: true });
    // UI SDK runs the shortcut registered last; a held key must agree.
    expect(last).toHaveBeenCalledTimes(2);
    expect(first).not.toHaveBeenCalled();
  });

  it("runs a held shortcut again only when it asks to repeat", () => {
    const onUndo = vi.fn();
    const onSave = vi.fn();
    render(
      <>
        <Shortcut keys="mod+z" onRun={onUndo} options={{ repeat: true }} />
        <Shortcut keys="mod+s" onRun={onSave} />
        <button type="button">Canvas</button>
        <input aria-label="Name" />
      </>,
    );
    const canvas = screen.getByRole("button", { name: "Canvas" });
    press(canvas, { key: "z", ctrlKey: true });
    expect(
      press(canvas, { key: "z", ctrlKey: true, repeat: true }).defaultPrevented,
    ).toBe(true);
    press(canvas, { key: "z", ctrlKey: true, repeat: true });
    expect(onUndo).toHaveBeenCalledTimes(3);

    press(canvas, { key: "s", ctrlKey: true });
    press(canvas, { key: "s", ctrlKey: true, repeat: true });
    expect(onSave).toHaveBeenCalledTimes(1);

    // Its guards still hold while the key is held.
    press(screen.getByRole("textbox", { name: "Name" }), {
      key: "z",
      ctrlKey: true,
      repeat: true,
    });
    expect(onUndo).toHaveBeenCalledTimes(3);
  });

  it("pauses a page shortcut while a Base UI dialog or menu owns the keyboard", async () => {
    const onRun = vi.fn();
    const view = render(
      <>
        <Shortcut keys="mod+b" onRun={onRun} />
        <Dialog open>
          <DialogContent>
            <DialogTitle>Edit note</DialogTitle>
            <DialogDescription>Review before saving.</DialogDescription>
            <button type="button">Save note</button>
          </DialogContent>
        </Dialog>
      </>,
    );
    const save = await screen.findByRole("button", { name: "Save note" });
    expect(press(save, { key: "b", ctrlKey: true }).defaultPrevented).toBe(
      false,
    );
    // A modal that has not received focus yet still owns the keyboard.
    (document.activeElement as HTMLElement | null)?.blur();
    press(null, { key: "b", ctrlKey: true });
    expect(onRun).not.toHaveBeenCalled();

    view.rerender(
      <>
        <Shortcut keys="mod+b" onRun={onRun} />
        <DropdownMenu open>
          <DropdownMenuTrigger>Row actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>,
    );
    press(await screen.findByRole("menuitem", { name: "Archive" }), {
      key: "b",
      ctrlKey: true,
    });
    expect(onRun).not.toHaveBeenCalled();

    view.rerender(
      <Shortcut keys="mod+b" onRun={onRun}>
        <button type="button">Page action</button>
      </Shortcut>,
    );
    press(screen.getByRole("button", { name: "Page action" }), {
      key: "b",
      ctrlKey: true,
    });
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it("keeps a shortcut the page must always own running inside any dialog", async () => {
    const onSave = vi.fn();
    render(
      <>
        <Shortcut
          keys="mod+s"
          onRun={onSave}
          options={{ allowInInput: true, allowInOverlay: true }}
        />
        <Dialog open>
          <DialogContent>
            <DialogTitle>Send a test</DialogTitle>
            <DialogDescription>Choose a recipient.</DialogDescription>
            <input aria-label="Recipient" />
          </DialogContent>
        </Dialog>
      </>,
    );
    const event = press(
      await screen.findByRole("textbox", { name: "Recipient" }),
      { key: "s", ctrlKey: true },
    );
    expect(event.defaultPrevented).toBe(true);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("scopes a shortcut to one region, including a region inside a dialog", async () => {
    const onRun = vi.fn();
    render(
      <>
        <button type="button">Outside</button>
        <ScopedShortcut onRun={onRun}>
          {(ref) => (
            <div ref={ref}>
              <button type="button">Inside list</button>
            </div>
          )}
        </ScopedShortcut>
      </>,
    );
    press(screen.getByRole("button", { name: "Outside" }), { key: "j" });
    expect(onRun).not.toHaveBeenCalled();
    press(screen.getByRole("button", { name: "Inside list" }), { key: "j" });
    expect(onRun).toHaveBeenCalledTimes(1);
    cleanup();

    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Queue</DialogTitle>
          <DialogDescription>Work the queue.</DialogDescription>
          <ScopedShortcut onRun={onRun}>
            {(ref) => (
              <div ref={ref}>
                <button type="button">Inside dialog list</button>
              </div>
            )}
          </ScopedShortcut>
        </DialogContent>
      </Dialog>,
    );
    press(await screen.findByRole("button", { name: "Inside dialog list" }), {
      key: "j",
    });
    expect(onRun).toHaveBeenCalledTimes(2);
  });

  it("gives a region's shortcut the key over a page shortcut, whatever the mount order", () => {
    const onPage = vi.fn();
    const onRegion = vi.fn();
    function Region({ children }: { children?: ReactNode }) {
      const ref = useRef<HTMLDivElement>(null);
      useShortcut("mod+k", onRegion, { within: ref });
      return (
        <div ref={ref}>
          <button type="button">In region</button>
          {children}
        </div>
      );
    }
    // The page shortcut mounts last, so UI SDK alone would prefer it.
    render(
      <>
        <Region />
        <button type="button">On page</button>
        <Shortcut keys="mod+k" onRun={onPage} />
      </>,
    );
    press(screen.getByRole("button", { name: "In region" }), {
      key: "k",
      ctrlKey: true,
    });
    expect(onRegion).toHaveBeenCalledTimes(1);
    expect(onPage).not.toHaveBeenCalled();
    press(screen.getByRole("button", { name: "On page" }), {
      key: "k",
      ctrlKey: true,
    });
    expect(onPage).toHaveBeenCalledTimes(1);
    expect(onRegion).toHaveBeenCalledTimes(1);
  });

  it("matches a region's claim whatever order the modifiers are written in", () => {
    const onPage = vi.fn();
    const onRegion = vi.fn();
    function Region() {
      const ref = useRef<HTMLDivElement>(null);
      useShortcut("shift+mod+k", onRegion, { within: ref });
      return (
        <div ref={ref}>
          <button type="button">In region</button>
        </div>
      );
    }
    render(
      <>
        <Region />
        <Shortcut keys="mod+shift+k" onRun={onPage} />
      </>,
    );
    press(screen.getByRole("button", { name: "In region" }), {
      key: "K",
      ctrlKey: true,
      shiftKey: true,
    });
    expect(onRegion).toHaveBeenCalledTimes(1);
    expect(onPage).not.toHaveBeenCalled();
  });

  it("matches a region's claim whatever key names it uses: esc and escape, ctrl and mod", () => {
    const onPage = vi.fn();
    const onRegion = vi.fn();
    function Region() {
      const ref = useRef<HTMLDivElement>(null);
      useShortcut("ctrl+esc", onRegion, { within: ref });
      return (
        <div ref={ref}>
          <button type="button">In region</button>
        </div>
      );
    }
    render(
      <>
        <Region />
        <Shortcut keys="mod+escape" onRun={onPage} />
      </>,
    );
    press(screen.getByRole("button", { name: "In region" }), {
      key: "Escape",
      ctrlKey: true,
    });
    expect(onRegion).toHaveBeenCalledTimes(1);
    expect(onPage).not.toHaveBeenCalled();
  });

  it("repeats the shortcut UI SDK ran first even after an earlier one changes its description", () => {
    const first = vi.fn();
    const last = vi.fn();
    function Shortcuts({ label }: { label: string }) {
      return (
        <>
          <Shortcut
            keys="mod+j"
            onRun={first}
            options={{ repeat: true, description: label }}
          />
          <Shortcut keys="mod+j" onRun={last} options={{ repeat: true }} />
          <button type="button">Page action</button>
        </>
      );
    }
    const view = render(<Shortcuts label="Jump" />);
    // UI SDK registers the first shortcut again, so it now runs first.
    view.rerender(<Shortcuts label="Jump to next" />);
    const origin = screen.getByRole("button", { name: "Page action" });
    press(origin, { key: "j", ctrlKey: true });
    press(origin, { key: "j", ctrlKey: true, repeat: true });
    expect(first).toHaveBeenCalledTimes(2);
    expect(last).not.toHaveBeenCalled();
  });

  it("keeps a page shortcut running inside the one overlay it opens", async () => {
    const onRun = vi.fn();
    function Palette() {
      const input = useRef<HTMLInputElement>(null);
      useShortcut("mod+k", onRun, { overlay: input });
      return (
        <Dialog open>
          <DialogContent>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Find a page.</DialogDescription>
            <input ref={input} aria-label="Query" />
            <button type="button">Close search</button>
          </DialogContent>
        </Dialog>
      );
    }
    const view = render(<Palette />);
    press(await screen.findByRole("button", { name: "Close search" }), {
      key: "k",
      ctrlKey: true,
    });
    expect(onRun).toHaveBeenCalledTimes(1);

    // Another dialog still pauses it.
    view.rerender(
      <>
        <Shortcut
          keys="mod+k"
          onRun={onRun}
          options={{ overlay: () => null }}
        />
        <Dialog open>
          <DialogContent>
            <DialogTitle>Edit note</DialogTitle>
            <DialogDescription>Review before saving.</DialogDescription>
            <button type="button">Save note</button>
          </DialogContent>
        </Dialog>
      </>,
    );
    press(await screen.findByRole("button", { name: "Save note" }), {
      key: "k",
      ctrlKey: true,
    });
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it("runs in the text field of the overlay it opens, so the same keys close it", async () => {
    const onRun = vi.fn();
    function Palette() {
      const input = useRef<HTMLInputElement>(null);
      useShortcut("mod+k", onRun, { overlay: input });
      return (
        <>
          <Dialog open>
            <DialogContent>
              <DialogTitle>Search</DialogTitle>
              <DialogDescription>Find a page.</DialogDescription>
              <input ref={input} aria-label="Query" />
            </DialogContent>
          </Dialog>
        </>
      );
    }
    render(<Palette />);
    const query = await screen.findByRole("textbox", { name: "Query" });
    expect(press(query, { key: "k", ctrlKey: true }).defaultPrevented).toBe(
      true,
    );
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it("still leaves a page text field alone when the shortcut opens an overlay", () => {
    const onRun = vi.fn();
    function Page() {
      const input = useRef<HTMLInputElement>(null);
      useShortcut("mod+k", onRun, { overlay: input });
      return <input aria-label="Page note" />;
    }
    render(<Page />);
    expect(
      press(screen.getByRole("textbox", { name: "Page note" }), {
        key: "k",
        ctrlKey: true,
      }).defaultPrevented,
    ).toBe(false);
    expect(onRun).not.toHaveBeenCalled();
  });

  it("checks `when` on every press without swallowing the key", () => {
    const onRun = vi.fn();
    let enabled = false;
    render(
      <Shortcut keys="mod+s" onRun={onRun} options={{ when: () => enabled }}>
        <button type="button">Page action</button>
      </Shortcut>,
    );
    const origin = screen.getByRole("button", { name: "Page action" });
    expect(press(origin, { key: "s", ctrlKey: true }).defaultPrevented).toBe(
      false,
    );
    enabled = true;
    expect(press(origin, { key: "s", ctrlKey: true }).defaultPrevented).toBe(
      true,
    );
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it("registers nothing for null keys and unregisters on unmount", () => {
    const onRun = vi.fn();
    const view = render(
      <>
        <Shortcut keys={null} onRun={onRun} />
        <Shortcut keys="mod+k" onRun={onRun} />
      </>,
    );
    expect(listShortcuts().map((shortcut) => shortcut.keys)).toEqual(["mod+k"]);
    view.unmount();
    expect(listShortcuts()).toEqual([]);
    expect(press(null, { key: "k", ctrlKey: true }).defaultPrevented).toBe(
      false,
    );
    expect(onRun).not.toHaveBeenCalled();
  });

  it("lists the shortcuts that can run now, for a help surface", () => {
    render(
      <>
        <Shortcut
          keys="mod+k"
          onRun={() => {}}
          options={{ description: "Search pages" }}
        />
        <Shortcut
          keys="e"
          onRun={() => {}}
          options={{ description: "Resolve", when: () => false }}
        />
      </>,
    );
    expect(
      listShortcuts().map(({ keys, hint, ariaKeyshortcuts, description }) => ({
        keys,
        hint: plain(hint),
        ariaKeyshortcuts,
        description,
      })),
    ).toEqual([
      {
        keys: "mod+k",
        hint: "Ctrl+K",
        ariaKeyshortcuts: "Control+K",
        description: "Search pages",
      },
    ]);
  });
});
