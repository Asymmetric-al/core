import { POST as signOutSession } from "@asym/api/auth/signout";

import { clipboardResetCookie } from "@/src/cms/clipboard-reset";
import { clearedWebStudioTenantCookie } from "@/src/cms/web-studio-tenant-cookie";

/**
 * The admin app's sign-out: the shared server sign-out, which clears the
 * Supabase session, and with it the Web Studio tenant cookie (plan 5.2;
 * AL-2675), which the shared handler does not know about. The cookie is
 * scoped to `/web-studio` and never reaches this route, so it is cleared by
 * name and path.
 */
export async function POST(request: Request) {
  const response = await signOutSession(request);
  if (response.ok) {
    response.cookies.set(clearedWebStudioTenantCookie());
    response.cookies.set(clipboardResetCookie());
  }
  return response;
}
