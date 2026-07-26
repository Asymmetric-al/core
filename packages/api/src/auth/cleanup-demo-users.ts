import { getAdminClient } from "@asym/database/supabase/admin";
import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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
    const errors: { id: string; error: string }[] = [];

    for (const user of demoUsersToDelete) {
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

    return NextResponse.json({
      success: true,
      deletedCount: deletedUsers.length,
      deletedIds: deletedUsers,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cleanup internal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
