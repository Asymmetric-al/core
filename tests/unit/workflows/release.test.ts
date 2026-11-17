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
});
