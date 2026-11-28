import { getAdminClient } from "@asym/database/supabase/admin";

export interface SignInLimitKey {
  account: string;
  address: string;
}

export class SignInLimitsUnavailableError extends Error {
  constructor() {
    super("Core's sign-in limits are unavailable.");
    this.name = "SignInLimitsUnavailableError";
  }
}

async function callLimits(
  name:
    | "take_sign_in_attempt"
    | "release_sign_in_attempt"
    | "clear_sign_in_account"
    | "trim_sign_in_windows",
  args: Record<string, string | boolean>,
): Promise<unknown> {
  const { client } = getAdminClient();
  if (!client) throw new SignInLimitsUnavailableError();
  try {
    const { data, error } = await client.rpc(name, args);
    if (error) throw new SignInLimitsUnavailableError();
    return data;
  } catch {
    throw new SignInLimitsUnavailableError();
  }
}

export async function takeSignInAttempt(key: SignInLimitKey): Promise<boolean> {
  const allowed = await callLimits("take_sign_in_attempt", {
    p_account: key.account,
    p_address: key.address,
  });
  if (typeof allowed !== "boolean") throw new SignInLimitsUnavailableError();
  return allowed;
}

export async function releaseSignInAttempt(
  key: SignInLimitKey,
  outcome: { cleared: boolean },
): Promise<void> {
  await callLimits("release_sign_in_attempt", {
    p_account: key.account,
    p_address: key.address,
    p_cleared: outcome.cleared,
  });
}

export async function clearSignInAccount(account: string): Promise<void> {
  await callLimits("clear_sign_in_account", { p_account: account });
}

export async function trimSignInWindows(): Promise<number> {
  const removed = await callLimits("trim_sign_in_windows", {});
  return typeof removed === "number" ? removed : 0;
}
