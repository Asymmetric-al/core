import { NextResponse } from "next/server";
import { createClient } from "@asym/database/supabase/server";
import { getAuthContext } from "@asym/auth/context";

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  try {
    const auth = await getAuthContext();
    const supabase = await createClient();

    const { data: donor } = await supabase
      .from("donors")
      .select("id")
      .eq("profile_id", auth.profileId)
      .single();

    if (!donor) {
      return NextResponse.json({
        showOrgPosts: true,
        showMissionaryPosts: true,
        followOrg: false,
        emailOrgPosts: false,
        emailMissionaryPosts: false,
      });
    }

    const { data: preferences } = await supabase
      .from("donor_feed_preferences")
      .select("*")
      .eq("donor_id", donor.id)
      .eq("tenant_id", DEFAULT_TENANT_ID)
      .maybeSingle();

    return NextResponse.json({
      showOrgPosts: preferences?.show_org_posts ?? true,
      showMissionaryPosts: preferences?.show_missionary_posts ?? true,
      followOrg: preferences?.follow_org ?? false,
      emailOrgPosts: preferences?.email_org_posts ?? false,
      emailMissionaryPosts: preferences?.email_missionary_posts ?? false,
    });
  } catch (error) {
    console.error("Error fetching feed preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

/** Read-only demo: feed preference updates disabled. */
export async function POST(_request: Request) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
