import { getClientSessionSupabase } from "./client-session";

export interface OperatorMfaError {
  code?: string;
  status?: number;
  message?: string;
}

interface FactorRecord {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
}

type Answer<T> = { data: T | null; error: OperatorMfaError | null };

export interface OperatorMfaClient {
  auth: {
    getUser(): Promise<{
      data: { user: { id: string } | null };
      error: OperatorMfaError | null;
    }>;
    refreshSession(): Promise<{ error: OperatorMfaError | null }>;
    mfa: {
      listFactors(): Promise<Answer<{ all: FactorRecord[] }>>;
      getAuthenticatorAssuranceLevel(): Promise<
        Answer<{ currentLevel: string | null }>
      >;
      enroll(params: {
        factorType: "totp";
        friendlyName: string;
        issuer: string;
      }): Promise<
        Answer<{ id: string; totp: { qr_code: string; secret: string } }>
      >;
      challengeAndVerify(params: {
        factorId: string;
        code: string;
      }): Promise<{ error: OperatorMfaError | null }>;
      unenroll(params: {
        factorId: string;
      }): Promise<{ error: OperatorMfaError | null }>;
    };
  };
  rpc(fn: "platform_operator_session"): PromiseLike<Answer<unknown>>;
}

export const OPERATOR_MFA_MESSAGES = {
  mismatch:
    "That code did not match. Check that your device's clock is right and enter the current code.",
  expired: "Enter a new code.",
  network: "Your network changed during verification. Enter a new code.",
  rateLimited:
    "Too many attempts from this network. Wait a minute, then enter a new code.",
  switchedOff:
    "Two-step sign-in is switched off for this project. Ask the release owner to switch on TOTP.",
  tooMany:
    "This account has the most authenticators allowed. Remove one first.",
  nameConflict: "Try again in a minute.",
  generic: "Something went wrong. Try again.",
} as const;

type MessageKey = keyof typeof OPERATOR_MFA_MESSAGES;

const MESSAGE_FOR_CODE = new Map<string, MessageKey>([
  ["mfa_verification_failed", "mismatch"],
  ["mfa_verification_rejected", "mismatch"],
  ["mfa_challenge_expired", "expired"],
  ["mfa_ip_address_mismatch", "network"],
  ["over_request_rate_limit", "rateLimited"],
  ["mfa_totp_enroll_not_enabled", "switchedOff"],
  ["mfa_totp_verify_not_enabled", "switchedOff"],
  ["too_many_enrolled_mfa_factors", "tooMany"],
  ["mfa_factor_name_conflict", "nameConflict"],
]);

const ENROLMENT_ISSUER = "Asym operations";

export interface OperatorMfaFailure {
  ok: false;
  message: string;
  reread: boolean;
}

export interface VerifiedFactor {
  id: string;
  friendlyName: string;
  createdAt: string;
}

export type FactorState =
  | { kind: "enrol" }
  | { kind: "challenge"; factorIds: string[] }
  | { kind: "area"; factors: VerifiedFactor[] }
  | { kind: "refused" }
  | { kind: "failed"; message: string };

export interface Enrolment {
  ok: true;
  factorId: string;
  qrCode: string;
  secret: string;
}

function defaultClient(): OperatorMfaClient {
  return getClientSessionSupabase() as unknown as OperatorMfaClient;
}

export function operatorMfaFailure(
  error: OperatorMfaError | null | undefined,
): OperatorMfaFailure {
  if (error?.code === "insufficient_aal") {
    return { ok: false, message: "", reread: true };
  }
  const key = error?.code ? MESSAGE_FOR_CODE.get(error.code) : undefined;
  if (key) {
    return { ok: false, message: OPERATOR_MFA_MESSAGES[key], reread: false };
  }
  if (error?.status === 429) {
    return {
      ok: false,
      message: OPERATOR_MFA_MESSAGES.rateLimited,
      reread: false,
    };
  }
  return { ok: false, message: OPERATOR_MFA_MESSAGES.generic, reread: false };
}

function failedState(error: OperatorMfaError | null): FactorState {
  return {
    kind: "failed",
    message: operatorMfaFailure(error).message || OPERATOR_MFA_MESSAGES.generic,
  };
}

type Snapshot =
  | { verified: VerifiedFactor[]; level: string | null }
  | { error: OperatorMfaError | null };

