/**
 * Care Feature Mock Data
 *
 * Uses centralized mock data with type mapping for the care module.
 */

import { MISSIONARIES, ACTIVITIES } from "@/lib/mock-data";
import type { CarePersonnel, ActivityLogEntry } from "./types";

function mapHealthStatus(status: string): "Healthy" | "At Risk" | "Crisis" {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "at_risk":
      return "At Risk";
    case "critical":
      return "Crisis";
    default:
      return "Healthy";
  }
}

function mapRegion(
  region: string,
):
  | "Africa"
  | "SE Asia"
  | "Europe"
  | "Latin America"
  | "Middle East"
  | "North America" {
  if (region.includes("Africa")) return "Africa";
  if (region.includes("Asia")) return "SE Asia";
  if (region.includes("Europe")) return "Europe";
  if (region.includes("Latin")) return "Latin America";
  return "SE Asia";
}

export const MOCK_PERSONNEL: CarePersonnel[] = MISSIONARIES.map((m) => ({
  id: m.id,
  name: m.title,
  location: m.location,
  timezone: m.timezone,
  status: mapHealthStatus(m.healthStatus),
  lastCheckIn: m.lastCheckIn,
  initials: m.firstName.charAt(0) + m.lastName.charAt(0),
  avatarUrl: m.avatarUrl,
  role: m.ministryFocus.split(" & ")[0] || "Ministry",
  region: mapRegion(m.region),
  healthSignals: m.healthSignals,
  careGaps: m.careGaps,
}));

export const MOCK_ACTIVITY: ActivityLogEntry[] = ACTIVITIES.filter(
  (a) => a.entityType === "missionary",
).map((a) => ({
  id: a.id,
  personnelId: a.entityId,
  type: mapActivityType(a.type),
  content: a.description || a.title,
  date: a.date,
  authorId: a.authorId,
  authorName: a.authorName,
  isPrivate: a.isPrivate,
}));

function mapActivityType(
  type: string,
): "Video Call" | "Pastoral Note" | "Check-in" | "Care Plan Update" {
  switch (type) {
    case "video_call":
      return "Video Call";
    case "pastoral_note":
      return "Pastoral Note";
    case "call":
      return "Check-in";
    case "note":
      return "Pastoral Note";
    default:
      return "Check-in";
  }
}
