// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  MetricCard,
  MetricGrid,
} from "../../../../../../packages/ui/components/primitives/metric-card";

afterEach(cleanup);

describe("MetricCard", () => {
  it("marks a count that needs attention with a tone and a named status", () => {
    render(
      <MetricGrid label="Automation summary">
        <MetricCard label="Failed runs" value="2" tone="critical" />
        <MetricCard label="Active rules" value="3" />
      </MetricGrid>,
    );
    const failed = screen.getByText("2").closest("[data-slot=metric-card]")!;
    expect(failed.getAttribute("data-tone")).toBe("critical");
    expect(screen.getByText("Needs attention")).toBeTruthy();
    const active = screen.getByText("3").closest("[data-slot=metric-card]")!;
    expect(active.getAttribute("data-tone")).toBe("default");
  });
});

describe("MetricGrid", () => {
  it("lays out three cards in one row from small screens, with no lone card", () => {
    render(
      <MetricGrid label="Overview">
        <MetricCard label="A" value="1" />
        <MetricCard label="B" value="2" />
        <MetricCard label="C" value="3" />
      </MetricGrid>,
    );
    const grid = screen.getByRole("region", { name: "Overview" });
    expect(grid.getAttribute("data-count")).toBe("3");
    expect(grid.className).toContain("sm:grid-cols-3");
  });

  it("keeps four cards two to a row until extra-large screens", () => {
    render(
      <MetricGrid label="Overview">
        <MetricCard label="A" value="1" />
        <MetricCard label="B" value="2" />
        <MetricCard label="C" value="3" />
        <MetricCard label="D" value="4" />
      </MetricGrid>,
    );
    const grid = screen.getByRole("region", { name: "Overview" });
    expect(grid.className).toContain("xl:grid-cols-4");
    expect(grid.className).not.toContain("sm:grid-cols-3");
  });
});

describe("MetricCard icon", () => {
  it("keeps the header one column, so a phone value is never squeezed beside the label", () => {
    const Icon = (props: { className?: string }) => (
      <svg {...props} data-testid="metric-icon" />
    );
    render(
      <MetricCard label="Commitments" value="$6,320.00" icon={Icon as never} />,
    );
    const card = screen
      .getByText("$6,320.00")
      .closest("[data-slot=metric-card]")!;
    // A card-action slot switches CardHeader to a two-column grid.
    expect(card.querySelector("[data-slot=card-action]")).toBeNull();
    expect(screen.getByTestId("metric-icon")).toBeTruthy();
  });
});

describe("MetricCard compactOnPhone", () => {
  it("tightens only the phone layout and keeps every line of information", () => {
    const { container } = render(
      <MetricCard
        compactOnPhone
        label="Flagged posts"
        value="3"
        detail="Waiting for a decision"
      />,
    );
    const card = container.querySelector<HTMLElement>(
      '[data-slot="metric-card"]',
    );
    expect(card?.dataset.compact).toBe("phone");
    const classes = card?.className.split(" ") ?? [];
    // Smaller phone padding; the sm: layout is the same as the default card.
    expect(classes).toEqual(
      expect.arrayContaining(["py-2", "gap-0.5", "sm:py-4", "sm:gap-2"]),
    );
    expect(container.textContent).toContain("Flagged posts");
    expect(container.textContent).toContain("3");
    expect(container.textContent).toContain("Waiting for a decision");
  });

  it("leaves the default card unchanged", () => {
    const { container } = render(<MetricCard label="Rules" value="6" />);
    const card = container.querySelector<HTMLElement>(
      '[data-slot="metric-card"]',
    );
    expect(card?.dataset.compact).toBeUndefined();
    expect(card?.className.split(" ")).toEqual(
      expect.arrayContaining(["py-3", "gap-1", "sm:py-4", "sm:gap-2"]),
    );
  });
});

