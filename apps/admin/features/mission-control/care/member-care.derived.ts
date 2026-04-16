import { addDays, differenceInCalendarDays, parseISO } from "date-fns";

import type {
  AttentionGap,
  CarePlanTask,
  DashboardNotification,
  MemberCareDerivationInput,
} from "./member-care.types";
import type { ActivityLogEntry, ActivityType, CarePersonnel } from "./types";

const DEFAULT_ROUTINE_INTERVAL_DAYS = 30;

const TYPE_INTERVALS: Partial<Record<ActivityType, number>> = {
  "Video Call": 14,
  "In-Person Visit": 45,
  "Check-in": 30,
  "Pastoral Note": 21,
  "Care Plan Update": 30,
  "Crisis Intervention": 7,
  Birthday: 365,
  "Prayer Request": 14,
};

function toDate(input: string): Date {
  return parseISO(input);
}

function safeDaysSince(
  date: string | undefined,
  now: Date,
): number | undefined {
  if (!date) return undefined;
  const parsed = toDate(date);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return differenceInCalendarDays(now, parsed);
}

function isCriticalStatus(status: CarePersonnel["status"]): boolean {
  return status === "Crisis" || status === "At Risk";
}

export function getIntervalDaysForActivity(type: ActivityType): number {
  return TYPE_INTERVALS[type] ?? DEFAULT_ROUTINE_INTERVAL_DAYS;
}

export function getUpcomingBirthdays(
  personnel: CarePersonnel[],
  now = new Date(),
  windowDays = 14,
): CarePersonnel[] {
  const end = addDays(now, windowDays);

  return personnel
    .filter((person) => {
      const birthday = (person as CarePersonnel & { birthDate?: string })
        .birthDate;
      if (!birthday) return false;
      const parsed = toDate(birthday);
      if (Number.isNaN(parsed.getTime())) return false;

      const nextBirthday = new Date(
        now.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
      );
      if (nextBirthday < now) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }

      return nextBirthday >= now && nextBirthday <= end;
    })
    .sort((a, b) => {
      const aDate = toDate(
        (a as CarePersonnel & { birthDate: string }).birthDate,
      );
      const bDate = toDate(
        (b as CarePersonnel & { birthDate: string }).birthDate,
      );
      const nextA = new Date(
        now.getFullYear(),
        aDate.getMonth(),
        aDate.getDate(),
      );
      const nextB = new Date(
        now.getFullYear(),
        bDate.getMonth(),
        bDate.getDate(),
      );
      if (nextA < now) nextA.setFullYear(now.getFullYear() + 1);
      if (nextB < now) nextB.setFullYear(now.getFullYear() + 1);
      return nextA.getTime() - nextB.getTime();
    });
}

function getLatestActivityByPersonnel(
  activities: ActivityLogEntry[],
  personnelId: string,
  type?: ActivityType,
): ActivityLogEntry | undefined {
  return activities
    .filter(
      (entry) =>
        entry.personnelId === personnelId && (!type || entry.type === type),
    )
    .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())[0];
}

