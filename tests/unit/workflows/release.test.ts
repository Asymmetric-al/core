import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/release.yml", "utf8");
const job = (name: string) =>
  workflow.split(`\n  ${name}:\n`)[1]!.split(/\n  [a-z-]+:\n/)[0]!;
const before = (text: string, first: string, second: string) =>
  text.indexOf(first) > 0 && text.indexOf(first) < text.indexOf(second);

describe("release workflow (plan 7.4)", () => {
  it("starts on a push to the production branch and on dispatch only", () => {
    expect(workflow).toMatch(
      /on:\n  push:\n    branches: \[production\]\n  workflow_dispatch:/,
    );
    expect(workflow).not.toContain("pull_request");
    expect(workflow).toContain("permissions:\n  contents: read");
  });

  it("never cancels a release, and shares the preview database's group for preview operations", () => {
    expect(workflow).toContain(
      "group: ${{ inputs.environment == 'preview' && 'preview-database' || 'release-production' }}",
    );
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).not.toContain("cancel-in-progress: true");
  });

  // Council round 2, A6e: by default a newer pending run replaces the one
  // waiting before it. The preview job's group queues, so this one does too.
  it("queues waiting runs in the workflow's group, as the preview-database job does in the same group", () => {
    expect(workflow).toContain(
      "concurrency:\n  group: ${{ inputs.environment == 'preview' && 'preview-database' || 'release-production' }}\n  cancel-in-progress: false\n  queue: max\n",
    );
    const preview = readFileSync(
      ".github/workflows/qa-smoke-preview-deploy.yml",
      "utf8",
    );
    expect(preview).toContain(
      "    concurrency:\n      group: preview-database\n      cancel-in-progress: false\n      queue: max\n",
    );
  });

  // Council round 2, A6c (plan 7.5: the marker changes on the owner's
  // approval): an environment with a required reviewer gates the marker
  // change and the first rebuild, and holds no secret.
  it("runs the marker change and the first rebuild only after the owner's approval", () => {
    const approval = job("owner-approval");
    expect(approval).toContain("environment: release-owner-approval");
    expect(approval).toContain("inputs.operation == 'set-environment-marker'");
    expect(approval).toContain("inputs.operation == 'first-rebuild'");
    expect(approval).not.toContain("inputs.operation == 'release'");
    expect(approval).not.toContain("secrets.");
    expect(job("marker")).toContain("needs: owner-approval");
    // The marker job has no status function, so it runs only on success.
    expect(job("marker")).not.toMatch(/always\(\)|!cancelled\(\)/);
    const database = job("database");
    expect(database).toContain("needs: owner-approval");
    expect(database).toMatch(
      /inputs\.operation == 'first-rebuild' &&\s+needs\.owner-approval\.result == 'success'/,
    );
    // The deploy job follows a successful database job even though the
    // approval job before it was skipped.
    expect(job("deploy")).toMatch(
      /!cancelled\(\) &&\s+needs\.database\.result == 'success'/,
    );
  });

  // Council round 3, lens 2 I1: "Re-run failed jobs" or a re-run of one job
  // starts the database or marker job again and keeps owner-approval's earlier
  // success. The approval names the run attempt it was given for, and the
  // destructive jobs run only in that attempt, so a re-run asks again.
  it("takes the owner's approval for one run attempt only", () => {
    const approval = job("owner-approval");
    expect(approval).toMatch(
      /outputs:\n\s+attempt: \$\{\{ steps\.approve\.outputs\.attempt \}\}/,
    );
    expect(approval).toMatch(/- name: Record the approval\n\s+id: approve\n/);
    expect(approval).toContain("ATTEMPT: ${{ github.run_attempt }}");
    expect(approval).toContain('echo "attempt=${ATTEMPT}" >> "$GITHUB_OUTPUT"');
    const sameAttempt =
      "needs.owner-approval.result == 'success' &&\\s+needs.owner-approval.outputs.attempt == github.run_attempt";
    expect(job("database")).toMatch(
      new RegExp(
        `\\(inputs\\.operation == 'first-rebuild' &&\\s+${sameAttempt.replaceAll(".", "\\.")}\\)`,
      ),
    );
    expect(job("marker")).toMatch(
      new RegExp(
        `inputs\\.operation == 'set-environment-marker' &&\\s+${sameAttempt.replaceAll(".", "\\.")}`,
      ),
    );
  });

  // Council round 2, A5 and A6a.
  it("hands the steps that need them the seeded-login password and the project's CA, and no other step", () => {
    const steps = job("database").split("\n      - ");
    const step = (name: string) => steps.find((s) => s.includes(name))!;
    const rebuild = step("release-database.mjs first-rebuild");
    expect(rebuild).toContain(
      "RELEASE_SEED_LOGIN_PASSWORD: ${{ secrets.RELEASE_SEED_LOGIN_PASSWORD }}",
    );
    expect(rebuild).toContain(
      "RELEASE_DATABASE_SSL_CA: ${{ secrets.RELEASE_DATABASE_SSL_CA }}",
    );
    expect(step("release-database.mjs migrate")).toContain(
      "RELEASE_DATABASE_SSL_CA: ${{ secrets.RELEASE_DATABASE_SSL_CA }}",
    );
    // Amended by council round 3 (lens 2 I2; record D-18): the seed password
    // has a second holder, the repair operation below. Each holder is named,
    // so no other step can gain it unseen.
    expect(workflow.split("RELEASE_SEED_LOGIN_PASSWORD: ${{").length - 1).toBe(
      2,
    );
    expect(job("seeded-login-passwords")).toContain(
      "RELEASE_SEED_LOGIN_PASSWORD: ${{ secrets.RELEASE_SEED_LOGIN_PASSWORD }}",
    );
  });

  // Council round 3, lens 2 I2: a rebuild that stopped between its seed and
  // the replacement leaves the published password live, and every release
  // then stops at preflight. The repair is an operation the job offers.
  it("offers the repair of seeded logins that keep a published password, from the production branch, with the secrets it needs only", () => {
    expect(workflow).toMatch(
      /options:\n(\s+- [a-z-]+\n)*\s+- replace-seeded-login-passwords\n/,
    );
    const repair = job("seeded-login-passwords");
    expect(repair).toContain(
      "if: github.event_name == 'workflow_dispatch' && inputs.operation == 'replace-seeded-login-passwords'",
    );
    expect(repair).toContain("if: github.ref != 'refs/heads/production'");
    expect(repair).toContain(
      "run: node scripts/release/release-database.mjs replace-seeded-login-passwords",
    );
    expect(repair.match(/secrets\.[A-Z_]+/g)?.sort()).toEqual([
      "secrets.RELEASE_DATABASE_URL",
      "secrets.RELEASE_SEED_LOGIN_PASSWORD",
    ]);
    expect(repair).toContain(
      "environment: ${{ inputs.environment == 'preview' && 'release-preview' || 'release-production' }}",
    );
  });

  it("migrates, gates and records heads before any deployment, in that order", () => {
    const database = job("database");
    expect(
      before(
        database,
        "release-database.mjs migrate",
        "release-database.mjs gates",
      ),
    ).toBe(true);
    expect(
      before(
        database,
        "release-database.mjs gates",
        "release-database.mjs record-heads",
      ),
    ).toBe(true);
    expect(
      before(
        database,
        "schema-fingerprint.mjs capture",
        "release-database.mjs gates",
      ),
    ).toBe(true);
    expect(database).toContain("RELEASE_REPLAY_FINGERPRINT");
    const deploy = job("deploy");
    expect(deploy).toContain("needs: database");
    expect(deploy).toContain("needs.database.result == 'success'");
    expect(
      before(
        deploy,
        "vercel-release.mjs preflight",
        "vercel-release.mjs deploy",
      ),
    ).toBe(true);
    expect(deploy).toContain("environment: release-production");
  });

  // WP1.6 (record D-18): the first hosted run stopped at the fingerprint,
  // because hosted Supabase gives `postgres` default privileges in `public`
  // that a plain replay lacks. The replay applies them first, from the one
  // file the privileges harness reads too.
  it("replays the chain with hosted Supabase's default privileges before it fingerprints the replay", () => {
    const database = job("database");
    const replay = database
      .split("\n      - ")
      .find((step) => step.includes("Replay every migration"))!;
    expect(replay).toContain(
      "run: node scripts/verify/supabase-migrations.mjs --hosted-defaults",
    );
    expect(
      before(
        database,
        "supabase-migrations.mjs --hosted-defaults",
        "schema-fingerprint.mjs capture",
      ),
    ).toBe(true);
    expect(workflow.match(/supabase-migrations\.mjs/g)).toHaveLength(1);
  });

  it("deploys only through the API stage-check-promote step, never a CLI production deploy", () => {
    expect(workflow).not.toMatch(/vercel(\s+deploy)?\s+--prod/);
    expect(workflow).not.toContain("vercel promote");
    expect(workflow).not.toContain("db-migrate-hosted");
  });

  it("is the only workflow that holds migration credentials", () => {
    const holders = readdirSync(".github/workflows")
      .filter((file) => /\.ya?ml$/.test(file))
      .filter((file) =>
        readFileSync(`.github/workflows/${file}`, "utf8").includes(
          "secrets.RELEASE_DATABASE_URL",
        ),
      );
    expect(holders.sort()).toEqual([
      "qa-smoke-preview-deploy.yml",
      "release.yml",
    ]);
    const preview = readFileSync(
      ".github/workflows/qa-smoke-preview-deploy.yml",
      "utf8",
    );
    expect(preview.split("\n  preview-database:")[0]).not.toContain(
      "RELEASE_DATABASE_URL",
    );
    for (const file of readdirSync(".github/workflows")) {
      expect(readFileSync(`.github/workflows/${file}`, "utf8")).not.toContain(
        "secrets.SUPABASE_DB_URL",
      );
    }
  });

  it("offers the dispatched marker, first-rebuild and CMS password steps from the production branch only", () => {
    for (const operation of [
      "set-environment-marker",
      "first-rebuild",
      "set-cms-role-passwords",
    ]) {
      expect(workflow).toContain(`- ${operation}`);
    }
    expect(job("marker")).toContain("release-database.mjs set-marker");
    expect(job("marker")).toContain("RELEASE_CONFIRMATION");
    expect(job("database")).toContain("release-database.mjs first-rebuild");
    expect(job("database")).toContain("RELEASE_CENSUS_SIGNOFF");
    expect(job("cms-role-passwords")).toContain(
      "release-database.mjs cms-role-passwords",
    );
    for (const name of ["database", "marker", "cms-role-passwords"]) {
      expect(job(name)).toContain("if: github.ref != 'refs/heads/production'");
    }
  });

  // AL-2674 A10: `npx supabase@<pin>` stops inside the repository on the root
  // package.json's overrides (EOVERRIDE), so the job installs the pinned CLI
  // and the release steps run only that one.
  it("installs the wrapper's pinned Supabase CLI before any step that runs it", () => {
    const database = job("database");
    expect(supabaseCliInstall(database)).toBe(true);
    expect(
      before(database, "supabase/setup-cli@", "release-database.mjs migrate"),
    ).toBe(true);
    expect(
      before(
        database,
        "supabase/setup-cli@",
        "release-database.mjs first-rebuild",
      ),
    ).toBe(true);
  });
});

/**
 * Whether a job reads the pin from scripts/supabase-cli.mjs with the sed line
 * the workflows share, and installs exactly that version with the pinned
 * supabase/setup-cli action. The sed pattern is checked against the wrapper.
 */
function supabaseCliInstall(jobText: string) {
  const sed = String.raw`sed -n 's/^const PINNED_SUPABASE_CLI_VERSION = "\([0-9.]*\)";$/\1/p' scripts/supabase-cli.mjs`;
  const wrapper = readFileSync("scripts/supabase-cli.mjs", "utf8");
  const pinned = /^const PINNED_SUPABASE_CLI_VERSION = "([0-9.]*)";$/m.exec(
    wrapper,
  )?.[1];
  return (
    /^\d+\.\d+\.\d+$/.test(pinned ?? "") &&
    jobText.includes(`version="$(${sed})"`) &&
    jobText.includes('echo "version=$version" >> "$GITHUB_OUTPUT"') &&
    /- uses: supabase\/setup-cli@[0-9a-f]{40} # v\d+\.\d+\.\d+\n\s+with:\n\s+version: \$\{\{ steps\.supabase-pin\.outputs\.version \}\}/.test(
      jobText,
    ) &&
    !/npx[^\n]*supabase@/.test(jobText)
  );
}
