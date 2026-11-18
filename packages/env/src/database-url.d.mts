export declare const DATABASE_URL_ROUTING_KEYS: readonly (
  "host" | "hostaddr" | "port" | "dbname" | "user" | "service"
)[];

export declare function databaseUrlRoutingOverrides(
  databaseUrl: string | URL,
): string[];

export declare function libpqUrlMismatch(
  databaseUrl: string | URL | null | undefined,
): string | null;

export declare const LOOPBACK_DATABASE_HOSTS: readonly (
  "127.0.0.1" | "localhost" | "[::1]"
)[];

export declare function isLoopbackDatabaseUrl(
  databaseUrl: string | URL | null | undefined,
): boolean;
