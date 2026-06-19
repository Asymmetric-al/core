export const DEFAULT_LOCAL_PAYLOAD_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const PAYLOAD_DATABASE_ENV_KEYS = [
  "PAYLOAD_DATABASE_URI",
  "SUPABASE_DB_URL",
] as const;

const DEFAULT_HOSTED_PAYLOAD_DATABASE_POOL_MAX = 2;
const DEFAULT_HOSTED_PAYLOAD_DATABASE_POOL_IDLE_TIMEOUT_MS = 5_000;
const DEFAULT_HOSTED_PAYLOAD_DATABASE_POOL_CONNECTION_TIMEOUT_MS = 5_000;
const MIN_PAYLOAD_DATABASE_POOL_MAX = 2;
// "staging" is a transitional alias: the renamed "development" environment may still report
// VERCEL_TARGET_ENV="staging" until the Vercel custom-environment rename lands. Keep the
// Payload protected-database guards active during the cutover, matching
// packages/env/src/schema.ts and packages/api/src/admin/crm/twenty-health.ts. Safe to remove
// once infra reports "development".
const PROTECTED_TARGET_ENVIRONMENTS = new Set([
  "production",
  "development",
  "staging",
]);
const DIRECT_SUPABASE_HOST_RE = /^db\.[a-z0-9]+\.supabase\.co$/i;
const SUPAVISOR_POOLER_HOST_RE = /(?:^|\.)pooler\.supabase\.com$/i;

type PayloadDatabaseEnvKey = (typeof PAYLOAD_DATABASE_ENV_KEYS)[number];

type PayloadDatabaseEnv = Partial<
  Record<
    | PayloadDatabaseEnvKey
    | "NODE_ENV"
    | "PAYLOAD_DATABASE_POOL_MAX"
    | "VERCEL"
    | "VERCEL_ENV"
    | "VERCEL_TARGET_ENV",
    string
  >
>;

export type PayloadDatabaseConfigIssueCode =
  | "missing-protected-database-url"
  | "invalid-protected-database-url"
  | "direct-supabase-host"
  | "supavisor-ssl-mode";

export type PayloadDatabaseSource = PayloadDatabaseEnvKey | "default-local";

export type PayloadDatabaseConfigIssue = {
  code: PayloadDatabaseConfigIssueCode;
  message: string;
};

export type PayloadDatabaseConfig = {
  connectionString: string;
  host: string | null;
  isDefaultLocal: boolean;
  isDirectSupabaseHost: boolean;
  isProtectedDeployment: boolean;
  isSupavisorPoolerHost: boolean;
  isVercelRuntime: boolean;
  issue: PayloadDatabaseConfigIssue | null;
  pool: PayloadDatabasePoolOptions;
  sslMode: string | null;
  source: PayloadDatabaseSource;
  warning: string | null;
};

export type PayloadDatabasePoolOptions = {
  connectionString: string;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  max?: number;
};

export class PayloadDatabaseConfigurationError extends Error {
  readonly code: PayloadDatabaseConfigIssueCode;
  readonly statusCode = 503;

  constructor(
    issue: PayloadDatabaseConfigIssue,
    options?: { cause?: unknown },
  ) {
    super(issue.message, options);
    this.name = "PayloadDatabaseConfigurationError";
    this.code = issue.code;
  }
}

function firstNonEmptyEnv(env: PayloadDatabaseEnv) {
  for (const key of PAYLOAD_DATABASE_ENV_KEYS) {
    const value = env[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return {
        key,
        value: value.trim(),
      };
    }
  }

  return null;
}

