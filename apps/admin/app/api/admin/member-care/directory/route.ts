import { readMemberCareDirectory } from "@asym/api/reads/member-care";
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
    const directory = await readMemberCareDirectory(auth.tenantId);
    return Response.json({ data: directory });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load member care directory.",
      },
      { status: 500 },
    );
  }
}
