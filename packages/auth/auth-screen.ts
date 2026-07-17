import { createClient } from "@asym/database/supabase/server";
import { redirect } from "next/navigation";

import { getDefaultPostLoginPathForApp, safeNextParam } from "./demo-login";

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath ?? getDefaultPostLoginPathForApp(params.appId));
  }

  return { nextPath };
}
