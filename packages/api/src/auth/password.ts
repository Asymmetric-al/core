import { recoverySecondsLeft } from "@asym/auth/password-recovery-session";
import {
  createAnonymousClient,
  createClient,
} from "@asym/database/supabase/server";

import {
  noStoreJson,
  providerUnavailable,
  readPassword,
  signInClientAddress,
  signInAccountKey,
} from "./sign-in-answers";
import {
  clearSignInAccount,
  releaseSignInAttempt,
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

async function giveBack(
  key: { account: string; address: string },
  outcome: { cleared: boolean },
): Promise<void> {
  try {
    await releaseSignInAttempt(key, outcome);
  } catch {
    console.error("[auth] sign_in_release_failed");
  }
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
  if (!verifier) {
    await giveBack(key, { cleared: false });
    return REFUSALS.unavailable;
  }
  let checked;
  try {
    checked = await verifier.auth.signInWithPassword({
      email,
      password: current,
    });
  } catch {
    await giveBack(key, { cleared: false });
    return REFUSALS.unavailable;
  }
  if (checked.error) {
    if (!providerUnavailable(checked.error)) return REFUSALS.currentRefused;
    await giveBack(key, { cleared: false });
    return REFUSALS.unavailable;
  }
  await giveBack(key, { cleared: true });

  await endSession(verifier, "password_check_session_not_ended");
  return checked.data.user?.id === subject ? null : REFUSALS.currentRefused;
}

type SessionWriter = {
  auth: {
    setSession(session: {
      access_token: string;
      refresh_token: string;
    }): Promise<{ error: unknown }>;
  };
};

async function replaceRecoverySession(
  supabase: SessionWriter,
  email: string | undefined,
  password: string,
  recoveryToken: string | null,
): Promise<void> {
  const fresh = createAnonymousClient();
  if (!fresh || !email) {
    console.error("[auth] recovery_session_not_replaced");
    return;
  }
  let session;
  try {
    const signedIn = await fresh.auth.signInWithPassword({ email, password });
    session = signedIn.data.session;
    if (signedIn.error || !session) throw signedIn.error;
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (error) throw error;
  } catch {
    console.error("[auth] recovery_session_not_replaced");
    if (session) await endSession(fresh, "recovery_fresh_session_not_ended");
    return;
  }
  if (!recoveryToken) return;
  try {
    const { error } = await fresh.auth.admin.signOut(recoveryToken, "local");
    if (error) throw error;
  } catch {
    console.error("[auth] recovery_session_not_revoked");
  }
}

async function endSession(
  client: {
    auth: { signOut(options: { scope: "local" }): Promise<{ error: unknown }> };
  },
  code: string,
): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (!error) return;
    } catch {
      continue;
    }
  }
  console.error(`[auth] ${code}`);
}

async function clearAfterRecovery(email: string | undefined): Promise<void> {
  if (!email) return;
  try {
    await clearSignInAccount(signInAccountKey(email));
  } catch {
    console.error("[auth] sign_in_clear_failed");
  }
}

export async function POST(request: Request) {
  const change = await readChange(request);
  if ("status" in change) return refuse(change);

  let supabase;
  let person;
  try {
    supabase = await createClient(null);
    const { data, error } = await supabase.auth.getUser();
    if (error && error.name !== "AuthSessionMissingError")
      return refuse(
        providerUnavailable(error) ? REFUSALS.unavailable : REFUSALS.signedOut,
      );
    person = data.user;
  } catch {
    return refuse(REFUSALS.unavailable);
  }
  if (!person) return refuse(REFUSALS.signedOut);

  let recoveryToken: string | null = null;
  if (change.current === null) {
    let secondsLeft: number | null;
    try {
      secondsLeft = await recoverySecondsLeft(supabase);
      recoveryToken =
        (await supabase.auth.getSession()).data.session?.access_token ?? null;
    } catch {
      return refuse(REFUSALS.unavailable);
    }
    if (secondsLeft === null) return refuse(REFUSALS.currentRequired);
  } else {
    if (!person.email) return refuse(REFUSALS.signedOut);
    const refusal = await checkCurrentPassword(
      request,
      person.id,
      person.email,
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
  if (change.current === null) {
    await clearAfterRecovery(person.email);
    await replaceRecoverySession(
      supabase,
      person.email,
      change.next,
      recoveryToken,
    );
  }
  return noStoreJson({ ok: true });
}
