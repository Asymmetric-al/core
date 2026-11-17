import { describe, expect, it } from "vitest";

import { SUPPORT_INBOX_KEYMAP } from "../../../../../../apps/admin/features/support-hub/lib/keymap";

describe("SUPPORT_INBOX_KEYMAP", () => {
  it("contains every action expected by the inbox shell", () => {
    const actions = SUPPORT_INBOX_KEYMAP.map((entry) => entry.action);
    for (const required of [
      "openCommandPalette",
      "nextConversation",
      "previousConversation",
      "resolveConversation",
      "openSnoozeMenu",
    ] as const) {
      expect(actions).toContain(required);
    }
  });

  it("binds each action to one distinct chord in shared shortcut form", () => {
    expect(
      Object.fromEntries(
        SUPPORT_INBOX_KEYMAP.map((entry) => [entry.action, entry.keys]),
      ),
    ).toEqual({
      openCommandPalette: "mod+k",
      nextConversation: "j",
      previousConversation: "k",
      resolveConversation: "e",
      openSnoozeMenu: "s",
    });
    const chords = SUPPORT_INBOX_KEYMAP.map((entry) => entry.keys);
    expect(new Set(chords).size).toBe(chords.length);
    for (const entry of SUPPORT_INBOX_KEYMAP) {
      expect(entry.label.length).toBeGreaterThan(0);
    }
  });

  it("leaves Escape to the open dialog or menu that owns it", () => {
    expect(SUPPORT_INBOX_KEYMAP.map((entry) => entry.keys)).not.toContain(
      "escape",
    );
  });
});
