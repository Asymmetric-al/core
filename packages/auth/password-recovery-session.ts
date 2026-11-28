import { passwordRecoverySecondsLeft } from "./password-recovery";

interface ClaimsReader {
  auth: {
    getClaims(): Promise<{
      data: { claims?: { amr?: unknown } } | null;
      error: unknown;
    }>;
  };
}

export async function recoverySecondsLeft(
  supabase: ClaimsReader,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<number | null> {
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  return passwordRecoverySecondsLeft(data.claims.amr, nowSeconds);
}
