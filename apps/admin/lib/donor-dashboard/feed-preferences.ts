import { createClient } from "@asym/database/supabase/server";
import type {
  DonorFeedPreferences,
  OrgPostVisibility,
} from "@asym/database/types";

export interface FeedPreferencesInput {
  showOrgPosts?: boolean;
  showMissionaryPosts?: boolean;
  followOrg?: boolean;
  emailOrgPosts?: boolean;
  emailMissionaryPosts?: boolean;
  pushOrgPosts?: boolean;
  pushMissionaryPosts?: boolean;
}

export async function getDonorFeedPreferences(
  donorId: string,
  tenantId: string,
): Promise<DonorFeedPreferences | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("donor_feed_preferences")
    .select("*")
    .eq("donor_id", donorId)
    .eq("tenant_id", tenantId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching feed preferences:", error);
    throw error;
  }

  return data;
}

export async function upsertDonorFeedPreferences(
  donorId: string,
  tenantId: string,
  preferences: FeedPreferencesInput,
): Promise<DonorFeedPreferences> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("donor_feed_preferences")
    .upsert(
      {
        donor_id: donorId,
        tenant_id: tenantId,
        show_org_posts: preferences.showOrgPosts,
        show_missionary_posts: preferences.showMissionaryPosts,
        follow_org: preferences.followOrg,
        email_org_posts: preferences.emailOrgPosts,
        email_missionary_posts: preferences.emailMissionaryPosts,
        push_org_posts: preferences.pushOrgPosts,
        push_missionary_posts: preferences.pushMissionaryPosts,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "donor_id,tenant_id",
      },
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting feed preferences:", error);
    throw error;
  }

  return data;
}

export async function getOrgPostVisibility(
  tenantId: string,
): Promise<OrgPostVisibility> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("org_post_visibility")
    .eq("id", tenantId)
    .single();

  if (error) {
    console.error("Error fetching org post visibility:", error);
    return "all_donors";
  }

  return (data?.org_post_visibility as OrgPostVisibility) || "all_donors";
}

export async function updateOrgPostVisibility(
  tenantId: string,
  visibility: OrgPostVisibility,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tenants")
    .update({
      org_post_visibility: visibility,
    })
    .eq("id", tenantId);

  if (error) {
    console.error("Error updating org post visibility:", error);
    throw error;
  }
}

export async function shouldShowOrgPostsToUser(
  donorId: string,
  tenantId: string,
): Promise<boolean> {
  const [preferences, orgVisibility] = await Promise.all([
    getDonorFeedPreferences(donorId, tenantId),
    getOrgPostVisibility(tenantId),
  ]);

  if (preferences?.show_org_posts === false) {
    return false;
  }

  if (orgVisibility === "followers_only") {
    return preferences?.follow_org === true;
  }

  return true;
}