async function readSnapshot(client: OperatorMfaClient): Promise<Snapshot> {
  const listed = await client.auth.mfa.listFactors();
  if (listed.error || !listed.data) return { error: listed.error };
  const level = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level.error || !level.data) return { error: level.error };
  const verified = listed.data.all
    .filter(
      (factor) => factor.factor_type === "totp" && factor.status === "verified",
    )
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((factor) => ({
      id: factor.id,
      friendlyName: factor.friendly_name ?? "Authenticator",
      createdAt: factor.created_at,
    }));
  return { verified, level: level.data.currentLevel };
}

export async function confirmOperatorSession(
  client: OperatorMfaClient = defaultClient(),
): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return false;
    const { data, error } = await client.rpc("platform_operator_session");
    if (error || data === null || typeof data !== "object") return false;
    return (data as { operator_id?: unknown }).operator_id === user.id;
  } catch {
    return false;
  }
}

export async function readFactorState(
  client: OperatorMfaClient = defaultClient(),
): Promise<FactorState> {
  try {
    let current = await readSnapshot(client);
    if ("error" in current) return failedState(current.error);
    if (current.verified.length === 0 && current.level === "aal2") {
      const refreshed = await client.auth.refreshSession();
      if (refreshed.error) return failedState(refreshed.error);
      current = await readSnapshot(client);
      if ("error" in current) return failedState(current.error);
    }
    if (current.verified.length === 0) return { kind: "enrol" };
    if (current.level !== "aal2") {
      return {
        kind: "challenge",
        factorIds: current.verified.map((factor) => factor.id),
      };
    }
    return (await confirmOperatorSession(client))
      ? { kind: "area", factors: current.verified }
      : { kind: "refused" };
  } catch {
    return { kind: "failed", message: OPERATOR_MFA_MESSAGES.generic };
  }
}

function utcStamp(now: Date): string {
  const iso = now.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)}`;
}

function enrol(client: OperatorMfaClient, friendlyName: string) {
  return client.auth.mfa.enroll({
    factorType: "totp",
    friendlyName,
    issuer: ENROLMENT_ISSUER,
  });
}

export async function startEnrolment(
  client: OperatorMfaClient = defaultClient(),
  now: Date = new Date(),
): Promise<Enrolment | OperatorMfaFailure> {
  try {
    const listed = await client.auth.mfa.listFactors();
    if (listed.error || !listed.data) return operatorMfaFailure(listed.error);
    for (const factor of listed.data.all) {
      if (factor.factor_type !== "totp" || factor.status !== "unverified") {
        continue;
      }
      const removed = await client.auth.mfa.unenroll({ factorId: factor.id });
      if (removed.error) return operatorMfaFailure(removed.error);
    }
    const friendlyName = `Authenticator ${utcStamp(now)} UTC`;
    let enrolled = await enrol(client, friendlyName);
    if (enrolled.error?.code === "mfa_factor_name_conflict") {
      enrolled = await enrol(client, `${friendlyName} (2)`);
    }
    if (enrolled.error || !enrolled.data) {
      return operatorMfaFailure(enrolled.error);
    }
    return {
      ok: true,
      factorId: enrolled.data.id,
      qrCode: enrolled.data.totp.qr_code,
      secret: enrolled.data.totp.secret,
    };
  } catch {
    return operatorMfaFailure(null);
  }
}

export async function verifyCode(
  factorId: string,
  code: string,
  client: OperatorMfaClient = defaultClient(),
): Promise<{ ok: true } | OperatorMfaFailure> {
  try {
    const { error } = await client.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    return error ? operatorMfaFailure(error) : { ok: true };
  } catch {
    return operatorMfaFailure(null);
  }
}

export async function removeFactor(
  factorId: string,
  client: OperatorMfaClient = defaultClient(),
): Promise<{ ok: true } | OperatorMfaFailure> {
  try {
    const removed = await client.auth.mfa.unenroll({ factorId });
    if (removed.error) return operatorMfaFailure(removed.error);
    const refreshed = await client.auth.refreshSession();
    if (refreshed.error) {
      return {
        ok: false,
        message: OPERATOR_MFA_MESSAGES.generic,
        reread: true,
      };
    }
    return { ok: true };
  } catch {
    return operatorMfaFailure(null);
  }
}
