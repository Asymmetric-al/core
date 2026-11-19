import { describe, expect, it } from "vitest";

import {
  KNOWN_PROJECT_REFS,
  assertDatabaseTarget,
  projectRefOfDatabaseUrl,
} from "../../../../scripts/release/lib/database-target.mjs";

const ref = "abcdefghijklmnopqrst";
const pooled = `postgresql://postgres.${ref}:pw@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`;
const direct = `postgresql://postgres:pw@db.${ref}.supabase.co:5432/postgres?sslmode=require`;

describe("release database target", () => {
  it("accepts the approved project through the session pooler or the direct host", () => {
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: pooled,
        projectRef: ref,
        role: "postgres",
      }),
    ).not.toThrow();
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: direct,
        projectRef: ref,
        role: "postgres",
      }),
    ).not.toThrow();
    expect(projectRefOfDatabaseUrl(pooled)).toBe(ref);
    expect(projectRefOfDatabaseUrl(direct)).toBe(ref);
  });

  it("refuses another project, another role, an unencrypted link or routing overrides", () => {
    const other = pooled.replace(ref, "zzzzzzzzzzzzzzzzzzzz");
    for (const [databaseUrl, role] of [
      [other, "postgres"],
      [pooled, "cms_owner"],
      [pooled.replace("?sslmode=require", ""), "postgres"],
      [`${pooled}&host=evil.example`, "postgres"],
      ["not a url", "postgres"],
      ["mysql://x@db.abcdefghijklmnopqrst.supabase.co/x", "postgres"],
    ]) {
      expect(() =>
        assertDatabaseTarget({ databaseUrl, projectRef: ref, role }),
      ).toThrow();
    }
  });

  it("never echoes the connection string in an error", () => {
    try {
      assertDatabaseTarget({
        databaseUrl: pooled.replace(ref, "zzzzzzzzzzzzzzzzzzzz"),
        projectRef: ref,
        role: "postgres",
      });
      throw new Error("expected a refusal");
    } catch (error) {
      expect(String(error)).not.toContain("pw@");
      expect(String(error)).not.toContain("pooler.supabase.com");
    }
  });

  it("refuses a project the environment must never touch", () => {
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: pooled,
        projectRef: ref,
        role: "postgres",
        forbiddenRefs: [ref],
      }),
    ).toThrow(/must not/);
  });

  it("allows a loopback database only when asked, for tests", () => {
    const local = "postgresql://postgres:postgres@127.0.0.1:57432/wp13r_x";
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: local,
        projectRef: ref,
        role: "postgres",
      }),
    ).toThrow();
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: local,
        projectRef: ref,
        role: "postgres",
        allowLoopback: true,
      }),
    ).not.toThrow();
  });

  it("knows the development and production-named projects by ref", () => {
    expect(KNOWN_PROJECT_REFS).toEqual({
      development: "pnmlrbgjiqzzsthsoikm",
      productionNamed: "btewedpsxwsjczvmegby",
    });
  });
});
