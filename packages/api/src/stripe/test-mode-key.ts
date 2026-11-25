export class StripeLiveModeRefusedError extends Error {
  constructor() {
    super(
      "Live Stripe keys are refused: this program runs Stripe Connect in test mode only.",
    );
    this.name = "StripeLiveModeRefusedError";
  }
}

export function assertStripeTestModeKey(secretKey: string): string {
  const trimmed = secretKey.trim();
  if (!trimmed) {
    throw new Error("Stripe test secret key is missing.");
  }
  if (/^(?:sk|rk|pk)_live_/.test(trimmed)) {
    throw new StripeLiveModeRefusedError();
  }
  if (!/^(?:sk|rk)_test_/.test(trimmed)) {
    throw new Error(
      "Expected a Stripe test secret key (sk_test_ or rk_test_).",
    );
  }
  return trimmed;
}