function normalizeEnvName(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isProtectedPayloadDeployment(
  env: PayloadDatabaseEnv = process.env,
) {
  const vercelTargetEnv = normalizeEnvName(env.VERCEL_TARGET_ENV);
  const vercelEnv = normalizeEnvName(env.VERCEL_ENV);

  return (
    PROTECTED_TARGET_ENVIRONMENTS.has(vercelTargetEnv) ||
    vercelEnv === "production"
  );
}

export function isVercelPayloadRuntime(env: PayloadDatabaseEnv = process.env) {
  return Boolean(env.VERCEL || env.VERCEL_ENV || env.VERCEL_TARGET_ENV);
}

export function getConnectionHost(connectionString: string | null) {
  if (!connectionString) {
    return null;
  }

  try {
    return new URL(connectionString).hostname;
  } catch {
    return null;
  }
}

function getConnectionSslMode(connectionString: string | null) {
  if (!connectionString) {
    return null;
  }

  try {
    return new URL(connectionString).searchParams.get("sslmode");
  } catch {
    return null;
  }
}

export function isDirectSupabaseDatabaseHost(hostname: string | null) {
  return Boolean(hostname && DIRECT_SUPABASE_HOST_RE.test(hostname));
}

export function isSupavisorPoolerHost(hostname: string | null) {
  return Boolean(hostname && SUPAVISOR_POOLER_HOST_RE.test(hostname));
}

function parsePayloadDatabasePoolMax(value: string | undefined) {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue)) {
    return null;
  }

  if (parsedValue < MIN_PAYLOAD_DATABASE_POOL_MAX) {
    return MIN_PAYLOAD_DATABASE_POOL_MAX;
  }

  return parsedValue;
}

function getPayloadDatabasePoolWarning(input: {
  configuredPoolMax: string | undefined;
}) {
  const configuredPoolMax = input.configuredPoolMax?.trim();

  if (!configuredPoolMax) {
    return null;
  }

  const parsedValue = Number(configuredPoolMax);

  if (!Number.isInteger(parsedValue)) {
    return `[payload] Ignoring PAYLOAD_DATABASE_POOL_MAX because it is not an integer. Hosted Web Studio deployments will use ${DEFAULT_HOSTED_PAYLOAD_DATABASE_POOL_MAX}.`;
  }

  if (parsedValue < MIN_PAYLOAD_DATABASE_POOL_MAX) {
    return `[payload] PAYLOAD_DATABASE_POOL_MAX must be at least ${MIN_PAYLOAD_DATABASE_POOL_MAX} because Payload keeps one startup Postgres client checked out. Using ${MIN_PAYLOAD_DATABASE_POOL_MAX}.`;
  }

  return null;
}

function resolvePayloadDatabasePoolOptions(input: {
  connectionString: string;
  env: PayloadDatabaseEnv;
  isProtectedDeployment: boolean;
  isVercelRuntime: boolean;
}): PayloadDatabasePoolOptions {
  const configuredPoolMax = parsePayloadDatabasePoolMax(
    input.env.PAYLOAD_DATABASE_POOL_MAX,
  );
  const shouldBoundPool =
    configuredPoolMax !== null ||
    input.isProtectedDeployment ||
    input.isVercelRuntime;

  if (!shouldBoundPool) {
    return {
      connectionString: input.connectionString,
    };
  }

  return {
    connectionString: input.connectionString,
    connectionTimeoutMillis:
      DEFAULT_HOSTED_PAYLOAD_DATABASE_POOL_CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: DEFAULT_HOSTED_PAYLOAD_DATABASE_POOL_IDLE_TIMEOUT_MS,
    max: configuredPoolMax ?? DEFAULT_HOSTED_PAYLOAD_DATABASE_POOL_MAX,
  };
}

function combineWarnings(...warnings: Array<null | string>) {
  const filteredWarnings = warnings.filter((warning): warning is string =>
    Boolean(warning),
  );

  if (filteredWarnings.length === 0) {
    return null;
  }

  return filteredWarnings.join(" ");
}

