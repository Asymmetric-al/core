import { serializeWebStudioCookie } from "@asym/auth/web-studio";

import { clearedWebStudioTenantCookie } from "../web-studio-tenant-cookie";

import type { CollectionAfterLogoutHook } from "payload";

/**
 * Payload's logout endpoint (`/web-studio/api/cms-users/logout`, which Web
 * Studio's "Log out" calls) also clears the Web Studio tenant cookie (plan
 * 5.2; AL-2675). Payload merges the request's response headers into the
 * endpoint's answer, beside its own expired cookie.
 */
export const clearWebStudioTenantOnLogout: CollectionAfterLogoutHook = ({
  req,
}) => {
  req.responseHeaders ??= new Headers();
  req.responseHeaders.append(
    "Set-Cookie",
    serializeWebStudioCookie(clearedWebStudioTenantCookie()),
  );
};
