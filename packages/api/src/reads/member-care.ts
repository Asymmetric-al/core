import { getAdminClient } from "@asym/database/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";

import { MEMBER_CARE_CACHE_TAGS } from "../shared/cache-tags";

type QueryError = { message?: string } | null;

export const MEMBER_CARE_THREAD_POST_TITLE = "Care thread update";
export const MEMBER_CARE_DIRECTORY_LIMIT = 250;
export type MemberCareSignal = number | null;

export type MemberCarePriority =
  "Healthy" | "Needs Attention" | "At Risk" | "Crisis";

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
  nameMissing: boolean;
  location: string;
  timezone: string;
  status: MemberCarePriority;
  lastCheckIn: string | null;
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
    emotional: MemberCareSignal;
    spiritual: MemberCareSignal;
    physical: MemberCareSignal;
    financial: MemberCareSignal;
  };
  careGaps: string[];
  manualAttention?: boolean;
  birthDate?: string;
};

export type MemberCareActivity = {
  kind: "thread" | "activity";
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
  lastContacts: MemberCareLastContacts;
  personnelTotal: number;
  personnel: MemberCarePersonnel[];
  activities: MemberCareActivity[];
  goals: MemberCareGoal[];
  requirements: MemberCareRequirement[];
};

export type MemberCareLastContacts = Record<
  string,
  Partial<Record<MemberCareActivityType, string>>
>;

const ACTIVITY_DB_TYPES = [
  "video_call",
  "in_person_visit",
  "check_in",
  "pastoral_note",
  "care_plan_update",
  "crisis_intervention",
  "birthday",
  "prayer_request",
] as const;

type LastContactRow = { id: string } & Partial<
  Record<(typeof ACTIVITY_DB_TYPES)[number], { occurred_at: string }[]>
>;

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

  return composed;
}

function toSignal(value: unknown): MemberCareSignal {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : null;
}

function toHealthSignals(input: unknown): MemberCarePersonnel["healthSignals"] {
  const value =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  return {
    emotional: toSignal(value.emotional),
    spiritual: toSignal(value.spiritual),
    physical: toSignal(value.physical),
    financial: toSignal(value.financial),
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
    name: name || "Name not set",
    nameMissing: !name,
    location: row.location?.trim() || "Location not set",
    timezone: row.timezone || "UTC",
    status: toPriority(row.health_status),
    lastCheckIn: row.last_check_in ?? null,
    initials: name ? initialsFor(name) : "",
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
    kind: row.title === MEMBER_CARE_THREAD_POST_TITLE ? "thread" : "activity",
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
  const { data, error, count } = await client
    .from("missionaries")
    .select(
      "id, location, timezone, health_status, last_check_in, manual_attention, region, mission_field, health_signals, birth_date, profile:profiles!profile_id(first_name, last_name, full_name, display_name, avatar_url)",
      { count: "exact" },
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(MEMBER_CARE_DIRECTORY_LIMIT);

  if (error) {
    throw new Error(
      toErrorMessage(error, "Failed to read member care directory."),
    );
  }

  const rows = (data ?? []) as MissionaryDirectoryRow[];
  return { rows, total: Math.max(count ?? rows.length, rows.length) };
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
    .order("updated_at", { ascending: false })
    .limit(1000);

  if (missionaryId) {
    query = query.eq("missionary_id", missionaryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(toErrorMessage(error, "Failed to read member care goals."));
  }

  const rows = (data ?? []) as GoalRow[];
  if (rows.length === 1000) {
    console.warn(
      "member-care: member_care_goals query hit its row limit; results may be truncated.",
    );
  }
  return rows;
}

async function readRequirementRows(tenantId: string, missionaryId?: string) {
  const client = await getMemberCareClient();
  let query = client
    .from("member_care_requirements")
    .select("id, missionary_id, activity_type, interval_days, notes")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .limit(1000);

  if (missionaryId) {
    query = query.eq("missionary_id", missionaryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      toErrorMessage(error, "Failed to read member care requirements."),
    );
  }

  const rows = (data ?? []) as RequirementRow[];
  if (rows.length === 1000) {
    console.warn(
      "member-care: member_care_requirements query hit its row limit; results may be truncated.",
    );
  }
  return rows;
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
    .order("created_at", { ascending: false })
    .limit(500);

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

  const rows = (data ?? []) as PrivateNoteRow[];
  if (rows.length === 500) {
    console.warn(
      "member-care: member_care_private_notes query hit its row limit; results may be truncated.",
    );
  }
  return rows;
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

export async function readMemberCareDirectorySnapshot(
  tenantId: string,
): Promise<{ personnel: MemberCarePersonnel[]; total: number }> {
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

  return {
    personnel: applyGoalsAndRequirements(
      directoryRows.rows.map(toPersonnel),
      goalRows.map(toGoal),
      requirementRows.map(toRequirement),
    ),
    total: directoryRows.total,
  };
}

export async function readMemberCareDirectory(
  tenantId: string,
): Promise<MemberCarePersonnel[]> {
  return (await readMemberCareDirectorySnapshot(tenantId)).personnel;
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

async function readLastContacts(
  tenantId: string,
): Promise<MemberCareLastContacts> {
  const client = await getMemberCareClient();
  const select = [
    "id",
    ...ACTIVITY_DB_TYPES.map(
      (type) => `${type}:member_care_activities(occurred_at)`,
    ),
  ].join(", ");
  let query = client
    .from("missionaries")
    .select(select)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(MEMBER_CARE_DIRECTORY_LIMIT);
  for (const type of ACTIVITY_DB_TYPES) {
    query = query
      .eq(`${type}.type`, type)
      .eq(`${type}.tenant_id`, tenantId)
      .order("occurred_at", { referencedTable: type, ascending: false })
      .limit(1, { referencedTable: type });
  }
  const { data, error } = await query.or(
    `title.is.null,title.neq.${MEMBER_CARE_THREAD_POST_TITLE}`,
    { referencedTable: "pastoral_note" },
  );
  if (error) {
    throw new Error(
      toErrorMessage(error, "Failed to read member care last contacts."),
    );
  }
  return Object.fromEntries(
    ((data ?? []) as unknown as LastContactRow[]).map((row) => [
      row.id,
      Object.fromEntries(
        ACTIVITY_DB_TYPES.flatMap((type) => {
          const latest = row[type]?.[0]?.occurred_at;
          return latest ? [[toActivityType(type), latest]] : [];
        }),
      ),
    ]),
  );
}

export async function readMemberCareDashboardSnapshot(
  tenantId: string,
): Promise<MemberCareDashboardSnapshot> {
  "use cache";

  applyCache([
    MEMBER_CARE_CACHE_TAGS.base,
    MEMBER_CARE_CACHE_TAGS.tenant(tenantId),
    MEMBER_CARE_CACHE_TAGS.dashboard,
  ]);

  const [directoryRows, activityRows, goalRows, requirementRows, lastContacts] =
    await Promise.all([
      readDirectoryRows(tenantId),
      readActivityRows(tenantId),
      readGoalRows(tenantId),
      readRequirementRows(tenantId),
      readLastContacts(tenantId),
    ]);

  const goals = goalRows.map(toGoal);
  const requirements = requirementRows.map(toRequirement);

  return {
    lastContacts,
    personnelTotal: directoryRows.total,
    personnel: applyGoalsAndRequirements(
      directoryRows.rows.map(toPersonnel),
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
