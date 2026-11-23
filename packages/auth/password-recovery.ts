export const PASSWORD_RECOVERY_PATHS = {
  request: "/forgot-password",
  callback: "/forgot-password/callback",
  reset: "/forgot-password/reset",
} as const;

export const PASSWORD_RECOVERY_WINDOW_SECONDS = 60 * 60;

const CLOCK_SKEW_SECONDS = 60;

export function passwordRecoveryRedirectUrl(origin: string): string {
  return new URL(PASSWORD_RECOVERY_PATHS.callback, origin).toString();
}

export function passwordRecoverySecondsLeft(
  amr: unknown,
  nowSeconds: number,
): number | null {
  if (!Array.isArray(amr)) {
    return null;
  }

  let latest: number | null = null;
  for (const entry of amr as unknown[]) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const { method, timestamp } = entry as {
      method?: unknown;
      timestamp?: unknown;
    };
    if (
      method === "recovery" &&
      typeof timestamp === "number" &&
      timestamp <= nowSeconds + CLOCK_SKEW_SECONDS &&
      nowSeconds - timestamp <= PASSWORD_RECOVERY_WINDOW_SECONDS &&
      (latest === null || timestamp > latest)
    ) {
      latest = timestamp;
    }
  }

  if (latest === null) {
    return null;
  }
  return Math.min(
    PASSWORD_RECOVERY_WINDOW_SECONDS,
    latest + PASSWORD_RECOVERY_WINDOW_SECONDS - nowSeconds,
  );
}
