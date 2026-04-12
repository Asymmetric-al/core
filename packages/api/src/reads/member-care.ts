import { getAdminClient } from "@asym/database/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";

export type MemberCarePriority =
  | "Healthy"
  | "Needs Attention"
  | "At Risk"
  | "Crisis";

export type MemberCarePersonnel = {
  id: string;
  name: string;
  location: string;
  timezone: string;
  status: MemberCarePriority;
  lastCheckIn: string;
  initials: string;
  avatarUrl?: string;
  role: string;
  region:
    | "Africa"
    | "SE Asia"
    | "Europe"
    | "Latin America"
    | "Middle East"
    | "North America";
  healthSignals: {
    emotional: number;
    spiritual: number;
    physical: number;
    financial: number;
  };
  careGaps: string[];
  manualAttention?: boolean;
};

export type MemberCareActivity = {
  id: string;
  personnelId: string;
  type:
    | "Video Call"
    | "In-Person Visit"
    | "Check-in"
    | "Pastoral Note"
    | "Care Plan Update"
    | "Crisis Intervention"
    | "Birthday"
    | "Prayer Request";
  content: string;
  date: string;
  authorId: string;
  authorName: string;
  isPrivate: boolean;
};

export type MemberCareDashboardSnapshot = {
  personnel: MemberCarePersonnel[];
  activities: MemberCareActivity[];
};

function applyCache(tags: string[]): void {
  try {
    cacheLife("minutes");
    for (const tag of tags) {
      cacheTag(tag);
    }
  } catch {
    // noop outside Next cache runtime
  }
}

function toRegion(
  value: string | null | undefined,
): MemberCarePersonnel["region"] {
  const source = (value ?? "").toLowerCase();
  if (source.includes("africa")) return "Africa";
  if (source.includes("asia")) return "SE Asia";
  if (source.includes("europe")) return "Europe";
  if (source.includes("latin")) return "Latin America";
  if (source.includes("middle")) return "Middle East";
  if (source.includes("north")) return "North America";
  return "SE Asia";
}

function toPriority(value: string | null | undefined): MemberCarePriority {
  const source = (value ?? "").toLowerCase();
  if (source === "critical" || source === "crisis") return "Crisis";
  if (source === "at_risk" || source === "at risk") return "At Risk";
  if (source === "needs_attention" || source === "needs attention") {
    return "Needs Attention";
  }
  return "Healthy";
}

function initialsFor(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return `${parts[0]?.[0] ?? "?"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function toActivityType(
  value: string | null | undefined,
): MemberCareActivity["type"] {
  const source = (value ?? "").toLowerCase();
  if (source.includes("video")) return "Video Call";
  if (source.includes("visit") || source.includes("in_person"))
    return "In-Person Visit";
  if (source.includes("pastoral") || source.includes("note"))
    return "Pastoral Note";
  if (source.includes("care_plan")) return "Care Plan Update";
  if (source.includes("crisis")) return "Crisis Intervention";
  if (source.includes("birthday")) return "Birthday";
  if (source.includes("prayer")) return "Prayer Request";
  return "Check-in";
}

function toHealthSignals(input: unknown): MemberCarePersonnel["healthSignals"] {
  if (!input || typeof input !== "object") {
    return {
      emotional: 50,
      spiritual: 50,
      physical: 50,
      financial: 50,
    };
  }

  const value = input as Record<string, unknown>;

  return {
    emotional:
      typeof value.emotional === "number" ? Math.round(value.emotional) : 50,
    spiritual:
      typeof value.spiritual === "number" ? Math.round(value.spiritual) : 50,
    physical:
      typeof value.physical === "number" ? Math.round(value.physical) : 50,
    financial:
      typeof value.financial === "number" ? Math.round(value.financial) : 50,
  };
}

export async function readMemberCareDirectory(
  tenantId: string,
): Promise<MemberCarePersonnel[]> {
  "use cache";

  applyCache([
    "member-care",
    `member-care:${tenantId}`,
    "member-care:directory",
  ]);

  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable.");
  }

  const { data, error: readError } = await client
    .from("missionaries")
    .select(
      "id, first_name, last_name, location, timezone, health_status, last_check_in, avatar_url, ministry_focus, region, care_gaps, manual_attention, health_signals",
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(250);

  if (readError) {
    throw new Error(
      readError.message || "Failed to read member care directory.",
    );
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;

  return rows.map((row) => {
    const name =
      [row.first_name, row.last_name]
        .filter(
          (part): part is string => typeof part === "string" && part.length > 0,
        )
        .join(" ") || "Unknown Member";

    return {
      id: String(row.id ?? ""),
      name,
      location:
        typeof row.location === "string" ? row.location : "Unknown location",
      timezone: typeof row.timezone === "string" ? row.timezone : "UTC",
      status: toPriority(
        typeof row.health_status === "string" ? row.health_status : undefined,
      ),
      lastCheckIn:
        typeof row.last_check_in === "string"
          ? row.last_check_in
          : new Date(0).toISOString(),
      initials: initialsFor(name),
      avatarUrl:
        typeof row.avatar_url === "string" ? row.avatar_url : undefined,
      role:
        typeof row.ministry_focus === "string" && row.ministry_focus.length > 0
          ? row.ministry_focus
          : "Missionary",
      region: toRegion(typeof row.region === "string" ? row.region : undefined),
      healthSignals: toHealthSignals(row.health_signals),
      careGaps: Array.isArray(row.care_gaps)
        ? row.care_gaps.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      manualAttention: Boolean(row.manual_attention),
    };
  });
}

export async function readMemberCareActivities(
  tenantId: string,
): Promise<MemberCareActivity[]> {
  "use cache";

  applyCache([
    "member-care",
    `member-care:${tenantId}`,
    "member-care:activity",
  ]);

  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable.");
  }

  const { data, error: readError } = await client
    .from("activities")
    .select(
      "id, entity_id, type, description, title, date, author_id, author_name, is_private",
    )
    .eq("tenant_id", tenantId)
    .eq("entity_type", "missionary")
    .order("date", { ascending: false })
    .limit(500);

  if (readError) {
    throw new Error(
      readError.message || "Failed to read member care activity.",
    );
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id ?? ""),
    personnelId: String(row.entity_id ?? ""),
    type: toActivityType(typeof row.type === "string" ? row.type : undefined),
    content:
      typeof row.description === "string"
        ? row.description
        : typeof row.title === "string"
          ? row.title
          : "Care activity",
    date: typeof row.date === "string" ? row.date : new Date(0).toISOString(),
    authorId: typeof row.author_id === "string" ? row.author_id : "unknown",
    authorName:
      typeof row.author_name === "string" ? row.author_name : "Unknown",
    isPrivate: Boolean(row.is_private),
  }));
}

export async function readMemberCareDashboardSnapshot(
  tenantId: string,
): Promise<MemberCareDashboardSnapshot> {
  const [personnel, activities] = await Promise.all([
    readMemberCareDirectory(tenantId),
    readMemberCareActivities(tenantId),
  ]);

  return { personnel, activities };
}

export async function readMemberCarePersonDetail(
  tenantId: string,
  personnelId: string,
): Promise<{
  personnel: MemberCarePersonnel | null;
  activities: MemberCareActivity[];
}> {
  const [personnel, activities] = await Promise.all([
    readMemberCareDirectory(tenantId),
    readMemberCareActivities(tenantId),
  ]);

  return {
    personnel: personnel.find((item) => item.id === personnelId) ?? null,
    activities: activities.filter((item) => item.personnelId === personnelId),
  };
}
