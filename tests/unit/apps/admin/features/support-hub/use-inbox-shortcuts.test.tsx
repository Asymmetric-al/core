// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the inbox's public boundary.
import { InboxShortcutHints } from "../../../../../../apps/admin/features/support-hub/components/command/InboxShortcutHints";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the inbox's public boundary.
import {
  useInboxShortcuts,
  type SupportShortcutHandlers,
} from "../../../../../../apps/admin/features/support-hub/components/command/use-inbox-shortcuts";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the inbox's public boundary.
import { SUPPORT_INBOX_KEYMAP } from "../../../../../../apps/admin/features/support-hub/lib/keymap";
import { useShortcut } from "../../../../../../packages/ui/components/primitives/shortcut";

beforeEach(() => setPlatform("other"));
afterEach(() => {
  cleanup();
  setPlatform("other");
});

function Inbox({
  handlers,
  enabled,
  onGlobalSearch,
}: {
  handlers: SupportShortcutHandlers;
  enabled?: boolean;
  onGlobalSearch: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useInboxShortcuts({ containerRef: ref, handlers, enabled });
  // Mission Control's global search mounts in the shell; here it registers
  // after the inbox on purpose, the order UI SDK alone would let win.
  useShortcut("mod+k", onGlobalSearch);
  return (
    <>
      <button type="button">Shell control</button>
      <div ref={ref}>
        <button type="button">Conversation card</button>
        <input aria-label="Reply" />
      </div>
    </>
  );
}

/** A real key press goes to the focused element. */
function press(name: string, init: KeyboardEventInit, role = "button") {
  const target = screen.getByRole(role, { name });
  target.focus();
  return fireEvent.keyDown(target, init);
}

const handlers = () => ({
  openCommandPalette: vi.fn(),
  nextConversation: vi.fn(),
  previousConversation: vi.fn(),
  resolveConversation: vi.fn(),
  openSnoozeMenu: vi.fn(),
});

describe("useInboxShortcuts", () => {
  it("runs each inbox action from its key while the inbox owns focus", () => {
    const actions = handlers();
    render(<Inbox handlers={actions} onGlobalSearch={vi.fn()} />);
    for (const [key, action] of [
      ["j", "nextConversation"],
      ["k", "previousConversation"],
      ["e", "resolveConversation"],
      ["s", "openSnoozeMenu"],
    ] as const) {
      expect(press("Conversation card", { key })).toBe(false);
      expect(actions[action]).toHaveBeenCalledTimes(1);
    }
  });

  it("takes Ctrl+K inside the inbox and leaves it to the shell elsewhere", () => {
    const actions = handlers();
    const onGlobalSearch = vi.fn();
    render(<Inbox handlers={actions} onGlobalSearch={onGlobalSearch} />);
    press("Conversation card", { key: "k", ctrlKey: true });
    expect(actions.openCommandPalette).toHaveBeenCalledTimes(1);
    expect(onGlobalSearch).not.toHaveBeenCalled();

    press("Shell control", { key: "k", ctrlKey: true });
    expect(onGlobalSearch).toHaveBeenCalledTimes(1);
    expect(actions.openCommandPalette).toHaveBeenCalledTimes(1);
  });

  it("never treats typing, focus outside the inbox, or a disabled inbox as a shortcut", () => {
    const actions = handlers();
    const view = render(<Inbox handlers={actions} onGlobalSearch={vi.fn()} />);
    expect(press("Reply", { key: "j" }, "textbox")).toBe(true);
    expect(press("Shell control", { key: "j" })).toBe(true);
    view.rerender(
      <Inbox handlers={actions} enabled={false} onGlobalSearch={vi.fn()} />,
    );
    expect(press("Conversation card", { key: "j" })).toBe(true);
    expect(actions.nextConversation).not.toHaveBeenCalled();
  });

  it("leaves Escape to the palette or menu that is open, even with every action handled", () => {
    const every = Object.fromEntries(
      SUPPORT_INBOX_KEYMAP.map((entry) => [entry.action, vi.fn()]),
    ) as SupportShortcutHandlers;
    render(<Inbox handlers={every} onGlobalSearch={vi.fn()} />);
    expect(press("Conversation card", { key: "Escape" })).toBe(true);
    for (const handler of Object.values(every)) {
      expect(handler).not.toHaveBeenCalled();
    }
  });

  it("runs the inbox keys in the open conversation sheet, outside the inbox, but never its typing", () => {
    function InboxWithSheet({
      handlers,
    }: {
      handlers: SupportShortcutHandlers;
    }) {
      const ref = useRef<HTMLDivElement>(null);
      const sheetRef = useRef<HTMLDivElement>(null);
      useInboxShortcuts({ containerRef: ref, sheetRef, handlers });
      return (
        <>
          <div ref={ref}>
            <button type="button">Conversation card</button>
          </div>
          {/* A modal portaled to the end of the page, as the phone sheet is. */}
          <div ref={sheetRef} role="dialog" aria-label="Conversation">
            <button type="button">Assign</button>
            <textarea aria-label="Reply message" />
          </div>
          <div role="dialog" aria-label="Another dialog">
            <button type="button">Another control</button>
          </div>
        </>
      );
    }
    const actions = handlers();
    render(<InboxWithSheet handlers={actions} />);
    for (const [key, action] of [
      ["j", "nextConversation"],
      ["k", "previousConversation"],
      ["e", "resolveConversation"],
      ["s", "openSnoozeMenu"],
    ] as const) {
      expect(press("Assign", { key })).toBe(false);
      expect(actions[action]).toHaveBeenCalledTimes(1);
    }
    expect(press("Reply message", { key: "j" }, "textbox")).toBe(true);
    expect(press("Another control", { key: "j" })).toBe(true);
    expect(actions.nextConversation).toHaveBeenCalledTimes(1);
  });

  it("leaves a key alone when the inbox gives it no handler", () => {
    render(
      <Inbox
        handlers={{ nextConversation: vi.fn() }}
        onGlobalSearch={vi.fn()}
      />,
    );
    expect(press("Conversation card", { key: "e" })).toBe(true);
  });
});

describe("InboxShortcutHints", () => {
  it("lets a screen reader hear each action's keys", () => {
    render(<InboxShortcutHints />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent?.replace(/[⁦⁩]/g, ""))).toEqual(
      expect.arrayContaining([expect.stringContaining("Open command palette")]),
    );
    // The visual chord is hidden from assistive technology; the spoken keys are not.
    const palette = items.find((item) =>
      item.textContent?.includes("Open command palette"),
    )!;
    const spoken = [...palette.querySelectorAll("*")]
      .filter((element) => !element.closest('[aria-hidden="true"]'))
      .map((element) => element.textContent)
      .join(" ");
    expect(spoken).toContain("Control+K");
  });

  it("writes each chord the way the platform writes it", () => {
    const plain = (text: string | null) =>
      (text ?? "").replace(/[\u2066\u2069]/g, "");
    const chords = () =>
      [...document.querySelectorAll("kbd")].map((kbd) =>
        plain(kbd.textContent),
      );
    render(<InboxShortcutHints />);
    expect(chords()).toEqual(["Ctrl+K", "J", "K", "E", "S"]);
    cleanup();
    setPlatform("apple");
    render(<InboxShortcutHints />);
    expect(chords()).toEqual(["⌘K", "J", "K", "E", "S"]);
  });
});
