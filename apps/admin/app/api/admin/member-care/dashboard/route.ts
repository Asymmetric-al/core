import { readMemberCareDashboardSnapshot } from "@asym/api/reads/member-care";
import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";

export async function GET() {
  const auth = await getAuthContext();

  if (
    !auth.isAuthenticated ||
    !auth.userId ||
    !auth.tenantId ||
    !hasAnyContextRole(auth, ["staff", "admin", "super_admin"])
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await readMemberCareDashboardSnapshot(auth.tenantId);
    return Response.json(snapshot);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load member care dashboard.",
      },
      { status: 500 },
    );
  }
}