function getPayloadDatabaseConfigurationIssue(input: {
  host: string | null;
  isDefaultLocal: boolean;
  isDirectSupabaseHost: boolean;
  isProtectedDeployment: boolean;
  isSupavisorPoolerHost: boolean;
  source: PayloadDatabaseSource;
  sslMode: string | null;
}): PayloadDatabaseConfigIssue | null {
  if (!input.isProtectedDeployment) {
    return null;
  }

  if (input.isDefaultLocal) {
    return {
      code: "missing-protected-database-url",
      message:
        "Payload database configuration is missing for this protected deployment. Set PAYLOAD_DATABASE_URI on the admin Vercel project to the Supavisor session pooler Postgres URL before opening Web Studio.",
    };
  }

  if (!input.host) {
    return {
      code: "invalid-protected-database-url",
      message: `Payload database configuration from ${input.source} is not a valid Postgres URL. Replace it with the Supavisor session pooler Postgres URL before opening Web Studio.`,
    };
  }

  if (input.isDirectSupabaseHost) {
    return {
      code: "direct-supabase-host",
      message: `Payload database configuration points at Supabase direct database host ${input.host}. Vercel cannot reliably resolve or reach that IPv6-only host; set PAYLOAD_DATABASE_URI to the Supavisor session pooler Postgres URL before opening Web Studio.`,
    };
  }

  if (input.isSupavisorPoolerHost && input.sslMode !== "no-verify") {
    return {
      code: "supavisor-ssl-mode",
      message:
        "Payload database configuration uses a Supavisor pooler host, but the connection string must include sslmode=no-verify for the current Vercel/Node pg runtime. Otherwise Web Studio fails with SELF_SIGNED_CERT_IN_CHAIN before Payload can render.",
    };
  }

  return null;
}

function getPayloadDatabaseConfigurationWarning(input: {
  isDefaultLocal: boolean;
  isDirectSupabaseHost: boolean;
  issue: PayloadDatabaseConfigIssue | null;
  nodeEnv: string | undefined;
}) {
  if (input.issue) {
    return `[payload] ${input.issue.message}`;
  }

  if (input.isDefaultLocal && input.nodeEnv === "development") {
    return "[payload] No PAYLOAD_DATABASE_URI or SUPABASE_DB_URL found; using default local Postgres at 127.0.0.1:54322. Web Studio needs a reachable DB (supabase start, or set PAYLOAD_DATABASE_URI).";
  }

  if (input.isDirectSupabaseHost) {
    return "[payload] Payload is configured with a Supabase direct database host. IPv4-only hosts such as Vercel should use the Supavisor session pooler URL in PAYLOAD_DATABASE_URI.";
  }

  return null;
}

export function resolvePayloadDatabaseConfig(
  env: PayloadDatabaseEnv = process.env,
): PayloadDatabaseConfig {
  const selectedEnv = firstNonEmptyEnv(env);
  const connectionString =
    selectedEnv?.value ?? DEFAULT_LOCAL_PAYLOAD_DATABASE_URL;
  const source = selectedEnv?.key ?? "default-local";
  const host = getConnectionHost(connectionString);
  const sslMode = getConnectionSslMode(connectionString);
  const isDefaultLocal = !selectedEnv;
  const isDirectSupabaseHost = isDirectSupabaseDatabaseHost(host);
  const isProtectedDeployment = isProtectedPayloadDeployment(env);
  const isSupavisorPoolerDatabaseHost = isSupavisorPoolerHost(host);
  const isVercelRuntime = isVercelPayloadRuntime(env);
  const issue = getPayloadDatabaseConfigurationIssue({
    host,
    isDefaultLocal,
    isDirectSupabaseHost,
    isProtectedDeployment,
    isSupavisorPoolerHost: isSupavisorPoolerDatabaseHost,
    source,
    sslMode,
  });
  const pool = resolvePayloadDatabasePoolOptions({
    connectionString,
    env,
    isProtectedDeployment,
    isVercelRuntime,
  });
  const warning = combineWarnings(
    getPayloadDatabaseConfigurationWarning({
      isDefaultLocal,
      isDirectSupabaseHost,
      issue,
      nodeEnv: env.NODE_ENV,
    }),
    getPayloadDatabasePoolWarning({
      configuredPoolMax: env.PAYLOAD_DATABASE_POOL_MAX,
    }),
  );

  return {
    connectionString,
    host,
    isDefaultLocal,
    isDirectSupabaseHost,
    isProtectedDeployment,
    isSupavisorPoolerHost: isSupavisorPoolerDatabaseHost,
    isVercelRuntime,
    issue,
    pool,
    sslMode,
    source,
    warning,
  };
}

export function assertPayloadDatabaseConfiguration(
  config = resolvePayloadDatabaseConfig(),
) {
  if (config.issue) {
    throw new PayloadDatabaseConfigurationError(config.issue);
  }

  return config;
}
