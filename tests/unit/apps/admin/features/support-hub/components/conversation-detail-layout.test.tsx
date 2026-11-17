// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { checkPattern } from "@ui-sdk/core/testing";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the conversation pane's public UI boundary.
import { ConversationDetail } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationDetail";

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversation",
  () => ({
    useSupportConversation: () => ({
      data: { id: "c-1", subject: "Receipt for my March gift", assignee: null },
      isLoading: false,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/use-focus-return",
  () => ({ useFocusReturn: () => {} }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationHeader",
  () => ({
    ConversationHeader: ({ onClose }: { onClose: () => void }) => (
      <button type="button" onClick={onClose}>
        Close conversation
      </button>
    ),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationTimeline",
  () => ({ ConversationTimeline: () => <p>Thread messages</p> }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/composer/ConversationComposer",
  () => ({
    ConversationComposer: ({ initialMode }: { initialMode?: string }) => (
      <div data-testid="composer">Composer in {initialMode} mode</div>
    ),
  }),
);

afterEach(cleanup);

describe("ConversationDetail layouts", () => {
  it("shows the thread first on phones, with Reply and Internal note opening the composer", () => {
    render(
      <ConversationDetail
        conversationId="c-1"
        onClose={vi.fn()}
        layout="sheet"
      />,
    );
    const dialog = screen.getByRole("dialog", {
      name: "Receipt for my March gift",
    });
    expect(dialog).toBeTruthy();
    expect(screen.getByText("Thread messages")).toBeTruthy();
    expect(screen.queryByTestId("composer")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Internal note" }));
    expect(screen.getByTestId("composer").textContent).toContain("note mode");

    fireEvent.click(screen.getByRole("button", { name: "Hide composer" }));
    expect(screen.getByTestId("composer").closest("[hidden]")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Show composer" })).toBeTruthy();
  });

  it("puts focus on the thread when the phone sheet opens, not on a toolbar button", async () => {
    render(
      <ConversationDetail
        conversationId="c-1"
        onClose={vi.fn()}
        layout="sheet"
      />,
    );
    const thread = screen.getByRole("region", { name: "Messages" });
    await waitFor(() => expect(document.activeElement).toBe(thread));
  });

  it("keeps one close control in the phone sheet", () => {
    render(
      <ConversationDetail
        conversationId="c-1"
        onClose={vi.fn()}
        layout="sheet"
      />,
    );
    expect(screen.getAllByRole("button", { name: /close/i })).toHaveLength(1);
  });

  it("keeps the desktop pane's height for the thread until Reply opens the composer", () => {
    // The pane is one screen tall; an open composer took most of it, so the
    // thread starts with the room and Reply or Internal note opens it.
    render(
      <ConversationDetail
        conversationId="c-1"
        onClose={vi.fn()}
        layout="inline"
      />,
    );
    expect(screen.queryByTestId("composer")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    expect(screen.getByTestId("composer").textContent).toContain("reply mode");

    fireEvent.click(screen.getByRole("button", { name: "Hide composer" }));
    expect(screen.getByTestId("composer").closest("[hidden]")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Show composer" })).toBeTruthy();
  });

  it("hides and shows the composer with one disclosure button that keeps focus and the draft", async () => {
    render(
      <ConversationDetail
        conversationId="c-1"
        onClose={vi.fn()}
        layout="inline"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    const toggle = screen.getByRole("button", { name: "Hide composer" });
    const composer = screen.getByTestId("composer");
    const region = document.getElementById(
      toggle.getAttribute("aria-controls") ?? "",
    );
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(region?.contains(composer)).toBe(true);

    toggle.focus();
    fireEvent.click(toggle);
    // Same element: focus stays on it instead of dropping to the page.
    expect(screen.getByRole("button", { name: "Show composer" })).toBe(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggle);
    expect(region?.hidden).toBe(true);
    expect(screen.getByTestId("composer")).toBe(composer);

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Hide composer" })).toBe(toggle);
    expect(region?.hidden).toBe(false);

    await act(async () => {
      await checkPattern(
        toggle.closest('[data-slot="collapsible"]')!,
        "disclosure",
      );
    });
  });

  it("lets keyboard users focus the scrolling thread", () => {
    render(
      <ConversationDetail
        conversationId="c-1"
        onClose={vi.fn()}
        layout="inline"
      />,
    );
    const messages = screen.getByRole("region", { name: "Messages" });
    expect(messages.getAttribute("tabindex")).toBe("0");
  });
});
