import { passwordRecoverySecondsLeft } from "@asym/auth/password-recovery";
import {
  createAnonymousClient,
  createClient,
} from "@asym/database/supabase/server";

import {
  noStoreJson,
  providerUnavailable,
  readPassword,
  signInClientAddress,
} from "./sign-in-answers";
import {
  recordSignInFailure,
  signInAccountKey,
  takeSignInAttempt,
} from "../identity/sign-in-limits";
import { ApiHttpError, ensureJsonBody } from "../shared/http-errors";

export const PASSWORD_MIN_LENGTH = 8;

type Refusal = { status: number; code: string; error: string };

const REFUSALS = {
  invalid: {
    status: 400,
    code: "PASSWORD_INVALID",
    error: "Enter a new password.",
  },
  short: {
    status: 400,
    code: "PASSWORD_TOO_SHORT",
    error: `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
  },
  same: {
    status: 400,
    code: "PASSWORD_UNCHANGED",
    error: "Choose a password you haven’t used here.",
  },
  signedOut: {
    status: 401,
    code: "PASSWORD_SIGNED_OUT",
    error: "Sign in again, then change your password.",
  },
  currentRequired: {
    status: 403,
    code: "CURRENT_PASSWORD_REQUIRED",
    error: "Enter your current password.",
  },
  currentRefused: {
    status: 403,
    code: "CURRENT_PASSWORD_REFUSED",
    error: "That isn’t your current password.",
  },
  limited: {
    status: 429,
    code: "PASSWORD_CHECK_LIMITED",
    error:
      "Too many attempts. Try again in a few minutes, or reset your password.",
  },
  notAccepted: {
    status: 422,
    code: "PASSWORD_NOT_ACCEPTED",
    error: "That password can’t be used. Choose a longer or less common one.",
  },
  unavailable: {
    status: 503,
    code: "PASSWORD_UNAVAILABLE",
    error:
      "Your password can’t be changed right now. Try again in a few minutes.",
  },
} satisfies Record<string, Refusal>;

const refuse = ({ status, code, error }: Refusal) =>
  noStoreJson({ ok: false, code, error }, status);

type PasswordChange = { current: string | null; next: string };

async function readChange(request: Request): Promise<PasswordChange | Refusal> {
  let body: unknown;
  try {
    body = await ensureJsonBody(request);
  } catch (error) {
    return error instanceof ApiHttpError
      ? { status: error.status, code: "PASSWORD_INVALID", error: error.message }
      : REFUSALS.invalid;
  }
  const fields = (body ?? {}) as {
    currentPassword?: unknown;
    newPassword?: unknown;
  };
  const next = readPassword(fields.newPassword);
  if (!next) return REFUSALS.invalid;
  if (next.length < PASSWORD_MIN_LENGTH) return REFUSALS.short;
  if (fields.currentPassword === undefined || fields.currentPassword === null)
    return { current: null, next };
  const current = readPassword(fields.currentPassword);
  if (!current) return REFUSALS.currentRequired;
  if (current === next) return REFUSALS.same;
  return { current, next };
}

async function checkCurrentPassword(
  request: Request,
  subject: string,
  email: string,
  current: string,
): Promise<Refusal | null> {
  const address = signInClientAddress(request);
  if (!address) return REFUSALS.unavailable;
  const key = { account: signInAccountKey(email), address };
  try {
    if (!(await takeSignInAttempt(key))) return REFUSALS.limited;
  } catch {
    console.error("[auth] Core's sign-in limits are unavailable.");
    return REFUSALS.unavailable;
  }

  const verifier = createAnonymousClient();
  if (!verifier) return REFUSALS.unavailable;
  let checked;
  try {
    checked = await verifier.auth.signInWithPassword({
      email,
      password: current,
    });
  } catch {
    return REFUSALS.unavailable;
  }
  if (checked.error) {
    if (providerUnavailable(checked.error)) return REFUSALS.unavailable;
    try {
      await recordSignInFailure(key);
    } catch {
      console.error("[auth] a refused password check could not be counted.");
    }
    return REFUSALS.currentRefused;
  }

  try {
    const { error } = await verifier.auth.signOut({ scope: "local" });
    if (error) throw error;
  } catch {
    console.error(
      "[auth] the password check's own session could not be ended.",
    );
  }
  return checked.data.user?.id === subject ? null : REFUSALS.currentRefused;
}

export async function POST(request: Request) {
  const change = await readChange(request);
  if ("status" in change) return refuse(change);

  let supabase;
  let claims;
  try {
    supabase = await createClient(null);
    const { data, error } = await supabase.auth.getClaims();
    if (error)
      return refuse(
        providerUnavailable(error) ? REFUSALS.unavailable : REFUSALS.signedOut,
      );
    claims = data?.claims;
  } catch {
    return refuse(REFUSALS.unavailable);
  }
  if (!claims?.sub) return refuse(REFUSALS.signedOut);

  if (change.current === null) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (passwordRecoverySecondsLeft(claims.amr, nowSeconds) === null)
      return refuse(REFUSALS.currentRequired);
  } else {
    const email = typeof claims.email === "string" ? claims.email : "";
    if (!email) return refuse(REFUSALS.signedOut);
    const refusal = await checkCurrentPassword(
      request,
      claims.sub,
      email,
      change.current,
    );
    if (refusal) return refuse(refusal);
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: change.next });
    if (error) {
      if (providerUnavailable(error)) return refuse(REFUSALS.unavailable);
      if (error.status === 401 || error.status === 403)
        return refuse(REFUSALS.signedOut);
      if (error.code === "same_password") return refuse(REFUSALS.same);
      return refuse(REFUSALS.notAccepted);
    }
  } catch {
    return refuse(REFUSALS.unavailable);
  }
  return noStoreJson({ ok: true });
}
