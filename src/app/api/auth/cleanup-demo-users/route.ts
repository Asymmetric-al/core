import { getAdminClient } from "@asym/database/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Security check: Check for a secret token if this is triggered via Cron
  // You can set CRON_SECRET in your environment variables
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
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

    const deletedUsers = [];
    const errors = [];

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
