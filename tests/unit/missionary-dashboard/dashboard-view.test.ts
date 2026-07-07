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
      raisedCents: 200_000,
      recurringMonthlyCents: 0,
      percentFunded: 40,
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
    ],
    ministryUpdates: [
      {
        id: "u1",
        excerpt: "Reached a milestone",
        createdAt: "2026-07-01",
        title: "x",
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

  it("computes support from real values (remaining clamped, hasGoal)", () => {
    const view = buildMissionaryDashboardView(snapshot());
    expect(view.support).toEqual({
      goalCents: 500_000,
      raisedCents: 200_000,
      remainingCents: 300_000,
      percentFunded: 40,
      giftCount: 7,
      activeDonorCount: 3,
      hasGoal: true,
    });
  });

  it("clamps remaining at 0 when raised exceeds goal, and hasGoal=false when goal is 0", () => {
    const over = buildMissionaryDashboardView(
      snapshot({
        support: {
          goalCents: 0,
          raisedCents: 1000,
          recurringMonthlyCents: 0,
          percentFunded: 0,
          activeDonorCount: 0,
          giftCount: 1,
          lastGiftAt: null,
        },
      }),
    );
    expect(over.support?.remainingCents).toBe(0);
    expect(over.support?.hasGoal).toBe(false);
  });

  it("filters completed tasks and passes through due_date (no fake 'Today')", () => {
    const view = buildMissionaryDashboardView(snapshot());
    expect(view.pendingTasks).toEqual([
      {
        id: "t1",
        title: "Call partner",
        priority: "high",
        dueDate: "2026-07-10",
      },
    ]);
  });

  it("maps ministry updates to excerpt content + raw createdAt (component formats)", () => {
    const view = buildMissionaryDashboardView(snapshot());
    expect(view.updates).toEqual([
      { id: "u1", content: "Reached a milestone", createdAt: "2026-07-01" },
    ]);
  });

  it("derives alerts from REAL counts only (none when zero)", () => {
    const view = buildMissionaryDashboardView(snapshot());
    expect(view.alerts).toEqual([
      { id: "tasks", text: "1 support task needs attention", severity: "high" },
      {
        id: "donors",
        text: "3 active donor relationships",
        severity: "medium",
      },
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
