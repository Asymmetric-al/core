import { describe, expect, it } from "vitest";

import { buildMissionaryDashboardView } from "../../../packages/missionary/components/dashboard-view";

/**
 * TDD — dashboard-home presenter. It selects REAL values from the missionary
 * portal snapshot with NO mock fallbacks and NO hardcoded support figures.
 * An absent snapshot yields empty selections (the component renders honest
 * empty states), never fake numbers.
 */

function snapshot(overrides: Record<string, unknown> = {}) {
  return {
    support: {
      goalCents: 500_000,
      goalCurrency: "USD",
      recurringCurrency: "USD",
      raisedCents: 200_000,
      recurringMonthlyCents: 150_000,
      percentFunded: 30,
      activeDonorCount: 3,
      giftCount: 7,
      lastGiftAt: null,
    },
    tasks: [
      {
        id: "t1",
        title: "Call partner",
        status: "not_started",
        priority: "high",
        due_date: "2026-07-10",
      },
      {
        id: "t2",
        title: "Done task",
        status: "completed",
        priority: "low",
        due_date: null,
      },
      {
        id: "t3",
        title: "Paused follow-up",
        status: "deferred",
        priority: "medium",
        due_date: "2026-07-01",
      },
      {
        id: "t4",
        title: "Thank-you note",
        status: "in_progress",
        priority: "low",
        due_date: "2026-07-20",
      },
    ],
    ministryUpdates: [
      {
        id: "u1",
        excerpt: "Reached a milestone",
        createdAt: "2026-07-01",
        title: "Milestone reached",
        visibility: "public",
        status: "published",
        engagementCount: 0,
      },
    ],
    ...overrides,
  } as never;
}

describe("buildMissionaryDashboardView", () => {
  it("returns empty selections (no fake numbers) when there is no snapshot", () => {
    const view = buildMissionaryDashboardView(undefined);
    expect(view.support).toBeNull();
    expect(view.updates).toEqual([]);
    expect(view.pendingTasks).toEqual([]);
    expect(view.alerts).toEqual([]);
  });

  it("measures the monthly goal against committed monthly support", () => {
    const view = buildMissionaryDashboardView(snapshot());
    expect(view.support).toEqual({
      goalCents: 500_000,
      goalCurrency: "USD",
      monthlyCommittedCurrency: "USD",
      monthlyCommittedCents: 150_000,
      remainingCents: 350_000,
      percentFunded: 30,
      giftCount: 7,
      activeDonorCount: 3,
      hasGoal: true,
    });
  });

  it("has no comparison when the goal is zero or unqualified", () => {
    const over = buildMissionaryDashboardView(
      snapshot({
        support: {
          goalCents: 0,
          raisedCents: 1000,
          recurringMonthlyCents: 1000,
          percentFunded: 0,
          activeDonorCount: 0,
          giftCount: 1,
          lastGiftAt: null,
        },
      }),
    );
    expect(over.support?.remainingCents).toBeNull();
    expect(over.support?.percentFunded).toBeNull();
    expect(over.support?.hasGoal).toBe(false);
  });

  it("lists open tasks only (not done or deferred) and flags the overdue ones", () => {
    const view = buildMissionaryDashboardView(
      snapshot(),
      new Date(2026, 6, 12),
    );
    expect(view.pendingTasks).toEqual([
      {
        id: "t1",
        title: "Call partner",
        priority: "high",
        dueDate: "2026-07-10",
        overdue: true,
      },
      {
        id: "t4",
        title: "Thank-you note",
        priority: "low",
        dueDate: "2026-07-20",
        overdue: false,
      },
    ]);
  });

  it("doesn't call a task due today overdue", () => {
    const view = buildMissionaryDashboardView(
      snapshot(),
      new Date(2026, 6, 10, 23),
    );
    expect(view.pendingTasks[0]?.overdue).toBe(false);
  });

  it("maps ministry updates to excerpt content + raw createdAt (component formats)", () => {
    const view = buildMissionaryDashboardView(snapshot());
    expect(view.updates).toEqual([
      {
        id: "u1",
        title: "Milestone reached",
        content: "Reached a milestone",
        createdAt: "2026-07-01",
      },
    ]);
  });

  it("derives alerts from REAL counts only (none when zero)", () => {
    const view = buildMissionaryDashboardView(
      snapshot(),
      new Date(2026, 6, 12),
    );
    // Only things that need action are alerts. The relationship count is not
    // an alert, and "active" here would contradict the Partners page, which
    // counts lapsed and at-risk partners separately.
    expect(view.alerts).toEqual([
      { id: "tasks", text: "1 of 2 open tasks is overdue", severity: "high" },
    ]);
    const onTime = buildMissionaryDashboardView(
      snapshot(),
      new Date(2026, 6, 1),
    );
    expect(onTime.alerts).toEqual([
      { id: "tasks", text: "2 open tasks", severity: "medium" },
    ]);

    const emptyish = buildMissionaryDashboardView(
      snapshot({
        tasks: [],
        support: {
          goalCents: 0,
          raisedCents: 0,
          recurringMonthlyCents: 0,
          percentFunded: 0,
          activeDonorCount: 0,
          giftCount: 0,
          lastGiftAt: null,
        },
      }),
    );
    expect(emptyish.alerts).toEqual([]);
  });
});
