// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1864: App component regression test at its public UI boundary.
import { ConversationDetail } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationDetail";

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversation",
  () => ({
    useSupportConversation: () => ({
      data: undefined,
      isLoading: true,
      isReady: false,
      isError: false,
    }),
  }),
);

afterEach(cleanup);

describe("ConversationDetail sheet loading state", () => {
  it("keeps a visible close control while the conversation is loading", () => {
    render(
      <ConversationDetail
        conversationId="conversation-1"
        layout="sheet"
        onClose={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });
});
