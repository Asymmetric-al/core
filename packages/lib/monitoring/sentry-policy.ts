import { appPathname } from "@asym/database/app-base-path";

import type { init, replayIntegration } from "@sentry/nextjs";

type SentryOptions = Parameters<typeof init>[0];
type ReplayIntegrationOptions = NonNullable<
  Parameters<typeof replayIntegration>[0]
>;

const INVITE_PATH_PATTERN = /^\/invite\/[^/?#]+\/?$/;
const INVITE_URL_FRAGMENT_PATTERN =
  /(\/invite\/[^/?#\s"'<>]+\/?(?:\?[^#\s"'<>]*)?)#[^\s"'<>]*/g;

let pendingInviteFragment: { pathname: string; verifier: string } | null = null;

function normalizeInvitePathname(pathname: string): string {
  const stripped = appPathname(pathname);
  return stripped.length > 1 && stripped.endsWith("/")
    ? stripped.slice(0, -1)
    : stripped;
}

export function scrubInviteFragmentFromUrl(value: string): string {
  return value.replace(INVITE_URL_FRAGMENT_PATTERN, "$1");
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function scrubInviteFragmentsDeep<T>(
  value: T,
  depth = 0,
  seen = new WeakSet<object>(),
): T {
  if (depth > 16 || value === null || value === undefined) return value;
  if (typeof value === "string") {
    return scrubInviteFragmentFromUrl(value) as T;
  }
  if (typeof value !== "object") return value;
  if (seen.has(value)) return value;
  seen.add(value);
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      value[i] = scrubInviteFragmentsDeep(value[i], depth + 1, seen);
    }
    return value;
  }
  if (isPlainRecord(value)) {
    const record: Record<string, unknown> = value;
    for (const key of Object.keys(record)) {
      record[key] = scrubInviteFragmentsDeep(record[key], depth + 1, seen);
    }
  }
  return value;
}

type BrowserWindowLike = {
  location: {
    origin: string;
    pathname: string;
    search: string;
    hash: string;
  };
  history: {
    state: unknown;
    replaceState: (data: unknown, unused: string, url?: string | null) => void;
  };
};

function getBrowserWindow(): BrowserWindowLike | undefined {
  return (globalThis as { window?: BrowserWindowLike }).window;
}

export function clearPendingInviteFragment(nextHref?: string): void {
  if (!pendingInviteFragment) return;
  if (!nextHref) {
    pendingInviteFragment = null;
    return;
  }
  try {
    const win = getBrowserWindow();
    const base = win ? win.location.origin : "https://invalid.local";
    const nextPathname = normalizeInvitePathname(
      new URL(nextHref, base).pathname,
    );
    if (nextPathname !== pendingInviteFragment.pathname) {
      pendingInviteFragment = null;
    }
  } catch {
    pendingInviteFragment = null;
  }
}

export function captureAndStripInviteFragment(): string | null {
  const win = getBrowserWindow();
  if (!win) return null;
  const { pathname, search, hash } = win.location;
  const normalizedPathname = normalizeInvitePathname(pathname);
  if (!INVITE_PATH_PATTERN.test(normalizedPathname) || !hash) {
    if (
      pendingInviteFragment &&
      pendingInviteFragment.pathname !== normalizedPathname
    ) {
      pendingInviteFragment = null;
    }
    return null;
  }
  const verifier = hash.startsWith("#") ? hash.slice(1).trim() : hash.trim();
  win.history.replaceState(win.history.state, "", `${pathname}${search}`);
  if (verifier) {
    pendingInviteFragment = { pathname: normalizedPathname, verifier };
    return verifier;
  }
  pendingInviteFragment = null;
  return null;
}

export function consumeInviteFragment(pathname: string): string | null {
  if (!pendingInviteFragment) return null;
  const current = pendingInviteFragment;
  pendingInviteFragment = null;
  if (current.pathname !== normalizeInvitePathname(pathname)) return null;
  return current.verifier;
}

export function getInviteSafeReplayOptions(): ReplayIntegrationOptions {
  return {
    beforeAddRecordingEvent(event) {
      return scrubInviteFragmentsDeep(event);
    },
  };
}

/** Preserve v10 collection and trace behavior while the SDK runs on v11. */
export function getSentryCompatibilityOptions() {
  const sensitiveKeys = [
    "forwarded",
    "-ip",
    "remote-",
    "via",
    "-user",
    "x-asym-front-",
  ];

  return {
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        // Node RequestData does not filter query values inside Referer.
        // Deny the whole header consistently across runtimes.
        request: { deny: [...sensitiveKeys, "referer", "referrer"] },
        response: { deny: [...sensitiveKeys] },
      },
      httpBodies: [],
      urlQueryParams: { deny: [...sensitiveKeys] },
      genAI: { inputs: false, outputs: false },
      mcp: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      graphQL: { document: false, variables: false },
      frameContextLines: 7,
    },
    beforeBreadcrumb(breadcrumb) {
      return scrubInviteFragmentsDeep(breadcrumb);
    },
    beforeSend(event) {
      return scrubInviteFragmentsDeep(event);
    },
    beforeSendTransaction(event) {
      return scrubInviteFragmentsDeep(event);
    },
    // Scope tags still apply to transactions in this supported compatibility mode.
    traceLifecycle: "static" as const,
    attachStacktrace: false,
    // No profiling integration was installed in v10. Keep profiling disabled.
    profileSessionSampleRate: 0,
    profileLifecycle: "trace" as const,
  } satisfies SentryOptions;
}
