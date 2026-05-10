import { createClient } from "@asym/database/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import type { DonorFeedPreferences } from "@asym/database/types";

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

const feedPreferencesUpdateSchema = z.object({
  showOrgPosts: z.boolean().optional(),
  showMissionaryPosts: z.boolean().optional(),
  followOrg: z.boolean().optional(),
  emailOrgPosts: z.boolean().optional(),
  emailMissionaryPosts: z.boolean().optional(),
});

const defaultFeedPreferencesResponse = {
  showOrgPosts: true,
  showMissionaryPosts: true,
  followOrg: false,
  emailOrgPosts: false,
  emailMissionaryPosts: false,
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type FeedPreferencesUpdate = z.infer<typeof feedPreferencesUpdateSchema>;
type FeedPreferencesUpsert = {
  donor_id: string;
  tenant_id: string;
  updated_at: string;
  show_org_posts?: boolean;
  show_missionary_posts?: boolean;
  follow_org?: boolean;
  email_org_posts?: boolean;
  email_missionary_posts?: boolean;
};

interface DonorIdentity {
  id: string;
}

type AuthenticatedDonorLookup =
  | { status: "unauthenticated" }
  | { status: "missing-donor" }
  | { status: "found"; donor: DonorIdentity };

async function findDonorByAuthenticatedUser(
  supabase: SupabaseServerClient,
): Promise<AuthenticatedDonorLookup> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const { data: donor } = await supabase
    .from("donors")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!donor) {
    return { status: "missing-donor" };
  }

  return { status: "found", donor };
}

async function readRequestBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function parseFeedPreferencesUpdate(body: unknown) {
  return feedPreferencesUpdateSchema.safeParse(body);
}

function toFeedPreferencesResponse(
  preferences: DonorFeedPreferences | null | undefined,
) {
  return {
    showOrgPosts:
      preferences?.show_org_posts ??
      defaultFeedPreferencesResponse.showOrgPosts,
    showMissionaryPosts:
      preferences?.show_missionary_posts ??
      defaultFeedPreferencesResponse.showMissionaryPosts,
    followOrg:
      preferences?.follow_org ?? defaultFeedPreferencesResponse.followOrg,
    emailOrgPosts:
      preferences?.email_org_posts ??
      defaultFeedPreferencesResponse.emailOrgPosts,
    emailMissionaryPosts:
      preferences?.email_missionary_posts ??
      defaultFeedPreferencesResponse.emailMissionaryPosts,
  };
}

function toFeedPreferencesUpsert(
  donorId: string,
  preferences: FeedPreferencesUpdate,
): FeedPreferencesUpsert {
  const payload: FeedPreferencesUpsert = {
    donor_id: donorId,
    tenant_id: DEFAULT_TENANT_ID,
    updated_at: new Date().toISOString(),
  };

  if (preferences.showOrgPosts !== undefined) {
    payload.show_org_posts = preferences.showOrgPosts;
  }

  if (preferences.showMissionaryPosts !== undefined) {
    payload.show_missionary_posts = preferences.showMissionaryPosts;
  }

  if (preferences.followOrg !== undefined) {
    payload.follow_org = preferences.followOrg;
  }

  if (preferences.emailOrgPosts !== undefined) {
    payload.email_org_posts = preferences.emailOrgPosts;
  }

  if (preferences.emailMissionaryPosts !== undefined) {
    payload.email_missionary_posts = preferences.emailMissionaryPosts;
  }

  return payload;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const donorLookup = await findDonorByAuthenticatedUser(supabase);

    if (donorLookup.status === "unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (donorLookup.status === "missing-donor") {
      return NextResponse.json(defaultFeedPreferencesResponse);
    }

    const { data: preferences } = await supabase
      .from("donor_feed_preferences")
      .select("*")
      .eq("donor_id", donorLookup.donor.id)
      .eq("tenant_id", DEFAULT_TENANT_ID)
      .maybeSingle();

    return NextResponse.json(toFeedPreferencesResponse(preferences));
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
    const donorLookup = await findDonorByAuthenticatedUser(supabase);

    if (donorLookup.status === "unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (donorLookup.status === "missing-donor") {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    const parsed = parseFeedPreferencesUpdate(await readRequestBody(request));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid preferences payload" },
        { status: 400 },
      );
    }

    const { data: updated, error } = await supabase
      .from("donor_feed_preferences")
      .upsert(toFeedPreferencesUpsert(donorLookup.donor.id, parsed.data), {
        onConflict: "donor_id,tenant_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating feed preferences:", error);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 },
      );
    }

    return NextResponse.json(toFeedPreferencesResponse(updated));
  } catch (error) {
    console.error("Error updating feed preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
