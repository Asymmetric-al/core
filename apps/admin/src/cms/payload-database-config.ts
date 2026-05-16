export const DEFAULT_LOCAL_PAYLOAD_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const PAYLOAD_DATABASE_ENV_KEYS = [
  "PAYLOAD_DATABASE_URI",
  "SUPABASE_DB_URL",
] as const;

const PROTECTED_TARGET_ENVIRONMENTS = new Set(["production", "staging"]);
const DIRECT_SUPABASE_HOST_RE = /^db\.[a-z0-9]+\.supabase\.co$/i;
const SUPAVISOR_POOLER_HOST_RE = /(?:^|\.)pooler\.supabase\.com$/i;

type PayloadDatabaseEnvKey = (typeof PAYLOAD_DATABASE_ENV_KEYS)[number];

type PayloadDatabaseEnv = Partial<
  Record<
    PayloadDatabaseEnvKey | "NODE_ENV" | "VERCEL_ENV" | "VERCEL_TARGET_ENV",
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
  issue: PayloadDatabaseConfigIssue | null;
  sslMode: string | null;
  source: PayloadDatabaseSource;
  warning: string | null;
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
  const issue = getPayloadDatabaseConfigurationIssue({
    host,
    isDefaultLocal,
    isDirectSupabaseHost,
    isProtectedDeployment,
    isSupavisorPoolerHost: isSupavisorPoolerDatabaseHost,
    source,
    sslMode,
  });
  const warning = getPayloadDatabaseConfigurationWarning({
    isDefaultLocal,
    isDirectSupabaseHost,
    issue,
    nodeEnv: env.NODE_ENV,
  });

  return {
    connectionString,
    host,
    isDefaultLocal,
    isDirectSupabaseHost,
    isProtectedDeployment,
    isSupavisorPoolerHost: isSupavisorPoolerDatabaseHost,
    issue,
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
