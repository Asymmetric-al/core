import { describe, expect, it } from "vitest";

import {
  BUILD_MIGRATION_HEADS_ENV,
  ENVIRONMENT_MARKERS,
  MIGRATION_LEDGERS,
  RELEASE_DATABASE_CONTRACT,
  compareMigrationHeads,
  isForwardMarkerChange,
  parseBuildMigrationHeads,
  parseReleaseHealth,
} from "../../../../packages/api/src/health/release-contract.mjs";

const build = { supabase: "20261111164500", payload: "20261022_002412_x" };

describe("release database contract", () => {
  it("names every database object the release code calls in one place", () => {
    expect(RELEASE_DATABASE_CONTRACT).toEqual({
      healthRpc: "platform_health",
      healthFunction: "public.platform_health",
      recordHeadFunction: "platform.record_migration_head",
      advanceMarkerFunction: "platform.advance_environment",
    });
    expect(Object.isFrozen(RELEASE_DATABASE_CONTRACT)).toBe(true);
    expect(ENVIRONMENT_MARKERS).toEqual(["disposable", "shared", "production"]);
    expect(MIGRATION_LEDGERS).toEqual(["supabase", "payload"]);
    expect(BUILD_MIGRATION_HEADS_ENV).toBe("CORE_BUILD_MIGRATION_HEADS");
  });

  it("parses the health function result and rejects anything else", () => {
    expect(
      parseReleaseHealth({
        environment: "disposable",
        expected_heads: { supabase: "20261111164500" },
        applied_heads: { supabase: "20261111164500" },
        checked_at: "2026-11-17T00:00:00Z",
      }),
    ).toEqual({
      environment: "disposable",
      heads: { supabase: "20261111164500", payload: null },
    });
    expect(
      parseReleaseHealth(
        JSON.stringify({ environment: null, expected_heads: {} }),
      ),
    ).toEqual({ environment: null, heads: { supabase: null, payload: null } });
    for (const bad of [
      null,
      "not json",
      { environment: "staging", expected_heads: {} },
      { environment: "shared" },
      { environment: "shared", expected_heads: { supabase: 12 } },
      { environment: "shared", expected_heads: { supabase: "1;drop" } },
    ]) {
      expect(() => parseReleaseHealth(bad)).toThrow(/release health/);
    }
  });

  it("reads the heads a build was made against and treats a missing value as unknown", () => {
    expect(parseBuildMigrationHeads(JSON.stringify(build))).toEqual(build);
    expect(parseBuildMigrationHeads(undefined)).toBeNull();
    expect(parseBuildMigrationHeads("")).toBeNull();
    expect(parseBuildMigrationHeads("{")).toBeNull();
    expect(
      parseBuildMigrationHeads(JSON.stringify({ supabase: 1 })),
    ).toBeNull();
  });

  it("passes a database that equals or is ahead of the build, per ledger", () => {
    expect(compareMigrationHeads(build, { ...build }).status).toBe("ok");
    const ahead = compareMigrationHeads(build, {
      supabase: "20261201000000",
      payload: "20261201_000000_later",
    });
    expect(ahead.status).toBe("ok");
    expect(ahead.ledgers.supabase.state).toBe("ahead");
    expect(ahead.ledgers.payload.state).toBe("ahead");
  });

  it("blocks a database that is behind the build on either ledger", () => {
    const behind = compareMigrationHeads(build, {
      supabase: "20261110120000",
      payload: build.payload,
    });
    expect(behind.status).toBe("behind");
    expect(behind.ledgers.supabase.state).toBe("behind");
    expect(behind.ledgers.payload.state).toBe("equal");

    const empty = compareMigrationHeads(build, {
      supabase: build.supabase,
      payload: null,
    });
    expect(empty.status).toBe("behind");
    expect(empty.ledgers.payload.state).toBe("behind");
  });

  it("reports unknown when the build heads are unknown, never ok", () => {
    expect(
      compareMigrationHeads(null, { supabase: "1", payload: null }).status,
    ).toBe("unknown");
  });

  it("allows the environment marker to move only forward", () => {
    expect(isForwardMarkerChange("disposable", "shared")).toBe(true);
    expect(isForwardMarkerChange("disposable", "production")).toBe(true);
    expect(isForwardMarkerChange("shared", "production")).toBe(true);
    expect(isForwardMarkerChange("shared", "disposable")).toBe(false);
    expect(isForwardMarkerChange("production", "shared")).toBe(false);
    expect(isForwardMarkerChange("shared", "shared")).toBe(false);
    expect(isForwardMarkerChange(null, "shared")).toBe(false);
    expect(isForwardMarkerChange("disposable", "staging")).toBe(false);
  });
});
