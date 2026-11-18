/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ metrics: vi.fn(), retry: vi.fn() }));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "auth-fixture" }, loading: false }),
  useDonationMetrics: mocks.metrics,
}));
// The year-over-year chart loads Recharts on demand; these tests never reach it.
vi.mock("next/dynamic", () => ({ default: () => () => null }));

const { default: AnalyticsPage } =
  await import("../../../../../../apps/missionary/app/analytics/page-client");

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function metrics(state: Record<string, unknown>) {
  mocks.metrics.mockReturnValue({
    gifts: [],
    isLoading: false,
    error: null,
    retry: mocks.retry,
    ...state,
  });
}

// A new element each time, so a rerender reads the hook mock again.
const page = () => <AnalyticsPage />;

/** Focuses Try again and presses it, as a keyboard user would. */
function pressTryAgain() {
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  return button;
}

describe("analytics Try again", () => {
  it("offers Try again in an announced error instead of asking for a refresh", () => {
    metrics({ error: new Error("Local fixture failure") });
    render(page());
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("We couldn’t load your giving history");
    expect(alert.textContent).not.toMatch(/refresh/i);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });

  it("keeps focus on the button while retrying, then lands on the page heading", () => {
    metrics({ error: new Error("Local fixture failure") });
    const view = render(page());
    const button = pressTryAgain();
    expect(mocks.retry).toHaveBeenCalledOnce();

    metrics({ isLoading: true });
    view.rerender(page());
    expect(button.isConnected).toBe(true);
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.textContent).toBe("Trying again…");
    expect(screen.queryByLabelText("Loading analytics")).toBeNull();

    metrics({});
    view.rerender(page());
    expect(button.isConnected).toBe(false);
    expect(
      screen.getByText("No gifts in the last 12 months yet."),
    ).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 1, name: "Analytics" }),
    );
  });

  it("leaves focus on the button and announces again when the retry fails again", () => {
    metrics({ error: new Error("Local fixture failure") });
    const view = render(page());
    const firstAlert = screen.getByRole("alert");
    const button = pressTryAgain();
    metrics({ isLoading: true });
    view.rerender(page());
    metrics({ error: new Error("Still failing") });
    view.rerender(page());
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(button.textContent).toBe("Try again");
    // A new alert node, so the unchanged message is read out again.
    expect(screen.getByRole("alert")).not.toBe(firstAlert);
  });
});
