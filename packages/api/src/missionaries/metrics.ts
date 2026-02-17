import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@asym/auth/context";
import { createClient } from "@asym/database/supabase/server";

const ALLOWED_ROLES = new Set(["admin", "missionary", "super_admin"]);
const PERMISSION_ERROR_CODES = new Set([
  "42501",
  "PGRST301",
  "PGRST302",
  "PGRST401",
  "PGRST403",
]);

function isPermissionError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code && PERMISSION_ERROR_CODES.has(error.code)) return true;
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("permission") ||
    message.includes("not authorized") ||
    message.includes("not allowed")
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthContext();
    if (!auth.tenantId || !auth.role || !ALLOWED_ROLES.has(auth.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createClient();
    const { id: missionaryId } = await params;

    if (!missionaryId) {
      return NextResponse.json(
        { error: "Missing missionary ID" },
        { status: 400 },
      );
    }

    const { data: missionary, error: missionaryError } = await supabase
      .from("missionaries")
      .select("id, tenant_id")
      .eq("id", missionaryId)
      .maybeSingle();

    if (missionaryError) {
      const status = isPermissionError(missionaryError) ? 403 : 500;
      return NextResponse.json(
        { error: status === 403 ? "Forbidden" : "Internal server error" },
        { status },
      );
    }

    // Read-only demo: return empty data when missionary or tenant missing (no 404)
    if (!missionary) {
      return NextResponse.json({ donations: [] });
    }

    if (missionary.tenant_id && missionary.tenant_id !== auth.tenantId) {
      return NextResponse.json({ donations: [] });
    }

    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    const { data, error } = await supabase
      .from("donations")
      .select("id, amount, donation_type, created_at, status")
      .eq("missionary_id", missionaryId)
      .gte("created_at", thirteenMonthsAgo.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      if (isPermissionError(error)) {
        return NextResponse.json({ donations: [], limited: true });
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ donations: data || [] });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
