export declare const DATABASE_URL_ROUTING_KEYS: readonly (
  "host" | "hostaddr" | "port" | "dbname" | "user" | "service"
)[];

export declare function databaseUrlRoutingOverrides(
  databaseUrl: string | URL,
): string[];

export declare const DATABASE_URL_QUERY_KEYS: Readonly<
  Record<string, Readonly<{ psql: boolean; reason: string }>>
>;

export declare function libpqQueryEntries(
  databaseUrl: string | URL,
): [string, string][];

export declare function databaseUrlQueryProblem(
  databaseUrl: string | URL,
  options?: { forPsql?: boolean },
): string | null;

export declare const SUPABASE_POOLER_HOST: RegExp;

export declare const HOSTED_LIBPQ_ENV: Readonly<{ PGREQUIREAUTH: string }>;

export declare const KEPT_AMBIENT_LIBPQ_ENV: Readonly<{
  PGPASSWORD: string;
  PGSSLROOTCERT: string;
}>;

export declare function keptAmbientLibpqEnv(
  env: Record<string, string | undefined>,
  keep?: ReadonlyArray<"PGPASSWORD" | "PGSSLROOTCERT">,
): Record<string, string | undefined>;

export declare function databaseUrlHostProblem(
  databaseUrl: string | URL,
): string | null;

export declare const DATABASE_URL_QUERY_ENV: Readonly<Record<string, string>>;

export declare function databaseUrlProblem(
  databaseUrl: string | URL,
  options?: { forPsql?: boolean },
): string | null;

export declare function libpqUrlMismatch(
  databaseUrl: string | URL | null | undefined,
): string | null;

export declare const LOOPBACK_DATABASE_HOSTS: readonly (
  "127.0.0.1" | "localhost" | "[::1]"
)[];

export declare function isLoopbackDatabaseUrl(
  databaseUrl: string | URL | null | undefined,
): boolean;
