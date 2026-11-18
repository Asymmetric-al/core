// The Local Supabase Stack workflow runs the chain on Supabase's own image.
// WP1.6 adds a drift guard to it: the release job's replay applies hosted
// Supabase's default privileges from scripts/sql/hosted-default-privileges.sql,
// and a replay made that way must fingerprint exactly as the stack does. On
// 18 November 2026 the image (17.11.0.004) and the hosted preview project
// carried the same default privileges, and the stack's fingerprint equalled
// such a replay's (docs/audits/core-crm-cms-database-proofs/
// wp16-hosted-proofs.md). A change of the platform's defaults then fails this
// job instead of a release.
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/local-supabase.yml", "utf8");
const steps = workflow.split("\n      - ");
const step = (marker: string) => steps.find((s) => s.includes(marker));
const at = (marker: string) => workflow.indexOf(marker);

describe("Local Supabase Stack workflow: the replay matches the platform's image", () => {
  it("replays the chain on plain Postgres with the hosted defaults, as the release job does", () => {
    expect(workflow).toMatch(
      /services:\n\s+postgres:\n\s+image: public\.ecr\.aws\/docker\/library\/postgres:17\.11-alpine@sha256:[0-9a-f]{64}/,
    );
    const replay = step("node scripts/verify/supabase-migrations.mjs");
    expect(replay).toContain(
      "run: node scripts/verify/supabase-migrations.mjs --hosted-defaults",
    );
    expect(replay).toContain("DATABASE_URL: ${{ env.REPLAY_DATABASE_URL }}");
  });

  it("fails the job when the replay's fingerprint differs from the stack's", () => {
    const compare = step("schema-fingerprint.mjs compare");
    expect(compare).toBeDefined();
    expect(compare).toContain("--database-url-env REPLAY_DATABASE_URL");
    expect(compare).toContain("--database-url-env STACK_DATABASE_URL");
    expect(compare).toContain(
      "STACK_DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    );
  });

  it("compares after the stack has applied the chain and before the round trips write to it", () => {
    const start = at("name: Start the local Supabase stack");
    const replay = at("supabase-migrations.mjs --hosted-defaults");
    const compare = at("schema-fingerprint.mjs compare");
    const roundTrips = at("name: Run the auth email round trips");
    expect(start).toBeGreaterThan(0);
    expect(start).toBeLessThan(replay);
    expect(replay).toBeLessThan(compare);
    expect(compare).toBeLessThan(roundTrips);
  });

  it("runs when the defaults, the replay or the fingerprint change", () => {
    for (const path of [
      "scripts/sql/hosted-default-privileges.sql",
      "scripts/verify/supabase-migrations.mjs",
      "scripts/release/schema-fingerprint.mjs",
    ]) {
      expect(workflow).toContain(`      - ${path}\n`);
    }
  });
});
