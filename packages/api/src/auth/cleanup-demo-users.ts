import { getAdminClient } from "@asym/database/supabase/admin";
import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";

const MONEY_TABLES = [
  "donations",
  "donor_pledges",
  "staged_gifts",
  "staged_gift_allocations",
  "donation_saga_outbox",
] as const;

type AdminClient = NonNullable<ReturnType<typeof getAdminClient>["client"]>;

async function hasGivingHistory(supabase: AdminClient, userId: string) {
  const ids = async (table: "missionaries" | "donors") => {
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq("profile_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: { id: string }) => row.id);
  };
  const named = async (table: string, column: string, values: string[]) => {
    if (values.length === 0) return false;
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .in(column, values);
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  };
  const [missionaryIds, donorIds] = await Promise.all([
    ids("missionaries"),
    ids("donors"),
  ]);
  for (const table of MONEY_TABLES)
    if (await named(table, "missionary_id", missionaryIds)) return true;
  for (const table of [
    "donations",
    "donor_pledges",
    "staged_gifts",
    "donation_saga_outbox",
  ])
    if (await named(table, "donor_id", donorIds)) return true;
  return false;
}

export async function POST(request: Request) {
  const cronSecret = serverEnv.CRON_SECRET;
  // Fail CLOSED: this endpoint deletes users via the admin (RLS-bypass) client
  // and middleware exempts /api/*. If no CRON_SECRET is configured it must
  // refuse rather than run unauthenticated. (finding 06 Gap 1)
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Endpoint not configured" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { client: supabase, error: adminError } = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error listing users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const demoUsersToDelete = users.users.filter((user) => {
      const isDemo = user.email?.startsWith("demo-");
      const createdAt = new Date(user.created_at).getTime();
      return isDemo && createdAt < twentyFourHoursAgo;
    });

    console.log(`Found ${demoUsersToDelete.length} demo users to delete`);

    const deletedUsers: string[] = [];
    const retained: { id: string; reason: "giving history" }[] = [];
    const errors: { id: string; error: string }[] = [];

    for (const user of demoUsersToDelete) {
      if (await hasGivingHistory(supabase, user.id)) {
        retained.push({ id: user.id, reason: "giving history" });
        continue;
      }
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user.id,
      );
      if (deleteError) {
        console.error(`Error deleting user ${user.id}:`, deleteError);
        errors.push({ id: user.id, error: deleteError.message });
      } else {
        deletedUsers.push(user.id);
      }
    }

    return NextResponse.json(
      {
        success: errors.length === 0,
        deletedCount: deletedUsers.length,
        deletedIds: deletedUsers,
        retained: retained.length > 0 ? retained : undefined,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: errors.length === 0 ? 200 : 500 },
    );
  } catch (error) {
    console.error("Cleanup internal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
