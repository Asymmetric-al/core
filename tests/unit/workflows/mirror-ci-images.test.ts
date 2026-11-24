import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  parseWorkflowSource,
  referencesSecrets,
} from "../helpers/workflow-yaml";

const FILE = ".github/workflows/mirror-ci-images.yml";
const source = readFileSync(FILE, "utf8");
const doc = parseWorkflowSource(source) as unknown as {
  on: Record<string, unknown>;
  permissions: unknown;
  concurrency: unknown;
  jobs: Record<string, Record<string, unknown>>;
};
type Step = Record<string, unknown> & { env?: Record<string, string> };
const jobs = Object.entries(doc.jobs);
const steps = (jobs[0]?.[1].steps ?? []) as Step[];
const list = JSON.parse(readFileSync(".github/ci-images.json", "utf8")) as {
  images: { source: string; digest: string; mirror: string }[];
};

const POSTGRES_DIGEST =
  "sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24";
const POSTGREST_DIGEST =
  "sha256:d155c6718ed9a9f990d159a2ab7c0a3f16944dbb6d0a0344557421042acfe0df";

describe("the list of mirrored CI images (.github/ci-images.json)", () => {
  it("names the pinned Postgres and PostgREST images, each with its mirror in the organization's registry", () => {
    expect(list).toEqual({
      images: [
        {
          source: "public.ecr.aws/docker/library/postgres:17.11-alpine",
          digest: POSTGRES_DIGEST,
          mirror: "ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine",
        },
        {
          source: "public.ecr.aws/supabase/postgrest:v16.4",
          digest: POSTGREST_DIGEST,
          mirror: "ghcr.io/asymmetric-al/core-ci-postgrest:v16.4",
        },
      ],
    });
  });
});

const grantsPackageWrite = (permissions: unknown) => {
  if (typeof permissions === "string") return /write/.test(permissions);
  if (!permissions || typeof permissions !== "object") return false;
  return /write/.test(
    String((permissions as Record<string, unknown>).packages ?? ""),
  );
};

function mayWritePackages(text: string): boolean {
  const parsed = parseWorkflowSource(text) as unknown as {
    permissions?: unknown;
    jobs?: Record<string, { permissions?: unknown }>;
  };
  const jobPermissions = Object.values(parsed.jobs ?? {}).map(
    (job) => job.permissions,
  );
  if (
    parsed.permissions === undefined &&
    jobPermissions.some((permissions) => permissions === undefined)
  )
    return true;
  return [parsed.permissions, ...jobPermissions].some(grantsPackageWrite);
}

const READ_ONLY = [
  "name: Probe",
  "on: push",
  "permissions:",
  "  contents: read",
  "jobs:",
  "  probe:",
  "    runs-on: ubuntu-latest",
  "    steps:",
  "      - run: echo ok",
  "",
].join("\n");

describe("Mirror CI images workflow: the only writer of the organization's packages", () => {
  it("runs on dispatch, with no inputs, and on a schedule only, never on a pull request", () => {
    expect(Object.keys(doc.on).sort()).toEqual([
      "schedule",
      "workflow_dispatch",
    ]);
    expect(doc.on.workflow_dispatch ?? null).toBeNull();
    expect(source).not.toMatch(/pull_request|merge_group|workflow_run/);
  });

  it("counts every way a workflow can grant packages: write", () => {
    expect(mayWritePackages(READ_ONLY)).toBe(false);
    for (const writer of [
      READ_ONLY.replace("  contents: read", "  packages: write"),
      READ_ONLY.replace("  contents: read", '  packages: "write"'),
      READ_ONLY.replace("  contents: read", "  packages: 'write'"),
      READ_ONLY.replace(
        "permissions:\n  contents: read",
        "permissions: write-all",
      ),
      READ_ONLY.replace("permissions:\n  contents: read\n", ""),
      READ_ONLY.replace(
        "    runs-on: ubuntu-latest",
        "    permissions:\n      packages: write\n    runs-on: ubuntu-latest",
      ),
    ])
      expect(mayWritePackages(writer), writer).toBe(true);
  });

  it("holds packages: write at the workflow level, with nothing else to write and no job override", () => {
    expect(doc.permissions).toStrictEqual({
      contents: "read",
      packages: "write",
    });
    for (const [, job] of jobs) expect(job.permissions).toBeUndefined();
  });

  it("is the only workflow that may write packages", () => {
    const writers = readdirSync(".github/workflows")
      .filter((file) => /\.ya?ml$/.test(file))
      .filter((file) =>
        mayWritePackages(readFileSync(`.github/workflows/${file}`, "utf8")),
      );
    expect(writers).toEqual(["mirror-ci-images.yml"]);
  });

  it("refuses, as its first step, any ref but develop", () => {
    expect(jobs).toHaveLength(1);
    const [first] = steps;
    expect(first?.if).toBe("github.ref != 'refs/heads/develop'");
    expect(String(first?.run)).toMatch(/\bexit 1\s*$/);
    expect(jobs[0]?.[1].if).toBeUndefined();
  });

  it("copies with the repository's mirror script from the one list, with the workflow's own token", () => {
    const mirror = steps.filter((step) =>
      String(step.run ?? "").includes("mirror-ci-images.mjs"),
    );
    expect(mirror).toHaveLength(1);
    expect(mirror[0]?.run).toBe(
      "node scripts/github/mirror-ci-images.mjs .github/ci-images.json",
    );
    expect(mirror[0]?.env).toStrictEqual({
      REGISTRY_USER: "${{ github.actor }}",
      REGISTRY_TOKEN: "${{ github.token }}",
    });
    expect(source).not.toMatch(/secrets\.|imagetools|docker push/);
    expect(
      referencesSecrets(
        steps.filter((step) => !mirror.includes(step)).map((step) => step),
      ),
    ).toBe(false);
  });

  it("never runs two copies at once", () => {
    expect(doc.concurrency).toStrictEqual({
      group: "mirror-ci-images",
      "cancel-in-progress": false,
    });
  });
});
