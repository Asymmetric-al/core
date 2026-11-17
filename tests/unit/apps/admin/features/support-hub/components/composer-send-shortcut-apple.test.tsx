// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the composer's public boundary.
import { ConversationComposer } from "../../../../../../../apps/admin/features/support-hub/components/detail/composer/ConversationComposer";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Fixtures use the app's public wire-format types.
import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";
import type { Editor } from "@asym/ui/components/shadcn/rich-text-editor";

// ProseMirror reads the platform once at import, so Mod means Meta (Cmd)
// only when the page is a Mac before the editor modules load.
const state = vi.hoisted(() => {
  Object.defineProperty(window.navigator, "platform", {
    configurable: true,
    value: "MacIntel",
  });
  return { send: vi.fn() };
});

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({ useSupportCannedResponses: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportAgents: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/activity-log",
  () => ({ logSupportActivity: vi.fn() }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/macros/MacroLauncher",
  () => ({ MacroLauncher: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/composer/use-conversation-composer",
  () => ({
    useConversationComposer: () => {
      const [mode, setMode] = React.useState<"reply" | "note">("reply");
      const [drafts, setDrafts] = React.useState({ reply: "", note: "" });
      return {
        mode,
        setMode,
        value: drafts[mode],
        setValue: (value: string) =>
          setDrafts((previous) => ({ ...previous, [mode]: value })),
        attachments: [],
        addAttachment: vi.fn(),
        removeAttachment: vi.fn(),
        appendSignature: false,
        setAppendSignature: vi.fn(),
        isPending: false,
        pendingAction: null,
        isDirty: Boolean(drafts[mode]),
        send: state.send,
        saveDraft: vi.fn(),
        agent: null,
      };
    },
  }),
);

const conversation = {
  id: "conversation-1",
  externalContactName: "Maria",
  externalContactEmail: "maria@example.test",
} as SupportConversation;

beforeEach(() => {
  setPlatform("apple");
  state.send.mockClear();
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new DOMRect(),
  });
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value: () => document.createElement("span").getClientRects(),
  });
});
afterEach(() => cleanup());

async function focusedEditorWith(name: string, html: string) {
  const textbox = await screen.findByRole("textbox", { name });
  // Tiptap keeps its editor on the editor element for tests.
  const editor = (textbox as HTMLElement & { editor?: Editor }).editor;
  if (!editor) throw new Error(`No editor behind ${name}`);
  await act(async () => {
    editor.commands.setContent(html);
    editor.commands.focus("end");
  });
  await waitFor(() => expect(document.activeElement).toBe(textbox));
  expect(editor.isEditable).toBe(true);
  return editor;
}

describe("Support composer send shortcut on a Mac", () => {
  it.each([
    { tab: "Reply", textbox: "Reply message" },
    { tab: "Internal note", textbox: "Internal note" },
  ])(
    "sends once from the $textbox editor with Cmd+Enter, adding no line break",
    async ({ tab, textbox }) => {
      render(<ConversationComposer conversation={conversation} />);
      if (tab !== "Reply") {
        fireEvent.click(screen.getByRole("tab", { name: tab }), { detail: 1 });
      }
      const editor = await focusedEditorWith(textbox, "<p>Ready to send.</p>");

      const notTaken = fireEvent.keyDown(editor.view.dom, {
        key: "Enter",
        code: "Enter",
        metaKey: true,
      });

      expect(state.send).toHaveBeenCalledTimes(1);
      expect(notTaken).toBe(false);
      expect(JSON.stringify(editor.getJSON())).not.toContain('"hardBreak"');
      expect(editor.getText()).toBe("Ready to send.");
    },
  );

  it("keeps Shift+Enter as a line break", async () => {
    render(<ConversationComposer conversation={conversation} />);
    const editor = await focusedEditorWith("Reply message", "<p>A line</p>");

    fireEvent.keyDown(editor.view.dom, {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
    });

    expect(JSON.stringify(editor.getJSON())).toContain('"hardBreak"');
    expect(state.send).not.toHaveBeenCalled();
  });
});
