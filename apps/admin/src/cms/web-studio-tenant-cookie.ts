import {
  clearedWebStudioCookie,
  readWebStudioCookie,
  signWebStudioSelection,
  webStudioCookie,
  type WebStudioCookie,
  type WebStudioCookieState,
  type WebStudioSelection,
} from "@asym/auth/web-studio";

import { resolvePayloadSecret } from "./payload-secret";

/**
 * The Web Studio tenant cookie in the admin app (plan 5.2; AL-2675, WP2b
 * slice C): `@asym/auth/web-studio` with this app's key.
 *
 * The key is derived from `PAYLOAD_SECRET`, the existing secret that
 * `packages/env` declares for Web Studio and that every environment running
 * Web Studio already holds; no new secret is introduced. HKDF with a label of
 * its own keeps the cookie's key apart from Payload's use of the secret.
 *
 * Read by the admin proxy, the Web Studio layout and Payload's strategy; set
 * by the Web Studio chooser; cleared on sign-out.
 */

/** Secure everywhere but local development and tests, which run over plain HTTP. */
function secureCookies(): boolean {
  return process.env.NODE_ENV === "production";
}

export function readWebStudioTenantCookie(
  value: string | null | undefined,
): Promise<WebStudioCookieState> {
  return readWebStudioCookie(value, resolvePayloadSecret());
}

export async function webStudioTenantCookie(
  selection: WebStudioSelection,
): Promise<WebStudioCookie> {
  return webStudioCookie(
    await signWebStudioSelection(selection, resolvePayloadSecret()),
    { secure: secureCookies() },
  );
}

export function clearedWebStudioTenantCookie(): WebStudioCookie {
  return clearedWebStudioCookie({ secure: secureCookies() });
}
