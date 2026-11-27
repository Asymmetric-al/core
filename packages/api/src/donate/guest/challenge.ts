export const CHALLENGE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const CHALLENGE_TIMEOUT_MS = 5_000;

const MAX_TOKEN_LENGTH = 2_048;

export type ChallengeVerdict =
  { ok: true } | { ok: false; reason: "missing" | "invalid" | "unavailable" };

export type VerifyChallengeInput = {
  token: string | null | undefined;
  remoteIp: string;
  secret: string | undefined;
  fetchImpl?: (url: string, init: RequestInit) => Promise<Response>;
  timeoutMs?: number;
};

const UNAVAILABLE: ChallengeVerdict = { ok: false, reason: "unavailable" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export async function verifyGuestChallenge(
  input: VerifyChallengeInput,
): Promise<ChallengeVerdict> {
  const secret = input.secret?.trim();
  if (!secret) return UNAVAILABLE;
  const token = typeof input.token === "string" ? input.token.trim() : "";
  if (!token) return { ok: false, reason: "missing" };
  if (token.length > MAX_TOKEN_LENGTH) return { ok: false, reason: "invalid" };

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    input.timeoutMs ?? CHALLENGE_TIMEOUT_MS,
  );
  try {
    const response = await (input.fetchImpl ?? fetch)(CHALLENGE_VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: input.remoteIp,
      }),
      signal: controller.signal,
    });
    if (response.status !== 200) return UNAVAILABLE;
    let verdict: unknown;
    try {
      verdict = await response.json();
    } catch {
      return UNAVAILABLE;
    }
    return isRecord(verdict) && verdict.success === true
      ? { ok: true }
      : { ok: false, reason: "invalid" };
  } catch {
    return UNAVAILABLE;
  } finally {
    clearTimeout(timer);
  }
}
