export type BuildInfo = {
  /**
   * Git ref used to build URLs to the corresponding source.
   * Prefer an immutable tag or commit SHA; falls back to the default branch.
   */
  ref: string;
  refSource: "env" | "fallback";
  displayRef: string;
  buildDate?: string;
};

const DEFAULT_REF_FALLBACK = "develop";

function pickFirstEnv(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
}

function looksLikeGitSha(value: string): boolean {
  return /^[0-9a-f]{7,40}$/i.test(value);
}

function normalizeBuildDate(value: string): string | undefined {
  // Prefer YYYY-MM-DD if present.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // Common case: ISO timestamp.
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);

  // Epoch seconds.
  if (/^\d{10}$/.test(value)) {
    const asNumber = Number(value) * 1000;
    const asDate = new Date(asNumber);
    if (!Number.isNaN(asDate.getTime()))
      return asDate.toISOString().slice(0, 10);
  }

  // Epoch milliseconds.
  if (/^\d{13}$/.test(value)) {
    const asNumber = Number(value);
    const asDate = new Date(asNumber);
    if (!Number.isNaN(asDate.getTime()))
      return asDate.toISOString().slice(0, 10);
  }

  return undefined;
}

export function getBuildInfo(): BuildInfo {
  const refFromEnv = pickFirstEnv([
    // Explicit (recommended) variables.
    "NEXT_PUBLIC_APP_VERSION",
    "APP_VERSION",
    "NEXT_PUBLIC_GIT_REF",
    "GIT_REF",
    "NEXT_PUBLIC_GIT_SHA",
    "GIT_SHA",
    // Common CI / hosting providers.
    "VERCEL_GIT_COMMIT_SHA",
    "GITHUB_SHA",
    "RENDER_GIT_COMMIT",
    "FLY_IMAGE_REF",
  ]);

  const ref = refFromEnv ?? DEFAULT_REF_FALLBACK;
  const displayRef = looksLikeGitSha(ref) ? ref.slice(0, 7) : ref;

  const buildDateRaw = pickFirstEnv([
    "NEXT_PUBLIC_BUILD_DATE",
    "BUILD_DATE",
    "SOURCE_DATE_EPOCH",
  ]);

  return {
    ref,
    refSource: refFromEnv ? "env" : "fallback",
    displayRef,
    buildDate: buildDateRaw ? normalizeBuildDate(buildDateRaw) : undefined,
  };
}

export const CORE_REPO = "Asymmetric-al/core" as const;
export const CORE_REPO_URL = `https://github.com/${CORE_REPO}` as const;

export function getGitHubSourceTreeUrl(ref: string): string {
  return `${CORE_REPO_URL}/tree/${ref}`;
}

export function getGitHubLicenseUrl(ref: string): string {
  return `${CORE_REPO_URL}/blob/${ref}/LICENSE`;
}
