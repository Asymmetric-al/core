import {
  addDays,
  differenceInCalendarDays,
  parseISO,
  startOfDay,
} from "date-fns";

import type {
  AttentionGap,
  CareRequirement,
  CarePlanTask,
  DashboardNotification,
  MemberCareDerivationInput,
} from "./member-care.types";
import type { ActivityLogEntry, ActivityType, CarePersonnel } from "./types";

export const DEFAULT_ROUTINE_INTERVAL_DAYS = 30;

/** The overview lists birthdays falling within this many days. */
export const UPCOMING_BIRTHDAY_WINDOW_DAYS = 14;

/** The overview counts care activity logged within this many days. */
export const RECENT_CHECK_IN_WINDOW_DAYS = 30;

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
  date: string | null | undefined,
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
  windowDays = UPCOMING_BIRTHDAY_WINDOW_DAYS,
): CarePersonnel[] {
  const today = startOfDay(now);
  const end = addDays(today, windowDays);

  return personnel
    .filter((person) => {
      const birthday = person.birthDate;
      if (!birthday) return false;
      const parsed = toDate(birthday);
      if (Number.isNaN(parsed.getTime())) return false;

      const nextBirthday = new Date(
        now.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
      );
      if (nextBirthday < today) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }

      return nextBirthday >= today && nextBirthday <= end;
    })
    .sort((a, b) => {
      const aDate = toDate(a.birthDate!);
      const bDate = toDate(b.birthDate!);
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
      if (nextA < today) nextA.setFullYear(now.getFullYear() + 1);
      if (nextB < today) nextB.setFullYear(now.getFullYear() + 1);
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
        isLoggedContact(entry) &&
        entry.personnelId === personnelId &&
        Number.isFinite(toDate(entry.date).getTime()) &&
        (!type || entry.type === type),
    )
    .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())[0];
}

export function isLoggedContact(entry: ActivityLogEntry): boolean {
  return entry.kind !== "thread";
}

export function getLastContactDate(
  person: Pick<CarePersonnel, "id" | "lastCheckIn">,
  activities: ActivityLogEntry[],
  lastContacts?: MemberCareDerivationInput["lastContacts"],
): string | null {
  const personContacts = lastContacts?.[person.id];
  const candidates = [
    person.lastCheckIn,
    ...(personContacts
      ? Object.values(personContacts)
      : [getLatestActivityByPersonnel(activities, person.id)?.date]),
  ].filter(
    (value): value is string =>
      typeof value === "string" &&
      Number.isFinite(toDate(value).getTime()) &&
      toDate(value).getTime() > 0,
  );
  return (
    candidates.sort((a, b) => toDate(b).getTime() - toDate(a).getTime())[0] ??
    null
  );
}

export function toCareRequirements(
  requirements: NonNullable<MemberCareDerivationInput["requirements"]>,
): CareRequirement[] {
  const unique = new Map<string, CareRequirement>();
  for (const requirement of requirements) {
    const key = `${requirement.personnelId}:${requirement.activityType}`;
    const previous = unique.get(key);
    if (
      !previous ||
      (requirement.intervalDays ??
        getIntervalDaysForActivity(requirement.activityType)) <
        (previous.intervalDays ??
          getIntervalDaysForActivity(previous.activityType))
    ) {
      unique.set(key, requirement);
    }
  }
  return [...unique.values()];
}

const SEVERITY_RANK = { critical: 0, high: 1, moderate: 2 };

