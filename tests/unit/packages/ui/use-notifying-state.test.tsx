/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useNotifyingState } from "../../../../packages/ui/components/shadcn/data-table/hooks/use-notifying-state";

function StrictModeWrapper({ children }: { children: React.ReactNode }) {
  return <React.StrictMode>{children}</React.StrictMode>;
}

afterEach(() => {
  cleanup();
});

describe("useNotifyingState", () => {
  it("does not notify the parent on mount", () => {
    const onChange = vi.fn();
    renderHook(() => useNotifyingState([{ id: "a", desc: true }], onChange));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("notifies exactly once per update with the next value, even under StrictMode replay", () => {
    const onChange = vi.fn();
    const { result } = renderHook(
      () => useNotifyingState<Record<string, boolean>>({}, onChange),
      { wrapper: StrictModeWrapper },
    );

    act(() => {
      result.current[1]({ row1: true });
    });

    expect(result.current[0]).toEqual({ row1: true });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ row1: true });
  });

  it("chains functional updates issued in the same tick", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useNotifyingState(0, onChange));

    act(() => {
      result.current[1]((n) => n + 1);
      result.current[1]((n) => n + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 2);
  });

  it("keeps the setter usable without a listener", () => {
    const { result } = renderHook(() => useNotifyingState("a"));

    act(() => {
      result.current[1]("b");
    });

    expect(result.current[0]).toBe("b");
  });
});