export function getAttentionGaps({
  personnel,
  activities,
  requirements = [],
  now = new Date(),
}: Pick<
  MemberCareDerivationInput,
  "personnel" | "activities" | "requirements" | "now"
>): AttentionGap[] {
  const gaps: AttentionGap[] = [];

  for (const person of personnel) {
    const latest = getLatestActivityByPersonnel(activities, person.id);
    const lastContactDays = safeDaysSince(
      latest?.date ?? person.lastCheckIn,
      now,
    );
    const personRequirements = requirements.filter(
      (requirement) => requirement.personnelId === person.id,
    );

    if (person.manualAttention) {
      gaps.push({
        personnelId: person.id,
        personnelName: person.name,
        status: person.status,
        reason: "manual_attention",
        reasonLabel: "Flagged for manual attention",
        daysSinceLastContact: lastContactDays,
        daysOverdue: Math.max(lastContactDays ?? 0, 0),
        severity: "critical",
      });
      continue;
    }

    if (personRequirements.length === 0) {
      if ((lastContactDays ?? 0) > DEFAULT_ROUTINE_INTERVAL_DAYS) {
        gaps.push({
          personnelId: person.id,
          personnelName: person.name,
          status: person.status,
          reason: "routine_checkin",
          reasonLabel: `No contact for ${lastContactDays} days`,
          daysSinceLastContact: lastContactDays,
          daysOverdue: (lastContactDays ?? 0) - DEFAULT_ROUTINE_INTERVAL_DAYS,
          severity: isCriticalStatus(person.status) ? "critical" : "moderate",
        });
      }
      continue;
    }

    for (const requirement of personRequirements) {
      const latestForType = getLatestActivityByPersonnel(
        activities,
        person.id,
        requirement.activityType,
      );
      const intervalDays =
        requirement.intervalDays ??
        getIntervalDaysForActivity(requirement.activityType);

      if (!latestForType || requirement.neverMet) {
        gaps.push({
          personnelId: person.id,
          personnelName: person.name,
          status: person.status,
          reason: "never_met_requirement",
          reasonLabel: `Never met: ${requirement.label ?? requirement.activityType}`,
          daysOverdue: intervalDays,
          severity: "high",
        });
        continue;
      }

      const daysSince = safeDaysSince(latestForType.date, now) ?? 0;
      if (daysSince > intervalDays) {
        gaps.push({
          personnelId: person.id,
          personnelName: person.name,
          status: person.status,
          reason: "requirement_gap",
          reasonLabel: `${requirement.label ?? requirement.activityType} overdue`,
          daysSinceLastContact: daysSince,
          daysOverdue: daysSince - intervalDays,
          severity:
            isCriticalStatus(person.status) || daysSince - intervalDays > 14
              ? "critical"
              : "high",
        });
      }
    }
  }

  return gaps.sort((a, b) => {
    if (a.reason === "manual_attention" && b.reason !== "manual_attention")
      return -1;
    if (b.reason === "manual_attention" && a.reason !== "manual_attention")
      return 1;
    return b.daysOverdue - a.daysOverdue;
  });
}

export function getCriticalCarePriorities(
  gaps: AttentionGap[],
): AttentionGap[] {
  return gaps.filter((gap) => gap.severity === "critical");
}

export function getDueCareTasks(
  tasks: CarePlanTask[],
  now = new Date(),
): CarePlanTask[] {
  return tasks
    .filter((task) => task.status !== "completed")
    .map((task) => {
      const isPastDue = toDate(task.dueDate) < now;
      return {
        ...task,
        status:
          isPastDue && task.status === "pending"
            ? ("overdue" as const)
            : task.status,
      };
    })
    .sort((a, b) => toDate(a.dueDate).getTime() - toDate(b.dueDate).getTime());
}

export function getDashboardNotifications(
  input: MemberCareDerivationInput,
): DashboardNotification[] {
  const now = input.now ?? new Date();
  const gaps = getAttentionGaps(input);
  const critical = getCriticalCarePriorities(gaps);
  const dueTasks = getDueCareTasks(input.tasks ?? [], now);
  const upcomingBirthdays = getUpcomingBirthdays(input.personnel, now);

  return [
    ...critical.map((item) => ({
      id: `critical-${item.personnelId}-${item.reason}`,
      type: "critical" as const,
      title: `${item.personnelName} requires immediate care`,
      detail: item.reasonLabel,
      personnelId: item.personnelId,
    })),
    ...dueTasks.slice(0, 5).map((task) => ({
      id: `task-${task.id}`,
      type: "task" as const,
      title: task.status === "overdue" ? "Overdue care task" : "Due care task",
      detail: task.title,
      personnelId: task.personnelId,
    })),
    ...upcomingBirthdays.slice(0, 5).map((person) => ({
      id: `birthday-${person.id}`,
      type: "birthday" as const,
      title: "Upcoming birthday",
      detail: person.name,
      personnelId: person.id,
    })),
  ];
}

export function getRecentCheckInCount(
  activities: ActivityLogEntry[],
  now = new Date(),
  days = 30,
): number {
  return activities.filter((activity) => {
    const daysSince = safeDaysSince(activity.date, now);
    return typeof daysSince === "number" && daysSince >= 0 && daysSince <= days;
  }).length;
}

export function getOpenInterventionsCount(personnel: CarePersonnel[]): number {
  return personnel.filter((person) => person.careGaps.length > 0).length;
}
