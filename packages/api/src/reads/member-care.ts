import { z } from "zod";

import type { RequestSessionClient } from "../shared/request-session-client";

type QueryError = { message?: string; code?: string } | null;

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

const regionSchema = z.enum([
  "Africa",
  "SE Asia",
  "Europe",
  "Latin America",
  "Middle East",
  "North America",
]);

const PG_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const directoryRpcRowSchema = z.object({
  id: z.string().regex(PG_UUID_REGEX),
  location: z.string().nullable(),
  timezone: z.string().nullable(),
  health_status: z.string().nullable(),
  last_check_in: z.string().nullable(),
  manual_attention: z.boolean().nullable(),
  region: regionSchema,
  mission_field: z.string().nullable(),
  health_signals: z.unknown(),
  birth_date: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  full_name: z.string().nullable(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  total_count: z.coerce.number().int().nonnegative(),
});

type DirectoryRpcRow = z.infer<typeof directoryRpcRowSchema>;

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

function toQueryError(
  error: QueryError,
  fallback: string,
): Error & { code?: string } {
  const err = new Error(error?.message || fallback) as Error & {
    code?: string;
  };
  if (typeof error?.code === "string") {
    err.code = error.code;
  }
  return err;
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

function displayNameFor(row: DirectoryRpcRow): string {
  const explicit = row.display_name?.trim() || row.full_name?.trim() || "";

  if (explicit) {
    return explicit;
  }

  return [row.first_name, row.last_name]
    .filter(
      (part): part is string => typeof part === "string" && part.length > 0,
    )
    .join(" ")
    .trim();
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

function toPersonnel(row: DirectoryRpcRow): MemberCarePersonnel {
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
    avatarUrl: row.avatar_url ?? undefined,
    role: row.mission_field?.trim() || "Missionary",
    region: row.region,
    healthSignals: toHealthSignals(row.health_signals),
    careGaps: [],
    manualAttention: row.manual_attention ?? false,
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
    activityType: toActivityType(row.activity_type),
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

async function readDirectoryRows(
  sessionClient: RequestSessionClient,
  tenantId: string,
) {
  const { data, error } = await sessionClient.rpc(
    "member_care_directory_rows",
    {
      p_tenant_id: tenantId,
      p_personnel_id: null,
      p_limit: MEMBER_CARE_DIRECTORY_LIMIT,
    },
  );

  if (error) {
    throw toQueryError(error, "Failed to read member care directory.");
  }

  const rows = z.array(directoryRpcRowSchema).parse(data ?? []);
  const total =
    rows.length === 0 ? 0 : Math.max(rows[0]!.total_count, rows.length);
  return { rows, total };
}

async function readDirectoryRowById(
  sessionClient: RequestSessionClient,
  tenantId: string,
  personnelId: string,
): Promise<DirectoryRpcRow | null> {
  const { data, error } = await sessionClient.rpc(
    "member_care_directory_rows",
    {
      p_tenant_id: tenantId,
      p_personnel_id: personnelId,
      p_limit: 1,
    },
  );

  if (error) {
    throw toQueryError(error, "Failed to read member care profile.");
  }

  const rows = z.array(directoryRpcRowSchema).parse(data ?? []);
  return rows[0] ?? null;
}

async function readActivityRows(
  sessionClient: RequestSessionClient,
  tenantId: string,
  missionaryId?: string,
) {
  let query = sessionClient
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
    throw toQueryError(error, "Failed to read member care activities.");
  }

  return (data ?? []) as ActivityRow[];
}

async function readGoalRows(
  sessionClient: RequestSessionClient,
  tenantId: string,
  missionaryId?: string,
) {
  let query = sessionClient
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
    throw toQueryError(error, "Failed to read member care goals.");
  }

  const rows = (data ?? []) as GoalRow[];
  if (rows.length === 1000) {
    console.warn(
      "member-care: member_care_goals query hit its row limit; results may be truncated.",
    );
  }
  return rows;
}

async function readRequirementRows(
  sessionClient: RequestSessionClient,
  tenantId: string,
  missionaryId?: string,
) {
  let query = sessionClient
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
    throw toQueryError(error, "Failed to read member care requirements.");
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
  sessionClient: RequestSessionClient,
  tenantId: string,
  actorUserId: string,
  missionaryId?: string,
) {
  let query = sessionClient
    .from("member_care_private_notes")
    .select(
      "id, missionary_id, author_user_id, author_name_snapshot, content, created_at",
    )
    .eq("tenant_id", tenantId)
    .eq("author_user_id", actorUserId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (missionaryId) {
    query = query.eq("missionary_id", missionaryId);
  }

  const { data, error } = await query;

  if (error) {
    throw toQueryError(error, "Failed to read member care private notes.");
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
  sessionClient: RequestSessionClient,
  tenantId: string,
): Promise<{ personnel: MemberCarePersonnel[]; total: number }> {
  const [directoryRows, goalRows, requirementRows] = await Promise.all([
    readDirectoryRows(sessionClient, tenantId),
    readGoalRows(sessionClient, tenantId),
    readRequirementRows(sessionClient, tenantId),
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
  sessionClient: RequestSessionClient,
  tenantId: string,
): Promise<MemberCarePersonnel[]> {
  return (await readMemberCareDirectorySnapshot(sessionClient, tenantId))
    .personnel;
}

export async function readMemberCareActivities(
  sessionClient: RequestSessionClient,
  tenantId: string,
  missionaryId?: string,
): Promise<MemberCareActivity[]> {
  const rows = await readActivityRows(sessionClient, tenantId, missionaryId);
  return rows.map(toActivity);
}

async function readLastContacts(
  sessionClient: RequestSessionClient,
  tenantId: string,
): Promise<MemberCareLastContacts> {
  const select = [
    "id",
    ...ACTIVITY_DB_TYPES.map(
      (type) => `${type}:member_care_activities(occurred_at)`,
    ),
  ].join(", ");
  let query = sessionClient
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
    throw toQueryError(error, "Failed to read member care last contacts.");
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
  sessionClient: RequestSessionClient,
  tenantId: string,
): Promise<MemberCareDashboardSnapshot> {
  const [directoryRows, activityRows, goalRows, requirementRows, lastContacts] =
    await Promise.all([
      readDirectoryRows(sessionClient, tenantId),
      readActivityRows(sessionClient, tenantId),
      readGoalRows(sessionClient, tenantId),
      readRequirementRows(sessionClient, tenantId),
      readLastContacts(sessionClient, tenantId),
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
  sessionClient: RequestSessionClient,
  tenantId: string,
  personnelId: string,
  actorUserId: string,
): Promise<MemberCarePersonDetail> {
  const [
    personnelRow,
    activityRows,
    privateNoteRows,
    goalRows,
    requirementRows,
  ] = await Promise.all([
    readDirectoryRowById(sessionClient, tenantId, personnelId),
    readActivityRows(sessionClient, tenantId, personnelId),
    readPrivateNoteRows(sessionClient, tenantId, actorUserId, personnelId),
    readGoalRows(sessionClient, tenantId, personnelId),
    readRequirementRows(sessionClient, tenantId, personnelId),
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
