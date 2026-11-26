/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WorkersReviewSummary } from "../../../../../../apps/admin/features/mission-control/components/tiles/workers-review-summary";

const count = vi.hoisted(() => ({
  data: undefined as number | undefined,
  isPending: false,
  isError: false,
  refetch: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useUnreviewedWorkersCount: () => count,
}));

vi.mock("@asym/auth/tenant-navigation", () => ({
  TenantLink: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
  count.data = undefined;
  count.isPending = false;
  count.isError = false;
  count.refetch.mockReset();
});

describe("AL-2678 r2b1: Home's Security level unreviewed summary (Q12)", () => {
  it("shows nothing while loading and nothing at 0", () => {
    count.isPending = true;
    const loading = render(<WorkersReviewSummary />);
    expect(loading.container.textContent).toBe("");
    loading.unmount();
    count.isPending = false;
    count.data = 0;
    const zero = render(<WorkersReviewSummary />);
    expect(zero.container.textContent).toBe("");
  });

  it.each([
    [1, "Security level unreviewed: 1 worker"],
    [3, "Security level unreviewed: 3 workers"],
  ])("links %i to the unreviewed filter with no name", (value, text) => {
    count.data = value;
    render(<WorkersReviewSummary />);
    const link = screen.getByRole("link");
    expect(link.textContent).toBe(text);
    expect(link.getAttribute("href")).toBe("/workers?review=unreviewed");
  });

  it("on a failed read says so with Retry, and never shows 0", () => {
    count.isError = true;
    count.data = 0;
    const view = render(<WorkersReviewSummary />);
    expect(view.container.textContent).toContain(
      "Couldn't check workers' security levels.",
    );
    expect(view.container.textContent).not.toMatch(/\b0\b/);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(count.refetch).toHaveBeenCalledTimes(1);
  });
});
