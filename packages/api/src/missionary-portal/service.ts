import {
  buildMissionaryPortalSnapshot,
  mapMissionaryTask,
  type MissionaryPortalDonationRow,
  type MissionaryPortalDonorRow,
  type MissionaryPortalMissionaryRow,
  type MissionaryPortalPostRow,
  type MissionaryPortalProfileRow,
  type MissionaryPortalSnapshot,
  type MissionaryPortalTask,
  type MissionaryPortalTaskRow,
} from "./model";
import { ApiHttpError } from "../shared/http-errors";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseError = {
  code?: string;
  message: string;
};

type SupabaseResult<T> = {
  data: T | null;
  error: SupabaseError | null;
};

const PROFILE_SELECT =
  "id, email, first_name, last_name, full_name, display_name, phone, avatar_url";

const MISSIONARY_SELECT = `
  id,
  tenant_id,
  profile_id,
  bio,
  mission_field,
  funding_goal,
  current_funding,
  tagline,
  location,
  phone,
  timezone,
  region,
  cover_url,
  social_links
`;

const DONATION_SELECT = `
  id,
  donor_id,
  amount,
  currency,
  status,
  donation_type,
  is_recurring,
  gift_date,
  created_at
`;

const DONOR_RELATIONSHIP_SELECT = `
  id,
  name,
  email,
  phone,
  mobile,
  preferred_contact,
  avatar_url,
  location,
  status,
  total_given,
  last_gift_date,
  last_gift_amount,
  gift_count,
  frequency,
  tags,
  has_active_pledge
`;

const TASK_SELECT = `
  id,
  missionary_id,
  donor_id,
  title,
  description,
  task_type,
  status,
  priority,
  sort_key,
  due_date,
  completed_at,
  is_auto_generated,
  created_at,
  updated_at,
  donor:donors!missionary_tasks_donor_id_fkey(id, name, email, avatar_url)
`;

const POST_SELECT = `
  id,
  title,
  content,
  post_type,
  visibility,
  status,
  created_at,
  like_count,
  prayer_count,
  comment_count
`;

function assertResult<T>(
  result: SupabaseResult<T>,
  fallbackMessage: string,
): T {
  if (result.error?.code === "PGRST116") {
    throw new ApiHttpError(404, fallbackMessage);
  }

  if (result.error) {
    throw new ApiHttpError(500, result.error.message || fallbackMessage);
  }

  if (!result.data) {
    throw new ApiHttpError(404, fallbackMessage);
  }

  return result.data;
}

function assertArrayResult<T>(
  result: SupabaseResult<T[]>,
  fallbackMessage: string,
): T[] {
  if (result.error) {
    throw new ApiHttpError(500, result.error.message || fallbackMessage);
  }

  return result.data ?? [];
}

function normalizeJoinedOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function normalizeTaskRows(rows: MissionaryPortalTaskRow[]) {
  return rows.map((row) => ({
    ...row,
    donor: normalizeJoinedOne(row.donor),
  }));
}

export type MissionaryPortalContext = {
  profile: MissionaryPortalProfileRow;
  missionary: MissionaryPortalMissionaryRow;
};

export async function resolveMissionaryPortalContext(input: {
  supabaseAdmin: AdminSupabaseClient;
  profileId: string;
  tenantId: string;
}): Promise<MissionaryPortalContext> {
  const profile = assertResult(
    (await input.supabaseAdmin
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", input.profileId)
      .eq("tenant_id", input.tenantId)
      .single()) as SupabaseResult<MissionaryPortalProfileRow>,
    "Missionary profile not found",
  );

  const missionary = assertResult(
    (await input.supabaseAdmin
      .from("missionaries")
      .select(MISSIONARY_SELECT)
      .eq("profile_id", input.profileId)
      .eq("tenant_id", input.tenantId)
      .single()) as SupabaseResult<MissionaryPortalMissionaryRow>,
    "Missionary record not found",
  );

  return { profile, missionary };
}

