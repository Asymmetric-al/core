import { getAdminClient } from "@asym/database/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";

import { MEMBER_CARE_CACHE_TAGS } from "../shared/cache-tags";

type QueryError = { message?: string } | null;

export type MemberCarePriority =
  | "Healthy"
  | "Needs Attention"
  | "At Risk"
  | "Crisis";

export type MemberCareActivityType =
  | "Video Call"
  | "In-Person Visit"
  | "Check-in"
  | "Pastoral Note"
  | "Care Plan Update"
  | "Crisis Intervention"
  | "Birthday"
  | "Prayer Request";

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
  birthDate?: string;
};

export type MemberCareActivity = {
  id: string;
  personnelId: string;
  type: MemberCareActivityType;
  content: string;
  date: string;
  authorId: string;
  authorName: string;
  isPrivate: boolean;
};

export type MemberCarePrivateNote = {
  id: string;
  personnelId: string;
  content: string;
  date: string;
  authorId: string;
  authorName: string;
};

export type MemberCareGoal = {
  id: string;
  personnelId: string;
  title: string;
  status: "pending" | "active" | "completed";
  targetDate?: string;
};

export type MemberCareRequirement = {
  id: string;
  personnelId: string;
  activityType: MemberCareActivityType;
  intervalDays: number;
  notes?: string;
};

export type MemberCareDashboardSnapshot = {
  personnel: MemberCarePersonnel[];
  activities: MemberCareActivity[];
  goals: MemberCareGoal[];
  requirements: MemberCareRequirement[];
};

export type MemberCarePersonDetail = {
  personnel: MemberCarePersonnel | null;
  activities: MemberCareActivity[];
  privateNotes: MemberCarePrivateNote[];
  goals: MemberCareGoal[];
  requirements: MemberCareRequirement[];
};

type MissionaryDirectoryRow = {
  id: string;
  location: string | null;
  timezone: string;
  health_status: string;
  last_check_in: string | null;
  manual_attention: boolean;
  region: MemberCarePersonnel["region"];
  mission_field: string | null;
  health_signals: unknown;
  birth_date: string | null;
  profile:
    | {
        first_name: string | null;
        last_name: string | null;
        full_name: string | null;
        display_name: string | null;
        avatar_url: string | null;
      }
    | null
    | Array<{
        first_name: string | null;
        last_name: string | null;
        full_name: string | null;
        display_name: string | null;
        avatar_url: string | null;
      }>;
};

type ActivityRow = {
  id: string;
  missionary_id: string;
  author_user_id: string;
  author_name_snapshot: string | null;
  type: string;
  title: string | null;
  description: string;
  occurred_at: string;
};

type GoalRow = {
  id: string;
  missionary_id: string;
  title: string;
  status: "pending" | "active" | "completed";
  target_date: string | null;
};

type RequirementRow = {
  id: string;
  missionary_id: string;
  activity_type: string;
  interval_days: number;
  notes: string | null;
};

type PrivateNoteRow = {
  id: string;
  missionary_id: string;
  author_user_id: string;
  author_name_snapshot: string | null;
  content: string;
  created_at: string;
};

function toErrorMessage(error: QueryError, fallback: string): string {
  return error?.message || fallback;
}

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

function toPriority(value: string | null | undefined): MemberCarePriority {
  switch (value) {
    case "crisis":
      return "Crisis";
    case "at_risk":
      return "At Risk";
    case "needs_attention":
      return "Needs Attention";
    default:
      return "Healthy";
  }
}

