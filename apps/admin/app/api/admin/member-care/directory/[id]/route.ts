import { readMemberCarePersonDetail } from "@asym/api/reads/member-care";
import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();

  if (
    !auth.isAuthenticated ||
    !auth.userId ||
    !auth.tenantId ||
    !hasAnyContextRole(auth, ["staff", "admin", "super_admin"])
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const detail = await readMemberCarePersonDetail(auth.tenantId, id);

    if (!detail.personnel) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(detail);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load member care profile.",
      },
      { status: 500 },
    );
  }
}
