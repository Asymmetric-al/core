import { describe, expect, it } from "vitest";

import {
  getAttentionGaps,
  getCriticalCarePriorities,
  getDashboardNotifications,
  getOpenInterventionsCount,
  getRecentCheckInCount,
  getDueCareTasks,
  getIntervalDaysForActivity,
  getUpcomingBirthdays,
} from "../../../../../../../apps/admin/features/mission-control/care/member-care.derived";
import type {
  ActivityLogEntry,
  CarePersonnel,
} from "../../../../../../../apps/admin/features/mission-control/care/types";
import type {
  CarePlanTask,
  CareRequirement,
} from "../../../../../../../apps/admin/features/mission-control/care/member-care.types";

const now = new Date("2026-04-11T00:00:00Z");

const personnel: CarePersonnel[] = [
  {
    id: "p-1",
    name: "Manual Priority",
    location: "Lima",
    timezone: "America/Lima",
    status: "At Risk",
    lastCheckIn: "2026-02-01T00:00:00Z",
    initials: "MP",
    role: "Role",
    region: "Latin America",
    healthSignals: { emotional: 50, spiritual: 50, physical: 50, financial: 50 },
    careGaps: [],
    manualAttention: true,
  },
  {
    id: "p-2",
    name: "Routine Followup",
    location: "Accra",
    timezone: "Africa/Accra",
    status: "Healthy",
    lastCheckIn: "2026-02-20T00:00:00Z",
    initials: "RF",
    role: "Role",
    region: "Africa",
    healthSignals: { emotional: 60, spiritual: 60, physical: 60, financial: 60 },
    careGaps: [],
  },
  {
    id: "p-3",
    name: "Never Met",
    location: "Chiang Mai",
    timezone: "Asia/Bangkok",
    status: "Healthy",
    lastCheckIn: "2026-04-05T00:00:00Z",
    initials: "NM",
    role: "Role",
    region: "SE Asia",
    healthSignals: { emotional: 70, spiritual: 70, physical: 70, financial: 70 },
    careGaps: [],
  },
];

const activities: ActivityLogEntry[] = [
  {
    id: "a-1",
    personnelId: "p-2",
    type: "Check-in",
    content: "Check in",
    date: "2026-03-01T00:00:00Z",
    authorId: "s-1",
    authorName: "Staff",
    isPrivate: false,
  },
];

const requirements: CareRequirement[] = [
  {
    id: "r-1",
    personnelId: "p-3",
    activityType: "Video Call",
    neverMet: true,
    label: "Monthly video care",
  },
];

describe("member care derivations", () => {
  it("maps interval defaults by activity type", () => {
    expect(getIntervalDaysForActivity("Video Call")).toBe(14);
    expect(getIntervalDaysForActivity("Crisis Intervention")).toBe(7);
  });

  it("returns birthdays within the next 14 days", () => {
    const withBirthdays = [
      { ...personnel[0], birthDate: "1991-04-20" },
      { ...personnel[1], birthDate: "1992-05-10" },
    ] as Array<CarePersonnel & { birthDate: string }>;

    const birthdays = getUpcomingBirthdays(withBirthdays, now, 14);

    expect(birthdays).toHaveLength(1);
    expect(birthdays[0]?.id).toBe("p-1");
  });

  it("prioritizes manual attention and includes routine + never-met requirement gaps", () => {
    const gaps = getAttentionGaps({
      personnel,
      activities,
      requirements,
      now,
    });

    expect(gaps[0]?.reason).toBe("manual_attention");
    expect(gaps.some((gap) => gap.reason === "routine_checkin")).toBe(true);
    expect(gaps.some((gap) => gap.reason === "never_met_requirement")).toBe(
      true,
    );
  });

  it("computes due and overdue care tasks from pending tasks", () => {
    const tasks: CarePlanTask[] = [
      {
        id: "t-1",
        personnelId: "p-1",
        title: "Follow up",
        dueDate: "2026-04-10T00:00:00Z",
        status: "pending",
      },
      {
        id: "t-2",
        personnelId: "p-1",
        title: "Future",
        dueDate: "2026-04-20T00:00:00Z",
        status: "pending",
      },
    ];

    const dueTasks = getDueCareTasks(tasks, now);

    expect(dueTasks[0]?.status).toBe("overdue");
    expect(dueTasks).toHaveLength(2);
  });

  it("derives notifications from the shared selectors", () => {
    const notifications = getDashboardNotifications({
      personnel,
      activities,
      requirements,
      tasks: [
        {
          id: "t-1",
          personnelId: "p-1",
          title: "Follow up",
          dueDate: "2026-04-10T00:00:00Z",
          status: "pending",
        },
      ],
      now,
    });

    expect(notifications.some((note) => note.type === "critical")).toBe(true);
    expect(notifications.some((note) => note.type === "task")).toBe(true);
  });

  it("filters critical priority list from full attention gaps", () => {
    const critical = getCriticalCarePriorities(
      getAttentionGaps({ personnel, activities, requirements, now }),
    );

    expect(critical.every((gap) => gap.severity === "critical")).toBe(true);
  });

  it("counts open interventions from active care gaps", () => {
    const count = getOpenInterventionsCount([
      { ...personnel[0], careGaps: ["stress"] },
      { ...personnel[1], careGaps: [] },
      { ...personnel[2], careGaps: ["rhythm", "support"] },
    ]);

    expect(count).toBe(2);
  });

  it("counts recent check-ins in the 30-day window", () => {
    const count = getRecentCheckInCount(
      [
        ...activities,
        {
          ...activities[0],
          id: "a-2",
          date: "2026-04-05T00:00:00Z",
        },
      ],
      now,
    );

    expect(count).toBe(1);
  });
});
