import { createClient } from "@asym/database/supabase/server";
import { connection } from "next/server";

import { getDefaultPostLoginPathForApp, safeNextParam } from "./demo-login";
import { passwordRecoverySecondsLeft } from "./password-recovery";
import { redirectInTenant } from "./tenant-server";

import type { AppId } from "./demo-login";

type AuthScreenSearchParams = Record<string, string | string[] | undefined>;

export async function requireAnonymousVisitor(params: {
  appId: AppId;
  searchParams?: AuthScreenSearchParams;
}): Promise<{ nextPath: string | null }> {
  const rawNext = params.searchParams?.next;
  const firstNext = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  const nextPath = safeNextParam(firstNext ?? null);

  const supabase = await createClient(null);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirectInTenant(
      nextPath ?? getDefaultPostLoginPathForApp(params.appId),
    );
  }

  return { nextPath };
}

export interface PasswordRecovery {
  email: string | null;
  secondsLeft: number;
}

export async function readPasswordRecovery(): Promise<PasswordRecovery | null> {
  await connection();
  const supabase = await createClient(null);
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
