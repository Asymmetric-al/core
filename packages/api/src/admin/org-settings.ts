import { NextResponse } from "next/server";
import { createClient } from "@asym/database/supabase/server";
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

    const { data, error } = await supabase
      .from("tenants")
      .select("org_post_visibility")
      .eq("id", DEFAULT_TENANT_ID)
      .single();

    if (error) {
      console.error("Error fetching org post visibility:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 },
      );
    }

    const visibility =
      (data?.org_post_visibility as OrgPostVisibility) || "all_donors";
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

    const { error } = await supabase
      .from("tenants")
      .update({ org_post_visibility: visibility })
      .eq("id", DEFAULT_TENANT_ID);

    if (error) {
      console.error("Error updating org post visibility:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 },
      );
    }

    return NextResponse.json({ orgPostVisibility: visibility });
  } catch (error) {
    console.error("Error updating org settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
