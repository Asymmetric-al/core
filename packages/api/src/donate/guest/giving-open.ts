export function isGuestGivingOpen(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return (
    env.GUEST_GIVING_ENABLED === "true" &&
    Boolean(env.TURNSTILE_SECRET_KEY?.trim()) &&
    Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()) &&
    /^pk_test_[A-Za-z0-9]+$/.test(
      env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "",
    )
  );
}
