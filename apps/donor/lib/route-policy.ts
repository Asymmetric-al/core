import {
  hasDotOrBackslashSegment,
  matchesDashboardPrefix,
} from "@asym/auth/front";

export const DONOR_EXEMPT_PATHS = [
  "/api/webhooks/stripe",
  "/api/health",
  "/api/health/migrations",
  "/api/playwright-ready",
] as const;

export const DONOR_ACCOUNT_ROOTS = [
  "/donor-dashboard",
  "/login",
  "/register",
  "/forgot-password",
  "/auth/callback",
  "/checkout",
  "/no-access",
  "/api",
] as const;

export const DONOR_BOTH_ROOTS = [
  "/privacy",
  "/terms",
  "/cookies",
  "/help/about",
] as const;

export type DonorPathClass = "account" | "both" | "website";

function matchesRoot(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`);
}

export function normalizeDonorPath(pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (
    hasDotOrBackslashSegment(decoded) ||
    decoded.includes("//") ||
    decoded.includes("%") ||
    matchesDashboardPrefix(decoded) !== null
  ) {
    return null;
  }
  return decoded.length > 1 && decoded.endsWith("/")
    ? decoded.slice(0, -1)
    : decoded;
}

export function isDonorExemptPath(normalizedPathname: string): boolean {
  return (DONOR_EXEMPT_PATHS as readonly string[]).includes(normalizedPathname);
}

export function classifyDonorPath(normalizedPathname: string): DonorPathClass {
  if (
    DONOR_ACCOUNT_ROOTS.some((root) => matchesRoot(normalizedPathname, root))
  ) {
    return "account";
  }
  if (DONOR_BOTH_ROOTS.some((root) => matchesRoot(normalizedPathname, root))) {
    return "both";
  }
  return "website";
}
