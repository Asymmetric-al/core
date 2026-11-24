// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Council on the joined release, JB2: the notice a scope guard shows in place
 * of a page of the wrong scope is built from the shared `@asym/ui` button
 * components, with no style of its own: an announced status, then a way out
 * that takes focus.
 */

const reloadDocument = vi.hoisted(() => vi.fn());
vi.mock(
  "../../../../packages/database/document-reload",
  async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
      ...actual,
      reloadDocument,
      loadDocument: vi.fn(),
    };
  },
);

const { ScopeReloadNotices } =
  await import("../../../../packages/ui/components/scope-reload-notices");
const { ScopeReloadNotice, STUCK_AFTER_MS } =
  await import("../../../../packages/database/scope-reload-notice");

beforeEach(() => {
  reloadDocument.mockReset();
  window.sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("the app's view of the scope reload notice", () => {
  it("announces the reload, then offers the shared buttons and focuses Reload", () => {
    vi.useFakeTimers();
    render(
      <ScopeReloadNotices>
        <ScopeReloadNotice homeHref="/donor-dashboard" />
      </ScopeReloadNotices>,
    );
    expect(screen.getByRole("status").textContent).toBe(
      "Loading this page again…",
    );
    expect(reloadDocument).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(STUCK_AFTER_MS);
    });

    const reload = screen.getByRole("button", { name: "Reload" });
    const home = screen.getByRole("link", { name: "Go to home" });
    expect(screen.getByRole("status").textContent).toBe(
      "This page could not load again.",
    );
    expect(document.activeElement).toBe(reload);
    expect(home.getAttribute("href")).toBe("/donor-dashboard");
    // The shared components, not a style of the notice's own.
    expect(reload.getAttribute("data-slot")).toBe("button");
    expect(home.getAttribute("data-slot")).toBe("button-link");
  });
});
