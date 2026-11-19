/** @vitest-environment jsdom */

import { afterEach, describe, expect, it } from "vitest";

import {
  SHORTCUT_HELP_ATTRIBUTE,
  isPressInShortcutHelp,
} from "../../../../../../packages/ui/components/primitives/shortcut-help-layer";

/** A dialog portal as Core's DialogContent renders it: backdrop, then popup. */
function dialogPortal({ help }: { help: boolean }) {
  const portal = document.createElement("div");
  portal.setAttribute("data-slot", "dialog-portal");
  const backdrop = document.createElement("div");
  backdrop.setAttribute("data-slot", "dialog-overlay");
  const popup = document.createElement("div");
  popup.setAttribute("data-slot", "dialog-content");
  if (help) popup.setAttribute(SHORTCUT_HELP_ATTRIBUTE, "");
  const close = document.createElement("button");
  popup.append(close);
  portal.append(backdrop, popup);
  document.body.append(portal);
  return { backdrop, popup, close };
}

const pressOn = (target: Element) => {
  const event = new MouseEvent("pointerdown", { bubbles: true });
  Object.defineProperty(event, "target", { value: target });
  return event;
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("isPressInShortcutHelp", () => {
  it("counts an outside press on the help's popup, a control in it or its backdrop", () => {
    const { backdrop, popup, close } = dialogPortal({ help: true });
    for (const target of [popup, close, backdrop])
      expect(
        isPressInShortcutHelp({
          reason: "outside-press",
          event: pressOn(target),
        }),
      ).toBe(true);
  });

  it("does not count a press in another dialog or on the page", () => {
    const other = dialogPortal({ help: false });
    const page = document.createElement("button");
    document.body.append(page);
    for (const target of [other.popup, other.backdrop, page])
      expect(
        isPressInShortcutHelp({
          reason: "outside-press",
          event: pressOn(target),
        }),
      ).toBe(false);
  });

  it("leaves every other reason to close alone", () => {
    const { popup } = dialogPortal({ help: true });
    for (const reason of ["escape-key", "focus-out", "trigger-press"])
      expect(isPressInShortcutHelp({ reason, event: pressOn(popup) })).toBe(
        false,
      );
    expect(isPressInShortcutHelp({ reason: "outside-press" })).toBe(false);
  });
});
