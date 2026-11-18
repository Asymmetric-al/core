export type MigrationLedger = "supabase" | "payload";
export type EnvironmentMarker = "disposable" | "shared" | "production";

export interface MigrationHeads {
  supabase: string | null;
  payload: string | null;
}

export interface ReleaseHealth {
  environment: EnvironmentMarker | null;
  heads: MigrationHeads;
}

export type LedgerState = "equal" | "ahead" | "behind" | "unknown";

export interface MigrationHeadComparison {
  status: "ok" | "behind" | "unknown";
  ledgers: Record<
    MigrationLedger,
    { build: string | null; database: string | null; state: LedgerState }
  >;
}

export declare const BUILD_MIGRATION_HEADS_ENV: "CORE_BUILD_MIGRATION_HEADS";
export declare const MIGRATION_LEDGERS: readonly MigrationLedger[];
export declare const ENVIRONMENT_MARKERS: readonly EnvironmentMarker[];
export declare const RELEASE_DATABASE_CONTRACT: Readonly<{
  healthRpc: "platform_health";
  healthFunction: "public.platform_health";
  recordHeadFunction: "platform.record_migration_head";
  advanceMarkerFunction: "platform.advance_environment";
}>;

export declare function parseReleaseHealth(value: unknown): ReleaseHealth;
export declare function parseBuildMigrationHeads(
  raw: string | undefined,
): MigrationHeads | null;
export declare function compareMigrationHeads(
  build: MigrationHeads | null,
  database: MigrationHeads | null,
): MigrationHeadComparison;
export declare function isForwardMarkerChange(
  current: string | null,
  next: string,
): boolean;
