/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NeedsYouCard } from "../../../packages/missionary/components/home/home-cards";

afterEach(cleanup);

const item = (n: number) => ({
  id: `follow-requests-${n}`,
  kind: "follow-requests" as const,
  tone: "info" as const,
  title: `Item ${n}`,
  href: "/feed",
  action: "Review",
});

describe("Needs you", () => {
  it("shows the three most urgent items and reveals the rest on request", () => {
    render(<NeedsYouCard items={[1, 2, 3, 4, 5].map(item)} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    const toggle = screen.getByRole("button", { name: "Show 2 more" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(
      screen
        .getByRole("button", { name: "Show less" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("says when nothing is waiting", () => {
    render(<NeedsYouCard items={[]} />);
    expect(screen.getByText("You’re all caught up.")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