function initialsFor(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return `${parts[0]?.[0] ?? "?"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function getProfileRecord(row: MissionaryDirectoryRow) {
  return Array.isArray(row.profile) ? (row.profile[0] ?? null) : row.profile;
}

function displayNameFor(row: MissionaryDirectoryRow): string {
  const profile = getProfileRecord(row);
  const explicit =
    profile?.display_name?.trim() || profile?.full_name?.trim() || "";

  if (explicit) {
    return explicit;
  }

  const composed = [profile?.first_name, profile?.last_name]
    .filter(
      (part): part is string => typeof part === "string" && part.length > 0,
    )
    .join(" ")
    .trim();

  return composed || "Unknown Member";
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

function toActivityType(
  value: string | null | undefined,
): MemberCareActivityType {
  switch (value) {
    case "video_call":
      return "Video Call";
    case "in_person_visit":
      return "In-Person Visit";
    case "pastoral_note":
      return "Pastoral Note";
    case "care_plan_update":
      return "Care Plan Update";
    case "crisis_intervention":
      return "Crisis Intervention";
    case "birthday":
      return "Birthday";
    case "prayer_request":
      return "Prayer Request";
    default:
      return "Check-in";
  }
}

function toActivityTypeValue(type: string): MemberCareActivityType {
  return toActivityType(type);
}

function toPersonnel(row: MissionaryDirectoryRow): MemberCarePersonnel {
  const profile = getProfileRecord(row);
  const name = displayNameFor(row);

  return {
    id: row.id,
    name,
    location: row.location?.trim() || "Unknown location",
    timezone: row.timezone || "UTC",
    status: toPriority(row.health_status),
    lastCheckIn: row.last_check_in ?? new Date(0).toISOString(),
    initials: initialsFor(name),
    avatarUrl: profile?.avatar_url ?? undefined,
    role: row.mission_field?.trim() || "Missionary",
    region: row.region,
    healthSignals: toHealthSignals(row.health_signals),
    careGaps: [],
    manualAttention: row.manual_attention,
    birthDate: row.birth_date ?? undefined,
  };
}

function toActivity(row: ActivityRow): MemberCareActivity {
  return {
    id: row.id,
    personnelId: row.missionary_id,
    type: toActivityType(row.type),
    content: row.description || row.title || "Care activity",
    date: row.occurred_at,
    authorId: row.author_user_id,
    authorName: row.author_name_snapshot || "Unknown",
    isPrivate: false,
  };
}

function toGoal(row: GoalRow): MemberCareGoal {
  return {
    id: row.id,
    personnelId: row.missionary_id,
    title: row.title,
    status: row.status,
    targetDate: row.target_date ?? undefined,
  };
}

function toRequirement(row: RequirementRow): MemberCareRequirement {
  return {
    id: row.id,
    personnelId: row.missionary_id,
    activityType: toActivityTypeValue(row.activity_type),
    intervalDays: row.interval_days,
    notes: row.notes ?? undefined,
  };
}

function toPrivateNote(row: PrivateNoteRow): MemberCarePrivateNote {
  return {
    id: row.id,
    personnelId: row.missionary_id,
    content: row.content,
    date: row.created_at,
    authorId: row.author_user_id,
    authorName: row.author_name_snapshot || "Unknown",
  };
}

async function getMemberCareClient() {
  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable.");
  }
  return client;
}

async function readDirectoryRows(tenantId: string) {
  const client = await getMemberCareClient();
  const { data, error } = await client
    .from("missionaries")
    .select(
      "id, location, timezone, health_status, last_check_in, manual_attention, region, mission_field, health_signals, birth_date, profile:profiles!profile_id(first_name, last_name, full_name, display_name, avatar_url)",
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    throw new Error(
      toErrorMessage(error, "Failed to read member care directory."),
    );
  }

  return (data ?? []) as MissionaryDirectoryRow[];
}

async function readDirectoryRowById(
  tenantId: string,
  personnelId: string,
): Promise<MissionaryDirectoryRow | null> {
  const client = await getMemberCareClient();
  const { data, error } = await client
    .from("missionaries")
    .select(
      "id, location, timezone, health_status, last_check_in, manual_attention, region, mission_field, health_signals, birth_date, profile:profiles!profile_id(first_name, last_name, full_name, display_name, avatar_url)",
    )
    .eq("tenant_id", tenantId)
    .eq("id", personnelId)
    .maybeSingle();

  if (error) {
    throw new Error(
      toErrorMessage(error, "Failed to read member care profile."),
    );
  }

  return (data as MissionaryDirectoryRow | null) ?? null;
}

async function readActivityRows(tenantId: string, missionaryId?: string) {
  const client = await getMemberCareClient();
  let query = client
    .from("member_care_activities")
    .select(
      "id, missionary_id, author_user_id, author_name_snapshot, type, title, description, occurred_at",
    )
    .eq("tenant_id", tenantId)
    .order("occurred_at", { ascending: false })
    .limit(500);

  if (missionaryId) {
    query = query.eq("missionary_id", missionaryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      toErrorMessage(error, "Failed to read member care activities."),
    );
  }

  return (data ?? []) as ActivityRow[];
}

async function readGoalRows(tenantId: string, missionaryId?: string) {
  const client = await getMemberCareClient();
  let query = client
    .from("member_care_goals")
    .select("id, missionary_id, title, status, target_date")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false });

  if (missionaryId) {
    query = query.eq("missionary_id", missionaryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(toErrorMessage(error, "Failed to read member care goals."));
  }

  return (data ?? []) as GoalRow[];
}

async function readRequirementRows(tenantId: string, missionaryId?: string) {
  const client = await getMemberCareClient();
  let query = client
    .from("member_care_requirements")
    .select("id, missionary_id, activity_type, interval_days, notes")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false });

  if (missionaryId) {
    query = query.eq("missionary_id", missionaryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      toErrorMessage(error, "Failed to read member care requirements."),
    );
  }

  return (data ?? []) as RequirementRow[];
}

async function readPrivateNoteRows(
  tenantId: string,
  actorUserId: string,
  missionaryId?: string,
  actorIsSuperAdmin = false,
) {
  const client = await getMemberCareClient();
  let query = client
    .from("member_care_private_notes")
    .select(
      "id, missionary_id, author_user_id, author_name_snapshot, content, created_at",
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (!actorIsSuperAdmin) {
    query = query.eq("author_user_id", actorUserId);
  }

  if (missionaryId) {
    query = query.eq("missionary_id", missionaryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      toErrorMessage(error, "Failed to read member care private notes."),
    );
  }

  return (data ?? []) as PrivateNoteRow[];
}

function applyGoalsAndRequirements(
  personnel: MemberCarePersonnel[],
  goals: MemberCareGoal[],
  requirements: MemberCareRequirement[],
): MemberCarePersonnel[] {
  const goalMap = new Map<string, MemberCareGoal[]>();
  const requirementMap = new Map<string, MemberCareRequirement[]>();

  for (const goal of goals) {
    const list = goalMap.get(goal.personnelId) ?? [];
    list.push(goal);
    goalMap.set(goal.personnelId, list);
  }

  for (const requirement of requirements) {
    const list = requirementMap.get(requirement.personnelId) ?? [];
    list.push(requirement);
    requirementMap.set(requirement.personnelId, list);
  }

  return personnel.map((person) => {
    const personGoals = goalMap.get(person.id) ?? [];
    const personRequirements = requirementMap.get(person.id) ?? [];
    const derivedGaps = [
      ...personGoals
        .filter((goal) => goal.status !== "completed")
        .map((goal) => goal.title),
      ...personRequirements.map(
        (requirement) =>
          requirement.notes?.trim() ||
          `${requirement.activityType} every ${requirement.intervalDays} days`,
      ),
    ];

    return {
      ...person,
      careGaps: derivedGaps,
    };
  });
}

export async function readMemberCareDirectory(
  tenantId: string,
): Promise<MemberCarePersonnel[]> {
  "use cache";

  applyCache([
    MEMBER_CARE_CACHE_TAGS.base,
    MEMBER_CARE_CACHE_TAGS.tenant(tenantId),
    MEMBER_CARE_CACHE_TAGS.directory,
  ]);

  const [directoryRows, goalRows, requirementRows] = await Promise.all([
    readDirectoryRows(tenantId),
    readGoalRows(tenantId),
    readRequirementRows(tenantId),
  ]);

  return applyGoalsAndRequirements(
    directoryRows.map(toPersonnel),
    goalRows.map(toGoal),
    requirementRows.map(toRequirement),
  );
}

export async function readMemberCareActivities(
  tenantId: string,
  missionaryId?: string,
): Promise<MemberCareActivity[]> {
  "use cache";

  applyCache([
    MEMBER_CARE_CACHE_TAGS.base,
    MEMBER_CARE_CACHE_TAGS.tenant(tenantId),
    MEMBER_CARE_CACHE_TAGS.activity,
    ...(missionaryId
      ? [MEMBER_CARE_CACHE_TAGS.activityForMissionary(missionaryId)]
      : []),
  ]);

  const rows = await readActivityRows(tenantId, missionaryId);
  return rows.map(toActivity);
}

export async function readMemberCareDashboardSnapshot(
  tenantId: string,
): Promise<MemberCareDashboardSnapshot> {
  const [directoryRows, activityRows, goalRows, requirementRows] =
    await Promise.all([
      readDirectoryRows(tenantId),
      readActivityRows(tenantId),
      readGoalRows(tenantId),
      readRequirementRows(tenantId),
    ]);

  const goals = goalRows.map(toGoal);
  const requirements = requirementRows.map(toRequirement);

  return {
    personnel: applyGoalsAndRequirements(
      directoryRows.map(toPersonnel),
      goals,
      requirements,
    ),
    activities: activityRows.map(toActivity),
    goals,
    requirements,
  };
}

export async function readMemberCarePersonDetail(
  tenantId: string,
  personnelId: string,
  actorUserId: string,
  actorIsSuperAdmin = false,
): Promise<MemberCarePersonDetail> {
  const [
    personnelRow,
    activityRows,
    privateNoteRows,
    goalRows,
    requirementRows,
  ] = await Promise.all([
    readDirectoryRowById(tenantId, personnelId),
    readActivityRows(tenantId, personnelId),
    readPrivateNoteRows(tenantId, actorUserId, personnelId, actorIsSuperAdmin),
    readGoalRows(tenantId, personnelId),
    readRequirementRows(tenantId, personnelId),
  ]);

  const goals = goalRows.map(toGoal);
  const requirements = requirementRows.map(toRequirement);
  const personnel = personnelRow
    ? (applyGoalsAndRequirements(
        [toPersonnel(personnelRow)],
        goals,
        requirements,
      )[0] ?? null)
    : null;

  return {
    personnel,
    activities: activityRows.map(toActivity),
    privateNotes: privateNoteRows.map(toPrivateNote),
    goals,
    requirements,
  };
}
