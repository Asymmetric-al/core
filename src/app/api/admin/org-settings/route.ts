import { NextResponse } from "next/server";
import { createClient } from "@asym/database/supabase";
import {
  getOrgPostVisibility,
  updateOrgPostVisibility,
} from "@/lib/donor-dashboard";
import type { OrgPostVisibility } from "@asym/database/types";

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

    const visibility = await getOrgPostVisibility(DEFAULT_TENANT_ID);

    return NextResponse.json({ orgPostVisibility: visibility });
  } catch (error) {
    console.error("Error fetching org settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const visibility = body.orgPostVisibility as OrgPostVisibility;

    if (!["all_donors", "followers_only"].includes(visibility)) {
      return NextResponse.json(
        { error: "Invalid visibility value" },
        { status: 400 },
      );
    }

    await updateOrgPostVisibility(DEFAULT_TENANT_ID, visibility);

    return NextResponse.json({ orgPostVisibility: visibility });
  } catch (error) {
    console.error("Error updating org settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