describe("MetricCard compactUntil", () => {
  const cardClasses = (container: HTMLElement) =>
    container
      .querySelector<HTMLElement>('[data-slot="metric-card"]')!
      .className.split(" ");

  it("stays compact through tablet widths and opens up at xl", () => {
    const { container } = render(
      <MetricCard
        compactUntil="xl"
        label="Received"
        value="$1,200.00"
        detail="3 completed"
      />,
    );
    const card = container.querySelector<HTMLElement>(
      '[data-slot="metric-card"]',
    )!;
    expect(card.dataset.compact).toBe("until-xl");
    const classes = cardClasses(container);
    expect(classes).toEqual(
      expect.arrayContaining(["py-2", "gap-0.5", "xl:py-4", "xl:gap-2"]),
    );
    // No sm: step, or the card would grow at 640 again.
    expect(classes.some((name) => name.startsWith("sm:"))).toBe(false);
    const value = screen.getByText("$1,200.00").closest("[data-slot]")!;
    expect(value.className).toContain("xl:text-2xl");
    expect(value.className).not.toContain("sm:text-2xl");
    expect(container.textContent).toContain("3 completed");
  });

  it("sizes the loading skeleton to the compact value line", () => {
    const { container } = render(
      <MetricCard
        compactUntil="xl"
        label="Pending"
        value="0"
        state="loading"
      />,
    );
    const skeleton = container.querySelector('[data-slot="skeleton"]')!;
    expect(skeleton.className).toContain("h-5");
    expect(skeleton.className).toContain("xl:h-7");
    expect(skeleton.className).not.toContain("sm:h-7");
  });

  it("treats compactUntil sm the same as compactOnPhone", () => {
    const phone = render(<MetricCard compactOnPhone label="A" value="1" />);
    const phoneClasses = cardClasses(phone.container);
    cleanup();
    const sm = render(<MetricCard compactUntil="sm" label="A" value="1" />);
    expect(cardClasses(sm.container)).toEqual(phoneClasses);
    expect(
      sm.container.querySelector<HTMLElement>('[data-slot="metric-card"]')!
        .dataset.compact,
    ).toBe("phone");
  });
});

describe("MetricCard state", () => {
  it("shows a skeleton and no value while the figure loads", () => {
    const { container } = render(
      <MetricCard
        label="Past due"
        value="0"
        state="loading"
        tone="critical"
        detail="Past the reply target"
      />,
    );
    const card = container.querySelector<HTMLElement>(
      '[data-slot="metric-card"]',
    )!;
    expect(card.dataset.state).toBe("loading");
    expect(card.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    expect(screen.getByText("Loading")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
    // A count we do not have yet is never flagged.
    expect(card.dataset.tone).toBe("default");
    expect(screen.queryByText("Needs attention")).toBeNull();
    expect(screen.getByText("Past the reply target")).toBeTruthy();
  });

  it("shows a dash and a reason when the figure failed, never a zero", () => {
    const { container } = render(
      <MetricCard
        label="Past due"
        value="0"
        state="unavailable"
        tone="critical"
        detail="Past the reply target"
        unavailableReason="Couldn't load the inbox totals."
      />,
    );
    const card = container.querySelector<HTMLElement>(
      '[data-slot="metric-card"]',
    )!;
    expect(card.dataset.state).toBe("unavailable");
    expect(container.textContent).not.toContain("0");
    expect(screen.getByText("—").getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Not available")).toBeTruthy();
    expect(screen.getByText("Couldn't load the inbox totals.")).toBeTruthy();
    expect(screen.queryByText("Past the reply target")).toBeNull();
    expect(card.dataset.tone).toBe("default");
    expect(screen.queryByText("Needs attention")).toBeNull();
  });

  it("gives an unavailable figure a default reason", () => {
    render(<MetricCard label="Open" value={0} state="unavailable" />);
    expect(screen.getByText("Couldn't load this figure.")).toBeTruthy();
  });

  it("renders the value and tone as before when ready", () => {
    const { container } = render(
      <MetricCard label="Failed runs" value="2" tone="critical" />,
    );
    const card = container.querySelector<HTMLElement>(
      '[data-slot="metric-card"]',
    )!;
    expect(card.dataset.state).toBe("ready");
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("Needs attention")).toBeTruthy();
  });
});
