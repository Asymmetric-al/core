import { describe, expect, it } from "vitest";

import {
  findSupportShortcut,
  SUPPORT_INBOX_KEYMAP,
} from "../../../../../../apps/admin/features/support-hub/lib/keymap";

function buildEvent(init: Partial<KeyboardEventInit> & { key: string }) {
  return {
    key: init.key,
    metaKey: init.metaKey ?? false,
    ctrlKey: init.ctrlKey ?? false,
    shiftKey: init.shiftKey ?? false,
    altKey: init.altKey ?? false,
  };
}

describe("SUPPORT_INBOX_KEYMAP", () => {
  it("contains every action expected by the inbox shell", () => {
    const actions = SUPPORT_INBOX_KEYMAP.map((entry) => entry.action);
    for (const required of [
      "openCommandPalette",
      "nextConversation",
      "previousConversation",
      "resolveConversation",
      "openSnoozeMenu",
      "closeOverlay",
    ] as const) {
      expect(actions).toContain(required);
    }
  });
});

describe("findSupportShortcut", () => {
  it("matches Cmd+K to openCommandPalette", () => {
    const entry = findSupportShortcut(buildEvent({ key: "k", metaKey: true }));
    expect(entry?.action).toBe("openCommandPalette");
  });

  it("matches plain `j` to nextConversation", () => {
    const entry = findSupportShortcut(buildEvent({ key: "j" }));
    expect(entry?.action).toBe("nextConversation");
  });

  it("matches plain `k` to previousConversation (no modifier)", () => {
    const entry = findSupportShortcut(buildEvent({ key: "k" }));
    expect(entry?.action).toBe("previousConversation");
  });

  it("returns null for unknown chords", () => {
    const entry = findSupportShortcut(buildEvent({ key: "z" }));
    expect(entry).toBeNull();
  });
});
