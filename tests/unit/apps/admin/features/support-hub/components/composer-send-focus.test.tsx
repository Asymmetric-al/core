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
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the composer's public boundary.
import { ConversationComposer } from "../../../../../../../apps/admin/features/support-hub/components/detail/composer/ConversationComposer";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) The composer reports failed sends through this provider, as in the inbox.
import { SupportFailureRecoveryProvider } from "../../../../../../../apps/admin/features/support-hub/hooks/use-support-failure-recovery";
import { getQueryClient } from "../../../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../../../packages/database/providers/query-provider";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Fixtures use the app's public wire-format types.
import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";
import type { Editor } from "@asym/ui/components/shadcn/rich-text-editor";

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({ useSupportCannedResponses: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportAgents: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversation",
  () => ({ useSupportConversation: () => ({ data: undefined }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => "agent-1" }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/activity-log",
  () => ({ logSupportActivity: vi.fn() }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/macros/MacroLauncher",
  () => ({ MacroLauncher: () => null }),
);
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const conversation = {
  id: "conversation-1",
  externalContactName: "Maria",
  externalContactEmail: "maria@example.test",
} as SupportConversation;

/**
 * jsdom keeps focus on an element that stops being focusable; a browser
 * drops it to <body>. Records each drop so a test can say it never happened.
 */
function dropFocusLikeABrowser() {
  const drops: string[] = [];
  const observer = new MutationObserver(() => {
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || focused === document.body) return;
    const unfocusable =
      focused.matches(":disabled") ||
      (focused.getAttribute("contenteditable") === "false" &&
        !focused.hasAttribute("tabindex"));
    if (!unfocusable) return;
    drops.push(
      focused.getAttribute("aria-label") ?? focused.textContent ?? "element",
    );
    document.body.tabIndex = -1;
    document.body.focus();
    document.body.removeAttribute("tabindex");
  });
  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled", "contenteditable"],
  });
  return { drops, stop: () => observer.disconnect() };
}

function holdRequests() {
  let finish: ((response: Response) => void) | undefined;
  const fetchMock = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return {
    fetchMock,
    respond: (status: number, body: unknown) =>
      act(async () =>
        finish?.(
          new Response(JSON.stringify(body), {
            status,
            headers: { "content-type": "application/json" },
          }),
        ),
      ),
  };
}

function renderComposer() {
  return render(
    <QueryProvider>
      <SupportFailureRecoveryProvider>
        <ConversationComposer conversation={conversation} />
        <button type="button">Next conversation</button>
      </SupportFailureRecoveryProvider>
    </QueryProvider>,
  );
}

/** Tiptap moves focus a frame after it is asked to. */
const nextFrame = () =>
  act(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );

/** The editor behind the named textbox, holding text and focused at its end. */
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
  await nextFrame();
  return { textbox, editor };
}

let browserFocus: ReturnType<typeof dropFocusLikeABrowser> | null = null;

beforeEach(() => {
  setPlatform("other");
  getQueryClient().clear();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
  vi.mocked(toast.info).mockClear();
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new DOMRect(),
  });
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value: () => document.createElement("span").getClientRects(),
  });
});
afterEach(() => {
  browserFocus?.stop();
  browserFocus = null;
  cleanup();
  getQueryClient().clear();
  vi.unstubAllGlobals();
});

const modes = [
  {
    tab: "Reply",
    textbox: "Reply message",
    send: "Send reply to donor",
    sending: "Sending reply to donor",
    done: "Reply sent.",
  },
  {
    tab: "Internal note",
    textbox: "Internal note",
    send: "Add internal note",
    sending: "Saving internal note",
    done: "Internal note added.",
  },
] as const;
const triggers = ["Ctrl+Enter", "the Send button"] as const;
const cases = modes.flatMap((mode) =>
  triggers.flatMap((trigger) =>
    (["success", "failure"] as const).map((outcome) => ({
      ...mode,
      trigger,
      outcome,
    })),
  ),
);

