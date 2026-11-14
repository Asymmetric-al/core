"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { UserRound } from "lucide-react";

import { DEFAULT_ROUTINE_INTERVAL_DAYS } from "../member-care.derived";
import { getDaysSince } from "../utils";

import type { ActivityType, CarePersonnel, CarePriority } from "../types";

/** Care statuses in sentence case, most urgent last. */
export const CARE_STATUS_LABELS: Record<CarePriority, string> = {
  Healthy: "Healthy",
  "Needs Attention": "Needs attention",
  "At Risk": "At risk",
  Crisis: "Crisis",
};

export const CARE_STATUS_ORDER: CarePriority[] = [
  "Crisis",
  "At Risk",
  "Needs Attention",
  "Healthy",
];

const CARE_STATUS_VARIANTS = {
  Healthy: "success",
  "Needs Attention": "info",
  "At Risk": "warning",
  Crisis: "destructive",
} as const satisfies Record<CarePriority, string>;

/** The one care status badge, used in lists, the overview and profiles. */
export function CareStatusBadge({ status }: { status: CarePriority }) {
  return (
    <Badge variant={CARE_STATUS_VARIANTS[status]}>
      {CARE_STATUS_LABELS[status]}
    </Badge>
  );
}

/** Days since the last check-in, in words ("Today", "34 days ago"). */
export function formatLastContact(lastCheckIn: string | null): string {
  const elapsed = getDaysSince(lastCheckIn);
  if (elapsed === null) return "No check-in yet";
  const days = Math.max(0, elapsed);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

/** A routine check-in is overdue after 30 days without contact. */
export const CHECK_IN_INTERVAL_DAYS = DEFAULT_ROUTINE_INTERVAL_DAYS;

export function isCheckInOverdue(lastCheckIn: string | null): boolean {
  const days = getDaysSince(lastCheckIn);
  return days === null || days > CHECK_IN_INTERVAL_DAYS;
}

export function CarePersonAvatar({
  person,
  size = "default",
}: {
  person: Pick<CarePersonnel, "avatarUrl" | "initials" | "name">;
  size?: "default" | "sm" | "lg";
}) {
  return (
    <Avatar size={size}>
      {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt="" /> : null}
      <AvatarFallback>
        {person.initials || <UserRound aria-hidden="true" className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );
}

export function careMemberContext(
  person: Pick<CarePersonnel, "role" | "location">,
): string {
  return [person.role, person.location].filter(Boolean).join(" · ");
}

export function careProfileHref(personId: string) {
  return `/care/directory/${encodeURIComponent(personId)}`;
}

/** Activity types read in sentence case wherever they are shown. */
export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  "Video Call": "Video call",
  "In-Person Visit": "In-person visit",
  "Check-in": "Check-in",
  "Pastoral Note": "Pastoral note",
  "Care Plan Update": "Care plan update",
  "Crisis Intervention": "Crisis intervention",
  Birthday: "Birthday",
  "Prayer Request": "Prayer request",
};
