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

export function signInAccountKey(email: string): string {
  return email.trim().toLowerCase();
}

async function callLimits(
  name: "take_sign_in_attempt" | "record_sign_in_failure",
  key: SignInLimitKey,
): Promise<unknown> {
  const { client } = getAdminClient();
  if (!client) throw new SignInLimitsUnavailableError();
  try {
    const { data, error } = await client.rpc(name, {
      p_account: key.account,
      p_address: key.address,
    });
    if (error) throw new SignInLimitsUnavailableError();
    return data;
  } catch {
    throw new SignInLimitsUnavailableError();
  }
}

export async function takeSignInAttempt(key: SignInLimitKey): Promise<boolean> {
  const allowed = await callLimits("take_sign_in_attempt", key);
  if (typeof allowed !== "boolean") throw new SignInLimitsUnavailableError();
  return allowed;
}

export async function recordSignInFailure(key: SignInLimitKey): Promise<void> {
  await callLimits("record_sign_in_failure", key);
}
