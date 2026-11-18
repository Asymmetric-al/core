import { createClient } from "@asym/database/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getDefaultPostLoginPathForApp, safeNextParam } from "./demo-login";
import { passwordRecoverySecondsLeft } from "./password-recovery";

import type { AppId } from "./demo-login";

type AuthScreenSearchParams = Record<string, string | string[] | undefined>;

/**
 * Server-side gate for auth screens (login/register): they exist for
 * anonymous visitors, so an already-authenticated user is redirected to the
 * app's post-login portal — honoring a sanitized ?next= target when the
 * screen supports one. Returns the sanitized next path so the screen can
 * thread it through the login flow.
 *
 * Server-only: uses the request-scoped Supabase client and next/navigation
 * redirect (which throws), so call it at the top of a server page.
 */
export async function requireAnonymousVisitor(params: {
  appId: AppId;
  searchParams?: AuthScreenSearchParams;
}): Promise<{ nextPath: string | null }> {
  const rawNext = params.searchParams?.next;
  const firstNext = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  const nextPath = safeNextParam(firstNext ?? null);

  const supabase = await createClient(null); // Auth only: reads no tenant table.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath ?? getDefaultPostLoginPathForApp(params.appId));
  }

  return { nextPath };
}

export interface PasswordRecovery {
  /** The address the recovery email went to, for the screen to show. */
  email: string | null;
  /**
   * Seconds left in the recovery window when the page was read. The screen
   * refuses to save after them, so a form left open past the window does not
   * save. A duration, not a time, so the browser's clock does not matter.
   */
  secondsLeft: number;
}

/**
 * Server-side read for the reset screen: returns the recovery when the
 * current session was created by a recovery link within the window, and null
 * for no session, an unverifiable token or an ordinary sign-in. The screen
 * offers the form to a recovery session only; an ordinary session changes its
 * password through the change-password form, which asks for the current one.
 * Both are rules of the screens: `secure_password_change` is off, so Supabase
 * Auth itself accepts a new password from any signed-in session.
 *
 * Verifies the session token through `auth.getClaims()`, never by decoding
 * the cookie. Server-only, like `requireAnonymousVisitor`.
 */
export async function readPasswordRecovery(): Promise<PasswordRecovery | null> {
  // The window check reads the clock, so it must run at request time and
  // never in a prerender, including a runtime prefetch that has cookies.
  await connection();
  const supabase = await createClient(null); // Auth only: reads no tenant table.
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return null;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const secondsLeft = passwordRecoverySecondsLeft(data.claims.amr, nowSeconds);
  if (secondsLeft === null) {
    return null;
  }

  const { email } = data.claims;
  return {
    email: typeof email === "string" && email ? email : null,
    secondsLeft,
  };
}
