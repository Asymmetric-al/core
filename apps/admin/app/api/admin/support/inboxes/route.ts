import {
  listSupportInboxes,
  withSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";

export async function GET() {
  return withSupportHubAccess(async () => {
    try {
      const inboxes = await listSupportInboxes();
      return Response.json({ inboxes });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to list inboxes.");
    }
  });
}
