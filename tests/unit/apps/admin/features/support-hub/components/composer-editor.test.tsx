// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { checkPattern, setPlatform } from "@ui-sdk/core/testing";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the composer's public boundary.
import { ConversationComposer } from "../../../../../../../apps/admin/features/support-hub/components/detail/composer/ConversationComposer";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Fixtures use the app's public wire-format types.
import type {
  SupportAssignee,
  SupportCannedResponse,
  SupportConversation,
} from "../../../../../../../apps/admin/features/support-hub/types";
import type { Editor } from "@asym/ui/components/shadcn/rich-text-editor";

const state = vi.hoisted(() => ({
  responses: [] as SupportCannedResponse[],
  agents: [] as SupportAssignee[],
  pending: false,
  send: vi.fn(),
  log: vi.fn(),
  editor: null as Editor | null,
}));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({
    useSupportCannedResponses: () => ({ data: state.responses }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({ data: state.agents }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/activity-log",
  () => ({ logSupportActivity: state.log }),
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
        isPending: state.pending,
        pendingAction: state.pending ? "send" : null,
        isDirty: Boolean(drafts[mode]),
        send: state.send,
        saveDraft: vi.fn(),
        agent: null,
      };
    },
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/macros/MacroLauncher",
  async () => {
    const { useEditorContext } =
      await import("@asym/ui/components/shadcn/rich-text-editor");
    return {
      MacroLauncher: ({
        onCannedResponseInsert,
        disabled,
      }: {
        onCannedResponseInsert?: (input: {
          html: string;
          text: string;
        }) => void;
        disabled?: boolean;
      }) => {
        const { editor } = useEditorContext();
        React.useEffect(() => {
          state.editor = editor;
        }, [editor]);
        return (
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onCannedResponseInsert?.({
                html: "<p><strong>Canned answer</strong></p>",
                text: "Canned answer",
              })
            }
          >
            Insert macro response
          </button>
        );
      },
    };
  },
);

const conversation = {
  id: "conversation-1",
  externalContactName: "Maria",
  externalContactEmail: "maria@example.test",
} as SupportConversation;
const agent: SupportAssignee = {
  id: "agent-1",
  name: "Morgan",
  email: "morgan@example.test",
  title: null,
  avatarUrl: null,
};
const response = {
  id: "response-1",
  title: "Receipt",
  shortCode: "receipt",
  bodyHtml: "<p>Here is your receipt.</p>",
  bodyText: "Here is your receipt.",
} as SupportCannedResponse;

