import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

interface FollowerRequestRow {
  id: string;
  donor_id: string;
  status: string;
  access_level: string | null;
  created_at: string;
  donor:
    | {
        name?: string | null;
        avatar_url?: string | null;
        total_given?: number | null;
      }[]
    | {
        name?: string | null;
        avatar_url?: string | null;
        total_given?: number | null;
      }
    | null;
}

function resolveDonor(donor: FollowerRequestRow["donor"]): {
  name?: string | null;
  avatar_url?: string | null;
  total_given?: number | null;
} | null {
  if (Array.isArray(donor)) {
    return donor[0] ?? null;
  }
  return donor ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", ctx.userId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: requests, error } = await supabaseAdmin
      .from("follower_requests")
      .select(
        `
        id,
        donor_id,
        status,
        access_level,
        created_at,
        updated_at,
        donor:donors!donor_id(
          id,
          name,
          avatar_url,
          status,
          total_given,
          last_gift_date
        )
      `,
      )
      .eq("missionary_id", profile.id)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching follower requests:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const requestRows = (requests || []) as FollowerRequestRow[];
    const formattedRequests = requestRows.map((req) => {
      const donor = resolveDonor(req.donor);
      const donorName = donor?.name || "Unknown Donor";

      return {
        id: req.id,
        donor_id: req.donor_id,
        name: donorName,
        avatar_url: donor?.avatar_url,
        is_donor: (donor?.total_given || 0) > 0,
        access_level: req.access_level,
        status: req.status,
        created_at: req.created_at,
        initials: getInitials(donorName),
      };
    });

    return NextResponse.json({ requests: formattedRequests });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Unauthorized") ? 401 : 500 },
    );
  }
}

/** Read-only demo: follower request creation disabled. */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
