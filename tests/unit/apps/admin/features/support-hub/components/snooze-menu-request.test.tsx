// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import {
  SupportSnoozeMenuRequestProvider,
  useSupportSnoozeMenuRequest,
} from "../../../../../../../apps/admin/features/support-hub/lib/snooze-menu-request";
import type { ReactNode } from "react";
afterEach(cleanup);
it("clears a snooze request when selection changes, including an unloaded detail", () => {
  let selectedId = "conv-1";
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SupportSnoozeMenuRequestProvider selectedConversationId={selectedId}>
      {children}
    </SupportSnoozeMenuRequestProvider>
  );
  const { result, rerender } = renderHook(useSupportSnoozeMenuRequest, {
    wrapper,
  });
  act(() => result.current?.request("conv-1"));
  expect(result.current?.requestedId).toBe("conv-1");
  selectedId = "conv-2";
  rerender();
  expect(result.current?.requestedId).toBeNull();
  selectedId = "conv-1";
  rerender();
  expect(result.current?.requestedId).toBeNull();
});