export function getAttentionGaps({
  personnel,
  activities,
  requirements = [],
  lastContacts,
  now = new Date(),
}: Pick<
  MemberCareDerivationInput,
  "personnel" | "activities" | "requirements" | "lastContacts" | "now"
>): AttentionGap[] {
  const gaps: AttentionGap[] = [];
  const cadences = toCareRequirements(requirements);
  for (const person of personnel) {
    const lastContactDays = safeDaysSince(
      getLastContactDate(person, activities, lastContacts),
      now,
    );
    const base = {
      personnelId: person.id,
      personnelName: person.name,
      status: person.status,
      daysSinceLastContact: lastContactDays,
    };
    if (person.manualAttention) {
      gaps.push({
        ...base,
        reason: "manual_attention",
        reasonLabel: "Flagged for attention",
        daysOverdue: 0,
        severity: "critical",
      });
      continue;
    }
    if (isCriticalStatus(person.status)) {
      gaps.push({
        ...base,
        reason: "status",
        reasonLabel: person.status === "Crisis" ? "Crisis" : "At risk",
        daysOverdue: 0,
        severity: "critical",
      });
      continue;
    }
    if (lastContactDays === undefined) {
      gaps.push({
        ...base,
        reason: "never_contacted",
        reasonLabel: "No care contact recorded",
        daysOverdue: DEFAULT_ROUTINE_INTERVAL_DAYS,
        severity: "high",
      });
      continue;
    }
    const saved = cadences.filter((r) => r.personnelId === person.id);
    if (saved.length === 0) {
      if (lastContactDays > DEFAULT_ROUTINE_INTERVAL_DAYS)
        gaps.push({
          ...base,
          reason: "routine_checkin",
          reasonLabel: `No contact for ${lastContactDays} days`,
          daysOverdue: lastContactDays - DEFAULT_ROUTINE_INTERVAL_DAYS,
          severity: "moderate",
        });
      continue;
    }
    const personContacts = lastContacts?.[person.id];
    for (const requirement of saved) {
      const date = personContacts
        ? personContacts[requirement.activityType]
        : getLatestActivityByPersonnel(
            activities,
            person.id,
            requirement.activityType,
          )?.date;
      const days = safeDaysSince(date, now);
      const interval =
        requirement.intervalDays ??
        getIntervalDaysForActivity(requirement.activityType);
      const label =
        requirement.label ??
        requirement.activityType.charAt(0) +
          requirement.activityType.slice(1).toLowerCase();
      if (days === undefined || requirement.neverMet) {
        gaps.push({
          ...base,
          reason: "never_met_requirement",
          reasonLabel: `Never met: ${label}`,
          daysOverdue: interval,
          severity: "high",
        });
      } else if (days > interval) {
        gaps.push({
          ...base,
          reason: "requirement_gap",
          reasonLabel: `${label} overdue`,
          daysOverdue: days - interval,
          severity: days - interval > 14 ? "critical" : "high",
        });
      }
    }
  }
  return gaps.sort((a, b) => {
    const priority = (gap: AttentionGap) =>
      gap.reason === "manual_attention"
        ? 0
        : gap.reason === "status"
          ? gap.status === "Crisis"
            ? 1
            : 2
          : 3;
    return (
      priority(a) - priority(b) ||
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      b.daysOverdue - a.daysOverdue
    );
  });
}

export function getPeopleNeedingAttention(
  input: MemberCareDerivationInput,
): AttentionGap[] {
  const seen = new Set<string>();
  return getAttentionGaps(input).filter((gap) => {
    if (seen.has(gap.personnelId)) return false;
    seen.add(gap.personnelId);
    return true;
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
    .flatMap((task) => {
      if (task.status === "completed") return [];
      const isPastDue = toDate(task.dueDate) < now;
      return [
        {
          ...task,
          status:
            isPastDue && task.status === "pending"
              ? ("overdue" as const)
              : task.status,
        },
      ];
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
  days = RECENT_CHECK_IN_WINDOW_DAYS,
): number {
  return activities.filter((activity) => {
    if (!isLoggedContact(activity)) return false;
    const daysSince = safeDaysSince(activity.date, now);
    return typeof daysSince === "number" && daysSince >= 0 && daysSince <= days;
  }).length;
}

export function getOpenInterventionsCount(personnel: CarePersonnel[]): number {
  return personnel.filter((person) => person.careGaps.length > 0).length;
}
