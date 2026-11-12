// @vitest-environment jsdom

import { Badge } from "@asym/ui/components/shadcn/badge";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContributionNeedsAttentionPanel } from "../../../../../apps/admin/app/(app)/contributions/needs-attention-panel";
import { ATTENTION_URGENCY } from "../../../../../apps/admin/features/mission-control/needs-attention/attention-vocabulary";

afterEach(cleanup);

function group(key: string, title: string, count: number, urgency = "high") {
  return {
    key,
    title,
    urgency,
    count,
    items: Array.from({ length: count }, (_, index) => ({
      id: `${key}-${index}`,
      taskId: `${key}-task-${index}`,
      issueType: key,
      issueLabel: title,
      urgency,
      status: "open",
      summary: `${title} ${index + 1}`,
      contributionId: `gift-${key}-${index}`,
      donorId: null,
      firstSeenAt: "2026-11-01T00:00:00.000Z",
      lastSeenAt: "2026-11-01T00:00:00.000Z",
    })),
  };
}

describe("Contributions needs attention panel", () => {
  it("renders nothing when the check worked and nothing needs attention", () => {
    const { container } = render(
      <ContributionNeedsAttentionPanel
        groups={[]}
        onOpenContribution={vi.fn()}
      />,
    );
    expect(container.textContent).toBe("");
  });

  it("says the check failed, with a retry, instead of reading as empty", () => {
    const onRetry = vi.fn();
    render(
      <ContributionNeedsAttentionPanel
        groups={[]}
        failed
        onRetry={onRetry}
        onOpenContribution={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Couldn't check Needs attention; open issues may be missing.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("names every other kind on phones, where only the most urgent shows", () => {
    render(
      <ContributionNeedsAttentionPanel
        groups={
          [
            group("critical:receipt_failed", "Receipt", 2, "critical"),
            group("high:correction_review", "Correction review", 1),
            group("high:crm_post_failed", "CRM post", 3),
          ] as never
        }
        onOpenContribution={vi.fn()}
      />,
    );
    const also = screen.getByText(/^Also:/);
    // Each kind with its urgency, so two kinds of one title tell apart.
    expect(also.textContent).toBe(
      "Also: Correction review, high (1) · CRM post, high (3)",
    );
    // From lg each group has its card, so the line is for phones and
    // tablets, which keep only the most urgent card to reach the gifts
    // sooner.
    expect(also.className.split(" ")).toContain("lg:hidden");
    const cards = screen.getAllByRole("listitem");
    expect(cards[0]!.className.split(" ")).toContain("flex");
    expect(cards[1]!.className.split(" ")).toEqual(
      expect.arrayContaining(["hidden", "lg:flex"]),
    );
  });

  it("names the groups beyond the three cards on wider screens too", () => {
    render(
      <ContributionNeedsAttentionPanel
        groups={
          [
            group("critical:receipt_failed", "Receipt", 2, "critical"),
            group("high:correction_review", "Correction review", 1),
            group("high:refund_review", "Refund review", 1),
            group("medium:import_review", "Import review", 4, "medium"),
            group("low:receipt_pending", "Receipt", 1, "low"),
          ] as never
        }
        onOpenContribution={vi.fn()}
      />,
    );
    const beyond = screen.getByText(/^Also, not shown above:/);
    expect(beyond.textContent).toBe(
      "Also, not shown above: Import review, medium (4) · Receipt, low (1)",
    );
    expect(beyond.className.split(" ")).toEqual(
      expect.arrayContaining(["hidden", "lg:block"]),
    );
  });

  it("keeps the title, count and Show all on one line at phone width", () => {
    render(
      <ContributionNeedsAttentionPanel
        groups={
          [
            group("critical:receipt_failed", "Receipt", 2, "critical"),
            group("high:crm_post_failed", "CRM post", 3),
          ] as never
        }
        onOpenContribution={vi.fn()}
        onShowInGrid={vi.fn()}
      />,
    );
    const showAll = screen.getByRole("button", { name: "Show all in grid" });
    // The filter icon only shows from sm, so the phone button is just
    // "Show all" and leaves the title and count room on one line.
    const icon = showAll.querySelector("svg");
    expect(icon?.getAttribute("class")?.split(" ")).toEqual(
      expect.arrayContaining(["hidden", "sm:block"]),
    );
    expect(showAll.textContent).toBe("Show all in grid");
  });

  it("puts each group's actions beside its summary from sm, so tablets stack less", () => {
    render(
      <ContributionNeedsAttentionPanel
        groups={[group("high:crm_post_failed", "CRM post", 3)] as never}
        onOpenContribution={vi.fn()}
        onShowInGrid={vi.fn()}
      />,
    );
    const row = screen.getByText("CRM post", { selector: "p" }).closest("li")!;
    expect(row.className.split(" ")).toEqual(
      expect.arrayContaining(["sm:flex-row", "sm:items-center", "lg:flex-col"]),
    );
    expect(row.className.split(" ")).not.toContain("md:flex-row");
  });

  it("keeps group names readable, wrapping the title and count at narrow column widths", () => {
    render(
      <ContributionNeedsAttentionPanel
        groups={
          [group("high:correction_review", "Correction review", 2)] as never
        }
        onOpenContribution={vi.fn()}
      />,
    );
    const title = screen.getByText("Correction review", { selector: "p" });
    const line = title.parentElement!;
    expect(line.textContent).toBe("HighCorrection review2 items");
    expect(line.className.split(" ")).toContain("flex-wrap");
    expect(title.className.split(" ")).toContain("break-words");
    expect(title.className.split(" ")).not.toContain("truncate");
  });

  it("says when the open issues reached the read limit, so the count is not read as the whole queue", () => {
    render(
      <ContributionNeedsAttentionPanel
        groups={
          [
            group("critical:receipt_failed", "Receipt", 60, "critical"),
            group("high:correction_review", "Correction review", 40),
          ] as never
        }
        onOpenContribution={vi.fn()}
      />,
    );
    expect(screen.getByText("100+ items")).toBeTruthy();
    expect(
      screen.getByText(
        "Shows the 100 most recent open issues; there may be more.",
      ),
    ).toBeTruthy();
  });

  it("gives the exact count under the read limit", () => {
    render(
      <ContributionNeedsAttentionPanel
        groups={
          [group("critical:receipt_failed", "Receipt", 2, "critical")] as never
        }
        onOpenContribution={vi.fn()}
      />,
    );
    expect(screen.getAllByText("2 items").length).toBeGreaterThan(0);
    expect(screen.queryByText(/there may be more/)).toBeNull();
  });

  it("opens the donor when a follow-up has no gift, and says when it has neither", () => {
    const base = group(
      "normal:donor_follow_up",
      "Donor follow-up",
      1,
      "normal",
    );
    const donorOnly = {
      ...base,
      items: [{ ...base.items[0]!, contributionId: null, donorId: "donor 7" }],
    };
    const unlinked = {
      ...group("normal:other", "Other follow-up", 1, "normal"),
    };
    unlinked.items = [
      { ...unlinked.items[0]!, contributionId: null, donorId: null },
    ];
    render(
      <ContributionNeedsAttentionPanel
        groups={[donorOnly, unlinked] as never}
        onOpenContribution={vi.fn()}
      />,
    );

    const donorLink = screen.getByRole("link", {
      name: "Open donor: Donor follow-up",
    });
    expect(donorLink.getAttribute("href")).toBe("/crm?donor=donor%207");
    expect(screen.getByText("Not linked to a gift or donor yet")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /open contribution/i }),
    ).toBeNull();
  });

  it("reads urgency from the shared Mission Control vocabulary", () => {
    render(
      <ContributionNeedsAttentionPanel
        groups={
          [
            group("critical:receipt_failed", "Receipt", 1, "critical"),
            group("high:correction_review", "Correction review", 1),
            group("normal:review", "Review", 1, "normal"),
          ] as never
        }
        onOpenContribution={vi.fn()}
      />,
    );
    for (const urgency of ["critical", "high", "normal"] as const) {
      const presentation = ATTENTION_URGENCY[urgency];
      const badge = screen.getByText(presentation.label);
      const reference = render(
        <Badge variant={presentation.variant}>{urgency}</Badge>,
      ).container.firstElementChild;
      expect(badge.className).toBe(reference?.className);
    }
  });
});
