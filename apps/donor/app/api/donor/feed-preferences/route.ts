import { NextResponse } from "next/server";
import { createClient } from "@asym/database/supabase/server";
import {
  getDonorFeedPreferences,
  upsertDonorFeedPreferences,
} from "@/lib/donor-dashboard";
import type { FeedPreferencesInput } from "@/lib/donor-dashboard";

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: donor } = await supabase
      .from("donors")
      .select("id")
      .eq("email", user.email)
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

    const preferences = await getDonorFeedPreferences(
      donor.id,
      DEFAULT_TENANT_ID,
    );

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: donor } = await supabase
      .from("donors")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    const body: FeedPreferencesInput = await request.json();

    const updated = await upsertDonorFeedPreferences(
      donor.id,
      DEFAULT_TENANT_ID,
      body,
    );

    return NextResponse.json({
      showOrgPosts: updated.show_org_posts,
      showMissionaryPosts: updated.show_missionary_posts,
      followOrg: updated.follow_org,
      emailOrgPosts: updated.email_org_posts,
      emailMissionaryPosts: updated.email_missionary_posts,
    });
  } catch (error) {
    console.error("Error updating feed preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
