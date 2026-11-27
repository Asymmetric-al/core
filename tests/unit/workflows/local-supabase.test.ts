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
const at = (marker: string) => {
  const offset = workflow.indexOf(marker);
  expect(offset, `the workflow names ${marker}`).toBeGreaterThanOrEqual(0);
  return offset;
};

describe("Local Supabase Stack workflow: the replay matches the platform's image", () => {
  it("runs CRM data journeys in the real Auth job", () => {
    const config = readFileSync("playwright.auth-mail.config.ts", "utf8");
    expect(config).toContain('"**/auth-crm-reads.spec.ts"');
    expect(workflow).toContain("- tests/e2e/auth-crm-reads.spec.ts");
    expect(step("Run the auth email round trips")).toContain(
      "bun run test:e2e:auth-mail",
    );
  });
  it("runs the guest giving journeys with the switch on after the auth round trips, and gives them no Stripe key (AL-2681)", () => {
    const command = "bun run test:e2e:guest-giving";
    const run = step(command);
    expect(run).toBeDefined();
    expect(run).toContain("steps.chromium.outcome == 'success'");
    expect(run).not.toMatch(/STRIPE_SECRET_KEY|GIVING_STRIPE_TEST_PROOF/);
    expect(at(command)).toBeGreaterThan(at("bun run test:e2e:auth-mail"));
    for (const path of [
      "playwright.guest-giving.config.ts",
      "tests/e2e/guest-giving.spec.ts",
      "tests/e2e/helpers/guest-giving.ts",
      "scripts/e2e/run-guest-giving.mjs",
      "apps/donor/app/(public)/(solid)/checkout/**",
      "apps/donor/lib/route-policy.ts",
      "packages/api/src/donate/**",
    ])
      expect(workflow).toContain(`- ${path}`);
    expect(workflow).toContain("test-results/guest-giving/");
    expect(readFileSync("playwright.guest-giving.config.ts", "utf8")).toContain(
      'testMatch: ["**/guest-giving.spec.ts"]',
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
      /services:\n\s+postgres:\n\s+image: ghcr\.io\/asymmetric-al\/core-ci-postgres:17\.11-alpine@sha256:[0-9a-f]{64}\n\s+credentials:\n\s+username: \$\{\{ github\.actor \}\}\n\s+password: \$\{\{ github\.token \}\}/,
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

  it("requires the Sites and claimed-name PostgREST proof after fingerprinting", () => {
    const suite =
      "tests/unit/acceptance/issue-2676/sites.postgrest.acceptance.test.ts";
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

  it("requires the identity-key proof through PostgREST after fingerprinting (AL-2678)", () => {
    const suite =
      "tests/unit/acceptance/issue-2678/identity-keys.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP5_IDENTITY_IT_URL",
      "WP5_IDENTITY_IT_DATABASE_URL",
      "WP5_IDENTITY_IT_SERVICE_KEY",
      "WP5_IDENTITY_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(run).toContain("supabase -- status -o json");
    expect(at(marker)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    expect(workflow).toContain(`      - ${suite}\n`);
    for (const reader of [
      "packages/api/src/donor-portal/**",
      "packages/api/src/posts/**",
      "packages/api/src/donations/**",
      "packages/graphql/**",
      "packages/database/hooks/donor-feed-posts.ts",
      "packages/api/src/admin/contribution-operations/**",
    ])
      expect(workflow).toContain(`      - ${reader}\n`);
  });

  it("requires the worker-name proof through PostgREST after fingerprinting, with the identity-key suite's fixture (AL-2678 r2a)", () => {
    const suite =
      "tests/unit/acceptance/issue-2678/worker-names.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP5_IDENTITY_IT_URL",
      "WP5_IDENTITY_IT_DATABASE_URL",
      "WP5_IDENTITY_IT_SERVICE_KEY",
      "WP5_IDENTITY_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(run).toContain("supabase -- status -o json");
    expect(
      run!.split("\n").map((line) => line.trim()),
      "the Vitest run is a command of its own, so its exit status fails the step",
    ).toContain(marker);
    expect(run).not.toMatch(/\|\||;\s*true\b|\bset \+e\b|continue-on-error/);
    expect(at(marker)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    for (const file of [
      suite,
      "tests/unit/acceptance/issue-2678/identity-keys.postgrest-fixture.ts",
    ])
      expect(workflow).toContain(`      - ${file}\n`);
  });

  it("requires the supporter-name proof through PostgREST after fingerprinting, started by every reader it drives (AL-2678 r2s)", () => {
    const suite =
      "tests/unit/acceptance/issue-2678/supporter-names.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP5_IDENTITY_IT_URL",
      "WP5_IDENTITY_IT_DATABASE_URL",
      "WP5_IDENTITY_IT_SERVICE_KEY",
      "WP5_IDENTITY_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(run).toContain("supabase -- status -o json");
    expect(
      run!.split("\n").map((line) => line.trim()),
      "the Vitest run is a command of its own, so its exit status fails the step",
    ).toContain(marker);
    expect(run).not.toMatch(/\|\||;\s*true\b|\bset \+e\b|continue-on-error/);
    expect(at(marker)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    for (const file of [
      suite,
      "packages/api/src/missionary-portal/**",
      "packages/api/src/follower-requests/**",
      "packages/api/src/missionaries/**",
      "packages/api/src/donations/**",
      "packages/graphql/**",
    ])
      expect(workflow).toContain(`      - ${file}\n`);
  });

  it("requires the assignment-key proof through PostgREST after fingerprinting, started by the CRM readers and response types it drives (AL-2678 r3)", () => {
    const suite =
      "tests/unit/acceptance/issue-2678/assignment-keys.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP5_IDENTITY_IT_URL",
      "WP5_IDENTITY_IT_DATABASE_URL",
      "WP5_IDENTITY_IT_SERVICE_KEY",
      "WP5_IDENTITY_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(run).toContain("supabase -- status -o json");
    expect(
      run!.split("\n").map((line) => line.trim()),
      "the Vitest run is a command of its own, so its exit status fails the step",
    ).toContain(marker);
    expect(run).not.toMatch(/\|\||;\s*true\b|\bset \+e\b|continue-on-error/);
    expect(at(marker)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    for (const file of [
      suite,
      "tests/unit/acceptance/issue-2678/assignment-keys.realstack.acceptance.test.ts",
      "packages/api/src/admin/crm/**",
      "packages/database/types/crm-detail.ts",
      "packages/database/types/crm-grid.ts",
    ])
      expect(workflow).toContain(`      - ${file}\n`);
  });

  it("requires the worker-record proof through PostgREST after the supporter-name proof, started by its suite, the module and routes it drives and the screens and journey over them (AL-2678 r2b1)", () => {
    const suite =
      "tests/unit/acceptance/issue-2678/worker-record.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step("Verify the worker record through PostgREST");
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP5_IDENTITY_IT_URL",
      "WP5_IDENTITY_IT_DATABASE_URL",
      "WP5_IDENTITY_IT_SERVICE_KEY",
      "WP5_IDENTITY_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(run).toContain("supabase -- status -o json");
    expect(
      run!.split("\n").map((line) => line.trim()),
      "the Vitest run is a command of its own, so its exit status fails the step",
    ).toContain(marker);
    expect(run).not.toMatch(/\|\||;\s*true\b|\bset \+e\b|continue-on-error/);
    expect(at(marker)).toBeGreaterThan(
      at(
        "bunx vitest run --maxWorkers=1 tests/unit/acceptance/issue-2678/supporter-names.postgrest.acceptance.test.ts",
      ),
    );
    for (const file of [
      suite,
      "packages/api/src/admin/workers/**",
      "apps/admin/app/api/admin/workers/**",
      "apps/admin/app/(app)/workers/**",
      "apps/admin/features/mission-control/workers/**",
      "tests/e2e/auth-worker-record.spec.ts",
    ])
      expect(workflow).toContain(`      - ${file}\n`);
    const config = readFileSync("playwright.auth-mail.config.ts", "utf8");
    expect(config).toContain('"**/auth-worker-record.spec.ts"');
  });

  it("runs the Add Partner journey through both of the Partners page's buttons with the auth round trips, started by the journey, the dialog, the command's route and the page (AL-2678 WP5 rest)", () => {
    const config = readFileSync("playwright.auth-mail.config.ts", "utf8");
    expect(config).toContain('"**/auth-add-partner.spec.ts"');
    for (const file of [
      "tests/e2e/auth-add-partner.spec.ts",
      "packages/missionary/components/add-partner-*",
      "packages/api/src/missionary-portal/**",
      "apps/missionary/app/donors/**",
      "apps/missionary/app/api/missionary/donors/**",
    ])
      expect(workflow).toContain(`      - ${file}\n`);
  });

  it("requires the own-donor proof through PostgREST after the worker-record proof, started by its suite and the readers it drives (AL-2678 WP5 rest)", () => {
    const suite =
      "tests/unit/acceptance/issue-2678/own-donor-reads.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(
      "Verify a signed-in person's own donor through account link and Party",
    );
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP5_IDENTITY_IT_URL",
      "WP5_IDENTITY_IT_DATABASE_URL",
      "WP5_IDENTITY_IT_SERVICE_KEY",
      "WP5_IDENTITY_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(run).toContain("supabase -- status -o json");
    expect(
      run!.split("\n").map((line) => line.trim()),
      "the Vitest run is a command of its own, so its exit status fails the step",
    ).toContain(marker);
    expect(run).not.toMatch(/\|\||;\s*true\b|\bset \+e\b|continue-on-error/);
    expect(at(marker)).toBeGreaterThan(
      at(
        "bunx vitest run --maxWorkers=1 tests/unit/acceptance/issue-2678/worker-record.postgrest.acceptance.test.ts",
      ),
    );
    for (const file of [
      suite,
      "packages/api/src/donor-portal/**",
      "packages/api/src/donations/**",
      "packages/api/src/feed-preferences/**",
      "packages/api/src/reads/**",
      "packages/api/src/shared/queries.ts",
      "packages/graphql/**",
      "packages/lib/hooks/use-donor-record.ts",
    ])
      expect(workflow).toContain(`      - ${file}\n`);
  });

  it("requires the paged-CRM proof through PostgREST after the own-donor proof, started by its suite and the CRM module it drives (AL-2678 WP5 rest r6)", () => {
    const suite =
      "tests/unit/acceptance/issue-2678/crm-pages.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(
      "Verify the CRM's notes and relationships page exactly through PostgREST",
    );
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP5_IDENTITY_IT_URL",
      "WP5_IDENTITY_IT_DATABASE_URL",
      "WP5_IDENTITY_IT_SERVICE_KEY",
      "WP5_IDENTITY_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(
      run!.split("\n").map((line) => line.trim()),
      "the Vitest run is a command of its own, so its exit status fails the step",
    ).toContain(marker);
    expect(run).not.toMatch(/\|\||;\s*true\b|\bset \+e\b|continue-on-error/);
    expect(at(marker)).toBeGreaterThan(
      at(
        "bunx vitest run --maxWorkers=1 tests/unit/acceptance/issue-2678/own-donor-reads.postgrest.acceptance.test.ts",
      ),
    );
    for (const file of [suite, "packages/api/src/admin/crm/**"])
      expect(workflow).toContain(`      - ${file}\n`);
  });

  it("requires the added partner's visibility through PostgREST after the paged-CRM proof, started by its suite and the module it drives (AL-2678 WP5 rest, fix round F7)", () => {
    const suite =
      "tests/unit/acceptance/issue-2678/added-partner-visibility.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(
      "Verify that a partner added by hand is named to its missionary alone through PostgREST",
    );
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP5_IDENTITY_IT_URL",
      "WP5_IDENTITY_IT_DATABASE_URL",
      "WP5_IDENTITY_IT_SERVICE_KEY",
      "WP5_IDENTITY_IT_ANON_KEY",
    ])
      expect(run).toContain(variable);
    expect(
      run!.split("\n").map((line) => line.trim()),
      "the Vitest run is a command of its own, so its exit status fails the step",
    ).toContain(marker);
    expect(run).not.toMatch(/\|\||;\s*true\b|\bset \+e\b|continue-on-error/);
    expect(at(marker)).toBeGreaterThan(
      at(
        "bunx vitest run --maxWorkers=1 tests/unit/acceptance/issue-2678/crm-pages.postgrest.acceptance.test.ts",
      ),
    );
    for (const file of [suite, "packages/api/src/missionary-portal/**"])
      expect(workflow).toContain(`      - ${file}\n`);
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

  it("runs Member Care journeys in the real Auth job (D-18: WP4b part 1)", () => {
    const config = readFileSync("playwright.auth-mail.config.ts", "utf8");
    expect(config).toContain('"**/auth-member-care.spec.ts"');
    expect(workflow).toContain("- tests/e2e/auth-member-care.spec.ts");
    expect(step("Run the auth email round trips")).toContain(
      "bun run test:e2e:auth-mail",
    );
  });

  it("requires the Member Care caller-token suite on the seeded stack after fingerprinting (D-18: WP4b part 1)", () => {
    const suite =
      "tests/unit/acceptance/issue-2677/member-care.postgrest.acceptance.test.ts";
    const command = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(
      "Verify Member Care handlers and R11 projections through PostgREST",
    );
    expect(run).toBeDefined();
    expect(run).toContain('MEMBER_CARE_IT_REQUIRED: "1"');
    expect(run).toContain(
      "MEMBER_CARE_IT_SUPABASE_URL: http://127.0.0.1:54321",
    );
    expect(run).toContain(
      "MEMBER_CARE_IT_ADMIN_DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    );
    expect(run).toContain("jq -er '.ANON_KEY | select(length > 0)'");
    expect(run).toContain("jq -er '.SERVICE_ROLE_KEY | select(length > 0)'");
    expect(run).toContain(command);
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    expect(at(command)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    for (const path of [
      "packages/api/src/reads/member-care.ts",
      "packages/api/src/admin/member-care/**",
      "apps/admin/app/api/admin/member-care/**",
      "apps/admin/app/(app)/care/**",
      "apps/admin/features/mission-control/care/**",
      suite,
      "tests/e2e/auth-member-care.spec.ts",
    ]) {
      expect(workflow).toContain(`      - ${path}\n`);
    }
  });

  it("requires the demonstration care person suite on the seeded stack after fingerprinting (D-18: WP4b part 1b)", () => {
    const suite =
      "tests/unit/acceptance/issue-2677/demo-care-person.postgrest.acceptance.test.ts";
    const command = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(
      "Verify the demonstration Member Care person through PostgREST",
    );
    expect(run).toBeDefined();
    expect(run).toContain('DEMO_CARE_IT_REQUIRED: "1"');
    expect(run).toContain("DEMO_CARE_IT_SUPABASE_URL: http://127.0.0.1:54321");
    expect(run).toContain(
      "DEMO_CARE_IT_ADMIN_DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    );
    expect(run).toContain("jq -er '.ANON_KEY | select(length > 0)'");
    expect(run).toContain("jq -er '.SERVICE_ROLE_KEY | select(length > 0)'");
    expect(run).toContain(command);
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    expect(at(command)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    expect(at(command)).toBeLessThan(at("bun run test:e2e:auth-mail"));
    for (const path of [suite, "supabase/seed.sql", "supabase/migrations/**"]) {
      expect(workflow).toContain(`      - ${path}\n`);
    }
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

  it("D-18 (AL-2676 WP3a part 2a adds provisioning's own second-factor proof): proves provisioning's second factor after the operator admin invitation proof", () => {
    const suite =
      "tests/unit/acceptance/issue-2676/tenant-provisioning.localstack.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).toContain('OPERATOR_MFA_REQUIRED: "1"');
    expect(run).toContain("!cancelled() && steps.stack.outcome == 'success'");
    expect(run).not.toMatch(/continue-on-error/);
    expect(at(marker)).toBeGreaterThan(
      at(
        "bunx vitest run --maxWorkers=1 tests/unit/acceptance/issue-2676/operator-admin-invite.localstack.test.ts",
      ),
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

  it("runs the WP8a part 1 real-stack suite on the seeded stack after fingerprinting (finding 17)", () => {
    const suite =
      "tests/unit/acceptance/issue-2681/wp8a-part1.realstack.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    expect(run).toContain(
      "TENANT_GUARD_IT_ADMIN_DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    );
    expect(at(marker)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    expect(at(marker)).toBeLessThan(at("name: Install Playwright Chromium"));
    expect(workflow).toContain(`      - ${suite}\n`);
    expect(workflow).not.toContain("supabase/seed-expectations.json");
  });

  it("verifies media custody, Storage refusal and signed-in delivery on the local stack after fingerprinting (AL-2679, D-18)", () => {
    const suite =
      "tests/unit/acceptance/issue-2679/media-storage.postgrest.acceptance.test.ts";
    const marker = "bunx vitest run --maxWorkers=1 " + suite;
    const run = step(marker);
    expect(run).toBeDefined();
    expect(run).not.toMatch(/continue-on-error|^\s*if:/m);
    for (const variable of [
      "WP6_MEDIA_IT_URL",
      "WP6_MEDIA_IT_DATABASE_URL",
      "WP6_MEDIA_IT_ANON_KEY",
      "WP6_MEDIA_IT_SERVICE_KEY",
    ]) {
      expect(run).toContain(variable);
    }
    expect(run).toContain("supabase -- status -o json");
    expect(at(marker)).toBeGreaterThan(at("schema-fingerprint.mjs compare"));
    for (const path of [
      "packages/api/src/storage/**",
      "packages/api/src/media/**",
      "packages/api/src/cms/media/**",
      "apps/*/app/api/media/**",
      "apps/admin/app/api/cms/media/**",
      suite,
    ]) {
      expect(workflow).toContain(`      - ${path}\n`);
    }
  });
});
