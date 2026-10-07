// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TasksStatsCardsSection } from "../../../../../../apps/admin/app/(app)/tasks/tasks-content-sections";

afterEach(cleanup);

describe("Mission Pipeline statistic actions", () => {
  it("offers only the critical statistic as an action and preserves its selected state", () => {
    const onOverdueClick = vi.fn();
    const props = {
      onOverdueClick,
      stats: { overdue: 3, dueToday: 5, inProgress: 7, completed: 11 },
    };
    const view = render(<TasksStatsCardsSection activeTab="all" {...props} />);

    expect(screen.getAllByRole("button")).toHaveLength(1);
    const critical = screen.getByRole("button", { name: /Critical/ });
    expect(critical.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("Due Today")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
    expect(screen.getByText("11")).toBeTruthy();

    fireEvent.click(critical);
    expect(onOverdueClick).toHaveBeenCalledOnce();
    view.rerender(<TasksStatsCardsSection activeTab="overdue" {...props} />);
    expect(critical.getAttribute("aria-pressed")).toBe("true");
  });
});
