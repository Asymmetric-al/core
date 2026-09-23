// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getQueryClient } from "../../../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../../../packages/database/providers/query-provider";

const loadComposerModules = async () => ({
  actions:
    await import("../../../../../../../apps/admin/features/support-hub/components/detail/composer/ComposerActions"),
  composer:
    await import("../../../../../../../apps/admin/features/support-hub/components/detail/composer/use-conversation-composer"),
  recovery:
    await import("../../../../../../../apps/admin/features/support-hub/hooks/use-support-failure-recovery"),
});
type ComposerModules = Awaited<ReturnType<typeof loadComposerModules>>;
let ComposerActions: ComposerModules["actions"]["ComposerActions"];
let useConversationComposer: ComposerModules["composer"]["useConversationComposer"];
let SupportFailureRecoveryProvider: ComposerModules["recovery"]["SupportFailureRecoveryProvider"];

beforeAll(async () => {
  const { actions, composer, recovery } = await loadComposerModules();
  ComposerActions = actions.ComposerActions;
  useConversationComposer = composer.useConversationComposer;
  SupportFailureRecoveryProvider = recovery.SupportFailureRecoveryProvider;
});

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({
    useCurrentSupportAgentId: () => "agent-1",
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversation",
  () => ({
    useSupportConversation: () => ({ data: undefined }),
  }),
);
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

beforeEach(() => getQueryClient().clear());
afterEach(() => {
  cleanup();
  getQueryClient().clear();
  vi.unstubAllGlobals();
});

describe("ComposerActions a11y / mode switch", () => {
  it("uses the Reply send label when mode is 'reply'", () => {
    render(
      <ComposerActions
        mode="reply"
        isPending={false}
        pendingAction={null}
        isDirty
        onSend={() => undefined}
        onSaveDraft={() => undefined}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Send reply to donor/i }),
    ).toBeTruthy();
    // Reply mode also exposes Save draft.
    expect(screen.getByRole("button", { name: /Save draft/i })).toBeTruthy();
  });

  it("uses the Note send label when mode is 'note'", () => {
    render(
      <ComposerActions
        mode="note"
        isPending={false}
        pendingAction={null}
        isDirty
        onSend={() => undefined}
        onSaveDraft={() => undefined}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Add internal note/i }),
    ).toBeTruthy();
    // Note mode does NOT show the Save draft button.
    expect(screen.queryByRole("button", { name: /Save draft/i })).toBeNull();
  });

  it("disables + announces busy when isPending is true", () => {
    const onSend = vi.fn();
    render(
      <ComposerActions
        mode="reply"
        isPending
        pendingAction="send"
        isDirty
        onSend={onSend}
        onSaveDraft={() => undefined}
      />,
    );
    const sendButton = screen.getByRole("button", {
      name: /Sending reply to donor/i,
    });
    expect(sendButton.getAttribute("aria-busy")).toBe("true");
    expect((sendButton as HTMLButtonElement).disabled).toBe(false);
    expect(sendButton.getAttribute("aria-disabled")).toBe("true");
    const draft = screen.getByRole("button", { name: "Save draft" });
    expect(draft.hasAttribute("disabled")).toBe(true);
    expect(draft.hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(sendButton);
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables Send when the body is empty", () => {
    render(
      <ComposerActions
        mode="reply"
        isPending={false}
        pendingAction={null}
        isDirty={false}
        onSend={() => undefined}
        onSaveDraft={() => undefined}
      />,
    );
    const sendButton = screen.getByRole("button", {
      name: /Send reply to donor/i,
    });
    expect((sendButton as HTMLButtonElement).disabled).toBe(true);
  });
});

function ComposerHarness() {
  const composer = useConversationComposer({
    conversationId: "conversation-1",
    agentId: "agent-1",
  });
  return (
    <>
      <button type="button" onClick={() => composer.setMode("note")}>
        Use internal note
      </button>
      <label htmlFor="composer-body">Composer body</label>
      <input
        id="composer-body"
        value={composer.value}
        onChange={(event) => composer.setValue(event.target.value)}
        disabled={composer.isPending}
      />
      <ComposerActions
        mode={composer.mode}
        isPending={composer.isPending}
        pendingAction={composer.pendingAction}
        isDirty={composer.isDirty}
        onSend={composer.send}
        onSaveDraft={composer.saveDraft}
        onCancel={composer.reset}
      />
    </>
  );
}

