import type { ActivityLogEntry, ActivityType, CarePersonnel } from "./types";

export type CareRequirement = {
  id: string;
  personnelId: string;
  activityType: ActivityType;
  intervalDays?: number;
  neverMet?: boolean;
  label?: string;
};

export type CareTaskStatus = "pending" | "overdue" | "completed";

export type CarePlanTask = {
  id: string;
  personnelId: string;
  title: string;
  dueDate: string;
  status: CareTaskStatus;
  priority?: "low" | "medium" | "high" | "critical";
};

export type AttentionReasonKind =
  | "manual_attention"
  | "routine_checkin"
  | "requirement_gap"
  | "never_met_requirement";

export type AttentionGap = {
  personnelId: string;
  personnelName: string;
  status: CarePersonnel["status"];
  reason: AttentionReasonKind;
  reasonLabel: string;
  daysSinceLastContact?: number;
  daysOverdue: number;
  severity: "moderate" | "high" | "critical";
};

export type DashboardNotification = {
  id: string;
  type: "attention" | "critical" | "task" | "birthday";
  title: string;
  detail: string;
  personnelId?: string;
};

export type MemberCareDerivationInput = {
  personnel: CarePersonnel[];
  activities: ActivityLogEntry[];
  requirements?: CareRequirement[];
  tasks?: CarePlanTask[];
  now?: Date;
};
