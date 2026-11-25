export const CORE_SERVE_UNDER_PATHS_ENV = "CORE_SERVE_UNDER_PATHS";
export const CORE_APP_BASE_PATH_ENV = "CORE_APP_BASE_PATH";

export const APP_BASE_PATHS = Object.freeze({
  admin: "/admin",
  missionary: "/missionary",
  donor: "",
});

const DASHBOARD_SKIP_PREFIX = "(?!admin(?:/|$)|missionary(?:/|$))";

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
  if (isProductionBuildTarget(source)) {
    throw new Error(
      `${CORE_SERVE_UNDER_PATHS_ENV}=1 is refused on production builds (VERCEL_ENV/VERCEL_TARGET_ENV=production).`,
    );
  }
  return true;
}

export function serveUnderPathsBuildEnv(app, env) {
  if (!(app in APP_BASE_PATHS)) {
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
