import { markSharedOriginSessionChange } from "@asym/auth/clipboard-reset";
import { createClient } from "@asym/database/supabase/server";

import {
  noStoreJson,
  providerUnavailable,
  readEmail,
  readPassword,
  signInClientAddress,
} from "./sign-in-answers";
import {
  recordSignInFailure,
  signInAccountKey,
  takeSignInAttempt,
  type SignInLimitKey,
} from "../identity/sign-in-limits";
import { ApiHttpError, ensureJsonBody } from "../shared/http-errors";

export const SIGN_IN_REFUSED = {
  ok: false,
  code: "SIGN_IN_REFUSED",
  error:
    "We couldn’t sign you in with that email and password. Check them and try again, or reset your password.",
} as const;

const unavailable = () =>
  noStoreJson(
    {
      ok: false,
      code: "SIGN_IN_UNAVAILABLE",
      error: "Sign-in isn’t available right now. Try again in a few minutes.",
    },
    503,
  );

const refused = () => noStoreJson(SIGN_IN_REFUSED, 401);

async function readCredentials(
  request: Request,
): Promise<{ email: string; password: string } | ApiHttpError> {
  let body: unknown;
  try {
    body = await ensureJsonBody(request);
  } catch (error) {
    return error instanceof ApiHttpError
      ? error
      : new ApiHttpError(400, "Invalid JSON body");
  }
  const fields = (body ?? {}) as { email?: unknown; password?: unknown };
  const email = readEmail(fields.email);
  const password = readPassword(fields.password);
  if (!email || !password)
    return new ApiHttpError(400, "Enter your email and password.");
  return { email, password };
}

async function countRefusal(key: SignInLimitKey): Promise<void> {
  try {
    await recordSignInFailure(key);
  } catch {
    console.error("[auth] a refused sign-in could not be counted.");
  }
}

export async function POST(request: Request) {
  const credentials = await readCredentials(request);
  if (credentials instanceof ApiHttpError)
    return noStoreJson(
      { ok: false, code: "SIGN_IN_INVALID", error: credentials.message },
      credentials.status,
    );

  const address = signInClientAddress(request);
  if (!address) return unavailable();
  const key = { account: signInAccountKey(credentials.email), address };

  let allowed: boolean;
  try {
    allowed = await takeSignInAttempt(key);
  } catch {
    console.error("[auth] Core's sign-in limits are unavailable.");
    return unavailable();
  }
  if (!allowed) return refused();

  let error: { status?: number; name?: string } | null;
  try {
    const supabase = await createClient(null);
    ({ error } = await supabase.auth.signInWithPassword(credentials));
  } catch {
    return unavailable();
  }

  if (error) {
    if (providerUnavailable(error)) return unavailable();
    await countRefusal(key);
    return refused();
  }

  return markSharedOriginSessionChange(noStoreJson({ ok: true }));
}
