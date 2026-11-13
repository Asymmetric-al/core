// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ConversationDetail } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationDetail";
import { ConversationTimeline } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationTimeline";
const state = vi.hoisted(() => ({ isNotFound: false, refetch: vi.fn() }));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversation",
  () => ({
    useSupportConversation: () => ({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("failed"),
      ...state,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-messages",
  () => ({
    useSupportMessages: () => ({
      data: [],
      isLoading: false,
      isError: true,
      refetch: state.refetch,
    }),
  }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => "2026-11-10T12:00:00.000Z",
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/composer/ConversationComposer",
  () => ({ ConversationComposer: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationHeader",
  () => ({ ConversationHeader: () => null }),
);
afterEach(() => {
  cleanup();
  state.isNotFound = false;
  vi.clearAllMocks();
});
it.each(["sheet", "inline"] as const)(
  "offers retry for non-404 detail failure in %s layout",
  (layout) => {
    render(
      <ConversationDetail
        conversationId="c1"
        onClose={vi.fn()}
        layout={layout}
      />,
    );
    expect(screen.getByText("Couldn’t load conversation")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(state.refetch).toHaveBeenCalledOnce();
  },
);
it("reserves missing-conversation wording for a 404", () => {
  state.isNotFound = true;
  render(
    <ConversationDetail
      conversationId="c1"
      onClose={vi.fn()}
      layout="inline"
    />,
  );
  expect(screen.queryByText("Couldn’t load conversation")).toBeNull();
});
it("does not turn a failed timeline into no messages", () => {
  render(<ConversationTimeline conversationId="c1" />);
  expect(screen.getByText("Couldn’t load messages")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(state.refetch).toHaveBeenCalledOnce();
});
