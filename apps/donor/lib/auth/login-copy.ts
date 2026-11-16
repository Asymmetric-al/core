/** Whether a sign-in was triggered by an unfinished gift. */
function isCheckoutPath(nextPath: string | null): boolean {
  if (!nextPath) return false;
  const pathname = nextPath.split(/[?#]/, 1)[0] ?? "";
  return pathname === "/checkout" || pathname.startsWith("/checkout/");
}

/**
 * The donor sign-in heading. When checkout sent someone here, say so, so the
 * detour reads as a step in giving rather than a lost page.
 */
export function donorLoginCopy(nextPath: string | null) {
  return {
    title: "Sign In",
    subtitle: isCheckoutPath(nextPath)
      ? "Sign in to finish your gift. We’ll bring you straight back to it."
      : "Access the donor portal",
  };
}