const bodyJson = JSON.stringify({
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "A held response" }] },
  ],
});

describe("Composer initiating action through the real mutation hooks", () => {
  it.each([
    {
      mode: "reply",
      initial: "Send reply to donor",
      pending: "Sending reply to donor",
      peer: "Save draft",
      mutationMode: "send",
      endpoint: "replies",
    },
    {
      mode: "reply",
      initial: "Save draft",
      pending: "Saving draft",
      peer: "Send reply to donor",
      mutationMode: "draft",
      endpoint: "replies",
    },
    {
      mode: "note",
      initial: "Add internal note",
      pending: "Saving internal note",
      peer: null,
      mutationMode: null,
      endpoint: "notes",
    },
  ])(
    "keeps only $initial focusable and preserves its payload/reset",
    async ({ mode, initial, pending, peer, mutationMode, endpoint }) => {
      let finish: ((response: Response) => void) | undefined;
      const held = new Promise<Response>((resolve) => {
        finish = resolve;
      });
      const fetchMock = vi.fn(
        (_input: RequestInfo | URL, _init?: RequestInit) => held,
      );
      vi.stubGlobal("fetch", fetchMock);
      render(
        <QueryProvider>
          <SupportFailureRecoveryProvider>
            <ComposerHarness />
          </SupportFailureRecoveryProvider>
        </QueryProvider>,
      );
      if (mode === "note")
        fireEvent.click(
          screen.getByRole("button", { name: "Use internal note" }),
        );
      const body = screen.getByRole("textbox", { name: "Composer body" });
      fireEvent.change(body, { target: { value: bodyJson } });
      const initiator = screen.getByRole("button", {
        name: initial,
        exact: true,
      });
      initiator.focus();
      fireEvent.click(initiator);
      await waitFor(() =>
        expect(initiator.getAttribute("aria-disabled")).toBe("true"),
      );
      expect(screen.getByRole("button", { name: pending, exact: true })).toBe(
        initiator,
      );
      expect(initiator.hasAttribute("disabled")).toBe(false);
      expect(initiator.getAttribute("aria-busy")).toBe("true");
      expect(document.activeElement).toBe(initiator);
      expect(body.hasAttribute("disabled")).toBe(true);
      const cancel = screen.getByRole("button", { name: "Cancel" });
      expect(cancel.hasAttribute("disabled")).toBe(true);
      fireEvent.click(cancel);
      if (peer) {
        const sibling = screen.getByRole("button", { name: peer, exact: true });
        expect(sibling.hasAttribute("disabled")).toBe(true);
        expect(sibling.hasAttribute("aria-disabled")).toBe(false);
        expect(sibling.getAttribute("aria-busy")).not.toBe("true");
        fireEvent.click(sibling);
      }
      fireEvent.click(initiator);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, request] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe(
        `/api/admin/support/conversations/conversation-1/${endpoint}`,
      );
      expect(request?.method).toBe("POST");
      const payload = JSON.parse(String(request?.body));
      expect(payload).toMatchObject({
        conversationId: "conversation-1",
        authorAgentId: "agent-1",
      });
      if (mutationMode)
        expect(payload).toMatchObject({
          mode: mutationMode,
          payload: {
            json: JSON.parse(bodyJson),
            text: "A held response",
            attachments: [],
          },
        });
      else
        expect(payload).toMatchObject({
          bodyText: "A held response",
          bodyHtml: "<p>A held response</p>",
        });
      expect((body as HTMLInputElement).value).toBe(bodyJson);
      await act(async () =>
        finish?.(
          new Response(JSON.stringify({ message: { id: "message-1" } }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        ),
      );
      await waitFor(() => expect((body as HTMLInputElement).value).toBe(""));
      expect(body.hasAttribute("disabled")).toBe(false);
      expect(initiator.hasAttribute("disabled")).toBe(true);
    },
  );
});