beforeEach(() => {
  vi.stubGlobal("ClipboardEvent", Event);
  state.responses = [];
  state.agents = [];
  state.pending = false;
  state.editor = null;
  state.send.mockClear();
  state.log.mockClear();
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new DOMRect(),
  });
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value: () => document.createElement("span").getClientRects(),
  });
});
afterEach(async () => {
  cleanup();
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function editorInstance() {
  await waitFor(() => expect(state.editor).not.toBeNull());
  return state.editor!;
}

/** The editor behind the named textbox, holding text and focused at its end. */
async function focusedEditorWith(name: string, html: string) {
  const textbox = await screen.findByRole("textbox", { name });
  await waitFor(() => expect(state.editor?.view.dom).toBe(textbox));
  const editor = state.editor!;
  await act(async () => {
    editor.commands.setContent(html);
    editor.commands.focus("end");
  });
  expect(editor.isEditable).toBe(true);
  expect(document.activeElement).toBe(textbox);
  return editor;
}

function hardBreaks(editor: Editor) {
  return JSON.stringify(editor.getJSON()).match(/"hardBreak"/g)?.length ?? 0;
}

describe("Support composer editor", () => {
  it("inserts macro content into the draft as rich text without replacing it", async () => {
    render(<ConversationComposer conversation={conversation} />);
    const editor = await editorInstance();
    await act(async () => {
      editor.commands.setContent("<p>My introduction.</p>");
      editor.commands.focus("end");
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Insert macro response" }),
    );
    expect(editor.getText()).toContain("My introduction.");
    expect(editor.getText()).toContain("Canned answer");
    expect(editor.getHTML()).toContain("<strong>Canned answer</strong>");
  });

  it("uses canned responses that load after the editor mounts", async () => {
    const view = render(<ConversationComposer conversation={conversation} />);
    const editor = await editorInstance();
    state.responses = [response];
    view.rerender(<ConversationComposer conversation={conversation} />);
    await act(async () => {
      editor.commands.insertContent("/receipt");
    });
    fireEvent.click(await screen.findByRole("option", { name: /Receipt/ }));
    expect(editor.getText()).toBe("Here is your receipt.");
  });

  it("switches to live mention suggestions in notes and preserves each mode's draft", async () => {
    const view = render(<ConversationComposer conversation={conversation} />);
    const editor = await editorInstance();
    await act(async () => {
      editor.commands.setContent("<p>A public reply.</p>");
    });
    state.agents = [agent];
    view.rerender(<ConversationComposer conversation={conversation} />);
    fireEvent.click(screen.getByRole("tab", { name: "Internal note" }));
    const noteEditor = await editorInstance();
    await act(async () => {
      noteEditor.commands.insertContent("@Mor");
    });
    fireEvent.click(await screen.findByRole("option", { name: /Morgan/ }));
    expect(noteEditor.getJSON().content?.[0]?.content?.[0]).toMatchObject({
      type: "mention",
      attrs: { id: agent.id, label: "Morgan" },
    });
    expect(state.log).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("tab", { name: "Reply" }));
    expect((await editorInstance()).getText()).toBe("A public reply.");
    fireEvent.click(screen.getByRole("tab", { name: "Internal note" }));
    expect((await editorInstance()).getText()).toContain("Morgan");
    expect(screen.queryByRole("button", { name: /attach/i })).toBeNull();
  });

  it("locks mode, insertion, and the send shortcut while sending", async () => {
    const view = render(<ConversationComposer conversation={conversation} />);
    const editor = await editorInstance();
    await act(async () => {
      editor.commands.setContent("<p>Ready to send.</p>");
    });
    state.pending = true;
    view.rerender(<ConversationComposer conversation={conversation} />);
    expect(editor.isEditable).toBe(false);
    expect(
      screen
        .getByRole("tab", { name: "Internal note" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Internal note" }));
    expect(
      screen.getByRole("tab", { name: "Reply" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Insert macro response" })
        .hasAttribute("disabled"),
    ).toBe(true);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Reply message" }), {
      key: "Enter",
      ctrlKey: true,
    });
    expect(state.send).not.toHaveBeenCalled();
  });

  it("focuses the composer and changes its empty prompt for internal notes", async () => {
    render(<ConversationComposer conversation={conversation} />);
    await editorInstance();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("textbox", { name: "Reply message" }),
      ),
    );
    // A pointer click (detail 1) moves on into the new editor.
    fireEvent.click(screen.getByRole("tab", { name: "Internal note" }), {
      detail: 1,
    });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("textbox", { name: "Internal note" }),
      ),
    );
    expect(
      document
        .querySelector("[data-placeholder]")
        ?.getAttribute("data-placeholder"),
    ).toBe("Write an internal note… Type @ to mention a teammate.");
  });

  it("names the composer and lets the Message type tabs control the editor panel", async () => {
    render(<ConversationComposer conversation={conversation} />);
    await editorInstance();
    const composer = screen.getByRole("group", {
      name: "Conversation composer",
    });
    const list = within(composer).getByRole("tablist", {
      name: "Message type",
    });
    const panel = within(composer).getByRole("tabpanel", { name: "Reply" });
    expect(
      within(list)
        .getByRole("tab", { name: "Reply" })
        .getAttribute("aria-controls"),
    ).toBe(panel.id);
    expect(
      within(panel).getByRole("textbox", { name: "Reply message" }),
    ).toBeTruthy();
    // The editor's own controls come first in the panel, so the panel is not
    // a second, invisible tab stop.
    expect(panel.getAttribute("tabindex")).toBe("-1");

    fireEvent.click(screen.getByRole("tab", { name: "Internal note" }));
    const notePanel = await screen.findByRole("tabpanel", {
      name: "Internal note",
    });
    expect(
      within(notePanel).getByRole("textbox", { name: "Internal note" }),
    ).toBeTruthy();
    expect(
      within(notePanel).getByRole("button", { name: "Add internal note" }),
    ).toBeTruthy();

    await act(async () => {
      await checkPattern(list.closest('[data-slot="tabs"]')!, "tabs");
    });
  });

  it("keeps focus on a tab chosen from the keyboard, and Show focuses the editor again", async () => {
    const view = render(<ConversationComposer conversation={conversation} />);
    await editorInstance();
    const noteTab = screen.getByRole("tab", { name: "Internal note" });
    noteTab.focus();
    // Enter or Space on a button clicks it with detail 0.
    fireEvent.click(noteTab, { detail: 0 });
    const noteEditor = await screen.findByRole("textbox", {
      name: "Internal note",
    });
    await act(async () => {});
    expect(document.activeElement).toBe(noteTab);

    view.rerender(
      <ConversationComposer conversation={conversation} active={false} />,
    );
    view.rerender(<ConversationComposer conversation={conversation} />);
    await waitFor(() => expect(document.activeElement).toBe(noteEditor));
  });

  it.each([
    ["Bold", "bold"],
    ["Italic", "italic"],
    ["Underline", "underline"],
    ["Bullet list", "bulletList"],
    ["Numbered list", "orderedList"],
    ["Quote", "blockquote"],
  ])("toggles %s and its active state", async (label, name) => {
    render(<ConversationComposer conversation={conversation} />);
    const editor = await editorInstance();
    await act(async () => {
      editor.commands.setContent("<p>A response.</p>");
      editor.commands.setTextSelection({ from: 1, to: 12 });
    });
    const control = screen.getByRole("button", { name: label, exact: true });
    fireEvent.click(control);
    expect(editor.isActive(name)).toBe(true);
    expect(control.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(control);
    expect(editor.isActive(name)).toBe(false);
    expect(control.getAttribute("aria-pressed")).toBe("false");
  });

  it("inserts plain-text canned responses without interpreting markup", async () => {
    state.responses = [
      {
        ...response,
        bodyHtml: null,
        bodyText: "Use <receipt> & keep this text.",
      },
    ];
    render(<ConversationComposer conversation={conversation} />);
    const editor = await editorInstance();
    await act(async () => {
      editor.commands.insertContent("/receipt");
    });
    fireEvent.click(await screen.findByRole("option", { name: /Receipt/ }));
    expect(editor.getText()).toBe("Use <receipt> & keep this text.");
  });

  it("adds, edits and removes a link without losing the selected text", async () => {
    render(<ConversationComposer conversation={conversation} />);
    const editor = await editorInstance();
    await act(async () => {
      editor.commands.setContent("<p>Our website</p>");
      editor.commands.setTextSelection({ from: 1, to: 12 });
    });
    fireEvent.click(screen.getByRole("button", { name: "Add link" }));
    fireEvent.change(await screen.findByRole("textbox", { name: "Link URL" }), {
      target: { value: "example.org" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save link" }));
    await waitFor(() =>
      expect(editor.getHTML()).toContain('href="https://example.org/"'),
    );
    expect(editor.getText()).toBe("Our website");
    fireEvent.click(
      within(
        screen.getByRole("toolbar", { name: "Text formatting" }),
      ).getByRole("button", { name: "Edit link" }),
    );
    fireEvent.change(await screen.findByRole("textbox", { name: "Link URL" }), {
      target: { value: "https://example.org/help" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save link" }));
    await waitFor(() =>
      expect(editor.getHTML()).toContain('href="https://example.org/help"'),
    );
    fireEvent.click(
      within(
        screen.getByRole("toolbar", { name: "Text formatting" }),
      ).getByRole("button", { name: "Edit link" }),
    );
    const linkInput = await screen.findByRole("textbox", { name: "Link URL" });
    const linkForm = linkInput.closest("form");
    if (!linkForm) {
      throw new Error("Link editor form is missing");
    }
    fireEvent.click(
      within(linkForm).getByRole("button", { name: "Remove link" }),
    );
    await waitFor(() => expect(editor.isActive("link")).toBe(false));
    expect(editor.getText()).toBe("Our website");
  });

  it("keeps pasted headings and lists and supports the bold shortcut", async () => {
    render(<ConversationComposer conversation={conversation} />);
    const editor = await editorInstance();
    await act(async () => {
      editor.view.pasteHTML(
        "<h2>Next steps</h2><ul><li>Read the receipt</li></ul>",
      );
    });
    expect(editor.getHTML()).toContain("<h2>Next steps</h2>");
    expect(editor.getHTML()).toContain("<li>");
    await act(async () => {
      editor.commands.setContent("<p>A response.</p>");
      editor.commands.setTextSelection({ from: 1, to: 12 });
    });
    fireEvent.keyDown(editor.view.dom, {
      key: "b",
      code: "KeyB",
      ctrlKey: true,
    });
    expect(editor.isActive("bold")).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Bold", exact: true })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
});

// Cmd+Enter on a Mac: composer-send-shortcut-apple.test.tsx.
describe("Support composer send shortcut", () => {
  beforeEach(() => setPlatform("other"));

  it.each([
    { tab: "Reply", textbox: "Reply message" },
    { tab: "Internal note", textbox: "Internal note" },
  ])(
    "sends once from the $textbox editor with Ctrl+Enter, adding no line break",
    async ({ tab, textbox }) => {
      render(<ConversationComposer conversation={conversation} />);
      if (tab !== "Reply") {
        fireEvent.click(screen.getByRole("tab", { name: tab }), { detail: 1 });
      }
      const editor = await focusedEditorWith(textbox, "<p>Ready to send.</p>");

      const notTaken = fireEvent.keyDown(editor.view.dom, {
        key: "Enter",
        code: "Enter",
        ctrlKey: true,
      });

      expect(state.send).toHaveBeenCalledTimes(1);
      expect(notTaken).toBe(false);
      expect(hardBreaks(editor)).toBe(0);
      expect(editor.getText()).toBe("Ready to send.");
    },
  );

  it("keeps Shift+Enter as a line break and Enter as a new paragraph", async () => {
    render(<ConversationComposer conversation={conversation} />);
    const editor = await focusedEditorWith(
      "Reply message",
      "<p>First line</p>",
    );

    fireEvent.keyDown(editor.view.dom, {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
    });
    expect(hardBreaks(editor)).toBe(1);

    fireEvent.keyDown(editor.view.dom, { key: "Enter", code: "Enter" });
    expect(editor.getJSON().content).toHaveLength(2);
    expect(state.send).not.toHaveBeenCalled();
  });

  it("lets an open canned-response list take Ctrl+Enter to insert its item, without sending", async () => {
    state.responses = [response];
    render(<ConversationComposer conversation={conversation} />);
    const editor = await focusedEditorWith("Reply message", "<p></p>");
    await act(async () => {
      editor.commands.insertContent("/receipt");
    });
    await screen.findByRole("option", { name: /Receipt/ });

    fireEvent.keyDown(editor.view.dom, {
      key: "Enter",
      code: "Enter",
      ctrlKey: true,
    });

    expect(state.send).not.toHaveBeenCalled();
    expect(editor.getText()).toBe("Here is your receipt.");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });

  it("lets an open mention list take Ctrl+Enter to insert the mention, without sending", async () => {
    state.agents = [agent];
    render(<ConversationComposer conversation={conversation} />);
    fireEvent.click(screen.getByRole("tab", { name: "Internal note" }), {
      detail: 1,
    });
    const editor = await focusedEditorWith("Internal note", "<p></p>");
    await act(async () => {
      editor.commands.insertContent("@Mor");
    });
    await screen.findByRole("option", { name: /Morgan/ });

    fireEvent.keyDown(editor.view.dom, {
      key: "Enter",
      code: "Enter",
      ctrlKey: true,
    });

    expect(state.send).not.toHaveBeenCalled();
    expect(editor.getJSON().content?.[0]?.content?.[0]).toMatchObject({
      type: "mention",
      attrs: { id: agent.id, label: "Morgan" },
    });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });
});
