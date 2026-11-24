/**
 * Loads the current address as a new document. Changing organization or
 * assignment is a full document load, which leaves no client, query or upload
 * state of the old scope behind (plan 5.2; ADR-0174 clause 7). Its own module
 * so tests can observe it: jsdom cannot navigate.
 */
export function reloadDocument(): void {
  window.location.reload();
}

/**
 * Loads `href` as a new document: what a navigation that crosses the tenant
 * segment's boundary does instead of a client-side transition (AL-2675,
 * council round 1).
 */
export function loadDocument(
  href: string,
  options: { replace?: boolean } = {},
): void {
  if (options.replace) window.location.replace(href);
  else window.location.assign(href);
}

export const APP_BASE_PATHS = {
  admin: "/admin",
  missionary: "/missionary",
  donor: "",
} as const;

export type AppSurface = keyof typeof APP_BASE_PATHS;

export function isServeUnderPathsEnabled(): boolean {
  return process.env.CORE_SERVE_UNDER_PATHS === "1";
}

export function appBasePath(): string {
  return process.env.CORE_APP_BASE_PATH ?? "";
}

function prefixPath(base: string, path: string): string {
  if (!base || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === "/") return base;
  if (path.startsWith("/?") || path.startsWith("/#")) {
    return `${base}${path.slice(1)}`;
  }
  return `${base}${path}`;
}

export function appPathname(pathname: string): string {
  const base = appBasePath();
  if (!base) return pathname;
  if (pathname === base || pathname === `${base}/`) return "/";
  return pathname.startsWith(`${base}/`)
    ? pathname.slice(base.length)
    : pathname;
}

export function withAppBasePath(path: string): string {
  return prefixPath(appBasePath(), path);
}

export function crossAppHref(app: AppSurface, path: string): string {
  if (!isServeUnderPathsEnabled()) return path;
  return prefixPath(APP_BASE_PATHS[app], path);
}
