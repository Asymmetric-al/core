/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useStudioDiscardGuard } from "../../../../apps/admin/features/studios/studio-discard-guard";

afterEach(cleanup);

describe("studio discard guard", () => {
  it("defers dirty replacements until confirmation and keeps cancellation untouched", () => {
    const replace = vi.fn();
    const { result } = renderHook(() => useStudioDiscardGuard(true));
    act(() => result.current.requestAction(replace));
    expect(replace).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(true);
    act(() => result.current.cancel());
    expect(replace).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    act(() => result.current.requestAction(replace));
    act(() => result.current.confirm());
    expect(replace).toHaveBeenCalledOnce();
    expect(result.current.pending).toBe(false);
  });

  it("replaces clean drafts immediately and only warns on unload while dirty", () => {
    const replace = vi.fn();
    const { result, rerender, unmount } = renderHook(
      (dirty) => useStudioDiscardGuard(dirty),
      { initialProps: false },
    );
    act(() => result.current.requestAction(replace));
    expect(replace).toHaveBeenCalledOnce();
    const cleanUnload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanUnload);
    expect(cleanUnload.defaultPrevented).toBe(false);
    rerender(true);
    const dirtyUnload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyUnload);
    expect(dirtyUnload.defaultPrevented).toBe(true);
    unmount();
    const afterUnmount = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(afterUnmount);
    expect(afterUnmount.defaultPrevented).toBe(false);
  });
});
