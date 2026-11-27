export const CORE_SERVE_UNDER_PATHS_ENV = "CORE_SERVE_UNDER_PATHS";
export const CORE_APP_BASE_PATH_ENV = "CORE_APP_BASE_PATH";

export const APP_BASE_PATHS = Object.freeze({
  admin: "/admin",
  missionary: "/missionary",
  donor: "",
});

const DASHBOARD_SKIP_PREFIX = "(?!admin(?:/|$)|missionary(?:/|$))";

export const DASHBOARD_ASSET_SEGMENT = "[^/.][^/]*|\\.[^/.][^/]*|\\.\\.[^/]+";

const DASHBOARD_ORIGIN_ENV = Object.freeze({
  admin: "FRONT_ADMIN_ORIGIN",
  missionary: "FRONT_MISSIONARY_ORIGIN",
});

function isLoopbackHostname(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "[::1]" ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  );
}

export function frontUpstreamOrigin(value) {
  if (!value) return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.origin !== value) return null;
  if (url.protocol === "http:" && !isLoopbackHostname(url.hostname)) {
    return null;
  }
  return url.origin;
}

function dashboardOrigin(source, app) {
  const variable = DASHBOARD_ORIGIN_ENV[app];
  const raw = source[variable];
  const needed = `${CORE_SERVE_UNDER_PATHS_ENV}=1 needs it when the donor app is built.`;
  if (raw === undefined || raw === "") {
    throw new Error(`${variable} is missing: ${needed}`);
  }
  const origin = frontUpstreamOrigin(raw);
  if (!origin) {
    throw new Error(
      `${variable} is invalid (expected exactly an https origin, or an http origin on localhost, 127.x.x.x or [::1], with no path, trailing slash, upper case or default port): ${needed}`,
    );
  }
  return origin;
}

function normalizeEnvName(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isProductionBuildTarget(env) {
  const source = env ?? process.env;
  return (
    normalizeEnvName(source.VERCEL_TARGET_ENV) === "production" ||
    normalizeEnvName(source.VERCEL_ENV) === "production"
  );
}

export function resolveServeUnderPaths(env) {
  const source = env ?? process.env;
  const raw = source[CORE_SERVE_UNDER_PATHS_ENV];
  if (raw === undefined || raw === "" || raw === "0") {
    return false;
  }
  if (raw !== "1") {
    throw new Error(
      `Invalid ${CORE_SERVE_UNDER_PATHS_ENV} value ${JSON.stringify(raw)}: expected unset, "0", or "1".`,
    );
  }
  return true;
}

export function serveUnderPathsBuildEnv(app, env) {
  if (!Object.hasOwn(APP_BASE_PATHS, app)) {
    throw new Error(`Unknown app for serveUnderPathsBuildEnv: ${String(app)}`);
  }
  const enabled = resolveServeUnderPaths(env);
  return {
    [CORE_APP_BASE_PATH_ENV]: enabled ? APP_BASE_PATHS[app] : "",
    [CORE_SERVE_UNDER_PATHS_ENV]: enabled ? "1" : "0",
  };
}

export function deploymentPathPrefix(app, env) {
  return serveUnderPathsBuildEnv(app, env)[CORE_APP_BASE_PATH_ENV];
}

export function serveUnderPathsNextConfig(app, env) {
  const buildEnv = serveUnderPathsBuildEnv(app, env);
  const basePath = buildEnv[CORE_APP_BASE_PATH_ENV];
  return basePath ? { basePath, env: buildEnv } : { env: buildEnv };
}

export function serveUnderPathsDonorRewrites(env) {
  const source = env ?? process.env;
  if (!resolveServeUnderPaths(source)) {
    return undefined;
  }
  const beforeFiles = ["admin", "missionary"].map((app) => {
    const origin = dashboardOrigin(source, app);
    const prefix = APP_BASE_PATHS[app];
    return {
      source: `${prefix}/_next/:path(${DASHBOARD_ASSET_SEGMENT})+`,
      destination: `${origin}${prefix}/_next/:path+`,
    };
  });
  return { beforeFiles, afterFiles: [], fallback: [] };
}

export function serveUnderPathsDonorHeaders(rules, env) {
  if (!resolveServeUnderPaths(env)) {
    return rules;
  }
  return rules.map((rule) => {
    if (rule.source === "/(.*)") {
      return { ...rule, source: `/(${DASHBOARD_SKIP_PREFIX}.*)` };
    }
    const assetMatch = /^\/:all\*\(([^)]+)\)$/.exec(rule.source);
    if (assetMatch) {
      return {
        ...rule,
        source: `/(${DASHBOARD_SKIP_PREFIX}.*(?:${assetMatch[1]}))`,
      };
    }
    return rule;
  });
}
