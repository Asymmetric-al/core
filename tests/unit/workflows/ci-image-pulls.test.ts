import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  PINNED_SERVICE_CREDENTIALS,
  parseWorkflowSource,
} from "../helpers/workflow-yaml";

type Entry = { source: string; digest: string; mirror: string };
type Job = {
  permissions?: unknown;
  services?: Record<string, { image?: string; credentials?: unknown }>;
  steps?: { name?: string; run?: string; env?: Record<string, string> }[];
};

const list = JSON.parse(readFileSync(".github/ci-images.json", "utf8")) as {
  images: Entry[];
};
const pullReferences = list.images.map(
  (image) => `${image.mirror}@${image.digest}`,
);
const sourceRepositories = list.images.map((image) =>
  image.source.slice(0, image.source.lastIndexOf(":")),
);

const SCRIPT = "scripts/api-contract/stack.mjs";
const workflowFiles = readdirSync(".github/workflows")
  .filter((file) => /\.ya?ml$/.test(file))
  .map((file) => `.github/workflows/${file}`);
const read = (file: string) => readFileSync(file, "utf8");

const imageLines = workflowFiles.flatMap((file) =>
  read(file)
    .split("\n")
    .flatMap((text, index) => {
      const image = /^\s*image:\s*["']?([^"'\s#]+)/.exec(text)?.[1];
      return image ? [{ at: `${file}:${index + 1}`, image }] : [];
    }),
);
const scriptImages = [
  ...read(SCRIPT).matchAll(/"([^"\s]+@sha256:[0-9a-f]{64})"/g),
].map((match) => ({ at: SCRIPT, image: match[1]! }));

const pulls = workflowFiles.flatMap((file) => {
  const doc = parseWorkflowSource(read(file)) as unknown as {
    permissions?: Record<string, string>;
    jobs?: Record<string, Job>;
  };
  return Object.entries(doc.jobs ?? {}).flatMap(([id, job]) =>
    Object.values(job.services ?? {}).map((service) => ({
      where: `${file.replace(".github/workflows/", "")} ${id}`,
      doc,
      job,
      service,
    })),
  );
});

describe("CI pulls its pinned images only from the organization's mirror (ruling D-16)", () => {
  it("every pinned image line of a workflow, and every pinned image of stack.mjs, is a digest the list mirrors", () => {
    const pinned = [...imageLines, ...scriptImages].filter(({ image }) =>
      /@sha256:/.test(image),
    );
    expect(pinned.length).toBeGreaterThanOrEqual(10);
    const strays = pinned
      .filter(({ image }) => !pullReferences.includes(image))
      .map(({ at, image }) => `${at} ${image}`);
    expect(strays).toEqual([]);
  });

  it("no workflow and not stack.mjs names the public registry of a mirrored image", () => {
    const named = [...workflowFiles, SCRIPT].flatMap((file) =>
      sourceRepositories
        .filter((repository) => read(file).includes(repository))
        .map((repository) => `${file} ${repository}`),
    );
    expect(named).toEqual([]);
    const publicLines = [...imageLines, ...scriptImages]
      .filter(({ image }) => image.includes("public.ecr.aws"))
      .map(({ at, image }) => `${at} ${image}`);
    expect(publicLines).toEqual([]);
  });

  it("the eight service containers that pull an image are the eight known jobs", () => {
    expect(pulls.map(({ where }) => where).sort()).toEqual([
      "api-contract.yml api-contract",
      "ci-integration.yml migrate",
      "ci-integration.yml smoke",
      "ci-integration.yml test-e2e",
      "ci-integration.yml test-e2e-smoke",
      "local-supabase.yml local-supabase",
      "qa-smoke-preview-deploy.yml preview-database",
      "release.yml database",
    ]);
  });

  it("each pulls with the workflow's own token, under packages: read and never write, with no fallback image", () => {
    for (const { where, doc, job, service } of pulls) {
      expect(pullReferences, where).toContain(service.image);
      expect(service.credentials, where).toStrictEqual(
        PINNED_SERVICE_CREDENTIALS,
      );
      expect(doc.permissions?.packages, where).toBe("read");
      expect(job.permissions, where).toBeUndefined();
    }
  });

  it("the API contract job logs in to ghcr.io, token on standard input, before stack.mjs starts PostgREST", () => {
    const job = pulls.find(({ where }) =>
      where.startsWith("api-contract"),
    )!.job;
    const steps = job.steps ?? [];
    const login = steps.findIndex((step) =>
      /docker login ghcr\.io/.test(step.run ?? ""),
    );
    const prepare = steps.findIndex(
      (step) => step.run === "node scripts/api-contract/stack.mjs prepare",
    );
    expect(login).toBeGreaterThanOrEqual(0);
    expect(login).toBeLessThan(prepare);
    expect(steps[login]?.run).toBe(
      `printf '%s' "$REGISTRY_TOKEN" | docker login ghcr.io --username "$REGISTRY_USER" --password-stdin`,
    );
    expect(steps[login]?.env).toStrictEqual({
      REGISTRY_USER: "${{ github.actor }}",
      REGISTRY_TOKEN: "${{ github.token }}",
    });
  });
});
