export declare const DATABASE_URL_ROUTING_KEYS: readonly (
  "host" | "hostaddr" | "port" | "dbname" | "user" | "service"
)[];

export declare function databaseUrlRoutingOverrides(
  databaseUrl: string | URL,
): string[];
