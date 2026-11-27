import {
  hasDotOrBackslashSegment,
  matchesDashboardPrefix,
} from "@asym/auth/front";
import {
  isReservedPublicPageSlug,
  publicPageFirstSegment,
} from "@asym/lib/cms/public-page";

export const DONOR_ROUTED_FIRST_SEGMENTS = [
  "about",
  "api",
  "auth",
  "checkout",
  "cookies",
  "donor-dashboard",
  "faq",
  "financials",
  "forgot-password",
  "help",
  "login",
  "no-access",
  "privacy",
  "register",
  "sign",
  "terms",
  "ways-to-give",
  "where-we-work",
  "workers",
] as const;

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

export const DONOR_HOME_REDIRECT_ROOTS = [
  "/register",
  "/forgot-password",
  "/auth/callback",
  "/donor-dashboard",
] as const;

export const DONOR_BOTH_ROOTS = [
  "/privacy",
  "/terms",
  "/cookies",
  "/help/about",
] as const;

export const DONOR_GIVING_PATHS = [
  "/checkout",
  "/api/checkout/config",
  "/api/donate",
] as const;

export type DonorPathClass = "account" | "both" | "giving" | "website";

export type DonorPathTransport = "none" | "rsc" | "segment";

export interface ResolvedDonorPath {
  readonly pathname: string;
  readonly transport: DonorPathTransport;
}

export const NEXT_RSC_SEGMENTS_DIR_SUFFIX = ".segments";
export const NEXT_RSC_SEGMENT_SUFFIX = ".segment.rsc";
export const NEXT_RSC_SUFFIX = ".rsc";
export const NEXT_RSC_SEGMENT_STRIPPED_SUFFIX = NEXT_RSC_SEGMENT_SUFFIX.slice(
  0,
  -NEXT_RSC_SUFFIX.length,
);
export const NEXT_ROOT_TRANSPORT_PATH = "/index";

const SEGMENTS_MARKER = `${NEXT_RSC_SEGMENTS_DIR_SUFFIX}/`;

function matchesRoot(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`);
}

export function isHomeRedirectPath(normalizedPathname: string): boolean {
  return DONOR_HOME_REDIRECT_ROOTS.some((root) =>
    matchesRoot(normalizedPathname, root),
  );
}

function denormalizeTransportPagePath(pagePath: string): string {
  if (pagePath === NEXT_ROOT_TRANSPORT_PATH) return "/";
  if (pagePath.startsWith(`${NEXT_ROOT_TRANSPORT_PATH}/`)) {
    return pagePath.slice(NEXT_ROOT_TRANSPORT_PATH.length);
  }
  return pagePath;
}

export function resolveDonorPath(pathname: string): ResolvedDonorPath | null {
  if (/%2f/i.test(pathname)) return null;
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
  if (decoded.includes(SEGMENTS_MARKER)) {
    const idx = decoded.indexOf(SEGMENTS_MARKER);
    const pagePart = decoded.slice(0, idx);
    const rest = decoded.slice(idx + SEGMENTS_MARKER.length);
    if (
      rest.includes(SEGMENTS_MARKER) ||
      !pagePart.startsWith("/") ||
      pagePart.length <= 1 ||
      pagePart.endsWith("/")
    ) {
      return null;
    }
    let segmentName: string;
    if (rest.endsWith(NEXT_RSC_SEGMENT_SUFFIX)) {
      segmentName = rest.slice(0, -NEXT_RSC_SEGMENT_SUFFIX.length);
    } else if (rest.endsWith(NEXT_RSC_SEGMENT_STRIPPED_SUFFIX)) {
      segmentName = rest.slice(0, -NEXT_RSC_SEGMENT_STRIPPED_SUFFIX.length);
    } else {
      return null;
    }
    if (
      segmentName.length === 0 ||
      segmentName.startsWith("/") ||
      segmentName.endsWith("/")
    ) {
      return null;
    }
    const mapped = denormalizeTransportPagePath(pagePart);
    if (matchesDashboardPrefix(mapped) !== null) return null;
    return { pathname: mapped, transport: "segment" };
  }
  if (decoded.endsWith(NEXT_RSC_SUFFIX)) {
    const pagePart = decoded.slice(0, -NEXT_RSC_SUFFIX.length);
    if (
      !pagePart.startsWith("/") ||
      pagePart.length <= 1 ||
      pagePart.endsWith("/") ||
      pagePart.endsWith(NEXT_RSC_SUFFIX)
    ) {
      return null;
    }
    const mapped = denormalizeTransportPagePath(pagePart);
    if (matchesDashboardPrefix(mapped) !== null) return null;
    return { pathname: mapped, transport: "rsc" };
  }
  const normalized =
    decoded.length > 1 && decoded.endsWith("/")
      ? decoded.slice(0, -1)
      : decoded;
  return { pathname: normalized, transport: "none" };
}

export function normalizeDonorPath(pathname: string): string | null {
  return resolveDonorPath(pathname)?.pathname ?? null;
}

export function isUnroutedReservedPath(pathname: string): boolean {
  return (
    pathname !== "/" &&
    isReservedPublicPageSlug(pathname) &&
    !(DONOR_ROUTED_FIRST_SEGMENTS as readonly string[]).includes(
      publicPageFirstSegment(pathname),
    )
  );
}

export function isDonorExemptPath(normalizedPathname: string): boolean {
  return (DONOR_EXEMPT_PATHS as readonly string[]).includes(normalizedPathname);
}

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

export function isGivingPath(normalizedPathname: string): boolean {
  return (
    normalizedPathname === "/api/checkout/config" ||
    normalizedPathname === "/api/donate" ||
    matchesRoot(normalizedPathname, "/checkout")
  );
}

export function classifyDonorPath(
  normalizedPathname: string,
  givingOpen = isGuestGivingOpen(),
): DonorPathClass {
  if (givingOpen && isGivingPath(normalizedPathname)) return "giving";
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