export async function getMissionaryPortalSnapshot(input: {
  supabaseAdmin: AdminSupabaseClient;
  profileId: string;
  tenantId: string;
}): Promise<MissionaryPortalSnapshot> {
  const { profile, missionary } = await resolveMissionaryPortalContext(input);

  const [donationsResult, donorsResult, tasksResult, postsResult] =
    await Promise.all([
      input.supabaseAdmin
        .from("donations")
        .select(DONATION_SELECT)
        .eq("tenant_id", input.tenantId)
        .eq("missionary_id", missionary.id)
        .order("gift_date", { ascending: false })
        .limit(250) as unknown as Promise<
        SupabaseResult<MissionaryPortalDonationRow[]>
      >,
      input.supabaseAdmin
        .from("donors")
        .select(DONOR_RELATIONSHIP_SELECT)
        .eq("tenant_id", input.tenantId)
        .eq("missionary_id", input.profileId)
        .order("last_gift_date", { ascending: false, nullsFirst: false })
        .limit(250) as unknown as Promise<
        SupabaseResult<MissionaryPortalDonorRow[]>
      >,
      input.supabaseAdmin
        .from("missionary_tasks")
        .select(TASK_SELECT)
        .eq("missionary_id", input.profileId)
        .order("sort_key", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(100) as unknown as Promise<
        SupabaseResult<MissionaryPortalTaskRow[]>
      >,
      input.supabaseAdmin
        .from("posts")
        .select(POST_SELECT)
        .eq("tenant_id", input.tenantId)
        .eq("missionary_id", input.profileId)
        .order("created_at", { ascending: false })
        .limit(10) as unknown as Promise<
        SupabaseResult<MissionaryPortalPostRow[]>
      >,
    ]);

  return buildMissionaryPortalSnapshot({
    profile,
    missionary,
    donations: assertArrayResult(
      donationsResult,
      "Unable to load missionary gifts",
    ),
    donors: assertArrayResult(
      donorsResult,
      "Unable to load missionary donor relationships",
    ),
    tasks: normalizeTaskRows(
      assertArrayResult(tasksResult, "Unable to load missionary tasks"),
    ),
    posts: assertArrayResult(postsResult, "Unable to load ministry updates"),
  });
}

export async function listMissionaryTasks(input: {
  supabaseAdmin: AdminSupabaseClient;
  profileId: string;
  donorId?: string | null;
}): Promise<MissionaryPortalTask[]> {
  let query = input.supabaseAdmin
    .from("missionary_tasks")
    .select(TASK_SELECT)
    .eq("missionary_id", input.profileId)
    .order("sort_key", { ascending: true })
    .order("created_at", { ascending: false });

  if (input.donorId) {
    query = query.eq("donor_id", input.donorId);
  }

  const rows = normalizeTaskRows(
    assertArrayResult(
      (await query) as SupabaseResult<MissionaryPortalTaskRow[]>,
      "Unable to load missionary tasks",
    ),
  );

  return rows.map(mapMissionaryTask);
}

export async function assertMissionaryDonorAccess(input: {
  supabaseAdmin: AdminSupabaseClient;
  donorId: string;
  profileId: string;
  tenantId: string;
}) {
  const result = (await input.supabaseAdmin
    .from("donors")
    .select("id")
    .eq("id", input.donorId)
    .eq("tenant_id", input.tenantId)
    .eq("missionary_id", input.profileId)
    .single()) as SupabaseResult<{ id: string }>;

  assertResult(result, "Donor relationship not found");
}

export async function getMissionaryTask(input: {
  supabaseAdmin: AdminSupabaseClient;
  taskId: string;
  profileId: string;
}): Promise<MissionaryPortalTask> {
  const row = assertResult(
    (await input.supabaseAdmin
      .from("missionary_tasks")
      .select(TASK_SELECT)
      .eq("id", input.taskId)
      .eq("missionary_id", input.profileId)
      .single()) as SupabaseResult<MissionaryPortalTaskRow>,
    "Missionary task not found",
  );

  return mapMissionaryTask(
    normalizeTaskRows([row])[0] as MissionaryPortalTaskRow,
  );
}
