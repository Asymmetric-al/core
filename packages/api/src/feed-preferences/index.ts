import { createClient } from "@asym/database/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import type { DonorFeedPreferences } from "@asym/database/types";

/**
 * Same shape check as authz.current_tenant_id(): a tenant claim that the
 * database would read as NULL is refused here before any query.
 */
const TENANT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  | { status: "missing-tenant" }
  | { status: "missing-donor" }
  | { status: "multiple-donors" }
  | { status: "found"; donor: DonorIdentity; tenantId: string };

function tenantIdFromClaim(value: unknown): string | null {
  return typeof value === "string" && TENANT_ID_PATTERN.test(value)
    ? value
    : null;
}

/**
 * Resolves the caller's donor in their JWT tenant by profile ownership, with
 * the user-JWT client, mirroring the donor_feed_preferences own-row policies
 * (docs/security/donor-feed-preferences-rls.md). Lookup errors throw.
 */
async function findDonorByAuthenticatedUser(
  supabase: SupabaseServerClient,
): Promise<AuthenticatedDonorLookup> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const tenantId = tenantIdFromClaim(user.app_metadata?.tenant_id);

  if (!tenantId) {
    return { status: "missing-tenant" };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id);

  if (profilesError) {
    throw profilesError;
  }

  const profileIds = (profiles ?? []).map((profile) => profile.id);

  if (profileIds.length === 0) {
    return { status: "missing-donor" };
  }

  const { data: donors, error: donorsError } = await supabase
    .from("donors")
    .select("id")
    .eq("tenant_id", tenantId)
    .in("profile_id", profileIds)
    .limit(2);

  if (donorsError) {
    throw donorsError;
  }

  const [donor, ...otherDonors] = donors ?? [];

  if (!donor) {
    return { status: "missing-donor" };
  }

  if (otherDonors.length > 0) {
    return { status: "multiple-donors" };
  }

  return { status: "found", donor, tenantId };
}

/** The response for every lookup outcome both handlers treat the same way. */
function donorLookupFailure(lookup: AuthenticatedDonorLookup) {
  switch (lookup.status) {
    case "unauthenticated":
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    case "missing-tenant":
      return NextResponse.json(
        { error: "Tenant context required" },
        { status: 403 },
      );
    case "multiple-donors":
      return NextResponse.json(
        { error: "Multiple donor records for this account" },
        { status: 409 },
      );
    default:
      return null;
  }
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
  tenantId: string,
  preferences: FeedPreferencesUpdate,
): FeedPreferencesUpsert {
  const payload: FeedPreferencesUpsert = {
    donor_id: donorId,
    tenant_id: tenantId,
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
    const failure = donorLookupFailure(donorLookup);

    if (failure) {
      return failure;
    }

    if (donorLookup.status !== "found") {
      return NextResponse.json(defaultFeedPreferencesResponse);
    }

    const { data: preferences, error } = await supabase
      .from("donor_feed_preferences")
      .select("*")
      .eq("donor_id", donorLookup.donor.id)
      .eq("tenant_id", donorLookup.tenantId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching feed preferences:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 },
      );
    }

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
    const failure = donorLookupFailure(donorLookup);

    if (failure) {
      return failure;
    }

    if (donorLookup.status !== "found") {
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
      .upsert(
        toFeedPreferencesUpsert(
          donorLookup.donor.id,
          donorLookup.tenantId,
          parsed.data,
        ),
        { onConflict: "donor_id,tenant_id" },
      )
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
