// The Local Supabase Stack workflow runs the chain on Supabase's own image.
// WP1.6 adds a drift guard to it: the release job's replay applies hosted
// Supabase's default privileges from scripts/sql/hosted-default-privileges.sql,
// and a replay made that way must fingerprint exactly as the stack does. On
// 18 November 2026 the image (17.11.0.004) and the hosted preview project
// carried the same default privileges, and the stack's fingerprint equalled
// such a replay's (docs/audits/core-crm-cms-database-proofs/
// wp16-hosted-proofs.md). This job runs only when a listed path changes, and
// it compares with the image the pinned CLI starts, not with hosted; a change
// of the defaults on hosted is caught by the release's gates.
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/local-supabase.yml", "utf8");
const steps = workflow.split("\n      - ");
const step = (marker: string) => steps.find((s) => s.includes(marker));
const at = (marker: string) => workflow.indexOf(marker);

describe("Local Supabase Stack workflow: the replay matches the platform's image", () => {
  it("runs CRM data journeys in the real Auth job", () => {
    const config = readFileSync("playwright.auth-mail.config.ts", "utf8");
    expect(config).toContain('"**/auth-crm-reads.spec.ts"');
    expect(workflow).toContain("- tests/e2e/auth-crm-reads.spec.ts");
    expect(step("Run the auth email round trips")).toContain(
      "bun run test:e2e:auth-mail",
    );
  });
  it("requires the CRM caller-token suite on the seeded stack", () => {
    const run = step("Verify CRM reads through scoped PostgREST sessions");
    expect(run).toContain('CRM_READ_IT_REQUIRED: "1"');
    expect(run).toContain("CRM_READ_IT_SUPABASE_URL: http://127.0.0.1:54321");
    expect(run).toContain(
      "CRM_READ_IT_ADMIN_DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    );
    expect(run).toContain("jq -er '.ANON_KEY'");
    expect(run).toContain(
      "bunx vitest run --maxWorkers=1 tests/unit/acceptance/issue-2677/crm-reads.postgrest.acceptance.test.ts",
    );
    expect(run).toContain(
      "tests/unit/acceptance/issue-2677/crm-directory.realstack.acceptance.test.ts",
    );
    expect(run).not.toMatch(/^\s*(?:if|continue-on-error):/m);
  });
  it("requires the governed projection round trip after fingerprinting", () => {
    const command =
      "bunx vitest run --maxWorkers=1 tests/unit/acceptance/issue-2677/field-policy-reader.postgrest.acceptance.test.ts";
    const run = step(command);
    expect(run).toContain('FIELD_POLICY_IT_REQUIRED: "1"');
    expect(run).toContain(
      "FIELD_POLICY_IT_SUPABASE_URL: http://127.0.0.1:54321",
    );
    expect(run).toContain("export FIELD_POLICY_IT_ANON_KEY");
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    expect(at(command)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
  });
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

  // Review H8: nothing may skip the comparison or excuse its failure.
  it("gives the comparison step no condition and no continue-on-error, and the job no continue-on-error", () => {
    const compare = step("schema-fingerprint.mjs compare")!;
    expect(compare).not.toMatch(/^\s*if:/m);
    expect(compare).not.toMatch(/continue-on-error/);
    const job = workflow.slice(
      workflow.indexOf("\n  local-supabase:\n"),
      workflow.indexOf("\n    steps:\n"),
    );
    expect(job).toContain("runs-on:");
    expect(job).not.toMatch(/continue-on-error/);
  });

  it("compares after the stack has applied the chain and before the round trips write to it", () => {
    const start = at("name: Start the local Supabase stack");
    const replay = at("supabase-migrations.mjs --hosted-defaults");
    const compare = at("schema-fingerprint.mjs compare");
    const roundTrips = at("name: Run the auth email round trips");
    expect(start).toBeGreaterThan(0);
    const client = at("run: bash scripts/github/install-postgresql-client.sh");
    expect(start).toBeLessThan(client);
    expect(client).toBeLessThan(replay);
    expect(replay).toBeLessThan(compare);
    expect(compare).toBeLessThan(roundTrips);
    expect(roundTrips).toBeLessThan(
      at("run: node scripts/e2e/run-operator-mfa.mjs"),
    );
  });

  it("runs both proofs independently once their own prerequisites pass", () => {
    expect(step("name: Start the local Supabase stack")).toContain("id: stack");
    expect(step("name: Install Playwright Chromium")).toContain("id: chromium");
    expect(step("name: Run the auth email round trips")).toContain(
      "!cancelled() && steps.stack.outcome == 'success' && steps.chromium.outcome == 'success'",
    );
    expect(step("name: Prove the platform operators")).toContain(
      "!cancelled() && steps.stack.outcome == 'success'",
    );
    for (const path of [
      "packages/api/src/shared/request-session-client.ts",
      "scripts/lib/psql.mjs",
      "scripts/release/lib/database-target.mjs",
      "packages/env/src/database-url.mjs",
    ]) {
      expect(workflow).toContain(`      - ${path}\n`);
    }
  });

  it("requires the signed-in tenant-record proof on the local stack after fingerprinting", () => {
    const suite =
      "tests/unit/acceptance/issue-2676/tenant-records.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP3_TENANT_IT_URL",
      "WP3_TENANT_IT_DATABASE_URL",
      "WP3_TENANT_IT_SERVICE_KEY",
      "WP3_TENANT_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(run).toContain("supabase -- status -o json");
    expect(at(marker)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    expect(workflow).toContain(`      - ${suite}\n`);
  });

  it("exercises the missionary handlers against the stack after fingerprinting", () => {
    const suite =
      "tests/unit/acceptance/issue-2675/missionary-handler-authority.postgrest.acceptance.test.ts";
    const run = step("bunx vitest run --maxWorkers=1 " + suite);
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    expect(run).toContain("MISSIONARY_IT_SUPABASE_URL: http://127.0.0.1:54321");
    expect(run).toContain(
      "MISSIONARY_IT_ADMIN_DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    );
    expect(run).toContain("export MISSIONARY_IT_SERVICE_ROLE_KEY");
    expect(run).toContain("supabase -- status -o json");
    expect(at("schema-fingerprint.mjs compare")).toBeLessThan(
      at("bunx vitest run --maxWorkers=1 " + suite),
    );
    for (const path of [
      "packages/api/src/missionary-portal/**",
      "packages/api/src/follower-requests/**",
      "packages/api/src/missionaries/**",
      "packages/api/src/profile/**",
      "packages/api/src/shared/api-http-error.ts",
      "packages/api/src/shared/http-errors.ts",
      "packages/api/src/shared/missionary-authority.ts",
      "packages/api/src/shared/queries.ts",
      "packages/api/src/shared/route-uuid.ts",
      "packages/api/src/shared/tenant-members.ts",
      "packages/api/src/shared/with-operation.ts",
      "packages/database/supabase/admin.ts",
      "packages/database/supabase/config.ts",
      "tests/fixtures/auth-memberships.ts",
      "tests/fixtures/missionary-task-patch.ts",
      "vitest.config.mts",
      "vitest.per-importer-alias.mts",
      "vitest.pin-workspace-packages.mts",
      "tests/unit/acceptance/issue-2675/missionary-handler-authority.postgrest.acceptance.test.ts",
      "tests/unit/workflows/local-supabase.test.ts",
    ])
      expect(workflow).toContain(`      - ${path}\n`);
    for (const glob of ["packages/api/src/shared/**", "packages/database/**"])
      expect(workflow).not.toContain(`      - ${glob}\n`);
  });

  it("requires the WP3c invitations PostgREST proof after fingerprinting", () => {
    const suite =
      "tests/unit/acceptance/issue-2676/membership-invitations.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP3_TENANT_IT_URL",
      "WP3_TENANT_IT_DATABASE_URL",
      "WP3_TENANT_IT_SERVICE_KEY",
      "WP3_TENANT_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(at(marker)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    expect(workflow).toContain(`      - ${suite}\n`);
  });

  it("proves operator admin invitation second factor after the stack starts", () => {
    const suite =
      "tests/unit/acceptance/issue-2676/operator-admin-invite.localstack.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).toContain('OPERATOR_MFA_REQUIRED: "1"');
    expect(run).toContain("!cancelled() && steps.stack.outcome == 'success'");
    expect(at(marker)).toBeGreaterThan(
      at("run: node scripts/e2e/run-operator-mfa.mjs"),
    );
    expect(workflow).toContain(`      - ${suite}\n`);
  });

  it("runs when the defaults, the replay or the fingerprint change", () => {
    for (const path of [
      "scripts/sql/hosted-default-privileges.sql",
      "scripts/verify/supabase-migrations.mjs",
      "scripts/verify/tenant-rls-catalog.mjs",
      "docs/security/*.json",
      "scripts/release/schema-fingerprint.mjs",
    ]) {
      expect(workflow).toContain(`      - ${path}\n`);
    }
  });
});