/** Opens the mode's editor with a draft and starts a held send from it. */
async function startSend(
  mode: (typeof modes)[number],
  trigger: (typeof triggers)[number],
) {
  const requests = holdRequests();
  renderComposer();
  if (mode.tab !== "Reply") {
    fireEvent.click(screen.getByRole("tab", { name: mode.tab }), {
      detail: 1,
    });
  }
  const { textbox, editor } = await focusedEditorWith(
    mode.textbox,
    "<p>Thanks for your gift.</p>",
  );
  const send = screen.getByRole("button", { name: mode.send, exact: true });
  await waitFor(() => expect(send.hasAttribute("disabled")).toBe(false));
  browserFocus = dropFocusLikeABrowser();

  if (trigger === "Ctrl+Enter") {
    fireEvent.keyDown(editor.view.dom, {
      key: "Enter",
      code: "Enter",
      ctrlKey: true,
    });
  } else {
    send.focus();
    fireEvent.click(send);
  }

  await waitFor(() => expect(requests.fetchMock).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: mode.sending, exact: true }),
    ).toBe(send),
  );
  // The editor is read-only for the whole send.
  await waitFor(() => expect(editor.isEditable).toBe(false));
  await act(async () => undefined);
  return { requests, textbox, editor, send, focus: browserFocus };
}

describe("Support composer focus through a send", () => {
  it.each(cases)(
    "$tab by $trigger keeps focus in the composer and returns it to the editor after $outcome",
    async (testCase) => {
      const { requests, textbox, editor, send, focus } = await startSend(
        testCase,
        testCase.trigger,
      );
      const composer = screen.getByRole("group", {
        name: "Conversation composer",
      });

      // Pending: focus waits on the busy Send it pressed, or on the composer
      // when the shortcut came from the now read-only editor.
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(
        testCase.trigger === "Ctrl+Enter" ? composer : send,
      );

      if (testCase.outcome === "success") {
        await requests.respond(200, { message: { id: "message-1" } });
        await waitFor(() =>
          expect(toast.success).toHaveBeenCalledWith(testCase.done),
        );
        await waitFor(() => expect(editor.getText()).toBe(""));
      } else {
        await requests.respond(502, { error: "Mail server unavailable." });
        await waitFor(() =>
          expect(toast.error).toHaveBeenCalledWith("Mail server unavailable."),
        );
        expect(editor.getText()).toBe("Thanks for your gift.");
      }

      // Ready for the next message (or to fix and resend the kept draft).
      await waitFor(() => expect(document.activeElement).toBe(textbox));
      expect(editor.isEditable).toBe(true);
      expect(focus.drops).toEqual([]);
    },
  );

  it("returns focus to the editor after a saved draft", async () => {
    const requests = holdRequests();
    renderComposer();
    const { textbox, editor } = await focusedEditorWith(
      "Reply message",
      "<p>Half a reply.</p>",
    );
    const draft = screen.getByRole("button", { name: "Save draft" });
    browserFocus = dropFocusLikeABrowser();
    draft.focus();
    fireEvent.click(draft);
    await waitFor(() => expect(draft.getAttribute("aria-busy")).toBe("true"));
    await waitFor(() => expect(editor.isEditable).toBe(false));
    await act(async () => undefined);
    expect(document.activeElement).toBe(draft);

    await requests.respond(200, { message: { id: "draft-1" } });
    await waitFor(() => expect(editor.getText()).toBe(""));
    await waitFor(() => expect(document.activeElement).toBe(textbox));
    expect(browserFocus.drops).toEqual([]);
  });

  it("leaves focus the agent moved out of the composer during the send", async () => {
    const { requests, editor } = await startSend(modes[0], "Ctrl+Enter");
    const elsewhere = screen.getByRole("button", { name: "Next conversation" });
    elsewhere.focus();

    await requests.respond(200, { message: { id: "message-1" } });
    await waitFor(() => expect(editor.isEditable).toBe(true));
    await nextFrame();
    expect(document.activeElement).toBe(elsewhere);
  });

  it("does not take focus for a send started outside the composer", async () => {
    const requests = holdRequests();
    renderComposer();
    const { editor } = await focusedEditorWith(
      "Reply message",
      "<p>Thanks for your gift.</p>",
    );
    const send = screen.getByRole("button", {
      name: "Send reply to donor",
      exact: true,
    });
    const elsewhere = screen.getByRole("button", { name: "Next conversation" });
    elsewhere.focus();
    // A pointer press that does not move focus (Safari) starts the send.
    fireEvent.click(send);
    await waitFor(() => expect(editor.isEditable).toBe(false));

    await requests.respond(200, { message: { id: "message-1" } });
    await waitFor(() => expect(editor.isEditable).toBe(true));
    await nextFrame();
    expect(document.activeElement).toBe(elsewhere);
  });
});
