// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ConversationAssigneeMenu } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationAssigneeMenu";
const mocks = vi.hoisted(() => ({
  run: vi.fn().mockResolvedValue(null),
  info: vi.fn(),
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportAgents: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => "agent-1" }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useAssignSupportConversation: () => ({ mutate: vi.fn() }),
    useApplyRoundRobinAssignment: () => ({
      mutateAsync: mocks.run,
      isPending: false,
    }),
  }),
);
vi.mock("sonner", () => ({ toast: { info: mocks.info, error: vi.fn() } }));
afterEach(cleanup);
it("runs round-robin and explains when no other agent is available", async () => {
  render(
    <ConversationAssigneeMenu
      conversation={{ id: "conversation-1", assignee: null } as never}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Unassigned" }));
  fireEvent.click(
    await screen.findByRole("menuitem", { name: "Round-robin assign" }),
  );
  await waitFor(() =>
    expect(mocks.info).toHaveBeenCalledWith("No other agent is available."),
  );
  expect(mocks.run).toHaveBeenCalledWith({
    conversationId: "conversation-1",
    authorAgentId: "agent-1",
  });
});
