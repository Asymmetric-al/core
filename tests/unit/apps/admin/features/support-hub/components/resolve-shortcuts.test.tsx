// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSetSupportConversationStatus: () => ({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    }),
  }),
);
vi.mock("sonner", () => ({
  toast: { success: mocks.success, error: mocks.error },
}));
import { useResolveSupportConversation } from "../../../../../../../apps/admin/features/support-hub/hooks/use-resolve-support-conversation";
import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.mutateAsync.mockResolvedValue({});
});
describe("resolve shortcuts", () => {
  it("resolves with Undo restoring status and snooze, and reports failed Undo", async () => {
    const conversation = {
      id: "conv-1",
      status: "snoozed",
      snoozedUntil: "2026-11-12T00:00:00Z",
    } as SupportConversation;
    const { result } = renderHook(useResolveSupportConversation);
    await act(async () => result.current(conversation));
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      conversationId: "conv-1",
      status: "resolved",
    });
    const undo = mocks.success.mock.calls[0]?.[1].action.onClick;
    await act(async () => undo());
    expect(mocks.mutateAsync).toHaveBeenLastCalledWith({
      conversationId: "conv-1",
      status: "snoozed",
      snoozedUntil: conversation.snoozedUntil,
    });
    mocks.mutateAsync.mockRejectedValueOnce(new Error("offline"));
    await act(async () => undo());
    expect(mocks.error).toHaveBeenCalledWith(
      "Couldn’t undo. The conversation is still resolved.",
    );
  });
  it("does nothing for resolved conversations and reports resolve failure", async () => {
    const { result } = renderHook(useResolveSupportConversation);
    await act(async () =>
      result.current({ id: "conv", status: "resolved" } as SupportConversation),
    );
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    mocks.mutateAsync.mockRejectedValueOnce(new Error("offline"));
    await act(async () =>
      result.current({ id: "conv", status: "open" } as SupportConversation),
    );
    expect(mocks.error).toHaveBeenCalledWith(
      "Couldn’t resolve the conversation. Try again.",
    );
  });
});
