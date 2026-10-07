// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1965: App regression test at the toolbar's public UI boundary.
import { InboxToolbar } from "../../../../../../../apps/admin/features/support-hub/components/toolbar/InboxToolbar";
// eslint-disable-next-line no-restricted-imports -- AL-1965: Fixtures use the app's public route-state contract.
import { DEFAULT_SUPPORT_INBOX_ROUTE_STATE } from "../../../../../../../apps/admin/features/support-hub/types/route-state";

const hooks = vi.hoisted(() => ({ q: "", setState: vi.fn() }));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/route-state",
  () => ({
    useSupportInboxState: () => ({
      state: { ...DEFAULT_SUPPORT_INBOX_ROUTE_STATE, q: hooks.q },
      setState: hooks.setState,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportAgents: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: () => ({ data: [] }) }),
);

beforeEach(() => {
  hooks.q = "";
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function advance(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}

describe("InboxToolbar search", () => {
  it("shows persisted search and debounces the latest typed draft for 200 ms", () => {
    hooks.q = "receipt";
    render(<InboxToolbar />);
    const search = screen.getByRole("textbox", {
      name: "Search conversations",
    }) as HTMLInputElement;
    expect(search.value).toBe("receipt");
    expect(hooks.setState).not.toHaveBeenCalled();

    fireEvent.change(search, { target: { value: "thank" } });
    advance(100);
    fireEvent.change(search, { target: { value: "thank you" } });
    expect(search.value).toBe("thank you");
    advance(199);
    expect(hooks.setState).not.toHaveBeenCalled();
    advance(1);
    expect(hooks.setState).toHaveBeenCalledExactlyOnceWith({ q: "thank you" });
  });

  it("clears the visible search immediately and persists it after the debounce", () => {
    hooks.q = "receipt";
    render(<InboxToolbar />);
    const search = screen.getByRole("textbox", {
      name: "Search conversations",
    }) as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(search.value).toBe("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    expect(hooks.setState).not.toHaveBeenCalled();
    advance(200);
    expect(hooks.setState).toHaveBeenCalledExactlyOnceWith({ q: "" });
  });

  it("replaces a pending draft when a saved view or URL changes the persisted search", () => {
    hooks.q = "receipt";
    const { rerender } = render(<InboxToolbar />);
    const search = screen.getByRole("textbox", {
      name: "Search conversations",
    }) as HTMLInputElement;
    search.focus();
    fireEvent.change(search, { target: { value: "unsaved search" } });
    advance(100);
    hooks.q = "urgent";
    rerender(<InboxToolbar />);
    expect(search.value).toBe("urgent");
    expect(document.activeElement).toBe(search);
    advance(200);
    expect(hooks.setState).not.toHaveBeenCalled();
  });

  it("cancels a pending URL update when the toolbar unmounts", () => {
    const { unmount } = render(<InboxToolbar />);
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search conversations" }),
      {
        target: { value: "pending" },
      },
    );
    unmount();
    advance(200);
    expect(hooks.setState).not.toHaveBeenCalled();
  });
});
